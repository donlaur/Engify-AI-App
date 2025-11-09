# Engify MCP Server Launcher

The launcher script ties everything together - it reads your authentication, validates it, and starts the MCP server with proper credentials.

## How It Works

1. **Read Authentication**: Reads `~/.engify-mcp-auth.json`
2. **Validate Token**: Checks JWT signature and expiry
3. **Start Server**: Launches MCP server with user credentials
4. **Multi-tenant Security**: Ensures you only access your own data

## Usage

### Start MCP Server (Recommended)
```bash
pnpm start
```
This uses the launcher which handles authentication automatically.

### Start Server Directly (Advanced)
```bash
pnpm start:server <userId> <accessToken>
```
Only use this if you know what you're doing.

## Authentication Flow

```
pnpm auth → Generate token → Store in ~/.engify-mcp-auth.json
pnpm start → Read token → Validate → Start server with credentials
```

## Security Features

- ✅ **JWT Validation**: Verifies token signature and expiry
- ✅ **Multi-tenant Isolation**: Only accesses your bug reports
- ✅ **Auto-Refresh**: Prompts for new token when expired
- ✅ **Secure Process**: Credentials passed via command line, not env vars

## IDE Configuration

### Cursor / VS Code
Add to your MCP configuration:

```json
{
  "mcpServers": {
    "engify": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/path/to/mcp-server"
    }
  }
}
```

## Troubleshooting

### "No authentication found"
```bash
pnpm auth
```

### "Token expired"
```bash
pnpm auth generate
```

### "Invalid token signature"
```bash
pnpm auth generate
```

### Server won't start
1. Check authentication: `pnpm auth status`
2. Verify MongoDB connection
3. Check Node.js version (18+)

## File Locations

- **Auth Config**: `~/.engify-mcp-auth.json`
- **Launcher**: `engify-mcp-launcher.ts`
- **Server**: `server.js`
- **Logs**: Console output

## Environment Variables

- `NEXTAUTH_SECRET`: JWT secret for token validation
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Express server port (default: 3001)

## Development

### Test Launcher
```bash
tsx engify-mcp-launcher.ts
```

### Test Server Directly
```bash
node server.js test-user-id test-token
```

### Debug Mode
```bash
DEBUG=* pnpm start
```

## Next Steps

Once the launcher is working:
1. Configure your IDE with the MCP server
2. Test with `@Engify get new bug reports`
3. Verify multi-tenant isolation
4. Integrate with RAG service for semantic search

## Security Notes

- Tokens expire after 1 hour for security
- Launcher validates all tokens before starting server
- MongoDB queries are filtered by userId
- No credentials are stored in environment variables
