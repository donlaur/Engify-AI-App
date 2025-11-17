# Terraform Configuration for AWS Secrets Manager
# Manages secrets infrastructure for Engify.ai application

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production"
  }
}

variable "aws_region" {
  description = "AWS region for secrets"
  type        = string
  default     = "us-east-1"
}

variable "secret_name" {
  description = "Name for the application secrets"
  type        = string
  default     = "engify-ai/app-secrets"
}

variable "enable_rotation" {
  description = "Enable automatic secret rotation"
  type        = bool
  default     = false
}

variable "kms_key_id" {
  description = "KMS key ID for encrypting secrets (optional, uses default if not specified)"
  type        = string
  default     = null
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Main Application Secrets
resource "aws_secretsmanager_secret" "application_secrets" {
  name        = var.secret_name
  description = "Engify.ai application secrets for ${var.environment}"
  kms_key_id  = var.kms_key_id

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    ManagedBy   = "Terraform"
  }
}

# Initial secret value (empty structure)
resource "aws_secretsmanager_secret_version" "application_secrets_initial" {
  secret_id = aws_secretsmanager_secret.application_secrets.id
  secret_string = jsonencode({
    aiProviders = {
      OPENAI_API_KEY      = ""
      ANTHROPIC_API_KEY   = ""
      GOOGLE_API_KEY      = ""
      GROQ_API_KEY        = ""
      REPLICATE_API_TOKEN = ""
    }
    database = {
      MONGODB_URI = ""
    }
    auth = {
      NEXTAUTH_SECRET      = ""
      NEXTAUTH_URL         = ""
      GOOGLE_CLIENT_ID     = ""
      GOOGLE_CLIENT_SECRET = ""
      GITHUB_ID            = ""
      GITHUB_SECRET        = ""
    }
    email = {
      SENDGRID_API_KEY            = ""
      SENDGRID_WEBHOOK_PUBLIC_KEY = ""
    }
    sms = {
      TWILIO_ACCOUNT_SID       = ""
      TWILIO_AUTH_TOKEN        = ""
      TWILIO_VERIFY_SERVICE_SID = ""
    }
    queue = {
      QSTASH_TOKEN = ""
      CRON_SECRET  = ""
    }
    cache = {
      UPSTASH_REDIS_REST_URL   = ""
      UPSTASH_REDIS_REST_TOKEN = ""
      REDIS_PASSWORD           = ""
    }
    security = {
      API_KEY_ENCRYPTION_KEY      = ""
      JIRA_TOKEN_ENCRYPTION_KEY   = ""
    }
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# IAM Policy for reading secrets (least privilege)
resource "aws_iam_policy" "secrets_read_policy" {
  name        = "engify-ai-secrets-read-${var.environment}"
  description = "Policy to read Engify.ai application secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadApplicationSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.application_secrets.arn
        ]
      },
      {
        Sid    = "ListSecrets"
        Effect = "Allow"
        Action = [
          "secretsmanager:ListSecrets"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    ManagedBy   = "Terraform"
  }
}

# IAM User for Vercel deployment
resource "aws_iam_user" "vercel_deployment" {
  name = "engify-ai-vercel-${var.environment}"

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    Purpose     = "Vercel Deployment"
    ManagedBy   = "Terraform"
  }
}

# Attach read policy to Vercel user
resource "aws_iam_user_policy_attachment" "vercel_secrets_access" {
  user       = aws_iam_user.vercel_deployment.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}

# Access key for Vercel user
resource "aws_iam_access_key" "vercel_user" {
  user = aws_iam_user.vercel_deployment.name
}

# Store Vercel credentials in a separate secret
resource "aws_secretsmanager_secret" "vercel_credentials" {
  name        = "engify-ai/vercel-credentials-${var.environment}"
  description = "AWS credentials for Vercel deployment"

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    Purpose     = "Vercel Credentials"
    ManagedBy   = "Terraform"
  }
}

resource "aws_secretsmanager_secret_version" "vercel_credentials" {
  secret_id = aws_secretsmanager_secret.vercel_credentials.id
  secret_string = jsonencode({
    AWS_ACCESS_KEY_ID     = aws_iam_access_key.vercel_user.id
    AWS_SECRET_ACCESS_KEY = aws_iam_access_key.vercel_user.secret
    AWS_REGION            = data.aws_region.current.name
    AWS_SECRETS_NAME      = var.secret_name
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# CloudWatch Log Group for auditing
resource "aws_cloudwatch_log_group" "secrets_access" {
  name              = "/aws/secretsmanager/engify-ai/${var.environment}"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    ManagedBy   = "Terraform"
  }
}

# CloudWatch Alarm for unauthorized access
resource "aws_cloudwatch_metric_alarm" "unauthorized_access" {
  alarm_name          = "engify-ai-secrets-unauthorized-${var.environment}"
  alarm_description   = "Alert on unauthorized secret access attempts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnauthorizedAccessAttempts"
  namespace           = "AWS/SecretsManager"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  tags = {
    Environment = var.environment
    Application = "Engify.ai"
    ManagedBy   = "Terraform"
  }
}

# Outputs
output "secret_arn" {
  description = "ARN of the application secrets"
  value       = aws_secretsmanager_secret.application_secrets.arn
}

output "secret_name" {
  description = "Name of the application secrets"
  value       = var.secret_name
}

output "vercel_access_key_id" {
  description = "AWS Access Key ID for Vercel"
  value       = aws_iam_access_key.vercel_user.id
}

output "vercel_secret_access_key" {
  description = "AWS Secret Access Key for Vercel (SENSITIVE - store securely!)"
  value       = aws_iam_access_key.vercel_user.secret
  sensitive   = true
}

output "vercel_credentials_secret_arn" {
  description = "ARN of the Vercel credentials secret"
  value       = aws_secretsmanager_secret.vercel_credentials.arn
}

output "region" {
  description = "AWS Region"
  value       = data.aws_region.current.name
}

output "setup_instructions" {
  description = "Next steps for setup"
  value = <<-EOT
    1. Update the secret values using the migration script:
       tsx scripts/aws/migrate-secrets.ts --secret-name ${var.secret_name} --region ${data.aws_region.current.name}

    2. Retrieve Vercel credentials:
       terraform output -json vercel_secret_access_key

    3. Configure Vercel environment variables:
       - AWS_ACCESS_KEY_ID: ${aws_iam_access_key.vercel_user.id}
       - AWS_SECRET_ACCESS_KEY: (from terraform output above)
       - AWS_REGION: ${data.aws_region.current.name}
       - AWS_SECRETS_NAME: ${var.secret_name}

    4. Deploy your application to Vercel

    See AWS_SECRETS_SETUP.md for detailed instructions.
  EOT
}
