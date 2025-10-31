<!--
AI Summary: Operational runbook for Python RAG service deployment and troubleshooting.
Part of Day 5 Phase 11.
-->

# RAG Service Operational Runbook

## Service Overview

**Service**: Python RAG (Retrieval-Augmented Generation)  
**Port**: 8000 (local), AWS Lambda (production)  
**Health Endpoint**: `/health`  
**Dependencies**: MongoDB, sentence-transformers model

---

## Deployment

### Local Development

```bash
# Start RAG service
cd python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.rag:app --reload --port 8000

# Verify health
curl http://localhost:8000/health
```

### Production (AWS Lambda)

```bash
# Deploy to Lambda
cd lambda
./deploy-lambda.sh

# Test Lambda
aws lambda invoke \
  --function-name engify-rag-service \
  --payload '{"path":"/health","httpMethod":"GET"}' \
  response.json
  
cat response.json
```

---

## Health Checks

### Comprehensive Health Check

```bash
# Local
curl http://localhost:8000/health

# Expected response:
{
  "status": "ok",
  "timestamp": 1234567890.123,
  "service": "rag-api",
  "version": "1.0.0",
  "model": {
    "name": "all-MiniLM-L6-v2",
    "status": "loaded",
    "dimensions": 384
  },
  "database": {
    "status": "connected",
    "ping_ms": 12.34,
    "name": "engify"
  }
}
```

### From Next.js App

```bash
# Check RAG connectivity from app
curl http://localhost:3000/api/rag?unhealthy=false

# Should return:
{
  "status": "healthy",
  "rag_service": {...},
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

---

## Common Issues

### 1. Model Not Loading

**Symptoms:**
- Health check shows `"model": { "status": "not_loaded" }`
- RAG search returns 500 errors
- Startup logs show model download failures

**Diagnosis:**
```bash
# Check model cache
ls -la ~/.cache/torch/sentence_transformers/

# Check available disk space
df -h

# Check Python dependencies
pip list | grep sentence-transformers
```

**Resolution:**
1. Download model manually:
   ```python
   from sentence_transformers import SentenceTransformer
   model = SentenceTransformer('all-MiniLM-L6-v2')
   ```

2. If disk space issue: Clear cache and re-download

3. If network issue: Pre-download model and bundle with deployment

**Prevention:**
- Pre-warm Lambda with model included in deployment package
- Add model caching to Docker image
- Monitor model load time (should be < 5s)

---

### 2. MongoDB Connection Failures

**Symptoms:**
- Health check shows `"database": { "status": "not_connected" }`
- RAG search fails with connection errors
- Logs show `pymongo.errors.ServerSelectionTimeoutError`

**Diagnosis:**
```bash
# Test MongoDB connection
python3 << EOF
from pymongo import MongoClient
import os
client = MongoClient(os.environ['MONGODB_URI'])
print(client.admin.command('ping'))
EOF
```

**Resolution:**
1. Verify MongoDB URI in environment:
   ```bash
   printenv MONGODB_URI | grep -o '^mongodb.*@'
   ```

2. Check MongoDB Atlas allowlist:
   - Add Lambda IPs to allowlist
   - Or use 0.0.0.0/0 (less secure)

3. Verify network connectivity:
   ```bash
   # From Lambda
   nslookup <your-cluster>.mongodb.net
   ```

**Prevention:**
- Use MongoDB connection pooling
- Set appropriate timeouts (30s)
- Monitor connection pool exhaustion

---

### 3. Slow RAG Search Performance

**Symptoms:**
- `/api/rag` takes > 5s to respond
- Timeout errors in production
- Users report slow search results

**Diagnosis:**
```bash
# Check MongoDB query performance
# In MongoDB Atlas console, enable profiling:
db.setProfilingLevel(2, { slowms: 1000 })

# Check slow queries
db.system.profile.find().sort({ts:-1}).limit(10)
```

**Resolution:**
1. Add indexes to `web_content` collection:
   ```javascript
   db.web_content.createIndex({ hash: 1 });
   db.web_content.createIndex({ canonicalUrl: 1 });
   db.web_content.createIndex({ source: 1, createdAt: -1 });
   ```

2. Limit search results:
   ```python
   # Reduce from 10 to 5 results
   results = collection.find(...).limit(5)
   ```

3. Cache embeddings:
   ```python
   # Cache user query embeddings (Redis)
   query_hash = hashlib.sha256(query.encode()).hexdigest()
   cached = redis.get(f"embedding:{query_hash}")
   ```

4. Optimize model inference:
   - Use smaller model (MiniLM-L6 is already small)
   - Batch queries if possible
   - Consider GPU Lambda for faster inference

**Prevention:**
- Set p95 latency SLO: < 3s
- Alert if p95 > 5s
- Monitor embedding generation time separately from DB query time

---

### 4. Lambda Cold Starts

**Symptoms:**
- First request takes 10-30s
- Subsequent requests are fast (< 1s)
- Intermittent timeouts

**Diagnosis:**
```bash
# Check Lambda metrics in CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=engify-rag-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

**Resolution:**
1. **Immediate**: Increase Lambda timeout to 60s

2. **Short-term**: Enable provisioned concurrency
   ```bash
   aws lambda put-provisioned-concurrency-config \
     --function-name engify-rag-service \
     --provisioned-concurrent-executions 1
   ```

3. **Long-term**: Move to always-on container (ECS/Fargate)

**Prevention:**
- Use Lambda warming (scheduled pings every 5 min)
- Consider ECS for consistent performance
- Monitor cold start rate (should be < 10% of invocations)

---

## Monitoring & Alerts

### Key Metrics to Track

1. **RAG Search Success Rate**
   - Target: > 98%
   - Alert if < 95%

2. **RAG Search Latency (p95)**
   - Target: < 3s
   - Alert if > 5s

3. **Model Load Time**
   - Target: < 5s
   - Alert if > 10s

4. **MongoDB Query Time**
   - Target: < 500ms
   - Alert if > 2s

### Dashboard Queries

```typescript
// Get RAG performance metrics
const metrics = await fetch('/api/observability/metrics?provider=rag');
const data = await metrics.json();
console.log(data.summary.providers.find(p => p.provider === 'rag'));
```

---

## Runbook: Complete RAG Service Failure

**If RAG service is unavailable:**

1. **Immediate**: Disable RAG features in UI
   ```bash
   # Set in Vercel environment
   NEXT_PUBLIC_SHOW_RAG=false
   ```

2. **Fallback**: Use direct LLM calls (no context retrieval)
   - Users can still use workbench
   - No document context available

3. **Communication**:
   - In-app banner: "Document search temporarily unavailable"
   - Support ticket for affected users

4. **Recovery**:
   - Redeploy Lambda or restart container
   - Verify health endpoint
   - Test end-to-end search flow
   - Re-enable features gradually

---

## Scaling Considerations

### When to Scale

- Request rate > 100/min sustained
- Lambda throttling errors
- Cold start rate > 20%

### Scaling Options

1. **Horizontal (Lambda)**:
   - Increase reserved concurrency
   - Enable auto-scaling

2. **Vertical (Container)**:
   - Move to ECS/Fargate with more CPU
   - Use GPU instances for faster inference

3. **Caching**:
   - Cache embeddings in Redis (1h TTL)
   - Cache search results (15min TTL)

---

## Related Documentation

- [Python RAG Service Setup](../rag/PYTHON_RAG_SERVICE.md)
- [AWS Lambda Deployment](../aws/AWS_DEPLOYMENT_STRATEGY.md)
- [MongoDB Performance](../performance/MONGODB_MCP_PERFORMANCE_TESTING.md)

