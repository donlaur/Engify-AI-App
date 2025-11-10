from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, List, Optional

from fastapi import HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, Field, ValidationError

from config import Settings, settings


class TokenClaims(BaseModel):
    sub: str
    org_id: str = Field(..., alias="orgId")
    plan: str
    role: str
    scopes: List[str]
    workspace_slug: Optional[str] = Field(default=None, alias="workspaceSlug")
    topic: Optional[str] = None
    exp: Optional[int] = None

    model_config = {"populate_by_name": True}

    def ensure_scope(self, required: str) -> None:
        if required not in self.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required scope: {required}",
            )

    @property
    def workspace(self) -> str:
        return self.workspace_slug or "default"


class AuthContext(BaseModel):
    claims: TokenClaims
    issued_at: datetime


def decode_jwt(token: str, runtime_settings: Settings | None = None) -> AuthContext:
    runtime_settings = runtime_settings or settings
    try:
        payload = jwt.decode(token, runtime_settings.jwt_secret, algorithms=["HS256"])
        claims = TokenClaims.model_validate(payload)

        if claims.exp is not None:
            expires = datetime.fromtimestamp(claims.exp, tz=timezone.utc)
            now = datetime.now(tz=timezone.utc)
            if expires <= now:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired",
                )

        return AuthContext(claims=claims, issued_at=datetime.now(tz=timezone.utc))
    except (JWTError, ValidationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc


def build_standard_tags(claims: TokenClaims, topic: Optional[str] = None) -> List[str]:
    base_tags: List[str] = [
        f"org:{claims.org_id}",
        f"user:{claims.sub}",
        f"workspace:{claims.workspace}",
    ]
    if topic:
        base_tags.append(f"topic:{topic}")
    return base_tags


def merge_tags(
    standard_tags: Iterable[str],
    additional_tags: Optional[Iterable[str]],
) -> List[str]:
    seen: set[str] = set()
    merged: List[str] = []

    for tag in [*(standard_tags or []), *(additional_tags or [])]:
        if not tag:
            continue
        if ":" not in tag:
            continue
        if tag in seen:
            continue
        seen.add(tag)
        merged.append(tag)
    return merged

