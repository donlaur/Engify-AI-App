# MCP Server OAuth Research - Combined Analysis (November 8, 2025)

## Executive Summary

**CRITICAL FINDING:** The stdio transport and HTTP-based OAuth 2.1 specification are fundamentally incompatible.

**MCP specification explicitly states:**
> "Implementations using an STDIO transport SHOULD NOT follow this specification, and instead retrieve credentials from the environment"

**Solution:** Hybrid "CLI-style" authentication architecture that provides full OAuth 2.1 security while respecting stdio transport limitations.

## Architecture Overview

### The stdio vs HTTP Conflict

| Transport | Capabilities | OAuth 2.1 Requirements | Compatibility |
|-----------|--------------|------------------------|----------------|
| HTTP | Headers, redirects, DNS, ports | WWW-Authenticate, browser redirects, discovery | ✅ Compatible |
| stdio | Local pipe, JSON-RPC only | Requires HTTP mechanisms | ❌ Incompatible |

### The Hybrid Solution

1. **Out-of-Band (OOB) Authentication** - One-time browser OAuth flow
2. **Secure Local Storage** - OS credential manager (Keychain/Vault)
3. **Authenticated Launcher Script** - Fetches fresh tokens before starting server
4. **stdio Server Runtime** - Receives validated credentials as command-line arguments

## Component Architecture

| Component | OAuth 2.1 Role | Technology | Key Responsibility |
|-----------|---------------|------------|-------------------|
| Cursor IDE | OAuth Client (Host) | Cursor IDE | Spawns MCP server process via mcp.json |
| Local Auth Script | OAuth Client (Agent) | Node.js Script | One-time browser auth flow (PKCE) |
| OS Credential Mgr | Token Storage | macOS Keychain, etc. | Securely stores refresh_token |
| Next.js App (engify.ai) | Authorization Server | Next.js / NextAuth | Authenticates user, issues audience-scoped JWTs |
| Node.js MCP Server | Resource Server | @modelcontextprotocol/sdk | Runs via stdio, consumes credentials from launcher |
| Python RAG Service | Downstream RS | FastAPI / Python | Validates OBO token, performs filtered search |

## OAuth 2.1 Implementation Details

### 1. Custom Authorization Server Endpoints

NextAuth.js must be extended with custom API routes to act as a full Authorization Server:

#### Authorization Endpoint
**File:** `app/api/mcp-auth/authorize/route.ts`
- Validates PKCE parameters
- Checks user session
- Generates and stores authorization code
- Redirects to localhost callback

#### Token Endpoint with RFC 8707
**File:** `app/api/mcp-auth/token/route.ts`
- Exchanges authorization code for tokens
- Validates PKCE code_verifier
- **CRITICAL:** Mints JWT with `aud` claim set to resource (RFC 8707)
- Issues short-lived access token + long-lived refresh token

#### On-Behalf-Of (OBO) Exchange
**File:** `app/api/auth/obo-exchange/route.ts`
- Implements RFC 8693 Token Exchange
- Exchanges user's MCP token for downstream service token
- Prevents token passthrough attacks

### 2. One-Time Authentication Script

**File:** `engify-mcp-auth.ts`

```typescript
// Key components:
// 1. Generate PKCE code_verifier & code_challenge
// 2. Start temporary http server on localhost:12345
// 3. Open browser to engify.ai/api/mcp-auth/authorize
// 4. Handle redirect, exchange code for tokens
// 5. Store refresh_token in OS keychain
```

**Security Features:**
- PKCE (RFC 7636) prevents code interception
- State parameter prevents CSRF
- Localhost-only binding prevents network snooping
- OS keychain storage prevents plaintext exposure

### 3. Launcher Script Pattern

**File:** `engify-mcp-launcher.ts`

```typescript
// Execution flow:
// 1. Retrieve refresh_token from OS keychain
// 2. Exchange for fresh access_token
// 3. Validate token (verify audience, issuer, expiry)
// 4. Spawn MCP server with userId + token as argv
// 5. Pipe stdio transparently to Cursor
```

**Cursor Configuration:**
```json
{
  "mcpServers": {
    "engify-bug-reporter": {
      "command": "npx",
      "args": ["ts-node", "/path/to/engify-mcp-launcher.ts"],
      "transport": "stdio"
    }
  }
}
```

### 4. stdio Server Runtime

**File:** `server.ts`

```typescript
// Read validated credentials from launcher
const authContext = {
  userId: process.argv[2],
  token: process.argv[3],
};

// Validate startup
if (!authContext.userId || !authContext.token) {
  console.error('FATAL: Server started without auth context');
  process.exit(1);
}

// Register tools with multi-tenant enforcement
server.registerTool('listBugs', async (inputs) => {
  const result = await getBugReports({
    ...inputs,
    userId: authContext.userId, // CRITICAL: Tenant isolation
  });
  return result;
});
```

