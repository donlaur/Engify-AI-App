<!--
AI Summary: Packaging and integration of the Python RAG service with health/logging, TS client schemas, retries/timeouts, and CI hooks.
-->

# Python RAG Service

This work is part of Day 5: [Day 5 Plan](../planning/DAY_5_PLAN.md).

## Overview

Containerized service with a health endpoint and structured logs. TS client uses Zod schemas and provider harness patterns.

## File Map

- `python/pyproject.toml` - Complete packaging with deps, scripts, mypy/pytest config
- `python/Dockerfile` - Multi-stage build for production deployment
- `python/api/rag.py` - FastAPI service with lifespan management, structured logging
- `src/lib/rag/client.ts` - TypeScript client with Zod schemas and retry logic
- `python/tests/test_rag.py` - Unit tests for health and search endpoints
- `.github/workflows/python-rag-ci.yml` - CI pipeline for type checking, testing, coverage
- `scripts/start-rag-service.py` - Local development helper script

## Health & Logging

- **Health**: `GET /health` returns comprehensive status with model/database checks
- **Logging**: Structured JSON logs with timestamps, request details, and performance metrics
- **Lifespan**: FastAPI lifespan management for clean startup/shutdown with retries

## Timeouts/Retry

- **Client**: 30s timeout, exponential backoff retry (up to 3 attempts)
- **Service**: 10s MongoDB query timeout, async embedding generation
- **MongoDB**: Connection retry with 5s timeouts and exponential backoff

## CI Pipeline

- **Type Checking**: MyPy with strict settings
- **Linting**: Black and isort code formatting
- **Testing**: Pytest with async support and coverage reporting (80% minimum)
- **Health Validation**: Integration test that starts service and validates `/health` endpoint
- **Build**: Package building and installation verification

## Tests & Acceptance

- **Unit Tests**: Health endpoint structure, validation errors, service status checks
- **Integration**: Full service startup and health endpoint validation
- **Coverage**: 80%+ code coverage requirement
- **Local Development**: `pip install -e .` for editable installs
- **CI Status**: All checks pass in GitHub Actions
