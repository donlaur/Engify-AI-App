<!--
AI Summary: Guidance to configure AWS CLI profiles, IAM roles/policies, and environment mapping for Engify. Least-privilege, auditable setup with helper scripts.
-->

# AWS IAM & CLI Setup

## Overview

- Profiles for dev/stage/prod using SSO or static keys (dev only).
- Roles: Lambda execution, webhook verifiers, read-only access where applicable.
- No secrets in repo; env keys documented in `docs/integrations/ENVIRONMENT_VARIABLES.md`.

## File Map

- `scripts/aws/login.sh` — SSO/key login helper
- `docs/aws/IAM_POLICIES.md` — policy JSON examples and role descriptions
- `docs/deployment/VERCEL_ENV_SETUP.md` — Vercel env linkage guidance

## Profiles

```bash
aws configure sso --profile engify-dev
aws configure sso --profile engify-stage
aws configure sso --profile engify-prod
```

## Roles (examples)

- `arn:aws:iam::<ACCOUNT_ID>:role/lambda-execution-role` — least-priv for Lambda code updates
- Webhook verifier roles (if using API Gateway + Lambda)

## Environment

Refer to `docs/integrations/ENVIRONMENT_VARIABLES.md` for required variables. Never commit secrets.

## Failure Modes

- Expired SSO session → re-run `scripts/aws/login.sh`
- AccessDenied → confirm role trust policy and profile mapping

## Tests & Acceptance

- Run: `AWS_PROFILE=engify-dev aws sts get-caller-identity`
- Policies peer-reviewed; links captured in `docs/aws/IAM_POLICIES.md`
