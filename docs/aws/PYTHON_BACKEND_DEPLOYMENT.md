# Python Backend AWS Deployment Guide

**Date**: October 31, 2025  
**Goal**: Deploy Python FastAPI backend to AWS

---

## 🎯 **Quick Start**

### **Recommended: AWS Lambda (Simple & Cost-Effective)**

```bash
# 1. Install AWS CLI (if not done)
brew install awscli
aws configure

# 2. Deploy Lambda function
cd lambda
zip -r rag-lambda.zip .
aws lambda create-function \
  --function-name engify-rag-service \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler rag-lambda.handler \
  --zip-file fileb://rag-lambda.zip \
  --timeout 300 \
  --memory-size 512

# 3. Test deployment
aws lambda invoke \
  --function-name engify-rag-service \
  --payload '{"body": "{\"query\": \"test\"}"}' \
  response.json
```

---

## 🏗️ **Architecture Options**

### **Option 1: AWS Lambda** (Current Setup)

**Best For**: 
- Lightweight API endpoints
- Pay-per-use cost model
- Simple deployment

**Deployment**:
```bash
# Using existing script
./scripts/deploy-lambda.sh

# Or manual deployment
cd lambda
zip -r rag-lambda.zip .
aws lambda update-function-code \
  --function-name engify-rag-service \
  --zip-file fileb://rag-lambda.zip
```

**Cost**: ~$5-15/month

---

### **Option 2: AWS Lambda Container** (For ML Models)

**Best For**:
- Services with large dependencies (sentence-transformers)
- Need larger package size (up to 10GB)

**Setup**:
1. Create Dockerfile:
```dockerfile
FROM public.ecr.aws/lambda/python:3.11

COPY python/requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

COPY python/ ${LAMBDA_TASK_ROOT}/

CMD [ "api.rag.handler" ]
```

2. Build and push to ECR:
```bash
# Build image
docker build -t engify-rag-container:latest .

# Create ECR repository
aws ecr create-repository --repository-name engify-rag-service

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag engify-rag-container:latest \
  ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/engify-rag-service:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/engify-rag-service:latest
```

3. Create Lambda function:
```bash
aws lambda create-function \
  --function-name engify-rag-container \
  --package-type Image \
  --code ImageUri=ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/engify-rag-service:latest \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --timeout 900 \
  --memory-size 2048
```

**Cost**: ~$10-30/month

---

### **Option 3: AWS ECS Fargate** (Production Ready)

**Best For**:
- Always-on services
- Better performance (no cold starts)
- Complex ML workloads

**Setup**:

1. **Create ECR Repository**:
```bash
aws ecr create-repository --repository-name engify-rag-service
```

2. **Build and Push Docker Image**:
```bash
cd python
docker build -t engify-rag-service:latest .

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag engify-rag-service:latest \
  ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/engify-rag-service:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/engify-rag-service:latest
```

3. **Create ECS Cluster**:
```bash
aws ecs create-cluster --cluster-name engify-cluster
```

4. **Create Task Definition** (see `docs/aws/ecs-task-definition.json`):
```bash
aws ecs register-task-definition \
  --cli-input-json file://docs/aws/ecs-task-definition.json
```

5. **Create ECS Service**:
```bash
aws ecs create-service \
  --cluster engify-cluster \
  --service-name engify-rag-service \
  --task-definition engify-rag-service:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

**Cost**: ~$30-80/month

---

## 🔧 **Python Service Configuration**

### **Update Dockerfile** (if needed)

The current `python/Dockerfile` needs to be updated for FastAPI:

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api/ ./api/

# Expose port
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "api.rag:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Environment Variables**

Set via AWS Secrets Manager or Lambda/ECS environment variables:

```bash
# Required
MONGODB_URI=mongodb+srv://...

# Optional
PYTHON_API_URL=https://api.engify.ai
LOG_LEVEL=INFO
```

---

## 🌐 **API Gateway Setup**

### **For Lambda Functions**

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name engify-api \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="https://engify.ai",AllowMethods="GET,POST,OPTIONS",AllowHeaders="*"

# Create integration
aws apigatewayv2 create-integration \
  --api-id API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:REGION:ACCOUNT:function:engify-rag-service \
  --payload-format-version "2.0"

# Create route
aws apigatewayv2 create-route \
  --api-id API_ID \
  --route-key "POST /api/rag/search" \
  --target integrations/INTEGRATION_ID

# Deploy
aws apigatewayv2 create-stage \
  --api-id API_ID \
  --stage-name prod \
  --auto-deploy
```

---

## 🧪 **Testing**

### **Test Lambda**

```bash
# Test health endpoint
aws lambda invoke \
  --function-name engify-rag-service \
  --payload '{"httpMethod": "GET", "path": "/health"}' \
  response.json

cat response.json
```

### **Test ECS Service**

```bash
# Get service IP
aws ecs describe-tasks \
  --cluster engify-cluster \
  --tasks TASK_ID \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value'

# Test health endpoint
curl http://ECS_TASK_IP:8000/health
```

---

## 📊 **Monitoring**

### **CloudWatch Logs**

```bash
# View Lambda logs
aws logs tail /aws/lambda/engify-rag-service --follow

# View ECS logs
aws logs tail /ecs/engify-rag-service --follow
```

### **CloudWatch Metrics**

```bash
# Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=engify-rag-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

---

## 🎯 **Recommended Deployment Path**

### **Week 1: Start with Lambda**
- Quick deployment
- Low cost
- Test basic functionality

### **Week 2: Evaluate Performance**
- Monitor cold starts
- Check response times
- Review costs

### **Week 3: Upgrade to ECS if Needed**
- If cold starts > 2 seconds
- If package size exceeds Lambda limits
- If need always-on service

---

## 📚 **Next Steps**

1. ✅ Install AWS CLI
2. ✅ Configure credentials
3. ✅ Choose deployment option (Lambda recommended to start)
4. ⏭️ Deploy Python backend
5. ⏭️ Configure API Gateway
6. ⏭️ Set up monitoring

**See**: `docs/aws/AWS_CLI_SETUP.md` for complete AWS setup guide.

