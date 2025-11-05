#!/bin/bash
# MongoDB Backup Cron Setup
# Run this script to set up hourly MongoDB backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CRON_LOG="$REPO_ROOT/logs/backup-cron.log"

echo "🔧 Setting up MongoDB backup cron job..."
echo ""

# Ensure logs directory exists
mkdir -p "$REPO_ROOT/logs"

# Get the current user's crontab
CRON_CMD="cd $REPO_ROOT && pnpm exec tsx scripts/db/backup-mongodb.ts >> $CRON_LOG 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-mongodb.ts"; then
  echo "⚠️  Backup cron job already exists!"
  echo ""
  echo "Current cron jobs:"
  crontab -l 2>/dev/null | grep "backup-mongodb.ts" || true
  echo ""
  read -p "Do you want to replace it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled. Exiting."
    exit 1
  fi
  # Remove existing backup cron job
  crontab -l 2>/dev/null | grep -v "backup-mongodb.ts" | crontab -
fi

# Add hourly backup cron job (runs at minute 0 of every hour)
(crontab -l 2>/dev/null; echo "# MongoDB hourly backup - $(date)"; echo "0 * * * * $CRON_CMD") | crontab -

echo "✅ Cron job installed successfully!"
echo ""
echo "📋 Cron job details:"
echo "   Schedule: Every hour at minute 0"
echo "   Command: $CRON_CMD"
echo "   Log file: $CRON_LOG"
echo ""
echo "📊 View cron jobs:"
echo "   crontab -l"
echo ""
echo "📜 View backup logs:"
echo "   tail -f $CRON_LOG"
echo ""
echo "🗑️  Remove cron job:"
echo "   crontab -l | grep -v 'backup-mongodb.ts' | crontab -"
echo ""
echo "🧪 Test backup manually:"
echo "   pnpm run backup:db"
echo ""


