"""
RAG API - Retrieval Augmented Generation
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional
import os
from pymongo import MongoClient

app = FastAPI()

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# MongoDB connection
mongo_uri = os.getenv('MONGODB_URI')
if mongo_uri:
    client = MongoClient(mongo_uri)
    db = client.get_database()

class RAGQuery(BaseModel):
    query: str
    collection: str
    top_k: int = 5
    filter: Optional[dict] = None

class RAGResult(BaseModel):
    results: List[dict]
    query_embedding: List[float]

@app.post("/api/rag/search", response_model=RAGResult)
async def rag_search(request: RAGQuery):
    """Semantic search using vector embeddings"""
    try:
        # Generate query embedding
        query_embedding = model.encode([request.query])[0]
        
        # MongoDB Atlas Vector Search
        collection = db[request.collection]
        
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding.tolist(),
                    "numCandidates": request.top_k * 10,
                    "limit": request.top_k
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "content": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        if request.filter:
            pipeline.insert(1, {"$match": request.filter})
        
        results = list(collection.aggregate(pipeline))
        
        return RAGResult(
            results=results,
            query_embedding=query_embedding.tolist()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2"}
