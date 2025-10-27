# Python AI Services

FastAPI services for AI/ML operations deployed as AWS Lambda functions.

## Services

- **embeddings.py** - Generate vector embeddings using sentence-transformers
- **rag.py** - Semantic search with MongoDB Atlas Vector Search
- **ai_execute.py** - Multi-provider AI execution (OpenAI, Anthropic, Google)

## Setup

```bash
cd python
pip install -r requirements.txt
```

## Run Locally

```bash
# Embeddings service
uvicorn api.embeddings:app --reload --port 8001

# RAG service
uvicorn api.rag:app --reload --port 8002

# AI execution service
uvicorn api.ai_execute:app --reload --port 8003
```

## Deploy to AWS Lambda

Using SST (Serverless Stack):

```typescript
// sst.config.ts
new Function(stack, "Embeddings", {
  handler: "python/api/embeddings.handler",
  runtime: "python3.11",
});
```

## Environment Variables

```bash
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```
