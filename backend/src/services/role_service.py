from fastapi import Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from starlette import status

from src.database.schema.schema import Role, RoleEnum
from src.dto.role import (
    RoleCreate,
    RoleCreateResponse,
    RoleDeleteResponse,
    RoleDetailResponse,
    RoleListResponse,
    RolePatch,
    RoleRead,
    RoleUpdate,
    RoleUpdateResponse,
)
from src.repositories.role_repository import RoleRepository


class RoleService:
    def __init__(self, role_repository: RoleRepository = Depends(RoleRepository)):
        self.role_repository = role_repository

    def create_role(self, data: RoleCreate) -> RoleCreateResponse:
        if self.role_repository.get_by_name(data.name):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Role sudah ada"})
        role = self.role_repository.create(Role(name=data.name))
        return RoleCreateResponse(code=status.HTTP_201_CREATED, message="Role berhasil dibuat.", data=RoleRead.model_validate(role))

    def get_roles(self) -> RoleListResponse:
        roles = self.role_repository.get_all()
        return RoleListResponse(code=status.HTTP_200_OK, message="Data role berhasil diambil.", data=[RoleRead.model_validate(role) for role in roles])

    def get_role_by_name(self, role_name: RoleEnum) -> RoleDetailResponse:
        role = self.role_repository.get_by_name(role_name)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"})
        return RoleDetailResponse(code=status.HTTP_200_OK, message="Data role berhasil diambil.", data=RoleRead.model_validate(role))

    def update_role(self, role_name: RoleEnum, data: RoleUpdate) -> RoleUpdateResponse:
        role = self.role_repository.get_by_name(role_name)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"})
        if data.name != role.name and self.role_repository.get_by_name(data.name):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "Nama role sudah digunakan"})

        role.name = data.name
        try:
            role = self.role_repository.update(role)
        except IntegrityError:
            self.role_repository.session.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "Role tidak dapat diubah karena masih dipakai oleh akun"})

        return RoleUpdateResponse(code=status.HTTP_200_OK, message="Role berhasil diupdate.", data=RoleRead.model_validate(role))

    def patch_role(self, role_name: RoleEnum, data: RolePatch) -> RoleUpdateResponse:
        update_data = data.model_dump(exclude_unset=True)
        role = self.role_repository.get_by_name(role_name)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"})
        if "name" not in update_data:
            return RoleUpdateResponse(code=status.HTTP_200_OK, message="Role tidak berubah.", data=RoleRead.model_validate(role))
        return self.update_role(role_name, RoleUpdate(name=update_data["name"]))

    def delete_role(self, role_name: RoleEnum) -> RoleDeleteResponse:
        role = self.role_repository.get_by_name(role_name)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Role tidak ditemukan"})
        try:
            self.role_repository.delete(role)
        except IntegrityError:
            self.role_repository.session.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "Role tidak dapat dihapus karena masih dipakai oleh akun"})
        return RoleDeleteResponse(code=status.HTTP_200_OK, message="Role berhasil dihapus.", data=None)
