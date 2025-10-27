# Security Standards & Best Practices

**Purpose**: Define mandatory security standards for all code in this project.

**Status**: 🔴 MANDATORY - All code MUST comply  
**Last Updated**: 2025-10-27  
**Review**: Quarterly

---

## 🛡️ MANDATORY SECURITY STANDARDS

### 1. Input Sanitization (XSS Prevention)

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED  
**Red Hat Review**: Critical Fix Implemented

#### Standard
**ALL user-generated content MUST be sanitized before:**
- Storing in database
- Displaying to users
- Passing to external APIs
- Including in logs

#### Implementation

**Use the sanitization utilities:**
```typescript
import { sanitizeText, sanitizePrompt, sanitizeRichContent } from '@/lib/security/sanitizer';

// For plain text (usernames, titles, search)
const username = sanitizeText(userInput);

// For prompts (allows basic formatting)
const prompt = sanitizePrompt(userInput);

// For rich content (markdown, descriptions)
const description = sanitizeRichContent(userInput);
```

**Use the tRPC middleware:**
```typescript
import { sanitizedProcedure } from '@/server/middleware/sanitization';

// All user-facing procedures MUST use sanitizedProcedure
export const createPrompt = sanitizedProcedure
  .input(z.object({ title: z.string(), content: z.string() }))
  .mutation(async ({ input }) => {
    // Input is automatically sanitized
    return await promptService.create(input);
  });
```

#### Testing Requirements
- ✅ Test with `<script>` tags
- ✅ Test with inline event handlers (`onclick`, `onerror`)
- ✅ Test with `javascript:` URLs
- ✅ Test with `data:` URLs
- ✅ Test with HTML entities
- ✅ Test with nested objects

#### Violations
**NEVER do this:**
```typescript
// ❌ WRONG - No sanitization
const title = req.body.title;
await db.insert({ title });

// ❌ WRONG - Using dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**ALWAYS do this:**
```typescript
// ✅ CORRECT - Sanitize before storing
const title = sanitizeText(req.body.title);
await db.insert({ title });

// ✅ CORRECT - Sanitize before rendering
<div dangerouslySetInnerHTML={{ __html: sanitizeRichContent(userContent) }} />
```

---

### 2. Rate Limiting

**Status**: 🟠 HIGH - Required for all API endpoints  
**Implementation**: Phase 5

#### Standard
**ALL API endpoints MUST have rate limiting:**
- Authentication endpoints: 5 attempts/15 minutes
- AI execution: Based on user tier
- Public endpoints: 1,000/hour
- Anonymous users: 100/hour

#### Implementation
```typescript
import { rateLimitedProcedure } from '@/server/middleware/rateLimit';

export const executePrompt = rateLimitedProcedure
  .input(z.object({ prompt: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Rate limiting enforced automatically
  });
```

---

### 3. Authentication & Authorization

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED

#### Standard
**ALL protected routes MUST:**
- Verify user authentication
- Check user permissions
- Validate session token
- Log access attempts

#### Implementation
```typescript
import { protectedProcedure } from '@/server/trpc';

export const getSecretData = protectedProcedure
  .query(async ({ ctx }) => {
    // ctx.session.user is guaranteed to exist
    return await getData(ctx.session.user.id);
  });
```

---

### 4. Data Validation

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED

#### Standard
**ALL inputs MUST be validated with Zod:**
- Type validation
- Format validation
- Range validation
- Custom validation rules

#### Implementation
```typescript
import { z } from 'zod';

const createPromptSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(10000),
  tags: z.array(z.string()).max(10),
  isPublic: z.boolean(),
});

export const createPrompt = sanitizedProcedure
  .input(createPromptSchema)
  .mutation(async ({ input }) => {
    // Input is validated AND sanitized
  });
```

---

### 5. Audit Logging

**Status**: 🟠 HIGH - Required for Phase 5  
**Implementation**: Phase 5

#### Standard
**MUST log:**
- Authentication events (login, logout, failed attempts)
- Data modifications (create, update, delete)
- Permission changes
- Security events (rate limit hits, XSS attempts)
- Admin actions

#### Implementation
```typescript
import { auditLog } from '@/lib/audit';

