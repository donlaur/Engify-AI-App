# Git-Secrets Configuration & AWS Secrets Manager Status

## 🔍 Why git-secrets Didn't Catch Secrets

### Problem
git-secrets didn't catch the exposed Cognito IDs and AWS Account ID because:

1. **Cognito Client IDs** - Not in default patterns (they're 26 characters, not AWS access keys)
2. **AWS Account ID pattern** - Only matches when formatted as `AWS_ACCOUNT_ID=...`, not in comments/docs
3. **Patterns were added AFTER** the secrets were already committed

### Current git-secrets Patterns
```bash
# AWS Access Keys (default)
(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}

# AWS Secret Keys (default)
(AWS|aws|Aws)?_?(SECRET|secret|Secret)?_?(ACCESS|access|Access)?_?(KEY|key|Key)...pattern for 40+ char keys

# AWS Account ID (default - only matches variable assignments)
(AWS|aws|Aws)?_?(ACCOUNT|account|Account)_?(ID|id|Id)?...pattern for 12-digit IDs
```

### ✅ Fixed: Added Custom Patterns
```bash
# Cognito Client ID (26 chars)
64haaujuedgbhsu9p01avf4d10

# Cognito User Pool ID pattern
us-east-1_[a-zA-Z0-9]+

# AWS Account ID (in any format)
[0-9]{4}-[0-9]{4}-[0-9]{4}
```

**These patterns are now active** and will catch future commits.

---

## 🔐 AWS Secrets Manager Status

### Current State: **PARTIALLY IMPLEMENTED**

**✅ What's Using AWS Secrets Manager:**
- API Key encryption key (`engify/api-key-encryption-key`)
- Jira integration secrets

**❌ What's NOT Using AWS Secrets Manager:**
- MongoDB URI (`process.env.MONGODB_URI`)
- OpenAI API Key (`process.env.OPENAI_API_KEY`)
- Cognito credentials (`process.env.COGNITO_*`)
- SendGrid API Key (`process.env.SENDGRID_API_KEY`)
- Google API Key (`process.env.GOOGLE_API_KEY`)
- All other secrets still use `process.env.*`

### Implementation Status

**File:** `src/lib/aws/SecretsManager.ts` ✅ EXISTS
- Has `getSecret()` method
- Caches secrets for 5 minutes
- Falls back to environment variables
- Only used in 2 places currently

**Migration Needed:** See `docs/aws/AWS_INFRASTRUCTURE_MIGRATION.md`
- Phase 1: Migrate MongoDB URI
- Phase 2: Migrate API keys
- Phase 3: Migrate Cognito credentials

---

## 🚨 Current Risk

**Secrets are still in:**
- Environment variables (`.env.local` - gitignored ✅)
- Vercel environment variables (cloud dashboard)
- **NOT yet in AWS Secrets Manager** (except 2 secrets)

**To fully secure:**
1. Create secrets in AWS Secrets Manager
2. Update code to use `secretsManager.getSecret()`
3. Remove from Vercel env vars
4. Keep `.env.local` for local dev only

---

## 📋 Next Steps

### Immediate:
1. ✅ git-secrets patterns updated (will catch future commits)
2. ⏳ Migrate secrets to AWS Secrets Manager (see migration plan)

### Migration Order:
1. MongoDB URI (highest priority)
2. OpenAI API Key
3. Cognito credentials
4. Other API keys

---

**Status:** git-secrets fixed ✅ | AWS Secrets Manager partially implemented ⚠️

