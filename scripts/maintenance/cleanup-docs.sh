#!/bin/bash
# Documentation Cleanup Script
# Removes outdated, duplicate, and completed documentation files
# See: docs/CLEANUP_AUDIT.md for full audit

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Documentation Cleanup - November 4, 2025             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  This will DELETE ~35 documentation files."
echo "   Files are tracked in git and can be recovered if needed."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi
echo ""

COUNT=0

# Category 1: Duplicate ADR Files (keep numbered format)
echo "📝 Removing duplicate ADR files..."
rm -f docs/development/ADR/ADR-009-mock-data-removal.md && ((COUNT++)) && echo "   ✓ Removed ADR-009 duplicate"
rm -f docs/development/ADR/ADR-010-admin-cli-consolidation.md && ((COUNT++)) && echo "   ✓ Removed ADR-010 duplicate"
rm -f docs/development/ADR/ADR-011-frontend-architecture.md && ((COUNT++)) && echo "   ✓ Removed ADR-011 duplicate"
echo ""

# Category 2: Root directory temp docs
echo "🧹 Removing temporary fix documentation..."
rm -f ARTICLE_FIX_1762121085.md && ((COUNT++)) && echo "   ✓ Removed temp article fix doc"
rm -f ARTICLE_SYSTEM_IMPLEMENTATION.md && ((COUNT++)) && echo "   ✓ Removed article implementation doc"
echo ""

# Category 3: Completed implementation docs
echo "✅ Removing completed implementation documentation..."
rm -f docs/implementation/IMPLEMENTATION_PLAN.md && ((COUNT++)) && echo "   ✓ Removed general implementation plan"
rm -f docs/analytics/GA_EVENTS_IMPLEMENTATION.md && ((COUNT++)) && echo "   ✓ Removed GA events implementation"
rm -f docs/seo/INTERNAL_LINKING_IMPLEMENTATION.md && ((COUNT++)) && echo "   ✓ Removed internal linking implementation"
rm -f docs/testing/PRE_COMMIT_IMPLEMENTATION_SUMMARY.md && ((COUNT++)) && echo "   ✓ Removed pre-commit implementation summary"
rm -f docs/implementation/STRATEGIC_PATTERNS_TECH_SPEC.md && ((COUNT++)) && echo "   ✓ Removed strategic patterns tech spec"
echo ""

# Category 4: Old audits (>7 days, no unique value)
echo "📊 Removing old audit documentation..."
rm -f docs/testing/MOCK_DATA_AUDIT_DAY7.md && ((COUNT++)) && echo "   ✓ Removed Day 7 mock data audit"
rm -f docs/testing/PATTERN_AUDIT_DAY7.md && ((COUNT++)) && echo "   ✓ Removed Day 7 pattern audit"
rm -f docs/testing/QA_AUDIT_REPORT_DAY7.md && ((COUNT++)) && echo "   ✓ Removed Day 7 QA audit"
rm -f docs/performance/DAY_7_PERFORMANCE_ANALYSIS.md && ((COUNT++)) && echo "   ✓ Removed Day 7 performance analysis"
rm -f docs/performance/PHASE_7_AUDIT_REPORT.md && ((COUNT++)) && echo "   ✓ Removed Phase 7 audit report"
rm -f docs/enterprise/CODE_QUALITY_AUDIT_NOV_2.md && ((COUNT++)) && echo "   ✓ Removed Nov 2 code quality audit"
rm -f docs/enterprise/ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md && ((COUNT++)) && echo "   ✓ Removed Day 5 enterprise compliance audit"
rm -f docs/DOCUMENTATION_AUDIT_NOV_2.md && ((COUNT++)) && echo "   ✓ Removed Nov 2 documentation audit"
echo ""

# Category 5: Completed daily plans
echo "📅 Removing completed daily plans..."
rm -f docs/planning/DAY_5_PLAN.md && ((COUNT++)) && echo "   ✓ Removed Day 5 plan"
rm -f docs/planning/DAY_5_PART_2_CONTENT_QUALITY.md && ((COUNT++)) && echo "   ✓ Removed Day 5 Part 2 plan"
rm -f docs/planning/DAY_6_CONTENT_HARDENING.md && ((COUNT++)) && echo "   ✓ Removed Day 6 plan"
rm -f docs/planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md && ((COUNT++)) && echo "   ✓ Removed Day 7 plan"
rm -f docs/planning/PHASE_1.5_NEXT_STEPS.md && ((COUNT++)) && echo "   ✓ Removed Phase 1.5 next steps"
echo ""

# Category 6: Completed migrations
echo "🔄 Removing completed migration guides..."
rm -f docs/development/SLUG_CLEANUP_MIGRATION.md && ((COUNT++)) && echo "   ✓ Removed slug cleanup migration"
rm -f docs/content/PATTERNS_MIGRATION.md && ((COUNT++)) && echo "   ✓ Removed patterns migration"
rm -f docs/security/IP_PROTECTION_FINAL_CLEANUP.md && ((COUNT++)) && echo "   ✓ Removed IP protection cleanup"
rm -f docs/security/GIT_HISTORY_CLEANUP_PLAN.md && ((COUNT++)) && echo "   ✓ Removed git history cleanup plan"
echo ""

# Category 7: Completed TODO lists
echo "📋 Removing completed TODO lists..."
rm -f docs/opshub/AI_MODEL_MANAGEMENT_TODO.md && ((COUNT++)) && echo "   ✓ Removed AI Model Management TODO (FEATURE COMPLETE)"
rm -f docs/CONSOLIDATION_PLAN.md && ((COUNT++)) && echo "   ✓ Removed consolidation plan"
rm -f docs/CONSOLIDATION_EXECUTED.md && ((COUNT++)) && echo "   ✓ Removed consolidation executed"
echo ""

# Category 8: Session summaries (historical notes, no future value)
echo "📝 Removing session summaries..."
rm -f docs/professional/TRUST_FIXES_SUMMARY_NOV2.md && ((COUNT++)) && echo "   ✓ Removed trust fixes summary"
rm -f docs/content/SESSION_SUMMARY_MULTI_AGENT.md && ((COUNT++)) && echo "   ✓ Removed multi-agent session summary"
rm -f docs/aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md && ((COUNT++)) && echo "   ✓ Removed deployment checklist"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "🎉 Cleanup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Files Removed: $COUNT"
echo "📁 Remaining: ~$(find docs -name '*.md' | wc -l) documentation files"

