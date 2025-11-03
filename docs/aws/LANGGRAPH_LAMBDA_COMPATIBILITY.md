# LangGraph Multi-Agent on AWS Lambda: Compatibility & Architecture

**Date:** November 3, 2025  
**Status:** Architecture Decision Guide  
**Priority:** High - Production deployment planning

---

## Quick Answer

**✅ YES, LangGraph multi-agent workflows WILL work on AWS Lambda**  
**✅ SIMPLIFIED:** For beta/early release, 5-minute meetings are perfect for Lambda  
**🚨 EC2/ECS needed ONLY if:** Timeout > 15 minutes OR persistent connections needed (not needed for beta)

---

## Current Setup Analysis

### Your Current Lambda Configuration

```bash
# scripts/deploy-lambda.sh
Timeout: 30 seconds (can be increased to 15 minutes max)
Memory: 256MB (can be increased to 10GB)
Runtime: Python 3.9/3.11
Package: ZIP deployment (50MB limit, or 10GB with Lambda Container Image)
```

### Lambda Limits (Maximum)

| Resource         | ZIP Deployment | Lambda Container Image |
| ---------------- | -------------- | ---------------------- |
| **Timeout**      | 15 minutes     | 15 minutes             |
| **Memory**       | 10GB           | 10GB                   |
| **Package Size** | 50MB zipped    | 10GB container         |
| **Cold Start**   | 1-5 seconds    | 2-10 seconds           |

---

## LangGraph Multi-Agent on Lambda: Feasibility

### ✅ What Works Well

**1. LangGraph Itself (Lightweight)**

```python
# LangGraph is just orchestration logic
# Package size: ~5-10MB
# No heavy dependencies
# ✅ Fits easily in Lambda ZIP (50MB limit)
```

**2. Agent Communication (Async)**

```python
# Each agent makes external LLM API calls
# These are HTTP requests (don't count against Lambda timeout)
# Only the orchestration code runs in Lambda
# ✅ Most of the time is spent waiting for LLM responses
```

**3. State Management**

```python
# LangGraph state stored in MongoDB
# Lambda function is stateless
# ✅ Perfect for serverless architecture
```

**4. Tool Use**

```python
# Tools are external API calls (Jira, Slack, etc.)
# Also don't count against Lambda timeout
# ✅ Can use tools without timeout issues
```

### ⚠️ What Needs Optimization

**1. Timeout Management**

```python
# Problem: 15-minute maximum timeout
# Solution: Break long workflows into smaller chunks
# Example: Scrum meeting → Save state → Continue later
```

**2. Cold Starts**

```python
# Problem: 2-5 second cold start
# Solution:
# - Use Lambda Container Image (pre-warmed)
# - Keep warm with scheduled pings
# - Use provisioned concurrency (costs more)
```

**3. Package Size**

```python
# Problem: sentence-transformers is 500MB+
# Solution: Use Lambda Container Image (10GB limit)
# OR: Use external embedding service (already doing this)
```

---

## Architecture: Lambda-Optimized Multi-Agent

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Next.js)                     │
│  Frontend + API Routes (/api/agents/scrum-meeting)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP POST
                     │
┌────────────────────▼────────────────────────────────────┐
│              AWS Lambda (Python 3.11)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ LangGraph Multi-Agent Orchestrator                │  │
│  │ - State management (MongoDB)                      │  │
│  │ - Agent coordination                               │  │
│  │ - Workflow graph execution                         │  │
│  └──────────────────────────────────────────────────┘  │
│                     │                                    │
│                     │ Async HTTP calls                   │
│                     │                                    │
│  ┌──────────────────▼────────────────────────────────┐  │
│  │ Agent 1: Scrum Master → OpenAI API                 │  │
│  │ Agent 2: PM → Anthropic API                        │  │
│  │ Agent 3: PO → OpenAI API                           │  │
│  │ Agent 4: Engineer → OpenAI API                     │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Store state
                     │
┌────────────────────▼────────────────────────────────────┐
│              MongoDB Atlas                               │
│  - Meeting state                                         │
│  - Agent conversations                                  │
│  - Action items                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Lambda Configuration for Multi-Agent

### Optimized Lambda Settings

```python
# Recommended Lambda configuration
{
    "FunctionName": "engify-multi-agent",
    "Runtime": "python3.11",
    "Timeout": 900,  # 15 minutes (maximum)
    "MemorySize": 1024,  # 1GB (enough for LangGraph)
    "PackageType": "Zip",  # Or "Image" for larger deps
    "Handler": "lambda_handler.handler",
    "Environment": {
        "MONGODB_URI": "...",
        "OPENAI_API_KEY": "...",
        "ANTHROPIC_API_KEY": "..."
    }
}
```

### Deployment: Lambda Container Image (Recommended)

**Why Container Image?**

- ✅ 10GB package size (vs 50MB ZIP)
- ✅ Can include all dependencies
- ✅ Better cold start performance
- ✅ Easier dependency management

