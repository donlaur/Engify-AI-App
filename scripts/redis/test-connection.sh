#!/bin/bash

# Redis Test Connection Script
# Tests Redis connectivity and basic operations

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Run connection test
test_connection
