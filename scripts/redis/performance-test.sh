#!/bin/bash

# Redis Performance Test Script
# Runs performance benchmarks and tests

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

# Run performance test
performance_test
