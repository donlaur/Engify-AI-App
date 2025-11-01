# AWS Cognito Configuration - Your Credentials

## ✅ Your Cognito Setup

Based on your AWS Console, here are your credentials:

```bash
# AWS Cognito Configuration
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=[YOUR_USER_POOL_ID]
COGNITO_CLIENT_ID=[YOUR_CLIENT_ID]
COGNITO_CLIENT_SECRET=<get from AWS Console if you have one>
```

## Important: NextAuth.js vs Express

**AWS shows Express.js examples**, but we're using **NextAuth.js v5** which handles OAuth differently.

### ✅ What We've Already Done

1. ✅ Created Cognito provider (`src/lib/auth/providers/CognitoProvider.ts`)
2. ✅ Updated auth config to use Cognito (when env vars are set)
3. ✅ Configured for NextAuth.js (not Express)

### ❌ What You DON'T Need to Do

- ❌ Install `openid-client` package (NextAuth handles this)
- ❌ Write Express routes (NextAuth handles this)
- ❌ Configure session middleware (NextAuth handles this)
- ❌ Write login/logout routes (NextAuth handles this)

## Step 1: Configure App Client Callback URLs

**Go to AWS Console → Cognito → User Pools → Your Pool → App integration → App clients → Edit**

Add these callback URLs:

```
https://engify.ai/api/auth/callback/cognito
http://localhost:3000/api/auth/callback/cognito
```

Add these logout URLs:

```
https://engify.ai
http://localhost:3000
```

**Allowed OAuth scopes:**

- ✅ openid
- ✅ email
- ✅ profile

**Allowed OAuth flows:**

- ✅ Authorization code grant

## Step 2: Add Environment Variables

Add to `.env.local`:

```bash
# AWS Cognito
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=[YOUR_USER_POOL_ID]
COGNITO_CLIENT_ID=[YOUR_CLIENT_ID]
# COGNITO_CLIENT_SECRET= (only if your app client has a secret)
```

**Important:** Once `COGNITO_USER_POOL_ID` is set, the app will automatically use Cognito!

## Step 3: Get Client Secret (If Needed)

**Check if your app client has a secret:**

1. AWS Console → Cognito → User Pools → Your Pool
2. App integration → App clients → Click your app client
3. Look for "Client secret" section
4. If it shows a secret, copy it and add to `.env.local`
5. If it says "No client secret", you don't need it

## Step 4: Create Your User Account

Since you're the only user:

1. **AWS Console** → Cognito → User Pools → Your Pool → Users → Create User
2. **Username:** Your email
3. **Email:** Your email
4. **Temporary password:** Set a temp password
5. **Mark email as verified:** ✅ (or verify via email link)

## Step 5: Test Login

1. Restart dev server: `pnpm dev`
2. Go to `/login`
3. Use your email and password
4. Should login instantly!

## How It Works with NextAuth.js

**NextAuth.js automatically handles:**

- ✅ OAuth flow (`/api/auth/callback/cognito`)
- ✅ Session management
- ✅ Token handling
- ✅ User info extraction

**Our Cognito provider:**

- Uses AWS SDK (`InitiateAuthCommand`)
- Authenticates with Cognito
- Returns user info to NextAuth
- NextAuth handles the rest!

## Next Steps

1. ✅ Configure callback URLs in AWS Console
2. ✅ Add env vars to `.env.local`
3. ✅ Create your user account
4. ✅ Test login
5. ✅ Add env vars to Vercel for production

---

**Note:** The AWS instructions are for Express.js, but since we're using NextAuth.js, most of that code is already handled! Just configure the env vars and you're good to go.
