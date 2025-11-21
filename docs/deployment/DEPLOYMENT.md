# Deployment & Operations Guide

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling Guidelines](#scaling-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Engify AI is deployed on **Vercel** with **MongoDB Atlas** for database and **Upstash Redis** for caching. This guide covers deployment procedures, monitoring setup, and disaster recovery.

### Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[GitHub Repository]
        B[Vercel CI/CD]
        C[Vercel Edge Network]
        D[Next.js Application]
    end

    subgraph "Data Services"
        E[MongoDB Atlas]
        F[Upstash Redis]
    end

    subgraph "External Services"
        G[SendGrid Email]
        H[Twilio SMS]
        I[Sentry Monitoring]
        J[AI Providers]
    end

    A -->|Push to main| B
    B -->|Build & Deploy| D
    C -->|CDN| D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
```

### Deployment Targets

| Environment | Branch | Domain | Purpose |
|-------------|--------|--------|---------|
| Production | `main` | engify.ai | Live application |
| Staging | `staging` | staging.engify.ai | Pre-production testing |
| Preview | Feature branches | Generated URLs | PR previews |
| Local | N/A | localhost:3000 | Development |

---

## Environment Setup

### Prerequisites

**Required Software:**
- Node.js 18+
- pnpm 8+ (package manager)
- Git
- MongoDB Compass (optional, for local DB inspection)
- Redis CLI (optional, for cache inspection)

**Required Accounts:**
- GitHub account with repository access
- Vercel account
- MongoDB Atlas account
- Upstash account
- SendGrid account (for email)
- Twilio account (for SMS/MFA)
- Sentry account (for monitoring)
- AI provider accounts (OpenAI, Anthropic, Google, Groq)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see section below)
# Edit .env.local with your credentials

# 5. Verify installation
pnpm type-check
pnpm lint
```

---

## Local Development

### Running Development Server

```bash
# Start development server
pnpm dev

# Server will start at http://localhost:3000
```

### Development Workflow

```mermaid
graph LR
    A[Create Branch] --> B[Make Changes]
    B --> C[Run Tests]
    C --> D{Tests Pass?}
    D -->|No| B
    D -->|Yes| E[Run Lint]
    E --> F{Lint Pass?}
    F -->|No| B
    F -->|Yes| G[Commit]
    G --> H[Push Branch]
    H --> I[Create PR]
    I --> J[Code Review]
    J --> K[Merge to Main]
    K --> L[Auto Deploy]
```

### Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:test         # Dev server on port 3005 for testing

# Building
pnpm build            # Production build
pnpm start            # Start production server locally

# Code Quality
pnpm type-check       # TypeScript type checking
pnpm lint             # ESLint
pnpm format           # Prettier formatting
pnpm format:check     # Check formatting

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:e2e         # E2E tests
pnpm test:coverage    # Coverage report

# Database
pnpm seed             # Seed database
pnpm db:backup        # Backup MongoDB

# Scripts
pnpm scripts:list     # List all available scripts
```

### Hot Reload & Fast Refresh

Next.js provides:
- Fast Refresh for React components
- API route hot reload
- TypeScript compilation on save

**Tips:**
- Keep components small for faster refresh
- Use Server Components when possible
- Avoid large computations in component body

---

## Production Deployment

### Automatic Deployment (Vercel)

**Trigger:** Push to `main` branch

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant Vercel
    participant Edge as Vercel Edge
    participant Users

    Dev->>GH: git push origin main
    GH->>Vercel: Webhook: new commit
    Vercel->>Vercel: Build Application
    Note over Vercel: - Install dependencies<br/>- TypeScript compile<br/>- Next.js build<br/>- Run tests
    Vercel->>Vercel: Deploy to Edge
    Vercel->>Edge: Update edge functions
    Edge->>Users: Serve new version
    Vercel->>GH: Update deployment status
```

### Deployment Process

1. **Pre-deployment Checks**
   ```bash
   # Run locally before pushing
   pnpm type-check
   pnpm lint
   pnpm test:run
   pnpm build
   ```

2. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```

3. **Vercel Build Process**
   - Installs dependencies
   - Runs TypeScript compilation
   - Executes Next.js build
   - Generates static pages
   - Deploys to edge network

4. **Post-deployment Verification**
   - Check Vercel deployment logs
   - Verify site is accessible
   - Test critical user flows
   - Monitor error rates in Sentry

### Manual Deployment via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Rollback Procedure

```bash
# Via Vercel Dashboard:
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "..." menu
# 4. Select "Promote to Production"

# Via CLI:
vercel rollback
```

### Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API keys validated
- [ ] Performance budget met
- [ ] Security headers configured
- [ ] Monitoring enabled
- [ ] Backup completed
- [ ] Team notified

---

## Environment Variables

### Critical Variables

```bash
# Core Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-nextauth-secret-here-min-32-chars
NEXTAUTH_URL=https://engify.ai
NODE_ENV=production

# Public Variables (exposed to browser)
NEXT_PUBLIC_APP_URL=https://engify.ai
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ALLOW_SIGNUP=true
```

### AI Provider Keys

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_API_KEY=AI...

# Groq
GROQ_API_KEY=gsk_...

# Replicate
REPLICATE_API_TOKEN=r8_...
```

### Email & SMS

```bash
# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=donlaur@engify.ai
SENDGRID_FROM_NAME=Engify.ai

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_VERIFY_SERVICE_SID=VA...
```

### Caching & Storage

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# QStash (Job Queue)
QSTASH_URL=https://qstash.upstash.io/v2
QSTASH_TOKEN=...
```

### Security & Encryption

```bash
# API Key Encryption
API_KEY_ENCRYPTION_KEY=your-32-byte-hex-key

# Cron Jobs
CRON_SECRET=your-cron-secret-generate-with-openssl

# Admin Settings
ADMIN_SESSION_MAX_AGE_MINUTES=60
ADMIN_MFA_REQUIRED=true
```

### Monitoring

```bash
# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

### Variable Management

**Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add variables for each environment
3. Select scope (Production, Preview, Development)
4. Save and redeploy

**Security Best Practices:**
- Never commit `.env.local` to git
- Use Vercel's encrypted storage
- Rotate secrets regularly
- Use different keys per environment
- Limit access to production variables

---

## Database Setup

### MongoDB Atlas Configuration

**1. Create Cluster**
```
1. Sign up at mongodb.com/cloud/atlas
2. Create new cluster (M10+ for production)
3. Select region (us-east-1 for Vercel compatibility)
4. Configure network access (allow Vercel IPs)
5. Create database user
```

**2. Connection String**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify?retryWrites=true&w=majority
```

**3. Indexes Setup**

```bash
# Run index creation script
pnpm db:create-indexes

# Or manually via MongoDB Compass/Shell
```

**Required Indexes:**
```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ organizationId: 1 })
db.users.createIndex({ role: 1 })

