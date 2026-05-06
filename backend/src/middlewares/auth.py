import uuid
from dataclasses import dataclass, field
from typing import Optional

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware

from src.database.schema.schema import RoleEnum
from src.utils.auth.jwt import JwtUtils


@dataclass
class ProtectedRoute:
    path: str
    methods: list[str] = field(default_factory=lambda: ["GET", "POST", "PUT", "PATCH", "DELETE"])

    def matches(self, path: str, method: str) -> bool:
        return path.startswith(self.path) and method.upper() in self.methods


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, protected_routes: Optional[list[ProtectedRoute]] = None, admin_routes: Optional[list[ProtectedRoute]] = None) -> None:
        super().__init__(app)
        self.jwt_utils = JwtUtils()
        self.protected_routes = protected_routes or []
        self.admin_routes = admin_routes or []

    def _is_protected(self, path: str, method: str) -> bool:
        return any(route.matches(path, method) for route in self.protected_routes)

    def _is_admin_route(self, path: str, method: str) -> bool:
        return any(route.matches(path, method) for route in self.admin_routes)

    def _extract_token(self, request: Request) -> str | None:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            return authorization.split(" ", 1)[1]
        return request.cookies.get("access_token")

    def _authenticate(self, request: Request) -> None:
        token = self._extract_token(request)
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": status.HTTP_401_UNAUTHORIZED, "data": None, "message": "Token akses tidak ditemukan"})
        payload = self.jwt_utils.verify(token)
        if not payload or payload.get("ability") != "access_token":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": status.HTTP_401_UNAUTHORIZED, "data": None, "message": "Token akses tidak valid"})
        try:
            request.state.account_id = uuid.UUID(payload["account_id"])
        except (KeyError, ValueError):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": status.HTTP_401_UNAUTHORIZED, "data": None, "message": "Payload token tidak valid"})
        request.state.role_name = payload.get("role_name")

    async def dispatch(self, request: Request, call_next):
        try:
            need_auth = self._is_protected(request.url.path, request.method)
            need_admin = self._is_admin_route(request.url.path, request.method)
            if need_auth or need_admin:
                self._authenticate(request)
            if need_admin and request.state.role_name != RoleEnum.ADMIN.value:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"code": status.HTTP_403_FORBIDDEN, "data": None, "message": "Akses ditolak"})
        except HTTPException as exc:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)
        return await call_next(request)
