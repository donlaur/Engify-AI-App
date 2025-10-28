#!/bin/bash

# Redis Health Check
# Checks Redis connection, health, and provides detailed status information

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --queue)
            QUEUE_CHECK=true
            shift
            ;;
        --cache)
            CACHE_CHECK=true
            shift
            ;;
        --sessions)
            SESSION_CHECK=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run health check
check_redis_health

# Additional checks based on options
if [ "$QUEUE_CHECK" = true ]; then
    echo ""
    print_status "Checking message queue health..."
    
    # Check message queue keys
    QUEUE_KEYS=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "mq:*" | wc -l)
    print_status "Message queue keys: $QUEUE_KEYS"
    
    # Check queue stats
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT exists "mq:stats:messaging" > /dev/null; then
        print_success "Message queue statistics available"
    else
        print_warning "No message queue statistics found"
    fi
fi

if [ "$CACHE_CHECK" = true ]; then
    echo ""
    print_status "Checking cache health..."
    
    # Check cache keys
    CACHE_KEYS=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "cache:*" | wc -l)
    print_status "Cache keys: $CACHE_KEYS"
    
    # Check cache hit rate
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT exists "cache:stats" > /dev/null; then
        print_success "Cache statistics available"
    else
        print_warning "No cache statistics found"
    fi
fi

if [ "$SESSION_CHECK" = true ]; then
    echo ""
    print_status "Checking session store health..."
    
    # Check session keys
    SESSION_KEYS=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "session:*" | wc -l)
    print_status "Active sessions: $SESSION_KEYS"
    
    # Check session TTL
    if [ "$SESSION_KEYS" -gt 0 ]; then
        FIRST_SESSION=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "session:*" | head -1)
        TTL=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT ttl "$FIRST_SESSION")
        print_status "Sample session TTL: $TTL seconds"
    fi
fi

if [ "$VERBOSE" = true ]; then
    echo ""
    print_status "Detailed Redis Information:"
    echo "=============================="
    
    # Server info
    echo ""
    echo "Server Information:"
    redis-cli -h $REDIS_HOST -p $REDIS_PORT info server | grep -E "(redis_version|redis_mode|os|arch_bits|uptime_in_seconds|uptime_in_days|connected_clients|blocked_clients)"
    
    # Memory info
    echo ""
    echo "Memory Information:"
    redis-cli -h $REDIS_HOST -p $REDIS_PORT info memory | grep -E "(used_memory_human|used_memory_peak_human|maxmemory_human|mem_fragmentation_ratio)"
    
    # Stats info
    echo ""
    echo "Statistics:"
    redis-cli -h $REDIS_HOST -p $REDIS_PORT info stats | grep -E "(total_commands_processed|instantaneous_ops_per_sec|keyspace_hits|keyspace_misses|expired_keys|evicted_keys)"
    
    # Keyspace info
    echo ""
    echo "Keyspace Information:"
    redis-cli -h $REDIS_HOST -p $REDIS_PORT info keyspace
fi
