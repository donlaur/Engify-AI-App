#!/bin/bash
# Git History Security Audit Script
# Checks for exposed secrets in git history

echo "🔍 Scanning git history for exposed secrets..."
echo ""

# Patterns to check
PATTERNS=(
  "AKIA[0-9A-Z]{16}"  # AWS Access Key
  "sk-[a-zA-Z0-9]{32,}"  # OpenAI/Stripe API Key
  "mongodb\+srv://[^:]+:[^@]+@[^ ]+"  # MongoDB connection string
  "64haaujuedgbhsu9p01avf4d10"  # Cognito Client ID
  "us-east-1_tsIIjaxYi"  # Cognito User Pool ID
  "1pg3uieid6a9v3mc7a7lugq0662lgfl5449l39oa8hb3gbetlqd1"  # Cognito Client Secret
  "COGNITO_CLIENT_SECRET="
  "COGNITO_CLIENT_ID="
  "COGNITO_USER_POOL_ID="
  "8257-6541-9928"  # AWS Account ID
)

FOUND_ISSUES=0

for pattern in "${PATTERNS[@]}"; do
  echo "Checking for: $pattern"
  RESULTS=$(git log --all --full-history -p --source | grep -E "$pattern" | head -5)
  
  if [ ! -z "$RESULTS" ]; then
    echo "⚠️  FOUND MATCHES:"
    echo "$RESULTS" | head -3
    echo ""
    FOUND_ISSUES=1
  else
    echo "✅ No matches found"
  fi
  echo ""
done

if [ $FOUND_ISSUES -eq 1 ]; then
  echo "🚨 SECURITY ISSUES FOUND IN GIT HISTORY"
  echo ""
  echo "To remove from history, you can use:"
  echo "  git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch <file>' --prune-empty --tag-name-filter cat -- --all"
  echo ""
  echo "OR use BFG Repo-Cleaner (recommended):"
  echo "  brew install bfg"
  echo "  bfg --replace-text secrets.txt"
  echo ""
  echo "⚠️  WARNING: This will rewrite git history. All collaborators will need to re-clone."
  exit 1
else
  echo "✅ No security issues found in git history"
  exit 0
fi

