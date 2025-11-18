# MCP Authentication Implementation

**Date**: 2025-11-18
**Status**: ✅ Implemented
**Branch**: `claude/improve-login-token-015RGSUPSRJgmbTiwGUCnt5q`

## Overview

This document describes the MCP (Model Context Protocol) authentication implementation for Engify.ai dashboard, enabling seamless integration with MCP-compatible clients (Claude Desktop, Cursor, etc.).

## Architecture

### Dual Authentication Approach

We implemented **two parallel authentication systems** that work together:

1. **Local Token Generation** (Primary)
   - Uses existing NextAuth.js v5 infrastructure
   - Generates JWT tokens with HS256 signing
   - Stores token metadata in MongoDB
   - Refresh tokens stored in Redis (Vercel KV)

2. **Auth-Service Proxy** (Secondary)
   - Proxies requests to external auth-service (port 7430)
   - Provides fallback if auth-service unavailable
   - Enables RS256 token migration path
   - Supports future multi-service architecture

## Implementation Details

### 1. MongoDB Schema Extensions

**File**: `src/lib/db/schema.ts`

Added the following collections:

#### Organization Members
```typescript
export const OrgMemberSchema = z.object({
  _id: ObjectIdSchema,
  organizationId: ObjectIdSchema,
  userId: ObjectIdSchema,
  role: OrgMemberRoleSchema.default('member'),
  invitedBy: ObjectIdSchema.nullable(),
  joinedAt: z.date(),
});
```

#### Workspaces
```typescript
export const WorkspaceSchema = z.object({
  _id: ObjectIdSchema,
  organizationId: ObjectIdSchema,
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable(),
  settings: z.object({
    defaultPermissions: z.array(z.string()).default([]),
    allowedScopes: z.array(z.string()).default([]),
  }),
  createdBy: ObjectIdSchema,
});
```

#### Workspace Members
```typescript
export const WorkspaceMemberSchema = z.object({
  _id: ObjectIdSchema,
  workspaceId: ObjectIdSchema,
  userId: ObjectIdSchema,
  role: WorkspaceMemberRoleSchema.default('viewer'),
  permissions: z.array(z.string()).default([]),
});
```

#### MCP Tokens
```typescript
export const MCPTokenSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  organizationId: ObjectIdSchema.nullable(),
  workspaceId: ObjectIdSchema.nullable(),
  tokenName: z.string().min(1).max(100),
  jti: z.string(), // JWT ID for revocation
  resource: z.string().default('urn:mcp:bug-reporter'),
  scopes: z.array(MCPTokenScopeSchema).default([]),
  isActive: z.boolean().default(true),
  expiresAt: z.date(),
  lastUsedAt: z.date().nullable(),
  usageCount: z.number().int().nonnegative().default(0),
  revokedAt: z.date().nullable(),
});
```

### 2. API Endpoints

#### POST /api/auth/mcp/token
**Purpose**: Generate MCP access token
**File**: `src/app/api/auth/mcp/token/route.ts`

**Request**:
```json
{
  "tokenName": "My MCP Token",
  "scopes": ["memory.read", "memory.write", "prompts.execute"],
  "workspaceId": "optional_workspace_id",
  "expiresInDays": 30
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "sk_ref_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "memory.read memory.write prompts.execute",
  "resource": "urn:mcp:bug-reporter",
  "jti": "token-id-for-revocation"
}
```

