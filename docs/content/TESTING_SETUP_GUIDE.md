# Testing Setup Guide

**🔐 Public Repository - Security First**

This guide helps you securely configure MongoDB credentials and API keys for running multi-model prompt tests.

## Quick Start

### 1. Validate Your Environment

```bash
# Check if credentials are properly configured
pnpm exec tsx scripts/content/validate-environment.ts
```

### 2. Setup Script (Optional)

```bash
# Interactive setup helper
./scripts/content/setup-test-environment.sh
```

### 3. Manual Setup

If you prefer manual configuration:

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials (NEVER commit this file!)
nano .env.local
```

## Required Configuration

### MongoDB Connection (Required)

Add your MongoDB connection string to `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify?retryWrites=true&w=majority
```

**Where to get credentials:**
- MongoDB Atlas: Database → Connect → Drivers
- Local MongoDB: `mongodb://localhost:27017/engify`
- Hosted provider: Check your provider's dashboard

### API Keys (Optional - for testing)

```env
# OpenAI (for GPT-3.5 testing)
OPENAI_API_KEY=sk-...your-key-here

# Google AI (for Gemini Flash testing)
GOOGLE_API_KEY=...your-key-here

# Anthropic (for Claude testing)
ANTHROPIC_API_KEY=...your-key-here
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Google AI: https://makersuite.google.com/app/apikey
- Anthropic: https://console.anthropic.com/settings/keys

## Security Best Practices ✅

### ✅ DO:
- ✅ Store credentials in `.env.local` (gitignored)
- ✅ Use environment variables in all scripts
- ✅ Rotate API keys regularly
- ✅ Use read-only database users when possible
- ✅ Set spending limits on AI provider accounts
- ✅ Validate environment before running tests

### ❌ DON'T:
- ❌ Commit `.env.local` to git (it's in `.gitignore`)
- ❌ Hardcode credentials in scripts
- ❌ Share credentials in public issues/PRs
- ❌ Use production database for testing
- ❌ Commit real credentials to the repo
- ❌ Push sensitive data to GitHub

## Verification Steps

### 1. Check .gitignore

Verify `.env.local` is ignored:

```bash
git check-ignore .env.local
# Should output: .env.local
```

### 2. Run Validation

```bash
pnpm exec tsx scripts/content/validate-environment.ts
```

Expected output:
```
🔐 ENVIRONMENT VALIDATION

✅ MONGODB_URI
   Status: SET (mong...net)
   MongoDB connection string for data storage

✅ VALIDATION PASSED
```

### 3. Test MongoDB Connection

```bash
pnpm exec tsx scripts/content/check-db-simple.ts
```

Expected output:
```
✅ Connected to MongoDB!
Prompt Templates: 90
Web Content: 45
```

## Running Tests Safely

### Dry Run (Recommended First)

Test with 3 prompts only (~$0.01):

```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run
```

### Small Batch

Test 20 prompts (~$0.05):

```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --limit=20
```

### Full Test

Test all prompts (~$0.30):

```bash
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --all
```

## Budget Protection

The test scripts include built-in budget tracking:

- **Per-test cost**: ~$0.002 (2 models)
- **Dry-run cost**: ~$0.01 (3 prompts)
- **Full test cost**: ~$0.30 (90 prompts)
- **Budget limit**: $5.00 (safety margin)

Scripts will:
- Track cumulative cost
- Display cost per prompt
- Warn if approaching budget
- Fail if budget exceeded

## Troubleshooting

### "Cannot read properties of undefined (reading 'startsWith')"

**Cause**: `MONGODB_URI` not set in `.env.local`

**Fix**:
```bash
# Check if .env.local exists
ls -la .env.local

# If missing, copy template
cp .env.example .env.local

# Add your MongoDB URI
nano .env.local
```

### "MongoServerError: bad auth"

**Cause**: Incorrect MongoDB credentials

**Fix**:
1. Verify username/password in MongoDB Atlas
2. Ensure user has read/write permissions
3. Check IP whitelist (allow your IP or 0.0.0.0/0)
4. Update `MONGODB_URI` in `.env.local`

### "Error: OPENAI_API_KEY not found"

**Cause**: API key not configured (optional for testing)

**Fix**:
```bash
# Option 1: Skip OpenAI tests (script will skip gracefully)
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run

# Option 2: Add API key to .env.local
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

### Script doesn't load .env.local

**Cause**: Working directory mismatch

**Fix**: Always run from repo root:
```bash
cd /workspace
pnpm exec tsx scripts/content/test-prompts-multi-model.ts --dry-run
```

## File Security Reference

### ✅ Safe to Commit:
- `.env.example` - Template with placeholders
- `.env.production.example` - Production template
- `scripts/content/*.ts` - Scripts using env vars
- `docs/**/*.md` - Documentation

### ❌ NEVER Commit:
- `.env.local` - Your actual credentials (gitignored)
- `.env` - Legacy env file (gitignored)
- Any file with real API keys
- Database backups with user data

### Already Protected (in .gitignore):
```gitignore
.env.local
.env
.env*.local
npm-debug.log*
```

## Additional Resources

- [Environment Variables Best Practices](https://12factor.net/config)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [OpenAI API Key Safety](https://platform.openai.com/docs/guides/safety-best-practices)
- [Day 5 Content Quality Plan](../planning/DAY_5_PART_2_CONTENT_QUALITY.md)

## Support

If you encounter issues:

1. ✅ Run validation script first
2. ✅ Check all error messages carefully
3. ✅ Review this guide's troubleshooting section
4. ✅ Open an issue (without sharing credentials!)

**Remember**: This is a public repository. Never share real credentials in issues, PRs, or commits.

