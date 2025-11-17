# AWS Secrets Manager Scripts

Quick reference guide for AWS Secrets Manager management scripts.

## Available Scripts

### 1. Migrate Secrets (`migrate-secrets.ts`)

Upload secrets from `.env.local` to AWS Secrets Manager.

**Usage:**
```bash
# Dry run (preview what will be uploaded)
tsx scripts/aws/migrate-secrets.ts --dry-run

# Upload secrets
tsx scripts/aws/migrate-secrets.ts

# Upload with validation
tsx scripts/aws/migrate-secrets.ts --validate

# Custom secret name and region
tsx scripts/aws/migrate-secrets.ts \
  --secret-name my-app/secrets \
  --region us-west-2 \
  --env-file .env.production
```

**Options:**
- `--secret-name <name>` - Secret name in AWS (default: engify-ai/app-secrets)
- `--region <region>` - AWS region (default: us-east-1)
- `--env-file <path>` - Path to .env file (default: .env.local)
- `--dry-run` - Preview without uploading
- `--validate` - Validate after upload
- `--help` - Show help

### 2. Create Secret (`create-secret.ts`)

Create individual secrets or update specific fields.

**Usage:**
```bash
# Create a simple secret
tsx scripts/aws/create-secret.ts \
  --name my-api-key \
  --value "sk-xxx"

# Create from file
tsx scripts/aws/create-secret.ts \
  --name my-certificate \
  --file ./cert.pem \
  --description "SSL certificate"

# Update existing secret
tsx scripts/aws/create-secret.ts \
  --name my-api-key \
  --value "sk-new" \
  --update
```

**Options:**
- `--name <name>` - Secret name (required)
- `--value <value>` - Secret value (required, or use --file)
- `--file <path>` - Read value from file
- `--description <text>` - Secret description
- `--region <region>` - AWS region (default: us-east-1)
- `--update` - Update existing secret
- `--help` - Show help

### 3. Rotate Secret (`rotate-secret.ts`)

Rotate secrets with backup and verification.

**Usage:**
```bash
# Rotate with new value
tsx scripts/aws/rotate-secret.ts \
  --name my-api-key \
  --new-value "new-secret-value"

# Generate random secret (64 characters)
tsx scripts/aws/rotate-secret.ts \
  --name my-api-key \
  --generate \
  --length 64

# Rotate with backup
tsx scripts/aws/rotate-secret.ts \
  --name my-api-key \
  --new-value "new-value" \
  --backup

# Rotate without verification
tsx scripts/aws/rotate-secret.ts \
  --name my-api-key \
  --new-value "new-value" \
  --no-verify
```

**Options:**
- `--name <name>` - Secret name (required)
- `--new-value <value>` - New secret value (required, or use --generate)
- `--generate` - Generate random secret
- `--length <number>` - Length for generated secret (default: 32)
- `--region <region>` - AWS region (default: us-east-1)
- `--backup` - Create backup before rotation
- `--no-verify` - Skip verification
- `--help` - Show help

## Common Workflows

### Initial Setup

```bash
# 1. Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform apply -var="environment=production"

# 2. Migrate secrets
cd ../..
tsx scripts/aws/migrate-secrets.ts --validate

# 3. Get Vercel credentials
terraform output -raw vercel_secret_access_key

# 4. Configure Vercel
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add AWS_SECRETS_NAME production

# 5. Deploy
vercel --prod
```

### Update Single Secret

```bash
# Update just the OpenAI API key
tsx scripts/aws/create-secret.ts \
  --name engify-ai/app-secrets \
  --value '{"aiProviders":{"OPENAI_API_KEY":"sk-new-key"}}' \
  --update
```

### Quarterly Rotation

```bash
# Rotate encryption key with backup
tsx scripts/aws/rotate-secret.ts \
  --name engify-ai/app-secrets \
  --generate \
  --length 64 \
  --backup
```

### Disaster Recovery

```bash
# List all backups
aws secretsmanager list-secrets \
  --filters Key=tag-key,Values=Backup

# Restore from backup
aws secretsmanager get-secret-value \
  --secret-id engify-ai/app-secrets-backup-2025-11-17 \
  --query SecretString \
  --output text | \
tsx scripts/aws/create-secret.ts \
  --name engify-ai/app-secrets \
  --update
```

## Prerequisites

### AWS Credentials

Set up AWS credentials before running scripts:

```bash
# Option 1: AWS CLI configuration
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

### Required IAM Permissions

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
        "secretsmanager:ListSecrets"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### Error: "AWS credentials not found"

**Solution:**
```bash
# Check if credentials are configured
aws sts get-caller-identity

# If not, configure them
aws configure
```

### Error: "Secret already exists"

**Solution:**
Use `--update` flag to update existing secret:
```bash
tsx scripts/aws/create-secret.ts --name my-secret --value "new" --update
```

### Error: "Access Denied"

**Solution:**
Verify IAM permissions:
```bash
# Check attached policies
aws iam list-attached-user-policies --user-name your-username

# Check inline policies
aws iam list-user-policies --user-name your-username
```

### Error: "Secret not found"

**Solution:**
```bash
# List all secrets
aws secretsmanager list-secrets

# Check the secret name and region
```

## Best Practices

1. ✅ **Always use --dry-run first** - Preview changes before applying
2. ✅ **Create backups before rotation** - Use --backup flag
3. ✅ **Validate after migration** - Use --validate flag
4. ✅ **Rotate secrets quarterly** - Set calendar reminders
5. ✅ **Never log secret values** - Scripts mask sensitive data
6. ✅ **Use descriptive names** - Include environment in name
7. ✅ **Document changes** - Keep a rotation log

## Security Reminders

- 🔒 Never commit AWS credentials to git
- 🔒 Use IAM roles when possible (instead of access keys)
- 🔒 Enable CloudTrail for audit logs
- 🔒 Set up CloudWatch alarms for unauthorized access
- 🔒 Rotate access keys every 90 days
- 🔒 Use MFA for AWS console access
- 🔒 Review IAM permissions regularly

## Related Documentation

- [AWS_SECRETS_SETUP.md](../../AWS_SECRETS_SETUP.md) - Complete setup guide
- [infrastructure/README.md](../../infrastructure/README.md) - Infrastructure setup
- [AWS Secrets Manager Docs](https://docs.aws.amazon.com/secretsmanager/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [AWS_SECRETS_SETUP.md](../../AWS_SECRETS_SETUP.md)
3. Open an issue on GitHub

---

**Last Updated:** November 2025
