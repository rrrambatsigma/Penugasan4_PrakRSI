from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response

from src.controllers.role_controller import RoleController
from src.database.schema.schema import RoleEnum
from src.dto.role import RoleCreate, RolePatch, RoleUpdate
from src.utils.auth import require_role

role_router = APIRouter(prefix="/roles", tags=["Roles"])


# @role_router.post("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
# def create_role(req_body: RoleCreate, controller: RoleController = Depends(RoleController)) -> Response:
#     return controller.create_role(req_body)


@role_router.get("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def get_roles(controller: RoleController = Depends(RoleController)) -> Response:
    return controller.get_roles()


# @role_router.get("/{role_name}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
# def get_role(role_name: Annotated[RoleEnum, Path(title="Nama role")], controller: RoleController = Depends(RoleController)) -> Response:
#     return controller.get_role(role_name)


# @role_router.put("/{role_name}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
# def update_role(role_name: Annotated[RoleEnum, Path(title="Nama role yang ingin diupdate")], req_body: RoleUpdate, controller: RoleController = Depends(RoleController)) -> Response:
#     return controller.update_role(role_name, req_body)


# @role_router.patch("/{role_name}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
# def patch_role(role_name: Annotated[RoleEnum, Path(title="Nama role yang ingin diupdate")], req_body: RolePatch, controller: RoleController = Depends(RoleController)) -> Response:
#     return controller.patch_role(role_name, req_body)


# @role_router.delete("/{role_name}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
# def delete_role(role_name: Annotated[RoleEnum, Path(title="Nama role yang ingin dihapus")], controller: RoleController = Depends(RoleController)) -> Response:
#     return controller.delete_role(role_name)
