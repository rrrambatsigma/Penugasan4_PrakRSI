import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    name: RoleEnum = Field(default=RoleEnum.USER, primary_key=True)

    accounts: list["Account"] = Relationship(back_populates="role")


class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    first_name: str = Field(max_length=255)
    last_name: str = Field(max_length=255)
    whatsapp_number: str = Field(max_length=30)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    account: Optional["Account"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False},
    )
    registrations: list["Registration"] = Relationship(back_populates="user")


class Account(SQLModel, table=True):
    __tablename__ = "accounts"
    __table_args__ = {"extend_existing": True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    role_id: RoleEnum = Field(default=RoleEnum.USER, foreign_key="roles.name", nullable=False)

    email: str = Field(
        sa_column=Column(String(255), nullable=False, unique=True, index=True)
    )
    username: str = Field(
        sa_column=Column(String(16), nullable=False, unique=True, index=True)
    )
    password: str = Field(sa_column=Column(String(255), nullable=False))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="account")
    role: Optional[Role] = Relationship(back_populates="accounts")
    logs: list["Log"] = Relationship(back_populates="account")


class Event(SQLModel, table=True):
    __tablename__ = "events"
    __table_args__ = {"extend_existing": True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(max_length=255)
    description: str | None = Field(default=None)
    quota: int = Field(default=0)

    started_at: datetime
    ended_at: datetime

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    registrations: list["Registration"] = Relationship(back_populates="event")


class Registration(SQLModel, table=True):
    __tablename__ = "registrations"
    __table_args__ = {"extend_existing": True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    event_id: uuid.UUID = Field(foreign_key="events.id", nullable=False, index=True)

    user: Optional[User] = Relationship(back_populates="registrations")
    event: Optional[Event] = Relationship(back_populates="registrations")


class Log(SQLModel, table=True):
    __tablename__ = "logs"
    __table_args__ = {"extend_existing": True}

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    account_id: uuid.UUID = Field(foreign_key="accounts.id", nullable=False, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    action: str | None = Field(default=None, max_length=255)
    ip_address: str | None = Field(default=None, max_length=64)
    user_agent: str | None = Field(default=None)
    entity: str | None = Field(default=None, max_length=255)
    entity_id: str | None = Field(default=None, max_length=64)

    account: Optional[Account] = Relationship(back_populates="logs")
