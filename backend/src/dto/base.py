from typing import Any

from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    code: int = Field(default=200)
    message: str = Field(default="OK")
    data: Any | None = Field(default=None)
