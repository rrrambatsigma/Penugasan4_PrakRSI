import uuid

from fastapi import Depends, Response

from src.dto.event import CreateEventRequest, UpdateEventRequest
from src.services.event_service import EventService


def json_response(result) -> Response:
    return Response(
        status_code=result.code,
        content=result.model_dump_json(),
        media_type="application/json",
    )


class EventController:
    def __init__(self, event_service: EventService = Depends(EventService)):
        self.event_service = event_service

    def create_event(self, event: CreateEventRequest) -> Response:
        return json_response(self.event_service.create_event(event))

    def get_events(self) -> Response:
        return json_response(self.event_service.get_events())

    def get_event_by_id(self, event_id: uuid.UUID) -> Response:
        return json_response(self.event_service.get_event_by_id(event_id))

    def update_event(self, event_id: uuid.UUID, event: UpdateEventRequest) -> Response:
        return json_response(self.event_service.update_event(event_id, event))

    def delete_event(self, event_id: uuid.UUID) -> Response:
        return json_response(self.event_service.delete_event(event_id))
