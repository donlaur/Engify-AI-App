#!/bin/bash
# Shared configuration and constants
# Source this file in scripts that need consistent configuration

# AWS Configuration
export AWS_REGION="${AWS_REGION:-us-east-2}"
export AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"

# Lambda Functions
export LAMBDA_RAG_FUNCTION="${LAMBDA_RAG_FUNCTION:-engify-rag}"
export LAMBDA_MULTI_AGENT_FUNCTION="${LAMBDA_MULTI_AGENT_FUNCTION:-engify-ai-integration-workbench}"
export LAMBDA_TIMEOUT="${LAMBDA_TIMEOUT:-300}"
export LAMBDA_MEMORY="${LAMBDA_MEMORY:-1024}"

# Redis Configuration
export REDIS_HOST="${REDIS_HOST:-localhost}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_PASSWORD="${REDIS_PASSWORD:-}"
export REDIS_DB="${REDIS_DB:-0}"
export REDIS_CONTAINER_NAME="${REDIS_CONTAINER_NAME:-engify-redis}"
export REDIS_IMAGE="${REDIS_IMAGE:-redis:7-alpine}"

# API Endpoints
export API_BASE_URL="${API_BASE_URL:-http://localhost:3005}"
export PROD_URL="${PROD_URL:-https://engify.ai}"
export API_VERSION="${API_VERSION:-v1}"

# Timeouts (in seconds)
export REDIS_STARTUP_TIMEOUT="${REDIS_STARTUP_TIMEOUT:-30}"
export HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-10}"
export DATABASE_CONNECTIVITY_TIMEOUT="${DATABASE_CONNECTIVITY_TIMEOUT:-5}"
export DEPLOYMENT_TIMEOUT="${DEPLOYMENT_TIMEOUT:-600}"

# Database
export MONGODB_HOST="${MONGODB_HOST:-localhost}"
export MONGODB_PORT="${MONGODB_PORT:-27017}"

# Deployment
export DEPLOYMENT_REGION="${AWS_REGION}"
export SERVICE_NAME="${SERVICE_NAME:-engify-rag-service}"
