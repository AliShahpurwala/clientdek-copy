from datetime import datetime
from pydantic import BaseModel, Field

class Journal(BaseModel):
    client_id: int | None = Field(default=None, ge=1)
    timestamp: str | datetime = Field(default=None)
    content: str = Field(default=None)
    appointment_id: int | None = Field(default=None, ge=1)