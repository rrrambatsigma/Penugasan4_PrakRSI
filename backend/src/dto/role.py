from pydantic import BaseModel

from src.database.schema.schema import RoleEnum
from src.dto.base import BaseResponse


class RoleCreate(BaseModel):
    name: RoleEnum


class RoleUpdate(BaseModel):
    name: RoleEnum


class RolePatch(BaseModel):
    name: RoleEnum | None = None


class RoleRead(BaseModel):
    name: RoleEnum

    model_config = {"from_attributes": True}


class RoleResponse(RoleRead):
    pass


class RoleListResponse(BaseResponse):
    data: list[RoleRead]


class RoleDetailResponse(BaseResponse):
    data: RoleRead


class RoleCreateResponse(BaseResponse):
    data: RoleRead


class RoleUpdateResponse(BaseResponse):
    data: RoleRead


class RoleDeleteResponse(BaseResponse):
    pass
