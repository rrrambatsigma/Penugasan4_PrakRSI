import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from src.database.schema.schema import RoleEnum
from src.dto.base import BaseResponse


class AccountCreate(BaseModel):
    user_id: uuid.UUID
    role_id: RoleEnum = RoleEnum.USER
    email: EmailStr
    username: str = Field(min_length=3, max_length=16)
    password: str = Field(min_length=6)


class AccountPatch(BaseModel):
    role_id: RoleEnum | None = None
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=16)
    password: str | None = Field(default=None, min_length=6)


class AccountRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role_id: RoleEnum
    email: EmailStr
    username: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AccountCreateResponse(BaseResponse):
    data: AccountRead


class AccountListResponse(BaseResponse):
    data: list[AccountRead]


class AccountDetailResponse(BaseResponse):
    data: AccountRead


class AccountUpdateResponse(BaseResponse):
    data: AccountRead


class AccountDeleteResponse(BaseResponse):
    pass
