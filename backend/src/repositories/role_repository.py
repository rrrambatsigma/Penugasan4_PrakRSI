from typing import Sequence

from fastapi import Depends
from sqlmodel import Session, select

from src.database.connection import get_session
from src.database.schema.schema import Role, RoleEnum


def normalize_role_name(name: RoleEnum | str) -> RoleEnum:
    if isinstance(name, RoleEnum):
        return name
    return RoleEnum(name.upper())


class RoleRepository:
    def __init__(self, session: Session = Depends(get_session)) -> None:
        self.session = session

    def create(self, role: Role) -> Role:
        self.session.add(role)
        self.session.commit()
        self.session.refresh(role)
        return role

    def get_all(self) -> Sequence[Role]:
        return self.session.exec(select(Role)).all()

    def get_by_name(self, name: RoleEnum | str) -> Role | None:
        role_name = normalize_role_name(name)
        return self.session.exec(select(Role).where(Role.name == role_name)).first()

    def update(self, role: Role) -> Role:
        self.session.add(role)
        self.session.commit()
        self.session.refresh(role)
        return role

    def delete(self, role: Role) -> None:
        self.session.delete(role)
        self.session.commit()
