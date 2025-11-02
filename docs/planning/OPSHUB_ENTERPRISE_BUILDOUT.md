# Phase 2: OpsHub Enterprise Build-Out - Day 7

**Parent Document:** [Day 7 QA & Frontend Improvements Plan](../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)  
**Previous Phase:** [Phase 1: QA Audit](../testing/QA_AUDIT_REPORT_DAY7.md)  
**Phase:** 2 of 7  
**Status:** ⚠️ Not Started  
**Priority:** Critical

---

## Overview

Build complete, enterprise-grade admin dashboard (OpsHub) with multi-tenancy, AWS Secrets Manager integration, database-driven configuration, and comprehensive admin features.

## Why This Matters

### Current Problems

1. **Single-tenant:** Can't support multiple organizations
2. **Hardcoded config:** AI models, roles, tags in ~20 TypeScript files (not DRY)
3. **Insecure secrets:** API keys in env vars or MongoDB (not enterprise-grade)
4. **Incomplete admin:** Many planned features missing
5. **Code deploys for config:** Can't change roles/tags without code deploy

### Enterprise Requirements

- **Multi-tenancy:** Isolate org A data from org B
- **Secrets management:** AWS Secrets Manager for API keys
- **Database-driven config:** Change models/roles via UI, not code
- **Comprehensive admin:** Full CRUD for all resources
- **Audit everything:** Track all admin actions for compliance

---

## Sub-Phase 2.1: Multi-Tenancy & Organization Management

### Current State

- No `Organization` model
- No `organizationId` in collections
- All users see all data (single-tenant)

### Target State

- `Organization` collection in MongoDB
- Every collection has `organizationId` field
- All queries filtered by `organizationId` automatically
- Org selector in OpsHub header

### Technical Implementation

#### 1. Create Organization Schema

```typescript
// src/lib/db/schemas/organization.ts
import { z } from 'zod';

export const OrganizationSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/), // engify, acme-corp
  plan: z.enum(['free', 'pro', 'enterprise']),
  settings: z.object({
    branding: z.object({
      logo: z.string().url().optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      customDomain: z.string().url().optional(),
    }),
    features: z.record(z.string(), z.boolean()), // feature flags
    limits: z.object({
      maxUsers: z.number().int().positive(),
      maxPrompts: z.number().int().positive(),
      maxApiCallsPerMonth: z.number().int().positive(),
    }),
  }),
  billingEmail: z.string().email(),
  status: z.enum(['active', 'suspended', 'trial']),
  trialEndsAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
```

#### 2. Add organizationId to All Collections

Collections to update:

- `users` - Add `organizationId` (required)
- `prompts` - Add `organizationId` (required)
- `patterns` - Add `organizationId` (required)
- `web_content` - Add `organizationId` (required)
- `audit_logs` - Add `organizationId` (required)
- `api_keys` - Add `organizationId` (required, for later)

#### 3. Update All Queries

```typescript
// Before (single-tenant)
const prompts = await db.collection('prompts').find({ active: true });

// After (multi-tenant)
const prompts = await db.collection('prompts').find({
  organizationId,
  active: true,
});
```

**Critical:** Use helper functions to auto-inject `organizationId`:

```typescript
// src/lib/db/helpers/multi-tenant.ts
export function getOrgId(session: Session): string {
  return session.user.organizationId;
}

export function orgQuery(orgId: string, query: object) {
  return { organizationId: orgId, ...query };
}
```

#### 4. Organization Selector UI

```typescript
// src/components/admin/OrgSelector.tsx
'use client';

export function OrgSelector() {
  const { user } = useSession();
  const [selectedOrg, setSelectedOrg] = useState(user.organizationId);

  // Super admins can switch orgs, regular users see their org only
  const isSuperAdmin = user.role === 'super_admin';

  return (
    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
      {/* List orgs */}
    </Select>
  );
}
```

### Testing Multi-Tenancy

1. Create 2 organizations: `engify` and `test-org`
2. Create users in each org
3. Create prompts in each org
4. Login as `engify` user → should only see `engify` prompts
5. Login as `test-org` user → should only see `test-org` prompts
6. Verify no cross-org data leakage

---

## Sub-Phase 2.2: AWS Secrets Manager Integration

