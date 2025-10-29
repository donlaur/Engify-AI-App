# Unified AWS Architecture & Cost Analysis

**Date**: October 29, 2025  
**Goal**: Single cloud provider (AWS) to reduce complexity and costs

---

## 🎯 **Target Architecture: All on AWS**

### **Proposed Setup**:

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │  AWS Amplify │      │  AWS Lambda  │               │
│  │  (Next.js)   │──────│  (Light API) │               │
│  └──────────────┘      └──────────────┘               │
│         │                      │                        │
│         │                      │                        │
│         └──────────┬───────────┘                        │
│                    │                                     │
│              ┌─────▼─────┐                              │
│              │ ECS Fargate│                              │
│              │ (Python/FastAPI)                         │
│              └───────────┘                              │
│                    │                                     │
│              ┌─────▼─────┐                              │
│              │ MongoDB Atlas│                           │
│              └─────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **Cost Analysis**

### **Current Multi-Provider Setup**

**Vercel** (Next.js):

- **Free Tier**: $0/month (hobby)
- **Pro**: $20/month per developer
- **Enterprise**: $40+/month per developer
- **Bandwidth**: $40/TB after included

**Railway/Render** (FastAPI):

- **Hobby**: $5-10/month
- **Pro**: $20-30/month
- **Bandwidth**: Included up to limits

**Total Current**: ~$25-50/month (hobby) or ~$40-70/month (pro)

---

### **Unified AWS Setup**

#### **Option 1: Amplify + Lambda + Fargate (Recommended)**

**AWS Amplify** (Next.js hosting):

- **Free Tier**: First 12 months
  - 15 GB storage
  - 125 GB bandwidth
  - 1000 build minutes
- **Pay-as-you-go** (after free tier):
  - Storage: $0.023/GB/month
  - Bandwidth: $0.15/GB (first 10TB)
  - Build minutes: $0.01/minute
- **Typical cost**: **$10-20/month** (after free tier)

**AWS Lambda** (Light API endpoints):

- **Free Tier**: 1M requests/month, 400k GB-seconds
- **Pay-as-you-go**:
  - $0.20 per 1M requests
  - $0.0000166667 per GB-second
- **Typical cost**: **$5-15/month** (low-medium traffic)

**ECS Fargate** (Python FastAPI service):

- **vCPU**: $0.04048/hour (~$29/month for 0.25 vCPU always-on)
- **Memory**: $0.004445/GB-hour (~$3.20/month for 512MB)
- **Minimum**: ~$32/month (for always-on small instance)
- **On-demand scaling**: Pay only when running
- **Typical cost**: **$30-80/month** (depending on usage)

**Total AWS Cost**: **~$45-115/month** (all services)

**Cost Comparison**:

- **Current (Multi-provider)**: $25-70/month
- **AWS Unified**: $45-115/month
- **Difference**: +$20-45/month, but **everything in one place**

---

#### **Option 2: Amplify + Lambda Only (Cost-Effective)**

**Skip ECS Fargate**, use **Lambda Container** instead:

**AWS Amplify**: Same as above ($10-20/month)

**AWS Lambda Container** (Python FastAPI):

- **Free Tier**: Same as regular Lambda
- **Pay-as-you-go**: Same pricing
- **Typical cost**: **$10-30/month** (depending on requests)

**Total**: **~$25-50/month** (cheaper, but Lambda has limitations)

**Trade-offs**:

- ✅ **Cheaper** (~$20-30/month savings)
- ✅ Same serverless benefits
- ❌ **Cold starts** can be slow (1-5 seconds)
- ❌ 15-minute execution limit
- ❌ Not ideal for always-on workloads

---

#### **Option 3: EC2 Instead of Fargate (Cheapest)**

**AWS EC2 t3.micro** (always-on):

- **Instance**: ~$7.50/month (750 hours free in first year, then $10/month)
- **Storage**: $0.10/GB/month (8GB = $0.80/month)
- **Total**: **~$11/month** after free tier, **~$18/month** after

**But**:

- ❌ You manage the server (updates, security, scaling)
- ❌ Less reliable than Fargate
- ❌ More DevOps work

---

## 🏗️ **Service Breakdown: What Goes Where?**

### **AWS Amplify** (Next.js Frontend)

**What it hosts**:

- ✅ Static Next.js pages
- ✅ React components
- ✅ API routes that call Lambda/Fargate
- ✅ Client-side code

**What it doesn't do**:

- ❌ Long-running processes
- ❌ Heavy computation
- ❌ Database connections (direct)

**Cost**: $10-20/month

---

### **AWS Lambda** (Light API Routes)

**What goes here**:

- ✅ **Short-lived endpoints** (< 15 minutes)
- ✅ **API key management** endpoints
- ✅ **User authentication** helpers
- ✅ **Webhook handlers** (SendGrid, Twilio)
- ✅ **Background jobs** (via EventBridge)
- ✅ **File processing** (small files)

**Examples from your codebase**:

- `/api/v2/users/api-keys/*` - API key CRUD
- `/api/auth/*` - Auth helpers
- `/api/webhooks/*` - Incoming webhooks

**Cost**: $5-15/month

---

### **ECS Fargate** (Python/FastAPI)

**What goes here**:

- ✅ **RAG chatbot service** - Needs to stay warm for fast responses
- ✅ **Workbench tools** - Python AI execution
- ✅ **Embedding generation** - ML models (sentence-transformers)
- ✅ **Long-running processes** - File processing, batch jobs
- ✅ **WebSocket connections** - Real-time chat
- ✅ **Heavy computation** - Token counting, analysis

**Why not Lambda?**:

