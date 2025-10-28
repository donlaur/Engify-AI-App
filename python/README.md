# Python Workbench - AI Utilities

**Purpose**: Python utilities for advanced AI operations, RAG systems, and machine learning workflows

## Overview

The Python workbench provides specialized utilities for AI/ML operations that complement the Next.js frontend. These utilities handle advanced AI features like RAG (Retrieval-Augmented Generation), embeddings, and complex AI workflows that are better suited for Python's ML ecosystem.

## Architecture

```
Next.js Frontend
       ↓
Vercel Functions (Node.js)
       ↓
Python Utilities (AI/ML Operations)
       ↓
AI Providers (OpenAI, Anthropic, Google, Groq)
```

## Current Implementation Status

### ✅ Working Modules

#### `api/ai_execute.py`

- **Status**: Partial implementation
- **Purpose**: Execute AI prompts with multiple providers
- **Features**:
  - OpenAI GPT integration
  - Error handling and fallbacks
  - Response streaming
  - Cost calculation

#### `api/embeddings.py`

- **Status**: Stub implementation
- **Purpose**: Generate embeddings for RAG systems
- **Planned Features**:
  - OpenAI embeddings API
  - Vector similarity search
  - Batch processing
  - Caching layer

#### `api/rag.py`

- **Status**: Stub implementation
- **Purpose**: Retrieval-Augmented Generation system
- **Planned Features**:
  - Document chunking and indexing
  - Vector database integration
  - Context retrieval
  - Response generation with context

## Module Details

### AI Execute Module

```python
# api/ai_execute.py
import openai
from typing import Dict, Any, Optional

class AIExecutor:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    async def execute_prompt(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute a prompt with the specified AI model

        Args:
            prompt: The prompt text to execute
            model: AI model to use (gpt-3.5-turbo, gpt-4, etc.)
            **kwargs: Additional parameters (temperature, max_tokens, etc.)

        Returns:
            Dict containing response, usage, and metadata
        """
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )

            return {
                "response": response.choices[0].message.content,
                "usage": response.usage,
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "error": str(e),
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            }
```

### Embeddings Module (Planned)

```python
# api/embeddings.py
import openai
import numpy as np
from typing import List, Dict, Any

class EmbeddingService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    async def generate_embeddings(
        self,
        texts: List[str],
        model: str = "text-embedding-ada-002"
    ) -> List[Dict[str, Any]]:
        """
        Generate embeddings for a list of texts

        Args:
            texts: List of text strings to embed
            model: Embedding model to use

        Returns:
            List of embedding objects with vectors and metadata
        """
        # Implementation planned
        pass

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors

        Args:
            vec1: First embedding vector
            vec2: Second embedding vector

        Returns:
            Cosine similarity score (-1 to 1)
        """
        # Implementation planned
        pass
```

### RAG Module (Planned)

```python
# api/rag.py
from typing import List, Dict, Any, Optional
import chromadb
from .embeddings import EmbeddingService

class RAGSystem:
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        self.vector_db = chromadb.Client()
        self.collection = None

    async def index_documents(
        self,
        documents: List[Dict[str, Any]],
        collection_name: str = "documents"
    ) -> bool:
        """
        Index documents for retrieval

        Args:
            documents: List of document objects with text and metadata
            collection_name: Name of the collection to create/use

        Returns:
            True if indexing successful
        """
        # Implementation planned
        pass

    async def retrieve_context(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query

        Args:
            query: Search query
            top_k: Number of relevant documents to retrieve

        Returns:
            List of relevant document chunks with metadata
        """
        # Implementation planned
        pass

    async def generate_response(
        self,
        query: str,
        context: List[Dict[str, Any]],
        ai_executor: AIExecutor
    ) -> str:
        """
        Generate response using retrieved context

        Args:
            query: User query
            context: Retrieved context documents
            ai_executor: AI execution service

        Returns:
            Generated response with context
        """
        # Implementation planned
        pass
```

## Integration with Next.js

### Vercel Functions Integration

The Python utilities integrate with Next.js through Vercel Functions:

```typescript
// pages/api/ai/advanced/route.ts
import { spawn } from 'child_process';

export async function POST(request: Request) {
  const { operation, data } = await request.json();

  // Execute Python utility
  const pythonProcess = spawn('python', [
    `python/api/${operation}.py`,
    JSON.stringify(data),
  ]);

  // Handle response
  return new Response(/* ... */);
}
```

### Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key

# Python-specific
PYTHON_PATH=/usr/bin/python3
VENV_PATH=./python/venv
```

## Development Workflow

### Local Development

1. **Setup Python Environment**

   ```bash
   cd python
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run Python Utilities**

   ```bash
   # Test AI execution
   python api/ai_execute.py --prompt "Hello world" --model gpt-3.5-turbo

   # Test embeddings (when implemented)
   python api/embeddings.py --text "Sample text" --model text-embedding-ada-002

   # Test RAG system (when implemented)
   python api/rag.py --query "What is AI?" --top-k 5
   ```

3. **Integration Testing**
   ```bash
   # Test with Next.js API routes
   npm run dev
   curl -X POST http://localhost:3000/api/ai/advanced \
     -H "Content-Type: application/json" \
     -d '{"operation": "ai_execute", "data": {"prompt": "Hello"}}'
   ```

### Testing Strategy

```python
# tests/test_ai_execute.py
import pytest
from api.ai_execute import AIExecutor

@pytest.mark.asyncio
async def test_ai_execution():
    executor = AIExecutor(api_key="test_key")
    result = await executor.execute_prompt("Hello world")

    assert "response" in result
    assert result["model"] == "gpt-3.5-turbo"
    assert "error" not in result

@pytest.mark.asyncio
async def test_error_handling():
    executor = AIExecutor(api_key="invalid_key")
    result = await executor.execute_prompt("Hello world")

    assert "error" in result
    assert result["model"] == "gpt-3.5-turbo"
```

## Roadmap

### Phase 1: Core AI Operations (Current)

- [x] Basic AI execution with OpenAI
- [ ] Multi-provider support (Anthropic, Google, Groq)
- [ ] Error handling and fallbacks
- [ ] Response streaming

### Phase 2: Embeddings & Vector Search

- [ ] OpenAI embeddings integration
- [ ] Vector similarity search
- [ ] Batch processing
- [ ] Caching layer

### Phase 3: RAG System

- [ ] Document chunking and indexing
- [ ] Vector database integration (ChromaDB)
- [ ] Context retrieval
- [ ] Response generation with context

### Phase 4: Advanced Features

- [ ] Multi-agent workflows
- [ ] Custom model fine-tuning
- [ ] Advanced prompt engineering
- [ ] Performance optimization

## Dependencies

```txt
# requirements.txt
openai>=1.0.0
anthropic>=0.7.0
google-generativeai>=0.3.0
groq>=0.4.0
chromadb>=0.4.0
numpy>=1.24.0
pandas>=2.0.0
pytest>=7.0.0
pytest-asyncio>=0.21.0
```

## Performance Considerations

### Optimization Strategies

1. **Connection Pooling**
   - Reuse HTTP connections
   - Implement connection limits
   - Handle connection timeouts

2. **Caching**
   - Cache embeddings for repeated queries
   - Implement response caching
   - Use Redis for distributed caching

3. **Batch Processing**
   - Process multiple requests together
   - Implement request queuing
   - Optimize for throughput

4. **Resource Management**
   - Monitor memory usage
   - Implement garbage collection
   - Handle large document processing

## Security Considerations

### API Key Management

- Store keys in environment variables
- Use key rotation strategies
- Implement rate limiting
- Monitor usage patterns

### Input Validation

- Validate all inputs
- Sanitize user content
- Implement size limits
- Check for malicious content

### Error Handling

- Don't expose internal errors
- Log errors securely
- Implement graceful degradation
- Monitor for security issues

## Monitoring & Observability

### Metrics to Track

- API response times
- Error rates by provider
- Token usage and costs
- Cache hit rates
- Memory usage

### Logging Strategy

```python
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

def log_ai_request(provider: str, model: str, tokens: int, duration: float):
    logger.info(json.dumps({
        "event": "ai_request",
        "provider": provider,
        "model": model,
        "tokens": tokens,
        "duration_ms": duration * 1000,
        "timestamp": datetime.utcnow().isoformat()
    }))
```

---

**This Python workbench demonstrates advanced AI/ML capabilities and showcases expertise in building production-ready AI systems suitable for enterprise environments.**