// prompts collection
db.prompts.createIndex({ category: 1, role: 1 })
db.prompts.createIndex({ featured: 1, createdAt: -1 })
db.prompts.createIndex({ title: "text", description: "text" })

// api_keys collection
db.api_keys.createIndex({ userId: 1 })
db.api_keys.createIndex({ keyHash: 1 }, { unique: true })
db.api_keys.createIndex({ expiresAt: 1 })

// audit_logs collection
db.audit_logs.createIndex({ userId: 1, createdAt: -1 })
db.audit_logs.createIndex({ action: 1, createdAt: -1 })
```

**4. Database Seeding**

```bash
# Seed initial data
pnpm seed

# Seed prompts
pnpm seed:prompts

# Create super admin
pnpm admin:setup
```

### Redis Setup (Upstash)

**1. Create Database**
```
1. Sign up at upstash.com
2. Create Redis database
3. Select region (same as Vercel)
4. Enable TLS
5. Copy REST API credentials
```

**2. Configure Environment**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**3. Test Connection**
```bash
pnpm redis:test
```

---

## Monitoring & Alerting

### Sentry Setup

**1. Configure Sentry**
```bash
# Install Sentry
# Already included in dependencies

# Configure in next.config.js
# See sentry.server.config.ts
```

**2. Error Tracking**

Automatic tracking for:
- Unhandled exceptions
- API errors
- Database errors
- AI provider errors
- Authentication failures

**3. Performance Monitoring**

Tracked metrics:
- API response times
- Database query duration
- Cache hit rates
- Page load times
- Core Web Vitals

**4. Alerts Configuration**

Set up alerts for:
- Error rate > 1%
- Response time > 2s
- Database errors
- AI provider failures
- Authentication issues

### Vercel Analytics

**Built-in Metrics:**
- Page views
- Unique visitors
- Geographic distribution
- Device types
- Performance scores

**Custom Events:**
```typescript
import { track } from '@vercel/analytics';

