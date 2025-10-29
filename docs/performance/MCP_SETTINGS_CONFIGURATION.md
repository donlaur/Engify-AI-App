# MCP Settings for MongoDB Performance Testing

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# MongoDB MCP Server Configuration
MONGODB_MCP_SERVER_ENABLED=true
MONGODB_MCP_SERVER_PORT=3001
MONGODB_MCP_SERVER_HOST=localhost

# MongoDB Performance Advisor Settings
MONGODB_PERFORMANCE_ADVISOR_ENABLED=true
MONGODB_PROFILING_LEVEL=2
MONGODB_SLOW_QUERY_THRESHOLD=100

# MCP Server Authentication
MCP_SERVER_AUTH_TOKEN=your-secure-token-here
MCP_SERVER_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Performance Testing Configuration
MONGODB_LOAD_TEST_ENABLED=true
MONGODB_LOAD_TEST_DURATION=300000
MONGODB_LOAD_TEST_CONCURRENT_USERS=10
```

## MCP Server Configuration File

Create `mcp-server-config.json`:

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["@mongodb/mcp-server"],
      "env": {
        "MONGODB_URI": "${MONGODB_URI}",
        "MCP_SERVER_PORT": "3001",
        "MCP_SERVER_HOST": "localhost",
        "MCP_SERVER_AUTH_TOKEN": "${MCP_SERVER_AUTH_TOKEN}"
      }
    }
  },
  "tools": {
    "mongodb-performance": {
      "enabled": true,
      "endpoints": [
        "get-performance-recommendations",
        "analyze-query-performance",
        "get-index-usage-stats",
        "run-load-tests"
      ]
    }
  },
  "performance": {
    "profiling": {
      "enabled": true,
      "slowQueryThreshold": 100,
      "sampleRate": 1.0
    },
    "monitoring": {
      "enabled": true,
      "metricsInterval": 5000,
      "retentionDays": 30
    }
  }
}
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "mcp:start": "npx @mongodb/mcp-server",
    "mcp:test": "npm run test:mongodb-performance",
    "mcp:recommendations": "tsx scripts/performance/get-recommendations.ts",
    "mcp:analyze": "tsx scripts/performance/analyze-query.ts",
    "mcp:load-test": "tsx scripts/performance/mongodb-load-test.ts",
    "mcp:monitor": "tsx scripts/performance/monitor-performance.ts"
  }
}
```

## MCP Client Configuration

Create `mcp-client-config.json`:

```json
{
  "servers": {
    "mongodb": {
      "url": "http://localhost:3001",
      "auth": {
        "type": "token",
        "token": "${MCP_SERVER_AUTH_TOKEN}"
      },
      "capabilities": [
        "performance-analysis",
        "query-optimization",
        "index-recommendations",
        "load-testing"
      ]
    }
  },
  "tools": {
    "performance-advisor": {
      "server": "mongodb",
      "enabled": true,
      "config": {
        "autoOptimize": false,
        "recommendationThreshold": 0.8,
        "maxRecommendations": 10
      }
    }
  }
}
```

## Docker Compose for MCP Server (Optional)

Create `docker-compose.mcp.yml`:

```yaml
version: '3.8'

services:
  mongodb-mcp-server:
    image: mongodb/mcp-server:latest
    ports:
      - '3001:3001'
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - MCP_SERVER_PORT=3001
      - MCP_SERVER_HOST=0.0.0.0
      - MCP_SERVER_AUTH_TOKEN=${MCP_SERVER_AUTH_TOKEN}
    volumes:
      - ./mcp-server-config.json:/app/config.json
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7.0
    ports:
      - '27017:27017'
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

## Quick Setup Commands

```bash
# 1. Install MCP Server
npm install -g @mongodb/mcp-server

# 2. Generate auth token
openssl rand -base64 32

# 3. Add to .env.local
echo "MCP_SERVER_AUTH_TOKEN=$(openssl rand -base64 32)" >> .env.local

# 4. Start MCP Server
npm run mcp:start

# 5. Test connection
curl -H "Authorization: Bearer $MCP_SERVER_AUTH_TOKEN" \
     http://localhost:3001/health

# 6. Run performance tests
npm run mcp:load-test
```

## Environment Variables Summary

| Variable                              | Description                   | Required | Default                         |
| ------------------------------------- | ----------------------------- | -------- | ------------------------------- |
| `MONGODB_MCP_SERVER_ENABLED`          | Enable MCP server             | Yes      | `true`                          |
| `MONGODB_MCP_SERVER_PORT`             | MCP server port               | No       | `3001`                          |
| `MONGODB_MCP_SERVER_HOST`             | MCP server host               | No       | `localhost`                     |
| `MONGODB_PERFORMANCE_ADVISOR_ENABLED` | Enable performance advisor    | Yes      | `true`                          |
| `MONGODB_PROFILING_LEVEL`             | MongoDB profiling level (0-2) | No       | `2`                             |
| `MONGODB_SLOW_QUERY_THRESHOLD`        | Slow query threshold (ms)     | No       | `100`                           |
| `MCP_SERVER_AUTH_TOKEN`               | Authentication token          | Yes      | -                               |
| `MCP_SERVER_ALLOWED_ORIGINS`          | Allowed CORS origins          | No       | `localhost:3000,localhost:3001` |
| `MONGODB_LOAD_TEST_ENABLED`           | Enable load testing           | No       | `true`                          |
| `MONGODB_LOAD_TEST_DURATION`          | Load test duration (ms)       | No       | `300000`                        |
| `MONGODB_LOAD_TEST_CONCURRENT_USERS`  | Concurrent users              | No       | `10`                            |

## Testing Commands

```bash
# Test MCP server connection
curl -H "Authorization: Bearer $MCP_SERVER_AUTH_TOKEN" \
     http://localhost:3001/health

# Get performance recommendations
curl -H "Authorization: Bearer $MCP_SERVER_AUTH_TOKEN" \
     -X POST http://localhost:3001/tools/get-performance-recommendations

# Analyze specific query
curl -H "Authorization: Bearer $MCP_SERVER_AUTH_TOKEN" \
     -X POST http://localhost:3001/tools/analyze-query-performance \
     -H "Content-Type: application/json" \
     -d '{"query": {"email": "test@example.com"}}'

# Run load test
curl -H "Authorization: Bearer $MCP_SERVER_AUTH_TOKEN" \
     -X POST http://localhost:3001/tools/run-load-tests
```

## Integration with Your App

Add this to your existing API routes:

```typescript
// src/lib/mongodb/mcp-client.ts
export class MCPClient {
  private baseUrl: string;
  private authToken: string;

  constructor() {
    this.baseUrl =
      process.env.MONGODB_MCP_SERVER_HOST || 'http://localhost:3001';
    this.authToken = process.env.MCP_SERVER_AUTH_TOKEN || '';
  }

  async getPerformanceRecommendations() {
    const response = await fetch(
      `${this.baseUrl}/tools/get-performance-recommendations`,
      {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.json();
  }
}
```

This gives you everything you need to set up MongoDB MCP performance testing! 🚀
