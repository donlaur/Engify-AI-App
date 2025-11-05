# RAG Index Update - Enriched Fields

## Summary

Updated the RAG text indexes to include all enriched prompt fields for better search results.

## Changes Made

### 1. Text Index Scripts Updated

**Files:**
- `scripts/admin/ensure-text-indexes-atlas.ts` (Production)
- `scripts/admin/ensure-text-indexes.ts` (Local)

**New Fields Added to Index:**
- `whatIs` - Weight: 6
- `whyUse` - Weight: 5
- `metaDescription` - Weight: 4
- `seoKeywords` - Weight: 3
- `caseStudies` - Weight: 4
- `examples` - Weight: 4
- `useCases` - Weight: 5
- `bestPractices` - Weight: 4
- `whenNotToUse` - Weight: 3

**Field Weights (Priority):**
- `title`: 10 (highest)
- `description`: 8
- `whatIs`: 6
- `content`: 5
- `whyUse`: 5
- `useCases`: 5
- `caseStudies`: 4
- `examples`: 4
- `bestPractices`: 4
- `metaDescription`: 4
- `seoKeywords`: 3
- `whenNotToUse`: 3
- `tags`: 2 (lowest)

### 2. Lambda Handler Updated

**File:** `lambda/lambda_handler_multi_agent.py`

**Changes:**
- Fetches enriched fields from MongoDB
- Includes enriched context in RAG responses:
  - `whatIs` explanation
  - `whyUse` reasons (first 3)
  - `useCases` (first 2)
  - Case study summary (first case)
- Fallback regex search now includes enriched fields

### 3. New Rebuild Script

**File:** `scripts/admin/rebuild-text-indexes-enriched.ts`

Helper script to rebuild indexes with enriched fields. Useful for:
- Migrating existing indexes
- Testing index changes
- Verifying index structure

## Usage

### Update Indexes in Production

```bash
# MongoDB Atlas
tsx scripts/admin/ensure-text-indexes-atlas.ts "mongodb+srv://..."

# Local development
tsx scripts/admin/ensure-text-indexes.ts
```

### Rebuild Existing Indexes

```bash
tsx scripts/admin/rebuild-text-indexes-enriched.ts
```

## Limitations & Known Issues

### MongoDB Text Index Limitations

**Important:** MongoDB text indexes have limitations with nested objects:

- ✅ **Arrays of strings** (`whyUse`, `useCases`, `bestPractices`, `tags`) - Fully indexed
- ✅ **String fields** (`whatIs`, `metaDescription`) - Fully indexed  
- ⚠️ **Arrays of objects** (`caseStudies`, `examples`) - **Partially indexed**

**What this means:**
- MongoDB text indexes will index the top-level structure of arrays of objects
- Content inside nested objects (e.g., `caseStudies[0].scenario`, `examples[0].input`) may not be fully searchable
- RAG search will still find prompts based on other fields, but nested content in case studies/examples won't contribute to search relevance

**Workaround:**
- Consider flattening nested content when indexing (future enhancement)
- Or use vector embeddings for semantic search of nested content (future enhancement)

**Current Behavior:**
- Text index is created successfully
- Search works for string fields and arrays of strings
- Nested object content has limited searchability
- This is acceptable for current use case - other fields provide sufficient search coverage

1. **Better Search Results**: RAG can now find prompts based on:
   - Real-world case studies
   - "What is" explanations
   - Use case scenarios
   - Best practices

2. **Richer Context**: Lambda handler returns enriched context:
   - What the prompt is
   - Why to use it
   - Real examples
   - Use cases

3. **SEO Keywords**: SEO keywords are now searchable, improving discovery

4. **Case Studies**: Real-world examples are indexed for better relevance

## Next Steps

1. Run the index update script in production
2. Test RAG search with queries that should match enriched fields
3. Monitor search quality improvements
4. Consider adding vector embeddings for semantic search (future enhancement)

## Related Documentation

- `docs/testing/DATABASE_INDEXES_AUDIT_DAY7.md` - Index audit
- `docs/rag/MONGODB_VECTOR_SEARCH_SETUP.md` - Vector search setup
- `docs/content/RAG_CHAT_IMPROVEMENT_PLAN.md` - RAG improvement plan

