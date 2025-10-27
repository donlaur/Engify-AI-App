# AWS Deployment Strategy for Engify.ai

**Goal**: Deploy a production-ready, scalable AI platform on AWS that demonstrates enterprise-level cloud architecture skills.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Route 53 (DNS)                           │
│                    engify.ai → CloudFront                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront Distribution                       │
│              - Global CDN                                        │
│              - SSL/TLS termination                               │
│              - DDoS protection                                   │
│              - Edge caching                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│    S3 Bucket (Static)    │  │   API Gateway (REST)     │
│  - Next.js static files  │  │  - Rate limiting          │
│  - Images, CSS, JS       │  │  - API key validation     │
│  - Public assets         │  │  - Request validation     │
└──────────────────────────┘  └──────────────────────────┘
                                        ↓
                              ┌─────────┴─────────┐
                              ↓                   ↓
                    ┌──────────────────┐  ┌──────────────────┐
                    │  Lambda (Node.js)│  │  Lambda (Python) │
                    │  - API routes    │  │  - AI services   │
                    │  - Auth logic    │  │  - RAG engine    │
                    │  - Business logic│  │  - Embeddings    │
                    └──────────────────┘  └──────────────────┘
                              ↓                   ↓
                    ┌─────────┴───────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas (AWS)                         │
│              - M10 cluster (production)                          │
│              - Multi-region replication                          │
│              - Automated backups                                 │
│              - Vector search enabled                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Supporting Services                           │
│  - CloudWatch (Logging & Monitoring)                            │
│  - Secrets Manager (API keys, DB credentials)                   │
│  - SQS (Async job queue)                                        │
│  - ElastiCache Redis (Session & caching)                        │
│  - S3 (User uploads, exports)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Strategy: SST (Serverless Stack)

### Why SST?

**SST** is the modern way to build full-stack serverless applications on AWS. It provides:

- ✅ **Type-safe infrastructure**: Define AWS resources in TypeScript
- ✅ **Live Lambda Development**: Test Lambda functions locally with hot reload
- ✅ **Next.js support**: First-class support for Next.js on AWS
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Easy CI/CD**: Built-in deployment pipelines

### Installation

```bash
npm install -g sst
cd engify-ai-next
sst init
```

### SST Configuration

```typescript
// sst.config.ts
import { SSTConfig } from 'sst';
import { NextjsSite } from 'sst/constructs';
import { Api } from 'sst/constructs';
import { Function } from 'sst/constructs';

export default {
  config(_input) {
    return {
      name: 'engify-ai',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // MongoDB connection secret
      const mongoSecret = new Config.Secret(stack, 'MONGODB_URI');
      const nextAuthSecret = new Config.Secret(stack, 'NEXTAUTH_SECRET');

      // Python AI service Lambda
      const aiService = new Function(stack, 'AIService', {
        handler: 'python/lambda/ai_handler.handler',
        runtime: 'python3.11',
        timeout: '30 seconds',
        memorySize: '1024 MB',
        environment: {
          MONGODB_URI: mongoSecret.value,
        },
        layers: [
          // Python dependencies layer
          'arn:aws:lambda:us-east-1:123456789:layer:python-deps:1',
        ],
      });

      // API Gateway
      const api = new Api(stack, 'Api', {
        routes: {
          'POST /ai/chat': {
            function: {
              handler: 'src/lambda/chat.handler',
              bind: [mongoSecret, nextAuthSecret],
            },
          },
          'POST /ai/stream': {
            function: {
              handler: 'src/lambda/stream.handler',
              bind: [mongoSecret, nextAuthSecret],
            },
          },
          'POST /ai/rag': {
            function: aiService,
          },
        },
        cors: {
          allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowOrigins: ['https://engify.ai', 'https://www.engify.ai'],
        },
      });

      // Next.js site
      const site = new NextjsSite(stack, 'Site', {
        path: '.',
        environment: {
          NEXT_PUBLIC_API_URL: api.url,
        },
        bind: [mongoSecret, nextAuthSecret],
        customDomain: {
          domainName: 'engify.ai',
          domainAlias: 'www.engify.ai',
          hostedZone: 'engify.ai',
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
        ApiUrl: api.url,
      });
    });
  },
} satisfies SSTConfig;
```

