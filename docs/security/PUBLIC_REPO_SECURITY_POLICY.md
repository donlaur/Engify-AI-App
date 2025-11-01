# Security Policy for Public Repository

## Overview

This is a **public repository** intended for enterprise use. All code, documentation, and commits must follow strict security guidelines to prevent credential exposure.

## 🔒 Security Rules

### 1. **NEVER Commit Credentials**

**DO NOT commit:**

- ❌ API keys (OpenAI, Google, AWS, etc.)
- ❌ Database connection strings with credentials
- ❌ AWS Access Keys or Secret Keys
- ❌ Cognito Client IDs, Client Secrets, or User Pool IDs
- ❌ OAuth client secrets
- ❌ Passwords or password hashes
- ❌ Personal email addresses (use placeholders)
- ❌ AWS Account IDs
- ❌ Any production secrets

**ALWAYS use:**

- ✅ Environment variables (`.env.local` - gitignored)
- ✅ Placeholders: `[YOUR_API_KEY]`, `[YOUR_CLIENT_ID]`
- ✅ Example values: `your-api-key-here`, `example@example.com`
- ✅ Generic patterns: `username:password@host`, `sk-...`

### 2. **Documentation Standards**

**In documentation files:**

- ❌ Never include real credentials
- ❌ Never include personal email addresses
- ❌ Never include AWS Account IDs
- ✅ Use placeholders: `[YOUR_USER_POOL_ID]`, `[YOUR_CLIENT_ID]`
- ✅ Use example domains: `example.com`, `your-domain.com`
- ✅ Use generic patterns: `mongodb+srv://user:pass@host`

### 3. **Code Standards**

**In code files:**

- ❌ Never hardcode credentials
- ❌ Never log credentials (even in debug)
- ✅ Always use `process.env.VARIABLE_NAME`
- ✅ Validate environment variables exist
- ✅ Provide clear error messages if missing

### 4. **Git History**

**If credentials were committed:**

1. ⚠️ Consider them **compromised**
2. 🔄 Rotate all exposed credentials immediately
3. 🗑️ Remove from git history (if critical - requires force push)
4. 📝 Document the rotation in security notes

**Note:** Git history is permanent. Even if removed, credentials may exist in:

- Git clones
- GitHub fork history
- CI/CD logs
- Backup systems

### 5. **Pre-Commit Checks**

**Automated checks prevent:**

- AWS Access Key IDs (`AKIA...`)
- MongoDB connection strings with credentials
- Hardcoded API keys
- Cognito credentials

**If pre-commit fails:**

- Fix the issue before committing
- Never bypass security checks
- Use environment variables instead

## 🔍 Security Audit Checklist

Before committing:

- [ ] No API keys in code or docs
- [ ] No database connection strings with credentials
- [ ] No AWS credentials
- [ ] No Cognito IDs/secrets
- [ ] No personal email addresses
- [ ] No AWS Account IDs
- [ ] All secrets use environment variables
- [ ] Documentation uses placeholders
- [ ] Pre-commit hooks pass

## 🚨 If Credentials Are Exposed

**Immediate actions:**

1. **Rotate credentials** (if exposed)
   - Generate new API keys
   - Create new Cognito App Client
   - Reset database passwords
   - Revoke AWS access keys

2. **Remove from repo** (if still present)
   - Update files with placeholders
   - Commit security fix
   - Document rotation

3. **Review git history**
   - Check what was exposed
   - Document exposure timeline
   - Consider git history cleanup (if critical)

4. **Update security documentation**
   - Note what was exposed
   - Document rotation steps
   - Update audit checklist

## 📋 Environment Variables

**All secrets MUST be in environment variables:**

```bash
# ✅ CORRECT: In .env.local (gitignored)
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
COGNITO_CLIENT_SECRET=...

# ❌ WRONG: In code or docs
const apiKey = 'sk-abc123...';  // NO!
```

**Documentation examples:**

```bash
# ✅ CORRECT: In docs
OPENAI_API_KEY=[YOUR_API_KEY]
MONGODB_URI=mongodb+srv://[user]:[pass]@[host]
COGNITO_CLIENT_ID=[YOUR_CLIENT_ID]

# ❌ WRONG: In docs
OPENAI_API_KEY=sk-abc123...  # NO!
```

## 🔐 Enterprise Readiness

**For enterprise customers reviewing this repo:**

- ✅ No credentials in code or documentation
- ✅ All secrets use environment variables
- ✅ Pre-commit hooks prevent credential commits
- ✅ Security audit script available
- ✅ Clear security policy documented
- ✅ Regular security reviews

**If you find exposed credentials:**

- Report via security issue (GitHub)
- Credentials will be rotated immediately
- Security process will be improved

## 📚 Resources

- `.gitignore` - Ensures `.env.local` is never committed
- `scripts/security/audit-secrets.js` - Automated security audit
- `.husky/pre-commit` - Pre-commit security checks
- `docs/security/` - Security documentation

---

**Remember:** This is a public repo. Assume everything committed is public forever. When in doubt, use environment variables and placeholders.
