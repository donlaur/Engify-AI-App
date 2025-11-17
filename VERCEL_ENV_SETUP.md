# Vercel Environment Variables Setup Guide

**Purpose:** Simple, free, and effective secret management for Next.js on Vercel

## Why Vercel Environment Variables?

### ✅ Advantages
- **FREE** - No additional cost
- **Simple** - Manage in Vercel dashboard
- **Integrated** - Built into Vercel platform
- **Encrypted** - Encrypted at rest and in transit
- **Environment-specific** - Different values for dev/preview/production
- **Team access control** - Role-based access in Vercel

### ⚠️ Trade-offs vs AWS Secrets Manager
- No automatic rotation (manual updates needed)
- Less detailed audit trail
- No programmatic rotation API
- Good for **showcase projects** and **early-stage startups**

## When to Use Each

| Use Vercel Env Vars | Use AWS Secrets Manager |
|---------------------|------------------------|
| Next.js app secrets | Python Lambda secrets |
| Non-rotating secrets | Secrets that rotate |
| Cost-sensitive projects | Compliance requirements (SOC 2, HIPAA) |
| Simple deployments | Complex multi-service architectures |
| < 10 services | 10+ services with shared secrets |

---

## Quick Setup (5 Minutes)

### 1. **Create `.env.local` (Local Development)**

```bash
# AI Provider API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
REPLICATE_API_KEY=r8_...

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/engify?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-random-secret-here
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-secret
AUTH_GITHUB_ID=your-github-oauth-app-id
AUTH_GITHUB_SECRET=your-github-oauth-secret

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@engify.ai

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Queue (Upstash QStash - optional)
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx

# Cache (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Security
API_KEY_ENCRYPTION_KEY=your-32-char-encryption-key-here
RATE_LIMIT_ENABLED=true

# Admin
ADMIN_MFA_ENFORCED=true

# Feature Flags
CONTENT_CREATION_BUDGET_LIMIT=0.50
CONTENT_CREATION_MIN_WORDS=100
```

### 2. **Add to Vercel (Production)**

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...`
   - **Environment:** Check `Production`, `Preview`, `Development`
5. Click **Save**

#### Option B: Vercel CLI (Faster for Bulk)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add all env vars from .env.local
vercel env pull .env.local

# Or add individually
vercel env add OPENAI_API_KEY production
# Paste value when prompted
```

### 3. **Secure Your `.env.local`**

```bash
# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore

# Verify it's not tracked
git status | grep .env.local || echo "✅ Safe - not tracked"
```

---

## Environment-Specific Values

Vercel supports different values per environment:

### Development (Local)
```bash
NEXTAUTH_URL=http://localhost:3000
RATE_LIMIT_ENABLED=false
```

### Preview (Pull Requests)
```bash
NEXTAUTH_URL=https://engify-ai-app-git-feature-user.vercel.app
RATE_LIMIT_ENABLED=true
```

### Production
```bash
NEXTAUTH_URL=https://engify.ai
RATE_LIMIT_ENABLED=true
ADMIN_MFA_ENFORCED=true
```

---

## Security Best Practices

### ✅ DO
- ✅ Use strong, randomly generated secrets (32+ characters)
- ✅ Rotate secrets every 90 days
- ✅ Use environment-specific values
- ✅ Limit team member access in Vercel
- ✅ Enable Vercel's "Sensitive" flag for secret values
- ✅ Use `.env.example` for documentation (no real values)

### ❌ DON'T
- ❌ Commit `.env.local` to git
- ❌ Share secrets via email or Slack
- ❌ Use production secrets in development
- ❌ Store secrets in code comments
- ❌ Reuse secrets across projects

---

## Generating Secure Secrets

### Option 1: OpenSSL (Command Line)
```bash
# Generate 32-character random secret
openssl rand -base64 32

# For NEXTAUTH_SECRET specifically
openssl rand -base64 32 | tr -d '\n' && echo
```

### Option 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Online (Use with Caution)
- https://generate-secret.vercel.app/32
- Only use for non-production secrets
- Re-generate for production

---

## Accessing Secrets in Code

### Server-Side (API Routes, Server Components)
```typescript
// src/app/api/example/route.ts
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Use the API key
  const response = await openai.chat.completions.create({...});
  return Response.json(response);
}
```

### Environment Variable Validation (Recommended)
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  MONGODB_URI: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

---

## Troubleshooting

### "Environment variable not found"
1. Check spelling (case-sensitive)
2. Verify it's set in Vercel dashboard
3. Redeploy after adding new variables
4. Check correct environment (production vs preview)

### "Unexpected token" in JSON.parse
- Ensure no trailing newlines in secrets
- Use `tr -d '\n'` when generating secrets

### Secrets not updating after change
1. Variables are cached during build
2. Trigger a new deployment:
   ```bash
   vercel --prod --force
   ```

### Local development not working
1. Ensure `.env.local` exists
2. Restart Next.js dev server
3. Check file is in project root (not `/src`)

---

## Migration from AWS Secrets Manager (If Needed)

If you previously set up AWS Secrets Manager:

```bash
# 1. Export secrets from AWS
aws secretsmanager get-secret-value \
  --secret-id engify-prod-secrets \
  --query SecretString \
  --output text > secrets.json

# 2. Convert to .env format
node scripts/aws/convert-to-env.js secrets.json > .env.local

# 3. Add to Vercel
vercel env pull .env.local

# 4. Clean up
rm secrets.json
```

---

## Cost Comparison

| Solution | Monthly Cost | Setup Time | Complexity |
|----------|-------------|------------|------------|
| **Vercel Env Vars** | **$0** | **5 min** | **Low** |
| AWS Secrets Manager | $0.80-$10 | 30 min | Medium |
| HashiCorp Vault | $50-$500 | 2-4 hours | High |

**Verdict:** For most Next.js projects on Vercel, use **Vercel Environment Variables**. Only upgrade to AWS Secrets Manager if you need:
- Automatic rotation
- Compliance requirements (SOC 2, HIPAA)
- Shared secrets across 10+ services
- Detailed audit trails

---

## For Your Job Portfolio

**What This Demonstrates:**
- ✅ **Cost consciousness** - Choosing free solution when appropriate
- ✅ **Trade-off analysis** - Understanding when to use which solution
- ✅ **Security awareness** - Following best practices
- ✅ **Pragmatism** - Not over-engineering

**Interview Talking Point:**
> "I evaluated AWS Secrets Manager vs Vercel's built-in environment variables. For this Next.js application, Vercel env vars provide sufficient security, encryption, and access control at zero cost. I'd upgrade to AWS Secrets Manager if we needed automatic rotation or had compliance requirements like SOC 2."

This shows **engineering judgment** - a key skill for management roles.

---

## Next Steps

1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Fill in your actual values
3. ✅ Add secrets to Vercel dashboard
4. ✅ Deploy and verify
5. ✅ Set calendar reminder to rotate secrets every 90 days

**All done!** Your secrets are now securely managed. 🎉
