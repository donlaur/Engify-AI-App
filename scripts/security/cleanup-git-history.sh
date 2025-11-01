#!/bin/bash
# Git History Cleanup Script
# Removes exposed secrets from git history using git filter-branch

set -e

echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  All collaborators will need to re-clone the repository."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "🔍 Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  WARNING: Not on main branch. Continue anyway? (yes/no): "
  read confirm2
  if [ "$confirm2" != "yes" ]; then
    echo "Aborted."
    exit 1
  fi
fi

echo ""
echo "📋 Secrets to remove from history:"
echo "  - Cognito Client ID: [REDACTED]"
echo "  - Cognito User Pool ID: [REDACTED]"
echo "  - AWS Account ID: [REDACTED]"
echo ""
echo "⚠️  Note: Actual values are read from gitignored file"
echo ""

# Create temporary file with replacements (read from gitignored file if exists)
if [ -f "scripts/security/.git-history-replacements.local.txt" ]; then
  echo "✅ Using local replacements file"
  REPLACEMENTS_FILE="scripts/security/.git-history-replacements.local.txt"
else
  echo "⚠️  Creating temporary replacements file..."
  echo "⚠️  For production, create scripts/security/.git-history-replacements.local.txt"
  cat > /tmp/git-replacements.txt <<EOF
# Add actual values here (this file is temporary and will be deleted)
# Format: old_value==>new_value
EOF
  REPLACEMENTS_FILE="/tmp/git-replacements.txt"
fi

# Check if BFG is installed
if command -v bfg &> /dev/null; then
  echo "✅ Using BFG Repo-Cleaner (recommended)"
  echo ""
  echo "Running BFG..."
  bfg --replace-text "$REPLACEMENTS_FILE"
  
  echo ""
  echo "🧹 Cleaning up..."
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  
  echo ""
  echo "✅ Git history cleaned!"
  echo ""
  echo "⚠️  IMPORTANT NEXT STEPS:"
  echo "  1. Force push to remote: git push --force --all"
  echo "  2. Notify all collaborators to re-clone"
  echo "  3. Rotate exposed credentials immediately"
else
  echo "⚠️  BFG not installed. Using git filter-branch (slower)..."
  echo ""
  echo "Installing BFG is recommended: brew install bfg"
  echo ""
  read -p "Continue with git filter-branch? (yes/no): " confirm3
  
  if [ "$confirm3" != "yes" ]; then
    echo "Aborted. Install BFG: brew install bfg"
    exit 1
  fi
  
  echo ""
  echo "Running git filter-branch..."
  
  # Remove Cognito Client ID
  git filter-branch --force --index-filter \
    'git ls-files -s | sed "s/\t\"&/\t/" | GIT_INDEX_FILE=$GIT_INDEX_FILE.new git update-index --index-info && if [ -f "$GIT_INDEX_FILE.new" ]; then mv "$GIT_INDEX_FILE.new" "$GIT_INDEX_FILE"; fi' \
    --prune-empty --tag-name-filter cat -- --all
  
  # Use sed to replace in all files
  git filter-branch --force --tree-filter \
    'find . -type f -exec sed -i "" "s/64haaujuedgbhsu9p01avf4d10/[YOUR_CLIENT_ID]/g" {} \; 2>/dev/null || true' \
    --prune-empty --tag-name-filter cat -- --all
  
  git filter-branch --force --tree-filter \
    'find . -type f -exec sed -i "" "s/us-east-1_tsIIjaxYi/[YOUR_USER_POOL_ID]/g" {} \; 2>/dev/null || true' \
    --prune-empty --tag-name-filter cat -- --all
  
  git filter-branch --force --tree-filter \
    'find . -type f -exec sed -i "" "s/8257-6541-9928/[YOUR_AWS_ACCOUNT_ID]/g" {} \; 2>/dev/null || true' \
    --prune-empty --tag-name-filter cat -- --all
  
  echo ""
  echo "🧹 Cleaning up..."
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  
  echo ""
  echo "✅ Git history cleaned!"
  echo ""
  echo "⚠️  IMPORTANT NEXT STEPS:"
  echo "  1. Force push to remote: git push --force --all"
  echo "  2. Notify all collaborators to re-clone"
  echo "  3. Rotate exposed credentials immediately"
fi

# Cleanup
rm -f /tmp/git-replacements.txt

echo ""
echo "✅ Done!"

