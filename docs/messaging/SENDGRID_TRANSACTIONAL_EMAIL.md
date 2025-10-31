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

- Verify webhook signatures with SendGrid Event Webhook (ECDSA) keys; reject unsigned payloads
- Last event/error surfaced in OpsHub settings via `getSendGridEventStatus`
- Mask keys in logs; sanitize metadata
- Audit every event with success/error action codes (`sendgrid_event_received` / `sendgrid_event_failed`)
- Replay protection and rate limiting delegated to OpsHub for monitoring and follow-up

## Tests & Acceptance

- Zod-backed template registry validates merge vars before sending
- Unit tests cover webhook success, invalid signature, and malformed payload handling
- Admin settings endpoint exposes SendGrid health summaries
- Test email renders in dev; errors audited
