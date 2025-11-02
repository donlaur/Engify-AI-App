# MongoDB Text Indexes Setup

## Quick Setup - Pull from Vercel

Run these commands in your terminal:

```bash
cd /Users/donlaur/.cursor/worktrees/Engify-AI-App/VLhSW

# Link to Vercel project (answer Yes)
vercel link

# Pull environment variables
vercel env pull .env.local

# Run the text indexes script
tsx scripts/admin/ensure-text-indexes.ts
```

---

## Alternative: Use MongoDB Atlas Connection String Directly

If you prefer not to link Vercel, you can run directly with your connection string:

```bash
tsx scripts/admin/ensure-text-indexes-atlas.ts "mongodb+srv://your-connection-string"
```

Or set it as an environment variable:

```bash
export MONGODB_URI="mongodb+srv://your-connection-string"
tsx scripts/admin/ensure-text-indexes-atlas.ts
```

---

## What This Does

Creates text indexes on 3 collections for full-text search:

### 1. `prompts` collection

- Fields: title, description, content, tags
- Weights: title (10), description (5), content (3), tags (2)
- **Critical for:** RAG chat search functionality

### 2. `patterns` collection

- Fields: title, description, useCases, tags
- Weights: title (10), description (5), useCases (3), tags (2)
- **Critical for:** Pattern search and discovery

### 3. `web_content` collection

- Fields: title, content, excerpt, tags
- Weights: title (10), excerpt (5), content (3), tags (2)
- **Critical for:** General site search

---

## Expected Output

```
🔍 Ensuring text indexes for search...

Creating text index on prompts collection...
✅ Prompts text index created

Creating text index on patterns collection...
✅ Patterns text index created

Creating text index on web_content collection...
✅ Web content text index created

📋 Current indexes:

prompts:
  - _id_
  - prompts_text_search

patterns:
  - _id_
  - patterns_text_search

web_content:
  - _id_
  - web_content_text_search

✅ All text indexes ensured!
```

---

## Troubleshooting

### "Index already exists"

If you see errors about indexes already existing, that's fine! The Atlas version script (`ensure-text-indexes-atlas.ts`) handles this gracefully.

### "Cannot find module 'dotenv'"

You need to install dependencies first:

```bash
pnpm install
```

### "Connection refused"

Check your MongoDB Atlas connection string:

- Is the IP allowlist configured? (Add `0.0.0.0/0` for all IPs)
- Is the database user password correct?
- Is the cluster running?

---

## After Running

Once complete, your RAG chat and search functionality will work properly. The indexes enable:

- ✅ Fast full-text search across prompts
- ✅ Weighted results (titles ranked higher)
- ✅ Multi-field search (search across title, description, content, tags)
- ✅ Language-aware search (English stemming and stop words)

---

**Status:** Ready to run  
**Time Required:** < 1 minute  
**Risk:** Low (idempotent - safe to run multiple times)
