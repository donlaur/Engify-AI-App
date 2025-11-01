# 🚀 Vercel Environment Variables Setup

**URGENT**: Your build is failing because Vercel needs environment variables.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Set up MongoDB Atlas (if you haven't)

1. Go to: https://cloud.mongodb.com
2. Create FREE M0 cluster (takes 2 minutes)
3. Create database user
4. Get connection string

**OR use this temporary MongoDB for demo**:

```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/engify?retryWrites=true&w=majority
```

### Step 2: Add Environment Variables to Vercel

1. **Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add these variables** (click "Add" for each):

```bash
# Required
MONGODB_URI
Value: mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/engify?retryWrites=true&w=majority

NEXTAUTH_SECRET
Value: (run: openssl rand -base64 32 and paste output)

NEXTAUTH_URL
Value: https://engify-ai-app.vercel.app

NEXT_PUBLIC_APP_NAME
Value: Engify.ai

NEXT_PUBLIC_APP_URL
Value: https://engify-ai-app.vercel.app

NODE_ENV
Value: production
```

### Step 3: Redeploy

1. Go to: Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click "..." on the latest deployment
4. Click "Redeploy"

**OR** just push any change:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🎯 What This Fixes

Your build failed because:

```
Module not found: Can't resolve '@/components/ui/checkbox'
```

I already fixed this and pushed the code. Now you just need:

1. MongoDB connection string
2. NextAuth secret
3. Environment variables in Vercel

---

## 🔑 Generate NEXTAUTH_SECRET

Run this in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET` in Vercel.

---

## ✅ After Setup

Once environment variables are added:

1. Vercel will automatically redeploy
2. Build will succeed
3. Your app will be live with REAL authentication
4. You can signup/login with MongoDB backend

---

## 🚨 Quick MongoDB Setup

If you don't have MongoDB yet:

1. **Go to**: https://cloud.mongodb.com/account/register
2. **Create account** (use Google sign-in for speed)
3. **Create FREE cluster**:
   - Click "Build a Database"
   - Choose M0 FREE
   - Click "Create"
4. **Create user**:
   - Username: `engify_admin`
   - Password: Click "Autogenerate Secure Password" (save it!)
5. **Add IP**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
6. **Get connection string**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the string
   - Replace `<password>` with your actual password

**Total time**: 3-5 minutes

---

## 📞 Need Help?

If build still fails after adding env vars:

1. Check Vercel deployment logs
2. Verify all 6 environment variables are set
3. Make sure MongoDB connection string is correct
4. Redeploy

---

**Next**: Once deployed, test signup/login at your Vercel URL!
