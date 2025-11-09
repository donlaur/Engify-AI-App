# Engify MCP Server Authentication Setup

This guide explains how to authenticate your local MCP server with Engify using OAuth 2.1.

## Prerequisites

- Node.js 18+ installed
- Engify account (Google, GitHub, or email/password)

## One-Time Setup

### Step 1: Install Dependencies

```bash
cd mcp-server
pnpm install
```

### Step 2: Run Authentication Script

```bash
pnpm auth
```

### Step 3: Complete Browser Authentication

1. The script will automatically open your browser
2. Log in with your Engify account
3. Approve the MCP server access request
4. You'll see a success message in the browser
5. Return to your terminal - authentication is complete!

## What Happens During Authentication

1. **PKCE Generation**: Script generates a secure code verifier/challenge pair
2. **Local Server**: Starts a temporary HTTP server on a random port
3. **Browser OAuth**: Opens engify.ai with OAuth 2.1 parameters
4. **Secure Callback**: Handles the authorization code securely
5. **Token Exchange**: Exchanges code for access/refresh tokens
6. **Keychain Storage**: Stores refresh token in your OS keychain

## Security Features

- ✅ **OAuth 2.1 Compliance**: Full PKCE implementation
- ✅ **RFC 8707 Resource Indicators**: Tokens bound to MCP bug reporter
- ✅ **Secure Storage**: Refresh tokens stored in OS keychain
- ✅ **Short-lived Access Tokens**: 1-hour expiry for security
- ✅ **CSRF Protection**: State parameter prevents attacks
- ✅ **Localhost Only**: Callback only accepts local redirects

## Token Storage

The refresh token is stored securely in your OS keychain:
- **macOS**: Keychain Access
- **Windows**: Credential Manager  
- **Linux**: Secret Service API

## Re-authentication

If you need to re-authenticate (e.g., on a new machine):

```bash
pnpm auth
```

The script will detect existing credentials and ask if you want to replace them.

## Troubleshooting

### "Browser didn't open"
Manually visit the URL shown in the terminal.

### "Authentication timeout"
The authentication window expires after 5 minutes. Run `pnpm auth` again.

### "Invalid state parameter"
This is a security protection. Start the authentication process again.

### "Keychain access denied"
Grant the script permission to access your keychain when prompted.

## Verification

After authentication, you can verify the setup:

```bash
# Check if token is stored (macOS)
security find-generic-password -s "engify-mcp-server" -a "refresh-token"

# Or simply run the MCP server - it will validate tokens on startup
pnpm start
```

## Next Steps

Once authenticated:
1. Configure your IDE (Cursor/VS Code) to use the MCP server
2. The launcher script will automatically refresh tokens
3. Your MCP server can now securely access your bug reports

## Security Notes

- The refresh token allows access to your Engify data
- Never share your keychain credentials
- Tokens are automatically rotated on refresh
- Access tokens expire after 1 hour for security

## Need Help?

- Check the [main README](./README.md) for full setup
- Review the [OAuth architecture](../docs/adr/006-mcp-oauth-architecture.md)
- Open an issue for authentication problems