### Why AWS Secrets Manager?

- **Enterprise standard:** Used by Fortune 500 companies
- **Automatic rotation:** Can rotate keys without downtime
- **Audit trail:** Every secret access logged in CloudTrail
- **IAM integration:** Role-based access control
- **Encryption:** Encrypted at rest and in transit

### Cost

- $0.40 per secret per month
- $0.05 per 10,000 API calls
- Example: 10 secrets + 100K calls/month = $4.50/month

### Implementation Steps

#### 1. Set Up AWS Secrets Manager

```bash
# Create secret for each organization
aws secretsmanager create-secret \
  --name "engify/openai-key" \
  --secret-string '{"apiKey":"sk-..."}' \
  --description "OpenAI API key for Engify organization"

aws secretsmanager create-secret \
  --name "engify/anthropic-key" \
  --secret-string '{"apiKey":"sk-ant-..."}' \
  --description "Anthropic API key for Engify organization"
```

#### 2. Create SecretsService

```typescript
// src/lib/aws/secrets-service.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export class SecretsService {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: string; expiresAt: number }>;

  constructor() {
    this.client = new SecretsManagerClient({ region: process.env.AWS_REGION });
    this.cache = new Map();
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first (5 min TTL)
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // Fetch from AWS
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);

    const secretValue = response.SecretString!;

    // Cache for 5 minutes
    this.cache.set(secretName, {
      value: secretValue,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Audit log
    await auditLog({
      action: 'secret.accessed',
      userId: 'system',
      details: { secretName },
    });

    return secretValue;
  }

  async getOrgApiKey(
    orgId: string,
    provider: 'openai' | 'anthropic' | 'google'
  ): Promise<string> {
    const secretName = `${orgId}/${provider}-key`;
    const secret = await this.getSecret(secretName);
    const parsed = JSON.parse(secret);
    return parsed.apiKey;
  }
}

export const secretsService = new SecretsService();
```

#### 3. Update AI Provider Factory

```typescript
// src/lib/ai/v2/factory/AIProviderFactory.ts
import { secretsService } from '@/lib/aws/secrets-service';

export class AIProviderFactory {
  static async create(
    provider: 'openai' | 'anthropic' | 'google',
    orgId: string
  ) {
    // Get API key from AWS Secrets Manager (not env vars)
    const apiKey = await secretsService.getOrgApiKey(orgId, provider);

    switch (provider) {
      case 'openai':
        return new OpenAIProvider({ apiKey });
      case 'anthropic':
        return new AnthropicProvider({ apiKey });
      case 'google':
        return new GoogleAIProvider({ apiKey });
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
```

#### 4. OpsHub Secrets Management UI

```typescript
// src/components/admin/SecretsManagementPanel.tsx
'use client';

export function SecretsManagementPanel() {
  const [secrets, setSecrets] = useState([]);

  return (
    <div>
      <h2>API Keys & Secrets</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secrets.map(secret => (
            <TableRow key={secret.id}>
              <TableCell>{secret.provider}</TableCell>
              <TableCell>
                {secret.masked ? '***************' : secret.value}
              </TableCell>
              <TableCell>
                <Badge variant={secret.valid ? 'success' : 'destructive'}>
                  {secret.valid ? 'Valid' : 'Invalid'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" onClick={() => rotateKey(secret.id)}>
                  Rotate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Security Requirements

- [ ] Secrets never logged or displayed in plaintext
- [ ] Only `super_admin` can view/edit secrets
- [ ] All secret access is audit logged
- [ ] Secrets are encrypted at rest (AWS handles this)
- [ ] IAM roles follow least-privilege principle
- [ ] Secret rotation policy configured (90 days)

---

## Sub-Phase 2.3: AI Model Management (Database-Driven)

### Problem

AI models currently hardcoded in `src/lib/config/ai-models.ts`. To add a new model, need code deploy. Violates DRY (model lists duplicated in multiple files).

### Solution

Store AI models in MongoDB, manage via OpsHub UI.

### Implementation

[Continue with detailed implementation for models, taxonomy, CMS, etc...]

---

**Last Updated:** November 2, 2025  
**Next Phase:** [Phase 3: Mock Data Audit & Removal](../testing/MOCK_DATA_AUDIT_DAY7.md)
