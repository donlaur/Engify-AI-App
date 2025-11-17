# AWS Secrets Manager Setup Guide

Complete guide for setting up AWS Secrets Manager integration for the Engify.ai application. This document covers everything from initial setup to production deployment.

## Table of Contents

- [Why Use AWS Secrets Manager?](#why-use-aws-secrets-manager)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
  - [1. AWS Infrastructure Setup](#1-aws-infrastructure-setup)
  - [2. Migrate Secrets](#2-migrate-secrets)
  - [3. Configure Vercel](#3-configure-vercel)
  - [4. Verify Setup](#4-verify-setup)
- [Local Development](#local-development)
- [Security Best Practices](#security-best-practices)
- [Secret Rotation](#secret-rotation)
- [Monitoring and Auditing](#monitoring-and-auditing)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)
- [FAQs](#faqs)

## Why Use AWS Secrets Manager?

### Problems with Environment Variables

❌ **Current approach (.env files):**
- Secrets stored in plaintext files
- Easy to accidentally commit to git
- No audit trail of access
- No automatic rotation
- Difficult to update across environments
- No version history

✅ **AWS Secrets Manager benefits:**
- **Security**: Encrypted at rest and in transit
- **Auditability**: CloudTrail logs all access
- **Rotation**: Automatic rotation support
- **Version Control**: Track secret versions
- **Access Control**: IAM-based permissions
- **Centralized**: Single source of truth
- **Compliance**: Meets enterprise security requirements

### Cost-Benefit Analysis

**Cost:** ~$1.30/month (2 secrets + API calls with caching)
**Benefits:**
- ✅ Enterprise-grade security
- ✅ Compliance ready
- ✅ Professional portfolio showcase
- ✅ Production-ready architecture
- ✅ Peace of mind

**Verdict:** The security benefits far outweigh the minimal cost.

## Prerequisites

### Required

- ✅ AWS Account (free tier eligible)
- ✅ AWS CLI installed and configured
- ✅ Node.js 18+ and pnpm
- ✅ Vercel account (free tier works)
- ✅ Existing `.env.local` file with secrets

### AWS Permissions Required

Your IAM user needs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:PutSecretValue",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets",
        "iam:CreateUser",
        "iam:CreateAccessKey",
        "iam:CreatePolicy",
        "iam:AttachUserPolicy",
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack"
      ],
      "Resource": "*"
    }
  ]
}
```

## Quick Start

### 5-Minute Setup

```bash
# 1. Deploy AWS infrastructure
cd infrastructure/terraform
terraform init
terraform apply -var="environment=production"

# 2. Migrate secrets from .env.local to AWS
tsx scripts/aws/migrate-secrets.ts --validate

# 3. Get Vercel credentials
terraform output -raw vercel_secret_access_key

# 4. Add to Vercel (via dashboard or CLI)
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add AWS_SECRETS_NAME production

# 5. Deploy
vercel --prod

# Done! ✅
```

## Detailed Setup

### 1. AWS Infrastructure Setup

Choose either CloudFormation or Terraform:

#### Option A: CloudFormation (Recommended for AWS-native)

```bash
# Deploy the stack
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-production \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=SecretName,ParameterValue=engify-ai/app-secrets \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name engify-ai-secrets-production \
  --region us-east-1

# Get outputs
aws cloudformation describe-stacks \
  --stack-name engify-ai-secrets-production \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

#### Option B: Terraform (Recommended for multi-cloud)

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review what will be created
terraform plan -var="environment=production"

# Create infrastructure
terraform apply -var="environment=production"

# Note the outputs (you'll need these later)
terraform output
```

**What gets created:**
- AWS Secrets Manager secret (empty structure)
- IAM user for Vercel with read-only access
- IAM policy with least-privilege permissions
- CloudWatch log group for auditing
- CloudWatch alarm for unauthorized access

### 2. Migrate Secrets

Now upload your secrets from `.env.local` to AWS:

```bash
# Dry run first (preview what will be uploaded)
tsx scripts/aws/migrate-secrets.ts --dry-run

# Review the output, ensure secrets are correct
# Then upload for real
tsx scripts/aws/migrate-secrets.ts --validate

# Verify secrets were uploaded
aws secretsmanager get-secret-value \
  --secret-id engify-ai/app-secrets \
  --region us-east-1 \
  --query SecretString \
  --output text | jq
```

**Important:** The migration script does NOT delete your `.env.local` file. It's kept for local development.

### 3. Configure Vercel

#### Get AWS Credentials

From CloudFormation:
```bash
aws cloudformation describe-stacks \
  --stack-name engify-ai-secrets-production \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VercelAccessKeyId`].OutputValue' \
  --output text

aws cloudformation describe-stacks \
  --stack-name engify-ai-secrets-production \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VercelSecretAccessKey`].OutputValue' \
  --output text
```

From Terraform:
```bash
terraform output vercel_access_key_id
terraform output -raw vercel_secret_access_key
```

#### Add to Vercel Environment Variables

**Via Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these variables for **Production** environment:

| Name | Value | Environment |
|------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | (from output above) | Production |
| `AWS_SECRET_ACCESS_KEY` | (from output above) | Production |
| `AWS_REGION` | `us-east-1` | Production |
| `AWS_SECRETS_NAME` | `engify-ai/app-secrets` | Production |

**Via Vercel CLI:**
```bash
# Set production environment variables
vercel env add AWS_ACCESS_KEY_ID production
# Paste the value when prompted

vercel env add AWS_SECRET_ACCESS_KEY production
# Paste the value when prompted

vercel env add AWS_REGION production
# Enter: us-east-1

vercel env add AWS_SECRETS_NAME production
# Enter: engify-ai/app-secrets
```

**⚠️ Security Note:** Only add these to Production environment, not Preview or Development.

### 4. Verify Setup

#### Test Locally (Optional)

```bash
# Set AWS credentials temporarily
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1
export AWS_SECRETS_NAME=engify-ai/app-secrets

# Run the app
pnpm dev

# Check logs for:
# ✅ Secrets loaded successfully from AWS Secrets Manager
```

#### Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Check deployment logs
vercel logs --prod

# Look for:
# ✅ Configuration loaded successfully
# ✅ Secrets loaded successfully from AWS Secrets Manager
```

#### Verify Application

1. Visit your production URL
2. Check that AI features work (requires API keys)
3. Check that authentication works (requires NEXTAUTH_SECRET)
4. Check that database connects (requires MONGODB_URI)

## Local Development

### Option 1: Use .env.local (Recommended)

Keep using `.env.local` for local development. The secrets manager automatically falls back to environment variables when AWS is not configured.

```bash
# Just run as normal
pnpm dev
```

No changes needed! The application will use `.env.local` in development.

### Option 2: Use AWS Secrets Manager Locally

```bash
# Configure AWS CLI
aws configure

# Run the app (it will use AWS Secrets Manager)
pnpm dev
```

The app detects AWS credentials and uses Secrets Manager automatically.

### Mock Secrets for Testing

For unit tests, use mock secrets:

```typescript
// In your test setup
import { resetSecretsManager } from '@/lib/aws/secrets-manager';

beforeEach(() => {
  // Use environment variables for testing
  process.env.OPENAI_API_KEY = 'test-key';
  resetSecretsManager();
});
```

## Security Best Practices

### 1. Least Privilege IAM Permissions

✅ **What we do:**
- Vercel user can only READ secrets
- No write, update, or delete permissions
- Scoped to specific secret ARN

❌ **Don't do:**
- Grant `secretsmanager:*` permissions
- Use root AWS account credentials
- Share access keys across environments

### 2. Never Log Secret Values

✅ **What we do:**
```typescript
console.log('API key configured:', config.OPENAI_API_KEY ? '✓' : '✗');
// Output: API key configured: ✓
```

❌ **Don't do:**
```typescript
console.log('API key:', config.OPENAI_API_KEY);
// Output: API key: sk-abc123... (LEAKED!)
```

### 3. Rotate Secrets Regularly

```bash
# Rotate a secret quarterly
tsx scripts/aws/rotate-secret.ts \
  --name engify-ai/app-secrets \
  --generate \
  --length 64 \
  --backup
```

### 4. Enable CloudTrail

Track all secret access:

```bash
aws cloudtrail create-trail \
  --name engify-ai-secrets-audit \
  --s3-bucket-name your-cloudtrail-bucket

aws cloudtrail start-logging \
  --name engify-ai-secrets-audit
```

### 5. Set Up Alerts

Get notified of unauthorized access:

```bash
# Create SNS topic
aws sns create-topic --name security-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:security-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Update CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name engify-ai-secrets-unauthorized-production \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:security-alerts
```

### 6. Use KMS Encryption (Optional)

For extra security, use AWS KMS:

```bash
# Create KMS key
aws kms create-key --description "Engify.ai secrets encryption"

# Update secret to use KMS
aws secretsmanager update-secret \
  --secret-id engify-ai/app-secrets \
  --kms-key-id alias/engify-ai-secrets
```

## Secret Rotation

### Manual Rotation

#### Rotate Specific Secret Field

```bash
# Example: Rotate OpenAI API key
tsx scripts/aws/rotate-secret.ts \
  --name engify-ai/app-secrets \
  --new-value "sk-new-key-here" \
  --backup
```

#### Generate Random Secret

```bash
# Generate a 64-character random secret
tsx scripts/aws/rotate-secret.ts \
  --name engify-ai/app-secrets \
  --generate \
  --length 64 \
  --backup
```

### Automatic Rotation

Enable automatic rotation for database credentials:

```bash
aws secretsmanager rotate-secret \
  --secret-id engify-ai/app-secrets \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRotation \
  --rotation-rules AutomaticallyAfterDays=90
```

**Note:** Requires a rotation Lambda function (not included in basic setup).

### Rotation Best Practices

1. ✅ Always create a backup before rotation
2. ✅ Rotate during low-traffic periods
3. ✅ Update secrets one at a time
4. ✅ Monitor application logs after rotation
5. ✅ Keep old secret for 24 hours as fallback
6. ✅ Document rotation in change log

## Monitoring and Auditing

### CloudWatch Logs

View secret access logs:

```bash
# Recent access attempts
aws logs tail /aws/secretsmanager/engify-ai/production --follow

# Filter for specific secret
aws logs filter-log-events \
  --log-group-name /aws/secretsmanager/engify-ai/production \
  --filter-pattern "engify-ai/app-secrets"
```

### CloudTrail Audit

Track all Secrets Manager API calls:

```bash
# List recent GetSecretValue calls
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=GetSecretValue \
  --max-results 50
```

### Metrics Dashboard

Create a CloudWatch dashboard:

```bash
aws cloudwatch put-dashboard \
  --dashboard-name Engify-Secrets-Monitoring \
  --dashboard-body file://infrastructure/cloudwatch-dashboard.json
```

### Alert on Anomalies

Set up alerts for:
- Unusual number of API calls
- Access from unexpected IP addresses
- Failed access attempts
- Secret updates outside maintenance window

## Troubleshooting

### Issue: "Secret not found"

**Symptoms:**
```
Error: Secret "engify-ai/app-secrets" not found in AWS Secrets Manager
```

**Solutions:**
1. Verify secret name: `aws secretsmanager list-secrets`
2. Check region: Ensure `AWS_REGION` matches where secret was created
3. Verify credentials: `aws sts get-caller-identity`

### Issue: "Access Denied"

**Symptoms:**
```
Error: User is not authorized to perform: secretsmanager:GetSecretValue
```

**Solutions:**
1. Verify IAM policy is attached: `aws iam list-attached-user-policies --user-name engify-ai-vercel-production`
2. Check policy permissions: `aws iam get-policy-version --policy-arn <arn> --version-id v1`
3. Ensure secret ARN matches in policy

### Issue: "Secrets not loading in Vercel"

**Symptoms:**
- Application works locally but fails in Vercel
- Error: "MONGODB_URI is required"

**Solutions:**
1. Check Vercel environment variables are set for Production
2. Verify AWS credentials are correct
3. Check Vercel deployment logs: `vercel logs --prod`
4. Ensure `NODE_ENV=production` in Vercel

### Issue: High API costs

**Symptoms:**
- AWS bill higher than expected
- Many secretsmanager API calls

**Solutions:**
1. Check cache is enabled (default: 15 minutes)
2. Verify cache TTL: Should be 900000ms (15 minutes)
3. Review application logs for excessive secret fetches
4. Consider increasing cache TTL to 30 minutes

### Issue: Cache not working

**Symptoms:**
- Every request fetches from AWS
- High latency

**Solutions:**
```typescript
// Verify cache is enabled
import { getSecretsManager } from '@/lib/aws/secrets-manager';

const manager = getSecretsManager();
console.log(manager.getCacheStats());
// Should show cached entries
```

## Cost Optimization

### Current Costs

**AWS Secrets Manager:**
- $0.40/secret/month × 2 secrets = $0.80
- $0.05/10,000 API calls
- ~100,000 calls/month (with 15-min cache) = $0.50
- **Total: ~$1.30/month**

### Optimization Strategies

#### 1. Increase Cache TTL

```typescript
// Default: 15 minutes
const manager = getSecretsManager({
  cacheTtlMs: 30 * 60 * 1000, // 30 minutes
});
```

**Savings:** 50% reduction in API calls = $0.25/month

#### 2. Batch Secret Retrieval

```typescript
// ✅ Good: Fetch all secrets once
const secrets = await getAppSecrets();

// ❌ Bad: Fetch individually
const openai = await getSecret('OPENAI_API_KEY');
const anthropic = await getSecret('ANTHROPIC_API_KEY');
```

**Savings:** 80% reduction in API calls = $0.40/month

#### 3. Use Reserved Capacity (Enterprise)

For > 100 secrets, contact AWS for volume discounts.

### Free Tier

**AWS Free Tier includes:**
- 30-day trial: First 40,000 API calls/month free
- After trial: No free tier for Secrets Manager

**Alternatives for free tier:**
- Use environment variables in Vercel (less secure)
- Use encrypted environment variables (DIY solution)

## FAQs

### Q: Do I need AWS Secrets Manager for a personal project?

**A:** For learning and small projects, environment variables in Vercel are fine. Use Secrets Manager when:
- You're preparing for a production/enterprise role
- You want to demonstrate security best practices
- You're handling sensitive user data
- Compliance requires it

### Q: What happens if AWS Secrets Manager is down?

**A:** The application will:
1. Attempt to fetch from AWS (with 3 retries)
2. Fall back to environment variables (if configured)
3. Use cached values (for 15 minutes after last fetch)

Set `fallbackToEnv: true` for maximum resilience.

### Q: Can I use this with other cloud providers?

**A:** Yes! The secrets manager pattern works with:
- **GCP:** Google Secret Manager
- **Azure:** Azure Key Vault
- **HashiCorp Vault:** Self-hosted option

The code structure is similar—just swap the AWS SDK.

### Q: How do I handle multiple environments?

**A:** Create separate secrets per environment:

```bash
# Development
terraform apply -var="environment=dev" -var="secret_name=engify-ai-dev/app-secrets"

# Staging
terraform apply -var="environment=staging" -var="secret_name=engify-ai-staging/app-secrets"

# Production
terraform apply -var="environment=production" -var="secret_name=engify-ai-prod/app-secrets"
```

### Q: Is the 15-minute cache safe?

**A:** Yes, for most use cases:
- ✅ API keys rarely change
- ✅ Faster performance
- ✅ Lower costs
- ⚠️ Secret rotation takes up to 15 minutes to propagate

For immediate rotation, clear the cache:
```typescript
import { secretsManager } from '@/lib/aws/secrets-manager';
secretsManager.clearCache();
```

### Q: Can I use this in serverless functions?

**A:** Absolutely! It's designed for Next.js API routes (serverless functions). The cache is per-function-instance, so:
- Cold starts: Fetch from AWS (~100-200ms)
- Warm starts: Use cache (~1ms)

### Q: What about CI/CD pipelines?

**A:** For GitHub Actions:

```yaml
# .github/workflows/deploy.yml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: us-east-1
  AWS_SECRETS_NAME: engify-ai/app-secrets

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: pnpm test
```

Store AWS credentials in GitHub Secrets.

## Additional Resources

### Official Documentation

- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Related Files

- **Implementation:** [`/src/lib/aws/secrets-manager.ts`](/src/lib/aws/secrets-manager.ts)
- **Types:** [`/src/lib/aws/types.ts`](/src/lib/aws/types.ts)
- **Config:** [`/src/lib/config/secrets.ts`](/src/lib/config/secrets.ts)
- **Migration:** [`/scripts/aws/migrate-secrets.ts`](/scripts/aws/migrate-secrets.ts)
- **Infrastructure:** [`/infrastructure/terraform/secrets-manager.tf`](/infrastructure/terraform/secrets-manager.tf)

### Example Projects

- See this repository for a complete working example
- All code is production-ready and enterprise-grade

## Support

**Issues?** Open an issue on GitHub with:
- Error messages (redact secrets!)
- Steps to reproduce
- Environment (Node version, OS, etc.)

**Questions?** Check the [Troubleshooting](#troubleshooting) section first.

---

**Last Updated:** November 2025
**Maintainer:** Donnie Laur (donlaur@engify.ai)
**License:** MIT
