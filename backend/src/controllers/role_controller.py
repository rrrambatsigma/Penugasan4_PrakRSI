from fastapi import Depends, Response

from src.database.schema.schema import RoleEnum
from src.dto.role import RoleCreate, RolePatch, RoleUpdate
from src.services.role_service import RoleService


def json_response(result) -> Response:
    return Response(status_code=result.code, content=result.model_dump_json(), media_type="application/json")


class RoleController:
    def __init__(self, role_service: RoleService = Depends(RoleService)):
        self.role_service = role_service

    def create_role(self, data: RoleCreate) -> Response:
        return json_response(self.role_service.create_role(data))

    def get_roles(self) -> Response:
        return json_response(self.role_service.get_roles())

    def get_role(self, role_name: RoleEnum) -> Response:
        return json_response(self.role_service.get_role_by_name(role_name))

    def update_role(self, role_name: RoleEnum, data: RoleUpdate) -> Response:
        return json_response(self.role_service.update_role(role_name, data))

    def patch_role(self, role_name: RoleEnum, data: RolePatch) -> Response:
        return json_response(self.role_service.patch_role(role_name, data))

    def delete_role(self, role_name: RoleEnum) -> Response:
        return json_response(self.role_service.delete_role(role_name))
