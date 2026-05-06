import uuid
from datetime import datetime

from fastapi import Depends, HTTPException
from starlette import status

from src.database.schema.schema import Event
from src.dto.event import (
    CreateEventRequest,
    CreateEventResponse,
    DeleteEventResponse,
    EventRead,
    GetEventByIdResponse,
    GetEventsResponse,
    UpdateEventRequest,
    UpdateEventResponse,
)
from src.repositories.event_repository import EventRepository


class EventService:
    def __init__(self, event_repository: EventRepository = Depends(EventRepository)):
        self.event_repository = event_repository

    def create_event(self, data: CreateEventRequest) -> CreateEventResponse:
        event = self.event_repository.create(
            Event(
                name=data.name,
                description=data.description,
                quota=data.quota,
                started_at=data.start_date,
                ended_at=data.end_date,
            )
        )
        return CreateEventResponse(
            code=status.HTTP_201_CREATED,
            data=EventRead.model_validate(event),
            message="Event berhasil ditambahkan",
        )

    def get_events(self) -> GetEventsResponse:
        events = self.event_repository.get_all()
        return GetEventsResponse(
            code=status.HTTP_200_OK,
            message="Data event berhasil diambil.",
            data=[EventRead.model_validate(event) for event in events],
        )

    def get_event_by_id(self, event_id: uuid.UUID) -> GetEventByIdResponse:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Event tidak ditemukan"},
            )
        return GetEventByIdResponse(
            code=status.HTTP_200_OK,
            data=EventRead.model_validate(event),
            message="Data event berhasil diambil.",
        )

    def update_event(self, event_id: uuid.UUID, data: UpdateEventRequest) -> UpdateEventResponse:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Event tidak ditemukan"},
            )

        update_data = data.model_dump(exclude_unset=True)
        if "start_date" in update_data:
            event.started_at = update_data.pop("start_date")
        if "end_date" in update_data:
            event.ended_at = update_data.pop("end_date")

        for key, value in update_data.items():
            setattr(event, key, value)

        if event.ended_at <= event.started_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": status.HTTP_400_BAD_REQUEST, "data": None, "message": "end_date harus lebih besar dari start_date"},
            )

        event.updated_at = datetime.now()
        self.event_repository.update(event_id, event)

        return UpdateEventResponse(
            code=status.HTTP_200_OK,
            message="Data event berhasil diupdate.",
            data=EventRead.model_validate(event),
        )

    def delete_event(self, event_id: uuid.UUID) -> DeleteEventResponse:
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": status.HTTP_404_NOT_FOUND, "data": None, "message": "Event tidak ditemukan"},
            )

        self.event_repository.delete(event_id)
        return DeleteEventResponse(
            code=status.HTTP_200_OK,
            message="Data event berhasil dihapus.",
            data=None,
        )
