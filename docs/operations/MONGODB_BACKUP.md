# MongoDB Backup System

## Overview

Automated hourly backups of all MongoDB collections with data verification.

## Features

- ✅ **Full Database Backup**: Backs up all collections automatically
- ✅ **Data Verification**: Verifies backup integrity and completeness
- ✅ **Automatic Cleanup**: Keeps last 24 hours of backups (configurable)
- ✅ **Detailed Reports**: JSON reports with backup statistics
- ✅ **Gitignored**: Backups stored in `backups/` directory (gitignored)

## Usage

### Manual Backup

```bash
# Run backup manually
pnpm run backup:db

# Or directly
pnpm exec tsx scripts/db/backup-mongodb.ts
```

### Automated Hourly Backups (Cron)

```bash
# Set up hourly cron job
./scripts/db/setup-backup-cron.sh

# View cron jobs
crontab -l

# View backup logs
tail -f logs/backup-cron.log
```

### Backup Files

Backups are stored in `backups/` directory with timestamped filenames:
- `{collection}_{YYYY-MM-DD_HH-MM-SS}.json` - Collection backups
- `backup-report_{YYYY-MM-DD_HH-MM-SS}.json` - Backup verification reports

### Backup Verification

The script automatically verifies:
- ✅ All collections backed up
- ✅ All data exists in backup files
- ✅ Backup file integrity (valid JSON, contains documents)
- ✅ Document structure (has _id or id field)

### Cleanup

Old backups are automatically cleaned up:
- Keeps last 24 hours of backups (configurable via `MAX_BACKUPS` in script)
- Automatically removes older backups

## Backup Statistics

Latest backup report shows:
- **Collections**: 15
- **Total Documents**: 286
- **Total Size**: ~0.70 MB

## Collections Backed Up

1. `patterns` - Prompt patterns
2. `ai_tools` - AI tools catalog
3. `rate_limits` - Rate limiting config
4. `user_gamification` - User gamification data
5. `users` - User accounts
6. `learning_resources` - Learning resources
7. `prompts` - Prompt library
8. `ai_models` - AI model configurations
9. `prompt_test_results` - Test results
10. `web_content` - Web content
11. `partnership_outreach` - Partnerships
12. `learning_content` - Learning content
13. `ai_integration_sessions` - Integration sessions
14. `affiliate_config` - Affiliate configuration
15. `feedback_rate_limits` - Feedback rate limits

## Cron Schedule

The cron job runs **every hour at minute 0**:
```
0 * * * * cd /path/to/repo && pnpm exec tsx scripts/db/backup-mongodb.ts
```

## Troubleshooting

### Backup Fails

Check logs:
```bash
tail -f logs/backup-cron.log
```

### Verify Backup Integrity

```bash
# Check latest backup report
cat backups/backup-report_*.json | tail -1 | jq

# Verify specific collection
cat backups/prompts_*.json | jq 'length'
```

### Manual Verification

```bash
# Count documents in backup
jq 'length' backups/prompts_2025-11-05_00-39-03.json

# Verify backup structure
jq '.[0]' backups/prompts_2025-11-05_00-39-03.json
```

## Security Notes

- ⚠️ **Backups contain sensitive data** (user accounts, sessions, etc.)
- ⚠️ **Backups are gitignored** - never commit backup files
- ⚠️ **Backups stored locally** - consider cloud backup for production
- ⚠️ **Access control** - ensure backup directory has proper permissions

## Future Improvements

- [ ] Cloud backup integration (S3, etc.)
- [ ] Encrypted backups
- [ ] Backup retention policies
- [ ] Backup monitoring/alerts
- [ ] Restore script

