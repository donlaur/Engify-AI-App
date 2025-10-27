# AI Context Document

**Purpose**: This document provides essential context for AI coding assistants to maintain consistency, quality, and strategic alignment throughout development.

**READ THIS FIRST** before making any code changes or architectural decisions.

---

## 🎯 Project Mission

**Engify.ai** is an **AI education platform** that helps engineering teams transition from "AI Fear to AI Fluency."

**Phase 1 (Year 1)**: Education platform - teach people how to use AI (copy-paste prompts)  
**Phase 2 (Year 2)**: Assisted execution - run AI for users (convenience)  
**Phase 3 (Year 3+)**: Code intelligence - analyze codebases (power)

**Not a side project. Not a portfolio piece. A real $100M+ ARR business.**

**CRITICAL**: We're building an **education platform first**, not an AI execution platform. Users copy prompts and run them in their own AI tools (ChatGPT/Claude/Gemini).

---

## 💰 Business Model

### Revenue Focus: Education First, Enterprise Later

**Phase 1 Tiers** (Education Platform):
- Free: $0 - Access to 50 prompts
- Pro: $10-20/month - All 100+ prompts, advanced tools
- Team: $30-50/user - Team workspace, shared prompts

**Phase 2+ Tiers** (Execution + Intelligence):
- Enterprise Starter: $10K/year (50-100 users)
- Enterprise Professional: $50K/year (100-500 users)
- Enterprise Premium: $200K+/year (500+ users)

**Target Phase 1**: $12.5K MRR by Month 6  
**Target Phase 2**: $70K MRR by Year 2  
**Target Phase 3**: $225K MRR by Year 3 ($2.7M ARR)

### Why This Matters for Development

**Phase 1 Focus** (What we're building NOW):
1. **Prompt library** - Display, search, copy prompts
2. **Learning pathways** - Guided education
3. **User accounts** - Save favorites, track progress
4. **Basic workbench** - Prompt templates
5. **Multi-tenant ready** - Design for teams (even if not fully featured)

**What we're NOT building yet**:
- ❌ AI execution (Phase 2)
- ❌ Code scanning (Phase 3)
- ❌ GitHub integration (Phase 3)
- ❌ Complex Python services (Phase 2+)

**But we design for**:
1. **Multi-tenant architecture** (teams in Phase 1, enterprise in Phase 2+)
2. **SOC2-ready patterns** (even if not certified yet)
3. **Data isolation** (critical from day one)
4. **Scalability** (1 user to 100,000 users)

---

## 🏗️ Core Architecture Decisions

### 1. Database: MongoDB Atlas

**Why**: 
- Document-oriented (perfect for prompts, configs)
- Atlas Vector Search (RAG without separate vector DB)
- Flexible schema (rapid iteration)
- Multi-tenant ready
- SOC2 certified

**Critical Rule**: Every collection MUST have `organizationId` field for data isolation.

```javascript
// ALWAYS include organizationId in queries
db.collection('conversations').find({
  organizationId: user.organizationId,  // CRITICAL
  userId: user._id
});
```

### 2. Hosting: AWS (Not Vercel)

**Why**:
- Full Python support (Lambda)
- Enterprise compliance (SOC2, FedRAMP path)
- Cost-effective at scale
- Resume value (industry standard)

**Stack**: CloudFront → S3 + API Gateway → Lambda (Node.js + Python) → MongoDB Atlas

### 3. Authentication: NextAuth.js v5 (Not Clerk)

**Why**:
- Free (save $300-3K/month)
- Full control over user data
- No vendor lock-in
- Industry standard
- Easy Stripe integration

### 4. Multi-Provider AI

**Supported**: Gemini, OpenAI, Anthropic, AWS Bedrock

**Why**:
- No vendor lock-in
- Cost optimization
- Fallback for reliability
- Competitive advantage

### 5. Frontend: Next.js 14 (App Router)

**Why**:
- Server-side rendering (SEO)
- API routes (unified codebase)
- Industry standard
- Enterprise adoption

---

## 🔒 Security & Compliance

### Non-Negotiable Requirements

1. **Data Isolation**: Every query MUST include `organizationId`
2. **Audit Logging**: Log all important actions
3. **Encryption**: All sensitive data encrypted at rest and in transit
4. **RBAC**: Role-based access control (owner, admin, manager, member)
5. **Input Validation**: Use Zod for all user inputs

### SOC2 Compliance (Year 2 Goal)

**Built-in from Day One**:
- ✅ Audit logging
- ✅ Encryption
- ✅ RBAC
- ✅ Data retention policies
- ✅ Multi-tenant isolation

**Cost**: $50K-100K
**Timeline**: 6-9 months
**Required**: For most enterprise deals

---

## 📊 Multi-Tenant Architecture

### Schema Pattern

**Every collection includes**:
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // null for individual users
  // ... other fields
}
```

### Query Pattern

**ALWAYS use helper functions**:
```typescript
// ❌ WRONG - Data leak risk!
const data = await db.collection('conversations').find({ userId });

