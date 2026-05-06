import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Response

from src.controllers.account_controller import AccountController
from src.database.schema.schema import RoleEnum
from src.dto.account import AccountCreate, AccountPatch
from src.utils.auth import get_current_user, require_role

account_router = APIRouter(prefix="/accounts", tags=["Accounts"])


@account_router.get("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def get_accounts(controller: AccountController = Depends(AccountController)) -> Response:
    return controller.get_accounts()


@account_router.get("/{account_id}", dependencies=[Depends(get_current_user)])
def get_account(account_id: Annotated[uuid.UUID, Path(title="ID akun yang ingin diambil")], controller: AccountController = Depends(AccountController)) -> Response:
    return controller.get_account(account_id)


@account_router.post("/", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def create_account(req_body: AccountCreate, controller: AccountController = Depends(AccountController)) -> Response:
    return controller.create_account(req_body)


@account_router.patch("/{account_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def patch_account(account_id: Annotated[uuid.UUID, Path(title="ID akun yang ingin diupdate")], req_body: AccountPatch, controller: AccountController = Depends(AccountController)) -> Response:
    return controller.patch_account(account_id, req_body)


@account_router.delete("/{account_id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
def delete_account(account_id: Annotated[uuid.UUID, Path(title="ID akun yang ingin dihapus")], controller: AccountController = Depends(AccountController)) -> Response:
    return controller.delete_account(account_id)
