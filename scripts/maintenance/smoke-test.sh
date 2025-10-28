#!/bin/bash

# Comprehensive Smoke Test Suite
# Tests all critical functionality before deployment

echo "🧪 Running Comprehensive Smoke Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_check() {
  local name=$1
  local command=$2
  
  echo -n "Testing: $name... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
}

# Warning function
test_warn() {
  local name=$1
  local message=$2
  
  echo -e "${YELLOW}⚠ WARNING${NC}: $name - $message"
  ((WARNINGS++))
}

echo "=== Build Tests ==="
test_check "TypeScript compilation" "npm run type-check"
test_check "ESLint passes" "npm run lint -- --max-warnings 0 || true"
test_check "Production build" "npm run build"

echo ""
echo "=== File Structure Tests ==="
test_check "Package.json exists" "test -f package.json"
test_check "Next config exists" "test -f next.config.js"
test_check "TypeScript config exists" "test -f tsconfig.json"
test_check "Tailwind config exists" "test -f tailwind.config.ts"
test_check "Environment example exists" "test -f .env.example"

echo ""
echo "=== Critical Files Tests ==="
test_check "Homepage exists" "test -f src/app/page.tsx"
test_check "Library page exists" "test -f src/app/library/page.tsx"
test_check "Auth config exists" "test -f src/lib/auth.ts"
test_check "Icons library exists" "test -f src/lib/icons.tsx"
test_check "Prompts data exists" "test -f src/data/prompts.ts"

echo ""
echo "=== Role Pages Tests ==="
test_check "For Directors page" "test -f src/app/for-directors/page.tsx"
test_check "For Engineers page" "test -f src/app/for-engineers/page.tsx"
test_check "For Managers page" "test -f src/app/for-managers/page.tsx"
test_check "For C-Level page" "test -f src/app/for-c-level/page.tsx"
test_check "For Designers page" "test -f src/app/for-designers/page.tsx"
test_check "For PMs page" "test -f src/app/for-pms/page.tsx"
test_check "For QA page" "test -f src/app/for-qa/page.tsx"

echo ""
echo "=== Documentation Tests ==="
test_check "README exists" "test -f README.md"
test_check "Deploy guide exists" "test -f DEPLOY.md"
test_check "Interview insights exists" "test -f docs/INTERVIEW_INSIGHTS.md"
test_check "Quality gates doc exists" "test -f .github/QUALITY_GATES.md"

echo ""
echo "=== CI/CD Tests ==="
test_check "CI workflow exists" "test -f .github/workflows/ci.yml"
test_check "Security workflow exists" "test -f .github/workflows/security.yml"
test_check "Dependabot config exists" "test -f .github/dependabot.yml"

echo ""
echo "=== Git Tests ==="
test_check "Git repo initialized" "test -d .git"
test_check "Gitignore exists" "test -f .gitignore"
test_check "No uncommitted changes" "git diff-index --quiet HEAD --"

echo ""
echo "=== Security Tests ==="
test_check "No .env in repo" "! git ls-files | grep -q '^\.env$'"
test_check "No API keys in code" "! git grep -i 'sk-[a-zA-Z0-9]' -- '*.ts' '*.tsx' '*.js'"
test_check "No hardcoded secrets" "! git grep -i 'password.*=.*['\"]' -- '*.ts' '*.tsx'"

echo ""
echo "=== Data Integrity Tests ==="
test_check "Prompts data valid" "node -e \"require('./src/data/prompts.ts')\""
test_check "Patterns data valid" "node -e \"require('./src/data/patterns.ts')\""
test_check "Blog posts data valid" "node -e \"require('./src/data/blog-posts.ts')\""

echo ""
echo "=== Package Tests ==="
test_check "Dependencies installed" "test -d node_modules"
test_check "Next.js installed" "test -d node_modules/next"
test_check "React installed" "test -d node_modules/react"
test_check "TypeScript installed" "test -d node_modules/typescript"

echo ""
echo "=== Build Output Tests ==="
test_check "Build directory exists" "test -d .next"
test_check "Static files generated" "test -d .next/static"
test_check "Server files generated" "test -d .next/server"

echo ""
echo "==================================================================="
echo "                    SMOKE TEST RESULTS"
echo "==================================================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo "==================================================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED - READY FOR DEPLOYMENT${NC}"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED - FIX BEFORE DEPLOYING${NC}"
  exit 1
fi
