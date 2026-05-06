import uuid
from datetime import datetime

from fastapi import Depends, HTTPException
from starlette import status

from src.database.schema.schema import User
from src.dto.user import (
    UserCreate,
    UserCreateResponse,
    UserDeleteResponse,
    UserDetailResponse,
    UserListResponse,
    UserPatch,
    UserRead,
    UserUpdate,
    UserUpdateResponse,
)
from src.repositories.user_repository import UserRepository


def _validate_whatsapp(whatsapp_number: str) -> None:
    normalized = whatsapp_number.replace("+", "", 1)
    if not normalized.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "Nomor Whatsapp hanya boleh berisi angka dan opsional tanda + di depan"},
        )


class UserService:
    def __init__(self, user_repository: UserRepository = Depends(UserRepository)):
        self.user_repository = user_repository

    def create_user(self, data: UserCreate) -> UserCreateResponse:
        _validate_whatsapp(data.whatsapp_number)
        user = self.user_repository.create(
            User(
                first_name=data.first_name.strip(),
                last_name=data.last_name.strip() if data.last_name else None,
                whatsapp_number=data.whatsapp_number.strip(),
            )
        )
        return UserCreateResponse(code=status.HTTP_201_CREATED, message="User berhasil dibuat.", data=UserRead.model_validate(user))

    def get_users(self) -> UserListResponse:
        users = self.user_repository.get_all()
        return UserListResponse(code=status.HTTP_200_OK, message="Data user berhasil diambil.", data=[UserRead.model_validate(user) for user in users])

    def get_user_by_id(self, user_id: uuid.UUID) -> UserDetailResponse:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"})
        return UserDetailResponse(code=status.HTTP_200_OK, message="Data user berhasil diambil.", data=UserRead.model_validate(user))

    def search_users(self, first_name: str | None = None, whatsapp_number: str | None = None) -> UserListResponse:
        users = self.user_repository.search(first_name=first_name, whatsapp_number=whatsapp_number)
        return UserListResponse(code=status.HTTP_200_OK, message="Data user berhasil dicari.", data=[UserRead.model_validate(user) for user in users])

    def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> UserUpdateResponse:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"})
        _validate_whatsapp(data.whatsapp_number)
        user.first_name = data.first_name.strip()
        user.last_name = data.last_name.strip() if data.last_name else None
        user.whatsapp_number = data.whatsapp_number.strip()
        user.updated_at = datetime.now()
        user = self.user_repository.update(user)
        return UserUpdateResponse(code=status.HTTP_200_OK, message="User berhasil diupdate.", data=UserRead.model_validate(user))

    def patch_user(self, user_id: uuid.UUID, data: UserPatch) -> UserUpdateResponse:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"})

        update_data = data.model_dump(exclude_unset=True)
        if "first_name" in update_data:
            user.first_name = update_data["first_name"].strip()
        if "last_name" in update_data:
            user.last_name = update_data["last_name"].strip() if update_data["last_name"] else None
        if "whatsapp_number" in update_data:
            _validate_whatsapp(update_data["whatsapp_number"])
            user.whatsapp = update_data["whatsapp_number"].strip()

        user.updated_at = datetime.now()
        user = self.user_repository.update(user)
        return UserUpdateResponse(code=status.HTTP_200_OK, message="User berhasil diupdate.", data=UserRead.model_validate(user))

    def delete_user(self, user_id: uuid.UUID) -> UserDeleteResponse:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"})
        self.user_repository.delete(user)
        return UserDeleteResponse(code=status.HTTP_200_OK, message="User berhasil dihapus.", data=None)
