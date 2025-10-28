#!/bin/bash

# Redis Management Scripts for Engify AI App
# Provides easy Redis management for development and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-}
REDIS_DB=${REDIS_DB:-0}
CONTAINER_NAME="engify-redis"

# Upstash configuration
UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL:-}
UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN:-}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Redis is running
check_redis_running() {
    if command -v redis-cli &> /dev/null; then
        if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping &> /dev/null; then
            return 0
        fi
    fi
    return 1
}

# Function to check if Docker is available
check_docker() {
    if command -v docker &> /dev/null; then
        return 0
    else
        print_error "Docker is not installed or not in PATH"
        return 1
    fi
}

# Function to start local Redis container
start_local_redis() {
    print_status "Starting local Redis container..."
    
    if ! check_docker; then
        exit 1
    fi
    
    # Check if container already exists
    if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        if docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            print_warning "Redis container is already running"
            return 0
        else
            print_status "Starting existing Redis container..."
            docker start $CONTAINER_NAME
        fi
    else
        print_status "Creating new Redis container..."
        docker run -d \
            --name $CONTAINER_NAME \
            -p $REDIS_PORT:6379 \
            redis:7-alpine \
            redis-server --appendonly yes
    fi
    
    # Wait for Redis to be ready
    print_status "Waiting for Redis to be ready..."
    for i in {1..30}; do
        if docker exec $CONTAINER_NAME redis-cli ping &> /dev/null; then
            print_success "Redis is ready!"
            return 0
        fi
        sleep 1
    done
    
    print_error "Redis failed to start within 30 seconds"
    return 1
}

# Function to stop local Redis container
stop_local_redis() {
    print_status "Stopping local Redis container..."
    
    if ! check_docker; then
        exit 1
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        docker stop $CONTAINER_NAME
        print_success "Redis container stopped"
    else
        print_warning "Redis container is not running"
    fi
}

# Function to check Redis health
check_redis_health() {
    print_status "Checking Redis health..."
    
    if check_redis_running; then
        print_success "Redis is running and responding to ping"
        
        # Get Redis info
        if command -v redis-cli &> /dev/null; then
            echo ""
            echo "Redis Information:"
            echo "=================="
            redis-cli -h $REDIS_HOST -p $REDIS_PORT info server | grep -E "(redis_version|uptime_in_seconds|connected_clients)"
            redis-cli -h $REDIS_HOST -p $REDIS_PORT info memory | grep -E "(used_memory_human|maxmemory_human)"
            redis-cli -h $REDIS_HOST -p $REDIS_PORT info stats | grep -E "(total_commands_processed|instantaneous_ops_per_sec)"
        fi
    else
        print_error "Redis is not running or not accessible"
        return 1
    fi
}

# Function to monitor Redis
monitor_redis() {
    print_status "Starting Redis monitoring..."
    
    if ! check_redis_running; then
        print_error "Redis is not running"
        exit 1
    fi
    
    if command -v redis-cli &> /dev/null; then
        print_status "Press Ctrl+C to stop monitoring"
        redis-cli -h $REDIS_HOST -p $REDIS_PORT monitor
    else
        print_error "redis-cli is not installed"
        exit 1
    fi
}

# Function to test Redis connection
test_connection() {
    print_status "Testing Redis connection..."
    
    if check_redis_running; then
        print_success "Connection test passed"
        
        # Test basic operations
        redis-cli -h $REDIS_HOST -p $REDIS_PORT set test_key "test_value"
        VALUE=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT get test_key)
        redis-cli -h $REDIS_HOST -p $REDIS_PORT del test_key
        
        if [ "$VALUE" = "test_value" ]; then
            print_success "Read/write operations working correctly"
        else
            print_error "Read/write operations failed"
            return 1
        fi
    else
        print_error "Connection test failed"
        return 1
    fi
}

# Function to flush Redis data
flush_redis() {
    local pattern=${1:-"*"}
    
    print_warning "This will delete all Redis data matching pattern: $pattern"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if check_redis_running; then
            if [ "$pattern" = "*" ]; then
                redis-cli -h $REDIS_HOST -p $REDIS_PORT flushdb
                print_success "All data flushed from database $REDIS_DB"
            else
                redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "$pattern" | xargs -r redis-cli -h $REDIS_HOST -p $REDIS_PORT del
                print_success "Data matching pattern '$pattern' flushed"
            fi
        else
            print_error "Redis is not running"
            return 1
        fi
    else
        print_status "Operation cancelled"
    fi
}

