<!--
AI Summary: Key rotation procedures and envelope encryption helpers; guarantees no secrets in logs, tests for verification.
-->

# Key Rotation & Envelope Encryption

## Overview

Rotate keys safely and encrypt sensitive data with an envelope scheme.

## File Map

- `scripts/security/rotate-keys.sh` (planned)
- `src/lib/crypto/envelope.ts` (planned helpers)
- `src/lib/logging/sanitizer.ts` — ensure redaction prior to logs

## Procedure

- Generate new KMS/secret manager keys; update envs per environment
- Staged deploy with dual-read period if needed

## Tests & Acceptance

- Dry run documented; unit tests cover encrypt/decrypt; logs contain no PII
