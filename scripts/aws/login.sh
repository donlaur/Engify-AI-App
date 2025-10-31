#!/usr/bin/env bash
#
# AI Summary: Logs in to AWS via SSO or default credentials using a named profile.
# Invariants: No secrets written; reads from AWS config; exits non‑zero on failure.
# Related: docs/aws/IAM_POLICIES.md, docs/deployment/VERCEL_ENV_SETUP.md

set -euo pipefail

PROFILE="${AWS_PROFILE:-default}"

if command -v aws &>/dev/null; then
  if aws --version >/dev/null 2>&1; then
    if aws configure list-profiles | grep -q "^${PROFILE}$"; then
      echo "Using AWS profile: ${PROFILE}"
      # Prefer SSO if configured; falls back to credential-based login
      if aws configure get sso_start_url --profile "${PROFILE}" >/dev/null 2>&1; then
        aws sso login --profile "${PROFILE}"
      else
        echo "SSO not configured for ${PROFILE}. Ensure keys are valid in ~/.aws/credentials."
      fi
      echo "Logged in as:"
      aws sts get-caller-identity --profile "${PROFILE}" --output json
    else
      echo "Profile '${PROFILE}' not found. Create it with 'aws configure sso' or 'aws configure'." >&2
      exit 2
    fi
  fi
else
  echo "aws CLI not found. Install from https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" >&2
  exit 127
fi


