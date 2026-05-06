import uuid
from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from src.dto.base import BaseResponse


class EventRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    quota: int
    started_at: datetime
    ended_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CreateEventRequest(BaseModel):
    name: str = Field(default="Event Name", min_length=1, examples=["Event Name"])
    description: str | None = Field(default="Event Description", examples=["Event Description"])
    quota: int = Field(default=100, ge=1, examples=[100])
    start_date: datetime = Field(examples=["2026-04-02T00:00:00"])
    end_date: datetime = Field(examples=["2026-04-02T03:00:00"])

    @model_validator(mode="after")
    def validate_event_dates(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date harus lebih besar dari start_date")
        return self


class CreateEventResponse(BaseResponse):
    data: EventRead | None = None


class GetEventsResponse(BaseResponse):
    data: list[EventRead]


class GetEventByIdResponse(BaseResponse):
    data: EventRead


class UpdateEventRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, examples=["Event Name"])
    description: str | None = Field(default=None, examples=["Event Description"])
    quota: int | None = Field(default=None, ge=1, examples=[100])
    start_date: datetime | None = Field(default=None, examples=["2026-04-02T00:00:00"])
    end_date: datetime | None = Field(default=None, examples=["2026-04-02T03:00:00"])


class UpdateEventResponse(BaseResponse):
    data: EventRead | None = None


class DeleteEventResponse(BaseResponse):
    pass
