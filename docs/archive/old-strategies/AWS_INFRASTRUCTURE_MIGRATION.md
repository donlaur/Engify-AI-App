# AWS Infrastructure Migration Plan

## 🎯 Goal

Migrate from local/file-based infrastructure to AWS managed services for better security, observability, and enterprise readiness.

## ✅ Current AWS Usage

**Already Using:**

- ✅ AWS Cognito (authentication)
- ✅ AWS Secrets Manager SDK (installed, not yet integrated)
- ✅ AWS Lambda (planned for Python backend)
- ✅ AWS ECS Fargate (planned for Python backend)

## 🔄 Migration Targets

### 1. **AWS Secrets Manager** ⭐ HIGH PRIORITY

**Current State:**

- Secrets stored in `.env.local` (Vercel environment variables)
- Risk: Secrets exposed in Vercel dashboard, manual rotation

**Benefits:**

- ✅ Centralized secret management
- ✅ Automatic rotation (if configured)
- ✅ Audit trail (who accessed what)
- ✅ Versioning (rollback support)
- ✅ Integration with IAM (fine-grained access)

**Cost:** ~$0.40/month per secret + $0.05 per 10,000 API calls (very affordable)

**Migration Plan:**

```typescript
// Before: src/lib/env.ts
const MONGODB_URI = process.env.MONGODB_URI;

// After: src/lib/secrets/aws-secrets-manager.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName: string): Promise<string> {
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return response.SecretString || '';
}

// Cache secrets (refresh every 5 minutes)
let secretCache: Map<string, { value: string; expires: Date }> = new Map();

export async function getMongoDbUri(): Promise<string> {
  const cached = secretCache.get('mongodb-uri');
  if (cached && cached.expires > new Date()) {
    return cached.value;
  }

  const value = await getSecret('engify/mongodb-uri');
  secretCache.set('mongodb-uri', {
    value,
    expires: new Date(Date.now() + 5 * 60 * 1000), // 5 min cache
  });
  return value;
}
```

**Secrets to Migrate:**

- `engify/mongodb-uri`
- `engify/openai-api-key`
- `engify/google-api-key`
- `engify/sendgrid-api-key`
- `engify/cognito-client-secret` (if using)
- `engify/jwt-secret`

**Implementation Steps:**

1. Install `@aws-sdk/client-secrets-manager` (already installed ✅)
2. Create `src/lib/secrets/aws-secrets-manager.ts`
3. Create secrets in AWS Secrets Manager console
4. Update `src/lib/env.ts` to use Secrets Manager
5. Add IAM role for Lambda/Vercel to access secrets
6. Keep `.env.local` for local development (fallback)

---

### 2. **CloudWatch Logs** ⭐ HIGH PRIORITY

**Current State:**

- Winston logging to files (`logs/app.log`, `logs/app-error.log`)
- Audit logs to files (`logs/audit-*.log`)
- Security logs to files (`logs/security-*.log`)
- **Problem:** Files don't work in Vercel serverless

**Benefits:**

- ✅ Centralized logging (all environments)
- ✅ Log retention (compliance - 7 years for SOC 2)
- ✅ Search/filter across all logs
- ✅ Integration with CloudWatch Alarms
- ✅ No file system needed (serverless-friendly)

**Cost:**

- First 5 GB/month: **FREE**
- $0.50 per GB ingested
- $0.03 per GB stored/month
- **Estimated: $5-10/month** (very affordable)

**Migration Plan:**

```typescript
// Before: src/lib/logging/logger.ts
import winston from 'winston';
appLogger.add(new winston.transports.File({ filename: 'logs/app.log' }));

// After: src/lib/logging/cloudwatch.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const cloudwatchTransport = new CloudWatchTransport({
  logGroupName: '/engify/app',
  logStreamName: `${process.env.NODE_ENV}-${Date.now()}`,
  awsRegion: 'us-east-1',
  messageFormatter: ({ level, message, ...meta }) => {
    return JSON.stringify({ level, message, ...meta });
  },
});

appLogger.add(cloudwatchTransport);
```

**Implementation Steps:**

1. Install `winston-cloudwatch`: `pnpm add winston-cloudwatch`
2. Create CloudWatch log groups:
   - `/engify/app` (application logs)
   - `/engify/audit` (audit logs)
   - `/engify/security` (security logs)
3. Update `src/lib/logging/logger.ts` to use CloudWatch
4. Update `src/lib/logging/audit.ts` to use CloudWatch
5. Add IAM permissions for CloudWatch Logs
6. Keep file logging for local development

---

### 3. **CloudWatch Metrics** ⭐ MEDIUM PRIORITY

**Current State:**

- No metrics collection
- Only error logging

