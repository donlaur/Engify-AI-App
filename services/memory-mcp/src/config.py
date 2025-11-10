from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List


def _resolve_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    lowered = value.strip().lower()
    if lowered in {"1", "true", "yes", "y"}:
        return True
    if lowered in {"0", "false", "no", "n"}:
        return False
    return default


@dataclass(slots=True)
class Settings:
    """
    Settings loader for the memory MCP service.

    The class intentionally avoids optional typing for core values so that a single source
    of truth exists during runtime. Defaults are safe for local development; production
    deployments should override via environment variables or container secrets.
    """

    jwt_secret: str = field(default="dev-secret")
    database_path: Path = field(default_factory=lambda: Path("./data/memory-dev.sqlite"))
    listen_host: str = field(default="0.0.0.0")
    listen_port: int = field(default=7420)
    log_json: bool = field(default=False)
    allow_origins: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)

    @classmethod
    def from_env(cls) -> "Settings":
        database_path = Path(os.getenv("MCP_MEMORY_DB_PATH", "./data/memory-dev.sqlite")).resolve()

        allow_origins_env = os.getenv("MEMORY_CORS_ALLOW_ORIGINS", "")
        allow_origins = [origin.strip() for origin in allow_origins_env.split(",") if origin.strip()]

        return cls(
            jwt_secret=os.getenv("JWT_SECRET", "dev-secret"),
            database_path=database_path,
            listen_host=os.getenv("MEMORY_HOST", "0.0.0.0"),
            listen_port=int(os.getenv("MEMORY_PORT", "7420")),
            log_json=_resolve_bool(os.getenv("MEMORY_LOG_JSON"), False),
            allow_origins=allow_origins,
        )


settings = Settings.from_env()

