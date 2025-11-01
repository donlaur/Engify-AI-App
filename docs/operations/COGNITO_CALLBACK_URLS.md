# How to Configure Cognito App Client Callback URLs

## Step-by-Step Instructions

### Step 1: Navigate to App Clients

1. **Left Navigation Pane** → Click **"Applications"**
2. Click **"App clients"** (under Applications)
3. You should see your app client: **"engify-web-app"**

### Step 2: Edit App Client

1. **Click on "engify-web-app"** (or click the three dots → Edit)
2. This opens the app client configuration page

### Step 3: Configure Callback URLs

Scroll down to find:

**Hosted UI settings:**

- **Allowed callback URLs:**
  - Add: `https://engify.ai/api/auth/callback/cognito`
  - Add: `http://localhost:3000/api/auth/callback/cognito`
- **Allowed sign-out URLs:**
  - Add: `https://engify.ai`
  - Add: `http://localhost:3000`

**OAuth 2.0 grant types:**

- ✅ Check: **Authorization code grant**
- ✅ Check: **Implicit grant** (optional, but recommended)

**OpenID Connect scopes:**

- ✅ Check: **openid**
- ✅ Check: **email**
- ✅ Check: **profile**

### Step 4: Save Changes

Click **"Save changes"** at the bottom

## Alternative: If You Don't See These Options

If you're using the **new "Managed login"** (not Hosted UI):

1. Go to **App clients** → Click your app client
2. Look for **"Hosted UI"** or **"OAuth 2.0 settings"** section
3. Enable **"Hosted UI"** if it's disabled
4. Then configure callback URLs

## Quick Navigation Path

```
AWS Cognito Console
  → Left Sidebar: "Applications"
    → "App clients"
      → Click "engify-web-app"
        → Scroll to "Hosted UI settings"
          → Configure callback URLs
```

## What to Add

**Callback URLs:**

```
https://engify.ai/api/auth/callback/cognito
http://localhost:3000/api/auth/callback/cognito
```

**Sign-out URLs:**

```
https://engify.ai
http://localhost:3000
```

---

**Note:** If you're still having trouble finding it, look for "Hosted UI" or "OAuth 2.0" settings in the app client configuration page.
