import uuid

from fastapi import Depends, Response

from src.database.schema.schema import User
from src.dto.registration import RegistrationCreate
from src.services.registration_service import RegistrationService


def json_response(result) -> Response:
    return Response(status_code=result.code, content=result.model_dump_json(), media_type="application/json")


class RegistrationController:
    def __init__(self, registration_service: RegistrationService = Depends(RegistrationService)):
        self.registration_service = registration_service

    def create_registration(self, data: RegistrationCreate, current_user: User | None = None) -> Response:
        return json_response(self.registration_service.create_registration(data, current_user=current_user))

    def get_registrations(self) -> Response:
        return json_response(self.registration_service.get_registrations())

    def get_registration(self, registration_id: uuid.UUID) -> Response:
        return json_response(self.registration_service.get_registration_by_id(registration_id))

    def search_registrations(self, user_id: uuid.UUID | None = None, event_id: uuid.UUID | None = None) -> Response:
        return json_response(self.registration_service.search_registrations(user_id=user_id, event_id=event_id))

    def delete_registration(self, registration_id: uuid.UUID) -> Response:
        return json_response(self.registration_service.delete_registration(registration_id))