// ✅ CORRECT - Data isolated
const data = await getOrganizationConversations(
  user.organizationId,
  user._id
);
```

### Helper Function Pattern

```typescript
/**
 * Get conversations for a user within their organization
 * CRITICAL: Always includes organizationId for data isolation
 */
export async function getOrganizationConversations(
  organizationId: string | null,
  userId: string
) {
  const db = await getDb();
  return db.collection('conversations').find({
    organizationId: organizationId || null,
    userId: userId
  }).toArray();
}
```

---

## 🎓 Development Principles

### 1. Documentation-First

**Before coding**:
1. Document the decision (DECISION_LOG.md)
2. Write tests (TDD when possible)
3. Implement feature
4. Update documentation

**Why**: Keeps AI models aligned, enables team collaboration, supports interviews

### 2. Security-First

**Every feature must consider**:
- Data isolation (multi-tenant)
- Audit logging (compliance)
- Input validation (security)
- Error handling (no data leaks)

### 3. Scale-First

**Design for**:
- 1 user (MVP)
- 1,000 users (Pro tier)
- 100,000 users (Enterprise)

**But build for**:
- MVP speed (ship fast)
- Enterprise quality (no shortcuts on security)

### 4. Test What Matters

**Priority**:
1. Data isolation (CRITICAL for multi-tenant)
2. Business logic
3. Security boundaries
4. Critical user flows (E2E)

---

## 📝 Code Standards

### TypeScript Strict Mode

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Input Validation with Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  organizationId: z.string().optional()
});

const result = schema.safeParse(input);
```

### Error Handling

```typescript
// Use custom error classes
throw new UnauthorizedError();
throw new DataIsolationError();

// Handle consistently in API routes
catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  // Log unexpected errors
  console.error('Unexpected error:', error);
}
```

### Audit Logging

```typescript
// Log all important actions
await logAuditEvent(
  user.organizationId,
  user._id,
  'conversation.created',
  'conversation',
  conversationId,
  { title: conversation.title },
  req
);
```

---

## 🚫 Common Mistakes to Avoid

### 1. Missing organizationId in Queries

```typescript
// ❌ CRITICAL ERROR - Data leak!
const conversations = await db.collection('conversations').find({
  userId: user._id
});

// ✅ CORRECT
const conversations = await db.collection('conversations').find({
  organizationId: user.organizationId,
  userId: user._id
});
```

### 2. Not Validating Input

```typescript
// ❌ WRONG - Security risk
const email = req.body.email;

// ✅ CORRECT
const schema = z.object({ email: z.string().email() });
const { email } = schema.parse(req.body);
```

### 3. Not Logging Audit Events

```typescript
// ❌ WRONG - Compliance risk
await db.collection('users').deleteOne({ _id: userId });

// ✅ CORRECT
await logAuditEvent(
  user.organizationId,
  adminId,
  'user.deleted',
  'user',
  userId,
  { email: user.email },
  req
);
await db.collection('users').deleteOne({ _id: userId });
```

### 4. Hardcoding Values

```typescript
// ❌ WRONG
const apiKey = 'sk-1234567890';

// ✅ CORRECT
const apiKey = process.env.OPENAI_API_KEY;
```

### 5. Not Handling Errors

```typescript
// ❌ WRONG
const user = await getUser(id);
console.log(user.email); // Might crash

// ✅ CORRECT
const user = await getUser(id);
if (!user) {
  throw new NotFoundError('User not found');
}
console.log(user.email);
```

---

## 📚 Essential Reading

**Before making any changes, read these documents in order**:

1. **[DECISION_LOG.md](./DECISION_LOG.md)** - All architectural decisions with rationale
2. **[ENTERPRISE_STRATEGY.md](./strategy/ENTERPRISE_STRATEGY.md)** - Business context and enterprise requirements
3. **[ARCHITECTURE_STRATEGY.md](./strategy/ARCHITECTURE_STRATEGY.md)** - Technical architecture details
4. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Coding standards and best practices

**For specific topics**:
- Authentication: [AUTH_AND_BILLING_STRATEGY.md](./strategy/AUTH_AND_BILLING_STRATEGY.md)
- Pricing: [SAAS_MODEL_OVERVIEW.md](./strategy/SAAS_MODEL_OVERVIEW.md)
- Deployment: [AWS_DEPLOYMENT_GUIDE.md](./implementation/AWS_DEPLOYMENT_GUIDE.md)
- Getting Started: [QUICK_START.md](./guides/QUICK_START.md)

---

## 🎯 Current Phase: Week 1 MVP

### Goals
- Working authentication (NextAuth.js v5)
- Multi-provider AI (Gemini, OpenAI, Anthropic)
- Conversation history
- User settings
- Deployed to Vercel (temporary)

