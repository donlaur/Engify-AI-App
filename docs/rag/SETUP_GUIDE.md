# RAG Chatbot Setup Guide

This guide explains how to set up and run the RAG (Retrieval-Augmented Generation) chatbot feature.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd python
pip install -r requirements.txt
```

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
# RAG Service
RAG_API_URL=http://localhost:8000

# Database (required for RAG)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify

# AI Provider (required for chat)
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Start the RAG Service

```bash
# Option 1: Use the starter script
python scripts/start-rag-service.py

# Option 2: Manual start
cd python
uvicorn api.rag:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Seed the Knowledge Base

```bash
# Run the knowledge base seeder
npx tsx scripts/seed-knowledge-base.ts
```

### 5. Start the Next.js App

```bash
npm run dev
```

### 6. Test the RAG Chat

Visit: http://localhost:3000/rag-chat

## 🏗️ Architecture

### Components

1. **Python FastAPI Service** (`python/api/rag.py`)
   - Vector search using MongoDB Atlas Vector Search
   - Sentence transformer embeddings
   - RESTful API endpoints

2. **Next.js RAG API** (`src/app/api/rag/route.ts`)
   - Proxy to Python service
   - Request validation with Zod
   - Error handling and fallbacks

3. **Enhanced Chat API** (`src/app/api/chat/route.ts`)
   - Integrates RAG with OpenAI
   - Context injection into prompts
   - Source citation

4. **RAG Chat Interface** (`src/app/rag-chat/page.tsx`)
   - Full-featured chat UI
   - Source display
   - RAG status indicators

### Data Flow

```
User Query → Next.js Chat API → RAG API → Python Service → MongoDB Vector Search
                ↓
         OpenAI with Context → Response with Sources → User Interface
```

## 📊 Knowledge Base Structure

The knowledge base contains:

- **Prompt Templates**: 100+ role-specific prompts
- **Learning Resources**: Articles about AI patterns
- **Best Practices**: Prompt engineering techniques
- **Examples**: Real-world use cases

### Document Schema

```typescript
interface KnowledgeDocument {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  embedding: number[]; // 384-dimensional vector
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuration

### MongoDB Vector Search Index

The system expects a vector search index named `vector_index` on the `embedding` field:

```javascript
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

### Environment Variables

| Variable         | Description               | Default                 |
| ---------------- | ------------------------- | ----------------------- |
| `RAG_API_URL`    | Python service URL        | `http://localhost:8000` |
| `MONGODB_URI`    | MongoDB connection string | Required                |
| `OPENAI_API_KEY` | OpenAI API key for chat   | Required                |

## 🧪 Testing

### Test RAG Service

```bash
# Health check
curl http://localhost:8000/health

# Search test
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is chain of thought?", "top_k": 3}'
```

### Test Next.js Integration

```bash
# Test RAG API
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "prompt patterns", "top_k": 2}'

# Test Chat with RAG
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What are the best prompt patterns?"}], "useRAG": true}'
```

## 🚨 Troubleshooting

### Common Issues

1. **RAG Service Not Starting**
   - Check Python dependencies: `pip install -r requirements.txt`
   - Verify MongoDB connection
   - Check port 8000 is available

2. **No Search Results**
   - Run knowledge base seeder: `npx tsx scripts/seed-knowledge-base.ts`
   - Check MongoDB vector search index exists
   - Verify embeddings are generated

3. **Chat API Errors**
   - Check OpenAI API key is valid
   - Verify RAG service is running
   - Check environment variables

### Debug Mode

Enable debug logging:

```bash
# Python service
DEBUG=1 python scripts/start-rag-service.py

# Next.js
DEBUG=1 npm run dev
```

## 📈 Performance

### Optimization Tips

1. **Embedding Generation**
   - Use GPU acceleration for sentence transformers
   - Cache embeddings to avoid regeneration
   - Use batch processing for large datasets

2. **Vector Search**
   - Optimize MongoDB vector search index
   - Use appropriate `numCandidates` parameter
   - Implement result caching

3. **Response Time**
   - Parallel RAG and AI calls
   - Implement streaming responses
   - Use CDN for static assets

## 🔮 Future Enhancements

- [ ] Document upload interface
- [ ] Real-time embedding updates
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Performance analytics
- [ ] A/B testing for RAG vs non-RAG responses
