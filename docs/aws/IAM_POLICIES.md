# AWS IAM Policies for Engify.ai

**Purpose**: Document all required IAM policies for AWS services  
**Last Updated**: October 29, 2025

---

## 🔐 Required IAM Policies

### 1. Secrets Manager Access

**Policy Name**: `Engify-SecretsManager-ReadOnly`

**Use Case**: Read secrets from AWS Secrets Manager (API keys, database URIs, etc.)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": ["arn:aws:secretsmanager:*:*:secret:engify/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:ListSecrets"],
      "Resource": "*"
    }
  ]
}
```

**Full Access Version** (for admin/secrets rotation):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:*"],
      "Resource": ["arn:aws:secretsmanager:*:*:secret:engify/*"]
    }
  ]
}
```

---

### 2. Lambda Execution Role

**Policy Name**: `Engify-Lambda-Execution`

**Use Case**: Basic Lambda execution permissions (CloudWatch logs, etc.)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": ["arn:aws:secretsmanager:*:*:secret:engify/*"]
    }
  ]
}
```

**Trust Policy** (attach to role, not policy):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

### 3. API Gateway Invoke Lambda

**Policy Name**: `Engify-APIGateway-InvokeLambda`

**Use Case**: Allow API Gateway to invoke Lambda functions

**Attach to Lambda resource policy** (not IAM policy):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:*:*:function:engify-*",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": "arn:aws:execute-api:*:*:*"
        }
      }
    }
  ]
}
```

---

### 4. S3 Access (Optional - for file uploads)

**Policy Name**: `Engify-S3-UserUploads`

**Use Case**: Store user-uploaded files (RAG documents, etc.)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::engify-ai-uploads/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::engify-ai-uploads"],
      "Condition": {
        "StringLike": {
          "s3:prefix": ["users/*", "public/*"]
        }
      }
    }
  ]
}
```

---

## 🚀 Setup Instructions

### For Lambda Functions

1. **Create IAM Role**:

```bash
aws iam create-role \
  --role-name engify-lambda-execution-role \
  --assume-role-policy-document file://trust-policy.json
```

2. **Attach Policies**:

```bash
aws iam attach-role-policy \
  --role-name engify-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach custom Secrets Manager policy
aws iam put-role-policy \
  --role-name engify-lambda-execution-role \
  --policy-name Engify-SecretsManager-ReadOnly \
  --policy-document file://secrets-manager-policy.json
```

### For EC2/ECS (if running Python workers)

1. **Create Instance Profile** (for EC2):

```bash
aws iam create-instance-profile \
  --instance-profile-name engify-ec2-profile
```

2. **Attach Roles**:

```bash
aws iam add-role-to-instance-profile \
  --instance-profile-name engify-ec2-profile \
  --role-name engify-ec2-role
```

### For Next.js App (Vercel/Amplify)

Create IAM user with API keys:

```bash
aws iam create-user --user-name engify-app-user

aws iam attach-user-policy \
  --user-name engify-app-user \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/Engify-SecretsManager-ReadOnly

aws iam create-access-key --user-name engify-app-user
```

Store access key in environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

---

## 🔒 Security Best Practices

1. **Least Privilege**: Only grant permissions needed for specific resources
2. **Resource Scoping**: Use resource ARNs with prefixes (e.g., `engify/*`)
3. **Separate Environments**: Use different policies for dev/staging/prod
4. **Rotate Keys**: Regularly rotate IAM access keys
5. **Use IAM Roles**: Prefer IAM roles over access keys when possible (EC2/Lambda/ECS)
6. **Monitor Access**: Enable CloudTrail to audit IAM usage

---

## 📋 Required Secrets in AWS Secrets Manager

These secrets should be created in AWS Secrets Manager:

1. `engify/api-key-encryption-key` - Encryption key for user API keys
2. `engify/mongodb-uri` - MongoDB connection string (production)
3. `engify/nextauth-secret` - NextAuth.js session secret
4. `engify/sendgrid-api-key` - SendGrid API key (optional)
5. `engify/twilio-auth-token` - Twilio auth token (optional)

**Create secrets**:

```bash
aws secretsmanager create-secret \
  --name engify/api-key-encryption-key \
  --secret-string "$(openssl rand -base64 32)"
```

---

## 🔍 Troubleshooting

### "Access Denied" errors

1. Check IAM policy resource ARNs match your resources
2. Verify region matches (us-east-1 vs us-east-2)
3. Check trust policy for Lambda/ECS roles
4. Verify IAM role is attached to Lambda function

### "Secret not found" errors

1. Verify secret name matches exactly (case-sensitive)
2. Check secret exists in correct region
3. Verify IAM permissions include `secretsmanager:GetSecretValue`

### Testing IAM Permissions

```bash
# Test Secrets Manager access
aws secretsmanager describe-secret \
  --secret-id engify/api-key-encryption-key

# Test Lambda execution
aws lambda invoke \
  --function-name engify-rag \
  --payload '{}' \
  response.json
```