await auditLog.log({
  userId: ctx.session.user.id,
  action: 'prompt.create',
  resource: 'prompt',
  resourceId: prompt.id,
  metadata: { title: prompt.title },
});
```

---

### 6. Error Handling

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED

#### Standard
**NEVER expose:**
- Stack traces to users
- Database errors
- Internal paths
- API keys or secrets
- User data from other users

#### Implementation
```typescript
try {
  await dangerousOperation();
} catch (error) {
  // ❌ WRONG - Exposes internal details
  throw new Error(error.message);
  
  // ✅ CORRECT - Generic user-facing message
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An error occurred. Please try again.',
  });
  
  // ✅ CORRECT - Log full error for debugging
  console.error('Operation failed:', error);
}
```

---

### 7. Environment Variables

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED

#### Standard
**ALL environment variables MUST:**
- Be validated at startup (using `src/lib/env.ts`)
- Never be committed to git
- Use strong secrets (min 32 characters)
- Be different per environment

#### Implementation
```typescript
// ✅ CORRECT - Import validated env
import { env } from '@/lib/env';

const apiKey = env.OPENAI_API_KEY;

// ❌ WRONG - Direct access
const apiKey = process.env.OPENAI_API_KEY;
```

---

### 8. Database Security

**Status**: 🔴 CRITICAL - ALWAYS REQUIRED

#### Standard
**MUST:**
- Use parameterized queries (MongoDB does this automatically)
- Validate ObjectIds
- Implement row-level security (check organizationId)
- Never trust client-provided IDs

#### Implementation
```typescript
// ✅ CORRECT - Validate and check ownership
const prompt = await promptService.findById(id);
if (!prompt || prompt.userId !== ctx.session.user.id) {
  throw new TRPCError({ code: 'NOT_FOUND' });
}

// ❌ WRONG - No ownership check
const prompt = await promptService.findById(id);
```

---

### 9. HTTPS & Transport Security

**Status**: 🟠 HIGH - Required for Phase 9

#### Standard
**MUST:**
- Enforce HTTPS in production
- Use secure cookie flags
- Implement HSTS headers
- Validate SSL certificates

#### Implementation
```typescript
// next.config.js
headers: [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
],
```

---

### 10. Dependency Security

**Status**: 🟢 ACTIVE - Automated

#### Standard
**MUST:**
- Scan dependencies weekly (Dependabot)
- Update critical vulnerabilities within 24 hours
- Update high vulnerabilities within 7 days
- Review all dependency changes

#### Implementation
- ✅ Dependabot configured
- ✅ CVE scanning daily
- ✅ CodeQL analysis on every commit

---

## 🔍 Security Review Checklist

### Before Every PR
- [ ] All user inputs sanitized
- [ ] All inputs validated with Zod
- [ ] Authentication checked on protected routes
- [ ] No secrets in code
- [ ] Error messages don't expose internals
- [ ] Tests include security test cases

### Before Every Release
- [ ] Security scan passed (no critical/high vulnerabilities)
- [ ] All dependencies up to date
- [ ] Audit logs working
- [ ] Rate limiting active
- [ ] HTTPS enforced (production)

---

## 🚨 Incident Response

### If XSS Vulnerability Found
1. **Immediate**: Deploy fix within 4 hours
2. **Notify**: Security team and affected users
3. **Audit**: Check logs for exploitation
4. **Document**: Post-mortem and prevention

### If Data Breach Suspected
1. **Immediate**: Isolate affected systems
2. **Investigate**: Determine scope and impact
3. **Notify**: Legal, security team, affected users
4. **Remediate**: Fix vulnerability, reset credentials
5. **Document**: Full incident report

---

## 📚 Security Resources

### Internal
- [RED_HAT_REVIEW.md](./RED_HAT_REVIEW.md) - Security audit findings
- [TECH_DEBT_AUDIT.md](./TECH_DEBT_AUDIT.md) - Known issues
- [SECURITY_MONITORING.md](./SECURITY_MONITORING.md) - Monitoring strategy

### External
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## 🎓 Security Training

### Required for All Developers
- [ ] OWASP Top 10 overview
- [ ] XSS prevention techniques
- [ ] Authentication best practices
- [ ] Secure coding guidelines
- [ ] Incident response procedures

### Quarterly Reviews
- Security standards updates
- Recent vulnerabilities discussion
- Lessons learned from incidents
- New security tools and techniques

---

## ✅ Compliance

### SOC2 Requirements
- [x] Input sanitization
- [x] Authentication & authorization
- [x] Audit logging (Phase 5)
- [x] Encryption in transit (HTTPS)
- [x] Vulnerability management
- [x] Access controls

### GDPR Requirements
- [ ] Data retention policy (Phase 7)
- [ ] Data export API (Phase 7)
- [ ] Data deletion API (Phase 7)
- [ ] Consent management (Phase 7)
- [ ] Privacy policy (Phase 7)

---

**This document is a living standard. All developers MUST follow these guidelines. Violations will be caught in code review and security scans.**

**Last Review**: 2025-10-27  
**Next Review**: 2026-01-27  
**Owner**: Security Team
