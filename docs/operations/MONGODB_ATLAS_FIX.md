# MongoDB Atlas Connection Troubleshooting

## Current Issue

Persistent SSL/TLS errors in production (Vercel):

```
ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR
MongoServerSelectionError
```

## Possible Causes

### 1. MongoDB Atlas Network Access

- **Check**: MongoDB Atlas → Network Access → IP Whitelist
- **Problem**: Vercel uses dynamic IPs
- **Solution**: Add `0.0.0.0/0` to allow all IPs (or use Atlas IP Access List)

### 2. Connection String Format

- **Current**: Using `mongodb+srv://` (which should auto-handle TLS)
- **Issue**: Serverless environments sometimes have TLS negotiation issues
- **Try**: Standard connection string with explicit TLS options

### 3. Connection Pooling

- **Problem**: Too many concurrent connections in serverless
- **Solution**: Use MongoDB Atlas Connection Pooler (recommended for serverless)

### 4. Node.js Version Compatibility

- **Check**: Vercel Node.js version (should be 18+)
- **Issue**: Older Node versions have TLS issues

## Immediate Fixes to Try

### Option 1: Use MongoDB Atlas Connection Pooler (RECOMMENDED)

1. Go to MongoDB Atlas → Clusters → Your Cluster → Connect
2. Choose "Connect your application"
3. Select "Drivers" → "Node.js"
4. **Copy the connection string that includes `mongodb+srv://...mongodb.net/?retryWrites=true&w=majority`**
5. **Add connection pooler**: `&maxPoolSize=10&minPoolSize=2`
6. Update `MONGODB_URI` environment variable in Vercel

### Option 2: Use Standard Connection String (Without SRV)

If SRV still fails, try standard format:

```
mongodb://cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/engify?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Option 3: Check MongoDB Atlas Status

- Go to MongoDB Atlas → Status page
- Check for any outages or SSL certificate issues

## Recommended: Use Clerk Instead

Given the persistent issues, **Clerk authentication** eliminates MongoDB dependency for auth:

- ✅ No MongoDB connection needed for login/signup/password reset
- ✅ Sessions handled by Clerk (no DB queries)
- ✅ Enterprise-grade reliability
- ✅ Fixes auth issues permanently

## Next Steps

1. **Quick Fix**: Try MongoDB Atlas Connection Pooler connection string
2. **Best Solution**: Migrate to Clerk (4-6 hours, permanent fix)
