from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class MemoryWriteRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    metadata: dict[str, Any] | None = Field(default=None)
    tags: list[str] | None = Field(default=None)
    topic: str | None = Field(default=None, max_length=64)


class MemoryResponse(BaseModel):
    id: str = Field(..., description="Unique memory identifier")
    content: str
    metadata: dict[str, Any]
    tags: list[str]
    topic: str | None = None
    org_id: str = Field(..., alias="orgId")
    user_id: str = Field(..., alias="userId")
    workspace: str
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True}

