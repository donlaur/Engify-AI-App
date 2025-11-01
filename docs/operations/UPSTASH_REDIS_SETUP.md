# Upstash Redis Setup Instructions

## ✅ Local Environment (.env.local)

Redis credentials have been added to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL="https://valid-colt-17717.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AkU1AAIgcDJKlOdhKy3feHAyf54pSH5Pww774BRyPddyiIV2zzmpMw"
```

## 🔧 Next Steps

### 1. Add to Vercel (Production)

Go to your Vercel project → Settings → Environment Variables and add:

```
UPSTASH_REDIS_REST_URL=https://valid-colt-17717.upstash.io
UPSTASH_REDIS_REST_TOKEN=AkU1AAIgcDJKlOdhKy3feHAyf54pSH5Pww774BRyPddyiIV2zzmpMw
```

**Important**: Add for all environments (Production, Preview, Development)

### 2. Verify Connection

The code will automatically:

- ✅ Detect Upstash Redis via REST URL
- ✅ Use it for auth caching (user lookups, login attempts)
- ✅ Fall back to MongoDB if Redis is unavailable

### 3. Test Locally

Restart your dev server:

```bash
pnpm dev
```

Then test login - it should be faster now!

### 4. Monitor Usage

Check Upstash console:

- Commands: Should be ~10K-50K/month (well under 500K free limit)
- Storage: Should be <10MB (user data is small)
- Cost: $0/month on free tier

## Expected Impact

- **Login time**: 30s → 1-2s (cold start) → 100ms (warm)
- **MongoDB queries**: Reduced by ~80% for auth lookups
- **Cost**: $0/month (free tier)

## Troubleshooting

If Redis isn't working:

1. Check env vars are set correctly
2. Check Upstash console → Usage tab
3. Check Vercel logs for Redis connection errors
4. Code will gracefully fall back to MongoDB

---

**Note**: The `rediss://` endpoint you provided is for TCP connections (like `redis-cli`). The code uses the REST API (`https://`), which is better for serverless.
