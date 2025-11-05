# AI Models Database Sync Documentation

**Last Updated:** November 5, 2024  
**Status:** ✅ Active

---

## 📋 Overview

The AI Models sync system keeps your database up-to-date with the latest AI models from major providers (OpenAI, Anthropic, Google, Replicate). Models are synchronized with their official API code names, pricing, capabilities, and metadata.

---

## 🎯 Purpose

1. **Keep Models Current:** Automatically sync latest models from provider APIs
2. **Accurate Pricing:** Update cost-per-token pricing as providers change rates
3. **Metadata Management:** Track capabilities, context windows, and recommended models
4. **Deprecation Handling:** Mark old models as deprecated with replacement suggestions

---

## 🚀 Quick Start

### Option 1: Standalone Script (Recommended)

```bash
pnpm tsx scripts/db/sync-ai-models-latest.ts
```

**What it does:**
- Syncs OpenAI models (via API - requires `OPENAI_API_KEY`)
- Syncs Anthropic models (hardcoded list - no API key needed)
- Syncs Google models (hardcoded list - no API key needed)
- Updates database with latest models, pricing, and metadata

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║  AI Models Database Sync                                  ║
╚════════════════════════════════════════════════════════════╝

📊 Syncing OpenAI models...
   ✅ OpenAI: 8 created, 3 updated

📊 Syncing Anthropic models...
   ✅ Anthropic: 5 created, 2 updated

📊 Syncing Google models...
   ✅ Google: 6 created, 1 updated

═══════════════════════════════════════════════════════════
📊 Sync Summary
═══════════════════════════════════════════════════════════

   Total Created: 19
   Total Updated: 6
   Total Processed: 25

✅ Sync complete!
```

### Option 2: API Endpoint (Requires Super Admin)

```bash
POST /api/admin/ai-models/sync
Content-Type: application/json

{
  "provider": "openai" | "anthropic" | "google" | "all"
}
```

**RBAC:** Super Admin only  
**Audit Logged:** Yes (all syncs are logged for compliance)

**Example:**
```bash
# Sync all providers
curl -X POST https://your-domain.com/api/admin/ai-models/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"provider": "all"}'

# Sync only OpenAI
curl -X POST https://your-domain.com/api/admin/ai-models/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"provider": "openai"}'
```

---

## 📊 Supported Providers

### 1. OpenAI

**API:** ✅ Uses OpenAI API (`models.list()` endpoint)  
**Requires:** `OPENAI_API_KEY` environment variable  
**Models Synced:**
- `gpt-4o` - Latest GPT-4 optimized (recommended)
- `gpt-4o-mini` - Cheaper, faster version
- `gpt-4-turbo` - GPT-4 Turbo series
- `gpt-4` - Base GPT-4 models
- `gpt-3.5-turbo` - Legacy GPT-3.5
- `o1-preview`, `o1-mini` - Reasoning models (O-series)
- `o3-*`, `o4-*` - Future reasoning models

**What Gets Synced:**
- Model ID (exact API code name)
- Display name (formatted for UI)
- Context window (tokens)
- Max output tokens
- Pricing (input/output per 1K tokens)
- Capabilities (text, vision, code, etc.)
- Tags (smart, fast, latest, recommended, etc.)
- Tier (affordable, premium)

**Special Handling:**
- Filters to only GPT and O-series models
- Detects vision capabilities automatically
- Marks GPT-4o (non-mini) as recommended
- Sets tier based on pricing

### 2. Anthropic

**API:** ❌ No public API (hardcoded list)  
**Requires:** No API key needed  
**Models Synced:**
- `claude-3-5-sonnet-20241022` - Latest Claude 3.5 Sonnet ⭐ Recommended
- `claude-3-5-haiku-20241022` - Latest Claude 3.5 Haiku ⭐ Recommended
- `claude-3-opus-20240229` - Most capable (expensive)
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fastest, cheapest

**What Gets Synced:**
- Model ID (exact API code name)
- Display name
- Context window (200K tokens for all)
- Max output tokens (8192 for Sonnet/Opus, 4096 for Haiku)
- Pricing (input/output per 1K tokens)
- Capabilities (text, vision)
- Tags (smart, latest, balanced, fast, affordable, etc.)
- Tier (affordable for Haiku, premium for others)

**Pricing (as of Nov 2024):**
- Claude 3.5 Sonnet: $3/$15 per 1M tokens
- Claude 3.5 Haiku: $0.25/$1.25 per 1M tokens
- Claude 3 Opus: $15/$75 per 1M tokens
- Claude 3 Sonnet: $3/$15 per 1M tokens
- Claude 3 Haiku: $0.25/$1.25 per 1M tokens

### 3. Google (Gemini)

**API:** ❌ No public API (hardcoded list)  
**Requires:** No API key needed  
**Models Synced:**
- `gemini-2.0-flash-exp` - Latest experimental ⭐ Recommended
- `gemini-1.5-pro` - Stable Pro model
- `gemini-1.5-flash` - Stable Flash model
- `gemini-1.5-flash-8b` - 8B parameter version
- `gemini-pro` - Legacy Pro model
- `gemini-pro-vision` - Legacy Vision model

**What Gets Synced:**
- Model ID (exact API code name)
- Display name
- Context window (1M tokens for most)
- Max output tokens (8192)
- Pricing (input/output per 1K tokens)
- Capabilities (text, vision)
- Tags (fast, multimodal)
- Tier (free for 2.0 experimental, affordable for others)

**Pricing (as of Nov 2024):**
- Gemini 2.0 Flash Experimental: FREE (during experimental phase)
- Gemini 1.5 Pro: $1.25/$5 per 1M tokens
- Gemini 1.5 Flash: $0.075/$0.30 per 1M tokens

### 4. Replicate

**API:** ✅ Uses Replicate API (via dedicated endpoint)  
**Requires:** `REPLICATE_API_TOKEN` environment variable  
**Models Synced:**
- Popular models hosted on Replicate
- Includes Claude 4.5 series (via Replicate)
- Includes GPT-5 (if available)
- Includes Meta Llama models

**Endpoint:** `/api/admin/ai-models/sync/replicate`

---

## 🔧 Configuration

### Environment Variables

**Required for OpenAI Sync:**
```bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

