# Multi-Agent Workflow Production Verification

**Date:** November 3, 2025  
**Goal:** Verify multi-agent workflow works end-to-end in production

---

## Pre-Production Checklist

### ✅ Frontend Components
- [x] `src/app/workbench/multi-agent/page.tsx` exists
- [x] `src/components/agents/ScrumMeetingAgent.tsx` exists
- [x] Page accessible at `/workbench/multi-agent`

### ✅ API Route
- [x] `src/app/api/agents/scrum-meeting/route.ts` exists
- [x] Rate limiting configured
- [x] Error handling implemented
- [x] Logger configured

### ✅ Lambda Client
- [x] `src/lib/aws/lambda.ts` exists
- [x] AWS credentials support added
- [x] Error handling implemented

---

## Production Environment Variables Required

### Vercel Environment Variables (for Lambda invocation)
- [ ] `AWS_ACCESS_KEY_ID` - Set in Vercel
- [ ] `AWS_SECRET_ACCESS_KEY` - Set in Vercel
- [ ] `AWS_REGION` - Set to `us-east-2`
- [ ] `MULTI_AGENT_LAMBDA_FUNCTION_NAME` - Optional (defaults to `engify-ai-integration-workbench`)

### Lambda Function Environment Variables (AWS Lambda)
- [ ] `OPENAI_API_KEY` - Set in Lambda
- [ ] `MONGODB_URI` - Set in Lambda

---

## Verification Steps

### Step 1: Check Frontend Page Loads
```bash
# In browser:
https://engify.ai/workbench/multi-agent

# Expected:
- Page loads without errors
- Form displays: "Situation or Problem" and "Additional Context" fields
- "Get Multi-Perspective Analysis" button visible
```

### Step 2: Test Lambda Invocation (Direct)
```bash
# Test Lambda function directly
aws lambda invoke \
  --function-name engify-ai-integration-workbench \
  --payload '{"situation":"Test situation","context":"Test context"}' \
  --region us-east-2 \
  response.json

cat response.json
```

### Step 3: Test via API Route (Local with Production Vars)
```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-2"

# Test API route locally
curl -X POST http://localhost:3000/api/agents/scrum-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "We need to integrate AI coding assistants into our SDLC",
    "context": "Team uses React/TypeScript, 25 engineers"
  }'
```

### Step 4: Test End-to-End in Production
```bash
# Test production API
curl -X POST https://engify.ai/api/agents/scrum-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "We need to integrate AI coding assistants into our SDLC",
    "context": "Team uses React/TypeScript, 25 engineers"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "session_id": "...",
  "summary": {
    "recommendations": [...],
    "implementation_plan": [...],
    "risks_and_mitigations": [...]
  },
  "conversation": {
    "director": "...",
    "manager": "...",
    "tech_lead": "...",
    "architect": "..."
  },
  "turn_count": 12
}
```

---

## Common Issues & Fixes

### Issue: "Read timeout on endpoint URL"
**Cause:** AWS credentials not set in Vercel  
**Fix:** Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` in Vercel env vars

### Issue: "AccessDeniedException"
**Cause:** IAM user doesn't have permission  
**Fix:** Verify IAM policy allows `lambda:InvokeFunction` on the Lambda function

### Issue: "ResourceNotFoundException"
**Cause:** Lambda function name incorrect  
**Fix:** Verify function name: `engify-ai-integration-workbench` exists in `us-east-2`

### Issue: Lambda returns 500 error
**Cause:** Lambda function missing environment variables  
**Fix:** Set `OPENAI_API_KEY` and `MONGODB_URI` in Lambda function configuration

### Issue: "ModuleNotFoundError" in Lambda
**Cause:** Lambda dependencies not installed  
**Fix:** Verify Docker image includes all `requirements-multi-agent.txt` dependencies

---

## Verification Checklist

- [ ] Frontend page loads: `https://engify.ai/workbench/multi-agent`
- [ ] Form submits without JavaScript errors
- [ ] API route responds (check Network tab)
- [ ] Lambda function receives invocation (check CloudWatch logs)
- [ ] Lambda function executes successfully (check CloudWatch logs)
- [ ] Response returns with all expected fields
- [ ] Frontend displays results correctly

---

## Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/engify-ai-integration-workbench --follow --region us-east-2
```

### Vercel Logs
- Check Vercel Dashboard → Your Project → Logs
- Look for `/api/agents/scrum-meeting` requests
- Check for AWS SDK errors

---

## Success Criteria

✅ **Frontend:**
- Page loads without errors
- Form submits successfully
- Results display correctly

✅ **API Route:**
- Returns 200 status for valid requests
- Returns 400 for invalid requests (missing situation)
- Returns 429 for rate limit exceeded
- Returns 500 for Lambda errors (with error details)

✅ **Lambda Function:**
- Receives invocation
- Executes within 5-minute timeout
- Returns valid JSON response
- Saves session to MongoDB (if available)

✅ **Integration:**
- End-to-end flow works: Frontend → API → Lambda → Response → Frontend
- No timeouts or errors
- Results match expected format

---

## Next Steps After Verification

1. **If working:** Document success, monitor costs
2. **If errors:** Check CloudWatch logs, fix issues, retest
3. **If timeouts:** Increase Lambda timeout (currently 5 minutes)
4. **If costs high:** Consider optimizations (fewer turns, cheaper model)

---

**Related Documentation:**
- [Vercel Lambda Setup](../aws/VERCEL_LAMBDA_SETUP.md)
- [Multi-Agent Deployment Checklist](../aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md)
- [Lambda Deployment Guide](../../lambda/README-multi-agent.md)

