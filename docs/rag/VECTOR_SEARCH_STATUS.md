# Vector Search Status & Requirements

**Date:** 2025-11-05  
**Status:** Infrastructure exists, needs integration

---

## Current State

### ✅ Vector Search Infrastructure Exists

1. **MongoDB Atlas Vector Search Support**
   - ✅ Documentation exists: `docs/rag/MONGODB_VECTOR_SEARCH_SETUP.md`
   - ✅ Index configuration documented
   - ✅ Supports `$vectorSearch` aggregation pipeline

2. **Embedding Generation**
   - ✅ `python/api/embeddings.py` - Sentence Transformers API
   - ✅ Model: `all-MiniLM-L6-v2` (384 dimensions)
   - ✅ `scripts/seed-knowledge-base.ts` - Generates embeddings for knowledge base
   - ✅ Can generate embeddings for prompts/patterns

3. **RAG API**
   - ✅ `python/api/rag.py` - Has vector search implementation
   - ✅ Uses `$vectorSearch` with MongoDB Atlas
   - ✅ Returns `vectorSearchScore` for ranking

### ⚠️ Current Limitations

1. **Lambda Handler Uses Text Search Only**
   - `lambda/lambda_handler_multi_agent.py` only uses `$text` search
   - Does NOT use `$vectorSearch` currently
   - Vector search exists in `python/api/rag.py` but not integrated

2. **No Embeddings for Prompts**
   - Prompts collection doesn't have `embedding` field populated
   - Only knowledge base has embeddings (if seeded)
   - Need to generate embeddings for all prompts/patterns

3. **Vector Search Index Not Created**
   - Documentation exists but index may not be created in Atlas
   - Need to verify/create vector search index on `prompts` collection

---

## What's Needed for Vector Search

### Step 1: Generate Embeddings for Prompts ✅ Ready

**Script:** Create `scripts/admin/generate-prompt-embeddings.ts`

**Requirements:**
- Use OpenAI embeddings API OR sentence-transformers
- Generate embeddings for: title, description, content, enriched fields
- Store in `embedding` field (array of floats)
- Update on prompt creation/modification

**Cost Estimate:**
- OpenAI `text-embedding-3-small`: $0.02 per 1M tokens
- ~120 prompts × 500 tokens avg = 60K tokens = $0.0012
- Very affordable

### Step 2: Create Vector Search Index ✅ Ready

**In MongoDB Atlas:**
1. Go to Search Indexes tab
2. Create new index on `prompts` collection
3. Use JSON editor with config:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,  // For all-MiniLM-L6-v2 (or 1536 for OpenAI)
        "similarity": "cosine"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      }
    }
  }
}
```

**Index Name:** `prompts_vector_index`

### Step 3: Update Lambda Handler ✅ Ready (Code exists)

**Modify `lambda/lambda_handler_multi_agent.py`:**

```python
def hybrid_search(query: str, db, top_k: int = 5):
    """
    Hybrid search: Combine text search + vector search
    """
    # 1. Text search (fast, exact matches)
    text_results = db['prompts'].find(
        {
            '$text': {'$search': query},
            'isPublic': True,
            'active': {'$ne': False}
        }
    ).sort([('score', {'$meta': 'textScore'})]).limit(top_k * 2)
    
    # 2. Vector search (semantic, meaning-based)
    query_embedding = generate_embedding(query)  # Need to implement
    
    vector_results = db['prompts'].aggregate([
        {
            '$vectorSearch': {
                'index': 'prompts_vector_index',
                'path': 'embedding',
                'queryVector': query_embedding,
                'numCandidates': top_k * 10,
                'limit': top_k * 2
            }
        },
        {
            '$match': {
                'isPublic': True,
                'active': {'$ne': False}
            }
        },
        {
            '$project': {
                'score': {'$meta': 'vectorSearchScore'},
                'title': 1,
                'description': 1,
                # ... other fields
            }
        }
    ])
    
    # 3. Combine and deduplicate
    # Merge results, prefer higher scores
    # Return top_k results
