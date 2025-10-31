#!/usr/bin/env bash
#
# AI Summary: Prints current AWS caller identity for a given profile.
# Related: docs/infra/AWS_IAM_SETUP.md

set -euo pipefail

PROFILE="${1:-${AWS_PROFILE:-default}}"

aws sts get-caller-identity --profile "$PROFILE" --output json


