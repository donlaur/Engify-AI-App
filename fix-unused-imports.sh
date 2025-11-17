#!/bin/bash

# Script to help identify unused imports and variables
# This extracts production code errors (excluding tests)

echo "Production Code Errors (excluding tests):"
npx tsc --noEmit 2>&1 | grep "error TS6133" | grep -v "__tests__" | grep -v ".test.ts"

echo ""
echo "Test File Errors:"
npx tsc --noEmit 2>&1 | grep "error TS6133" | grep -E "(__tests__|\.test\.ts)"
