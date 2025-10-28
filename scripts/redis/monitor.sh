#!/bin/bash

# Redis Monitor Script
# Monitors Redis commands in real-time

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Parse command line arguments
DURATION=0
QUEUE_MONITOR=false
CACHE_MONITOR=false
SESSION_MONITOR=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --queue)
            QUEUE_MONITOR=true
            shift
            ;;
        --cache)
            CACHE_MONITOR=true
            shift
            ;;
        --sessions)
            SESSION_MONITOR=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Start monitoring
if [ "$QUEUE_MONITOR" = true ]; then
    print_status "Monitoring message queue operations..."
    monitor_redis | grep -E "(mq:|ZADD|ZREM|HSET|HGET)"
elif [ "$CACHE_MONITOR" = true ]; then
    print_status "Monitoring cache operations..."
    monitor_redis | grep -E "(cache:|GET|SET|DEL|EXPIRE)"
elif [ "$SESSION_MONITOR" = true ]; then
    print_status "Monitoring session operations..."
    monitor_redis | grep -E "(session:|SETEX|TTL|DEL)"
else
    monitor_redis
fi
