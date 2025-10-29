#!/bin/bash

# AWS Configuration Validation Script
# Validates AWS setup without needing to install CLI locally
# Can be run before or after AWS CLI installation

set -e

echo "🔍 Validating AWS Configuration..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if AWS CLI is installed
if command -v aws &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI installed${NC}"
    AWS_CLI_VERSION=$(aws --version 2>&1 | cut -d' ' -f1 | cut -d'/' -f2)
    echo "   Version: $AWS_CLI_VERSION"
else
    echo -e "${YELLOW}⚠️  AWS CLI not installed${NC}"
    echo "   Run: brew install awscli (macOS) or visit https://aws.amazon.com/cli/"
    WARNINGS=$((WARNINGS + 1))
fi

# Check AWS credentials
echo ""
echo "📋 Checking AWS Credentials..."

if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo -e "${GREEN}✅ AWS_ACCESS_KEY_ID set${NC}"
else
    echo -e "${YELLOW}⚠️  AWS_ACCESS_KEY_ID not set in environment${NC}"
    echo "   Will use IAM role if running on EC2/Lambda/ECS"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${GREEN}✅ AWS_SECRET_ACCESS_KEY set${NC}"
else
    if [ -n "$AWS_ACCESS_KEY_ID" ]; then
        echo -e "${RED}❌ AWS_SECRET_ACCESS_KEY missing (required if ACCESS_KEY_ID is set)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${YELLOW}⚠️  AWS_SECRET_ACCESS_KEY not set (OK if using IAM role)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

if [ -n "$AWS_REGION" ]; then
    echo -e "${GREEN}✅ AWS_REGION set: $AWS_REGION${NC}"
else
    echo -e "${YELLOW}⚠️  AWS_REGION not set, defaulting to us-east-1${NC}"
    export AWS_REGION="us-east-1"
    WARNINGS=$((WARNINGS + 1))
fi

# Check AWS CLI configuration (if installed)
if command -v aws &> /dev/null; then
    echo ""
    echo "🔐 Checking AWS CLI Configuration..."
    
    if aws sts get-caller-identity &> /dev/null; then
        IDENTITY=$(aws sts get-caller-identity 2>/dev/null)
        echo -e "${GREEN}✅ AWS credentials configured${NC}"
        echo "   Account: $(echo $IDENTITY | grep -o '"Account": "[^"]*' | cut -d'"' -f4)"
        echo "   User/Role: $(echo $IDENTITY | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)"
    else
        echo -e "${RED}❌ AWS credentials not configured or invalid${NC}"
        echo "   Run: aws configure"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check required environment variables for application
echo ""
echo "📦 Checking Application Environment Variables..."

REQUIRED_VARS=(
    "MONGODB_URI"
)

OPTIONAL_VARS=(
    "API_KEY_ENCRYPTION_KEY"
    "NEXTAUTH_SECRET"
    "SENDGRID_API_KEY"
    "TWILIO_AUTH_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ $var set${NC}"
    else
        echo -e "${RED}❌ $var not set (REQUIRED)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

for var in "${OPTIONAL_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ $var set${NC}"
    else
        echo -e "${YELLOW}⚠️  $var not set (optional, may use AWS Secrets Manager)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration valid with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}❌ Configuration has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Install AWS CLI: brew install awscli"
    echo "   2. Configure credentials: aws configure"
    echo "   3. Set required environment variables"
    echo "   4. Create secrets in AWS Secrets Manager"
    echo ""
    echo "   See: docs/aws/IAM_POLICIES.md for detailed setup"
    exit 1
fi