**JWT Claims**:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "orgId": "org_abc123",
  "orgRole": "admin",
  "workspaceId": "ws_def456",
  "workspaceSlug": "default",
  "wsRole": "owner",
  "scopes": ["memory.read", "memory.write"],
  "resource": "urn:mcp:bug-reporter",
  "aud": "urn:mcp:bug-reporter",
  "iss": "https://engify.ai",
  "exp": 1234567890,
  "jti": "unique-token-id"
}
```

#### GET /api/auth/mcp/token
**Purpose**: List user's MCP tokens

**Response**:
```json
{
  "tokens": [
    {
      "id": "token_id",
      "tokenName": "My MCP Token",
      "scopes": ["memory.read", "memory.write"],
      "expiresAt": "2025-12-18T00:00:00Z",
      "lastUsedAt": "2025-11-18T12:00:00Z",
      "usageCount": 42
    }
  ]
}
```

#### POST /api/auth/mcp/refresh
**Purpose**: Refresh access token
**File**: `src/app/api/auth/mcp/refresh/route.ts`

**Request**:
```json
{
  "refresh_token": "sk_ref_..."
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "memory.read memory.write",
  "resource": "urn:mcp:bug-reporter"
}
```

#### POST /api/auth/mcp/revoke
**Purpose**: Revoke MCP token
**File**: `src/app/api/auth/mcp/revoke/route.ts`

**Request**:
```json
{
  "jti": "token-id",
  "reason": "Token compromised"
}
```

**Response**:
```json
{
  "message": "Token revoked successfully",
  "jti": "token-id"
}
```

#### POST /api/auth/mcp/auth-service
**Purpose**: Proxy to external auth-service
**File**: `src/app/api/auth/mcp/auth-service/route.ts`

**Request**:
```json
{
  "action": "generate-token",
  "scopes": ["memory.read"],
  "workspaceId": "workspace_id"
}
```

**Features**:
- Health check before proxying
- Automatic fallback to local auth if service unavailable
- Rate limiting
- Error handling with upstream error passthrough

### 3. Dashboard Integration

**File**: `src/app/dashboard/page.tsx`

**Query Parameter Detection**:
```typescript
const searchParams = useSearchParams();
const ref = searchParams.get('ref');
const showMCPToken = ref === 'mcp-auth';
```

**Usage**:
```
https://engify.ai/dashboard?ref=mcp-auth
```

When `?ref=mcp-auth` is present, the dashboard displays the MCP token generation UI instead of the normal dashboard.

### 4. UI Components

**File**: `src/components/mcp/MCPTokenDisplay.tsx`

**Features**:
- Auto-generates token on mount
- Copy-to-clipboard functionality
- Security warnings ("show once" pattern)
- Setup instructions for:
  - Saving to ~/.engify-mcp-auth.json
  - Configuring Claude Desktop
  - Environment variable setup
- Token metadata display (expires, scopes)
- Refresh token support

## Security Features

### 1. Token Hashing & Storage
- Access tokens: JWT (HS256) - short-lived (1 hour)
- Refresh tokens: Random 32-byte base64url - long-lived (30 days)
- Refresh tokens stored in Redis with TTL
- Token metadata stored in MongoDB (no plaintext tokens)

### 2. Revocation Support
- JTI (JWT ID) for token identification
- Redis-based revocation list with automatic expiry
- MongoDB audit trail for revoked tokens
- Support revocation by: JTI, refresh_token, or token_id

### 3. Rate Limiting
- OAuth-specific rate limits (via `checkOAuthRateLimit`)
- Token generation: 20 requests/minute
- Token refresh: 20 requests/minute
- Revocation: Unlimited (security operation)

### 4. Audit Logging
- All token operations logged with Winston
- Includes: userId, orgId, workspaceId, scopes, IP address
- Action types: generated, refreshed, revoked
- Severity levels for security events

### 5. Scopes & Permissions
Defined scopes:
- `memory.read` - Read from memory store
- `memory.write` - Write to memory store
- `guardrails.scan` - Run guardrail scans
- `prompts.execute` - Execute prompts
- `prompts.read` - Read prompt templates
- `analytics.read` - View analytics
- `admin.full` - Full administrative access

## MCP CLI Integration Flow

### 1. User Initiates Auth
```bash
# From MCP-Platform repo
node services/mcp-server/engify-mcp-auth.ts generate
```

### 2. Browser Opens
```
https://engify.ai/dashboard?ref=mcp-auth
```

### 3. User Authenticates
- Already logged in: Proceeds to token generation
- Not logged in: Redirected to `/login`, then back to dashboard with `?ref=mcp-auth`

### 4. Token Generated
- Dashboard calls `POST /api/auth/mcp/token`
- Returns access_token + refresh_token
- Displays in UI with copy button

### 5. User Copies Token
- Clicks "Copy" button
- Pastes in terminal

### 6. CLI Saves Token
```json
// ~/.engify-mcp-auth.json
{
  "userId": "user_id",
  "email": "user@example.com",
  "accessToken": "eyJhbGc...",
  "refreshToken": "sk_ref_...",
  "expiresAt": "2025-11-18T13:00:00Z",
  "workspace": {
    "id": "ws_id",
    "slug": "default"
  }
}
```

### 7. MCP Server Validates Token
- Reads token from ~/.engify-mcp-auth.json
- Validates JWT signature with NEXTAUTH_SECRET
- Checks expiration
- Checks revocation list (Redis)
- Extracts claims (orgId, workspaceId, scopes)

## Environment Variables

### Required
```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://engify.ai
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Optional (Auth-Service Proxy)
```bash
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:7430
```

## Testing