---

## Phase 1: Initial AWS Setup (Week 2)

### Day 1: AWS Account Setup

#### 1. Create AWS Account
- Sign up at https://aws.amazon.com
- Enable MFA on root account
- Create IAM admin user
- Set up billing alerts

#### 2. Install AWS CLI
```bash
# macOS
brew install awscli

# Configure credentials
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: us-east-1
# Default output format: json
```

#### 3. Create S3 Buckets
```bash
# Static assets bucket
aws s3 mb s3://engify-ai-static --region us-east-1

# User uploads bucket
aws s3 mb s3://engify-ai-uploads --region us-east-1

# Lambda deployment artifacts
aws s3 mb s3://engify-ai-deployments --region us-east-1
```

### Day 2: MongoDB Atlas Setup

#### 1. Create Production Cluster
- Log in to MongoDB Atlas
- Create new M10 cluster (production tier)
- Select AWS as cloud provider
- Choose us-east-1 region
- Enable backup (point-in-time recovery)

#### 2. Configure Network Access
```bash
# Add AWS Lambda IP ranges (use VPC peering for production)
# For now, allow AWS IP ranges or use VPC
```

#### 3. Create Database User
```bash
# Username: engify-prod
# Password: [generate strong password]
# Role: readWrite on engify_ai database
```

#### 4. Enable Atlas Vector Search
```javascript
// Create vector search index via Atlas UI
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      }
    }
  }
}
```

### Day 3: Secrets Management

#### 1. Store Secrets in AWS Secrets Manager
```bash
# MongoDB URI
aws secretsmanager create-secret \
  --name engify/mongodb-uri \
  --secret-string "mongodb+srv://engify-prod:password@cluster.mongodb.net/engify_ai"

# NextAuth secret
aws secretsmanager create-secret \
  --name engify/nextauth-secret \
  --secret-string "$(openssl rand -base64 32)"

# Encryption key for user API keys
aws secretsmanager create-secret \
  --name engify/encryption-key \
  --secret-string "$(openssl rand -base64 32)"
```

#### 2. Create IAM Role for Lambda
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:*:secret:engify/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Day 4-5: Lambda Functions

#### 1. Create Python Lambda Layer
```bash
# Create layer directory
mkdir -p python-layer/python

# Install dependencies
pip install \
  pymongo \
  sentence-transformers \
  google-generativeai \
  openai \
  anthropic \
  -t python-layer/python

# Create layer zip
cd python-layer
zip -r python-deps.zip python/

# Upload to AWS
aws lambda publish-layer-version \
  --layer-name python-ai-deps \
  --zip-file fileb://python-deps.zip \
  --compatible-runtimes python3.11
```