**Required for Replicate Sync:**
```bash
REPLICATE_API_TOKEN=r8_...  # Your Replicate API token
```

**Optional:**
```bash
# MongoDB connection (required for database operations)
MONGODB_URI=mongodb+srv://...

# For API endpoint authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
```

---

## 📝 Database Schema

Models are stored in the `ai_models` collection with this schema:

```typescript
{
  id: string;                    // Model ID (e.g., "gpt-4o")
  provider: 'openai' | 'anthropic' | 'google' | 'replicate';
  name: string;                  // Same as ID (for compatibility)
  displayName: string;           // Formatted name (e.g., "GPT-4o")
  status: 'active' | 'deprecated';
  capabilities: string[];        // ['text', 'vision', 'code', etc.]
  contextWindow: number;         // Max context tokens
  maxOutputTokens: number;       // Max output tokens
  costPer1kInputTokens: number;  // USD per 1K input tokens
  costPer1kOutputTokens: number; // USD per 1K output tokens
  inputCostPer1M: number;         // USD per 1M input tokens
  outputCostPer1M: number;        // USD per 1M output tokens
  supportsStreaming: boolean;
  supportsJSON: boolean;
  supportsVision: boolean;
  recommended: boolean;          // Marked as recommended model
  tier: 'free' | 'affordable' | 'premium';
  isAllowed: boolean;            // Whether model is allowed for use
  tags: string[];                // ['smart', 'fast', 'latest', etc.]
  lastVerified: Date;            // Last time we verified this model works
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔄 Sync Process Details

### How It Works

1. **OpenAI Sync:**
   - Fetches models from `openai.models.list()` API
   - Filters to GPT and O-series models
   - Maps each model to database schema
   - Calculates pricing based on model ID patterns
   - Sets capabilities based on model features
   - Bulk upserts to database

2. **Anthropic Sync:**
   - Uses hardcoded list (no public API available)
   - Maps each model to database schema
   - Uses pricing lookup functions
   - Bulk upserts to database

3. **Google Sync:**
   - Uses hardcoded list (no public API available)
   - Maps each model to database schema
   - Uses pricing lookup functions
   - Bulk upserts to database

4. **Replicate Sync:**
   - Calls dedicated Replicate sync endpoint
   - Syncs popular models from Replicate registry
   - Handles Replicate-specific model IDs

### Upsert Logic

- **Create:** If model ID doesn't exist, creates new record
- **Update:** If model ID exists, updates all fields
- **Preserve:** Maintains `_id` field for existing records
- **Timestamp:** Updates `updatedAt` on every sync

---

## 💰 Pricing Updates

Pricing is automatically calculated based on model ID patterns:

### OpenAI Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| GPT-4o Mini | $0.00015 | $0.0006 |
| GPT-4o | $0.0025 | $0.01 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-4 | $0.03 | $0.06 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |
| O-series (o1, o3, o4) | $0.015 | $0.06 |

### Anthropic Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 Haiku | $0.00025 | $0.00125 |
| Claude 3.5 Sonnet | $0.003 | $0.015 |
| Claude 3 Haiku | $0.00025 | $0.00125 |
| Claude 3 Sonnet | $0.003 | $0.015 |
| Claude 3 Opus | $0.015 | $0.075 |

### Google Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| Gemini 2.0 Flash Exp | FREE | FREE |
| Gemini 1.5 Flash | $0.000075 | $0.0003 |
| Gemini 1.5 Pro | $0.00125 | $0.005 |

**Note:** Pricing is updated in code, not fetched from APIs. Update pricing functions when providers change rates.

---

## 🏷️ Model Tags

Models are automatically tagged based on features:

**OpenAI Tags:**
- `smart` - High-quality models
- `fast` - Fast response times
- `latest` - Latest generation models
- `recommended` - Recommended for most use cases
- `affordable` - Cost-effective options
- `expensive` - Premium pricing
- `multimodal` - Supports vision/images
- `reasoning` - Advanced reasoning capabilities

**Anthropic Tags:**
- `smart` - High-quality models
- `latest` - Latest generation (3.5 series)
- `balanced` - Balanced performance/cost
- `recommended` - Recommended for most use cases
- `fast` - Fast response times
- `affordable` - Cost-effective (Haiku)
- `expensive` - Premium pricing (Opus)
- `highest-quality` - Best quality available

**Google Tags:**
- `fast` - Fast response times
- `multimodal` - Supports vision/images

---

## ⚠️ Important Notes

### Model ID Format

Model IDs must match exactly what the provider APIs expect:

- ✅ **Correct:** `gpt-4o`, `claude-3-5-sonnet-20241022`
- ❌ **Wrong:** `GPT-4o`, `claude-3.5-sonnet`

### Deprecation Handling

When providers deprecate models:
1. Mark `status: 'deprecated'`
2. Set `replacementModel` field
3. Keep model in database for historical records
4. Update replacement recommendations in UI

### Pricing Updates

Pricing is hardcoded in helper functions. When providers change prices:
1. Update `getOpenAICost()`, `getAnthropicCost()`, `getGoogleCost()`
2. Update comments with date
3. Re-run sync to update database

---

## 🔍 Verification

After syncing, verify models are correct:

```bash
# Check MongoDB
mongosh mongodb+srv://...
use engify
db.ai_models.find({ provider: 'openai', status: 'active' }).pretty()

