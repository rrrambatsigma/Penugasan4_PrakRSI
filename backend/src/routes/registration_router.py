import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response

from src.controllers.registration_controller import RegistrationController
from src.database.schema.schema import RoleEnum, User
from src.dto.registration import RegistrationCreate
from src.utils.auth import get_current_user, require_role

registration_router = APIRouter(prefix="/registrations", tags=["Registrations"])


@registration_router.post("/", dependencies=[Depends(get_current_user)])
def create_registration(
    req_body: RegistrationCreate,
    current_user: User = Depends(get_current_user),
    controller: RegistrationController = Depends(RegistrationController),
) -> Response:
    return controller.create_registration(req_body, current_user=current_user)


@registration_router.get("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def get_registrations(controller: RegistrationController = Depends(RegistrationController)) -> Response:
    return controller.get_registrations()


@registration_router.get("/search", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def search_registrations(
    user_id: uuid.UUID | None = Query(default=None),
    event_id: uuid.UUID | None = Query(default=None),
    controller: RegistrationController = Depends(RegistrationController),
) -> Response:
    return controller.search_registrations(user_id=user_id, event_id=event_id)


@registration_router.get("/{registration_id}", dependencies=[Depends(get_current_user)])
def get_registration(registration_id: Annotated[uuid.UUID, Path(title="ID registrasi yang ingin diambil")], controller: RegistrationController = Depends(RegistrationController)) -> Response:
    return controller.get_registration(registration_id)


@registration_router.delete("/{registration_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def delete_registration(registration_id: Annotated[uuid.UUID, Path(title="ID registrasi yang ingin dihapus")], controller: RegistrationController = Depends(RegistrationController)) -> Response:
    return controller.delete_registration(registration_id)
