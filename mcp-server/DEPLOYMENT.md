# MCP Server Deployment Guide

Complete guide for deploying the Engify MCP server to production.

## Production Architecture

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

## Environment Setup

### Production Environment Variables

```bash
# JWT Configuration
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://engify.ai

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/engify

# Server Configuration
MCP_SERVER_NAME=engify-mcp-server
MCP_SERVER_VERSION=1.0.0
PORT=3001

# OAuth Configuration
CLIENT_ID=engify-mcp-client
TOKEN_EXPIRY=3600
```

### Security Configuration

1. **JWT Secret**: Use a strong, unique secret
2. **MongoDB**: Enable authentication and SSL
3. **Network**: Restrict database access to application servers
4. **Tokens**: 1-hour expiry for access tokens

## Deployment Options

### Option 1: User Self-Hosted (Recommended)

Users run the MCP server locally:

```bash
# Clone repository
git clone https://github.com/donlaur/Engify-AI-App.git
cd Engify-AI-App/mcp-server

# Install dependencies
pnpm install

# Authenticate
pnpm auth

# Start server
pnpm start
```

**Pros:**
- No infrastructure cost
- User controls their data
- Simple setup
- Works offline

**Cons:**
- Requires Node.js installation
- User manages updates

### Option 2: Cloud-Hosted Service

Host a centralized service:

```bash
# Deploy to Vercel/ Railway/Render
# Users connect via WebSocket or HTTP API
```

**Pros:**
- No user installation required
- Centralized updates
- Better analytics

**Cons:**
- Infrastructure costs
- Privacy concerns
- Single point of failure

## IDE Configuration

### Cursor Setup

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

### VS Code Setup

```json
{
  "mcp.servers": {
    "engify": {
      "command": "pnpm",
      "args": ["start"],
      "cwd": "/path/to/engify-mcp-server"
    }
  }
}
```

## User Installation Guide

### Prerequisites

- Node.js 18+ installed
- Engify account
- MongoDB connection (if self-hosting)

### Installation Steps

1. **Download MCP Server**
   ```bash
   git clone https://github.com/donlaur/Engify-AI-App.git
   cd Engify-AI-App/mcp-server
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Authenticate**
   ```bash
   pnpm auth
   ```

5. **Configure IDE**
   - Add MCP server to Cursor/VS Code settings
   - Restart IDE

6. **Test Connection**
   ```
   @Engify get new bug reports
   ```

## Monitoring and Logging

### Application Logs

```bash
# Enable debug logging
DEBUG=* pnpm start

# Log to file
pnpm start 2>&1 | tee engify-mcp.log
```

### Key Metrics to Monitor

- Server startup time
- Token validation success rate
- Database query performance
- Error rates by type
- Active user count

### Health Checks

```bash
# Test authentication
pnpm auth status

# Test server startup
timeout 5 pnpm start

# Test database connection
node -e "require('./mongoose').connect(process.env.MONGODB_URI)"
```

## Security Considerations

### Token Security

- ✅ 1-hour token expiry
- ✅ JWT signature validation
- ✅ Secure local storage
- ✅ No credentials in environment

### Database Security

- ✅ Multi-tenant isolation
- ✅ User-specific filtering
- ✅ Input validation
- ✅ Connection encryption

### Network Security

- ✅ Local-only token storage
- ✅ HTTPS for OAuth endpoints
- ✅ CORS restrictions
- ✅ Rate limiting

## Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check NEXTAUTH_SECRET
   - Verify dashboard URL
   - Clear browser cache

2. **Server Won't Start**
   - Check Node.js version
   - Verify dependencies
   - Check MongoDB connection

3. **No Data Returned**
   - Verify userId in database
   - Check token expiry
   - Test database queries

4. **IDE Connection Issues**
   - Check MCP server configuration
   - Verify file paths
   - Restart IDE

### Debug Commands

```bash
# Check authentication
pnpm auth status

# Test server directly
node server.js test-user-id test-token

# Validate JWT
node -e "
const { jwtVerify } = require('jose');
const token = 'your-token';
jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
  .then(() => console.log('✅ Token valid'))
  .catch(err => console.log('❌ Token invalid:', err));
"

# Test database
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.log('❌ DB failed:', err));
"
```

## Performance Optimization

### Database Optimization

- Index on `userId` for multi-tenant queries
- Index on `status` for bug report filtering
- Connection pooling for concurrent users
- Query result caching where appropriate

### Server Optimization

- Lazy load dependencies
- Optimize JWT verification
- Stream large result sets
- Implement request caching

### Network Optimization

- Compress responses
- Use HTTP/2 where available
- Optimize token size
- Batch operations when possible

## Scaling Considerations

### Horizontal Scaling

- Stateless server design
- Load balancer configuration
- Database read replicas
- Caching layer (Redis)

### Vertical Scaling

- Memory optimization
- CPU utilization monitoring
- Database connection limits
- Resource allocation

## Backup and Recovery

### Data Backup

- MongoDB automated backups
- Configuration file backups
- User token rotation plan
- Disaster recovery procedures

### Recovery Procedures

1. Database restoration
2. Configuration reload
3. User re-authentication
4. Service validation

## Compliance

### Data Privacy

- User data isolation
- Secure token handling
- GDPR compliance
- Data retention policies

### Security Standards

- OAuth 2.1 compliance
- JWT best practices
- Multi-tenant security
- Audit logging

This deployment guide ensures the MCP server is production-ready with proper security, monitoring, and scaling considerations.
