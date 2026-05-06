from fastapi import Depends, Response

from src.dto.auth import LoginRequest, LogoutRequest, RegisterRequest, RefreshRequest
from src.services.auth import AuthService


def json_response(result) -> Response:
    return Response(
        status_code=result.code,
        content=result.model_dump_json(),
        media_type="application/json",
    )


class AuthController:
    def __init__(self, auth_service: AuthService = Depends(AuthService)):
        self.auth_service = auth_service

    def register(self, req_body: RegisterRequest) -> Response:
        return json_response(self.auth_service.register(req_body))

    def register_admin(self, req_body: RegisterRequest) -> Response:
        return json_response(self.auth_service.register_admin(req_body))

    def login(self, req_body: LoginRequest) -> Response:
        login = self.auth_service.login(req_body)

        response = json_response(login)
        response.set_cookie(
            key="access_token",
            value=login.data.access_token,
            httponly=True,
            samesite="lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=login.data.refresh_token,
            httponly=True,
            samesite="lax",
        )

        return response

    def logout(self, data: LogoutRequest) -> Response:
        response = json_response(self.auth_service.logout(data))
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")
        return response

    def refresh(self, req_body: RefreshRequest) -> Response:
        refresh = self.auth_service.refresh(req_body.refresh_token)

        response = Response(
            status_code=refresh.code,
            content=refresh.model_dump_json(),
            headers={"Content-Type": "application/json"},
        )

        response.set_cookie(key="access_token", value=refresh.data.access_token)
        response.set_cookie(key="refresh_token", value=refresh.data.refresh_token)

        return response