#!/bin/bash

# Regression Tests
# Tests to ensure no breaking changes in API behavior

set -e

BASE_URL="${BASE_URL:-http://localhost:3005}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo -e "${BLUE}🔄 Running Regression Tests${NC}"
echo "=================================="
echo ""

# Test 1: Response Format Consistency
echo -e "${YELLOW}Test 1: Response Format Consistency${NC}"

echo "1. Prompts API response structure"
response=$(curl -s "$BASE_URL/api/prompts")
if echo "$response" | jq -e '.prompts' > /dev/null 2>&1 && \
   echo "$response" | jq -e '.total' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Prompts response has correct structure"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Prompts response structure changed"
  FAILED=$((FAILED + 1))
fi

echo "2. Stats API response structure"
response=$(curl -s "$BASE_URL/api/stats")
if echo "$response" | jq -e '.stats' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Stats response has correct structure"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Stats response structure changed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Backward Compatibility
echo -e "${YELLOW}Test 2: Backward Compatibility${NC}"

echo "1. Old query parameters still work"
response=$(curl -s "$BASE_URL/api/prompts?category=development")
if echo "$response" | grep -q "prompts"; then
  echo -e "${GREEN}✓${NC} Category filter still works"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Category filter broken"
  FAILED=$((FAILED + 1))
fi

echo "2. Pagination parameters"
response=$(curl -s "$BASE_URL/api/prompts?limit=5&skip=0")
if echo "$response" | jq -e '.page' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Pagination still works"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Pagination broken"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Error Messages
echo -e "${YELLOW}Test 3: Error Message Format${NC}"

echo "1. 404 error format"
response=$(curl -s "$BASE_URL/api/invalid")
if echo "$response" | jq -e '.error' > /dev/null 2>&1 || \
   echo "$response" | grep -q "error\|message"; then
  echo -e "${GREEN}✓${NC} Error format consistent"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Error format changed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Required Fields
echo -e "${YELLOW}Test 4: Required Fields Present${NC}"

echo "1. Prompt objects have required fields"
response=$(curl -s "$BASE_URL/api/prompts?limit=1")
first_prompt=$(echo "$response" | jq -r '.prompts[0]')
if echo "$first_prompt" | jq -e '.id' > /dev/null 2>&1 && \
   echo "$first_prompt" | jq -e '.title' > /dev/null 2>&1 && \
   echo "$first_prompt" | jq -e '.content' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Prompt objects have required fields"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Prompt object structure changed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Data Types
echo -e "${YELLOW}Test 5: Data Type Consistency${NC}"

echo "1. Numeric fields are numbers"
response=$(curl -s "$BASE_URL/api/stats")
if echo "$response" | jq -e '.stats.prompts | type == "number"' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Numeric fields are correct type"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗${NC} Data type changed"
  FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 Regression Test Summary${NC}"
echo "=================================="
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ No regressions detected!${NC}"
  exit 0
else
  echo -e "${RED}❌ Regressions detected!${NC}"
  exit 1
fi