## Security Best Practices (November 2025)

### Mandatory Requirements

| Security Vector | Mitigation | Spec/Source |
|----------------|------------|-------------|
| Confused Deputy | RFC 8707 Resource Indicators: `aud` claim validation | MCP Spec June 2025 |
| Token Replay | OBO Flow (RFC 8693): Token A never sent to downstream | RFC 8693 |
| Insecure Storage | OS Keychain via cross-keychain | Best Practice |
| Static Credentials | OAuth 2.1 refresh tokens, short-lived access tokens | OAuth 2.1 |
| Code Interception | PKCE (RFC 7636): Cryptographic binding | RFC 7636 |
| stdio Transport | Credentials in argv, validated before server starts | MCP Spec |
| DB Data Leakage | Mandatory userId filtering in all queries | Best Practice |
| RAG Data Leakage | Metadata filtering in vector DB | Production Pattern |
| Network Snooping | Localhost-only binding (127.0.0.1) | RFC 8252 |

### Token Flow Security

1. **Authorization Code Flow** with PKCE
   - Prevents authorization code interception
   - No client secret needed for public clients

2. **RFC 8707 Resource Indicators**
   - `resource=urn:mcp:bug-reporter` in auth request
   - `aud` claim in JWT bound to specific server
   - Prevents confused deputy attacks

3. **Short-Lived Access Tokens**
   - 1-hour expiry limit
   - Refresh token rotation
   - On-demand fetching by launcher

4. **On-Behalf-Of Token Exchange**
   - User token (Token A) exchanged for service token (Token B)
   - Downstream services never see primary token
   - Audience-specific scoping

## Multi-Tenant Data Isolation

### Database Layer (MongoDB)

```typescript
// Every query MUST include userId filter
const bugs = await BugReportCollection.find({
  userId: userId, // STRICT TENANCY FILTER
  project: project,
}).toArray();
```

### RAG Layer (Vector Database)

```python
# Python RAG service with metadata filtering
search_results = vector_db.query(
  vector=query_vector,
  top_k=5,
  filter={'user_id': user_id}  # STRICT TENANCY FILTER
)
```

### Defense in Depth

1. **Application Layer:** Tool handlers filter by userId
2. **Database Layer:** Queries include userId filter
3. **Vector DB Layer:** Metadata filtering by user_id
4. **Token Layer:** Each service validates audience-scoped tokens

## Implementation Priority

### Phase 1: Authorization Server (5 commits)
1. Custom authorize endpoint with PKCE validation
2. Token endpoint with RFC 8707 audience binding
3. OBO exchange endpoint for downstream services
4. JWKS endpoint for token verification
5. Error handling and logging

### Phase 2: Local Authentication (3 commits)
1. One-time auth script with PKCE flow
2. OS keychain integration
3. Error handling and user feedback

### Phase 3: Launcher Pattern (2 commits)
1. Launcher script with token refresh
2. Token validation before server spawn
3. stdio piping and error handling

### Phase 4: Server Security (3 commits)
1. Update MCP server to consume credentials
2. Add userId filtering to all operations
3. Implement OBO flow for RAG calls

### Phase 5: Testing & Documentation (2 commits)
1. End-to-end OAuth flow testing
2. Security validation and documentation

## Comparison with Current Implementation

| Aspect | Current | Required |
|--------|---------|----------|
| OAuth Flow | Simple random tokens | Full OAuth 2.1 with PKCE |
| Transport | Over stdio (incorrect) | Out-of-band browser flow |
| Token Storage | Plaintext file | OS keychain |
| Audience Binding | None | RFC 8707 required |
| Multi-Tenant | Not implemented | Mandatory userId filtering |
| Downstream Security | Token passthrough | OBO token exchange |
| Spec Compliance | Non-compliant | Fully compliant |

## References

1. Model Context Protocol Authorization Specification (2025-06-18)
2. RFC 7636 - Proof Key for Code Exchange (PKCE)
3. RFC 8707 - OAuth 2.0 Resource Indicators
4. RFC 8693 - OAuth 2.0 Token Exchange
5. RFC 8252 - OAuth 2.0 for Native Apps
6. OAuth 2.1 Security Best Practices
7. NextAuth.js Custom Authorization Server Guide
8. cross-keychain OS Credential Storage
9. Vector Database Multi-Tenancy Patterns

## Next Steps

1. **Review and approve** this architecture
2. **Create ADR** documenting the decision
3. **Begin Phase 1** implementation
4. **Test each phase** before proceeding
5. **Update documentation** with security guidelines

---

**Note:** This architecture represents the gold standard for MCP server security in November 2025, fully compliant with OAuth 2.1 and MCP specifications while respecting the technical constraints of stdio transport.