# Function to setup Upstash connection
setup_upstash() {
    print_status "Setting up Upstash Redis connection..."
    
    if [ -z "$UPSTASH_REDIS_REST_URL" ] || [ -z "$UPSTASH_REDIS_REST_TOKEN" ]; then
        print_error "Upstash credentials not found in environment variables"
        print_status "Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
        return 1
    fi
    
    # Test Upstash connection
    print_status "Testing Upstash connection..."
    response=$(curl -s -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
        "$UPSTASH_REDIS_REST_URL/ping")
    
    if [ "$response" = "PONG" ]; then
        print_success "Upstash connection successful"
        
        # Create .env file with Upstash configuration
        cat > .env.upstash << EOF
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN

# Use Upstash for production
REDIS_HOST=upstash
REDIS_PORT=443
REDIS_PASSWORD=
REDIS_DB=0
EOF
        
        print_success "Upstash configuration saved to .env.upstash"
    else
        print_error "Upstash connection failed: $response"
        return 1
    fi
}

# Function to run performance test
performance_test() {
    print_status "Running Redis performance test..."
    
    if ! check_redis_running; then
        print_error "Redis is not running"
        exit 1
    fi
    
    if command -v redis-benchmark &> /dev/null; then
        print_status "Running benchmark (this may take a few minutes)..."
        redis-benchmark -h $REDIS_HOST -p $REDIS_PORT -q -n 10000 -c 10
    else
        print_warning "redis-benchmark is not installed, running basic test..."
        
        # Basic performance test
        start_time=$(date +%s.%N)
        for i in {1..1000}; do
            redis-cli -h $REDIS_HOST -p $REDIS_PORT set "test_key_$i" "test_value_$i" > /dev/null
        done
        end_time=$(date +%s.%N)
        
        duration=$(echo "$end_time - $start_time" | bc)
        ops_per_sec=$(echo "1000 / $duration" | bc)
        
        print_success "Basic performance test completed"
        print_status "Operations per second: $ops_per_sec"
        
        # Cleanup
        for i in {1..1000}; do
            redis-cli -h $REDIS_HOST -p $REDIS_PORT del "test_key_$i" > /dev/null
        done
    fi
}

# Function to show Redis keys
show_keys() {
    local pattern=${1:-"*"}
    
    print_status "Showing Redis keys matching pattern: $pattern"
    
    if check_redis_running; then
        redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "$pattern" | head -20
    else
        print_error "Redis is not running"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Redis Management Script for Engify AI App"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start-local     Start local Redis container"
    echo "  stop-local      Stop local Redis container"
    echo "  health-check    Check Redis health and status"
    echo "  monitor         Monitor Redis commands in real-time"
    echo "  test-connection Test Redis connection and operations"
    echo "  flush [pattern] Flush Redis data (default: all)"
    echo "  setup-upstash   Setup Upstash Redis connection"
    echo "  performance     Run Redis performance test"
    echo "  keys [pattern]  Show Redis keys (default: all)"
    echo "  help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  REDIS_HOST      Redis host (default: localhost)"
    echo "  REDIS_PORT      Redis port (default: 6379)"
    echo "  REDIS_PASSWORD  Redis password (default: none)"
    echo "  REDIS_DB        Redis database (default: 0)"
    echo ""
    echo "Examples:"
    echo "  $0 start-local"
    echo "  $0 health-check"
    echo "  $0 flush 'mq:*'"
    echo "  $0 keys 'cache:*'"
}

# Main script logic
case "${1:-help}" in
    start-local)
        start_local_redis
        ;;
    stop-local)
        stop_local_redis
        ;;
    health-check)
        check_redis_health
        ;;
    monitor)
        monitor_redis
        ;;
    test-connection)
        test_connection
        ;;
    flush)
        flush_redis "$2"
        ;;
    setup-upstash)
        setup_upstash
        ;;
    performance)
        performance_test
        ;;
    keys)
        show_keys "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
