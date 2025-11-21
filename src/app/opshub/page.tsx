/**
 * @pattern OPSHUB_PAGE
 * @auth requireOpsHubAuth() - All opshub pages require admin authentication
 * @description Main OpsHub admin center entry point. Provides tabbed interface for all admin panels.
 * 
 * This page follows the OpsHub authentication pattern:
 * - Uses requireOpsHubAuth() for centralized auth logic
 * - All opshub pages must be password-protected
 * - Requires admin role (admin, super_admin, or org_admin)
 * - Enforces MFA if enabled (no super_admin bypass per security audit)
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for pattern guide
 */

import { requireOpsHubAuth } from '@/lib/opshub/auth';
import { OpsHubTabs } from '@/components/opshub/panels/OpsHubTabs';

export default async function OpsHubPage() {
  // ✅ REQUIRED: All opshub pages must use requireOpsHubAuth()
  const { user, role } = await requireOpsHubAuth();

  return (
    <div className="mx-auto max-w-7xl p-6">
      <OpsHubTabs />
    </div>
  );
}
