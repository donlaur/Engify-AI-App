# QStash Setup Guide - Stats Update Cron

This guide explains how to set up Upstash QStash to automatically update platform stats in Redis cache every hour.

---

## 🎯 Overview

**Problem**: Role pages were hitting MongoDB during build time, causing timeouts and failed builds.

**Solution**: Use QStash to update stats in Redis hourly. Role pages read from Redis (fast, no timeout).

**Flow**:
```
QStash (hourly) → /api/cron/update-stats → MongoDB → Redis Cache
                                                          ↓
                                                    Role Pages (build time)
```

---

## 📋 Prerequisites

1. **Upstash Redis** - Already configured
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. **Upstash QStash** - Free tier available
   - Sign up at: https://console.upstash.com/qstash

3. **CRON_SECRET** - Generate a secure secret
   ```bash
   openssl rand -base64 32
   ```

---

## 🔧 Setup Steps

### Step 1: Add CRON_SECRET to Environment Variables

**Local (.env.local)**:
```bash
CRON_SECRET=your-generated-secret-here
```

**Vercel**:
1. Go to: https://vercel.com/donlaurs-projects/engify-ai-app/settings/environment-variables
2. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Your generated secret
   - **Environment**: Production, Preview, Development

### Step 2: Get Your QStash Credentials

1. Go to: https://console.upstash.com/qstash
2. Copy your **QStash Token** (you'll need this)
3. Note your **Current Signing Key** and **Next Signing Key**

### Step 3: Create QStash Schedule

1. In Upstash Console, go to **QStash** → **Schedules**
2. Click **Create Schedule**
3. Configure:
   - **Name**: `update-engify-stats`
   - **Destination URL**: `https://engify.ai/api/cron/update-stats`
   - **Schedule**: `0 * * * *` (every hour at minute 0)
   - **Method**: `POST`
   - **Headers**:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Retry**: 
     - Max Retries: `3`
     - Retry Delay: `60` seconds

4. Click **Create**

### Step 4: Test the Endpoint

**Manual test via curl**:
```bash
curl -X POST https://engify.ai/api/cron/update-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected response**:
```json
{
  "success": true,
  "stats": {
    "prompts": 450,
    "patterns": 15,
    "learningResources": 25,
    "users": 120
  },
  "source": "mongodb",
  "timestamp": "2025-11-07T14:00:00.000Z"
}
```

### Step 5: Verify Redis Cache

**Check Redis via Upstash Console**:
1. Go to: https://console.upstash.com/redis
2. Select your Redis instance
3. Go to **Data Browser**
4. Search for key: `site:stats:v1`
5. Verify the cached data

**Or via curl**:
```bash
curl https://YOUR_REDIS_URL/get/site:stats:v1 \
  -H "Authorization: Bearer YOUR_REDIS_TOKEN"
```

---

## 📊 How It Works

### Build Time (Role Pages)

```typescript
// src/components/roles/RoleLandingPageContent.tsx
const stats = await fetchPlatformStats(true); // skipMongoDB = true
```

**Flow**:
1. Check Redis cache → ✅ Fast (< 100ms)
2. If Redis empty → Use static fallback
3. **Never** query MongoDB during build

### Cron Job (Every Hour)

```typescript
// src/app/api/cron/update-stats/route.ts
const stats = await fetchPlatformStats(false); // allow MongoDB
```

**Flow**:
1. QStash triggers endpoint
2. Query MongoDB (no build pressure)
3. Cache results in Redis for 1 hour
4. Return success response

### Runtime (API Endpoint)

```typescript
// src/app/api/stats/route.ts
const stats = await fetchPlatformStats(); // default behavior
```

**Flow**:
1. Check Redis → If found, return
2. Query MongoDB → Cache in Redis
3. Fallback to static if MongoDB fails

---

## 🔍 Monitoring

### Check QStash Logs

1. Go to: https://console.upstash.com/qstash
2. Click on **Logs**
3. Filter by schedule: `update-engify-stats`
4. Check for:
   - ✅ 200 responses (success)
   - ❌ 401 responses (auth issue)
   - ❌ 500 responses (server error)

### Check Application Logs

**Vercel Logs**:
```bash
vercel logs --follow
```

**Look for**:
```
INFO: Starting stats update via cron
INFO: Stats updated successfully { source: 'mongodb', promptCount: 450 }
```

### Check Redis TTL

```bash
# Via Upstash CLI or console
TTL site:stats:v1
# Should return ~3600 seconds (1 hour)
```

---

## 🚨 Troubleshooting

### Issue: 401 Unauthorized

**Cause**: CRON_SECRET mismatch

**Fix**:
1. Verify `CRON_SECRET` in Vercel environment variables
2. Update QStash schedule header to match
3. Redeploy if needed

### Issue: 500 Server Error

**Cause**: MongoDB connection issue

**Fix**:
1. Check `MONGODB_URI` in Vercel
2. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Check MongoDB cluster is active (not paused)

### Issue: Stats Not Updating

**Cause**: QStash schedule not running

**Fix**:
1. Check QStash schedule is **Active**
2. Verify cron expression: `0 * * * *`
3. Check QStash logs for errors
4. Manually trigger via curl to test

### Issue: Build Still Timing Out

**Cause**: Role pages still querying MongoDB

**Fix**:
1. Verify `fetchPlatformStats(true)` is called with `skipMongoDB = true`
2. Check Redis is configured and accessible
3. Verify static fallback data exists

---

## 💰 Cost Analysis

### QStash Free Tier
- **500 requests/day** (more than enough for hourly = 24/day)
- **Unlimited schedules**
- **3 retries per request**

### Upstash Redis Free Tier
- **10,000 commands/day**
- **256 MB storage**
- **1 GB bandwidth**

**Total Cost**: $0/month for this use case ✅

---

## 🔄 Alternative: Vercel Cron (Not Recommended)

Vercel Cron is simpler but less reliable:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-stats",
    "schedule": "0 * * * *"
  }]
}
```

**Why QStash is Better**:
- ✅ Better retry logic
- ✅ More reliable execution
- ✅ Better monitoring/logs
- ✅ Independent of Vercel
- ✅ Works during Vercel maintenance

---

## 📝 Maintenance

### Update Schedule Frequency

**Current**: Every hour (`0 * * * *`)

**Options**:
- Every 30 minutes: `*/30 * * * *`
- Every 2 hours: `0 */2 * * *`
- Every 15 minutes: `*/15 * * * *`

**Recommendation**: Keep at 1 hour. Stats don't need to be real-time.

### Rotate CRON_SECRET

1. Generate new secret: `openssl rand -base64 32`
2. Update Vercel environment variable
3. Update QStash schedule header
4. Redeploy application

### Monitor Redis Usage

Check Upstash Redis dashboard monthly:
- Commands used
- Storage used
- Bandwidth used

If approaching limits, consider upgrading or optimizing cache strategy.

---

## ✅ Success Criteria

After setup, verify:

1. ✅ QStash schedule is active and running hourly
2. ✅ `/api/cron/update-stats` returns 200 with stats
3. ✅ Redis cache contains `site:stats:v1` key
4. ✅ Role pages build successfully without MongoDB timeouts
5. ✅ Stats are updated hourly (check `lastUpdated` timestamp)

---

## 🔗 Resources

- **Upstash QStash Docs**: https://upstash.com/docs/qstash
- **Upstash Redis Docs**: https://upstash.com/docs/redis
- **Cron Expression Reference**: https://crontab.guru/

---

**Last Updated**: November 7, 2025
