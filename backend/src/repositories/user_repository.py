import uuid
from typing import Sequence

from fastapi import Depends
from sqlmodel import Session, select

from src.database.connection import get_session
from src.database.schema.schema import User


class UserRepository:
    def __init__(self, session: Session = Depends(get_session)) -> None:
        self.session = session

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_all(self) -> Sequence[User]:
        return self.session.exec(select(User)).all()

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return self.session.get(User, user_id)

    def search(self, first_name: str | None = None, whatsapp_number: str | None = None) -> Sequence[User]:
        query = select(User)
        if first_name:
            query = query.where(User.first_name.contains(first_name))
        if whatsapp_number:
            query = query.where(User.whatsapp_number.contains(whatsapp_number))
        return self.session.exec(query).all()

    def update(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.session.delete(user)
        self.session.commit()
