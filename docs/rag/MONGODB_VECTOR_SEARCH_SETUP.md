# MongoDB Atlas Vector Search Index Setup Guide

## Step-by-Step Instructions

### 1. Navigate to Search Indexes

1. In MongoDB Atlas, go to your cluster
2. Click **"Browse Collections"** or **"Data Explorer"**
3. Select your database (`engify`)
4. Select your collection (`knowledge_base` or `prompts`)
5. Click the **"Search Indexes"** tab (next to "Find", "Indexes", etc.)

### 2. Create Vector Search Index

1. Click **"Create Search Index"**
2. Choose **"JSON Editor"** (not the visual builder)
3. Use this configuration:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      },
      "title": {
        "type": "string"
      },
      "content": {
        "type": "string"
      },
      "tags": {
        "type": "stringFacet"
      },
      "category": {
        "type": "stringFacet"
      }
    }
  }
}
```

### 3. Configure Index Settings

- **Index Name:** `vector_index` (or `rag_vector_index`)
- **Collection:** `knowledge_base` (or `prompts` if you want to search prompts)
- **Database:** `engify`

### 4. Review and Create

1. Review the configuration
2. Click **"Next"**
3. Click **"Create Search Index"**

### 5. Wait for Index Creation

- Index creation takes 1-5 minutes typically
- Status will show "Building" → "Active"
- You'll see a green checkmark when ready

## Important Notes

### Embedding Dimensions

**Current Setup:** 384 dimensions (matches `all-MiniLM-L6-v2`)

**If using OpenAI embeddings:**

- `text-embedding-3-small`: 1536 dimensions
- `text-embedding-3-large`: 3072 dimensions

**Update the config accordingly:**

```json
{
  "embedding": {
    "type": "knnVector",
    "dimensions": 1536, // For OpenAI text-embedding-3-small
    "similarity": "cosine"
  }
}
```

### Multiple Collections

You can create indexes on multiple collections:

- `knowledge_base` - For articles and documentation
- `prompts` - For searching prompts themselves

### Testing the Index

Once created, test with:

```javascript
// In MongoDB Atlas Aggregation Pipeline
[
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.1, 0.2, ...], // Your query embedding
      numCandidates: 100,
      limit: 5
    }
  }
]
```

## Troubleshooting

**"Index not found" error:**

- Wait for index to finish building (check status)
- Verify index name matches exactly
- Check you're querying the correct collection

**"Dimensions mismatch" error:**

- Verify embedding dimensions match index config
- Regenerate embeddings if needed
- Update index if you changed embedding models

**"No results" after indexing:**

- Check that documents have `embedding` field populated
- Verify embeddings are arrays of numbers (not strings)
- Check that `numCandidates` is high enough

## Next Steps After Index Creation

1. ✅ **Generate embeddings** for all documents
2. ✅ **Update documents** with embedding arrays
3. ✅ **Update Lambda** to use real embeddings instead of mock
4. ✅ **Test search quality** with sample queries

---

**Quick Reference:**

- Index Type: `knnVector`
- Similarity: `cosine` (best for text embeddings)
- Dimensions: 384 (current) or 1536 (OpenAI)
- Collection: `knowledge_base` or `prompts`
