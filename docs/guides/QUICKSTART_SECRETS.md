# AWS Secrets Manager - Quick Start Guide

Get AWS Secrets Manager set up in 5 minutes.

## Prerequisites

✅ AWS Account
✅ AWS CLI configured (`aws configure`)
✅ `.env.local` file with your secrets

## Step 1: Deploy Infrastructure (2 minutes)

Choose **either** CloudFormation **or** Terraform:

### Option A: CloudFormation
```bash
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-production \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name engify-ai-secrets-production
```

### Option B: Terraform
```bash
cd infrastructure/terraform
terraform init
terraform apply -var="environment=production" -auto-approve
cd ../..
```

## Step 2: Migrate Secrets (1 minute)

```bash
# Preview what will be uploaded
tsx scripts/aws/migrate-secrets.ts --dry-run

# Upload secrets
tsx scripts/aws/migrate-secrets.ts --validate
```

## Step 3: Get Vercel Credentials (30 seconds)

### CloudFormation:
```bash
export VERCEL_KEY=$(aws cloudformation describe-stacks \
  --stack-name engify-ai-secrets-production \
  --query 'Stacks[0].Outputs[?OutputKey==`VercelAccessKeyId`].OutputValue' \
  --output text)

export VERCEL_SECRET=$(aws cloudformation describe-stacks \
  --stack-name engify-ai-secrets-production \
  --query 'Stacks[0].Outputs[?OutputKey==`VercelSecretAccessKey`].OutputValue' \
  --output text)
```

### Terraform:
```bash
cd infrastructure/terraform
export VERCEL_KEY=$(terraform output -raw vercel_access_key_id)
export VERCEL_SECRET=$(terraform output -raw vercel_secret_access_key)
cd ../..
```

## Step 4: Configure Vercel (1 minute)

```bash
# Add environment variables
echo $VERCEL_KEY | vercel env add AWS_ACCESS_KEY_ID production
echo $VERCEL_SECRET | vercel env add AWS_SECRET_ACCESS_KEY production
echo "us-east-1" | vercel env add AWS_REGION production
echo "engify-ai/app-secrets" | vercel env add AWS_SECRETS_NAME production
```

Or via Vercel Dashboard:
1. Go to Project → Settings → Environment Variables
2. Add for **Production** environment:
   - `AWS_ACCESS_KEY_ID` = (value from Step 3)
   - `AWS_SECRET_ACCESS_KEY` = (value from Step 3)
   - `AWS_REGION` = `us-east-1`
   - `AWS_SECRETS_NAME` = `engify-ai/app-secrets`

## Step 5: Deploy (30 seconds)

```bash
vercel --prod
```

## Verify It Works

```bash
# Check deployment logs
vercel logs --prod | grep -i "secrets loaded"

# Should see:
# ✅ Secrets loaded successfully from AWS Secrets Manager
```

## Done! 🎉

Your application is now using AWS Secrets Manager!

## What Just Happened?

1. ✅ Created AWS infrastructure (secret, IAM user, policies)
2. ✅ Uploaded secrets from `.env.local` to AWS
3. ✅ Configured Vercel with AWS credentials
4. ✅ Deployed application using AWS Secrets Manager

## Next Steps

### Local Development (Optional)

Your `.env.local` still works! The app automatically uses it in development:

```bash
pnpm dev
# Uses .env.local (no AWS needed)
```

### Rotate Secrets (Quarterly)

```bash
tsx scripts/aws/rotate-secret.ts \
  --name engify-ai/app-secrets \
  --generate \
  --length 64 \
  --backup
```

### Monitor Access

```bash
# View secret access logs
aws logs tail /aws/secretsmanager/engify-ai/production --follow
```

## Troubleshooting

### "Access Denied" error

```bash
# Verify credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam list-attached-user-policies --user-name engify-ai-vercel-production
```

### Secrets not loading in Vercel

1. Check Vercel environment variables are set
2. Verify they're set for **Production** environment
3. Check deployment logs: `vercel logs --prod`

### High AWS costs

Check cache is working:
```bash
# Cache should be 15 minutes (900000ms)
grep "cacheTtlMs" src/lib/aws/secrets-manager.ts
```

## Full Documentation

For detailed information, see:
- [AWS_SECRETS_SETUP.md](./AWS_SECRETS_SETUP.md) - Complete guide
- [scripts/aws/README.md](./scripts/aws/README.md) - Script reference
- [infrastructure/README.md](./infrastructure/README.md) - Infrastructure docs

## Costs

**~$1.30/month** for AWS Secrets Manager:
- $0.40/secret × 2 = $0.80
- ~100k API calls/month = $0.50

Worth it for enterprise-grade security! 🔒

## Support

Having issues?
1. Check [AWS_SECRETS_SETUP.md](./AWS_SECRETS_SETUP.md#troubleshooting)
2. Open an issue on GitHub

---

**Quick Start Complete!** You now have production-ready secrets management. 🚀