### Local Testing
```bash
# 1. Start dashboard
npm run dev

# 2. Visit dashboard with MCP ref
open http://localhost:3000/dashboard?ref=mcp-auth

# 3. Generate token (auto-generated on page load)
# 4. Copy token
# 5. Test token validation

# 6. Verify token contents
node -e "console.log(JSON.parse(Buffer.from('TOKEN_HERE'.split('.')[1], 'base64')))"
```

### API Testing
```bash
# Generate token
curl -X POST http://localhost:3000/api/auth/mcp/token \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenName": "Test Token",
    "scopes": ["memory.read", "memory.write"],
    "expiresInDays": 30
  }'

# List tokens
curl http://localhost:3000/api/auth/mcp/token \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Refresh token
curl -X POST http://localhost:3000/api/auth/mcp/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "sk_ref_..."}'

# Revoke token
curl -X POST http://localhost:3000/api/auth/mcp/revoke \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "jti": "token-id",
    "reason": "Testing revocation"
  }'

# Check auth-service status
curl http://localhost:3000/api/auth/mcp/auth-service
```

## Migration Path: HS256 → RS256

### Current (Phase 1): HS256
- Symmetric key (NEXTAUTH_SECRET)
- All services share same secret
- Simpler to implement
- ✅ Implemented

### Future (Phase 2): RS256
- Asymmetric keypair (private + public)
- Dashboard signs with private key
- MCP services validate with public key (via JWKS)
- Better security isolation

### Migration Steps
1. Generate RSA keypair (2048-bit minimum)
2. Store private key securely (AWS Secrets Manager)
3. Update `/api/auth/mcp/token` to use RS256
4. Update `/api/auth/jwks` to expose public key
5. Update MCP services to fetch JWKS
6. Rotate old HS256 tokens

## Troubleshooting

### Token Generation Fails
```
Error: User not found
```
**Solution**: Ensure user is authenticated and session is valid

### Invalid Token
```
Error: JWT signature verification failed
```
**Solution**: Check NEXTAUTH_SECRET matches between dashboard and MCP services

### Token Expired
```
Error: Token expired
```
**Solution**: Use refresh token to get new access token

### Workspace Not Found
```
Error: Workspace not found
```
**Solution**: Create default workspace or specify valid workspaceId

### Auth-Service Unavailable
```
Error: Auth-service unavailable
```
**Solution**: Falls back to local auth automatically, or start auth-service on port 7430

## Files Modified/Created

### Schema
- ✅ `src/lib/db/schema.ts` - Added workspace, org_members, workspace_members, mcp_tokens schemas

### API Routes
- ✅ `src/app/api/auth/mcp/token/route.ts` - Token generation + listing
- ✅ `src/app/api/auth/mcp/refresh/route.ts` - Token refresh
- ✅ `src/app/api/auth/mcp/revoke/route.ts` - Token revocation
- ✅ `src/app/api/auth/mcp/auth-service/route.ts` - Auth-service proxy

### UI Components
- ✅ `src/components/mcp/MCPTokenDisplay.tsx` - Token display & copy UI
- ✅ `src/app/dashboard/page.tsx` - Dashboard MCP integration

### Documentation
- ✅ `docs/MCP_AUTH_IMPLEMENTATION.md` - This file

## Success Criteria

- ✅ User can signup with email/password
- ✅ User can login and see dashboard
- ✅ Token displayed on `/dashboard?ref=mcp-auth`
- ✅ Token includes org/workspace claims
- ✅ Token can be copied and pasted into MCP CLI
- ⏳ Full end-to-end flow works (requires MCP Platform setup)

## Next Steps

1. **Test with MCP Platform**
   - Start auth-service on port 7430
   - Test token generation from CLI
   - Verify token validation in MCP servers

2. **Default Workspace Creation**
   - Auto-create "default" workspace on first login
   - Add user as workspace owner
   - Populate workspace settings

3. **Token Rotation**
   - Implement automatic refresh before expiry
   - Notify user of expiring tokens
   - Background refresh in MCP services

4. **Monitoring**
   - Track token usage metrics
   - Alert on suspicious activity
   - Dashboard for token analytics

5. **RS256 Migration**
   - Generate RSA keypair
   - Update JWKS endpoint
   - Migrate MCP services to use public key validation

## References

- [RFC 8693: OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
- [RFC 8707: Resource Indicators for OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc8707)
- [NextAuth.js v5 Documentation](https://next-auth.js.org/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [ADR-0007: Use MongoDB for User Management](../MCP-Platform/docs/architecture/adr/0007-use-supabase-user-management.md)
