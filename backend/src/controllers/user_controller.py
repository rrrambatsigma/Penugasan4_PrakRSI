import uuid

from fastapi import Depends, Response

from src.dto.user import UserCreate, UserPatch, UserUpdate
from src.services.user_service import UserService


def json_response(result) -> Response:
    return Response(status_code=result.code, content=result.model_dump_json(), media_type="application/json")


class UserController:
    def __init__(self, user_service: UserService = Depends(UserService)):
        self.user_service = user_service

    def create_user(self, data: UserCreate) -> Response:
        return json_response(self.user_service.create_user(data))

    def get_users(self) -> Response:
        return json_response(self.user_service.get_users())

    def get_user(self, user_id: uuid.UUID) -> Response:
        return json_response(self.user_service.get_user_by_id(user_id))

    def search_users(self, first_name: str | None = None, whatsapp_number: str | None = None) -> Response:
        return json_response(self.user_service.search_users(first_name=first_name, whatsapp_number=whatsapp_number))

    def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> Response:
        return json_response(self.user_service.update_user(user_id, data))

    def patch_user(self, user_id: uuid.UUID, data: UserPatch) -> Response:
        return json_response(self.user_service.patch_user(user_id, data))

    def delete_user(self, user_id: uuid.UUID) -> Response:
        return json_response(self.user_service.delete_user(user_id))
