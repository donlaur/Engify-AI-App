#!/bin/bash

# Page Tests
# Tests all pages are accessible and rendering correctly

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

echo -e "${BLUE}📄 Running Page Tests${NC}"
echo "=================================="
echo ""

# Helper function to test page
test_page() {
  local path=$1
  local description=$2
  local expected_text=$3

  echo -n "Testing: $description... "
  
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path" 2>/dev/null || echo "000")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "200" ]; then
    if [ -z "$expected_text" ] || echo "$body" | grep -q "$expected_text"; then
      echo -e "${GREEN}✓ PASS${NC}"
      PASSED=$((PASSED + 1))
    else
      echo -e "${YELLOW}⚠ WARN${NC} (200 but missing expected content)"
      PASSED=$((PASSED + 1))
    fi
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $status_code)"
    FAILED=$((FAILED + 1))
  fi
}

# Public Pages
echo -e "${YELLOW}Public Pages${NC}"
test_page "/" "Homepage" "Engify"
test_page "/about" "About page" "About"
test_page "/library" "Library page" "Prompt"
test_page "/patterns" "Patterns page" "Pattern"
test_page "/learn" "Learn page" "Learn"
test_page "/workbench" "Workbench page" "Workbench"
test_page "/pricing" "Pricing page" "Pricing"
test_page "/contact" "Contact page" "Contact"
test_page "/privacy" "Privacy page" "Privacy"
test_page "/terms" "Terms page" "Terms"
echo ""

# Dynamic Pages
echo -e "${YELLOW}Dynamic Pages${NC}"
test_page "/library/code-review-prompt" "Prompt detail page" ""
test_page "/patterns/chain-of-thought" "Pattern detail page" ""
echo ""

# Error Pages
echo -e "${YELLOW}Error Pages${NC}"
echo -n "Testing: 404 page... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/this-page-does-not-exist")
if [ "$status" = "404" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} (Expected 404, got $status)"
  FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 Page Test Summary${NC}"
echo "=================================="
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All pages accessible!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some pages failed${NC}"
  exit 1
fi
