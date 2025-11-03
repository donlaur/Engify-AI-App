# MongoDB Text Indexes - Production Deployment Guide

**Phase 1.4: Run MongoDB Text Indexes in Production**

## ⚠️ Critical: Text indexes are required for RAG chat functionality

Without text indexes, text search queries (`$text: { $search: ... }`) will fail.

---

## Quick Deployment (5 minutes)

### Option 1: Using Vercel Environment Variables (Recommended)

1. **Pull production environment variables:**
   ```bash
   cd /path/to/your/project
   vercel link
   vercel env pull .env.local
   ```

2. **Run the script:**
   ```bash
   tsx scripts/admin/ensure-text-indexes.ts
   ```

3. **Verify indexes were created:**
   ```bash
   tsx scripts/admin/verify-text-indexes.ts
   ```

### Option 2: Using MongoDB Atlas Connection String Directly

1. **Get MongoDB URI from Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy `MONGODB_URI` value

2. **Run the Atlas script:**
   ```bash
   tsx scripts/admin/ensure-text-indexes-atlas.ts "mongodb+srv://your-connection-string"
   ```

   Or set as environment variable:
   ```bash
   export MONGODB_URI="mongodb+srv://your-connection-string"
   tsx scripts/admin/ensure-text-indexes-atlas.ts
   ```

---

## What Gets Created

### 1. `prompts` Collection
- **Index Name:** `prompts_text_search`
- **Fields:** title, description, content, tags
- **Weights:** title (10), description (5), content (3), tags (2)
- **Critical for:** RAG chat search, prompt discovery

### 2. `patterns` Collection
- **Index Name:** `patterns_text_search`
- **Fields:** title, description, useCases, tags
- **Weights:** title (10), description (5), useCases (3), tags (2)
- **Critical for:** Pattern search functionality

### 3. `web_content` Collection
- **Index Name:** `web_content_text_search`
- **Fields:** title, content, excerpt, tags
- **Weights:** title (10), excerpt (5), content (3), tags (2)
- **Critical for:** General site search

---

## Expected Output

```
🔍 Ensuring text indexes for search...

📦 Database: engify

Creating text index on prompts collection...
✅ Prompts text index created

Creating text index on patterns collection...
✅ Patterns text index created

Creating text index on web_content collection...
✅ Web content text index created

📋 Current indexes:

prompts:
  🔍 prompts_text_search
  📌 _id_

patterns:
  🔍 patterns_text_search
  📌 _id_

web_content:
  🔍 web_content_text_search
  📌 _id_

✅ All text indexes ensured!

💡 To verify indexes, run: tsx scripts/admin/verify-text-indexes.ts
```

---

## Verification

After running the script, verify indexes exist:

```bash
tsx scripts/admin/verify-text-indexes.ts
```

Expected output:
```
✅ prompts: prompts_text_search exists
✅ patterns: patterns_text_search exists
✅ web_content: web_content_text_search exists

✅ All text indexes verified!
```

---

## Testing Text Search

After indexes are created, test RAG chat search:

1. **Via API:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "test search query"}'
   ```

2. **Via UI:**
   - Navigate to `/chat` page
   - Send a message that should trigger RAG search
   - Verify results are returned

---

## Troubleshooting

### "Index already exists"

✅ **This is fine!** The script handles duplicate indexes gracefully. If you see:
```
ℹ️  Prompts text index already exists (skipping)
```

This means the index is already created and working.

### "Connection timeout"

- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Check network connectivity

### "Authentication failed"

- Verify MongoDB credentials in environment variables
- Check database user permissions (needs `createIndex` permission)

### Text search still not working

1. **Verify indexes exist:**
   ```bash
   tsx scripts/admin/verify-text-indexes.ts
   ```

2. **Check MongoDB logs** for `$text` query errors

3. **Verify collection names match** (case-sensitive):
   - `prompts` (not `Prompts`)
   - `patterns` (not `Patterns`)
   - `web_content` (not `webContent`)

---

## Post-Deployment Checklist

- [ ] Text indexes created successfully
- [ ] Verification script passes
- [ ] RAG chat search works (`/api/chat`)
- [ ] Prompt search works (`/api/prompts?search=...`)
- [ ] No MongoDB errors in logs

---

## Related Documentation

- [MongoDB Text Indexes Setup](./MONGODB_TEXT_INDEXES_SETUP.md) - Local development setup
- [Database Indexes Audit](../../testing/DATABASE_INDEXES_AUDIT_DAY7.md) - Full index audit
- [RAG Chat Implementation](../../rag/RAG_CHAT_IMPROVEMENT_PLAN.md) - RAG functionality

---

## Next Steps

After indexes are created:
1. ✅ Text search functionality enabled
2. ✅ RAG chat can search prompts
3. ✅ Prompt library search works
4. ✅ Pattern discovery enabled

**Phase 1.4 Complete!** ✅

