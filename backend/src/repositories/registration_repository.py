import uuid
from typing import Sequence

from fastapi import Depends
from sqlmodel import Session, select

from src.database.connection import get_session
from src.database.schema.schema import Registration


class RegistrationRepository:
    def __init__(self, session: Session = Depends(get_session)) -> None:
        self.session = session

    def create(self, registration: Registration) -> Registration:
        self.session.add(registration)
        self.session.commit()
        self.session.refresh(registration)
        return registration

    def get_all(self) -> Sequence[Registration]:
        return self.session.exec(select(Registration)).all()

    def get_by_id(self, registration_id: uuid.UUID) -> Registration | None:
        return self.session.get(Registration, registration_id)

    def get_by_user_and_event(self, user_id: uuid.UUID, event_id: uuid.UUID) -> Registration | None:
        return self.session.exec(
            select(Registration)
            .where(Registration.user_id == user_id)
            .where(Registration.event_id == event_id)
        ).first()

    def search(self, user_id: uuid.UUID | None = None, event_id: uuid.UUID | None = None) -> Sequence[Registration]:
        query = select(Registration)
        if user_id:
            query = query.where(Registration.user_id == user_id)
        if event_id:
            query = query.where(Registration.event_id == event_id)
        return self.session.exec(query).all()

    def count_active_by_event(self, event_id: uuid.UUID) -> int:
        registrations = self.session.exec(
            select(Registration)
            .where(Registration.event_id == event_id)
        ).all()
        return len(registrations)

    def update(self, registration: Registration) -> Registration:
        self.session.add(registration)
        self.session.commit()
        self.session.refresh(registration)
        return registration

    def delete(self, registration: Registration) -> None:
        self.session.delete(registration)
        self.session.commit()
