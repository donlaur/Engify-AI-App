# Security Guide - Enterprise-Grade Standards

**Mission**: Every commit must meet enterprise security standards. No exceptions.

**Principle**: "Security is not a feature, it's a requirement."

---

## 🎯 Security Principles

### 1. Defense in Depth
Multiple layers of security, so if one fails, others protect

### 2. Least Privilege
Users and services get minimum permissions needed

### 3. Fail Securely
When something goes wrong, fail safely (don't expose data)

### 4. Never Trust Input
Validate and sanitize all user input

### 5. Secrets Never in Code
No API keys, passwords, or tokens in source code

---

## 🚫 What NEVER Goes in Code

### Absolutely Forbidden

```typescript
// ❌ NEVER - Hardcoded secrets
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'mypassword123';
const stripeKey = 'sk_live_abc123';

// ❌ NEVER - Commented out secrets
// const API_KEY = 'sk-1234567890abcdef';

// ❌ NEVER - Secrets in config files committed to git
{
  "apiKey": "sk-1234567890abcdef"
}

// ❌ NEVER - Database credentials
const connectionString = 'mongodb://admin:password@localhost:27017';

// ❌ NEVER - Private keys
const privateKey = '-----BEGIN PRIVATE KEY-----\nMIIE...';

// ❌ NEVER - Session secrets
const sessionSecret = 'my-secret-session-key';

// ❌ NEVER - OAuth client secrets
const clientSecret = 'abc123def456';

// ❌ NEVER - Encryption keys
const encryptionKey = 'my-32-byte-encryption-key-here';
```

### ✅ Correct Approach

```typescript
// ✅ CORRECT - Use environment variables
const apiKey = process.env.OPENAI_API_KEY;
const dbPassword = process.env.DB_PASSWORD;
const stripeKey = process.env.STRIPE_SECRET_KEY;

// ✅ CORRECT - Validate they exist
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

// ✅ CORRECT - Use AWS Secrets Manager (production)
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return response.SecretString!;
}
```

---

## 🔒 Input Validation

### Always Validate User Input

```typescript
import { z } from 'zod';

// ❌ WRONG - No validation
export async function createUser(req: Request) {
  const { email, name } = await req.json();
  // Direct use without validation - DANGEROUS
  await db.collection('users').insertOne({ email, name });
}

// ✅ CORRECT - Validate with Zod
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['member', 'manager', 'admin', 'owner']).optional(),
});

export async function createUser(req: Request) {
  const body = await req.json();
  
  // Validate input
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error.issues },
      { status: 400 }
    );
  }
  
  const { email, name, role } = result.data;
  
  // Now safe to use
  await db.collection('users').insertOne({
    email,
    name,
    role: role || 'member',
    createdAt: new Date()
  });
}
```

### SQL Injection Prevention (MongoDB)

```typescript
// ❌ WRONG - String concatenation (vulnerable to injection)
const userId = req.query.id;
const user = await db.collection('users').findOne({
  _id: new ObjectId(userId) // If userId is malicious, this could fail
});

// ✅ CORRECT - Validate input first
const userIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

const result = userIdSchema.safeParse(req.query.id);
if (!result.success) {
  return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
}

const user = await db.collection('users').findOne({
  _id: new ObjectId(result.data)
});
```

### XSS Prevention

```typescript
// ❌ WRONG - Rendering user input directly
function UserProfile({ user }) {
  return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
}

// ✅ CORRECT - React escapes by default
function UserProfile({ user }) {
  return <div>{user.bio}</div>;
}

// ✅ CORRECT - If HTML needed, sanitize first
import DOMPurify from 'isomorphic-dompurify';

function UserProfile({ user }) {
  const sanitizedBio = DOMPurify.sanitize(user.bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedBio }} />;
}
```

---

## 🔐 Authentication & Authorization

### Authentication (Who are you?)

```typescript
// ✅ CORRECT - Check authentication
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // User is authenticated
  const data = await getData(session.user.id);
  return NextResponse.json(data);
}
```

### Authorization (What can you do?)

```typescript
// ✅ CORRECT - Check permissions
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get requesting user
  const requestingUser = await getUserById(session.user.id);
  
  // Check if user is admin
  if (!isAdmin(requestingUser)) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }
  
  // Check if user is in same organization
  const targetUser = await getUserById(params.userId);
  if (targetUser.organizationId !== requestingUser.organizationId) {
    return NextResponse.json(
      { error: 'Forbidden - Cannot delete users from other organizations' },
      { status: 403 }
    );
  }
  
  // Now safe to delete
  await deleteUser(params.userId);
  
  // Audit log
  await logAuditEvent(
    requestingUser.organizationId,
    requestingUser._id,
    'user.deleted',
    'user',
    params.userId,
    { email: targetUser.email },
    req
  );
  
  return NextResponse.json({ success: true });
}
```

### Password Security

```typescript
import { hash, compare } from 'bcryptjs';

// ✅ CORRECT - Hash passwords with bcrypt
export async function createUser(email: string, password: string) {
  // Validate password strength
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters');
  }
  
  // Hash with cost factor 12 (secure but not too slow)
  const hashedPassword = await hash(password, 12);
  
  await db.collection('users').insertOne({
    email,
    password: hashedPassword,
    createdAt: new Date()
  });
}

// ✅ CORRECT - Verify passwords
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(plainPassword, hashedPassword);
}

// ❌ NEVER - Store plain text passwords
// ❌ NEVER - Use weak hashing (MD5, SHA1)
// ❌ NEVER - Use encryption for passwords (use hashing)
```

---

## 🛡️ Data Protection

### Encryption at Rest

```typescript
// ✅ CORRECT - Encrypt sensitive data before storing
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Must be 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return iv + authTag + encrypted
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage: Encrypt user's API keys
const encryptedKey = encrypt(userApiKey);
await db.collection('users').updateOne(
  { _id: userId },
  { $set: { 'settings.apiKeys.openai.encrypted': encryptedKey } }
);
```

### Data Isolation (Multi-Tenant)

```typescript
// ✅ CORRECT - Always include organizationId
export async function getConversations(
  organizationId: string | null,
  userId: string
) {
  const db = await getDb();
  
  return db.collection('conversations').find({
    organizationId: organizationId || null, // CRITICAL
    userId: userId
  }).toArray();
}

// ❌ WRONG - Missing organizationId (DATA LEAK!)
export async function getConversations(userId: string) {
  const db = await getDb();
  
  return db.collection('conversations').find({
    userId: userId // Missing organizationId - can see other orgs' data!
  }).toArray();
}
```

---

## 🚨 Error Handling

### Never Expose Internal Details

```typescript
// ❌ WRONG - Exposes internal details
export async function GET(req: Request) {
  try {
    const data = await db.collection('users').findOne({ _id: userId });
    return NextResponse.json(data);
  } catch (error) {
    // Exposes database structure, connection strings, etc.
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

// ✅ CORRECT - Generic error message, log details
export async function GET(req: Request) {
  try {
    const data = await db.collection('users').findOne({ _id: userId });
    return NextResponse.json(data);
  } catch (error) {
    // Log full error for debugging
    console.error('Error fetching user:', error);
    
    // Return generic message to user
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ BETTER - Use custom error classes
export async function GET(req: Request) {
  try {
    const data = await db.collection('users').findOne({ _id: userId });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      // Safe to expose
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    // Unknown error - log and return generic message
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🔍 Logging & Monitoring

### What to Log

```typescript
// ✅ CORRECT - Log important events
await logAuditEvent(
  user.organizationId,
  user._id,
  'user.login',
  'user',
  user._id,
  {
    ipAddress: req.headers.get('x-forwarded-for'),
    userAgent: req.headers.get('user-agent')
  },
  req
);

// ✅ CORRECT - Log security events
await logAuditEvent(
  user.organizationId,
  user._id,
  'auth.failed_login',
  'user',
  user._id,
  {
    reason: 'invalid_password',
    ipAddress: req.headers.get('x-forwarded-for')
  },
  req
);

// ✅ CORRECT - Log data access
await logAuditEvent(
  user.organizationId,
  user._id,
  'conversation.viewed',
  'conversation',
  conversationId,
  {},
  req
);
```

### What NOT to Log

```typescript
// ❌ NEVER - Log passwords
console.log('User password:', password); // NEVER

// ❌ NEVER - Log API keys
console.log('API key:', apiKey); // NEVER

// ❌ NEVER - Log credit card numbers
console.log('Card number:', cardNumber); // NEVER

// ❌ NEVER - Log session tokens
console.log('Session token:', sessionToken); // NEVER

// ✅ CORRECT - Log redacted versions
console.log('API key:', apiKey.substring(0, 8) + '...');
console.log('Card number:', '****' + cardNumber.slice(-4));
```

---

## 🌐 API Security

### Rate Limiting

```typescript
// ✅ CORRECT - Implement rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

### CORS Configuration

```typescript
// ✅ CORRECT - Strict CORS
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://engify.ai', // Specific domain
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ❌ WRONG - Allows any origin
'Access-Control-Allow-Origin': '*' // NEVER in production
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Minimize unsafe-*
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.engify.ai",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📦 Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Lock Files

```bash
# ✅ ALWAYS commit lock files
git add package-lock.json
git add pnpm-lock.yaml

# ❌ NEVER ignore lock files
# Don't add to .gitignore
```

### Verify Package Integrity

```json
// package.json
{
  "dependencies": {
    "next": "14.0.0", // Pin exact versions for security
    "react": "18.2.0"
  }
}
```

---

## 🔒 Environment Variables

### .env.local (Development)

```bash
# ✅ CORRECT - Local development only
MONGODB_URI=mongodb://localhost:27017/engify_dev
NEXTAUTH_SECRET=dev-secret-change-in-production
OPENAI_API_KEY=sk-dev-key
```

### .env.example (Committed to Git)

```bash
# ✅ CORRECT - Template without secrets
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/engify
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

### .gitignore

```bash
# ✅ CORRECT - Ignore all env files except example
.env
.env.local
.env.development
.env.production
!.env.example
```

---

## 🚫 Pre-Commit Checklist

Before every commit, verify:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No commented-out secrets
- [ ] All user input validated with Zod
- [ ] All database queries include organizationId (if applicable)
- [ ] All errors handled properly (no stack traces exposed)
- [ ] All sensitive data encrypted
- [ ] All audit events logged
- [ ] No console.log with sensitive data
- [ ] Dependencies up to date (npm audit clean)
- [ ] Tests pass
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings

---

## 🛠️ Security Tools

### 1. git-secrets

```bash
# Install
brew install git-secrets

# Set up
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'sk-[a-zA-Z0-9]{32,}'  # OpenAI keys
git secrets --add 'sk_live_[a-zA-Z0-9]{24,}'  # Stripe keys
git secrets --add 'mongodb\+srv://[^:]+:[^@]+@'  # MongoDB URIs
```

### 2. trufflehog

```bash
# Install
brew install trufflehog

# Scan repository
trufflehog git file://. --only-verified
```

### 3. npm audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

### 4. Snyk

```bash
# Install
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor continuously
snyk monitor
```

---

## 📋 Security Checklist for Pull Requests

### Code Review Checklist

- [ ] **No Secrets**: No API keys, passwords, or tokens in code
- [ ] **Input Validation**: All user input validated with Zod
- [ ] **Authentication**: All protected routes check authentication
- [ ] **Authorization**: All actions check permissions
- [ ] **Data Isolation**: All queries include organizationId
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Audit Logging**: Important actions logged
- [ ] **Encryption**: Sensitive data encrypted
- [ ] **Dependencies**: No new vulnerabilities introduced
- [ ] **Tests**: Security-critical code has tests

---

## 🚨 Security Incident Response

### If You Discover a Vulnerability

1. **DO NOT** commit the fix immediately
2. **DO NOT** discuss publicly
3. **DO** notify the team privately
4. **DO** create a private security advisory
5. **DO** fix and test thoroughly
6. **DO** deploy fix immediately
7. **DO** document in post-mortem

### If Secrets Are Committed

1. **Immediately** revoke the exposed secret
2. **Generate** new secret
3. **Update** all systems using the secret
4. **Remove** secret from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
5. **Force push** (coordinate with team)
6. **Document** incident

---

## 📚 Security Resources

### Required Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

### Tools

- [git-secrets](https://github.com/awslabs/git-secrets)
- [trufflehog](https://github.com/trufflesecurity/trufflehog)
- [Snyk](https://snyk.io/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## ✅ Summary

### Golden Rules

1. **Never commit secrets** - Use environment variables
2. **Always validate input** - Use Zod for all user input
3. **Always check permissions** - Authentication + Authorization
4. **Always include organizationId** - Data isolation is critical
5. **Never expose internals** - Generic error messages
6. **Always encrypt sensitive data** - API keys, personal data
7. **Always log security events** - Audit trail for compliance
8. **Keep dependencies updated** - npm audit regularly

### This is Not Optional

Security is not a feature you add later. It's a requirement from day one.

**Every commit must meet these standards. No exceptions.**

---

**Last Updated**: 2025-10-27  
**Status**: Active - Enforce on Every Commit  
**Maintainer**: Engineering Leadership
