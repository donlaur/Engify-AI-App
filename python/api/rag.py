"""
RAG API - Retrieval Augmented Generation
"""

import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional
import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import asyncio

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables for model and database
model = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown"""
    global model, db

    logger.info("Starting RAG service...")

    try:
        # Load embedding model with timeout
        logger.info("Loading sentence transformer model...")
        start_time = time.time()
        model = SentenceTransformer('all-MiniLM-L6-v2')
        load_time = time.time() - start_time
        logger.info(f"Model loaded successfully in {load_time:.2f}s")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

    # MongoDB connection with retry
    mongo_uri = os.getenv('MONGODB_URI')
    if mongo_uri:
        logger.info("Connecting to MongoDB...")
        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                client = MongoClient(
                    mongo_uri,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000
                )
                # Test connection
                client.admin.command('ping')
                db = client.get_database()
                logger.info("MongoDB connection established")
                break
            except ServerSelectionTimeoutError as e:
                if attempt < max_retries - 1:
                    logger.warning(f"MongoDB connection attempt {attempt + 1} failed, retrying in {retry_delay}s: {e}")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    logger.error(f"Failed to connect to MongoDB after {max_retries} attempts: {e}")
                    raise
    else:
        logger.warning("MONGODB_URI not set, running without database connection")

    yield

    # Shutdown
    logger.info("Shutting down RAG service...")
    if 'client' in locals():
        client.close()

app = FastAPI(lifespan=lifespan)

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
    start_time = time.time()
    logger.info(f"Processing RAG search request: query='{request.query[:50]}...', collection={request.collection}, top_k={request.top_k}")

    try:
        # Validate inputs
        if not model:
            raise HTTPException(status_code=503, detail="Model not loaded")
        if not db:
            raise HTTPException(status_code=503, detail="Database not connected")

        # Generate query embedding with timeout
        logger.debug("Generating query embedding...")
        embed_start = time.time()
        query_embedding = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: model.encode([request.query], show_progress_bar=False)[0]
        )
        embed_time = time.time() - embed_start
        logger.debug(f"Query embedding generated in {embed_time:.3f}s")

        # MongoDB Atlas Vector Search with timeout
        collection = db[request.collection]
        logger.debug(f"Searching collection '{request.collection}'...")

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding.tolist(),
                    "numCandidates": min(request.top_k * 10, 100),  # Cap at 100 candidates
                    "limit": min(request.top_k, 20)  # Cap at 20 results
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

        search_start = time.time()
        results = list(collection.aggregate(pipeline, maxTimeMS=10000))  # 10 second timeout
        search_time = time.time() - search_start

        total_time = time.time() - start_time
        logger.info(f"RAG search completed in {total_time:.3f}s (embed: {embed_time:.3f}s, search: {search_time:.3f}s) - found {len(results)} results")

        return RAGResult(
            results=results,
            query_embedding=query_embedding.tolist()
        )
    except Exception as e:
        error_time = time.time() - start_time
        logger.error(f"RAG search failed after {error_time:.3f}s: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Comprehensive health check endpoint"""
    health_status = {
        "status": "ok",
        "timestamp": time.time(),
        "service": "rag-api",
        "version": "1.0.0"
    }

    # Check model status
    if model is not None:
        health_status["model"] = {
            "name": "all-MiniLM-L6-v2",
            "status": "loaded",
            "dimensions": model.get_sentence_embedding_dimension()
        }
    else:
        health_status["model"] = {"status": "not_loaded"}
        health_status["status"] = "degraded"

    # Check database status
    if db is not None:
        try:
            # Quick ping test
            start_time = time.time()
            db.command("ping")
            ping_time = time.time() - start_time

            health_status["database"] = {
                "status": "connected",
                "ping_ms": round(ping_time * 1000, 2),
                "name": db.name
            }
        except Exception as e:
            health_status["database"] = {
                "status": "error",
                "error": str(e)
            }
            health_status["status"] = "degraded"
    else:
        health_status["database"] = {"status": "not_connected"}
        health_status["status"] = "degraded"

    logger.debug(f"Health check: {health_status['status']}")
    return health_status
