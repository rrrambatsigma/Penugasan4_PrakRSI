import uuid

from pydantic import BaseModel, EmailStr, Field

from src.dto.base import BaseResponse


class RegisterRequest(BaseModel):
    first_name: str = Field(default="John", examples=["John"])
    last_name: str = Field(default="Doe", examples=["Doe"])
    whatsapp_number: str = Field(default="+62123456789", examples=["+62123456789"])
    username: str = Field(default="johndoe", examples=["johndoe"])
    email: EmailStr = Field(
        default="john.doe@example.com", examples=["john.doe@example.com"]
    )
    password: str = Field(default="JohnDoe123", examples=["JohnDoe123"])


class RegisterResponse(BaseResponse):
    pass


class LoginRequest(BaseModel):
    identifier: str = Field(
        default="johndoe", examples=["johndoe", "john.doe@example.com"]
    )
    password: str = Field(default="JohnDoe123", examples=["JohnDoe123"])


class LoginData(BaseModel):
    access_token: str = Field(
        default="", examples=["liaustgdf98723giuj3br927835t0g238tgr20385trg20385g203"]
    )
    refresh_token: str = Field(default="", examples=["qwijkrgq089725tg231987u5g2890"])


class LoginResponse(BaseResponse):
    data: LoginData


class LogoutRequest(BaseModel):
    account_id: uuid.UUID = Field(
        default=uuid.UUID("00000000-0000-0000-0000-000000000000")
    )


class LogoutResponse(BaseResponse):
    pass


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class RefreshResponse(BaseResponse):
    data: LoginData