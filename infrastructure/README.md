# Engify.ai Infrastructure

Infrastructure as Code (IaC) for AWS Secrets Manager and related resources.

## Overview

This directory contains infrastructure templates for deploying AWS Secrets Manager and associated resources to securely manage application secrets.

## Available Templates

### CloudFormation

Located in `cloudformation/secrets-manager.yaml`

**Deploy:**
```bash
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-production \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

**Update:**
```bash
aws cloudformation update-stack \
  --stack-name engify-ai-secrets-production \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

**Delete:**
```bash
aws cloudformation delete-stack \
  --stack-name engify-ai-secrets-production \
  --region us-east-1
```

### Terraform

Located in `terraform/secrets-manager.tf`

**Initialize:**
```bash
cd infrastructure/terraform
terraform init
```

**Plan:**
```bash
terraform plan \
  -var="environment=production" \
  -var="aws_region=us-east-1"
```

**Apply:**
```bash
terraform apply \
  -var="environment=production" \
  -var="aws_region=us-east-1"
```

**Destroy:**
```bash
terraform destroy \
  -var="environment=production" \
  -var="aws_region=us-east-1"
```

## Resources Created

Both templates create the following resources:

1. **AWS Secrets Manager Secret** - Main application secrets storage
2. **IAM User** - For Vercel deployment (with access keys)
3. **IAM Policy** - Least-privilege policy for reading secrets
4. **Vercel Credentials Secret** - Stores AWS credentials for Vercel
5. **CloudWatch Log Group** - For auditing secret access
6. **CloudWatch Alarm** - Alerts on unauthorized access attempts

## Security Considerations

### IAM Permissions

The created IAM user has minimal permissions:
- Read access to the application secrets only
- List secrets (for health checks)
- No write/delete permissions

### Access Key Management

**⚠️ IMPORTANT:** After deployment, immediately:
1. Retrieve the access key from CloudFormation/Terraform outputs
2. Store it securely in Vercel environment variables
3. Delete the local copy
4. Never commit access keys to git

### Rotation

Consider enabling automatic rotation for:
- Database credentials
- API keys (where supported by provider)
- Access keys (rotate quarterly)

## Monitoring

### CloudWatch Alarms

The stack creates an alarm for unauthorized access attempts. Configure SNS notifications:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name engify-ai-secrets-unauthorized-production \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:security-alerts
```

### Audit Logs

Secret access is logged to CloudWatch Logs:
- Log Group: `/aws/secretsmanager/engify-ai/{environment}`
- Retention: 30 days

Query logs:
```bash
aws logs filter-log-events \
  --log-group-name /aws/secretsmanager/engify-ai/production \
  --start-time $(date -u -d '1 hour ago' +%s)000
```

## Multi-Environment Setup

Deploy separate stacks for each environment:

```bash
# Development
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-dev \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM

# Staging
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-staging \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=staging \
  --capabilities CAPABILITY_NAMED_IAM

# Production
aws cloudformation create-stack \
  --stack-name engify-ai-secrets-production \
  --template-body file://infrastructure/cloudformation/secrets-manager.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_NAMED_IAM
```

## Cost Estimation

AWS Secrets Manager pricing (us-east-1):
- $0.40 per secret per month
- $0.05 per 10,000 API calls

**Estimated monthly cost:**
- 2 secrets (app + vercel credentials): $0.80
- ~100,000 API calls (with 15-min caching): $0.50
- **Total: ~$1.30/month**

## Troubleshooting

### Stack Creation Fails

**Error:** "IAM user already exists"
- Delete the existing IAM user or change the user name

**Error:** "Secret already exists"
- Delete the existing secret or change the secret name

### Access Denied

**Error:** "User is not authorized to perform: secretsmanager:GetSecretValue"
- Verify IAM policy is attached to the user
- Check the secret ARN in the policy matches the created secret

### Secrets Not Loading

**Error:** "Secret not found"
- Verify AWS_SECRETS_NAME matches the created secret
- Check AWS_REGION is correct
- Ensure AWS credentials are configured

## Best Practices

1. **Use separate secrets per environment** - Don't share secrets between dev/staging/prod
2. **Enable CloudTrail** - Audit all API calls to Secrets Manager
3. **Rotate regularly** - Update secrets quarterly or when team members leave
4. **Use KMS encryption** - For additional security (extra cost)
5. **Monitor costs** - Set up billing alarms for unexpected API usage
6. **Backup secrets** - Export secrets to secure backup before rotation

## Related Documentation

- [AWS_SECRETS_SETUP.md](../AWS_SECRETS_SETUP.md) - Complete setup guide
- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review AWS CloudWatch logs
3. Open an issue on GitHub
