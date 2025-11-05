# Index Recreation Window - Solution

**Date:** 2025-11-05  
**Status:** ✅ Fixed

---

## Problem

When dropping and recreating text indexes, there's a window where `$text` queries fail, causing:
- RAG search failures during index recreation
- Lambda handlers throwing errors
- No graceful fallback during index recreation

---

## Solution Implemented

### 1. Enhanced Lambda Fallback ✅

**Location:** `lambda/lambda_handler_multi_agent.py`

**Changes:**
- ✅ Detects text index errors specifically (not just generic exceptions)
- ✅ Checks for common index error patterns:
  - "text index" errors
  - "no text index" errors
  - "index not found" errors
  - MongoDB error code 27
- ✅ Automatically falls back to regex search when index errors detected
- ✅ Includes flattened text fields (`caseStudiesText`, `examplesText`) in fallback search

**Result:** Lambda handler gracefully handles index recreation downtime.

### 2. Safe Index Update Script ✅

**Location:** `scripts/admin/safe-update-text-indexes.ts`

**Features:**
- ✅ Checks index health before updating
- ✅ Only recreates indexes if unhealthy or missing
- ✅ `--check-only` mode for health checks
- ✅ `--force` flag to force recreation
- ✅ Provides clear status messages

**Usage:**
```bash
# Check health only
tsx scripts/admin/safe-update-text-indexes.ts --check-only

# Safe update (only if unhealthy)
tsx scripts/admin/safe-update-text-indexes.ts

# Force recreation
tsx scripts/admin/safe-update-text-indexes.ts --force
```

### 3. Cron Job for Health Monitoring ✅

**Location:** `src/app/api/cron/update-text-indexes/route.ts` + `vercel.json`

**Features:**
- ✅ Daily health check at 2 AM UTC
- ✅ Checks if indexes exist and are healthy
- ✅ Logs health status
- ✅ Can trigger updates if needed (manual execution)

**Schedule:** `0 2 * * *` (Daily at 2 AM UTC - low traffic time)

**Cost:** 
- ✅ **FREE** - Vercel Cron included in Pro plan
- ✅ Minimal execution time (~1-2 seconds)
- ✅ No database writes (read-only health check)

---

## How It Works

### During Normal Operation

1. Lambda handler uses `$text` search (fast, indexed)
2. If index is healthy → fast results
3. Fallback regex search is ready but not used

### During Index Recreation

1. Script drops old index → `$text` queries start failing
2. Lambda handler detects index error → switches to fallback
3. Fallback regex search continues working → no downtime
4. New index created → `$text` queries resume
5. Lambda handler automatically uses `$text` again

### Cron Health Check

1. Runs daily at 2 AM UTC (low traffic)
2. Checks if indexes exist and respond
3. Logs health status for monitoring
4. If unhealthy → alerts logged (manual intervention needed)

---

## Cost Analysis

### Vercel Cron Job

- ✅ **FREE** - Included in Vercel Pro plan
- ✅ Execution time: ~1-2 seconds
- ✅ Database queries: Read-only (minimal cost)
- ✅ Frequency: Once per day
- ✅ Monthly cost: $0

### Index Recreation

- ✅ **FREE** - MongoDB Atlas operation (no cost)
- ✅ Frequency: Rare (only when schema changes)
- ✅ Duration: 1-5 minutes typically
- ✅ Downtime: None (fallback handles it)

**Total Cost: $0** ✅

---

## When Index Updates Are Needed

**Index updates are RARE** - only needed when:
1. Adding new fields to text index (e.g., new enriched fields)
2. Changing index weights
3. Fixing corrupted indexes
4. Schema changes

**Normal operation:** Indexes stay healthy and don't need recreation.

---

## Monitoring

### Health Check Logs

Check Vercel Cron logs:
```
Dashboard → Cron Jobs → update-text-indexes → View logs
```

**Expected output:**
```json
{
  "success": true,
  "mode": "check-only",
  "health": {
    "prompts": { "exists": true, "healthy": true },
    "patterns": { "exists": true, "healthy": true },
    "allHealthy": true
  }
}
```

### Lambda Fallback Usage

Monitor Lambda logs for fallback activations:
```
Search for: "Text index unavailable" or "using fallback search"
```

**If you see frequent fallback usage:**
- Index may be unhealthy
- Run health check script
- Consider recreating index

---

## Manual Index Update Process

If cron detects unhealthy index:

1. **Check health:**
   ```bash
   tsx scripts/admin/safe-update-text-indexes.ts --check-only
   ```

2. **Update if needed:**
   ```bash
   tsx scripts/admin/safe-update-text-indexes.ts
   ```

3. **Verify:**
   ```bash
   tsx scripts/admin/safe-update-text-indexes.ts --check-only
   ```

**Note:** During update, Lambda handler automatically uses fallback - no downtime!

---

## Benefits

1. ✅ **Zero Downtime** - Fallback handles index recreation
2. ✅ **Low Cost** - Cron is free, health checks are cheap
3. ✅ **Automatic** - Cron monitors health daily
4. ✅ **Safe** - Only updates when needed
5. ✅ **Observable** - Logs show health status

---

## Related Files

- `lambda/lambda_handler_multi_agent.py` - Enhanced fallback logic
- `scripts/admin/safe-update-text-indexes.ts` - Safe update script
- `src/app/api/cron/update-text-indexes/route.ts` - Cron endpoint
- `vercel.json` - Cron schedule
- `scripts/admin/ensure-text-indexes-atlas.ts` - Index creation script

