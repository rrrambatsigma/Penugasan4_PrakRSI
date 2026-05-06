import uuid

from fastapi import Depends, Response

from src.dto.account import AccountCreate, AccountPatch
from src.services.account_service import AccountService


def json_response(result) -> Response:
    return Response(
        status_code=result.code,
        content=result.model_dump_json(),
        media_type="application/json",
    )


class AccountController:
    def __init__(self, account_service: AccountService = Depends(AccountService)):
        self.account_service = account_service

    def get_accounts(self) -> Response:
        return json_response(self.account_service.get_accounts())

    def get_account(self, account_id: uuid.UUID) -> Response:
        return json_response(self.account_service.get_account_by_id(account_id))

    def create_account(self, data: AccountCreate) -> Response:
        return json_response(self.account_service.create_account(data))

    def delete_account(self, account_id: uuid.UUID) -> Response:
        return json_response(self.account_service.delete_account(account_id))

    def patch_account(self, account_id: uuid.UUID, data: AccountPatch) -> Response:
        return json_response(self.account_service.patch_account(account_id, data))
