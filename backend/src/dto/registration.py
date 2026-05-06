import uuid

from pydantic import BaseModel

from src.dto.base import BaseResponse


class RegistrationCreate(BaseModel):
    event_id: uuid.UUID
    # Admin may supply this. Normal users can omit it and will register themselves.
    user_id: uuid.UUID | None = None


class RegistrationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID

    model_config = {"from_attributes": True}


class RegistrationResponse(RegistrationRead):
    pass


class RegistrationCreateResponse(BaseResponse):
    data: RegistrationRead


class RegistrationListResponse(BaseResponse):
    data: list[RegistrationRead]


class RegistrationDetailResponse(BaseResponse):
    data: RegistrationRead


# class RegistrationUpdateResponse(BaseResponse):
#     data: RegistrationRead


class RegistrationDeleteResponse(BaseResponse):
    pass
