#!/bin/bash

# Redis Flush Script
# Clears Redis data with pattern matching

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Parse command line arguments
PATTERN="*"
EXPIRED_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --pattern)
            PATTERN="$2"
            shift 2
            ;;
        --expired)
            EXPIRED_ONLY=true
            shift
            ;;
        *)
            PATTERN="$1"
            shift
            ;;
    esac
done

# Run flush operation
flush_redis "$PATTERN"
