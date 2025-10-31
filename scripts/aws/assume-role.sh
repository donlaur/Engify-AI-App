#!/usr/bin/env bash
#
# AI Summary: Assumes an AWS IAM role and emits export statements for temporary creds.
# Usage: eval "$(scripts/aws/assume-role.sh <ROLE_ARN> [SESSION_NAME] [PROFILE])"
# Invariants: No secrets written to disk; tokens printed to stdout for eval only.
# Related: docs/infra/AWS_IAM_SETUP.md

set -euo pipefail

ROLE_ARN="${1:-}"
SESSION_NAME="${2:-engify-session}"
PROFILE="${3:-${AWS_PROFILE:-default}}"

if [[ -z "$ROLE_ARN" ]]; then
  echo "Usage: eval \"$(scripts/aws/assume-role.sh <ROLE_ARN> [SESSION_NAME] [PROFILE])\"" >&2
  exit 2
fi

resp=$(aws sts assume-role \
  --role-arn "$ROLE_ARN" \
  --role-session-name "$SESSION_NAME" \
  --profile "$PROFILE" \
  --output json)

AKID=$(echo "$resp" | jq -r '.Credentials.AccessKeyId')
SAK=$(echo "$resp" | jq -r '.Credentials.SecretAccessKey')
TOKEN=$(echo "$resp" | jq -r '.Credentials.SessionToken')
EXP=$(echo "$resp" | jq -r '.Credentials.Expiration')

if [[ -z "$AKID" || -z "$SAK" || -z "$TOKEN" ]]; then
  echo "Failed to assume role. Check ROLE_ARN and profile." >&2
  exit 1
fi

cat <<EOF
export AWS_ACCESS_KEY_ID="$AKID"
export AWS_SECRET_ACCESS_KEY="$SAK"
export AWS_SESSION_TOKEN="$TOKEN"
export AWS_PROFILE="$PROFILE"
export AWS_SESSION_EXPIRATION="$EXP"
EOF


