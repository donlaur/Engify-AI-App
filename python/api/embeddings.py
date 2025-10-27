"""
Embeddings API - Generate vector embeddings for RAG
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

app = FastAPI()

# Load model once at startup
model = SentenceTransformer('all-MiniLM-L6-v2')

class EmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    dimensions: int

@app.post("/api/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """Generate embeddings for text"""
    try:
        embeddings = model.encode(request.texts)
        
        return EmbeddingResponse(
            embeddings=embeddings.tolist(),
            model="all-MiniLM-L6-v2",
            dimensions=embeddings.shape[1]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}
