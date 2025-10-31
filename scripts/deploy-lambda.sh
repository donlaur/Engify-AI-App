#!/bin/bash

# AWS Lambda Deployment Script for Engify RAG Service
# Account: 8257-6541-9928
# Region: us-east-2 (Ohio)

set -e

FUNCTION_NAME="engify-rag"
REGION="us-east-2"
ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ROLE_NAME="engify-lambda-execution-role"

echo "🚀 Deploying Engify RAG service to AWS Lambda..."

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Create IAM role for Lambda (if it doesn't exist)
echo "📋 Creating IAM role for Lambda..."
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo "Creating IAM role: $ROLE_NAME"
    
    # Create trust policy
    cat > trust-policy.json << EOF
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
        --assume-role-policy-document file://trust-policy.json

    # Attach basic execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    # Clean up
    rm trust-policy.json
    
    echo "✅ IAM role created"
else
    echo "✅ IAM role already exists"
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd lambda
zip -r ../rag-lambda.zip rag-lambda.py
cd ..

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &> /dev/null; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://rag-lambda.zip \
        --region $REGION
else
    echo "🆕 Creating new Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.9 \
        --role $ROLE_ARN \
        --handler rag-lambda.lambda_handler \
        --zip-file fileb://rag-lambda.zip \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION \
        --description "RAG service for Engify.ai"
fi

# Create API Gateway (if it doesn't exist)
API_NAME="engify-rag-api"
echo "🌐 Setting up API Gateway..."

# Check if API exists
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='$API_NAME'].id" --output text --region $REGION)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    echo "Creating API Gateway..."
    API_ID=$(aws apigateway create-rest-api \
        --name $API_NAME \
        --description "API Gateway for Engify RAG service" \
        --region $REGION \
        --query 'id' \
        --output text)
    
    echo "✅ API Gateway created with ID: $API_ID"
else
    echo "✅ API Gateway already exists with ID: $API_ID"
fi

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[?path==`/`].id' \
    --output text)

# Create /rag resource
RAG_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part "rag" \
    --region $REGION \
    --query 'id' \
    --output text)

# Create /search resource under /rag
SEARCH_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $RAG_RESOURCE_ID \
    --path-part "search" \
    --region $REGION \
    --query 'id' \
    --output text)

# Create POST method
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $SEARCH_RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION

# Get Lambda function ARN
FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# Set up Lambda integration
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $SEARCH_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${FUNCTION_ARN}/invocations" \
    --region $REGION

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id "apigateway-invoke" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
    --region $REGION

# Deploy API
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name "prod" \
    --region $REGION

# Get API Gateway URL
API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/rag/search"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Deployment Summary:"
echo "   Function Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   API Gateway URL: $API_URL"
echo ""
echo "🔧 Next Steps:"
echo "   1. Update Vercel environment variable RAG_API_URL to: $API_URL"
echo "   2. Test the integration"
echo ""
echo "🧪 Test the API:"
echo "   curl -X POST $API_URL \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\": \"chain of thought\", \"top_k\": 3}'"
echo ""

# Clean up
rm rag-lambda.zip

echo "✅ Cleanup complete"
