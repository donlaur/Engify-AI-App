# Engify MCP Server Authentication Setup

This guide explains how to authenticate your local MCP server with Engify using your existing dashboard account.

## Prerequisites

- Node.js 18+ installed
- Engify account (Google, GitHub, or email/password)

## One-Time Setup

### Step 1: Install Dependencies

```bash
cd mcp-server
pnpm install
```

### Step 2: Generate MCP Token

```bash
pnpm auth
```

### Step 3: Get Token from Dashboard

1. The script will prompt you to visit your dashboard
2. Log in at https://engify.ai/dashboard
3. Go to Settings → API Keys
4. Click "Generate MCP Token"
5. Copy the generated token
6. Paste it back in the terminal

## What Happens During Authentication

1. **Token Generation**: Dashboard generates a JWT token for MCP access
2. **Local Storage**: Token is stored in `~/.engify-mcp-auth.json`
3. **Auto-Refresh**: Token is automatically refreshed when needed
4. **Secure Access**: MCP server uses token to access your bug reports

## Token Management Commands

### Check Token Status
```bash
pnpm auth status
```

### Generate New Token
```bash
pnpm auth generate
```

### Check/Refresh Token
```bash
pnpm auth check
```

## Security Features

- ✅ **JWT-based Authentication**: Secure token-based access
- ✅ **Dashboard Integration**: Uses your existing login
- ✅ **Local Storage**: Tokens stored securely in home directory
- ✅ **Auto-Expiry**: Tokens expire after 1 hour for security
- ✅ **User-Scoped**: Only accesses your own bug reports
- ✅ **No Password Storage**: Never stores your password

## Token Storage

The access token is stored locally in:
- **File Location**: `~/.engify-mcp-auth.json`
- **Format**: JSON with userId, accessToken, and expiry
- **Permissions**: Readable only by your user account

## Re-authentication

If you need to generate a new token:

```bash
pnpm auth generate
```

The script will guide you through getting a fresh token from the dashboard.

## Troubleshooting

### "Token expired"
Run `pnpm auth` to refresh your token.

### "Invalid token format"
Ensure you copied the entire token from the dashboard.

### "Permission denied"
Check file permissions on `~/.engify-mcp-auth.json`.

### "Dashboard not loading"
Check your internet connection and try https://engify.ai/dashboard

## Verification

After authentication, you can verify the setup:

```bash
# Check token status
pnpm auth status

# Test MCP server
pnpm start
```

## Next Steps

Once authenticated:
1. Configure your IDE (Cursor/VS Code) to use the MCP server
2. The server will automatically use your stored token
3. Your MCP server can now securely access your bug reports

## Security Notes

- The access token allows read/write access to your bug reports
- Never share your token file or copy it to public repositories
- Tokens automatically expire and refresh for security
- Your password is never stored locally

## Need Help?

- Check the [main README](./README.md) for full setup
- Review the [OAuth architecture](../docs/adr/006-mcp-oauth-architecture.md)
- Open an issue for authentication problems
