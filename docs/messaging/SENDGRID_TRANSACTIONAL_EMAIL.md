<!--
AI Summary: Typed template registry, SendGrid webhook verification, error handling, and OpsHub status surfaces for emails.
-->

# SendGrid Transactional Email

This work is part of Day 5: [Day 5 Plan](../planning/DAY_5_PLAN.md).

## Overview

Centralized template registry with Zod-typed merge variables, webhook verify route, and admin observability.

## File Map

- `src/lib/email/templates.ts` (template IDs + schemas)
- `src/app/api/email/webhook/route.ts` (signature verify)
- `src/components/admin/SettingsPanel.tsx` (email status)

## Security & Validation

- Verify webhook signatures; reject unsigned
- Mask keys in logs; sanitize metadata

## Tests & Acceptance

- Unit tests for schema enforcement and webhook verify
- Test email renders in dev; errors audited
