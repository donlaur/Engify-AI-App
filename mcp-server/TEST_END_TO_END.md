# End-to-End MCP Server Test

Follow these steps to test the complete OAuth 2.1 MCP authentication flow.

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or cloud)
- Engify dashboard access

## Step 1: Setup Environment

```bash
cd mcp-server

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
NEXTAUTH_SECRET=your-secret-here
MONGODB_URI=mongodb://localhost:27017/engify
```

## Step 2: Authenticate MCP Server

```bash
# Generate MCP token
pnpm auth

# This will:
# 1. Open browser to https://engify.ai/dashboard?ref=mcp-auth
# 2. Show modal to generate token
# 3. Auto-copy token to clipboard
# 4. Store token in ~/.engify-mcp-auth.json
```

## Step 3: Test Authentication Status

```bash
# Check if token is valid
pnpm auth status

# Should show:
# ✅ Token found
# User ID: your-user-id
# Expires in: X hours
# Created: timestamp
```

## Step 4: Start MCP Server

```bash
# Start with launcher (handles authentication)
pnpm start

# Should show:
# 🚀 Starting Engify MCP Server...
# User: your-user-id
# Token expires: timestamp
# 
# ✅ Engify MCP Server started successfully
# Press Ctrl+C to stop the server
```

## Step 5: Test MCP Tools

Keep the server running and open another terminal. Test with the MCP CLI:

```bash
# List available tools
echo '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 1}' | node -e "
const { spawn } = require('child_process');
const proc = spawn('pnpm', ['start'], { cwd: process.cwd() });
proc.stdout.on('data', data => console.log(data.toString()));
proc.stdin.write(require('fs').readFileSync(0, 'utf8'));
"

# Test get_new_bug_reports
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "get_new_bug_reports", "arguments": {"limit": 5}}, "id": 2}' | node -e "
const { spawn } = require('child_process');
const proc = spawn('pnpm', ['start'], { cwd: process.cwd() });
proc.stdout.on('data', data => console.log(data.toString()));
proc.stdin.write(require('fs').readFileSync(0, 'utf8'));
"
```

## Step 6: Test Multi-tenant Security

1. **Create test data** in MongoDB with different userIds
2. **Verify isolation** - server should only return data for authenticated user
3. **Test access control** - trying to access other users' data should fail

## Step 7: Test Token Refresh

```bash
# Wait for token to expire (1 hour) or manually edit ~/.engify-mcp-auth.json
# Set expiresAt to a past timestamp

# Try to start server
pnpm start

# Should show:
# ⚠️ Token expired. Please run "pnpm auth" to refresh.

# Generate new token
pnpm auth generate
```

## Step 8: Test Error Handling

Test various error scenarios:

```bash
# No authentication file
rm ~/.engify-mcp-auth.json
pnpm start
# Expected: ❌ No authentication found

# Invalid token
echo '{"userId":"test","accessToken":"invalid","expiresAt":123}' > ~/.engify-mcp-auth.json
pnpm start
# Expected: ❌ Invalid token signature

# Missing MongoDB
# Set invalid MONGODB_URI in .env
pnpm start
# Expected: MongoDB connection error
```

## Step 9: IDE Integration Test

### Cursor Configuration

Add to Cursor settings:

```json
{
  "mcpServers": {
    "engify": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/path/to/your/mcp-server"
    }
  }
}
```

### Test in Cursor

1. Restart Cursor
2. Open chat and type: `@Engify get new bug reports`
3. Should see your bug reports
4. Try: `@Engify get bug report details with id "your-bug-id"`

## Expected Results

✅ **Authentication Flow**: Browser opens, token generated, stored locally  
✅ **Server Startup**: Validates token, starts with credentials  
✅ **Multi-tenant Isolation**: Only user's own data returned  
✅ **Token Refresh**: Handles expired tokens gracefully  
✅ **Error Handling**: Clear error messages for all failure modes  
✅ **IDE Integration**: Works seamlessly with Cursor/VS Code  

## Troubleshooting

### "No authentication found"
```bash
pnpm auth
```

### "Token expired"
```bash
pnpm auth generate
```

### "MongoDB connection error"
- Check MONGODB_URI in .env
- Verify MongoDB is running
- Check network connectivity

### "Invalid token signature"
```bash
pnpm auth generate
```

### Server won't start
1. Check Node.js version (18+)
2. Verify all dependencies installed
3. Check environment variables
4. Look at error messages in console

## Security Validation

- ✅ Tokens expire after 1 hour
- ✅ JWT signature validation
- ✅ Multi-tenant data isolation
- ✅ No credentials in environment variables
- ✅ Secure command line parameter passing

## Performance Checks

- Server startup time: < 3 seconds
- Token validation: < 100ms
- Database queries: < 500ms
- Memory usage: < 100MB idle

## Completion Checklist

- [ ] Authentication flow works end-to-end
- [ ] Token generation and storage
- [ ] Server starts with valid credentials
- [ ] Multi-tenant data isolation verified
- [ ] Token refresh works
- [ ] Error handling comprehensive
- [ ] IDE integration functional
- [ ] Security measures validated
- [ ] Performance acceptable

Once all checks pass, the MCP server is production-ready!
