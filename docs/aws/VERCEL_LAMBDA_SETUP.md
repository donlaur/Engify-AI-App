# Vercel Lambda Invocation Setup

**Purpose**: Configure Vercel to invoke AWS Lambda functions for multi-agent workflow

**Last Updated**: November 3, 2025

---

## Quick Setup (5 minutes)

### Step 1: Create IAM User for Vercel

```bash
# Create IAM user
aws iam create-user --user-name engify-vercel-lambda-invoker

# Create access key
aws iam create-access-key --user-name engify-vercel-lambda-invoker
```

**Save the output** - you'll need `AccessKeyId` and `SecretAccessKey` for Vercel.

### Step 2: Create IAM Policy

Create a file `vercel-lambda-policy.json`:

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

**Replace `<YOUR_ACCOUNT_ID>` with your AWS Account ID** (get it with `aws sts get-caller-identity --query Account --output text`)

Attach the policy:

```bash
aws iam create-policy \
  --policy-name Engify-Vercel-Lambda-Invoke \
  --policy-document file://vercel-lambda-policy.json

# Get your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Attach policy to user
aws iam attach-user-policy \
  --user-name engify-vercel-lambda-invoker \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/Engify-Vercel-Lambda-Invoke
```

### Step 3: Set Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `AWS_ACCESS_KEY_ID` | (from Step 1) | Production, Preview, Development |
   | `AWS_SECRET_ACCESS_KEY` | (from Step 1) | Production, Preview, Development |
   | `AWS_REGION` | `us-east-2` | Production, Preview, Development |

3. **Redeploy** your application (or wait for automatic redeploy)

### Step 4: Verify Setup

```bash
# Test Lambda invocation from Vercel
# Use the multi-agent tool: https://engify.ai/workbench/multi-agent
```

---

## Security Best Practices

1. **Least Privilege**: The IAM policy only allows `lambda:InvokeFunction` on the specific Lambda function
2. **Separate User**: Use a dedicated IAM user for Vercel (not your admin account)
3. **Rotate Keys**: Rotate access keys every 90 days
4. **Monitor Usage**: Enable CloudTrail to audit Lambda invocations

---

## Troubleshooting

### Error: "AccessDeniedException"

**Cause**: IAM user doesn't have permission to invoke Lambda

**Fix**: Verify policy is attached:
```bash
aws iam list-attached-user-policies --user-name engify-vercel-lambda-invoker
```

### Error: "ResourceNotFoundException"

**Cause**: Lambda function name incorrect or doesn't exist

**Fix**: Verify Lambda function exists:
```bash
aws lambda get-function --function-name engify-ai-integration-workbench
```

### Error: "InvalidSignatureException"

**Cause**: AWS credentials incorrect or expired

**Fix**: 
1. Verify environment variables in Vercel are correct
2. Regenerate access keys if needed
3. Ensure `AWS_REGION` is set to `us-east-2`

---

## Related Documentation

- [AWS IAM Policies](../aws/IAM_POLICIES.md)
- [Multi-Agent Deployment Checklist](../aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md)
- [Lambda Deployment Guide](../lambda/README-multi-agent.md)

