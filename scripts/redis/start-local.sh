#!/bin/bash

# Start Local Redis Container
# Starts a Redis container using Docker for local development

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
CONTAINER_NAME="engify-redis"

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

# Start local Redis
start_local_redis