#### 2. Create AI Service Lambda
```python
# python/lambda/ai_handler.py
import json
import os
from typing import Dict, Any
import boto3
from pymongo import MongoClient
import google.generativeai as genai

# Initialize clients
secrets_client = boto3.client('secretsmanager')

def get_secret(secret_name: str) -> str:
    response = secrets_client.get_secret_value(SecretId=secret_name)
    return response['SecretString']

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for AI operations
    """
    try:
        # Parse request
        body = json.loads(event['body'])
        operation = body.get('operation')  # 'chat', 'rag', 'embed'
        
        # Get MongoDB connection
        mongodb_uri = get_secret('engify/mongodb-uri')
        client = MongoClient(mongodb_uri)
        db = client.engify_ai
        
        if operation == 'chat':
            return handle_chat(body, db)
        elif operation == 'rag':
            return handle_rag(body, db)
        elif operation == 'embed':
            return handle_embed(body, db)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid operation'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def handle_chat(body: Dict[str, Any], db: Any) -> Dict[str, Any]:
    """Handle chat completion"""
    messages = body.get('messages', [])
    provider = body.get('provider', 'gemini')
    api_key = body.get('api_key')  # Decrypted by API Gateway
    
    if provider == 'gemini':
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        response = model.generate_content(
            [msg['content'] for msg in messages]
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'content': response.text,
                'provider': 'gemini',
                'tokens': estimate_tokens(response.text)
            })
        }
    
    return {
        'statusCode': 400,
        'body': json.dumps({'error': 'Unsupported provider'})
    }

def handle_rag(body: Dict[str, Any], db: Any) -> Dict[str, Any]:
    """Handle RAG retrieval"""
    from sentence_transformers import SentenceTransformer
    
    query = body.get('query')
    top_k = body.get('top_k', 5)
    
    # Generate embedding
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    query_embedding = embedder.encode(query).tolist()
    
    # Vector search
    results = list(db.knowledge_base.aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": top_k
            }
        },
        {
            "$project": {
                "content": 1,
                "title": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }
    ]))
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'results': results
        })
    }

def estimate_tokens(text: str) -> int:
    return len(text) // 4
```

### Day 6-7: CloudFront & Domain Setup

#### 1. Create CloudFront Distribution
```bash
# This is handled automatically by SST
# But for manual setup:

aws cloudfront create-distribution \
  --origin-domain-name engify-ai-static.s3.amazonaws.com \
  --default-root-object index.html
```

#### 2. Configure Custom Domain
```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name engify.ai \
  --subject-alternative-names www.engify.ai \
  --validation-method DNS \
  --region us-east-1

# Add CNAME records to Route 53 for validation
# Wait for certificate to be issued

# Update CloudFront distribution with custom domain
```

---

## Phase 2: Monitoring & Optimization (Week 3)

### CloudWatch Setup

#### 1. Custom Metrics
```typescript
// src/lib/monitoring/cloudwatch.ts
import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch({ region: 'us-east-1' });

export async function trackMetric(
  metricName: string,
  value: number,
  unit: string = 'Count'
) {
  await cloudwatch.putMetricData({
    Namespace: 'Engify',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
      },
    ],
  }).promise();
}

// Usage
await trackMetric('PromptExecutions', 1);
await trackMetric('AIResponseTime', responseTime, 'Milliseconds');
await trackMetric('TokensUsed', tokens);
```

#### 2. CloudWatch Alarms
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name engify-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# High latency alarm
aws cloudwatch put-metric-alarm \
  --alarm-name engify-high-latency \
  --alarm-description "Alert when p99 latency exceeds 5s" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic p99 \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Cost Optimization

#### 1. Lambda Reserved Concurrency
```bash
# Set reserved concurrency for critical functions
aws lambda put-function-concurrency \
  --function-name engify-ai-chat \
  --reserved-concurrent-executions 10
```

#### 2. S3 Lifecycle Policies
```json
{
  "Rules": [
    {
      "Id": "DeleteOldLogs",
      "Status": "Enabled",
      "Prefix": "logs/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Prefix": "uploads/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        }
      ]
    }
  ]
}
```

#### 3. CloudFront Caching
```javascript
// Cache static assets aggressively
{
  "CacheBehaviors": [
    {
      "PathPattern": "/_next/static/*",
      "MinTTL": 31536000,  // 1 year
      "DefaultTTL": 31536000,
      "MaxTTL": 31536000
    },
    {
      "PathPattern": "/api/*",
      "MinTTL": 0,
      "DefaultTTL": 0,
      "MaxTTL": 0
    }
  ]
}
```

---

