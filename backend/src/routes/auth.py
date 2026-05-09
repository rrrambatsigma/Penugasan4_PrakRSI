from fastapi import APIRouter, Depends, Request, Response, Security, status, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.controllers.auth import AuthController
from src.dto.auth import LoginRequest, LogoutRequest, RegisterRequest, RefreshRequest, LoginResponse, LogoutResponse, RegisterResponse, RefreshResponse, RegisterResponse, LogoutResponse

auth_router = APIRouter(tags=["Authentikasi"])


@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    req_body: RegisterRequest,
    controller: AuthController = Depends(AuthController),
) -> Response:
    response = controller.register(req_body)
    return response


@auth_router.post("/register/admin", status_code=status.HTTP_201_CREATED)
def register_admin(
    req_body: RegisterRequest,
    controller: AuthController = Depends(AuthController),
) -> Response:
    response = controller.register_admin(req_body)
    return response


@auth_router.post("/login", status_code=status.HTTP_200_OK, response_model=LoginResponse)
def login(
    req_body: LoginRequest,
    controller: AuthController = Depends(AuthController),
) -> LoginResponse: 
    response = controller.login(req_body)
    return response


@auth_router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    request: Request,
    controller: AuthController = Depends(AuthController),
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),
) -> Response:
    data = LogoutRequest(account_id=request.state.account_id)
    response = controller.logout(data)
    return response


@auth_router.post("/refresh", status_code=status.HTTP_200_OK, response_model=LoginResponse)
def refresh(
    req_body: RefreshRequest,
    request: Request,
    controller: AuthController = Depends(AuthController),
) -> LoginResponse: # Berubah dari Response ke LoginResponse
    if req_body.refresh_token is None:
        req_body.refresh_token = request.cookies.get("refresh_token")

    if req_body.refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak ditemukan",
        )

    return controller.refresh(req_body)