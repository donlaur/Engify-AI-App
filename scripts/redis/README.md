# Redis Management Scripts

This directory contains scripts for managing Redis connections, health checks, and operations for the Engify AI App.

## Redis Providers

### 1. Upstash (Recommended for Production)
- **Serverless Redis** - No infrastructure management
- **Global edge locations** - Low latency worldwide
- **Automatic backups** - Built-in persistence
- **REST API** - HTTP-based Redis operations
- **Free tier** - 10,000 requests/day

### 2. Local Redis (Development)
- **Docker container** - Easy local development
- **Redis CLI** - Direct command-line access
- **Memory-based** - Fast but not persistent

### 3. Self-hosted Redis (Advanced)
- **Full control** - Custom configuration
- **High performance** - Optimized for specific use cases
- **Complex setup** - Requires infrastructure management

## Quick Start

### Upstash Setup
```bash
# Install Upstash CLI
npm install -g @upstash/cli

# Login to Upstash
upstash login

# Create Redis database
upstash redis create engify-ai-redis --region us-east-1

# Get connection details
upstash redis list
```

### Local Development
```bash
# Start Redis with Docker
./scripts/redis/start-local.sh

# Run health check
./scripts/redis/health-check.sh

# Monitor Redis
./scripts/redis/monitor.sh
```

## Scripts Overview

- `start-local.sh` - Start local Redis container
- `stop-local.sh` - Stop local Redis container
- `health-check.sh` - Check Redis connection and health
- `monitor.sh` - Real-time Redis monitoring
- `backup.sh` - Backup Redis data
- `restore.sh` - Restore Redis data
- `flush.sh` - Clear all Redis data
- `setup-upstash.sh` - Configure Upstash connection
- `test-connection.sh` - Test Redis connectivity
- `performance-test.sh` - Run performance benchmarks

## Environment Variables

```bash
# Upstash Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Local Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Connection Settings
REDIS_CONNECTION_TIMEOUT=5000
REDIS_RETRY_DELAY=100
REDIS_MAX_RETRIES=3
```

## Usage Examples

### Message Queue Operations
```bash
# Check message queue health
./scripts/redis/health-check.sh --queue messaging

# Monitor message queue performance
./scripts/redis/monitor.sh --queue messaging --duration 60

# Clear message queue data
./scripts/redis/flush.sh --pattern "mq:*"
```

### Cache Operations
```bash
# Check cache health
./scripts/redis/health-check.sh --cache

# Monitor cache performance
./scripts/redis/monitor.sh --cache --duration 30

# Clear cache data
./scripts/redis/flush.sh --pattern "cache:*"
```

### Session Management
```bash
# Check session store health
./scripts/redis/health-check.sh --sessions

# Monitor active sessions
./scripts/redis/monitor.sh --sessions --duration 60

# Clear expired sessions
./scripts/redis/flush.sh --pattern "session:*" --expired
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Check network connectivity
   ./scripts/redis/test-connection.sh
   
   # Increase timeout
   export REDIS_CONNECTION_TIMEOUT=10000
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   ./scripts/redis/monitor.sh --memory
   
   # Clear old data
   ./scripts/redis/flush.sh --pattern "temp:*"
   ```

3. **Performance Issues**
   ```bash
   # Run performance test
   ./scripts/redis/performance-test.sh
   
   # Monitor slow queries
   ./scripts/redis/monitor.sh --slow-queries
   ```

### Health Check Endpoints

- **Redis Health**: `GET /api/health/redis`
- **Message Queue Health**: `GET /api/health/messaging`
- **Cache Health**: `GET /api/health/cache`
- **Session Health**: `GET /api/health/sessions`

## Production Considerations

### Upstash Best Practices
- Use **REST API** for serverless environments
- Implement **connection pooling** for high throughput
- Set appropriate **TTL values** for cache entries
- Monitor **rate limits** and usage quotas
- Use **multiple regions** for global distribution

### Monitoring
- Set up **alerts** for connection failures
- Monitor **memory usage** and eviction rates
- Track **response times** and throughput
- Log **error rates** and retry attempts

### Security
- Use **HTTPS** for all connections
- Implement **authentication** tokens
- Restrict **network access** to trusted sources
- Enable **audit logging** for sensitive operations
