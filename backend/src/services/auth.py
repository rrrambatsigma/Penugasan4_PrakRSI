##from backend.src.dto import account
from fastapi import Depends, HTTPException
from datetime import timedelta
from starlette import status

from src.database.schema.schema import Account, RoleEnum, User
from src.dto.auth import (
    LoginData,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
)
from src.repositories.account_repository import AccountRepository
from src.repositories.role_repository import RoleRepository
from src.repositories.user_repository import UserRepository
from src.utils.auth.hash import HashUtils
from src.utils.auth.jwt import JwtAccessTokenPayload, JwtRefreshTokenPayload, JwtUtils


class AuthService:
    def __init__(
        self,
        userRepository: UserRepository = Depends(UserRepository),
        accountRepository: AccountRepository = Depends(AccountRepository),
        roleRepository: RoleRepository = Depends(RoleRepository),
        hashUtils: HashUtils = Depends(HashUtils),
        jwtUtils: JwtUtils = Depends(JwtUtils),
    ):
        self.userRepository = userRepository
        self.accountRepository = accountRepository
        self.roleRepository = roleRepository
        self.hashUtils = hashUtils
        self.jwtUtils = jwtUtils

    def register(self, data: RegisterRequest) -> RegisterResponse:
        return self._register_with_role(data, RoleEnum.USER)

    def register_admin(self, data: RegisterRequest) -> RegisterResponse:
        return self._register_with_role(data, RoleEnum.ADMIN)

    def _register_with_role(
        self, data: RegisterRequest, role_name: RoleEnum
    ) -> RegisterResponse:
        if self.accountRepository.get_by_email(str(data.email)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": status.HTTP_409_CONFLICT,
                    "data": None,
                    "message": "Email sudah terdaftar",
                },
            )

        if self.accountRepository.get_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": status.HTTP_409_CONFLICT,
                    "data": None,
                    "message": "Username sudah terdaftar",
                },
            )

        role = self.roleRepository.get_by_name(role_name)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": status.HTTP_400_BAD_REQUEST,
                    "data": None,
                    "message": "Role tidak valid",
                },
            )

        user = self.userRepository.create(
            User(
                first_name=data.first_name.strip(),
                last_name=data.last_name.strip() if data.last_name else None,
                whatsapp_number=data.whatsapp_number.strip(),
            )
        )

        self.accountRepository.create(
            Account(
                user_id=user.id,
                role_id=role.name,
                username=data.username.strip(),
                email=str(data.email),
                password=self.hashUtils.hash(data.password),
            )
        )

        return RegisterResponse(
            code=status.HTTP_201_CREATED,
            message="User berhasil didaftarkan",
            data=None,
        )

    def login(self, data: LoginRequest) -> LoginResponse:
        account = self.accountRepository.get_by_email_or_username(data.identifier)

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": status.HTTP_404_NOT_FOUND,
                    "data": None,
                    "message": "Akun tidak ditemukan",
                },
            )

        if not self.hashUtils.verify(data.password, account.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": status.HTTP_401_UNAUTHORIZED,
                    "data": None,
                    "message": "Password atau email salah",
                },
            )

        access_token = self.jwtUtils.sign(
            data=JwtAccessTokenPayload(
                account_id=str(account.id),
                role_name=account.role.name,
                ability="access_token",
            ),
            expires_delta=timedelta(minutes=15),
        )

        refresh_token = self.jwtUtils.sign(
            data=JwtRefreshTokenPayload(
                account_id=str(account.id),
                ability="refresh_token",
            ),
            expires_delta=timedelta(days=7),
        )

        return LoginResponse(
            code=status.HTTP_200_OK,
            data=LoginData(
                access_token=access_token, 
                refresh_token=refresh_token,
                role=account.role.name  # Masukkan role ke dalam LoginData
            ),
            message="Login berhasil",
        )

    def logout(self, data: LogoutRequest) -> LogoutResponse:
        account = self.accountRepository.get_by_id(data.account_id)

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": status.HTTP_404_NOT_FOUND,
                    "data": None,
                    "message": "Akun tidak ditemukan",
                },
            )

        return LogoutResponse(
            code=status.HTTP_200_OK,
            message="Logout berhasil",
            data=None,
        )

    def refresh(self, refresh_token: str) -> LoginResponse:
        payload = self.jwtUtils.verify(refresh_token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": status.HTTP_401_UNAUTHORIZED,
                    "data": None,
                    "message": "Refresh token tidak valid atau sudah expired",
                },
            )

        if payload.get("ability") != "refresh_token":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": status.HTTP_401_UNAUTHORIZED,
                    "data": None,
                    "message": "Token bukan refresh token",
                },
            )

        account = self.accountRepository.get_by_id(payload.get("account_id"))

        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": status.HTTP_404_NOT_FOUND,
                    "data": None,
                    "message": "Akun tidak ditemukan",
                },
            )

        access_token = self.jwtUtils.sign(
            data=JwtAccessTokenPayload(
                account_id=str(account.id),
                role_name=account.role.name,
                ability="access_token",
            ),
            expires_delta=timedelta(minutes=15),
        )

        new_refresh_token = self.jwtUtils.sign(
            data=JwtRefreshTokenPayload(
                account_id=str(account.id),
                ability="refresh_token",
            ),
            expires_delta=timedelta(days=7),
        )

        return LoginResponse(
            code=status.HTTP_200_OK,
            data=LoginData(
                access_token=access_token,
                refresh_token=new_refresh_token,
            ),
            message="Token berhasil diperbarui",
        )