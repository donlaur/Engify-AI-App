# 🔐 Production Authentication Setup

**Time Required**: 10-15 minutes  
**Result**: Real login/signup with MongoDB + NextAuth

---

## Step 1: MongoDB Atlas Setup (5 minutes)

### Create Free Cluster

1. **Go to**: https://cloud.mongodb.com
2. **Sign up** (or log in if you have an account)
3. **Create a FREE cluster**:
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `engify-cluster`
4. **Create Database User**:
   - Username: `engify_admin`
   - Password: **Generate a secure password** (save it!)
   - Click "Create User"
5. **Add IP Address**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to your server IPs
6. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://engify_admin:<password>@engify-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

---

## Step 2: Environment Variables (2 minutes)

### Create `.env.local` file

In your project root, create `.env.local`:

```bash
# MongoDB (Required)
MONGODB_URI="mongodb+srv://engify_admin:YOUR_PASSWORD@engify-cluster.xxxxx.mongodb.net/engify?retryWrites=true&w=majority"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3005"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long-random-string"

# App
NEXT_PUBLIC_APP_NAME="Engify.ai"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
NODE_ENV="development"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

---

## Step 3: Install Dependencies (1 minute)

```bash
pnpm install
```

This will ensure `bcryptjs` and all auth dependencies are installed.

---

## Step 4: Test Locally (2 minutes)

### Start the dev server

```bash
pnpm dev
```

### Test Signup

1. Go to: http://localhost:3005/signup
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234! (must have uppercase, lowercase, number)
   - Confirm password
   - Check terms
3. Click "Create Account"
4. You should see success!

### Test Login

1. Go to: http://localhost:3005/login
2. Enter:
   - Email: test@example.com
   - Password: Test1234!
3. Click "Sign in"
4. You should be redirected to `/dashboard`

### Verify in MongoDB

1. Go back to MongoDB Atlas
2. Click "Browse Collections"
3. You should see:
   - Database: `engify`
   - Collection: `users`
   - Your test user with **hashed password** (not plain text!)

---

## Step 5: Deploy to Vercel (5 minutes)

### Add Environment Variables to Vercel

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add these variables:

```
MONGODB_URI = mongodb+srv://engify_admin:YOUR_PASSWORD@...
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = (same secret from local)
NEXT_PUBLIC_APP_NAME = Engify.ai
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
NODE_ENV = production
```

3. Click "Save"
4. Redeploy your app

### Update MongoDB IP Whitelist (Production)

1. In MongoDB Atlas → Network Access
2. Add Vercel's IP ranges (or keep 0.0.0.0/0 for now)

---

## ✅ What You Get

### Security Features

- ✅ **Bcrypt password hashing** (12 rounds)
- ✅ **JWT sessions** (30-day expiry)
- ✅ **Secure HTTP-only cookies**
- ✅ **Password validation** (min 8 chars, uppercase, lowercase, number)
- ✅ **Email validation**
- ✅ **MongoDB connection pooling**
- ✅ **No passwords in localStorage** (all server-side)

### User Experience

- ✅ Real signup with validation
- ✅ Real login with session
- ✅ Protected dashboard routes
- ✅ Logout functionality
- ✅ Error handling
- ✅ Loading states

### Database

- ✅ User collection in MongoDB
- ✅ Hashed passwords (never plain text)
- ✅ User roles (engineer, manager, etc.)
- ✅ Plan tracking (free, pro, enterprise)
- ✅ Timestamps (createdAt, updatedAt)

---

## 🎯 Show the Director

**What to say**:

> "This is production-grade authentication with MongoDB Atlas and NextAuth. All passwords are bcrypt-hashed with 12 rounds, sessions are JWT-based with HTTP-only cookies, and we have full user management. The database is on MongoDB's free tier but can scale to millions of users."

**Demo flow**:

1. Show signup page → Create account
2. Show MongoDB Atlas → User with hashed password
3. Show login → Session created
4. Show dashboard → Protected route
5. Open DevTools → Show HTTP-only cookie (no localStorage!)
6. Show logout → Session cleared

**Technical highlights**:

- ✅ NextAuth v5 (latest)
- ✅ Bcrypt hashing (industry standard)
- ✅ MongoDB Atlas (production-ready)
- ✅ JWT sessions (stateless, scalable)
- ✅ Zod validation (type-safe)
- ✅ No client-side secrets

---

## 🚨 Troubleshooting

### Error: "MONGODB_URI is required"

- Check `.env.local` exists in project root
- Verify the variable name is exactly `MONGODB_URI`
- Restart the dev server

### Error: "Invalid email or password"

- Check MongoDB connection string is correct
- Verify password was replaced in connection string
- Check user exists in MongoDB Atlas

### Error: "NEXTAUTH_SECRET must be at least 32 characters"

- Generate a new secret with `openssl rand -base64 32`
- Make sure it's in `.env.local`

### Can't connect to MongoDB

- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Test connection in MongoDB Compass

---

## 📚 Next Steps

After authentication works:

1. **Add Google OAuth** (optional)
2. **Email verification** (SendGrid/Resend)
3. **Password reset** flow
4. **2FA** (optional)
5. **Session management** (view active sessions)
6. **Admin dashboard** (manage users)

---

**Setup Time**: 10-15 minutes  
**Result**: Production-grade auth ready to impress the director! 🚀
