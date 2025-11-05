# Cost Calculation from Database

**Status:** ✅ **Implemented**

All AI adapters now calculate costs using pricing from the `ai_models` database collection instead of hardcoded values.

## Changes Made

### 1. Created Model Cost Utility (`src/lib/ai/utils/model-cost.ts`)

- `getModelCost()` - Retrieves pricing from database, falls back to static config
- `calculateCostFromDB()` - Calculates cost using database pricing
- `calculateCostFromModelRegistry()` - Sync version for cached lookups

### 2. Updated All AI Adapters

All adapters now use database pricing:

- ✅ `OpenAIAdapter` - Uses `calculateCostFromDB()`
- ✅ `ClaudeAdapter` - Uses `calculateCostFromDB()`
- ✅ `GroqAdapter` - Uses `calculateCostFromDB()`
- ✅ `GeminiAdapter` - Uses `calculateCostFromDB()`

### 3. Database Schema

The `ai_models` collection already has these fields:
- `costPer1kInputTokens` - Cost per 1,000 input tokens
- `costPer1kOutputTokens` - Cost per 1,000 output tokens
- `inputCostPer1M` - Cost per 1 million input tokens (auto-calculated)
- `outputCostPer1M` - Cost per 1 million output tokens (auto-calculated)

## How It Works

1. **Cost Lookup**: When calculating cost, adapters call `calculateCostFromDB(modelId, promptTokens, completionTokens)`
2. **Database First**: Utility tries to get pricing from `ai_models` collection
3. **Fallback**: If database unavailable, falls back to `src/lib/config/ai-models.ts`
4. **Calculation**: Uses `costPer1kInputTokens` and `costPer1kOutputTokens` from database

## Benefits

- ✅ **Single Source of Truth**: Pricing comes from database
- ✅ **Dynamic Updates**: Update pricing in database without code changes
- ✅ **Fallback**: Still works if database unavailable
- ✅ **Accurate**: Token usage tracking now uses actual database prices

## Example Usage

```typescript
import { calculateCostFromDB } from '@/lib/ai/utils/model-cost';

const cost = await calculateCostFromDB(
  'gpt-4o',
  2000,  // input tokens
  1500   // output tokens
);

console.log(cost);
// { input: 0.005, output: 0.015, total: 0.02 }
```

## Verification

To verify costs are coming from database:

```bash
# Check database has cost fields
pnpm tsx -e "import { getMongoDb } from './src/lib/db/mongodb'; (async () => { const db = await getMongoDb(); const model = await db.collection('ai_models').findOne({ id: 'gpt-4o' }); console.log('Cost:', model.costPer1kInputTokens, model.costPer1kOutputTokens); })()"
```

## Related Files

- `src/lib/ai/utils/model-cost.ts` - Cost calculation utility
- `src/lib/ai/v2/adapters/*` - Updated adapters
- `src/lib/db/schemas/ai-model.ts` - Database schema
- `scripts/db/sync-ai-models-from-config.ts` - Sync script

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Complete - All adapters use database pricing
