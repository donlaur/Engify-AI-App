# AWS Cognito Sign-Up Configuration Guide

## Step-by-Step Configuration

### 1. Application Type

**Select:** "Traditional web application"

- ✅ Next.js runs on a web server
- ✅ Uses redirects and separate pages
- ✅ Node.js backend

### 2. Name Your Application

**Enter:** `engify-web-app`

### 3. Sign-In Identifiers

**Select:** ✅ **Email** (required)

- ✅ Most common for SaaS apps
- ✅ Easy for users
- ✅ Professional

**Do NOT select:**

- ❌ Phone number (unless you need SMS verification)
- ❌ Username (adds complexity)

### 4. Self-Registration

**Option A: Enable Self-Registration** (Recommended for public signup)

- ✅ Check "Enable self-registration"
- ✅ Users can sign up themselves
- ✅ Good for public SaaS

**Option B: Disable Self-Registration** (If you want admin-controlled signups)

- ❌ Uncheck "Enable self-registration"
- ✅ Only admins can create users
- ✅ Better for enterprise/internal apps

**For your use case:** Since you're building a public SaaS, **enable self-registration**.

### 5. Required Attributes for Sign-Up

**Minimum Required:**

- ✅ **Email** (already required as sign-in identifier)
- ✅ **Name** (standard, user-friendly)

**Optional but Recommended:**

- ⚠️ **Phone number** (only if you need SMS verification/MFA)
- ⚠️ **Birthdate** (only if age verification needed)

**Do NOT require:**

- ❌ Custom attributes (you can add these later)

### 6. Return URL

**Enter:**

```
https://engify.ai/api/auth/callback/cognito
```

**For local development, also add:**

```
http://localhost:3000/api/auth/callback/cognito
```

**Important:**

- Use HTTPS for production
- Localhost HTTP is allowed for testing
- Must match your NextAuth callback URL exactly

## Recommended Configuration Summary

```
Application Type: Traditional web application
Application Name: engify-web-app

Sign-In Identifiers:
  ✅ Email

Self-Registration:
  ✅ Enable self-registration

Required Attributes:
  ✅ Email (required)
  ✅ Name (required)

Return URL:
  https://engify.ai/api/auth/callback/cognito
```

## After Creating User Pool

1. **Copy Credentials:**
   - User Pool ID: `us-east-1_XXXXXXXXX`
   - App Client ID: `XXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Region: `us-east-1`

2. **Add to `.env.local`:**

   ```bash
   COGNITO_REGION=us-east-1
   COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
   COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Configure App Client:**
   - Go to App integration → App clients
   - Edit your app client
   - **Allowed OAuth flows:** Authorization code grant
   - **Allowed OAuth scopes:** openid, email, profile
   - **Callback URLs:** Same as return URL above

## Next Steps After Setup

1. ✅ Create your user account in Cognito
2. ✅ Add env vars to Vercel
3. ✅ Test login
4. ✅ Deploy

---

**Note:** Sign-in identifiers and required attributes **cannot be changed** after creation, so choose carefully!
