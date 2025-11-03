# Phase 1.5 Next Steps - Multi-Agent Lambda Deployment

**Status:** ✅ Lambda Deployed, ⏳ Integration Testing Needed  
**Date:** November 3, 2025

---

## ✅ Completed

1. ✅ Security fix - Removed hardcoded AWS Account ID
2. ✅ Docker image built (linux/amd64)
3. ✅ Pushed to ECR
4. ✅ Lambda function created and deployed
5. ✅ Environment variables set (MONGODB_URI, OPENAI_API_KEY)
6. ✅ Handler fixes (async wrapper, MongoDB boolean checks)

---

## ⏳ Next Steps (Priority Order)

### 1. Add Next.js Environment Variables ⚠️ REQUIRED

**Status:** Not done  
**Time:** 2 minutes

Add to `.env.local`:

```bash
MULTI_AGENT_LAMBDA_FUNCTION_NAME=engify-ai-integration-workbench
AWS_REGION=us-east-2
```

**Why:** Next.js API route (`/api/agents/scrum-meeting`) needs these to invoke Lambda.

**Command:**

```bash
echo "MULTI_AGENT_LAMBDA_FUNCTION_NAME=engify-ai-integration-workbench" >> .env.local
echo "AWS_REGION=us-east-2" >> .env.local
```

---

### 2. Test End-to-End Integration 🧪

**Status:** Pending  
**Time:** 5-10 minutes

**Option A: Test via Next.js API (Recommended)**

```bash
# Start Next.js dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/agents/scrum-meeting \
  -H 'Content-Type: application/json' \
  -d '{
    "situation": "We need to integrate AI coding assistants into our SDLC. Our team uses React/TypeScript, we have 25 engineers.",
    "context": "Series B startup, evaluating GitHub Copilot vs Cursor"
  }'
```

**Option B: Test Lambda Directly (Faster for debugging)**

```bash
python3 << 'EOF' > /tmp/test-payload.json
import json
payload = {
    "situation": "We need to integrate AI coding assistants into our SDLC. Our team uses React/TypeScript, we have 25 engineers.",
    "context": "Series B startup, evaluating GitHub Copilot vs Cursor"
}
print(json.dumps(payload))
EOF

aws lambda invoke \
  --function-name engify-ai-integration-workbench \
  --region us-east-2 \
  --cli-binary-format raw-in-base64-out \
  --payload file:///tmp/test-payload.json \
  /tmp/response.json

cat /tmp/response.json | python3 -m json.tool
```

**Expected:**

- Lambda executes successfully (may take 1-2 minutes for 12 agent turns)
- Returns structured response with `summary`, `conversation`, `session_id`
- No errors in CloudWatch logs

---

### 3. Fix Lambda Response Parsing 🔧

**Status:** May need adjustment  
**Time:** 5 minutes

**Issue:** Lambda returns API Gateway format:

```json
{
  "statusCode": 200,
  "body": "{...actual data...}"
}
```

But Next.js API route expects direct data. Check `src/lib/aws/lambda.ts` line 30:

```typescript
return JSON.parse(result.body || '{}');
```

**Verify:** This parsing handles both direct Lambda invocation and API Gateway format correctly.

---

### 4. Monitor CloudWatch Logs 📊

**Status:** Ongoing  
**Time:** 5 minutes

**View logs:**

```bash
aws logs tail /aws/lambda/engify-ai-integration-workbench --follow --region us-east-2
```

**Check for:**

- ✅ Successful MongoDB connections
- ✅ RAG context retrieval (prompts/patterns found)
- ✅ Agent invocations (4 agents × 3 rounds = 12 turns)
- ❌ Any errors or timeouts

---

### 5. Update Documentation 📝

**Status:** Pending  
**Time:** 10 minutes

**Files to update:**

- `docs/planning/WEEK_2_PLAN.md` - Mark Phase 1.5 tasks complete
- `docs/aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md` - Add completed steps
- `docs/development/REAL_MULTI_AGENT_WORKFLOWS.md` - Update deployment status

