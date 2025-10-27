#!/bin/bash

# API Smoke Tests
# Quick tests to verify all API endpoints are responding

set -e

BASE_URL="${BASE_URL:-http://localhost:3005}"
API_VERSION="${API_VERSION:-v1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
TOTAL=0

echo -e "${BLUE}🧪 Running API Smoke Tests${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}API Version: $API_VERSION${NC}"
echo "=================================="
echo ""

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4
  local data=$5

  TOTAL=$((TOTAL + 1))
  
  echo -n "Testing: $description... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" 2>/dev/null || echo "000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null || echo "000")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
  fi
}

# Health Check
echo -e "${YELLOW}Health Checks${NC}"
test_endpoint "GET" "/api/health" "200" "Health check endpoint"
echo ""

# Prompts API
echo -e "${YELLOW}Prompts API${NC}"
test_endpoint "GET" "/api/prompts" "200" "Get all prompts"
test_endpoint "GET" "/api/prompts?category=development" "200" "Get prompts by category"
test_endpoint "GET" "/api/prompts?search=code" "200" "Search prompts"
test_endpoint "GET" "/api/prompts?limit=10" "200" "Get prompts with limit"
echo ""

# Stats API
echo -e "${YELLOW}Stats API${NC}"
test_endpoint "GET" "/api/stats" "200" "Get platform statistics"
echo ""

# Test Connection API
echo -e "${YELLOW}Test Connection API${NC}"
test_endpoint "GET" "/api/test-connection" "200" "Check API key configuration"
echo ""

# Chat API (should require data)
echo -e "${YELLOW}Chat API${NC}"
test_endpoint "POST" "/api/chat" "400" "Chat without message (should fail)" ""
test_endpoint "POST" "/api/chat" "200" "Chat with message" '{"message":"Hello"}'
echo ""

# Auth API
echo -e "${YELLOW}Auth API${NC}"
test_endpoint "POST" "/api/auth/signup" "400" "Signup without data (should fail)" ""
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
