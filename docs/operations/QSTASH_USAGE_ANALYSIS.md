# QStash Usage Analysis

## Current QStash Usage

### ✅ **ACTIVELY USED:**

1. **SendGrid Webhook Processing** (`src/app/api/webhooks/sendgrid/route.ts`)
   - Uses QStash to process email events asynchronously
   - Handles: delivered, opened, clicked, bounced, deferred events
   - **Required for**: Email event tracking

2. **Health Check** (`src/app/api/health/route.ts`)
   - Checks QStash availability
   - **Required for**: Monitoring

### ⚠️ **PREPARED BUT NOT ACTIVELY SCHEDULED:**

3. **Scheduled Jobs Service** (`src/lib/services/scheduledJobs.ts`)
   - Code exists but jobs are NOT automatically scheduled
   - Jobs defined:
     - Daily usage reports (`scheduleDailyUsageReport`)
     - Weekly analytics (`scheduleWeeklyAnalytics`)
     - Monthly analytics (`scheduleMonthlyAnalytics`)
     - Cleanup tasks (`scheduleCleanupTasks`)
     - Usage alerts check (`scheduleUsageAlertsCheck`)
   - **Status**: Infrastructure ready, but no cron triggers setup

4. **Message Queue Webhook** (`src/app/api/messaging/[queueName]/process/route.ts`)
   - Webhook endpoint exists for QStash messages
   - **Status**: Ready but not actively receiving messages

## Environment Variables Used

```bash
QSTASH_URL=https://qstash.upstash.io/v2  # Default
QSTASH_TOKEN=your-token                  # Required
QSTASH_WEBHOOK_URL=https://engify.ai/api/webhooks/qstash  # Optional
```

## Recommendation: **Keep QStash, Add Redis Separately**

### Option 1: New Account for Redis (Recommended)

- Create new Upstash account with `donlaur@engify.ai`
- Use for **Redis only** (auth cache)
- Keep existing account for **QStash** (email processing)

**Pros**:

- ✅ Free Redis tier for auth cache
- ✅ Keep QStash on existing account
- ✅ No code changes needed

**Cons**:

- Need to manage two accounts
- Two sets of credentials

### Option 2: Make QStash Optional

- If SendGrid webhook processing isn't critical → disable QStash
- Use new account for Redis only
- **Code already handles missing QStash gracefully** (health check returns "not configured")

**Pros**:

- Simpler - one account for Redis
- Can re-enable QStash later if needed

**Cons**:

- Lose async email event processing
- Need to handle SendGrid webhooks synchronously

## Code Changes Needed

### If Making QStash Optional:

1. **SendGrid Webhook** (`src/app/api/webhooks/sendgrid/route.ts`)
   - Currently queues events via QStash
   - Could process synchronously instead
   - **Impact**: Slower webhook response (but probably fine)

2. **Health Check** (`src/app/api/health/route.ts`)
   - Already handles missing QStash gracefully ✅
   - No changes needed

3. **Scheduled Jobs** (`src/lib/services/scheduledJobs.ts`)
   - Not actively running anyway
   - No changes needed

## Decision Matrix

| Scenario           | QStash Status    | Redis Status                      | Cost          | Complexity          |
| ------------------ | ---------------- | --------------------------------- | ------------- | ------------------- |
| **Keep both**      | Existing account | New account (`donlaur@engify.ai`) | $0/month      | Medium (2 accounts) |
| **Disable QStash** | Remove           | New account (`donlaur@engify.ai`) | $0/month      | Low (1 account)     |
| **Pay for both**   | Existing account | Same account upgrade              | ~$10-20/month | Low (1 account)     |

## Recommendation

**Create new Upstash account (`donlaur@engify.ai`) for Redis only:**

1. ✅ Keep existing QStash (used for SendGrid webhooks)
2. ✅ Get free Redis tier for auth cache
3. ✅ No code changes needed
4. ✅ Minimal complexity (just two accounts)

**Next Steps:**

1. Create Upstash account with `donlaur@engify.ai`
2. Create Redis database (free tier)
3. Add to Vercel integration
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars
5. Deploy

---

**Note**: QStash is actively used for SendGrid webhook processing. If you don't need async email event processing, you can disable QStash and use the new account for Redis only.
