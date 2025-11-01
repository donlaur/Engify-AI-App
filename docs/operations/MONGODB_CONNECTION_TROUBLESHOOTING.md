# MongoDB Connection Troubleshooting

## Error: SSL/TLS Connection Failure

**Error Message:**

```
MongoServerSelectionError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

**Root Cause:** MongoDB Atlas requires SSL/TLS, but connection options weren't explicitly configured.

## ✅ Fix Applied

Added explicit SSL/TLS options to MongoDB connection configuration:

```typescript
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // ... other options
};
```

## 🔍 Additional Checks

### 1. Verify MongoDB Connection String

**Check your `MONGODB_URI` in Vercel:**

- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Verify `MONGODB_URI` is set correctly
- Should look like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

**Important:** Connection string should include:

- `retryWrites=true`
- `w=majority`
- SSL is handled automatically by `mongodb+srv://`

### 2. Check MongoDB Atlas Network Access

**Verify IP Whitelist:**

1. Go to MongoDB Atlas → Network Access
2. Ensure Vercel IPs are allowed OR
3. Add `0.0.0.0/0` (temporarily for testing) OR
4. Add specific Vercel IPs

**Vercel IPs (if needed):**

- Check Vercel docs for current IP ranges
- Or use `0.0.0.0/0` for development (restrict in production)

### 3. Verify Database User

**Check MongoDB Atlas Database Access:**

1. Go to MongoDB Atlas → Database Access
2. Verify your database user exists
3. Verify password is correct
4. Check user has proper permissions

### 4. Test Connection

**Test locally first:**

```bash
# In your terminal
node -e "const { MongoClient } = require('mongodb'); const client = new MongoClient(process.env.MONGODB_URI, { tls: true }); client.connect().then(() => { console.log('✅ Connected'); process.exit(0); }).catch(err => { console.error('❌ Error:', err); process.exit(1); });"
```

### 5. Check Vercel Environment Variables

**Verify in Vercel:**

1. Dashboard → Project → Settings → Environment Variables
2. Ensure `MONGODB_URI` is set for **Production** environment
3. Check for typos or extra spaces
4. Re-deploy after changing env vars

## 🔧 Password Reset (If Still Needed)

If password is the issue, you can reset it in MongoDB Atlas:

1. Go to MongoDB Atlas → Database Access
2. Click "Edit" on your user
3. Click "Edit Password"
4. Set new password
5. Update `MONGODB_URI` in Vercel with new password
6. Re-deploy

**Or via MongoDB Atlas UI:**

- Click pencil icon next to user document
- Edit `password` field directly (but this is hashed - better to reset via Atlas UI)

## 🚨 Common Issues

### Issue: Connection String Missing SSL Parameters

**Fix:** Ensure connection string includes SSL parameters:

```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### Issue: IP Not Whitelisted

**Fix:** Add Vercel IPs or use `0.0.0.0/0` temporarily

### Issue: Wrong Database Name

**Fix:** Verify connection string includes `/engify` or correct database name

### Issue: Connection Pool Exhausted

**Fix:** Reduce `maxPoolSize` in connection options (already set to 10)

## 📝 Next Steps

1. ✅ **Code fix applied** - SSL options added
2. ⏳ **Redeploy** - Push changes to trigger new deployment
3. ⏳ **Verify** - Test login again
4. ⏳ **Monitor** - Check Vercel logs for any remaining errors

## 🔐 Security Note

After fixing, ensure:

- MongoDB Atlas IP whitelist is properly configured
- Database user has minimal required permissions
- Connection string is secure (not exposed in logs)

---

**Summary:** SSL/TLS options have been added to MongoDB connection config. Redeploy and verify MongoDB Atlas network access settings.
