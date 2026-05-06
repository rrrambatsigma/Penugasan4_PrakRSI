import uuid
from typing import Sequence

from fastapi import Depends
from sqlalchemy import or_
from sqlmodel import Session, select

from src.database.connection import get_session
from src.database.schema.schema import Account


class AccountRepository:
    def __init__(self, session: Session = Depends(get_session)) -> None:
        self.session = session

    def create(self, account: Account) -> Account:
        self.session.add(account)
        self.session.commit()
        self.session.refresh(account)
        return account

    def get_all(self) -> Sequence[Account]:
        return self.session.exec(select(Account)).all()

    def get_by_id(self, account_id: uuid.UUID) -> Account | None:
        return self.session.get(Account, account_id)

    def get_by_email(self, email: str) -> Account | None:
        return self.session.exec(select(Account).where(Account.email == email)).first()

    def get_by_username(self, username: str) -> Account | None:
        return self.session.exec(select(Account).where(Account.username == username)).first()

    def get_by_email_or_username(self, identifier: str) -> Account | None:
        return self.session.exec(
            select(Account).where(
                or_(Account.email == identifier, Account.username == identifier)
            )
        ).first()

    def update(self, account: Account) -> Account:
        self.session.add(account)
        self.session.commit()
        self.session.refresh(account)
        return account

    def delete(self, account: Account) -> None:
        self.session.delete(account)
        self.session.commit()
