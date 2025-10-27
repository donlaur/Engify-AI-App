#!/bin/bash

# Find Issues Script
# Searches codebase for common issues and flags them for fixing

echo "🔍 Scanning codebase for issues..."
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# 1. Find missing icon imports
echo -e "${BLUE}1. Checking for missing icon references...${NC}"
MISSING_ICONS=$(grep -r "Icons\." src/ --include="*.tsx" --include="*.ts" | \
  grep -oP "Icons\.\K\w+" | sort -u | \
  while read icon; do
    if ! grep -q "^  $icon:" src/lib/icons.ts 2>/dev/null; then
      echo "$icon"
    fi
  done)

if [ ! -z "$MISSING_ICONS" ]; then
  echo -e "${RED}❌ Missing icons found:${NC}"
  echo "$MISSING_ICONS" | while read icon; do
    echo "  - $icon"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  done
else
  echo -e "${GREEN}✅ All icons are defined${NC}"
fi
echo ""

# 2. Find unused imports
echo -e "${BLUE}2. Checking for unused imports...${NC}"
UNUSED_IMPORTS=$(grep -r "^import.*from" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "type " | wc -l)
echo -e "${YELLOW}ℹ️  Found $UNUSED_IMPORTS import statements (manual review needed)${NC}"
echo ""

# 3. Find TODO comments
echo -e "${BLUE}3. Checking for TODO comments...${NC}"
TODOS=$(grep -r "TODO\|FIXME\|XXX\|HACK" src/ --include="*.tsx" --include="*.ts" --include="*.js" -n)
TODO_COUNT=$(echo "$TODOS" | grep -c "TODO\|FIXME\|XXX\|HACK" || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments:${NC}"
  echo "$TODOS" | head -10
  ISSUES_FOUND=$((ISSUES_FOUND + TODO_COUNT))
else
  echo -e "${GREEN}✅ No TODO comments found${NC}"
fi
echo ""

# 4. Find console.log statements
echo -e "${BLUE}4. Checking for console.log statements...${NC}"
CONSOLE_LOGS=$(grep -r "console\.log\|console\.error\|console\.warn" src/ --include="*.tsx" --include="*.ts" -n | grep -v "// eslint-disable")
CONSOLE_COUNT=$(echo "$CONSOLE_LOGS" | grep -c "console\." || echo "0")
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console statements:${NC}"
  echo "$CONSOLE_LOGS" | head -10
  ISSUES_FOUND=$((ISSUES_FOUND + CONSOLE_COUNT))
else
  echo -e "${GREEN}✅ No console statements found${NC}"
fi
echo ""

# 5. Find missing TypeScript types
echo -e "${BLUE}5. Checking for 'any' types...${NC}"
ANY_TYPES=$(grep -r ": any\|<any>" src/ --include="*.tsx" --include="*.ts" -n)
ANY_COUNT=$(echo "$ANY_TYPES" | grep -c ": any\|<any>" || echo "0")
if [ "$ANY_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $ANY_COUNT 'any' types:${NC}"
  echo "$ANY_TYPES" | head -10
  ISSUES_FOUND=$((ISSUES_FOUND + ANY_COUNT))
else
  echo -e "${GREEN}✅ No 'any' types found${NC}"
fi
echo ""

# 6. Find duplicate code
echo -e "${BLUE}6. Checking for potential duplicate code...${NC}"
DUPLICATE_FUNCTIONS=$(grep -r "^export function\|^function\|^const.*= (" src/ --include="*.tsx" --include="*.ts" | \
  awk -F: '{print $2}' | sort | uniq -d)
if [ ! -z "$DUPLICATE_FUNCTIONS" ]; then
  echo -e "${YELLOW}⚠️  Potential duplicate function names:${NC}"
  echo "$DUPLICATE_FUNCTIONS" | head -10
else
  echo -e "${GREEN}✅ No obvious duplicates found${NC}"
fi
echo ""

# 7. Find missing error handling
echo -e "${BLUE}7. Checking for missing error handling...${NC}"
MISSING_CATCH=$(grep -r "async function\|async (" src/ --include="*.tsx" --include="*.ts" -A 10 | \
  grep -v "try\|catch" | wc -l)
echo -e "${YELLOW}ℹ️  Found $MISSING_CATCH async functions (check for try/catch)${NC}"
echo ""

# 8. Find hardcoded values
echo -e "${BLUE}8. Checking for hardcoded URLs/secrets...${NC}"
HARDCODED=$(grep -r "http://\|https://\|mongodb://\|sk-\|api_key" src/ --include="*.tsx" --include="*.ts" -n | \
  grep -v "localhost\|example\|placeholder\|comment")
HARDCODED_COUNT=$(echo "$HARDCODED" | grep -c "http\|mongodb\|sk-\|api_key" || echo "0")
if [ "$HARDCODED_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Found $HARDCODED_COUNT hardcoded values:${NC}"
  echo "$HARDCODED" | head -10
  ISSUES_FOUND=$((ISSUES_FOUND + HARDCODED_COUNT))
else
  echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi
echo ""

# 9. Find missing prop types
echo -e "${BLUE}9. Checking for missing prop types...${NC}"
MISSING_PROPS=$(grep -r "function.*({" src/ --include="*.tsx" | \
  grep -v "}: \|Props\)" | wc -l)
echo -e "${YELLOW}ℹ️  Found $MISSING_PROPS functions with potential missing prop types${NC}"
echo ""

# 10. Find large files
echo -e "${BLUE}10. Checking for large files (>500 lines)...${NC}"
LARGE_FILES=$(find src/ -name "*.tsx" -o -name "*.ts" | \
  xargs wc -l | sort -rn | head -10 | awk '$1 > 500 {print $2 " (" $1 " lines)"}')
if [ ! -z "$LARGE_FILES" ]; then
  echo -e "${YELLOW}⚠️  Large files found (consider splitting):${NC}"
  echo "$LARGE_FILES"
else
  echo -e "${GREEN}✅ No excessively large files${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 Summary${NC}"
echo "=================================="
echo -e "Total issues flagged: ${RED}$ISSUES_FOUND${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run lint -- --fix"
echo "2. Run: npm run type-check"
echo "3. Fix missing icons in src/lib/icons.ts"
echo "4. Review and fix flagged issues"
echo ""
echo "Generate detailed report: ./scripts/find-issues.sh > issues-report.txt"
