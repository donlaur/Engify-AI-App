# Environment Variables Reference

Purpose: Single source of truth for environment configuration across local, Vercel, and AWS.

---

## Core (Required)

- MONGODB_URI: MongoDB Atlas connection string
- NEXTAUTH_SECRET: NextAuth signing secret (generate with openssl rand -base64 32)
- NEXTAUTH_URL: Public app URL (e.g., https://engify.ai)
- NODE_ENV: production | development | test

## Public (Client-Safe)

- NEXT_PUBLIC_APP_URL: Public site URL
- NEXT_PUBLIC_APP_VERSION: App version label (optional)
- NEXT_PUBLIC_ALLOW_SIGNUP: 'true' | 'false' (controls Request Access gate)

## AI Providers (BYOK and Company Keys)

- OPENAI_API_KEY: Company key for internal tools (users store BYOK per-user via ApiKeyService)
- ANTHROPIC_API_KEY: Company key (optional)
- GOOGLE_API_KEY: Company key (optional)

## Email (SendGrid)

- SENDGRID_API_KEY or SENDGRID_API: API key
- SENDGRID_WEBHOOK_PUBLIC_KEY: For signed webhook verification (production)
- SENDGRID_WELCOME_TEMPLATE_ID: Dynamic template ID
- SENDGRID_PASSWORD_RESET_TEMPLATE_ID: Dynamic template ID
- SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID: Dynamic template ID
- SENDGRID_PROMPT_SHARED_TEMPLATE_ID: Dynamic template ID
- SENDGRID_CONTACT_FORM_TEMPLATE_ID: Dynamic template ID
- SENDGRID_API_KEY_ALERT_TEMPLATE_ID: Dynamic template ID
- SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID: Dynamic template ID
- SENDGRID_AI_CONTENT_READY_TEMPLATE_ID: Dynamic template ID

## SMS/MFA (Twilio)

- TWILIO_ACCOUNT_SID: Twilio account SID
- TWILIO_AUTH_TOKEN: Twilio auth token
- TWILIO_PHONE_NUMBER: Sender phone number
- TWILIO_VERIFY_SERVICE_SID: Verify service SID (optional; enables Verify flows)

## Queueing/Jobs

- QSTASH_URL: Upstash QStash API base (defaults to https://qstash.upstash.io/v2)
- QSTASH_TOKEN: Upstash QStash token (required for jobs)
- QSTASH_WEBHOOK_URL: Public webhook URL for QStash callbacks

## Redis / Caching

- UPSTASH_REDIS_REST_URL: Upstash Redis REST URL
- UPSTASH_REDIS_REST_TOKEN: Upstash Redis REST token
- REDIS_HOST: Redis host (self-hosted alt)
- REDIS_PORT: Redis port
- REDIS_PASSWORD: Redis password
- REDIS_DB: Redis DB index

## AWS (Secrets/Infra)

- AWS_REGION: AWS region (e.g., us-east-1)
- AWS_ACCESS_KEY_ID: Access key (local/dev only; prefer IAM roles in AWS)
- AWS_SECRET_ACCESS_KEY: Secret key (local/dev only)

## Encryption / Security

- API_KEY_ENCRYPTION_KEY: Hex-encoded key for encrypting user BYOK at rest
- JIRA_TOKEN_ENCRYPTION_KEY: Encryption key for Jira tokens (fallback logic present)

## RAG / Python Backend

- RAG_API_URL: Python RAG service base URL (e.g., http://localhost:8000)

---

## Notes

- Prefer per-user BYOK stored via ApiKeyService; company keys are for shared features only.
- In AWS, prefer IAM roles over static keys. Our SecretsManager client auto-detects credentials.
- Webhooks in production should be signature-verified (SendGrid, Twilio). Configure public keys/secrets accordingly.
- Security headers are configured in `next.config.js` and do not require env.

---

## Quick Vercel Setup (Minimal)

Required to boot:

- MONGODB_URI
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- NEXT_PUBLIC_APP_URL
- NODE_ENV=production

Recommended for features:

- SENDGRID_API_KEY
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- QSTASH_TOKEN
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

---

For detailed provider-specific setup, see:

- docs/integrations/SENDGRID_ENV_SETUP.md
- docs/aws/IAM_POLICIES.md
- docs/aws/AWS_UNIFIED_ARCHITECTURE.md
