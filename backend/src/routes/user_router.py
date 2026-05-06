import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Response

from src.controllers.user_controller import UserController
from src.database.schema.schema import RoleEnum
from src.dto.user import UserCreate, UserPatch, UserUpdate
from src.utils.auth import get_current_user, require_role

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.post("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def create_user(req_body: UserCreate, controller: UserController = Depends(UserController)) -> Response:
    return controller.create_user(req_body)


@user_router.get("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def get_users(controller: UserController = Depends(UserController)) -> Response:
    return controller.get_users()


@user_router.get("/search", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def search_users(
    first_name: str | None = Query(default=None),
    whatsapp_number: str | None = Query(default=None),
    controller: UserController = Depends(UserController),
) -> Response:
    return controller.search_users(first_name=first_name, whatsapp_number=whatsapp_number)


@user_router.get("/{user_id}", dependencies=[Depends(get_current_user)])
def get_user(user_id: Annotated[uuid.UUID, Path(title="ID user yang ingin diambil")], controller: UserController = Depends(UserController)) -> Response:
    return controller.get_user(user_id)


@user_router.put("/{user_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def update_user(user_id: Annotated[uuid.UUID, Path(title="ID user yang ingin diupdate")], req_body: UserUpdate, controller: UserController = Depends(UserController)) -> Response:
    return controller.update_user(user_id, req_body)


@user_router.patch("/{user_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def patch_user(user_id: Annotated[uuid.UUID, Path(title="ID user yang ingin diupdate")], req_body: UserPatch, controller: UserController = Depends(UserController)) -> Response:
    return controller.patch_user(user_id, req_body)


@user_router.delete("/{user_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def delete_user(user_id: Annotated[uuid.UUID, Path(title="ID user yang ingin dihapus")], controller: UserController = Depends(UserController)) -> Response:
    return controller.delete_user(user_id)
