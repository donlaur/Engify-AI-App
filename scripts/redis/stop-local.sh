#!/bin/bash

# Stop Local Redis Container
# Stops the Redis container used for local development

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Stop local Redis
stop_local_redis
