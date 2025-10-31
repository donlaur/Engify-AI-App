# AI Summary: Unit tests for RAG service health and search endpoints. Part of Day 5 Phase 2 completion.

import pytest
from fastapi.testclient import TestClient
from api.rag import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


def test_health_endpoint(client):
    """Test health endpoint returns proper structure"""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert "timestamp" in data
    assert "service" in data
    assert "version" in data
    assert "model" in data
    assert "database" in data

    assert data["service"] == "rag-api"
    assert data["version"] == "1.0.0"


def test_health_model_status(client):
    """Test health endpoint reports model status"""
    response = client.get("/health")
    data = response.json()

    # Model should be loaded in test environment
    assert "model" in data
    model_info = data["model"]
    assert "status" in model_info

    if model_info["status"] == "loaded":
        assert "name" in model_info
        assert "dimensions" in model_info
        assert model_info["name"] == "all-MiniLM-L6-v2"
        assert isinstance(model_info["dimensions"], int)
        assert data["status"] == "ok"


def test_health_database_status(client):
    """Test health endpoint reports database status"""
    response = client.get("/health")
    data = response.json()

    assert "database" in data
    db_info = data["database"]
    assert "status" in db_info

    # Database might not be connected in test environment
    if db_info["status"] == "connected":
        assert "name" in db_info
        assert "ping_ms" in db_info
        assert data["status"] == "ok"
    else:
        assert db_info["status"] in ["not_connected", "error"]
        assert data["status"] == "degraded"


@pytest.mark.asyncio
async def test_rag_search_without_model(client):
    """Test RAG search fails gracefully when model not loaded"""
    # This would require mocking the global model variable
    # For now, just test the endpoint exists
    response = client.post("/api/rag/search", json={
        "query": "test query",
        "collection": "test_collection",
        "top_k": 5
    })

    # Should return 503 if model/db not ready
    assert response.status_code in [200, 503]


def test_invalid_request_format(client):
    """Test RAG search with invalid request format"""
    response = client.post("/api/rag/search", json={})
    assert response.status_code == 422  # Validation error


def test_missing_query_field(client):
    """Test RAG search with missing query field"""
    response = client.post("/api/rag/search", json={
        "collection": "test_collection"
    })
    assert response.status_code == 422  # Validation error


def test_missing_collection_field(client):
    """Test RAG search with missing collection field"""
    response = client.post("/api/rag/search", json={
        "query": "test query"
    })
    assert response.status_code == 422  # Validation error
