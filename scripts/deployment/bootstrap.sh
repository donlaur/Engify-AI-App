#!/bin/bash

# Bootstrap script for Engify.ai deployment
# This script sets up AWS resources and Vercel environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Engify.ai deployment bootstrap${NC}"

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo -e "${RED}❌ Vercel CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Validate required variables
required_vars=("AWS_REGION" "AWS_ACCOUNT_ID" "MONGODB_URI")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📋 Creating AWS resources...${NC}"

# Create IAM roles and policies
aws iam create-role --role-name engify-lambda-role \
    --assume-role-policy-document file://docs/aws/lambda-trust-policy.json \
    --description "Role for Engify Lambda functions" || echo "Role may already exist"

aws iam put-role-policy --role-name engify-lambda-role \
    --policy-name EngifyLambdaPolicy \
    --policy-document file://docs/aws/lambda-policy.json

aws iam create-role --role-name engify-webhook-role \
    --assume-role-policy-document file://docs/aws/lambda-trust-policy.json \
    --description "Role for Engify webhook handlers" || echo "Role may already exist"

aws iam put-role-policy --role-name engify-webhook-role \
    --policy-name EngifyWebhookPolicy \
    --policy-document file://docs/aws/webhook-policy.json

echo -e "${YELLOW}🔐 Setting up secrets in AWS Secrets Manager...${NC}"

# Store sensitive configuration in Secrets Manager
aws secretsmanager create-secret \
    --name engify/database/mongodb \
    --description "MongoDB Atlas connection string" \
    --secret-string "{\"uri\":\"$MONGODB_URI\"}" || echo "Secret may already exist"

if [ -n "$SENDGRID_API_KEY" ]; then
    aws secretsmanager create-secret \
        --name engify/email/sendgrid \
        --description "SendGrid API configuration" \
        --secret-string "{\"api_key\":\"$SENDGRID_API_KEY\",\"webhook_key\":\"$SENDGRID_WEBHOOK_PUBLIC_KEY\"}" || echo "Secret may already exist"
fi

if [ -n "$TWILIO_AUTH_TOKEN" ]; then
    aws secretsmanager create-secret \
        --name engify/sms/twilio \
        --description "Twilio SMS configuration" \
        --secret-string "{\"account_sid\":\"$TWILIO_ACCOUNT_SID\",\"auth_token\":\"$TWILIO_AUTH_TOKEN\",\"phone_number\":\"$TWILIO_PHONE_NUMBER\"}" || echo "Secret may already exist"
fi

echo -e "${YELLOW}☁️ Setting up Vercel project...${NC}"

# Link to Vercel project (assumes project already exists)
vercel link --yes || echo "Project may already be linked"

# Set environment variables in Vercel
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Optional services
[ -n "$OPENAI_API_KEY" ] && vercel env add OPENAI_API_KEY production
[ -n "$SENDGRID_API_KEY" ] && vercel env add SENDGRID_API_KEY production
[ -n "$TWILIO_ACCOUNT_SID" ] && vercel env add TWILIO_ACCOUNT_SID production

echo -e "${GREEN}✅ Bootstrap complete!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update your .env file with actual values"
echo "2. Run 'vercel --prod' to deploy"
echo "3. Test the application endpoints"