track('prompt_executed', {
  provider: 'openai',
  model: 'gpt-4o-mini'
});
```

### Application Logging

**Winston Logger:**
```typescript
import { loggingProvider } from '@/lib/providers/LoggingProvider';

// Info logging
loggingProvider.info('User action', { action: 'login', userId: '123' });

// Error logging
loggingProvider.error('Failed to process', error, { userId: '123' });

// API logging
loggingProvider.apiError('/api/users', error, { statusCode: 500 });

// Audit logging
await loggingProvider.audit('user_created', {
  userId: '123',
  severity: 'info',
  details: { email: 'user@example.com' },
});
```

**Log Levels:**
- `error`: Critical errors requiring immediate attention
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Detailed debugging information

### Health Checks

**Endpoint:** `/api/health`

```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "sendgrid": "operational",
    "ai_providers": "operational"
  },
  "version": "1.0.0"
}
```

**Monitoring:**
```bash
# Manual health check
curl https://engify.ai/api/health

# Automated (Vercel Cron)
# Configured in vercel.json
```

---

## Backup & Recovery

### Database Backup

**Automated Backups (MongoDB Atlas):**
- Point-in-time recovery (last 7 days)
- Snapshot frequency: Every 6 hours
- Retention: 30 days
- Geographic redundancy: Enabled

**Manual Backup:**
```bash
# Export entire database
pnpm db:backup

# Export specific collection
mongodump --uri="mongodb+srv://..." --collection=users --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://..." --dir=./backup
```

**Backup Strategy:**
```mermaid
graph TB
    A[Production DB] -->|Every 6h| B[Atlas Snapshots]
    A -->|Daily| C[Export to S3]
    A -->|Weekly| D[Full Backup]
    B -->|7 days| E[Rolling Window]
    C -->|30 days| F[Archive]
    D -->|90 days| G[Long-term Storage]
```

### Critical Data Export

```bash
# Export users
mongoexport --uri="..." --collection=users --out=users.json

# Export prompts
mongoexport --uri="..." --collection=prompts --out=prompts.json

# Export API keys (encrypted)
mongoexport --uri="..." --collection=api_keys --out=api_keys.json
```

### Disaster Recovery Procedure

**Recovery Time Objective (RTO):** 1 hour
**Recovery Point Objective (RPO):** 6 hours

**Steps:**

1. **Assess Situation**
   - Identify failure type
   - Determine data loss scope
   - Notify stakeholders

2. **Database Recovery**
   ```bash
   # Restore from latest snapshot
   # Via MongoDB Atlas UI:
   # 1. Go to Backups
   # 2. Select snapshot
   # 3. Click "Restore"
   # 4. Choose restore method
   ```

3. **Application Recovery**
   ```bash
   # Rollback to last working deployment
   vercel rollback

   # Or redeploy specific commit
   vercel --prod --force
   ```

4. **Verify Recovery**
   - Check application health
   - Test critical flows
   - Verify data integrity
   - Monitor error rates

5. **Post-Incident**
   - Document incident
   - Update runbooks
   - Implement preventive measures

### Backup Verification

```bash
# Test restore procedure monthly
# 1. Create test cluster
# 2. Restore latest backup
# 3. Verify data integrity
# 4. Test application connectivity
# 5. Document results
```

---

## Scaling Guidelines

### Horizontal Scaling

**Vercel Auto-scaling:**
- Automatic based on traffic
- No configuration required
- Serverless functions scale to zero
- Edge network handles global distribution

**Database Scaling (MongoDB Atlas):**

```mermaid
graph LR
    A[M10 Cluster] -->|Traffic Increase| B[M20 Cluster]
    B -->|High Load| C[M30 Cluster]
    C -->|Enterprise| D[M40+ Cluster]

    A2[Single Region] -->|Global Users| B2[Multi-Region]
    B2 -->|HA Required| C2[Replica Set]
```

**Scaling Triggers:**
- CPU > 70% sustained
- Memory > 80% sustained
- Connection pool saturation
- Query response time > 100ms

### Vertical Scaling

**MongoDB Cluster Tiers:**

| Tier | RAM | Storage | Connections | Use Case |
|------|-----|---------|-------------|----------|
| M10 | 2 GB | 10 GB | 1,500 | Development |
| M20 | 4 GB | 20 GB | 3,000 | Small Production |
| M30 | 8 GB | 40 GB | 6,000 | Medium Production |
| M40 | 16 GB | 80 GB | 12,000 | Large Production |

### Performance Optimization

**Caching Strategy:**
```typescript
// L1: Memory cache (in-process)
// L2: Redis/Upstash (distributed)
// L3: Database (MongoDB)

