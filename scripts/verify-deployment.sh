#!/bin/bash

# Deployment Verification Script
# Tests critical endpoints after deployment

echo "🚀 Verifying Engify.ai Deployment..."
echo ""

DOMAIN="${1:-https://engify.ai}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local url=$1
  local name=$2
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" -eq 200 ]; then
    echo -e "${GREEN}✓${NC} $name - $url"
  else
    echo -e "${RED}✗${NC} $name - $url (Status: $status)"
  fi
}

echo "Testing public pages..."
test_endpoint "$DOMAIN/" "Homepage"
test_endpoint "$DOMAIN/library" "Library"
test_endpoint "$DOMAIN/for-directors" "For Directors"
test_endpoint "$DOMAIN/for-engineers" "For Engineers"
test_endpoint "$DOMAIN/for-managers" "For Managers"
test_endpoint "$DOMAIN/for-c-level" "For C-Level"
test_endpoint "$DOMAIN/built-in-public" "Built in Public"
test_endpoint "$DOMAIN/patterns" "Patterns"
test_endpoint "$DOMAIN/learn" "Learn"
test_endpoint "$DOMAIN/blog" "Blog"
test_endpoint "$DOMAIN/pricing" "Pricing"

echo ""
echo "Testing auth pages..."
test_endpoint "$DOMAIN/login" "Login"
test_endpoint "$DOMAIN/signup" "Signup"

echo ""
echo "Testing API health..."
test_endpoint "$DOMAIN/api/health" "Health Check"

echo ""
echo "✅ Verification complete!"
