import uuid
from typing import Sequence

from fastapi import Depends
from sqlmodel import Session, select

from src.database.connection import get_session
from src.database.schema.schema import Event
from src.dto.event import UpdateEventRequest


class EventRepository:
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session

    def create(self, event: Event) -> Event:
        self.session.add(event)
        self.session.commit()
        self.session.refresh(event)
        return event

    def get_all(self) -> Sequence[Event]:
        return self.session.exec(select(Event)).all()

    def get(self) -> Sequence[Event]:
        return self.get_all()

    def get_by_id(self, event_id: uuid.UUID) -> Event:
        event = self.session.get(Event, event_id)
        if not event:
            raise ValueError(f"Event dengan id {event_id} tidak ditemukan")
        return event

    def update(self, event_id: uuid.UUID, data: UpdateEventRequest) -> None:
        event = self.session.get(Event, event_id)
        if not event:
            raise ValueError(f"Event dengan id {event_id} tidak ditemukan")
        event_data = data.model_dump(exclude_unset=True)
        event.sqlmodel_update(event_data)
        self.session.add(event)
        self.session.commit()

    def delete(self, event_id: uuid.UUID) -> None:
        event = self.session.get(Event, event_id)
        if not event:
            raise ValueError(f"Event dengan id {event_id} tidak ditemukan")
        self.session.delete(event)
        self.session.commit()