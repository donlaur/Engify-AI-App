#!/bin/bash
# Clean up completed/duplicate/outdated documentation
# Based on docs/CLEANUP_AUDIT.md

set -e

echo "🧹 Starting documentation cleanup..."

# Category 1: Duplicate ADRs (keep numbered format)
echo "📋 Category 1: Removing duplicate ADR files..."
rm -f docs/development/ADR/ADR-009-mock-data-removal.md
rm -f docs/development/ADR/ADR-010-admin-cli-consolidation.md
rm -f docs/development/ADR/ADR-011-frontend-architecture.md

# Category 2: Root directory temp docs
echo "📋 Category 2: Removing root directory temp docs..."
rm -f ARTICLE_FIX_1762121085.md
rm -f ARTICLE_SYSTEM_IMPLEMENTATION.md

# Category 3: Completed implementation docs
echo "📋 Category 3: Removing completed implementation docs..."
rm -f docs/implementation/IMPLEMENTATION_PLAN.md
rm -f docs/implementation/STRATEGIC_PATTERNS_TECH_SPEC.md
rm -f docs/analytics/GA_EVENTS_IMPLEMENTATION.md
rm -f docs/seo/INTERNAL_LINKING_IMPLEMENTATION.md
rm -f docs/testing/PRE_COMMIT_IMPLEMENTATION_SUMMARY.md

# Category 4: Old audits (>7 days, no unique value)
echo "📋 Category 4: Removing old audit docs..."
rm -f docs/testing/MOCK_DATA_AUDIT_DAY7.md
rm -f docs/testing/PATTERN_AUDIT_DAY7.md
rm -f docs/testing/QA_AUDIT_REPORT_DAY7.md
rm -f docs/performance/DAY_7_PERFORMANCE_ANALYSIS.md
rm -f docs/performance/PHASE_7_AUDIT_REPORT.md
rm -f docs/enterprise/CODE_QUALITY_AUDIT_NOV_2.md
rm -f docs/enterprise/ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md
rm -f docs/DOCUMENTATION_AUDIT_NOV_2.md

# Category 5: Completed daily plans
echo "📋 Category 5: Removing completed daily plans..."
rm -f docs/planning/DAY_5_PLAN.md
rm -f docs/planning/DAY_5_PART_2_CONTENT_QUALITY.md
rm -f docs/planning/DAY_6_CONTENT_HARDENING.md
rm -f docs/planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md
rm -f docs/planning/PHASE_1.5_NEXT_STEPS.md

# Category 6: Completed migrations
echo "📋 Category 6: Removing completed migration guides..."
rm -f docs/development/SLUG_CLEANUP_MIGRATION.md
rm -f docs/migration/MIGRATION_GUIDE.md
rm -f docs/content/PATTERNS_MIGRATION.md
rm -f docs/security/IP_PROTECTION_FINAL_CLEANUP.md
rm -f docs/security/GIT_HISTORY_CLEANUP_PLAN.md

# Category 7: Completed TODOs and consolidation docs
echo "📋 Category 7: Removing completed TODOs and consolidation docs..."
rm -f docs/opshub/AI_MODEL_MANAGEMENT_TODO.md
rm -f docs/CONSOLIDATION_PLAN.md
rm -f docs/CONSOLIDATION_EXECUTED.md

# Category 8: Completed summaries
echo "📋 Category 8: Removing completed summary docs..."
rm -f docs/professional/TRUST_FIXES_SUMMARY_NOV2.md
rm -f docs/content/SESSION_SUMMARY_MULTI_AGENT.md
rm -f docs/aws/MULTI_AGENT_DEPLOYMENT_CHECKLIST.md

echo "✅ Cleanup complete! Removed ~35 outdated/duplicate docs."
echo "📝 Review remaining files listed in docs/CLEANUP_AUDIT.md if needed."

