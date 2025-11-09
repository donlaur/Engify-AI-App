# Engify MCP Server

OAuth 2.1 authenticated Model Context Protocol (MCP) server for Engify bug reporting and context management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Engify account (Google, GitHub, or email)
- MongoDB connection (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App/mcp-server

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Authenticate the server
pnpm auth

# Start the MCP server
pnpm start
```

### IDE Configuration

Add to your Cursor or VS Code settings:

```json
{
  "mcpServers": {
    "engify": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/path/to/engify-mcp-server"
    }
  }
}
```

Restart your IDE and start using:
```
@Engify get new bug reports
@Engify get bug report details with id "your-bug-id"
```

## 📋 Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_new_bug_reports` | Get new bug reports from your dashboard | `limit` (optional, default: 10) |
| `get_bug_report_details` | Get full details of a specific bug report | `id` (required) |
| `mark_bug_sent_to_ide` | Mark a bug report as sent to IDE | `id` (required) |
| `search_similar_bugs` | Search for similar bug reports | `description` (required), `limit` (optional) |

## 🔐 Authentication

The MCP server uses OAuth 2.1 with PKCE for secure authentication:

1. **Run `pnpm auth`** - Opens dashboard with `?ref=mcp-auth`
2. **Generate token** - Click "Generate MCP Token" in modal
3. **Auto-copy** - Token copied to clipboard automatically
4. **Stored locally** - Token saved in `~/.engify-mcp-auth.json`
5. **Auto-refresh** - Prompts for new token when expired

### Token Management

```bash
# Check authentication status
pnpm auth status

# Generate new token
pnpm auth generate

# Check/refresh existing token
pnpm auth check
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   IDE (Cursor)  │───▶│  MCP Launcher    │───▶│  OAuth Server   │
│                 │    │                  │    │                  │
│ @Engify commands│    │ Token validation │    │ Token generation│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MCP Server    │
                       │                  │
                       │ Bug report tools│
                       │ Multi-tenant DB │
                       └─────────────────┘
```

### Security Features

- ✅ **OAuth 2.1 Compliance**: Full PKCE implementation
- ✅ **Multi-tenant Isolation**: Users only access their own data
- ✅ **JWT Token Security**: 1-hour expiry, signature validation
- ✅ **Secure Storage**: Tokens stored locally, never in environment
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Input Validation**: All parameters validated

## 🛠️ Development

### Project Structure

```
mcp-server/
├── engify-mcp-auth.ts          # Authentication script
├── engify-mcp-launcher.ts      # Server launcher with validation
├── server.js                   # Main MCP server
├── test-setup.js              # Quick validation script
├── package.json               # Dependencies and scripts
├── .env.example               # Environment template
├── README.md                  # This file
├── AUTH_SETUP.md              # Authentication guide
├── LAUNCHER.md                # Launcher documentation
├── TEST_END_TO_END.md         # Testing guide
└── DEPLOYMENT.md              # Production deployment
```

### Scripts

```bash
# Start MCP server (with launcher)
pnpm start

# Start server directly (advanced)
pnpm start:server

# Authentication
pnpm auth              # Interactive authentication
pnpm auth status       # Check status
pnpm auth generate     # Generate new token

# Testing
pnpm test              # Run test setup
node test-setup.js     # Quick validation

# Development
pnpm dev               # Development mode
```

### Environment Variables

```bash
# JWT Configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://engify.ai

# Database
MONGODB_URI=mongodb://localhost:27017/engify

# Server
MCP_SERVER_NAME=engify-mcp-server
MCP_SERVER_VERSION=1.0.0
PORT=3001
```

## 🧪 Testing

### Quick Test

```bash
# Run the setup test
node test-setup.js

# Follow the comprehensive test guide
# See TEST_END_TO_END.md
```

### Manual Testing

1. **Authentication Test**
   ```bash
   pnpm auth status
   ```

2. **Server Startup Test**
   ```bash
   pnpm start
   # Should start successfully with valid token
   ```

3. **Tool Test**
   ```
   @Engify get new bug reports
   ```

## 📊 Monitoring

### Health Checks

```bash
# Authentication status
pnpm auth status

# Server startup test
timeout 5 pnpm start

# Database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI)"
```

### Logging

```bash
# Enable debug logging
DEBUG=* pnpm start

# Log to file
pnpm start 2>&1 | tee engify-mcp.log
```

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "No authentication found" | Run `pnpm auth` |
| "Token expired" | Run `pnpm auth generate` |
| "Server won't start" | Check Node.js version, dependencies, MongoDB |
| "No data returned" | Verify userId in database, check token expiry |
| "IDE connection issues" | Check MCP configuration, restart IDE |

### Debug Commands

```bash
# Validate JWT token
node -e "
const { jwtVerify } = require('jose');
const token = 'your-token';
jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
  .then(() => console.log('✅ Token valid'))
  .catch(err => console.log('❌ Token invalid:', err));
"

# Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.log('❌ DB failed:', err));
"
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

### Production Checklist

- [ ] Strong JWT secret configured
- [ ] MongoDB with authentication enabled
- [ ] Rate limiting configured
- [ ] SSL/TLS enabled
- [ ] Backup procedures in place
- [ ] Monitoring and logging set up
- [ ] Security audit completed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./)
- 🔐 [Authentication Guide](./AUTH_SETUP.md)
- 🚀 [Launcher Guide](./LAUNCHER.md)
- 🧪 [Testing Guide](./TEST_END_TO_END.md)
- 📦 [Deployment Guide](./DEPLOYMENT.md)
- 🐛 [Issues](https://github.com/donlaur/Engify-AI-App/issues)

## 🔗 Related Projects

- [Engify Dashboard](../src/app/dashboard/) - Main web application
- [Chrome Extension](../src/chrome-extension/) - Visual bug reporting
- [OAuth Server](../src/app/api/mcp-auth/) - Authentication endpoints

---

**Built with ❤️ for the developer community**
