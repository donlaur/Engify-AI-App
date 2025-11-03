#!/bin/bash
# Pre-Change Validation Guardrail
# MUST run before AI makes any changes

set -e

echo "🛡️  Running Pre-Change Guardrails..."
echo ""

CHANGE_TYPE=${1:-"all"}
SEARCH_TERMS=${2:-""}

if [ -z "$SEARCH_TERMS" ] && [ "$CHANGE_TYPE" != "all" ]; then
    echo "Usage: ./scripts/ai/pre-change-check.sh <type> <search-terms>"
    echo "Types: validation, helper, pattern, script"
    echo "Or: ./scripts/ai/pre-change-check.sh all (checks everything)"
    exit 1
fi

if [ "$CHANGE_TYPE" = "all" ]; then
    echo "🔍 Checking for common issues..."
    echo ""
    
    # Check if icon validation is in pre-commit
    if ! grep -q "audit-icons" .husky/pre-commit 2>/dev/null; then
        echo "⚠️  WARNING: Icon audit script exists but NOT in pre-commit!"
        echo "   File: scripts/development/audit-icons.ts"
        echo "   Action: Add to .husky/pre-commit"
        echo ""
    fi
    
    # Check for duplicate check scripts
    VALIDATION_SCRIPTS=$(find scripts/ -name "*check*" -o -name "*validate*" -o -name "*audit*" 2>/dev/null | wc -l)
    if [ "$VALIDATION_SCRIPTS" -gt 10 ]; then
        echo "⚠️  WARNING: Many validation scripts found ($VALIDATION_SCRIPTS)"
        echo "   Consider consolidating duplicate functionality"
        echo ""
    fi
    
    # Check if pre-commit hooks are being bypassed
    RECENT_NO_VERIFY=$(git log --oneline -10 | grep -i "no-verify\|--no-verify" | wc -l)
    if [ "$RECENT_NO_VERIFY" -gt 2 ]; then
        echo "⚠️  WARNING: Multiple recent commits bypassed pre-commit hooks"
        echo "   Review: git log --oneline -10 | grep -i no-verify"
        echo ""
    fi
    
    echo "✅ Guardrail check complete"
    exit 0
fi

echo "Checking for existing $CHANGE_TYPE related to: $SEARCH_TERMS"
echo ""

# Search for existing tools
EXISTING=$(find scripts/ -name "*$SEARCH_TERMS*" 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
    echo "❌ ERROR: Existing tooling found:"
    echo "$EXISTING"
    echo ""
    echo "DO NOT create duplicate. Use existing tool instead!"
    echo ""
    echo "To use existing tool:"
    echo "  1. Review: $EXISTING"
    echo "  2. Extend if needed"
    echo "  3. Add to pre-commit if missing"
    exit 1
fi

# Check pre-commit hooks
if grep -q "$SEARCH_TERMS" .husky/pre-commit 2>/dev/null; then
    echo "⚠️  WARNING: Similar check already in pre-commit!"
    echo "   Review .husky/pre-commit before adding new validation"
    echo ""
fi

# Check for similar patterns in codebase
PATTERN_MATCHES=$(grep -r "$SEARCH_TERMS" src/ scripts/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | wc -l)
if [ "$PATTERN_MATCHES" -gt 0 ]; then
    echo "⚠️  INFO: Found $PATTERN_MATCHES matches in codebase for '$SEARCH_TERMS'"
    echo "   Review existing patterns before implementing new approach"
    echo ""
fi

echo "✅ No existing tooling found. Proceed with caution."
echo "   Remember to add new tools to pre-commit hooks if they validate code."