## CI/CD Pipeline with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Run linter
        run: pnpm lint
      
      - name: Type check
        run: pnpm type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Deploy with SST
        run: pnpm sst deploy --stage production
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: ${{ steps.deploy.outputs.url }}
```

---

## Cost Estimation

### Monthly AWS Costs (Estimated)

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda (Node.js)** | 1M requests, 512MB, 1s avg | $20 |
| **Lambda (Python)** | 500K requests, 1GB, 3s avg | $30 |
| **API Gateway** | 1M requests | $3.50 |
| **CloudFront** | 100GB data transfer | $8.50 |
| **S3** | 50GB storage, 1M requests | $2 |
| **CloudWatch** | Logs + metrics | $10 |
| **Secrets Manager** | 5 secrets | $2 |
| **Route 53** | Hosted zone + queries | $1 |
| **MongoDB Atlas** | M10 cluster | $57 |
| **Total** | | **~$134/month** |

**Note**: With BYOK model, you have zero AI API costs. Users bring their own keys.

### Scaling Costs

At 10,000 active users:
- Lambda: ~$200/month
- CloudFront: ~$85/month
- MongoDB: ~$200/month (M30 cluster)
- **Total**: ~$500/month

**Revenue potential**: $10/user/month = $100,000/month  
**Gross margin**: 99.5%

---

## Security Best Practices

### 1. API Key Encryption
```typescript
// src/lib/utils/encryption.ts
import { KMS } from 'aws-sdk';

const kms = new KMS({ region: 'us-east-1' });

export async function encryptApiKey(plaintext: string): Promise<string> {
  const result = await kms.encrypt({
    KeyId: process.env.KMS_KEY_ID!,
    Plaintext: plaintext,
  }).promise();
  
  return result.CiphertextBlob!.toString('base64');
}

export async function decryptApiKey(ciphertext: string): Promise<string> {
  const result = await kms.decrypt({
    CiphertextBlob: Buffer.from(ciphertext, 'base64'),
  }).promise();
  
  return result.Plaintext!.toString('utf-8');
}
```

### 2. Rate Limiting
```typescript
// src/middleware/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(
  userId: string,
  limit: number = 100,
  window: number = 3600
): Promise<boolean> {
  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

### 3. Input Validation
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000),
  })).min(1).max(50),
  provider: z.enum(['gemini', 'openai', 'anthropic']).optional(),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(4096).optional(),
  }).optional(),
});
```

---

## Disaster Recovery

### 1. MongoDB Backups
- Automated daily backups (Atlas)
- Point-in-time recovery (last 24 hours)
- Cross-region replication

### 2. Lambda Versioning
```bash
# Publish Lambda version
aws lambda publish-version --function-name engify-ai-chat

# Create alias pointing to version
aws lambda create-alias \
  --function-name engify-ai-chat \
  --name production \
  --function-version 1
```

### 3. Blue-Green Deployment
```typescript
// sst.config.ts
const site = new NextjsSite(stack, 'Site', {
  // Deploy to staging first
  customDomain: {
    domainName: stack.stage === 'prod' ? 'engify.ai' : `${stack.stage}.engify.ai`,
  },
});
```

---

## Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| **Page Load Time** | < 2s | CloudWatch RUM |
| **API Response Time** | < 500ms | CloudWatch Metrics |
| **AI Response Time** | < 5s | Custom Metrics |
| **Uptime** | 99.9% | CloudWatch Alarms |
| **Error Rate** | < 0.1% | CloudWatch Logs |

---

## Next Steps

### Week 2: AWS Migration
1. ✅ Set up AWS account and IAM
2. ✅ Configure MongoDB Atlas on AWS
3. ✅ Deploy Lambda functions
4. ✅ Set up CloudFront + S3
5. ✅ Configure custom domain

### Week 3: Optimization
1. Implement caching strategy
2. Set up monitoring dashboards
3. Configure auto-scaling
4. Load testing
5. Security audit

### Week 4: Production Launch
1. Final testing
2. Documentation
3. Launch announcement
4. Monitor metrics
5. Iterate based on feedback

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-27  
**Status**: Ready for Implementation
