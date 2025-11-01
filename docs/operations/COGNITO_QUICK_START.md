# Quick Start: AWS Cognito Setup

## Step 1: Create Cognito User Pool

1. **AWS Console** → **Cognito** → **User Pools** → **Create User Pool**

2. **Configuration:**
   - **Name:** `engify-user-pool`
   - **Sign-in options:** Email
   - **Password policy:** Minimum 8 characters (or your preference)
   - **MFA:** Optional (recommended for enterprise)

3. **User attributes:**
   - ✅ Email (required)
   - ✅ Name (standard)
   - ✅ Custom attributes: `role`, `organizationId`, `plan` (if needed)

4. **App client:**
   - **Name:** `engify-web-app`
   - **Allowed OAuth flows:** Authorization code grant
   - **Allowed OAuth scopes:** openid, email, profile
   - **Callback URLs:**
     - `https://engify.ai/api/auth/callback/cognito`
     - `http://localhost:3000/api/auth/callback/cognito` (dev)

5. **Copy credentials:**
   - User Pool ID: `us-east-1_XXXXXXXXX`
   - App Client ID: `XXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Region: `us-east-1` (or your region)

## Step 2: Add Environment Variables

Add to `.env.local`:

```bash
# AWS Cognito
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:** Once `COGNITO_USER_POOL_ID` is set, the app will automatically use Cognito instead of MongoDB!

## Step 3: Create Your First User

Since you're the only user, you can create yourself via AWS Console:

1. **Cognito** → **User Pools** → **Your Pool** → **Users** → **Create User**
2. **Username:** Your email
3. **Email:** Your email
4. **Temporary password:** Set a temp password
5. **Send invitation:** No (you'll set password yourself)

Then **set permanent password** on first login.

## Step 4: Test Login

1. Restart dev server: `pnpm dev`
2. Go to `/login`
3. Use your email and password
4. Should login instantly (no MongoDB timeout!)

## Step 5: Deploy to Production

Add same env vars to Vercel:

- `COGNITO_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`

Deploy and test!

---

**That's it!** Once Cognito is configured, login will be fast and reliable.
