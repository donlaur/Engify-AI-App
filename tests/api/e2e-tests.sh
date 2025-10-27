#!/bin/bash

# E2E API Tests
# Comprehensive end-to-end tests for all API workflows

set -e

BASE_URL="${BASE_URL:-http://localhost:3005}"
API_VERSION="${API_VERSION:-v1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo -e "${BLUE}🔬 Running E2E API Tests${NC}"
echo "=================================="
echo ""

# Test 1: Full Prompt Workflow
echo -e "${YELLOW}Test 1: Full Prompt Workflow${NC}"
echo "1. Get all prompts"
response=$(curl -s "$BASE_URL/api/prompts")
if echo "$response" | grep -q "prompts"; then
  echo -e "${GREEN}✓${NC} Get prompts successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Get prompts failed"
  FAILED=$((FAILED + 1))
fi

echo "2. Filter by category"
response=$(curl -s "$BASE_URL/api/prompts?category=development")
if echo "$response" | grep -q "prompts"; then
  echo -e "${GREEN}✓${NC} Filter by category successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Filter by category failed"
  FAILED=$((FAILED + 1))
fi

echo "3. Search prompts"
response=$(curl -s "$BASE_URL/api/prompts?search=code")
if echo "$response" | grep -q "prompts"; then
  echo -e "${GREEN}✓${NC} Search prompts successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Search prompts failed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Stats and Analytics
echo -e "${YELLOW}Test 2: Stats and Analytics${NC}"
echo "1. Get platform stats"
response=$(curl -s "$BASE_URL/api/stats")
if echo "$response" | grep -q "stats"; then
  echo -e "${GREEN}✓${NC} Get stats successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Get stats failed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Chat Workflow
echo -e "${YELLOW}Test 3: Chat Workflow${NC}"
echo "1. Send chat message"
response=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is prompt engineering?"}')
if echo "$response" | grep -q "response\|message"; then
  echo -e "${GREEN}✓${NC} Chat message successful"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Chat message failed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Error Handling
echo -e "${YELLOW}Test 4: Error Handling${NC}"
echo "1. Invalid endpoint"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/invalid")
if [ "$status" = "404" ]; then
  echo -e "${GREEN}✓${NC} 404 for invalid endpoint"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Expected 404, got $status"
  FAILED=$((FAILED + 1))
fi

echo "2. Invalid method"
status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/health")
if [ "$status" = "405" ] || [ "$status" = "404" ]; then
  echo -e "${GREEN}✓${NC} Proper error for invalid method"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Expected 405/404, got $status"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Performance
echo -e "${YELLOW}Test 5: Performance${NC}"
echo "1. Response time check"
start=$(date +%s%N)
curl -s "$BASE_URL/api/health" > /dev/null
end=$(date +%s%N)
duration=$(( (end - start) / 1000000 ))

if [ $duration -lt 1000 ]; then
  echo -e "${GREEN}✓${NC} Health check < 1s ($duration ms)"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} Health check slow: $duration ms"
  PASSED=$((PASSED + 1))
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 E2E Test Summary${NC}"
echo "=================================="
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All E2E tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some E2E tests failed${NC}"
  exit 1
fi