# Or use the admin UI
# Navigate to: /opshub/ai-models
```

---

## 🐛 Troubleshooting

### OpenAI Sync Fails

**Error:** `OPENAI_API_KEY not set`

**Solution:**
```bash
# Add to .env.local
OPENAI_API_KEY=sk-your-key-here
```

### Models Not Updating

**Error:** Sync runs but models don't change

**Solution:**
1. Check MongoDB connection
2. Verify `ai_models` collection exists
3. Check for database permission issues
4. Review sync logs for errors

### Pricing Incorrect

**Error:** Pricing doesn't match provider website

**Solution:**
1. Check provider pricing page
2. Update pricing functions in sync script
3. Re-run sync
4. Verify pricing in database

### Missing Models

**Error:** Some models not showing up

**Solution:**
1. Check filter logic (e.g., `filter((m) => m.id.includes('gpt'))`)
2. Verify model IDs match provider format
3. Check for typos in hardcoded lists
4. Review sync logs

---

## 📚 Related Documentation

- **AI Models Configuration:** `src/lib/config/ai-models.ts`
- **AI Model Schema:** `src/lib/db/schemas/ai-model.ts`
- **AI Model Service:** `src/lib/services/AIModelService.ts`
- **Sync API Route:** `src/app/api/admin/ai-models/sync/route.ts`
- **Replicate Sync:** `src/app/api/admin/ai-models/sync/replicate/route.ts`

---

## 🔄 Maintenance Schedule

**Recommended:** Run sync monthly or when:
- New models are released
- Pricing changes occur
- Provider deprecates models
- Starting new audit/enrichment cycle

**Automated:** Can be scheduled via cron or GitHub Actions:
```bash
# Example cron (runs first Monday of each month)
0 0 1 * * cd /path/to/app && pnpm tsx scripts/db/sync-ai-models-latest.ts
```

---

## ✅ Checklist

Before running sync:
- [ ] `OPENAI_API_KEY` set (for OpenAI sync)
- [ ] `REPLICATE_API_TOKEN` set (for Replicate sync)
- [ ] MongoDB connection working
- [ ] Database permissions verified
- [ ] Backup database (optional but recommended)

After running sync:
- [ ] Verify models count matches expectations
- [ ] Check pricing is correct
- [ ] Verify recommended flags are set
- [ ] Test one model from each provider
- [ ] Update documentation if models changed

---

**Last Updated:** November 5, 2024  
**Maintained By:** Engify AI Team  
**Questions?** Check `docs/integrations/` or contact team lead

