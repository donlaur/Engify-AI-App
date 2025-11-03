# AWS Deployment Scripts - Security Guidelines

**Date:** November 3, 2025  
**Status:** Security Hardened

---

## 🔒 Security Policy

**NEVER hardcode AWS Account IDs, regions, or any credentials in deployment scripts.**

### ✅ Correct Approach

**Scripts should:**

1. **Auto-detect account ID** from AWS credentials using `aws sts get-caller-identity`
2. **Use environment variables** with sensible defaults (for non-sensitive values like region)
3. **Fail fast** if required values cannot be determined
4. **Document required environment variables** in script comments

### ❌ Wrong Approach

```bash
# ❌ WRONG: Hardcoded account ID
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-123456789012}"

# ✅ CORRECT: Auto-detect from credentials
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

---

## 📋 Script Requirements

All AWS deployment scripts must:

1. **No hardcoded account IDs** - Always detect from credentials
2. **No hardcoded regions** - Use environment variable with sensible default
3. **No hardcoded function names** - Use environment variables or defaults (okay for non-sensitive names)
4. **Clear error messages** - If required values cannot be determined
5. **Documentation** - Explain required environment variables

---

## 🔍 Current Scripts Status

### ✅ Fixed: `scripts/aws/deploy-multi-agent-lambda.sh`

- **Before:** Hardcoded `AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-123456789012}"`
- **After:** Auto-detects from `aws sts get-caller-identity`
- **Status:** Secure ✅

### ⚠️ To Review: Other Deployment Scripts

- `scripts/deploy-lambda.sh` - RAG Lambda deployment
- `scripts/aws/deploy-python-backend.sh` - Python backend deployment

---

## 🛡️ Pre-Commit Protection

The pre-commit hooks already check for:

- AWS Access Key IDs (`AKIA...`)
- AWS Secret Access Keys
- MongoDB connection strings with credentials
- Hardcoded API keys

**Consider adding check for hardcoded AWS Account IDs** (12-digit numbers in default values).

---

## 📝 Usage Example

```bash
# ✅ CORRECT: Script auto-detects account ID
./scripts/aws/deploy-multi-agent-lambda.sh

# ✅ CORRECT: Override region if needed
AWS_REGION=us-west-2 ./scripts/aws/deploy-multi-agent-lambda.sh

# ✅ CORRECT: Explicit account ID (if needed for cross-account)
AWS_ACCOUNT_ID=123456789012 AWS_REGION=us-east-1 ./scripts/aws/deploy-multi-agent-lambda.sh
```

---

## 🔐 Why This Matters

**AWS Account IDs are:**

- Infrastructure identifiers (less sensitive than API keys)
- But still reveal your AWS account structure
- Can be used in reconnaissance attacks
- Should not be committed to public repositories

**Best Practice:** Always detect from credentials or require as environment variable.
