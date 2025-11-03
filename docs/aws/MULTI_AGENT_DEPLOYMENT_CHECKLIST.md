# Multi-Agent Workflow Deployment Checklist

## Prerequisites
- [ ] AWS CLI configured with credentials
- [ ] Docker installed and running
- [ ] OpenAI API key available
- [ ] MongoDB URI configured
- [ ] AWS ECR access configured

## Step 1: Install Dependencies Locally (Testing)
```bash
cd lambda
pip install -r requirements-multi-agent.txt
```

## Step 2: Test Locally First
```bash
# Test the workflow locally before deploying
python -c "from agents.scrum_meeting import app; print('Workflow compiled successfully')"
```

## Step 3: Set Up AWS ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name engify-multi-agent --region us-east-2

# Get login token
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com
```

## Step 4: Build Docker Image
```bash
# From project root
docker build -f lambda/Dockerfile.multi-agent -t engify-multi-agent .

# Tag for ECR
docker tag engify-multi-agent:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest
```

## Step 5: Push to ECR
```bash
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest
```

## Step 6: Create/Update Lambda Function
```bash
# Create Lambda function (first time)
aws lambda create-function \
  --function-name engify-scrum-meeting-agent \
  --package-type Image \
  --code ImageUri=<YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest \
  --role arn:aws:iam::<YOUR_ACCOUNT_ID>:role/lambda-execution-role \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{
    MONGODB_URI=${MONGODB_URI},
    OPENAI_API_KEY=${OPENAI_API_KEY}
  }" \
  --region us-east-2

# OR update existing function
aws lambda update-function-code \
  --function-name engify-scrum-meeting-agent \
  --image-uri <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest \
  --region us-east-2

# Update configuration
aws lambda update-function-configuration \
  --function-name engify-scrum-meeting-agent \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{
    MONGODB_URI=${MONGODB_URI},
    OPENAI_API_KEY=${OPENAI_API_KEY}
  }" \
  --region us-east-2
```

## Step 7: Set Environment Variables in Next.js
Add to `.env.local`:
```
MULTI_AGENT_LAMBDA_FUNCTION_NAME=engify-scrum-meeting-agent
AWS_REGION=us-east-2
```

## Step 8: Grant Lambda Permissions
- [ ] Lambda execution role has permissions to:
  - Write to CloudWatch Logs
  - Access VPC (if MongoDB is in VPC)
  - Access Secrets Manager (if using secrets)

## Step 9: Test Lambda Directly
```bash
# Test Lambda function
aws lambda invoke \
  --function-name engify-scrum-meeting-agent \
  --payload '{"body": "{\"agenda\": \"Plan sprint goals\"}"}' \
  --region us-east-2 \
  response.json

cat response.json
```

## Step 10: Test via Next.js API
```bash
# Test API route locally
curl -X POST http://localhost:3000/api/agents/scrum-meeting \
  -H "Content-Type: application/json" \
  -d '{"agenda": "Plan sprint goals"}'
```

## Step 11: Deploy Frontend
- [ ] Add component to a page (e.g., `/dashboard/agents`)
- [ ] Test UI interaction
- [ ] Verify error handling

## Step 12: Monitor & Debug
- [ ] Check CloudWatch Logs for Lambda errors
- [ ] Monitor API response times
- [ ] Check MongoDB for saved meetings
- [ ] Verify rate limiting works

## Common Issues & Fixes

### Issue: Lambda timeout
- **Fix:** Reduce `max_turns` in `scrum_meeting.py` or increase timeout

### Issue: Import errors in Lambda
- **Fix:** Ensure all dependencies are in `requirements-multi-agent.txt`

### Issue: MongoDB connection fails
- **Fix:** Check `MONGODB_URI` env var, verify Lambda VPC settings if MongoDB is in VPC

### Issue: OpenAI API errors
- **Fix:** Verify `OPENAI_API_KEY` is set correctly

### Issue: Next.js can't invoke Lambda
- **Fix:** Check IAM permissions, verify `MULTI_AGENT_LAMBDA_FUNCTION_NAME` env var

## Estimated Deployment Time
- First-time setup: 30-60 minutes
- Updates: 5-10 minutes

## Testing Checklist
- [ ] Lambda function invokes successfully
- [ ] All 4 agents respond (check CloudWatch logs)
- [ ] State saves to MongoDB
- [ ] API route returns correct format
- [ ] Frontend displays results correctly
- [ ] Error handling works (invalid agenda, rate limits, etc.)

