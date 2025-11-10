from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Optional


class DatabaseError(Exception):
    pass


@dataclass(slots=True)
class MemoryRecord:
    memory_id: str
    org_id: str
    user_id: str
    workspace: str
    topic: Optional[str]
    content: str
    metadata: dict[str, Any]
    tags: list[str]
    created_at: datetime
    updated_at: datetime


def _connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    return conn


class MemoryRepository:
    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._initialise()

    def _initialise(self) -> None:
        with _connect(self._db_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    org_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    workspace TEXT NOT NULL,
                    topic TEXT,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    tags TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_memories_org_workspace
                ON memories(org_id, workspace)
            """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_memories_tags
                ON memories(tags)
            """
            )
            connection.commit()

    def insert_memory(
        self,
        memory_id: str,
        org_id: str,
        user_id: str,
        workspace: str,
        topic: Optional[str],
        content: str,
        metadata: Optional[dict[str, Any]],
        tags: Iterable[str],
    ) -> MemoryRecord:
        timestamp = datetime.now(tz=timezone.utc).isoformat()
        metadata_json = json.dumps(metadata or {}, ensure_ascii=False)
        tag_list = list(tags)
        tags_json = json.dumps(tag_list, ensure_ascii=False)

        with _connect(self._db_path) as connection:
            connection.execute(
                """
                INSERT INTO memories (
                    id,
                    org_id,
                    user_id,
                    workspace,
                    topic,
                    content,
                    metadata,
                    tags,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    memory_id,
                    org_id,
                    user_id,
                    workspace,
                    topic,
                    content,
                    metadata_json,
                    tags_json,
                    timestamp,
                    timestamp,
                ),
            )
            connection.commit()

        return MemoryRecord(
            memory_id=memory_id,
            org_id=org_id,
            user_id=user_id,
            workspace=workspace,
            topic=topic,
            content=content,
            metadata=json.loads(metadata_json),
            tags=tag_list,
            created_at=datetime.fromisoformat(timestamp),
            updated_at=datetime.fromisoformat(timestamp),
        )

    def get_memory(self, org_id: str, workspace: str, memory_id: str) -> Optional[MemoryRecord]:
        with _connect(self._db_path) as connection:
            cursor = connection.execute(
                """
                SELECT *
                FROM memories
                WHERE id = ? AND org_id = ? AND workspace = ?
            """,
                (memory_id, org_id, workspace),
            )
            row = cursor.fetchone()
            if row is None:
                return None
            return self._row_to_record(row)

    def search_memories(
        self,
        org_id: str,
        workspace: str,
        query: Optional[str] = None,
        topic: Optional[str] = None,
        limit: int = 50,
    ) -> list[MemoryRecord]:
        sql = """
            SELECT *
            FROM memories
            WHERE org_id = ? AND workspace = ?
        """
        params: list[Any] = [org_id, workspace]

        if topic:
            sql += " AND topic = ?"
            params.append(topic)

        if query:
            sql += " AND content LIKE ?"
            params.append(f"%{query}%")

        sql += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        with _connect(self._db_path) as connection:
            cursor = connection.execute(sql, params)
            rows = cursor.fetchall()
            return [self._row_to_record(row) for row in rows]

    @staticmethod
    def _row_to_record(row: sqlite3.Row) -> MemoryRecord:
        metadata_raw = row["metadata"] or "{}"
        tags_raw = row["tags"] or "[]"
        return MemoryRecord(
            memory_id=row["id"],
            org_id=row["org_id"],
            user_id=row["user_id"],
            workspace=row["workspace"],
            topic=row["topic"],
            content=row["content"],
            metadata=json.loads(metadata_raw),
            tags=list(json.loads(tags_raw)),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )

