# Day 4 – QA and Integrations Plan (AWS CLI, Python, Twilio, SendGrid)

This document resumes the remaining Day 3 integration work and carries it to completion with clear, testable steps.

## Scope

- AWS CLI and Python integration (for lambda-style services and RAG Python service)
- Twilio integration (SMS/voice/email handoff)
- SendGrid integration (transactional email)
- QA verification and smoke tests

## Prerequisites

- Node 18+ and Python 3.11+ installed
- Local `.env.local`, `.env.test`, and (if needed) `.env.development` configured
- Access to Twilio and SendGrid trial/production accounts
- AWS account with IAM user and least-privilege access for CLI

## References (Existing Docs)

- AWS
  - `docs/aws/AWS_DEPLOYMENT_STRATEGY.md`
  - `docs/aws/IAM_POLICIES.md`
  - `docs/aws/PYTHON_DEPLOYMENT_OPTIONS.md`
- Integrations
  - `docs/integrations/SENDGRID_ENV_SETUP.md`
  - `docs/integrations/SENDGRID_TWILIO_SETUP.md`
- Python services
  - `python/README.md`
  - `python/requirements.txt`
  - `python/api/*.py`

## AWS CLI for Python and Lambda-style Workflows

1. Install/Update AWS CLI

```bash
brew install awscli || brew upgrade awscli
aws --version
```

2. Configure profile (least-privilege per `docs/aws/IAM_POLICIES.md`)

```bash
aws configure --profile engify
# AWS Access Key ID: ********
# AWS Secret Access Key: ********
# Default region name: us-east-1 (or as required)
# Default output format: json
```

3. Verify STS identity

```bash
aws sts get-caller-identity --profile engify
```

4. Python virtual env (if needed for local tools)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r python/requirements.txt
```

5. Local RAG service health (optional)

```bash
python scripts/start-rag-service.py
# Or
python python/test-rag-service.py
```

6. Lambda packaging (if/when deploying Python functions)

- Follow `docs/aws/PYTHON_DEPLOYMENT_OPTIONS.md`
- Ensure dependencies are packaged with the correct platform/architecture

## SendGrid Integration

1. Environment

- Follow `docs/integrations/SENDGRID_ENV_SETUP.md`
- Required variables (examples):
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`

2. Local verification

- Use a test API key with sandbox mode enabled (per SendGrid docs)
- Trigger a minimal send path through `src/lib/services/NotificationService.ts`

3. Smoke test (local)

```bash
node -e "(async () => { const { notificationService } = require('./dist/src/lib/services/NotificationService'); await notificationService.sendEmail({ to: process.env.SENDGRID_FROM_EMAIL, subject: 'SendGrid Smoke Test', text: 'Smoke test OK' }); console.log('OK'); })().catch(e=>{console.error(e);process.exit(1);})"
```

4. QA checklist

- Sandbox send completes without error
- Template path works (see `src/lib/services/sendgridTemplates.ts`)
- Error handling returns `{ error }` shape in API routes

## Twilio Integration

1. Environment

- Follow `docs/integrations/SENDGRID_TWILIO_SETUP.md`
- Required variables (examples):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_PHONE`

2. Local verification

- Use trial SID and a verified destination number
- Trigger SMS via `src/lib/services/twilioService.ts`

3. Smoke test (local)

```bash
node -e "(async () => { const { sendSMS } = require('./dist/src/lib/services/twilioService'); await sendSMS(process.env.TWILIO_FROM_PHONE, process.env.TWILIO_TO_PHONE || process.env.TWILIO_FROM_PHONE, 'Twilio Smoke Test'); console.log('OK'); })().catch(e=>{console.error(e);process.exit(1);})"
```

4. QA checklist

- SMS delivery confirmed to verified number
- Errors logged with context (no secrets)

## Test and CI Hooks

- Add environment matrix and skip external sends in CI (mock via adapters)
- Unit tests should exercise adapters with fakes (no real network)
- E2E smoke runs can run against sandbox credentials on demand

## Tasks (Day 4)

1. AWS CLI + Python

- Configure `engify` profile
- Package and validate Python service (no deployment yet)

2. SendGrid

- Validate env + sandbox send path
- Add smoke test script and document usage

3. Twilio

- Validate env + trial send to verified number
- Add smoke test script and document usage

4. CI Safety

- Ensure tests use mocks
- Guard external sends behind explicit flags (e.g., `ENABLE_EXTERNAL_SENDS=true`)

## Status (Day 4)

- AWS CLI + Python: prepped; no new deployment (docs and scripts verified)
- SendGrid: envs documented; email API currently disabled in menu; serverless logging fixed
- Twilio: envs documented; smoke path documented (pending trial verification)
- CI Safety: tests green; RBAC route tests added; external sends mocked by default

## Acceptance Criteria

- AWS CLI profile configured and verified via STS
- SendGrid sandbox send succeeds locally
- Twilio SMS send succeeds to verified number locally
- CI remains green (mocks only) with external sends disabled by default
