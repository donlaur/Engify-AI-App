# Multi-Agent Production Setup Status

**Date:** November 3, 2025  
**Status:** ⚠️ AWS Credentials Missing

---

## Environment Variables Check

**Vercel Project:** `donlaurs-projects/engify-ai-app`  
**Total Variables:** 21  
**AWS Variables:** 0 ❌

---

## Missing AWS Variables

These are **required** for Lambda invocation:

- ❌ `AWS_ACCESS_KEY_ID` - NOT SET
- ❌ `AWS_SECRET_ACCESS_KEY` - NOT SET  
- ❌ `AWS_REGION` - NOT SET (should be `us-east-2`)

**Optional:**
- ⚠️ `MULTI_AGENT_LAMBDA_FUNCTION_NAME` - NOT SET (will use default: `engify-ai-integration-workbench`)

---

## Current Error

**500 Internal Server Error** when calling `/api/agents/scrum-meeting`

**Error Message:** "The security token included in the request is invalid"

**Root Cause:** AWS credentials not configured in Vercel, so Lambda client cannot authenticate to invoke Lambda function.

---

## Setup Required

### Step 1: Create IAM User in AWS

```bash
# Get your AWS Account ID
aws sts get-caller-identity --query Account --output text

# Create IAM user
aws iam create-user --user-name engify-vercel-lambda-invoker

# Create access key
aws iam create-access-key --user-name engify-vercel-lambda-invoker
```

**Save:** Access Key ID and Secret Access Key

### Step 2: Create IAM Policy

Create policy JSON file:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-2:<YOUR_ACCOUNT_ID>:function:engify-ai-integration-workbench"
    }
  ]
}
```

Create and attach policy:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws iam create-policy \
  --policy-name Engify-Vercel-Lambda-Invoke \
  --policy-document file://vercel-lambda-policy.json

aws iam attach-user-policy \
  --user-name engify-vercel-lambda-invoker \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/Engify-Vercel-Lambda-Invoke
```

### Step 3: Set Vercel Environment Variables

1. Go to: https://vercel.com/donlaurs-projects/engify-ai-app/settings/environment-variables

2. Add these variables:
   - `AWS_ACCESS_KEY_ID` = (from Step 1)
   - `AWS_SECRET_ACCESS_KEY` = (from Step 1)
   - `AWS_REGION` = `us-east-2`

3. Enable for: Production, Preview, Development

4. Save and **redeploy**

---

## Verification

After setup and redeploy:

```bash
# Test endpoint
curl -X POST https://engify.ai/api/agents/scrum-meeting \
  -H "Content-Type: application/json" \
  -d '{"situation":"test"}'
```

**Expected:** 200 OK with multi-agent response  
**Current:** 500 error (will be fixed after AWS credentials added)

---

## Related Documentation

- [Quick AWS Setup Guide](../aws/QUICK_AWS_SETUP.md)
- [Detailed Vercel Lambda Setup](../aws/VERCEL_LAMBDA_SETUP.md)
- [Production Verification Guide](./MULTI_AGENT_PRODUCTION_VERIFICATION.md)

---

**Status:** Code ready, AWS credentials need to be configured.