### What to Build
1. Next.js 14 project structure
2. MongoDB connection with multi-tenant schema
3. Authentication (email/password + Google OAuth)
4. AI provider abstraction layer
5. API routes for chat and settings
6. Basic UI components

### What NOT to Build (Yet)
- ❌ RAG (Week 3)
- ❌ Team features (Week 4)
- ❌ Admin dashboard (Month 2)
- ❌ SSO (Month 3)
- ❌ AWS deployment (Week 2)

---

## 🔍 When to Ask Questions

### Ask When
- Unclear about business requirements
- Uncertain about security implications
- Need to make architectural decision
- Considering trade-offs

### Don't Ask When
- Implementation details are clear
- Following established patterns
- Standard coding practices

### How to Ask
1. State what you understand
2. State what's unclear
3. Propose solution(s)
4. Ask for confirmation

**Example**:
> "I understand we need to add a new API route for exporting conversations. Based on the multi-tenant architecture, I should:
> 1. Include organizationId in the query
> 2. Check user permissions (admin only)
> 3. Log the export action
> 4. Validate input with Zod
> 
> Is this correct? Should I also add rate limiting?"

---

## 💡 Key Insights for AI Models

### This is NOT a typical project

**Most projects**: Build fast, worry about scale later
**This project**: Build for enterprise from day one

**Most projects**: Single-tenant (one user = one account)
**This project**: Multi-tenant (one organization = many users)

**Most projects**: Security is optional
**This project**: Security is required (SOC2 compliance)

**Most projects**: Documentation is nice-to-have
**This project**: Documentation is critical (for AI alignment)

### Success Criteria

**Technical**:
- ✅ No data leaks (perfect multi-tenant isolation)
- ✅ No security vulnerabilities
- ✅ Scalable architecture (1 to 100K users)
- ✅ SOC2-ready from day one

**Business**:
- ✅ Enterprise-ready features
- ✅ Clear upgrade path (Free → Pro → Enterprise)
- ✅ Predictable revenue model

**Career**:
- ✅ Demonstrates VP-level thinking
- ✅ Shows technical depth
- ✅ Proves execution ability

---

## 🚀 Quick Reference

### File Locations
- **Decisions**: `/docs/DECISION_LOG.md`
- **Dev Guide**: `/docs/DEVELOPMENT_GUIDE.md`
- **Schema**: `/src/lib/db/schema.ts`
- **Queries**: `/src/lib/db/queries.ts`
- **AI Providers**: `/src/lib/ai/providers/`
- **API Routes**: `/src/app/api/`

### Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm type-check       # Check TypeScript

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed data

# Deployment
pnpm deploy:staging   # Deploy to staging
pnpm deploy:prod      # Deploy to production
```

### Environment Variables
```bash
MONGODB_URI           # MongoDB connection string
NEXTAUTH_SECRET       # NextAuth secret
NEXTAUTH_URL          # App URL
GEMINI_API_KEY        # Google Gemini API key
OPENAI_API_KEY        # OpenAI API key
ANTHROPIC_API_KEY     # Anthropic API key
STRIPE_SECRET_KEY     # Stripe secret key
```

---

## ✅ Pre-Flight Checklist

Before implementing any feature, verify:

- [ ] Read relevant documentation
- [ ] Understand business context
- [ ] Know security requirements
- [ ] Identified data isolation needs
- [ ] Planned audit logging
- [ ] Considered scalability
- [ ] Written tests (or plan to)
- [ ] Updated documentation

---

## 🎓 Learning Mindset

### For the Developer

**This project is designed to**:
- Teach VP-level strategic thinking
- Demonstrate enterprise architecture
- Show security best practices
- Prove scalability planning
- Build interview material

**Every decision has a "why"** - understand it, don't just copy it.

### For AI Models

**This project requires**:
- Reading documentation thoroughly
- Following established patterns
- Asking clarifying questions
- Maintaining consistency
- Thinking about scale and security

**You are building a real business**, not a demo app.

---

## 📞 Final Notes

### Remember

1. **Security First**: Data isolation is CRITICAL
2. **Scale First**: Design for 100K users, build for 1 user
3. **Document First**: Write docs before code
4. **Test What Matters**: Focus on data isolation and business logic
5. **Think Enterprise**: Every feature should support SOC2 compliance

### Success Looks Like

- ✅ No data leaks (perfect isolation)
- ✅ Clean, documented code
- ✅ Comprehensive tests
- ✅ Enterprise-ready architecture
- ✅ Clear path to $100M ARR

### Failure Looks Like

- ❌ Data leak (user sees another org's data)
- ❌ Security vulnerability
- ❌ Undocumented decisions
- ❌ Shortcuts on compliance
- ❌ Not thinking about scale

---

**This is how you build a $100M+ company. Let's do this right.**

**Last Updated**: 2025-10-27  
**Maintainer**: Engineering Leadership  
**Status**: Active - Read Before Every Session
