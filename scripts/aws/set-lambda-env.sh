#!/bin/bash
# Set Lambda Environment Variables for Multi-Agent Function
# Usage: ./scripts/aws/set-lambda-env.sh
#
# This script sets MONGODB_URI and OPENAI_API_KEY environment variables
# for the Lambda function from your local environment or AWS Secrets Manager.
#
# Security: Never hardcode secrets in this script

set -e

FUNCTION_NAME="engify-ai-integration-workbench"
AWS_REGION="${AWS_REGION:-us-east-2}"

echo "🔐 Setting Lambda Environment Variables..."
echo "Function: $FUNCTION_NAME"
echo "Region: $AWS_REGION"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    exit 1
fi

# Get MongoDB URI
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set in environment"
    echo "   Please set it: export MONGODB_URI='your-mongodb-uri'"
    echo "   Or load from .env.local: source <(grep MONGODB_URI .env.local | sed 's/^/export /')"
    exit 1
fi

# Get OpenAI API Key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set in environment"
    echo "   Please set it: export OPENAI_API_KEY='your-openai-key'"
    echo "   Or load from .env.local: source <(grep OPENAI_API_KEY .env.local | sed 's/^/export /')"
    exit 1
fi

# Build environment variables JSON (properly formatted for AWS CLI)
ENV_FILE=$(mktemp)
python3 <<EOF > "$ENV_FILE"
import json
import os

config = {
    "Environment": {
        "Variables": {
            "MONGODB_URI": os.environ.get("MONGODB_URI", ""),
            "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY", "")
        }
    }
}

print(json.dumps(config))
EOF

echo "📋 Updating Lambda function configuration..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --cli-input-json file://"$ENV_FILE" \
    --region $AWS_REGION \
    --output json > /dev/null

rm "$ENV_FILE"

echo "✅ Environment variables set successfully!"
echo ""
echo "🔍 Verifying configuration..."
aws lambda get-function-configuration \
    --function-name $FUNCTION_NAME \
    --region $AWS_REGION \
    --query 'Environment.Variables' \
    --output json | python3 -m json.tool

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Next steps:"
echo "  1. Test the Lambda function:"
echo "     aws lambda invoke \\"
echo "       --function-name $FUNCTION_NAME \\"
echo "       --payload '{\"situation\":\"Test AI integration\",\"context\":\"\"}' \\"
echo "       --region $AWS_REGION \\"
echo "       response.json && cat response.json"
echo ""
echo "  2. Or test via Next.js API:"
echo "     curl -X POST http://localhost:3000/api/agents/scrum-meeting \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"situation\":\"Test\",\"context\":\"\"}'"

