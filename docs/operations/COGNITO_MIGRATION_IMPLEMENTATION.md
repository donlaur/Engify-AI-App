# AWS Cognito Migration Implementation Guide

## Overview

Migrating from NextAuth.js + MongoDB to AWS Cognito for enterprise authentication.

**Why Cognito:**

- ✅ Enterprise-grade (SOC 2, ISO 27001)
- ✅ No MongoDB dependency for auth
- ✅ Better for resume/portfolio
- ✅ AWS ecosystem integration
- ✅ Free tier: 50K MAU

## Step 1: AWS Cognito Setup

### 1.1 Create User Pool

1. **AWS Console** → **Cognito** → **User Pools** → **Create User Pool**
2. **Sign-in options:**
   - ✅ Email
   - ✅ Google (if using)
   - ✅ GitHub (if using)
3. **Password policy:**
   - Minimum 8 characters
   - Require uppercase, lowercase, numbers
   - Require special characters (optional)
4. **MFA** (recommended):
   - Enable MFA: Optional
   - TOTP: Enable
5. **User attributes:**
   - Email (required)
   - Name (standard)
   - Custom: `role`, `organizationId`, `plan` (if needed)

### 1.2 Configure App Client

1. **App integration** → **App clients** → **Create app client**
2. **App client name:** `engify-web-app`
3. **Allowed OAuth flows:**
   - ✅ Authorization code grant
   - ✅ Implicit grant
4. **Allowed OAuth scopes:**
   - ✅ openid
   - ✅ email
   - ✅ profile
5. **Allowed callback URLs:**
   - `https://engify.ai/api/auth/callback/cognito`
   - `https://engify.ai/api/auth/callback/google`
   - `https://engify.ai/api/auth/callback/github`
   - `http://localhost:3000/api/auth/callback/cognito` (dev)
6. **Allowed sign-out URLs:**
   - `https://engify.ai`
   - `http://localhost:3000` (dev)

### 1.3 Set Custom Domain (Optional but Recommended)

1. **App integration** → **Domain** → **Create custom domain**
2. **Domain prefix:** `auth` (creates `auth.engify.ai`)
3. **Verify domain** (add DNS records)
4. **Use custom domain** for professional branding

### 1.4 Get Credentials

After setup, you'll get:

- **User Pool ID:** `us-east-1_XXXXXXXXX`
- **App Client ID:** `XXXXXXXXXXXXXXXXXXXXXXXXXX`
- **App Client Secret:** `XXXXXXXXXXXXXXXXXXXXXXXXXX` (if using)
- **Region:** `us-east-1`

## Step 2: Install Dependencies

```bash
pnpm add @aws-sdk/client-cognito-identity-provider
```

## Step 3: Update NextAuth Configuration

NextAuth.js v5 doesn't have a built-in Cognito provider, but we can create one using the AWS SDK.

### 3.1 Create Cognito Provider

Create `src/lib/auth/providers/CognitoProvider.ts`:

```typescript
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import CredentialsProvider from 'next-auth/providers/credentials';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'us-east-1',
});

export function CognitoProvider() {
  return CredentialsProvider({
    name: 'cognito',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        // Authenticate with Cognito
        const command = new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.COGNITO_CLIENT_ID!,
          AuthParameters: {
            USERNAME: credentials.email,
            PASSWORD: credentials.password,
          },
        });

        const response = await cognitoClient.send(command);

        if (!response.AuthenticationResult) {
          return null;
        }

        // Get user attributes from Cognito
        // You'll need to call GetUser or AdminGetUser to get full user data

        return {
          id: response.AuthenticationResult.IdToken,
          email: credentials.email,
          // Add other user attributes
        };
      } catch (error) {
        console.error('Cognito auth error:', error);
        return null;
      }
    },
  });
}
```

### 3.2 Update auth/config.ts

```typescript
import { CognitoProvider } from './providers/CognitoProvider';

export const authOptions: NextAuthConfig = {
  providers: [
    CognitoProvider(),
    // Keep Google/GitHub if using
    GoogleProvider({...}),
    GitHubProvider({...}),
  ],
  // ... rest of config
};
```

## Step 4: User Migration Script

Create `scripts/auth/migrate-users-to-cognito.ts`:

```typescript
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'us-east-1',
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;

async function migrateUsers() {
  const db = await getDb();
  const users = await db.collection('users').find({}).toArray();

  console.log(`Migrating ${users.length} users to Cognito...`);

  for (const user of users) {
    try {
      // Create user in Cognito
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
        UserAttributes: [
          { Name: 'email', Value: user.email },
          {
            Name: 'email_verified',
            Value: user.emailVerified ? 'true' : 'false',
          },
          { Name: 'name', Value: user.name },
          // Custom attributes if needed
        ],
        MessageAction: 'SUPPRESS', // Don't send welcome email
      });

      await cognitoClient.send(createCommand);

      // Set password (if exists)
      if (user.password) {
        // Note: Can't migrate bcrypt hashes directly
        // User will need to reset password or you'll need to set temporary password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          Password: 'TempPassword123!', // User must change on first login
          Permanent: false,
        });

        await cognitoClient.send(setPasswordCommand);
        console.log(`✅ Created user: ${user.email} (temporary password set)`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate user ${user.email}:`, error);
    }
  }

  console.log('✅ Migration complete!');
}

migrateUsers();
```

## Step 5: Environment Variables

Add to `.env.local` and Vercel:

```bash
# AWS Cognito
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXX  # If using client secret
```

## Step 6: Update User Service

Update `src/lib/services/UserService.ts` to:

- Read user data from Cognito (instead of MongoDB)
- Keep MongoDB for non-auth user data (plan, preferences, etc.)
- Use Cognito ID as MongoDB user reference

## Step 7: Testing

1. **Test login** with existing user
2. **Test OAuth** (Google/GitHub)
3. **Test password reset**
4. **Test MFA** (if enabled)

## Rollback Plan

If issues occur:

1. Keep MongoDB auth code as backup
2. Use feature flag to switch between Cognito/MongoDB
3. Rollback to MongoDB if needed

## Timeline

- **Setup Cognito:** 30 minutes
- **Update NextAuth:** 1-2 hours
- **Migration script:** 1 hour
- **Testing:** 1 hour
- **Deploy:** 30 minutes

**Total:** 4-5 hours

## Benefits After Migration

- ✅ Fast login (no MongoDB cold starts)
- ✅ Enterprise-grade security
- ✅ Scalable (handles millions of users)
- ✅ MFA support
- ✅ SSO ready (for enterprise customers)
- ✅ Better for resume/portfolio

---

Let's start implementing!
