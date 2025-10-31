# Day 5 Quick Reference Guide

**Branch**: `day5-infra-messaging-workbenches`  
**Status**: ✅ Complete - All phases finished, tested, and deployed  
**Build**: Vercel deployment check running

---

## 🎯 What Was Built

### Infrastructure & Messaging
- ✅ Twilio MFA with rate limiting (3 sends/min, 6 verifies/min)
- ✅ SendGrid transactional email with ECDSA verification
- ✅ Webhook replay protection (Twilio + SendGrid)
- ✅ Health tracking for messaging services

### Workbenches & AI
- ✅ Tool contracts with per-execution budget limits
- ✅ Replay detection for duplicate executions (409 response)
- ✅ Cost/token enforcement (403 on budget breach)
- ✅ CreatorAgent for automated content generation

### Observability
- ✅ RED metrics (Rate/Errors/Duration) tracking
- ✅ p50/p95/p99 latency percentiles per route
- ✅ Provider cost tracking and aggregation
- ✅ Enhanced `/api/health` with metrics

### Security & Compliance
- ✅ PII redaction (emails, phones, SSNs, cards, API keys)
- ✅ Key rotation utilities with audit trail
- ✅ CI gates (route guards, secret scanning, flaky tests)
- ✅ Bundle size budgets

---

## 📚 Key Files to Know

### New Infrastructure
```
src/lib/observability/metrics.ts         - RED metrics tracking
src/lib/workbench/contracts.ts           - Tool budget definitions
src/lib/security/piiRedaction.ts         - PII masking utilities
src/lib/security/keyRotation.ts          - API key rotation
src/lib/services/workbenchRuns.ts        - Execution tracking
src/lib/services/sendgridHealth.ts       - Email health status
src/lib/services/twilioWebhookState.ts   - SMS replay protection
```

### API Endpoints
```
GET  /api/health                         - Service health + RED metrics
GET  /api/observability/metrics          - Full metrics dashboard (admin)
GET  /api/admin/settings                 - SendGrid/Twilio status
POST /api/agents/creator                 - Trigger content creation
POST /api/v2/ai/execute                  - Workbench execution with contracts
```

### Configuration
```
.env.example                             - All new environment variables
docs/planning/DAY_5_PLAN.md              - Detailed phase breakdown
docs/planning/DAY_5_COMPLETION_SUMMARY.md - What was accomplished
```

---

## 🚀 Quick Start

### Running Tests
```bash
# All unit tests (620 tests)
pnpm test:unit

# Security tests only
pnpm test:security

# Policy gates
pnpm policy:routes

# Flaky test detection (runs suite 5x)
FLAKY_TEST_RUNS=5 pnpm ci:flaky
```

### Checking Health
```bash
# Local health check
curl http://localhost:3000/api/health

# Metrics dashboard (requires super_admin auth)
curl http://localhost:3000/api/observability/metrics

# Admin settings (messaging status)
curl http://localhost:3000/api/admin/settings
```

### Viewing Metrics
```bash
# Get RED summary
curl http://localhost:3000/api/observability/metrics

# Filter by route
curl http://localhost:3000/api/observability/metrics?route=/api/v2/ai/execute

# Filter by provider
curl http://localhost:3000/api/observability/metrics?provider=openai
```

---

## 🔧 Environment Variables (New)

Add to your `.env.local`:

```bash
# Content Creation Agent
CONTENT_CREATION_ALLOWED_MODELS=openai-gpt4-turbo,openai,gemini-flash,claude-sonnet
CONTENT_CREATION_BUDGET_LIMIT=0.5
CONTENT_CREATION_MIN_WORDS=120

# SendGrid (already existed, now required for webhook verify)
SENDGRID_WEBHOOK_PUBLIC_KEY=your-sendgrid-webhook-public-key-here
```

---

## 📋 Common Tasks

### Rotate an API Key
```typescript
import { rotateApiKey } from '@/lib/security/keyRotation';

const result = await rotateApiKey(userId, oldKeyId);
// Creates new key, revokes old, returns both IDs
```

### Redact PII from Logs
```typescript
import { sanitizeForLog } from '@/lib/security/piiRedaction';

const safeData = sanitizeForLog({
  email: 'user@example.com',  // → us***@example.com
  phone: '+1-555-123-4567',   // → [REDACTED]
  apiKey: 'sk-abc123...',     // → [REDACTED]
});
```

