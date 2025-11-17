# RAG & Multi-Agent: Should They Use JSON Files?

**Date:** 2025-11-04  
**Status:** Analysis Complete  
**Recommendation:** ❌ **No - MongoDB is required for RAG/search use cases**

**⚠️ IMPORTANT:** Future enterprise/firewall deployment means `/public/data/*.json` won't be accessible. Need authenticated API routes for JSON serving.

---

## Current Architecture

### RAG System (`lambda/lambda_handler_multi_agent.py`, `python/api/rag.py`)
- ✅ Uses MongoDB `$text` search with text indexes
- ✅ Uses MongoDB `$vectorSearch` for semantic search (vector embeddings)
- ✅ Uses `textScore` and `vectorSearchScore` for ranking
- ✅ Searches `prompts` and `patterns` collections

### Multi-Agent Workbench (`lambda/lambda_handler_multi_agent.py`)
- ✅ Uses MongoDB `$text` search with text indexes
- ✅ Uses `textScore` for ranking results
- ✅ Falls back to regex search if text index fails

### JSON Files (Current: `/public/data/*.json`)
- ✅ Currently served from `/public` folder (publicly accessible)
- ⚠️ **Won't work behind firewall** (enterprise deployment)
- ✅ Fast loading (no cold starts)
- ✅ Low cost (static files)

---

## Why JSON Files Won't Work for RAG/Search

### ❌ Critical Limitations

