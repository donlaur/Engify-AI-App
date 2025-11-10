from __future__ import annotations

import logging
import uuid
from typing import Iterable, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import AuthContext, build_standard_tags, decode_jwt, merge_tags
from config import Settings, settings
from database import MemoryRepository
from schemas import MemoryResponse, MemoryWriteRequest

LOGGER = logging.getLogger("engify.memory")


def get_repository(request: Request) -> MemoryRepository:
    repository = request.app.state.repository
    if not isinstance(repository, MemoryRepository):
        raise RuntimeError("Repository not configured on application state")
    return repository


def get_settings(request: Request) -> Settings:
    configured = request.app.state.settings
    if not isinstance(configured, Settings):
        raise RuntimeError("Settings not configured on application state")
    return configured


def authorize_request(
    authorization: str | None = Header(default=None, convert_underscores=False),
    runtime_settings: Settings = Depends(get_settings),
) -> AuthContext:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )
    token = authorization.removeprefix("Bearer ").strip()
    return decode_jwt(token, runtime_settings)


def create_app(runtime_settings: Settings | None = None) -> FastAPI:
    runtime_settings = runtime_settings or settings
    app = FastAPI(
        title="Engify Memory MCP Service",
        version="0.1.0",
        description="Tenant-aware memory persistence for Engify MCP agents",
    )

    repository = MemoryRepository(runtime_settings.database_path)

    app.state.settings = runtime_settings
    app.state.repository = repository

    if runtime_settings.allow_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=runtime_settings.allow_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        LOGGER.exception("Unhandled exception", extra={"path": request.url.path})
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error"},
        )

    @app.get("/health", tags=["health"])
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.post(
        "/v1/memory",
        response_model=MemoryResponse,
        status_code=status.HTTP_201_CREATED,
        tags=["memory"],
    )
    async def create_memory(
        payload: MemoryWriteRequest,
        auth: AuthContext = Depends(authorize_request),
        repository: MemoryRepository = Depends(get_repository),
    ) -> MemoryResponse:
        auth.claims.ensure_scope("memory.write")

        standard_tags = build_standard_tags(auth.claims, payload.topic or auth.claims.topic)
        merged_tags = merge_tags(standard_tags, payload.tags or [])

        record = repository.insert_memory(
            memory_id=str(uuid.uuid4()),
            org_id=auth.claims.org_id,
            user_id=auth.claims.sub,
            workspace=auth.claims.workspace,
            topic=payload.topic or auth.claims.topic,
            content=payload.content,
            metadata=payload.metadata,
            tags=merged_tags,
        )

        return MemoryResponse(
            id=record.memory_id,
            content=record.content,
            metadata=record.metadata,
            tags=record.tags,
            topic=record.topic,
            orgId=record.org_id,
            userId=record.user_id,
            workspace=record.workspace,
            createdAt=record.created_at,
            updatedAt=record.updated_at,
        )

    @app.get(
        "/v1/memory",
        response_model=list[MemoryResponse],
        tags=["memory"],
    )
    async def list_memories(
        query: str | None = None,
        topic: str | None = None,
        limit: int = 50,
        auth: AuthContext = Depends(authorize_request),
        repository: MemoryRepository = Depends(get_repository),
    ) -> list[MemoryResponse]:
        auth.claims.ensure_scope("memory.read")

        limit = max(1, min(limit, 200))

        records = repository.search_memories(
            org_id=auth.claims.org_id,
            workspace=auth.claims.workspace,
            query=query,
            topic=topic,
            limit=limit,
        )

        return [
            MemoryResponse(
                id=record.memory_id,
                content=record.content,
                metadata=record.metadata,
                tags=record.tags,
                topic=record.topic,
                orgId=record.org_id,
                userId=record.user_id,
                workspace=record.workspace,
                createdAt=record.created_at,
                updatedAt=record.updated_at,
            )
            for record in records
        ]

    @app.get(
        "/v1/memory/{memory_id}",
        response_model=MemoryResponse,
        tags=["memory"],
    )
    async def get_memory(
        memory_id: str,
        auth: AuthContext = Depends(authorize_request),
        repository: MemoryRepository = Depends(get_repository),
    ) -> MemoryResponse:
        auth.claims.ensure_scope("memory.read")

        record = repository.get_memory(
            org_id=auth.claims.org_id,
            workspace=auth.claims.workspace,
            memory_id=memory_id,
        )

        if record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Memory not found",
            )

        return MemoryResponse(
            id=record.memory_id,
            content=record.content,
            metadata=record.metadata,
            tags=record.tags,
            topic=record.topic,
            orgId=record.org_id,
            userId=record.user_id,
            workspace=record.workspace,
            createdAt=record.created_at,
            updatedAt=record.updated_at,
        )

    return app

