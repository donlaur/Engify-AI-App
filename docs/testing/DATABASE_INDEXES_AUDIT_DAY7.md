# Database Indexes Audit - Day 7

**Date:** November 2, 2025  
**Branch:** `feature/day-7-qa-improvements`  
**Type:** Analysis Only (No Code Changes)  
**Related:** Task #23 from Day 7 Plan

---

## Executive Summary

This audit reviews MongoDB indexes required for optimal query performance. Identifies existing indexes, missing indexes, and provides recommendations for production optimization.

**Key Findings:**
- ✅ **Good:** Text indexes scripts exist for RAG search
- ✅ **Good:** Multiple index creation scripts available
- ⚠️  **Concern:** Need to verify indexes exist in production
- ⚠️  **Opportunity:** Additional indexes may improve query performance

---

## 1. Current Index Configuration

### 1.1 Text Indexes (RAG Search)

**Scripts Available:**
- `scripts/admin/ensure-text-indexes.ts` - Local development
- `scripts/admin/ensure-text-indexes-atlas.ts` - Production Atlas

**Collections with Text Indexes:**

#### Prompts Collection
```typescript
{
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
}
```
- **Name:** `prompts_text_search`
- **Weights:** title: 10, description: 5, content: 3, tags: 2
- **Purpose:** RAG chat search, prompt discovery

#### Patterns Collection
```typescript
{
  title: 'text',
  description: 'text',
  useCases: 'text',
  tags: 'text'
}
```
- **Name:** `patterns_text_search`
- **Weights:** title: 10, description: 5, useCases: 3, tags: 2
- **Purpose:** Pattern search

#### Web Content Collection
```typescript
{
  title: 'text',
  content: 'text',
  excerpt: 'text',
  tags: 'text'
}
```
- **Name:** `web_content_text_search`
- **Weights:** title: 10, excerpt: 5, content: 3, tags: 2
- **Purpose:** General content search

---

### 1.2 Prompt-Specific Indexes

**Script:** `scripts/db/create-prompt-indexes.ts`

**Single Field Indexes:**
- `category` - Category filtering
- `role` - Role filtering
- `isPublic` - Public/private filtering
- `createdAt` - Sorting by date
- `updatedAt` - Sorting by updates

**Compound Indexes:**
- `{ category: 1, role: 1 }` - Category + role queries
- `{ isPublic: 1, tags: 1 }` - Public prompts by tag

**Text Index:**
- `{ title: 'text', description: 'text', content: 'text' }`

---

## 2. Query Analysis - Missing Indexes

### 2.1 Users Collection

**Common Queries:**
- Find by email: `{ email: 1 }` ✅ (likely exists via unique constraint)
- Find by role: `{ role: 1 }` ⚠️ (may need index)
- Find by organization: `{ organizationId: 1 }` ⚠️ (may need index)
- Find by favorites: `{ favoritePrompts: 1 }` ⚠️ (may need index)

**Recommendations:**
- Add index on `role` if filtering by role is common
- Add index on `organizationId` for multi-tenant queries
- Add compound index: `{ organizationId: 1, role: 1 }`

---

### 2.2 Prompts Collection

**Common Queries:**
- Find by category: `{ category: 1 }` ✅ (exists)
- Find by role: `{ role: 1 }` ✅ (exists)
- Find public prompts: `{ isPublic: 1 }` ✅ (exists)
- Sort by createdAt: `{ createdAt: -1 }` ✅ (exists)
- Find by tags: `{ tags: 1 }` ⚠️ (may need index)

**Additional Recommendations:**
- Compound index: `{ category: 1, role: 1, isPublic: 1 }` - Common filter combo
- Compound index: `{ isPublic: 1, createdAt: -1 }` - Public prompts by date
- Index on `userId` if users query their own prompts

---

### 2.3 Patterns Collection

**Common Queries:**
- Find by category: `{ category: 1 }` ⚠️ (may need index)
- Find by difficulty: `{ difficulty: 1 }` ⚠️ (may need index)
- Sort by popularity: `{ usageCount: -1 }` ⚠️ (may need index)

**Recommendations:**
- Add index on `category`
- Add index on `difficulty`
- Add compound index: `{ category: 1, difficulty: 1 }`

---

### 2.4 API Routes Needing Indexes

**`/api/stats` Route:**
- Aggregates prompts by category, role
- **Indexes needed:** ✅ (category, role indexes exist)

**`/api/prompts` Route:**
- Filters by category, role, isPublic
- **Indexes needed:** ✅ (compound index recommended)

**`/api/users/favorites` Route:**
- Finds prompts by ID array
- **Indexes needed:** ✅ (`_id` index exists by default)