- ❌ Cold starts too slow (2-5 seconds) for chat UX
- ❌ 15-minute limit too short for some workbench tools
- ❌ Model loading overhead (sentence-transformers)
- ❌ Better for always-on services

**Cost**: $30-80/month (scales with usage)

---

## 💰 **Detailed Cost Breakdown**

### **Low Traffic** (< 10K requests/month)

**Amplify**: $10/month

- 20 GB bandwidth
- 500 build minutes

**Lambda**: $2/month

- 500K requests
- Minimal compute

**ECS Fargate** (small, always-on):

- 0.25 vCPU: $29/month
- 512MB RAM: $3.20/month
- **Total: ~$44/month**

**Grand Total**: **~$56/month**

---

### **Medium Traffic** (100K requests/month)

**Amplify**: $15/month

- 100 GB bandwidth
- 1000 build minutes

**Lambda**: $8/month

- 5M requests
- Moderate compute

**ECS Fargate** (medium):

- 0.5 vCPU: $58/month
- 1GB RAM: $6.40/month
- **Total: ~$64/month**

**Grand Total**: **~$87/month**

---

### **High Traffic** (1M+ requests/month)

**Amplify**: $30/month

- 500 GB bandwidth
- Auto-scaling builds

**Lambda**: $25/month

- 50M requests
- High compute

**ECS Fargate** (large, auto-scaling):

- 1-4 vCPU (scales): $116-464/month
- 2-8GB RAM: $13-52/month
- **Total: ~$130-520/month** (scales with load)

**Grand Total**: **~$185-575/month** (scales automatically)

---

## 🔄 **Migration Path**

### **Phase 1: Next.js → AWS Amplify** (Week 1)

**Steps**:

1. Connect GitHub repo to AWS Amplify
2. Configure build settings (same as Vercel)
3. Set environment variables
4. Deploy and test
5. Point domain to Amplify

**Cost Impact**:

- **Before**: $20/month (Vercel Pro)
- **After**: $10-15/month (Amplify)
- **Savings**: ~$5-10/month

**Risk**: Low (easy to rollback)

---

### **Phase 2: FastAPI → Lambda Container** (Week 2)

**Steps**:

1. Package FastAPI as Docker container
2. Deploy to Lambda Container
3. Test endpoints
4. Update Next.js API routes

**Cost Impact**:

- **Before**: $10/month (Railway)
- **After**: $10-20/month (Lambda)
- **Savings**: Minimal, but unified

**Risk**: Medium (need to handle cold starts)

---

### **Phase 3: Move to ECS Fargate** (Week 3-4, if needed)

**Steps**:

1. Create ECS cluster
2. Deploy FastAPI as Fargate task
3. Set up Application Load Balancer
4. Configure auto-scaling
5. Update DNS

**Cost Impact**:

- **Before**: $10/month (Lambda)
- **After**: $30-80/month (Fargate)
- **Cost Increase**: +$20-70/month, but **better performance**

**Risk**: Medium (more complex setup)

**When to do this**:

- ✅ Cold starts are hurting UX
- ✅ Need always-on for chat
- ✅ Expecting high traffic

---

## 🎯 **Recommendation**

### **Start with Option 2** (Amplify + Lambda Only)

**Why**:

- ✅ **Cheapest** ($25-50/month)
- ✅ **Simplest migration** (skip Docker initially)
- ✅ **Easy to upgrade** to Fargate later if needed

**Architecture**:

```
Next.js (Amplify) → Lambda Container (FastAPI) → MongoDB Atlas
```

**Cost**: ~$25-50/month

---

### **Upgrade to Option 1** (Add Fargate) When:

- ❌ Lambda cold starts > 2 seconds
- ❌ Users complain about slow chat responses
- ❌ Traffic exceeds 100K requests/month
- ✅ Need WebSocket support

**Then move to**:

```
Next.js (Amplify) → Lambda (light APIs) + ECS Fargate (Python/FastAPI) → MongoDB
```

**Cost**: ~$45-115/month (worth it for better UX)

---

## 📋 **Cost Comparison Table**

| Setup                                | Monthly Cost | Complexity | Performance              |
| ------------------------------------ | ------------ | ---------- | ------------------------ |
| **Current (Vercel + Railway)**       | $25-70       | Medium     | Good                     |
| **AWS (Amplify + Lambda)**           | $25-50       | Low        | Good (with cold starts)  |
| **AWS (Amplify + Lambda + Fargate)** | $45-115      | Medium     | Excellent                |
| **AWS (Amplify + EC2)**              | $20-30       | High       | Good (manual management) |

---

## ✅ **Action Plan**

### **Immediate (Minimize Costs)**:

1. **Week 1**: Move Next.js to AWS Amplify
   - Cost: $10-15/month (vs $20 Vercel)
   - Savings: $5-10/month

2. **Week 2**: Deploy FastAPI to Lambda Container
   - Cost: $10-20/month
   - Total: $20-35/month

**Total AWS Cost**: **~$20-35/month** (cheaper than current!)

---

### **Later (Better Performance)**:

3. **Week 3-4**: Move FastAPI to ECS Fargate (if needed)
   - Cost: +$20-70/month
   - Total: $45-115/month
   - **But everything in one place + better UX**

---

## 🎯 **My Recommendation**

**Start with**: Amplify + Lambda Container (~$25-50/month)

- ✅ Cheaper than current setup
- ✅ Everything on AWS
- ✅ Easy to upgrade later

**Upgrade to Fargate when**:

- Traffic grows
- Cold starts become a problem
- Budget allows

This gives you a clear path forward without over-committing to costs upfront!