### Check Workbench Budget
```typescript
import { getWorkbenchToolContract } from '@/lib/workbench/contracts';

const contract = getWorkbenchToolContract('prompt-optimizer');
console.log(`Max cost: $${contract.maxCostCents / 100}`);
console.log(`Max tokens: ${contract.maxTotalTokens}`);
```

### View RED Metrics
```typescript
import { getREDSummary } from '@/lib/observability/metrics';

const summary = getREDSummary();
summary.routes.forEach(route => {
  console.log(`${route.route}: ${route.p95}ms p95, ${route.errorRate * 100}% errors`);
});
```

---

## 🔍 Troubleshooting

### Tests Failing?
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Run specific test file
pnpm vitest run src/path/to/test.test.ts
```

### Build Failing on Vercel?
```bash
# Check local build
pnpm build

# Common issues:
# 1. Missing environment variables → Add to Vercel dashboard
# 2. Type errors → Run pnpm typecheck locally
# 3. Import errors → Check package.json dependencies
```

### Rate Limiting Issues?
```bash
# In-memory state is per-instance
# If you see false positives:
# 1. Check if multiple instances running
# 2. Consider Redis migration (see ADR 004)
```

### Metrics Not Showing?
```bash
# Metrics are in-memory, reset on restart
# Generate some traffic first:
curl -X POST http://localhost:3000/api/v2/ai/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","provider":"openai"}'

# Then check metrics
curl http://localhost:3000/api/health
```

---

## 📖 Documentation Index

### Architecture Decision Records (ADRs)
- [ADR 003: Workbench Budget Enforcement](../development/ADR/003-workbench-budget-enforcement.md)
- [ADR 004: In-Memory vs Redis State](../development/ADR/004-in-memory-vs-redis-state.md)
- [ADR 005: RED Metrics Observability](../development/ADR/005-red-metrics-observability.md)
- [ADR 006: PII Redaction Strategy](../development/ADR/006-pii-redaction-strategy.md)

### Operational Runbooks
- [Twilio Incident Playbook](../operations/TWILIO_INCIDENT_PLAYBOOK.md)
- [SendGrid Incident Playbook](../operations/SENDGRID_INCIDENT_PLAYBOOK.md)
- [RAG Service Runbook](../operations/RAG_SERVICE_RUNBOOK.md)

### Feature Documentation
- [Twilio MFA Production](../messaging/TWILIO_MFA_PROD.md)
- [SendGrid Transactional Email](../messaging/SENDGRID_TRANSACTIONAL_EMAIL.md)
- [Agent Content Creator](../content/AGENT_CONTENT_CREATOR.md)

### Planning
- [Day 5 Plan](./DAY_5_PLAN.md) - Detailed phase breakdown with red-hat reviews
- [Day 5 Completion Summary](./DAY_5_COMPLETION_SUMMARY.md) - Full accomplishments

---

## 🎯 Next Steps

### Before Merging to Main
- [x] All tests passing ✅
- [x] Vercel build check passing (in progress)
- [ ] Code review approved
- [ ] QA testing complete

### Post-Merge
1. **Monitor**: Watch RED metrics for anomalies
2. **Alert Setup**: Configure observability alerts
3. **User Communication**: Announce new features
4. **Redis Migration**: Plan for when scaling >1 instance

### Future Iterations
- Circuit breaker pattern for provider failures
- Automated content ingestion scheduler
- Artifact persistence for workbench tools
- Envelope encryption with key rotation
- Provider-specific cost dashboards in OpsHub

---

## 💡 Tips

**For Developers:**
- Use `sanitizeForLog()` for all external data before logging
- Check tool contracts before adding new workbench tools
- Follow commit discipline: atomic, tested, documented

**For DevOps:**
- Review incident playbooks for on-call scenarios
- Set up monitoring alerts for RED metric thresholds
- Plan Redis migration before horizontal scaling

**For Security:**
- Audit PII redaction coverage regularly
- Review key rotation procedures
- Validate RBAC on any new admin routes

---

## 📞 Support

- **Documentation**: `docs/` directory
- **Issues**: GitHub Issues
- **Runbooks**: `docs/operations/`
- **ADRs**: `docs/development/ADR/`