**Dockerfile Example:**

```dockerfile
FROM public.ecr.aws/lambda/python:3.11

# Install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY lambda/ ${LAMBDA_TASK_ROOT}

# Set handler
CMD [ "lambda_handler.handler" ]
```

**requirements.txt:**

```txt
langgraph==0.0.40
langchain==0.1.0
langchain-openai==0.0.5
langchain-anthropic==0.0.2
pymongo==4.6.0
pydantic==2.5.0
```

**Package Size:** ~200-300MB (fits easily in 10GB limit)

---

## Timeout Optimization Strategies

### Strategy 1: Chunked Workflows (Recommended)

**Problem:** Scrum meeting might take > 15 minutes  
**Solution:** Break into chunks, save state after each

```python
# lambda_handler.py
async def handler(event, context):
    meeting_id = event['meeting_id']
    current_topic = event.get('current_topic')

    # Load state from MongoDB
    state = await load_state(meeting_id)

    # Run one turn (4 agents × 1 turn each)
    # Time: ~2-3 minutes
    result = await app.invoke({
        "agenda": state['agenda'],
        "current_topic": current_topic,
        "turn_count": state.get('turn_count', 0),
    })

    # Save state to MongoDB
    await save_state(meeting_id, result)

    # Return continuation token if more topics
    if result['has_more_topics']:
        return {
            "status": "in_progress",
            "meeting_id": meeting_id,
            "next_topic": result['next_topic'],
            "continue_url": f"/api/agents/scrum-meeting/continue/{meeting_id}"
        }
    else:
        return {
            "status": "complete",
            "meeting_id": meeting_id,
            "summary": result['summary']
        }
```

**Frontend Flow:**

```typescript
// Frontend calls Lambda multiple times
async function runScrumMeeting(agenda: string) {
  const { meeting_id } = await startMeeting(agenda);

  let result;
  do {
    result = await continueMeeting(meeting_id);
    // Show progress to user
    updateUI(result);
  } while (result.status === 'in_progress');

  return result;
}
```

**Benefits:**

- ✅ Each Lambda invocation < 5 minutes
- ✅ Can pause/resume meetings
- ✅ User sees progress in real-time
- ✅ Cost: Same (pay per invocation)

---

### Strategy 2: Async Processing (For Long Meetings)

**Problem:** Very long meetings (> 15 minutes total)  
**Solution:** Use Step Functions or SQS

```python
# Lambda 1: Start meeting (synchronous)
async def start_meeting_handler(event, context):
    meeting_id = generate_id()
    await save_agenda(meeting_id, event['agenda'])

    # Trigger async processing
    await sqs.send_message(
        QueueUrl=PROCESSING_QUEUE,
        MessageBody=json.dumps({'meeting_id': meeting_id})
    )

    return {'meeting_id': meeting_id, 'status': 'processing'}

# Lambda 2: Process meeting (async, can run longer)
async def process_meeting_handler(event, context):
    meeting_id = event['meeting_id']

    # Process in chunks
    while True:
        state = await load_state(meeting_id)
        if state['complete']:
            break

        # Process one chunk
        result = await app.invoke(state)
        await save_state(meeting_id, result)

        # Check remaining time
        if context.get_remaining_time_in_millis() < 60000:  # 1 min buffer
            # Re-queue for continuation
            await sqs.send_message(
                QueueUrl=PROCESSING_QUEUE,
                MessageBody=json.dumps({'meeting_id': meeting_id})
            )
            break

    return {'status': 'complete'}
```

**Benefits:**

- ✅ Can handle meetings of any length
- ✅ Automatic retries on failure
- ✅ Cost-effective (pay per chunk)

---

## Cost Comparison

### Lambda (Current)

**Scrum Meeting Example:**

```
4 agents × 2-3 turns = 8-12 LLM calls
Lambda invocations: 1-2 (chunked)
Lambda cost: $0.0000166 per GB-second
Memory: 1GB
Duration: 300 seconds (5 min)
Cost: $0.0000166 × 1GB × 300s = $0.005 per meeting

Monthly (100 meetings): $0.50
```

### EC2 (If Needed)

**Same Meeting:**

```
EC2 t3.medium: $0.0416/hour
Always-on: $30/month
Per meeting: $0.30 (if idle most of time)
```

**Verdict:** ✅ Lambda is 60x cheaper ($0.50 vs $30/month)

---

## When to Use EC2/ECS Instead

### ❌ Don't Need EC2 If:

- ✅ Meetings < 15 minutes total
- ✅ Can chunk workflows
- ✅ Acceptable cold starts (2-5 seconds)
- ✅ Stateless architecture

### ✅ Need EC2/ECS If:

- ❌ Meetings > 15 minutes (can't chunk)
- ❌ WebSocket connections needed
- ❌ Sub-second latency required
- ❌ Stateful sessions (keep connections open)
- ❌ Heavy ML models (large embedding models)

---

## Recommended Architecture: Lambda + Vercel (Beta/Early Release)

### Phase 1: Lambda (Current - Perfect for Beta)

**Deploy:**

- ✅ LangGraph multi-agent to Lambda Container Image
- ✅ 5-minute timeout (sufficient for beta meetings)
- ✅ Simple workflow (no chunking needed for 5-minute limit)
- ✅ MongoDB state storage

**Cost:** $0.50-5/month (depending on usage)

**Benefits:**

- ✅ Serverless (no server management)
- ✅ Auto-scaling
- ✅ Pay-per-use
- ✅ Works with current setup
- ✅ Simple implementation (no chunking complexity)

---

### Phase 2: EC2/ECS (If Needed Later)

**When to Migrate:**

- ❌ Timeout issues (meetings > 15 min)
- ❌ Cold start problems (users complain)
- ❌ Need WebSocket (real-time updates)

**Deploy:**

- ✅ ECS Fargate (no EC2 management)
- ✅ Always-on container
- ✅ No timeout limits
- ✅ WebSocket support

**Cost:** $20-50/month (base cost)

---

## Implementation Plan (Simplified for Beta)

### Step 1: Update Lambda Configuration (30 min)

```bash
# Update deploy script - 5 minute timeout (perfect for beta)
aws lambda update-function-configuration \
  --function-name engify-multi-agent \
  --timeout 300 \
  --memory-size 1024 \
  --region us-east-2
```

**Note:** 5-minute timeout is perfect for beta/early release:

- ✅ Simple implementation (no chunking needed)
- ✅ Scrum meetings typically 2-5 minutes
- ✅ Sufficient for early users
- ✅ Can upgrade to 15-minute timeout later if needed

### Step 2: Create Lambda Container Image (2-3 hours)

```bash
# Create Dockerfile
cd python/
docker build -t engify-multi-agent .

# Push to ECR
aws ecr create-repository --repository-name engify-multi-agent
docker tag engify-multi-agent:latest <account>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest
docker push <account>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest

# Deploy Lambda from image (5-minute timeout for beta)
aws lambda create-function \
  --function-name engify-multi-agent \
  --package-type Image \
  --code ImageUri=<account>.dkr.ecr.us-east-2.amazonaws.com/engify-multi-agent:latest \
  --role arn:aws:iam::<account>:role/lambda-execution-role \
  --timeout 300 \
  --memory-size 1024
```

### Step 3: Implement Simple Workflow (1-2 hours)

**Simplified for Beta:**

- Add state persistence to MongoDB (single meeting)
- No chunking needed (5-minute limit)
- Update frontend for single meeting flow

**Example Handler:**

```python
async def handler(event, context):
    # Simple: Run entire meeting in one invocation
    # Timeout: 5 minutes (sufficient for beta)

    meeting_data = event['meeting_data']
    result = await app.invoke(meeting_data)

    # Save to MongoDB
    await save_meeting_result(result)

    return {
        "status": "complete",
        "meeting_id": result['meeting_id'],
        "summary": result['summary'],
        "action_items": result['action_items']
    }
```

### Step 4: Test & Optimize (1-2 hours)

- Test with real scrum meetings (2-5 minutes)
- Measure cold start times
- Optimize package size
- Monitor costs

**Total Time:** 5-8 hours (1 day) - Simplified for beta!

**Future Enhancement:** Add chunking only if meetings exceed 5 minutes (post-beta)

---

## Conclusion

**✅ YES, LangGraph multi-agent works perfectly on Lambda for Beta:**

1. **LangGraph is lightweight** - fits in Lambda easily
2. **Agent communication is async** - LLM calls don't count against timeout
3. **State in MongoDB** - stateless Lambda function
4. **5-minute timeout** - perfect for beta meetings (2-5 minutes typical)

**Lambda Configuration (Beta):**

- Timeout: 5 minutes (sufficient for beta)
- Memory: 1GB (enough)
- Package: Lambda Container Image (10GB limit)
- Cost: $0.50-5/month
- **Simplified:** No chunking needed!

**Post-Beta Upgrade Path:**

- Increase timeout to 15 minutes if needed
- Add chunking only if meetings exceed 5 minutes
- Migrate to EC2/ECS only if meetings consistently > 15 minutes

**Recommendation:** ✅ Start with Lambda (5-minute timeout), perfect for beta/early release

---

## Next Steps (Beta Implementation)

1. ✅ Update Lambda timeout to 5 minutes (perfect for beta)
2. ✅ Create Lambda Container Image
3. ✅ Implement simple workflow (no chunking needed)
4. ✅ Test with real scrum meetings (2-5 minutes)
5. ✅ Monitor and upgrade to 15-minute timeout post-beta if needed

---

**Last Updated:** November 3, 2025  
**Status:** Ready for implementation  
**Architecture:** Lambda (recommended) → EC2/ECS (if needed)