1. **No Full-Text Search**
   - JSON files are static data - no indexes
   - MongoDB `$text` search requires text indexes (can't do this on JSON)
   - Current RAG uses: `{'$text': {'$search': search_query}}`

2. **No Semantic Search**
   - Vector embeddings are stored in MongoDB (`embedding` field)
   - MongoDB `$vectorSearch` requires vector indexes (can't do this on JSON)
   - Current RAG uses: `$vectorSearch` with `queryVector` and `vectorSearchScore`

3. **No Ranking/Scoring**
   - JSON files can't calculate `textScore` (MongoDB metadata)
   - JSON files can't calculate `vectorSearchScore` (MongoDB metadata)
   - Current RAG relies on scores to rank results (top 5 prompts, top 3 patterns)

4. **Inefficient Client-Side Search**
   - Would require loading entire dataset (204KB prompts.json) into memory
   - Would need to implement custom search logic (regex, fuzzy matching)
   - No performance benefit vs MongoDB with indexes

5. **Stale Data Risk**
   - JSON files are up to 1 hour stale (regenerated hourly)
   - RAG searches need real-time results (new prompts should be searchable immediately)

---

## Future Architecture: Enterprise/Firewall Deployment

### ⚠️ Current Problem

**Current (Public JSON):**
```
/public/data/prompts.json → ✅ Works for public sites
/public/data/patterns.json → ✅ Works for public sites
```

**Future (Behind Firewall):**
```
/public/data/prompts.json → ❌ Not accessible behind firewall
/public/data/patterns.json → ❌ Not accessible behind firewall
```

### ✅ Solution: Authenticated API Routes

**Create API routes to serve JSON (authenticated):**

```typescript
// src/app/api/content/prompts/route.ts
export async function GET(request: NextRequest) {
  // RBAC: Authenticated users only
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load from JSON file (server-side only)
  const prompts = await loadPromptsFromJson();
  
  return NextResponse.json({
    version: '1.0',
    generatedAt: new Date().toISOString(),
    prompts,
  });
}
```

**Benefits:**
- ✅ Works behind firewall (authenticated API)
- ✅ Still fast (serves JSON, not MongoDB query)
- ✅ Low cost (static JSON, minimal processing)
- ✅ Can add RBAC/permissions
- ✅ Can add caching headers

**Cost Comparison:**

| Approach | Cost | Speed | Works Behind Firewall |
|----------|------|-------|----------------------|
| `/public/data/*.json` | Free | ⚡⚡⚡⚡⚡ | ❌ No |
| `/api/content/prompts` | Free* | ⚡⚡⚡⚡ | ✅ Yes |
| MongoDB direct query | $$ | ⚡⚡⚡ | ✅ Yes |

*Free = Static JSON served via API route (no database query)

---

## What JSON Files ARE Good For

✅ **Display/Filtering** (current use case):
- Fast loading for UI components
- No search needed - just filtering by category/role
- Static content display

✅ **Future: Authenticated API Routes**:
- Serve JSON via `/api/content/prompts` (authenticated)
- Works behind firewall
- Still fast (static JSON, no MongoDB query)
- Low cost (free tier compatible)

✅ **Fallback/Cache Layer** (potential hybrid):
- Could use JSON API for exact ID/slug lookups
- Could use JSON API for initial filtering, then MongoDB for search
- But adds complexity without significant benefit

---

## Recommendation: Keep MongoDB for RAG/Search

### ✅ Keep Current Architecture

**RAG System:**
```python
# Current (CORRECT):
prompts = db['prompts'].find({
    '$text': {'$search': search_query},  # Requires MongoDB text index
    'isPublic': True,
    'active': {'$ne': False}
}).sort([('score', {'$meta': 'textScore'})])  # Requires MongoDB scoring
```

**Why this works:**
- ✅ Fast (MongoDB text indexes are optimized)
- ✅ Accurate (semantic search with vector embeddings)
- ✅ Ranked (sorted by relevance score)
- ✅ Real-time (always up-to-date)
- ✅ Works behind firewall (MongoDB connection)

### ❌ Don't Use JSON for RAG

```python
# Hypothetical (WRONG):
import json
with open('prompts.json') as f:
    prompts = json.load(f)
    # How do we search? How do we rank? How do we do semantic search?
    # Would need to implement all of this client-side - inefficient!
```

---

## Performance Comparison

| Approach | Speed | Search Quality | Ranking | Real-Time | Works Behind Firewall |
|----------|-------|----------------|---------|-----------|----------------------|
| **MongoDB + Indexes** | ⚡⚡⚡⚡⚡ | ✅ Semantic | ✅ Scored | ✅ Yes | ✅ Yes |
| **JSON Files (public)** | ⚡⚡⚡⚡⚡ | ❌ Regex only | ❌ No scoring | ❌ 1hr stale | ❌ No |
| **JSON API Routes** | ⚡⚡⚡⚡ | ❌ Regex only | ❌ No scoring | ❌ 1hr stale | ✅ Yes |

---

## Future Migration Plan

### Phase 1: Add Authenticated JSON API Routes (Before Firewall Deployment)

**Create:**
- `/api/content/prompts` - Serve prompts.json (authenticated)
- `/api/content/patterns` - Serve patterns.json (authenticated)
- `/api/content/learning` - Serve learning.json (authenticated)

**Update clients:**
- Change `/data/prompts.json` → `/api/content/prompts`
- Add authentication headers
- Add caching headers (1 hour cache)

**Benefits:**
- ✅ Works behind firewall
- ✅ Still fast (static JSON)
- ✅ Low cost (no MongoDB query)
- ✅ Authenticated (RBAC ready)

### Phase 2: Keep MongoDB for RAG/Search

**RAG/Multi-Agent:**
- ✅ Continue using MongoDB `$text` search
- ✅ Continue using MongoDB `$vectorSearch`
- ✅ No changes needed (already works behind firewall)

---

## Hybrid Approach (If Needed)

If you want to reduce MongoDB queries, you could:

1. **Cache Layer:** Use JSON API for exact ID lookups, MongoDB for search
2. **Two-Tier Search:** 
   - Fast path: Filter JSON by category/role first
   - Search path: Use MongoDB for actual text/vector search on filtered subset
3. **Pre-filtering:** Load JSON API to get IDs, then query MongoDB only for those IDs

**But:** This adds complexity and MongoDB queries are already fast with indexes.

---

## Conclusion

**❌ Don't use JSON files for RAG/search systems**

**✅ Keep MongoDB for:**
- Full-text search (`$text`)
- Semantic search (`$vectorSearch`)
- Ranking/scoring (`textScore`, `vectorSearchScore`)
- Real-time data
- Works behind firewall

**✅ Use JSON API routes for:**
- UI display (future: authenticated API routes)
- Static content filtering
- Fast initial page loads
- Works behind firewall (authenticated)

**✅ Migration Path:**
1. **Now:** Keep `/public/data/*.json` (works for public)
2. **Before firewall:** Create `/api/content/*` routes (authenticated JSON serving)
3. **Always:** Keep MongoDB for RAG/search (requires search capabilities)

**The right tool for the right job:**
- **JSON API Routes = Fast, static display (authenticated)** ✅
- **MongoDB = Search, ranking, semantic search, real-time** ✅

**Cost Strategy:**
- ✅ JSON API routes = Free (static files, minimal processing)
- ✅ MongoDB for RAG = Low cost (indexed queries are fast, minimal reads)
- ✅ Both approaches scale to free tier limits

