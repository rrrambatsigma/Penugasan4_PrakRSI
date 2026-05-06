import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from src.dto.base import BaseResponse


class UserCreate(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str | None = None
    whatsapp_number: str = Field(min_length=3, max_length=30)


class UserUpdate(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str | None = None
    whatsapp_number: str = Field(min_length=3, max_length=30)


class UserPatch(BaseModel):
    first_name: str | None = Field(default=None, min_length=1)
    last_name: str | None = None
    whatsapp_number: str | None = Field(default=None, min_length=3, max_length=30)


class UserRead(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str | None = None
    whatsapp_number: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserResponse(UserRead):
    pass


class UserListResponse(BaseResponse):
    data: list[UserRead]


class UserDetailResponse(BaseResponse):
    data: UserRead


class UserCreateResponse(BaseResponse):
    data: UserRead


class UserUpdateResponse(BaseResponse):
    data: UserRead


class UserDeleteResponse(BaseResponse):
    pass