```

### Step 4: Generate Embeddings Script ✅ Ready to Create

**Script:** `scripts/admin/generate-prompt-embeddings.ts`

**Requirements:**
- Fetch all prompts from MongoDB
- Generate embeddings using OpenAI API or sentence-transformers
- Update prompts with `embedding` field
- Batch processing for efficiency
- Handle errors gracefully

---

## Vector Search vs Text Search

| Feature | Text Search (`$text`) | Vector Search (`$vectorSearch`) |
|---------|----------------------|--------------------------------|
| **Speed** | ⚡⚡⚡ Fast | ⚡⚡ Medium |
| **Exact Matches** | ✅ Excellent | ⚠️ Good |
| **Semantic Understanding** | ❌ Limited | ✅ Excellent |
| **Synonyms** | ❌ No | ✅ Yes |
| **Typos** | ❌ No | ✅ Handles well |
| **Context** | ❌ Limited | ✅ Understands meaning |
| **Index Size** | Small | Larger (embeddings) |
| **Cost** | Free (MongoDB) | Embedding generation cost |

**Recommendation:** Use **hybrid search** - combine both for best results.

---

## Implementation Plan

### Phase 1: Extract Text from Nested Objects ✅ Done
- ✅ Create script to extract text from `caseStudies` and `examples`
- ✅ Add `caseStudiesText` and `examplesText` fields
- ✅ Update text indexes to include these fields

### Phase 2: Generate Embeddings ⏳ Next
- Create `scripts/admin/generate-prompt-embeddings.ts`
- Generate embeddings for all prompts
- Store in `embedding` field

### Phase 3: Create Vector Search Index ⏳ Next
- Create vector search index in MongoDB Atlas
- Verify index is working
- Test vector search queries

### Phase 4: Integrate Vector Search ⏳ Future
- Update Lambda handler to use hybrid search
- Combine text + vector results
- Improve RAG search quality

---

## Benefits of Vector Search

1. **Semantic Understanding**
   - Finds prompts even if exact keywords don't match
   - Understands synonyms ("code review" = "peer review")

2. **Better Context Matching**
   - Matches based on meaning, not just keywords
   - Finds relevant prompts even with different wording

3. **Handles Typos**
   - More forgiving of spelling errors
   - Better user experience

4. **Multi-language Support** (Future)
   - Vector embeddings work across languages
   - Can find prompts even if query is in different language

---

## Cost Considerations

### Embedding Generation Costs

**OpenAI `text-embedding-3-small`:**
- $0.02 per 1M tokens
- ~120 prompts × 500 tokens = 60K tokens
- Initial generation: ~$0.0012
- Per-prompt update: ~$0.00001

**Sentence Transformers (Self-hosted):**
- Free (but requires compute)
- Good for privacy-sensitive deployments
- Can run in Lambda or container

### Ongoing Costs

- **Storage:** Embeddings add ~1-2KB per prompt (negligible)
- **Search:** Vector search is free (MongoDB Atlas)
- **Updates:** Only regenerate when prompt content changes

---

## Current Recommendation

**For Now:**
1. ✅ Extract text from nested objects (done)
2. ✅ Use text search with flattened fields (working)
3. ⏳ Generate embeddings when ready
4. ⏳ Set up vector search index when needed

**Text search with flattened fields is sufficient for current needs.**  
**Vector search can be added later when:**
- Search quality needs improvement
- Semantic matching becomes important
- We have resources to maintain embeddings

---

## Related Files

- `docs/rag/MONGODB_VECTOR_SEARCH_SETUP.md` - Vector search setup guide
- `docs/content/RAG_CHAT_IMPROVEMENT_PLAN.md` - RAG improvement plan
- `python/api/rag.py` - Vector search implementation
- `python/api/embeddings.py` - Embedding generation API
- `lambda/lambda_handler_multi_agent.py` - Current Lambda handler (text search only)

