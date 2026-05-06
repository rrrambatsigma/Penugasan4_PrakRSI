import uuid
from datetime import datetime

from fastapi import Depends, HTTPException
from starlette import status

from src.database.schema.schema import Account, Role, User
from src.dto.account import (
    AccountCreate,
    AccountCreateResponse,
    AccountDeleteResponse,
    AccountDetailResponse,
    AccountListResponse,
    AccountPatch,
    AccountRead,
    AccountUpdateResponse,
)
from src.repositories.account_repository import AccountRepository
from src.utils.auth.hash import HashUtils


class AccountService:
    def __init__(
        self,
        account_repository: AccountRepository = Depends(AccountRepository),
        hash_utils: HashUtils = Depends(HashUtils),
    ):
        self.account_repository = account_repository
        self.hash_utils = hash_utils

    def get_accounts(self) -> AccountListResponse:
        accounts = self.account_repository.get_all()
        return AccountListResponse(
            code=status.HTTP_200_OK,
            message="Data akun berhasil diambil.",
            data=[AccountRead.model_validate(account) for account in accounts],
        )

    def get_account_by_id(self, account_id: uuid.UUID) -> AccountDetailResponse:
        account = self.account_repository.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Akun tidak ditemukan"},
            )
        return AccountDetailResponse(
            code=status.HTTP_200_OK,
            message="Data akun berhasil diambil.",
            data=AccountRead.model_validate(account),
        )

    def create_account(self, data: AccountCreate) -> AccountCreateResponse:
        session = self.account_repository.session

        if not session.get(User, data.user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"},
            )

        if not session.get(Role, data.role_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"},
            )

        if self.account_repository.get_by_email(str(data.email)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Email sudah digunakan"},
            )

        if self.account_repository.get_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Username sudah digunakan"},
            )

        account = self.account_repository.create(
            Account(
                user_id=data.user_id,
                role_id=data.role_id,
                email=str(data.email),
                username=data.username,
                password=self.hash_utils.hash(data.password),
            )
        )

        return AccountCreateResponse(
            code=status.HTTP_201_CREATED,
            message="Akun berhasil dibuat.",
            data=AccountRead.model_validate(account),
        )

    def patch_account(self, account_id: uuid.UUID, data: AccountPatch) -> AccountUpdateResponse:
        account = self.account_repository.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Akun tidak ditemukan"},
            )

        update_data = data.model_dump(exclude_unset=True)

        if "email" in update_data:
            email = str(update_data["email"])
            existing = self.account_repository.get_by_email(email)
            if existing and existing.id != account.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Email sudah digunakan"},
                )
            account.email = email

        if "username" in update_data:
            existing = self.account_repository.get_by_username(update_data["username"])
            if existing and existing.id != account.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Username sudah digunakan"},
                )
            account.username = update_data["username"]

        if "password" in update_data:
            account.password = self.hash_utils.hash(update_data["password"])

        if "role_id" in update_data:
            if not self.account_repository.session.get(Role, update_data["role_id"]):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"},
                )
            account.role_id = update_data["role_id"]

        account.updated_at = datetime.utcnow()
        account = self.account_repository.update(account)

        return AccountUpdateResponse(
            code=status.HTTP_200_OK,
            message="Akun berhasil diupdate.",
            data=AccountRead.model_validate(account),
        )

    def delete_account(self, account_id: uuid.UUID) -> AccountDeleteResponse:
        account = self.account_repository.get_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Akun tidak ditemukan"},
            )

        self.account_repository.delete(account)
        return AccountDeleteResponse(
            code=status.HTTP_200_OK,
            message="Akun berhasil dihapus.",
            data=None,
        )