**Benefits:**

- ✅ Custom metrics (API response times, error rates)
- ✅ Business metrics (prompt executions, user activity)
- ✅ Cost tracking (AI API usage)
- ✅ Performance monitoring

**Cost:**

- First 10 custom metrics: **FREE**
- $0.30 per metric/month after 10
- **Estimated: $5-15/month** (depends on metrics)

**Migration Plan:**

```typescript
// src/lib/monitoring/cloudwatch-metrics.ts
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: 'us-east-1' });

export async function putMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Milliseconds' | 'Bytes' = 'Count'
): Promise<void> {
  await cloudwatch.send(
    new PutMetricDataCommand({
      Namespace: 'Engify',
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
        },
      ],
    })
  );
}

// Usage in API routes:
await putMetric('API.Requests', 1);
await putMetric('API.ResponseTime', responseTime, 'Milliseconds');
await putMetric('AI.TokensUsed', tokensUsed);
await putMetric('AI.Cost', costInDollars);
```

**Metrics to Track:**

- `API.Requests` (total requests)
- `API.ResponseTime` (p50, p95, p99)
- `API.ErrorRate` (error percentage)
- `AI.TokensUsed` (total tokens)
- `AI.Cost` (estimated cost)
- `Users.Active` (active users)
- `Prompts.Executed` (prompt executions)

**Implementation Steps:**

1. Install `@aws-sdk/client-cloudwatch`: `pnpm add @aws-sdk/client-cloudwatch`
2. Create `src/lib/monitoring/cloudwatch-metrics.ts`
3. Add metrics to critical API routes
4. Create CloudWatch dashboard
5. Set up alarms (high error rate, high latency)

---

### 4. **CloudWatch Alarms** ⭐ MEDIUM PRIORITY

**Benefits:**

- ✅ Alert on high error rates
- ✅ Alert on high latency
- ✅ Alert on cost thresholds
- ✅ Integration with SNS (email/SMS notifications)

**Cost:**

- **FREE** (first 10 alarms)
- $0.10 per alarm/month after 10
- **Estimated: $0-2/month**

**Alarms to Create:**

- High error rate (>5% errors)
- High latency (p99 > 5s)
- High cost (AI spend > $100/day)
- Lambda failures (>10 failures/minute)

---

## 📊 Cost Summary

| Service                 | Monthly Cost      | Priority           |
| ----------------------- | ----------------- | ------------------ |
| **AWS Secrets Manager** | ~$2-5             | ⭐ HIGH            |
| **CloudWatch Logs**     | ~$5-10            | ⭐ HIGH            |
| **CloudWatch Metrics**  | ~$5-15            | ⭐ MEDIUM          |
| **CloudWatch Alarms**   | ~$0-2             | ⭐ MEDIUM          |
| **Total**               | **~$12-32/month** | ✅ Very Affordable |

---

## 🚀 Implementation Order

### Phase 1: Secrets Manager (Week 1)

**Priority:** HIGH (Security)

- Migrate MongoDB URI
- Migrate API keys
- Keep `.env.local` for local dev

### Phase 2: CloudWatch Logs (Week 2)

**Priority:** HIGH (Observability)

- Migrate application logs
- Migrate audit logs
- Keep file logging for local dev

### Phase 3: CloudWatch Metrics (Week 3)

**Priority:** MEDIUM (Monitoring)

- Add API metrics
- Add business metrics
- Create dashboard

### Phase 4: CloudWatch Alarms (Week 4)

**Priority:** MEDIUM (Alerting)

- Set up error rate alarms
- Set up latency alarms
- Configure SNS notifications

---

## 🔐 IAM Permissions Needed

**For Secrets Manager:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:engify/*"
    }
  ]
}
```

**For CloudWatch Logs:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:*:log-group:/engify/*"
    }
  ]
}
```

**For CloudWatch Metrics:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["cloudwatch:PutMetricData"],
      "Resource": "*"
    }
  ]
}
```

---

## 📝 Next Steps

1. **Create AWS Secrets** (via AWS Console or CLI)
2. **Set up IAM roles** for Vercel/Lambda
3. **Implement Secrets Manager integration**
4. **Implement CloudWatch Logs integration**
5. **Add CloudWatch Metrics**
6. **Create CloudWatch Dashboard**
7. **Set up CloudWatch Alarms**

---

**Estimated Total Cost:** $12-32/month for enterprise-grade infrastructure ✅

**Benefits:**

- ✅ Better security (centralized secrets)
- ✅ Better observability (centralized logs)
- ✅ Better monitoring (metrics & alarms)
- ✅ Compliance-ready (log retention)
- ✅ Serverless-friendly (no file system)
