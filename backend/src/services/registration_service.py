import uuid

from fastapi import Depends, HTTPException
from starlette import status

from src.database.schema.schema import Event, Registration, RoleEnum, User
from src.dto.registration import (
    RegistrationCreate,
    RegistrationCreateResponse,
    RegistrationDeleteResponse,
    RegistrationDetailResponse,
    RegistrationListResponse,
    RegistrationRead,
    RegistrationResponse
)
from src.repositories.registration_repository import RegistrationRepository


class RegistrationService:
    def __init__(self, registration_repository: RegistrationRepository = Depends(RegistrationRepository)):
        self.registration_repository = registration_repository

    def create_registration(self, data: RegistrationCreate, current_user: User | None = None) -> RegistrationCreateResponse:
        session = self.registration_repository.session
        target_user_id = data.user_id or (current_user.id if current_user else None)

        if target_user_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "user_id wajib diisi"})

        if current_user and current_user.account and current_user.account.role_id != RoleEnum.ADMIN:
            if target_user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"code": status.HTTP_403_FORBIDDEN, "data": None, "message": "User hanya boleh mendaftarkan dirinya sendiri"})

        user = session.get(User, target_user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "User tidak ditemukan"})

        event = session.get(Event, data.event_id)
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Event tidak ditemukan"})

        existing = self.registration_repository.get_by_user_and_event(target_user_id, data.event_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": status.HTTP_409_CONFLICT, "data": None, "message": "User sudah terdaftar pada event ini"})

        active_total = self.registration_repository.count_active_by_event(data.event_id)
        if event.quota is not None and active_total >= event.quota:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "Kuota event sudah penuh"})
        
        registration = Registration(
            user_id=target_user_id,
            event_id=data.event_id,
        )

        registration = self.registration_repository.create(registration)

        return RegistrationCreateResponse(
            code=status.HTTP_201_CREATED,
            message="Registrasi berhasil dibuat",
            data=RegistrationRead.model_validate(registration)
        )

    def get_registrations(self) -> RegistrationListResponse:
        registrations = self.registration_repository.get_all()
        return RegistrationListResponse(code=status.HTTP_200_OK, message="Data registrasi berhasil diambil.", data=[RegistrationRead.model_validate(r) for r in registrations])

    def get_registration_by_id(self, registration_id: uuid.UUID) -> RegistrationDetailResponse:
        registration = self.registration_repository.get_by_id(registration_id)
        if not registration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Registrasi tidak ditemukan"})
        return RegistrationDetailResponse(code=status.HTTP_200_OK, message="Data registrasi berhasil diambil.", data=RegistrationRead.model_validate(registration))

    def search_registrations(self, user_id: uuid.UUID | None = None, event_id: uuid.UUID | None = None) -> RegistrationListResponse:
        registrations = self.registration_repository.search(user_id=user_id, event_id=event_id)
        return RegistrationListResponse(code=status.HTTP_200_OK, message="Data registrasi berhasil dicari.", data=[RegistrationRead.model_validate(r) for r in registrations])

    def delete_registration(self, registration_id: uuid.UUID) -> RegistrationDeleteResponse:
        registration = self.registration_repository.get_by_id(registration_id)
        if not registration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Registrasi tidak ditemukan"})
        self.registration_repository.delete(registration)
        return RegistrationDeleteResponse(code=status.HTTP_200_OK, message="Registrasi berhasil dihapus.", data=None)
