#!/bin/bash

# Setup Upstash Redis Connection
# Configures Upstash Redis for production use

set -e

# Load the main redis-manager script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/redis-manager.sh"

print_status "Setting up Upstash Redis connection..."

# Check if Upstash CLI is installed
if ! command -v upstash &> /dev/null; then
    print_status "Installing Upstash CLI..."
    npm install -g @upstash/cli
fi

# Check if user is logged in
if ! upstash whoami &> /dev/null; then
    print_status "Please login to Upstash..."
    upstash login
fi

# List existing Redis databases
print_status "Existing Redis databases:"
upstash redis list

echo ""
print_status "To create a new Redis database, run:"
echo "upstash redis create engify-ai-redis --region us-east-1"

echo ""
print_status "To get connection details, run:"
echo "upstash redis list"

echo ""
print_status "After creating your database, set these environment variables:"
echo "export UPSTASH_REDIS_REST_URL=\"https://your-redis-url.upstash.io\""
echo "export UPSTASH_REDIS_REST_TOKEN=\"your-redis-token\""

echo ""
print_status "Then run this script again to test the connection:"
echo "./scripts/redis/setup-upstash.sh"

# If credentials are already set, test the connection
if [ -n "$UPSTASH_REDIS_REST_URL" ] && [ -n "$UPSTASH_REDIS_REST_TOKEN" ]; then
    echo ""
    setup_upstash
fi
