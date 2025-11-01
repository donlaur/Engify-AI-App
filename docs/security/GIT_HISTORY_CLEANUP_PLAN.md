# Git History Cleanup Plan

## 🚨 Exposed Secrets Found in Git History

The security audit found the following **real credentials** exposed in git history:

1. **Cognito Client ID**: `[REDACTED_CLIENT_ID]` (REAL - found in history)
2. **Cognito User Pool ID**: `[REDACTED_USER_POOL_ID]` (REAL - found in history)
3. **AWS Account ID**: `[REDACTED_ACCOUNT_ID]` (REAL - found in history)

**Note:** These were found in documentation commits that have since been redacted, but they remain in git history.

## ⚠️ Critical Actions Required

### 1. Rotate Credentials IMMEDIATELY

**Before cleaning git history, rotate these credentials:**

1. **Cognito Client ID/Secret:**
   - Go to AWS Cognito Console
   - Create new App Client
   - Update `.env.local` with new credentials
   - Update Vercel environment variables

2. **AWS Account ID:**
   - This cannot be rotated (it's your account ID)
   - However, ensure IAM policies are locked down
   - Enable MFA on root account
   - Enable CloudTrail for audit logging

### 2. Clean Git History

**Option A: Use BFG Repo-Cleaner (Recommended)**

```bash
# Install BFG
brew install bfg

# Run cleanup script
./scripts/security/cleanup-git-history.sh
```

**Option B: Manual git filter-branch**

```bash
# See scripts/security/cleanup-git-history.sh for details
```

### 3. Force Push to Remote

**After cleaning history:**

```bash
# ⚠️ WARNING: This rewrites history
git push --force --all
git push --force --tags
```

### 4. Notify Collaborators

**If you have collaborators:**

- They MUST re-clone the repository
- Old clones will have the exposed credentials
- Do not pull/merge - complete re-clone required

## 📋 Cleanup Steps

### Step 1: Backup Current State

```bash
# Create backup branch
git branch backup-before-cleanup

# Create backup of current state
git bundle create backup-$(date +%Y%m%d).bundle --all
```

### Step 2: Install BFG (if not installed)

```bash
brew install bfg
```

### Step 3: Run Cleanup Script

```bash
cd /Users/donlaur/dev/Engify-AI-App
./scripts/security/cleanup-git-history.sh
```

The script will:

1. Replace Cognito Client ID with `[YOUR_CLIENT_ID]`
2. Replace Cognito User Pool ID with `[YOUR_USER_POOL_ID]`
3. Replace AWS Account ID with `[YOUR_AWS_ACCOUNT_ID]`
4. Clean up git reflog and garbage collect

### Step 4: Verify Cleanup

```bash
# Verify secrets are removed
git log --all --full-history -p | grep -E "\[REDACTED_CLIENT_ID\]|\[REDACTED_USER_POOL_ID\]|\[REDACTED_ACCOUNT_ID\]"

# Should return no results after cleanup
```

### Step 5: Force Push

```bash
# ⚠️ WARNING: This rewrites remote history
git push --force --all
git push --force --tags
```

### Step 6: Rotate Credentials

**After pushing cleaned history:**

1. **Update Cognito:**
   - Create new App Client in AWS Cognito
   - Update `.env.local`
   - Update Vercel environment variables
   - Test authentication

2. **Verify AWS Security:**
   - Enable MFA on root account
   - Review IAM policies
   - Enable CloudTrail

## 🔐 Security Best Practices Going Forward

### Pre-Commit Hook

Already implemented: `scripts/security/security-check.js`

### Regular Audits

Run git history audit regularly:

```bash
./scripts/security/audit-git-history.sh
```

### Credential Management

**Use AWS Secrets Manager** (see `docs/aws/AWS_INFRASTRUCTURE_MIGRATION.md`)

- Store all secrets in AWS Secrets Manager
- Never commit secrets to git
- Use environment variables for local dev
- Rotate secrets regularly

## 📊 Impact Assessment

### What Was Exposed

- ✅ Cognito Client ID (can be rotated)
- ✅ Cognito User Pool ID (cannot be rotated, but can be secured)
- ✅ AWS Account ID (cannot be rotated, but can be secured)

### Risk Level

- **Medium-High**: Cognito credentials can be used to authenticate
- **Low-Medium**: AWS Account ID alone cannot be used maliciously

### Mitigation

1. ✅ Rotate Cognito credentials immediately
2. ✅ Lock down AWS IAM policies
3. ✅ Enable MFA on AWS account
4. ✅ Enable CloudTrail for audit logging
5. ✅ Clean git history
6. ✅ Migrate to AWS Secrets Manager

## ✅ Checklist

- [ ] Backup current repository state
- [ ] Install BFG Repo-Cleaner
- [ ] Run cleanup script
- [ ] Verify secrets are removed from history
- [ ] Force push to remote
- [ ] Rotate Cognito credentials
- [ ] Update environment variables
- [ ] Test authentication
- [ ] Enable AWS security features (MFA, CloudTrail)
- [ ] Notify collaborators (if any)
- [ ] Document rotation in security notes

---

**Status:** Ready to execute cleanup

**Next Step:** Run `./scripts/security/cleanup-git-history.sh`
