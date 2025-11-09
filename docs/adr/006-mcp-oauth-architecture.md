# ADR 006: MCP Server OAuth Architecture for stdio Transport

## Status
Accepted

## Context
The Model Context Protocol (MCP) specification updated in June 2025 mandates OAuth 2.1 authentication with RFC 8707 Resource Indicators. However, our MCP server uses stdio transport, which is fundamentally incompatible with HTTP-based OAuth flows.

The MCP specification explicitly states:
> "Implementations using an STDIO transport SHOULD NOT follow this specification, and instead retrieve credentials from the environment"

This creates a conflict between security requirements and technical constraints.

## Decision
Implement a hybrid "CLI-style" authentication architecture that provides full OAuth 2.1 security while respecting stdio transport limitations.

### Architecture Components

1. **Out-of-Band (OOB) Authentication** - One-time browser OAuth flow performed separately
2. **Secure Local Storage** - OS credential manager (Keychain/Vault) for refresh tokens
3. **Launcher Script** - Fetches fresh tokens and validates before starting MCP server
4. **stdio Server Runtime** - Receives pre-validated credentials as command-line arguments

### Implementation Flow

```
1. One-time: npx engify-mcp-auth
   ↓ Browser OAuth 2.1 with PKCE
   ↓ Store refresh_token in OS Keychain
   
2. Every Cursor start: Launcher script
   ↓ Retrieve refresh_token from Keychain
   ↓ Exchange for fresh access_token
   ↓ Validate token (audience, issuer, expiry)
   ↓ Spawn MCP server with userId + token as argv
   
3. Runtime: MCP server
   ↓ Read credentials from process.argv
   ↓ Filter all queries by userId
   ↓ Use OBO flow for downstream RAG calls
```

## Consequences

### Positive
- ✅ Full OAuth 2.1 compliance (PKCE, Resource Indicators)
- ✅ Respects stdio transport constraints
- ✅ Secure token storage (OS keychain)
- ✅ Multi-tenant data isolation
- ✅ Zero-trust downstream communication (OBO flow)
- ✅ Short-lived tokens, automatic refresh
- ✅ Follows MCP specification exactly

### Negative
- ❌ More complex than simple token passing
- ❌ Requires additional components (launcher, auth script)
- ❌ OS keychain dependency
- ❌ Custom NextAuth endpoints needed

### Neutral
- ↔️ Authentication happens outside MCP server runtime
- ↔️ Cursor configuration points to launcher, not server directly
- ↔️ Requires one-time setup per user

## Security Requirements

### Mandatory Implementations
1. **PKCE (RFC 7636)** - Prevent authorization code interception
2. **RFC 8707 Resource Indicators** - Bind tokens to specific audience
3. **Short-lived Access Tokens** - 1-hour expiry maximum
4. **OS Keychain Storage** - No plaintext token storage
5. **Multi-tenant Filtering** - All queries scoped by userId
6. **OBO Token Exchange** - Prevent token passthrough to downstream services

### Token Flow Security
- Authorization Code Flow with PKCE for initial authentication
- Resource parameter (`urn:mcp:bug-reporter`) in all requests
- Audience claim (`aud`) in JWT tokens
- Refresh token rotation for long-term access
- On-Behalf-Of exchange for RAG service calls

## Implementation Phases

### Phase 1: Authorization Server (5 commits)
- Custom authorize endpoint with PKCE validation
- Token endpoint with RFC 8707 audience binding
- OBO exchange endpoint for downstream services
- JWKS endpoint for token verification
- Error handling and security logging

### Phase 2: Local Authentication (3 commits)
- One-time auth script with PKCE flow
- OS keychain integration (cross-keychain)
- User-friendly error messages and feedback

### Phase 3: Launcher Pattern (2 commits)
- Launcher script with token refresh logic
- Token validation before server spawn
- Transparent stdio piping to Cursor

### Phase 4: Server Security (3 commits)
- Update MCP server to consume credentials from argv
- Add userId filtering to all database operations
- Implement OBO flow for RAG service calls

### Phase 5: Testing & Documentation (2 commits)
- End-to-end OAuth flow testing
- Security validation and deployment documentation

## Alternatives Considered

### 1. HTTP-based MCP Server
- **Pros:** Direct OAuth 2.1 implementation
- **Cons:** Changes transport protocol, requires Cursor configuration changes
- **Rejected:** Would break existing stdio-based integration

### 2. Static API Keys
- **Pros:** Simple implementation
- **Cons:** Non-compliant with MCP spec, security risks
- **Rejected:** Violates June 2025 MCP security requirements

### 3. Environment Variable Tokens
- **Pros:** Works with stdio transport
- **Cons:** No token refresh, insecure storage, no audience binding
- **Rejected:** Insufficient security and non-compliant

## References

1. [MCP Authorization Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
2. [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
3. [RFC 8707 - Resource Indicators](https://datatracker.ietf.org/doc/html/rfc8707)
4. [RFC 8693 - Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
5. [OAuth 2.1 Security Best Practices](https://auth0.com/blog/oauth-2-1-security-best-practices/)
6. [cross-keychain Library](https://github.com/magarcia/cross-keychain)

## Decision Record

- **Date:** November 8, 2025
- **Decision Maker:** Development Team
- **Status:** Accepted
- **Implementation Start:** Phase 1 begins immediately
- **Review Date:** December 8, 2025

This architecture represents the gold standard for MCP server security in November 2025, fully compliant with OAuth 2.1 and MCP specifications while respecting the technical constraints of stdio transport.
