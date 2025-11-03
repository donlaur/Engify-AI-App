#!/bin/bash
# Deploy Multi-Agent Lambda Function to AWS
# Usage: ./scripts/aws/deploy-multi-agent-lambda.sh
#
# Required environment variables:
#   AWS_REGION (defaults to us-east-2 if not set)
#   
# Optional: AWS_ACCOUNT_ID (auto-detected from AWS credentials if not set)
#
# Security: No hardcoded credentials or account IDs

set -e

# Get AWS account ID from credentials (more secure than hardcoding)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "🔍 Detecting AWS Account ID from credentials..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo "❌ Could not detect AWS Account ID. Please set AWS_ACCOUNT_ID environment variable or configure AWS credentials."
        exit 1
    fi
    echo "✅ Detected AWS Account ID: $AWS_ACCOUNT_ID"
else
    echo "✅ Using AWS Account ID from environment: $AWS_ACCOUNT_ID"
fi

AWS_REGION="${AWS_REGION:-us-east-2}"
FUNCTION_NAME="engify-ai-integration-workbench"
ECR_REPO="engify-ai-integration-workbench"
ROLE_NAME="engify-lambda-execution-role"
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest"

echo "🚀 Deploying Multi-Agent Lambda Function..."
echo "Account: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Function: $FUNCTION_NAME"
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

echo "✅ AWS CLI configured"

# Check/create IAM role
echo "📋 Checking IAM role..."
ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}"

if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo "Creating IAM role: $ROLE_NAME"
    
    # Create trust policy
    cat > /tmp/trust-policy.json << EOF
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
EOF

    # Create role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/trust-policy.json

    # Attach basic execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Clean up
    rm /tmp/trust-policy.json
    
    echo "✅ IAM role created"
else
    echo "✅ IAM role already exists"
fi

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION &> /dev/null; then
    echo "🔄 Updating existing Lambda function..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --image-uri $IMAGE_URI \
        --region $AWS_REGION
    
    echo "⏳ Waiting for update to complete..."
    aws lambda wait function-updated --function-name $FUNCTION_NAME --region $AWS_REGION
    
    # Update configuration
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout 300 \
        --memory-size 1024 \
        --region $AWS_REGION
    
    echo "✅ Lambda function updated"
else
    echo "🆕 Creating new Lambda function..."
    
    # Note: Environment variables will be set separately
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$IMAGE_URI \
        --role $ROLE_ARN \
        --timeout 300 \
        --memory-size 1024 \
        --region $AWS_REGION \
        --description "Engineering Leadership Discussion Prep Tool - Multi-Agent Workflow"
    
    echo "⏳ Waiting for function to be ready..."
    aws lambda wait function-active --function-name $FUNCTION_NAME --region $AWS_REGION
    
    echo "✅ Lambda function created"
fi

echo ""
echo "📋 Function ARN:"
aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION --query 'Configuration.FunctionArn' --output text

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Set environment variables before testing:"
echo "   aws lambda update-function-configuration \\"
echo "     --function-name $FUNCTION_NAME \\"
echo "     --environment Variables='{MONGODB_URI=<uri>,OPENAI_API_KEY=<key>}' \\"
echo "     --region $AWS_REGION"
echo ""
echo "  2. Test function:"
echo "     aws lambda invoke \\"
echo "       --function-name $FUNCTION_NAME \\"
echo "       --payload '{\"situation\":\"Test\",\"context\":\"\"}' \\"
echo "       --region $AWS_REGION \\"
echo "       response.json && cat response.json"