// Example: Prompt fetching
export const GET = withAPI({
  auth: true,
  cache: { ttl: 300 } // 5 minutes
}, async ({ userId }) => {
  // Automatically cached
  return await promptService.getFeatured();
});
```

**Database Query Optimization:**
- Use indexes for all queries
- Implement pagination
- Use projection (field selection)
- Avoid N+1 queries
- Use aggregation pipelines

**CDN Optimization:**
- Static assets via Vercel Edge
- Image optimization enabled
- Compression enabled
- Browser caching configured

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run scripts/load-test.js

# Target metrics:
# - Response time p95 < 500ms
# - Error rate < 0.1%
# - Throughput > 1000 req/s
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**

```
Error: MongoServerError: connection timeout
```

**Solution:**
```bash
# Check MongoDB Atlas network access
# Add Vercel IP addresses to allowlist
# Verify connection string format
# Test connection locally

# Connection string format:
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**2. Build Failures**

```
Error: Module not found
```

**Solution:**
```bash
# Clear cache
pnpm store prune
rm -rf .next node_modules
pnpm install

# Verify dependencies
pnpm type-check

# Check for circular dependencies
```

**3. API Rate Limiting**

```
Error: Rate limit exceeded
```

**Solution:**
```typescript
// Adjust rate limit in middleware
export const POST = withAPI({
  rateLimit: { max: 20, window: 60 } // 20 per minute
}, handler);

// Or use different preset
export const POST = withAPI({
  rateLimit: 'user-create' // 5 per 5 minutes
}, handler);
```

**4. Redis Connection Issues**

```
Error: ECONNREFUSED Redis connection failed
```

**Solution:**
```bash
# Verify Upstash credentials
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Test connection
pnpm redis:health

# Fallback: Disable Redis caching
# Set REDIS_ENABLED=false
```

**5. AI Provider Errors**

```
Error: OpenAI API key invalid
```

**Solution:**
```bash
# Verify API keys
pnpm security:test-keys

# Check key format
# OpenAI: sk-...
# Anthropic: sk-ant-...
# Google: AI...

# Test individual provider
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm dev

# Check logs in Vercel
vercel logs --follow

# Local debugging
DEBUG=* pnpm dev
```

### Performance Debugging

```bash
# Next.js build analysis
pnpm build --analyze

# Database slow queries
# Via MongoDB Atlas UI:
# 1. Go to Performance Advisor
# 2. Review slow queries
# 3. Create recommended indexes

# Lighthouse CI
pnpm lighthouse https://engify.ai
```

---

## Deployment Runbook

### Pre-Deployment

```bash
# 1. Run all checks
pnpm type-check && pnpm lint && pnpm test:run && pnpm build

# 2. Review changes
git log --oneline origin/main..HEAD

# 3. Update version (if needed)
npm version patch

# 4. Create backup
pnpm db:backup
```

### Deployment

```bash
# 5. Merge to main
git checkout main
git merge feature-branch
git push origin main

# 6. Monitor deployment
# Watch Vercel dashboard
# Check build logs
```

### Post-Deployment

```bash
# 7. Smoke tests
curl https://engify.ai/api/health
curl https://engify.ai

# 8. Verify critical flows
# - User login
# - Prompt execution
# - API key creation

# 9. Monitor errors
# Check Sentry dashboard
# Review API logs

# 10. Update documentation
# Update CHANGELOG.md
# Notify team
```

### Rollback Plan

```bash
# If issues detected:
vercel rollback

# Or deploy specific version:
git checkout <working-commit>
vercel --prod --force
```

---

## Support & Contacts

### Escalation Path

1. **Level 1**: Check documentation, logs, Sentry
2. **Level 2**: Review GitHub issues, discussions
3. **Level 3**: Contact engineering team
4. **Level 4**: Engage vendor support

### Service Status Pages

- **Vercel**: status.vercel.com
- **MongoDB Atlas**: status.mongodb.com
- **Upstash**: upstash.com/status
- **SendGrid**: status.sendgrid.com
- **OpenAI**: status.openai.com

### Emergency Contacts

- **Engineering**: donlaur@engify.ai
- **DevOps**: [Contact via Vercel]
- **Database**: MongoDB Atlas Support
- **Monitoring**: Sentry Support

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**Next Review**: 2025-02-17