**Mark as complete:**

- ✅ Docker build
- ✅ Lambda deployment
- ✅ Environment variables
- ⏳ End-to-end testing
- ⏳ Documentation updates

---

### 6. Commit Changes 💾

**Status:** Pending  
**Time:** 5 minutes

**Files changed:**

- `lambda/lambda_handler_multi_agent.py` - Handler fixes
- `lambda/Dockerfile.multi-agent` - Docker configuration
- `scripts/aws/deploy-multi-agent-lambda.sh` - Security fix
- `scripts/aws/set-lambda-env.sh` - New script
- `scripts/docker/build-multi-agent.sh` - Platform flag
- `docs/aws/AWS_DEPLOYMENT_SCRIPTS_SECURITY.md` - New doc
- `docs/aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md` - Updated

**Commit message:**

```
feat(lambda): Deploy multi-agent workflow to AWS Lambda

- Fix async handler wrapper for Lambda Python runtime
- Fix MongoDB boolean checks (use `is not None`)
- Add security fix: Remove hardcoded AWS Account ID
- Add helper script for setting Lambda environment variables
- Update Docker build to use linux/amd64 platform
- Add deployment documentation

Phase 1.5: Real Multi-Agent Workflows - Lambda deployment complete
```

---

### 7. Test Frontend Integration 🎨

**Status:** Pending  
**Time:** 10 minutes

**Component:** `src/components/agents/ScrumMeetingAgent.tsx`

**Test:**

1. Navigate to `/workbench` or where component is used
2. Enter a situation/context
3. Click "Get Multi-Perspective Analysis"
4. Verify:
   - ✅ Loading state shows
   - ✅ Results display correctly
   - ✅ All 4 perspectives shown (Director, Manager, Tech Lead, Architect)
   - ✅ Recommendations, implementation plan, risks displayed

---

### 8. Add Error Handling & Loading States ⚠️

**Status:** May need improvement  
**Time:** 15 minutes

**Check:**

- ✅ Next.js API route handles Lambda errors gracefully
- ✅ Frontend shows loading state during 1-2 minute execution
- ✅ Frontend handles timeout errors (5-minute limit)
- ✅ Error messages are user-friendly

**Improve if needed:**

- Add progress indicator (estimated time remaining)
- Add "Cancel" button for long-running requests
- Better error messages for common failures

---

## 🎯 Success Criteria

- ✅ Lambda function deployed and accessible
- ✅ Environment variables configured
- ✅ End-to-end test passes (Next.js → Lambda → Response)
- ✅ CloudWatch logs show successful execution
- ✅ Frontend integration working
- ✅ Documentation updated
- ✅ Changes committed

---

## 📊 Current Status

**Lambda Deployment:** ✅ Complete  
**Environment Variables:** ✅ Complete  
**Next.js Integration:** ⏳ Needs testing  
**Frontend Integration:** ⏳ Needs testing  
**Documentation:** ⏳ Needs update  
**Commits:** ⏳ Pending

---

## 🚀 Quick Start (Next 5 Minutes)

1. **Add env vars:**

   ```bash
   echo "MULTI_AGENT_LAMBDA_FUNCTION_NAME=engify-ai-integration-workbench" >> .env.local
   echo "AWS_REGION=us-east-2" >> .env.local
   ```

2. **Test Lambda directly:**

   ```bash
   # Create test payload
   python3 << 'EOF' > /tmp/test.json
   import json
   print(json.dumps({"situation": "Test", "context": ""}))
   EOF

   # Invoke Lambda
   aws lambda invoke \
     --function-name engify-ai-integration-workbench \
     --region us-east-2 \
     --cli-binary-format raw-in-base64-out \
     --payload file:///tmp/test.json \
     /tmp/response.json

   # Check response
   cat /tmp/response.json | python3 -m json.tool
   ```

3. **If successful, test via Next.js:**
   ```bash
   npm run dev
   # Then test via curl or browser
   ```

---

**Ready to proceed?** Start with Step 1 (add environment variables) and then test!
