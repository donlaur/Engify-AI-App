#!/usr/bin/env python3

"""
Simple RAG Service Test
Tests if we can create a basic FastAPI service without heavy ML dependencies
"""

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

app = FastAPI(title="RAG Service Test", version="1.0.0")

class RAGQuery(BaseModel):
    query: str
    collection: str = "knowledge_base"
    top_k: int = 5
    filter: Optional[dict] = None

class RAGResult(BaseModel):
    results: List[dict]
    query_embedding: List[float]

# Mock knowledge base for testing
MOCK_KNOWLEDGE_BASE = [
    {
        "_id": "prompt-001",
        "title": "Chain of Thought Prompting",
        "content": "Chain of Thought (CoT) is a prompting technique that asks the AI to think step by step before answering. This dramatically improves accuracy on complex reasoning tasks.",
        "category": "patterns",
        "tags": ["reasoning", "step-by-step", "accuracy"],
        "score": 0.95
    },
    {
        "_id": "prompt-002", 
        "title": "Few-Shot Learning",
        "content": "Few-Shot Learning provides 2-5 examples of input → output pairs, then asks the AI to complete a similar task. Best for classification and formatting tasks.",
        "category": "patterns",
        "tags": ["examples", "classification", "formatting"],
        "score": 0.88
    },
    {
        "_id": "prompt-003",
        "title": "Persona Pattern",
        "content": "The Persona Pattern defines who the AI should be: 'You are a [role] with expertise in [domain]...' This provides more relevant, contextual responses.",
        "category": "patterns", 
        "tags": ["role", "context", "relevance"],
        "score": 0.92
    }
]

@app.post("/api/rag/search", response_model=RAGResult)
async def rag_search(request: RAGQuery):
    """Mock semantic search - returns relevant results based on keyword matching"""
    try:
        query_lower = request.query.lower()
        
        # Simple keyword matching (replace with real vector search later)
        matching_results = []
        for doc in MOCK_KNOWLEDGE_BASE:
            score = 0
            content_lower = (doc["title"] + " " + doc["content"]).lower()
            
            # Calculate simple relevance score
            for word in query_lower.split():
                if word in content_lower:
                    score += 0.1
                if word in doc["title"].lower():
                    score += 0.3
                if word in doc["tags"]:
                    score += 0.2
            
            if score > 0:
                doc_copy = doc.copy()
                doc_copy["score"] = min(score, 1.0)  # Cap at 1.0
                matching_results.append(doc_copy)
        
        # Sort by score and limit results
        matching_results.sort(key=lambda x: x["score"], reverse=True)
        results = matching_results[:request.top_k]
        
        # Mock embedding (replace with real embedding later)
        mock_embedding = [0.1] * 384  # 384-dimensional vector
        
        return RAGResult(
            results=results,
            query_embedding=mock_embedding
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "service": "rag-mock",
        "version": "1.0.0",
        "message": "Mock RAG service running - ready for testing"
    }

@app.get("/")
async def root():
    return {
        "message": "RAG Service Test",
        "endpoints": {
            "health": "/health",
            "search": "/api/rag/search",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock RAG Service...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🔎 Test Search: POST http://localhost:8000/api/rag/search")
    uvicorn.run(app, host="0.0.0.0", port=8000)

