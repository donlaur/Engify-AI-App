<!--
AI Summary: Productionizing Twilio MFA/SMS with Zod E.164 validation, webhook signature verification, rate limits, and audit logging.
-->

# Twilio MFA Productionization

This work is part of Day 5: [Day 5 Plan](../planning/DAY_5_PLAN.md).

## Overview

Secure SMS flows, Verify optional path, and OpsHub controls. RBAC enforced on routes.

## File Map

- `src/app/api/auth/mfa/send-code/route.ts`
- `src/app/api/auth/mfa/verify/route.ts`
- `src/app/api/auth/mfa/webhook/route.ts` (signature verify)
- `src/components/admin/SettingsPanel.tsx` (toggles)

## Validation & Security

- Zod E.164 phone regex
- Per-user sliding rate limits (3 sends/min, 6 verifies/min) with 429 responses
- Verify signature header validation; replay window check
- Rate limiting middleware for send endpoints
- Audit entries via `src/lib/logging/audit.ts`

## Tests & Acceptance

- Unit tests for validation & signature verify
- Unit tests cover rate-limit branches for send + verify endpoints
- E2E happy & failure paths; OpsHub toggles reflect state