**`/api/manager/dashboard` Route:**
- Aggregates team data
- **Indexes needed:** ⚠️ (may need `teamId` index)

---

## 3. Critical Indexes for Production

### 3.1 Must-Have Indexes

1. **Text Indexes** (RAG Search) ✅
   - `prompts_text_search`
   - `patterns_text_search`
   - `web_content_text_search`
   - **Status:** Scripts exist, need to verify in production

2. **Prompt Filtering** ✅
   - `category`
   - `role`
   - `isPublic`
   - **Status:** Scripts exist, need to verify

3. **User Authentication** ✅
   - `email` (unique)
   - **Status:** Likely exists via unique constraint

---

### 3.2 Should-Have Indexes

1. **Compound Indexes for Common Queries**
   - `{ category: 1, role: 1, isPublic: 1 }` - Prompt filtering
   - `{ organizationId: 1, role: 1 }` - Multi-tenant queries
   - `{ isPublic: 1, createdAt: -1 }` - Public prompts by date

2. **Performance Indexes**
   - `userId` on prompts collection
   - `teamId` on users collection
   - `tags` on prompts collection

---

## 4. Production Verification Checklist

### 4.1 Verify Text Indexes Exist

**Command:**
```bash
# Run text indexes script
tsx scripts/admin/ensure-text-indexes-atlas.ts "mongodb+srv://..."
```

**Expected Output:**
- ✅ Prompts text index created/exists
- ✅ Patterns text index created/exists
- ✅ Web content text index created/exists

**Manual Verification:**
```javascript
// In MongoDB shell or Compass
db.prompts.getIndexes()
db.patterns.getIndexes()
db.web_content.getIndexes()
```

---

### 4.2 Verify Query Performance

**Slow Query Log Analysis:**
- Check MongoDB logs for slow queries (>100ms)
- Identify queries without indexes
- Add indexes for slow queries

**Explain Plans:**
```javascript
// Test query performance
db.prompts.find({ category: "testing", role: "engineer" }).explain("executionStats")
```

---

## 5. Recommendations

### 5.1 Immediate Actions

1. **Run Text Indexes Script** (5 min)
   - Execute `scripts/admin/ensure-text-indexes-atlas.ts` in production
   - Verify indexes created successfully
   - **Priority:** HIGH - Required for RAG chat

2. **Verify Existing Indexes** (15 min)
   - List all indexes in production
   - Compare with expected indexes
   - Document missing indexes

---

### 5.2 Short-Term Actions

3. **Add Compound Indexes** (30 min)
   - Create compound indexes for common query patterns
   - Monitor query performance improvement
   - **Priority:** MEDIUM - Performance optimization

4. **Index Audit Script** (1 hour)
   - Create script to audit all indexes
   - Compare production vs. expected indexes
   - Generate report of missing indexes

---

### 5.3 Long-Term Actions

5. **Performance Monitoring** (2 hours)
   - Set up MongoDB slow query logging
   - Monitor index usage statistics
   - Identify unused indexes

6. **Index Documentation** (1 hour)
   - Document all indexes and their purposes
   - Create index maintenance guide
   - Add to operations runbook

---

## 6. Index Maintenance

### 6.1 Regular Tasks

- **Monthly:** Review slow query log
- **Quarterly:** Audit index usage
- **As Needed:** Add indexes for new query patterns

### 6.2 Index Cleanup

**Unused Indexes:**
- Monitor index usage statistics
- Remove indexes that aren't used
- Reduces write overhead

**Example:**
```javascript
// Check index usage
db.prompts.aggregate([
  { $indexStats: {} }
])
```

---

## 7. Related Documentation

- `scripts/admin/ensure-text-indexes.ts` - Text indexes script
- `scripts/admin/ensure-text-indexes-atlas.ts` - Production script
- `scripts/db/create-prompt-indexes.ts` - Prompt indexes script
- `docs/rag/MONGODB_VECTOR_SEARCH_SETUP.md` - RAG setup guide

---

## 8. Summary

### Current Status

- ✅ **Text Indexes:** Scripts exist, need production verification
- ✅ **Basic Indexes:** Scripts exist for prompts collection
- ⚠️  **Compound Indexes:** May need additional indexes
- ⚠️  **Production:** Need to verify indexes exist

### Next Steps

1. **Run text indexes script in production** (Task #23)
2. **Verify indexes exist**
3. **Add compound indexes for common queries**
4. **Monitor query performance**

---

**Report Generated:** 2025-11-02  
**Analysis Type:** Code Review + Script Analysis  
**Code Changes:** None (Analysis Only)  
**Action Required:** Run text indexes script in production

