#!/bin/bash

# Run All Tests
# Master script to run all API and page tests

set -e

BASE_URL="${BASE_URL:-http://localhost:3005}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   Engify.ai Test Suite Runner         ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"
echo ""

TOTAL_PASSED=0
TOTAL_FAILED=0
SUITE_FAILURES=0

# Check if server is running
echo -e "${YELLOW}Checking server status...${NC}"
if curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Server is running${NC}"
else
  echo -e "${RED}✗ Server is not running on $BASE_URL${NC}"
  echo "Please start the server with: npm run dev"
  exit 1
fi
echo ""

# Run smoke tests
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}Running Smoke Tests${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
if ./tests/api/smoke-tests.sh; then
  echo -e "${GREEN}✓ Smoke tests passed${NC}"
else
  echo -e "${RED}✗ Smoke tests failed${NC}"
  SUITE_FAILURES=$((SUITE_FAILURES + 1))
fi
echo ""

# Run page tests
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}Running Page Tests${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
if ./tests/api/page-tests.sh; then
  echo -e "${GREEN}✓ Page tests passed${NC}"
else
  echo -e "${RED}✗ Page tests failed${NC}"
  SUITE_FAILURES=$((SUITE_FAILURES + 1))
fi
echo ""

# Run E2E tests
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}Running E2E Tests${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
if ./tests/api/e2e-tests.sh; then
  echo -e "${GREEN}✓ E2E tests passed${NC}"
else
  echo -e "${RED}✗ E2E tests failed${NC}"
  SUITE_FAILURES=$((SUITE_FAILURES + 1))
fi
echo ""

# Run regression tests
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
echo -e "${PURPLE}Running Regression Tests${NC}"
echo -e "${PURPLE}═══════════════════════════════════════${NC}"
if ./tests/api/regression-tests.sh; then
  echo -e "${GREEN}✓ Regression tests passed${NC}"
else
  echo -e "${RED}✗ Regression tests failed${NC}"
  SUITE_FAILURES=$((SUITE_FAILURES + 1))
fi
echo ""

# Final Summary
echo -e "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   Final Test Summary                   ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Test Suites: 4"
echo -e "${GREEN}Passed Suites: $((4 - SUITE_FAILURES))${NC}"
echo -e "${RED}Failed Suites: $SUITE_FAILURES${NC}"
echo ""

if [ $SUITE_FAILURES -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅ ALL TESTS PASSED! 🎉             ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════╗${NC}"
  echo -e "${RED}║   ❌ SOME TESTS FAILED                 ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════╝${NC}"
  exit 1
fi
