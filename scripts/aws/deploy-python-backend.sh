#!/bin/bash

# AWS Python Backend Deployment Script
# Deploys Python FastAPI service to AWS Lambda or ECS Fargate

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="engify-rag-service"
REGION="${AWS_REGION:-us-east-1}"
DEPLOYMENT_TYPE="${1:-lambda}"  # lambda, ecs, or apprunner

echo -e "${BLUE}🚀 Deploying Python Backend to AWS${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Type: ${DEPLOYMENT_TYPE}${NC}"
echo ""

# Validate AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    echo "Install: brew install awscli"
    exit 1
fi

# Validate AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"
echo ""

# Lambda Deployment
if [ "$DEPLOYMENT_TYPE" == "lambda" ]; then
    echo -e "${BLUE}📦 Deploying to AWS Lambda...${NC}"
    
    cd lambda
    
    # Create deployment package
    echo "Creating deployment package..."
    zip -r rag-lambda.zip . -x "*.git*" "*.pyc" "__pycache__/*"
    
    # Check if function exists
    if aws lambda get-function --function-name "$SERVICE_NAME" &> /dev/null; then
        echo "Updating existing function..."
        aws lambda update-function-code \
            --function-name "$SERVICE_NAME" \
            --zip-file fileb://rag-lambda.zip \
            --region "$REGION"
    else
        echo "Creating new function..."
        aws lambda create-function \
            --function-name "$SERVICE_NAME" \
            --runtime python3.11 \
            --role "arn:aws:iam::${ACCOUNT_ID}:role/lambda-execution-role" \
            --handler rag-lambda.handler \
            --zip-file fileb://rag-lambda.zip \
            --timeout 300 \
            --memory-size 512 \
            --region "$REGION"
    fi
    
    echo -e "${GREEN}✅ Lambda function deployed${NC}"
    echo ""
    echo "Function ARN:"
    aws lambda get-function --function-name "$SERVICE_NAME" --query 'Configuration.FunctionArn' --output text
    echo ""
    echo "Test the function:"
    echo "aws lambda invoke --function-name $SERVICE_NAME --payload '{}' response.json"

# ECS Fargate Deployment
elif [ "$DEPLOYMENT_TYPE" == "ecs" ]; then
    echo -e "${BLUE}🐳 Deploying to AWS ECS Fargate...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed${NC}"
        echo "Install: brew install docker"
        exit 1
    fi
    
    # ECR repository name
    ECR_REPO="engify-rag-service"
    ECR_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}"
    
    # Create ECR repository if it doesn't exist
    if ! aws ecr describe-repositories --repository-names "$ECR_REPO" &> /dev/null; then
        echo "Creating ECR repository..."
        aws ecr create-repository --repository-name "$ECR_REPO" --region "$REGION"
    fi
    
    # Login to ECR
    echo "Logging in to ECR..."
    aws ecr get-login-password --region "$REGION" | \
        docker login --username AWS --password-stdin "$ECR_URI"
    
    # Build Docker image
    echo "Building Docker image..."
    cd python
    docker build -t "$ECR_REPO:latest" .
    
    # Tag image
    docker tag "$ECR_REPO:latest" "$ECR_URI:latest"
    
    # Push image
    echo "Pushing image to ECR..."
    docker push "$ECR_URI:latest"
    
    echo -e "${GREEN}✅ Docker image pushed to ECR${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Create ECS cluster: aws ecs create-cluster --cluster-name engify-cluster"
    echo "2. Register task definition: aws ecs register-task-definition --cli-input-json file://docs/aws/ecs-task-definition.json"
    echo "3. Create ECS service: aws ecs create-service --cluster engify-cluster --service-name $SERVICE_NAME --task-definition engify-rag-service:1 --launch-type FARGATE"
    
# App Runner Deployment
elif [ "$DEPLOYMENT_TYPE" == "apprunner" ]; then
    echo -e "${BLUE}🚀 Deploying to AWS App Runner...${NC}"
    echo -e "${YELLOW}⚠️  App Runner deployment requires manual setup via AWS Console${NC}"
    echo ""
    echo "Steps:"
    echo "1. Go to AWS Console → App Runner → Create Service"
    echo "2. Select 'Source code repository'"
    echo "3. Connect GitHub repository"
    echo "4. Set build command: pip install -r python/requirements.txt"
    echo "5. Set start command: cd python && uvicorn api.rag:app --host 0.0.0.0 --port 8000"
    
else
    echo -e "${RED}❌ Invalid deployment type: $DEPLOYMENT_TYPE${NC}"
    echo "Usage: $0 [lambda|ecs|apprunner]"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"

