# Data Backup Strategy

**Purpose**: JSON backups as fallback if MongoDB is unavailable

**Status**: All data is in MongoDB. These JSON files are backups only.

---

## 📋 Backup Files

### Current Backups:
- `prompts-backup.json` - All prompts from MongoDB
- `learning-resources-backup.json` - All learning resources
- `patterns-backup.json` - Pattern definitions

### Update Schedule:
- Manual: After significant data changes
- Automated: TODO - Add script to export from MongoDB

---

## 🔄 Usage

### Normal Operation:
**Always use MongoDB** - These files are NOT used in production

### Fallback Mode:
If MongoDB is down, app can fall back to JSON files:
```typescript
// Example fallback logic
let prompts;
try {
  prompts = await db.collection('prompts').find().toArray();
} catch (error) {
  console.warn('MongoDB unavailable, using backup');
  prompts = require('@/data/backup/prompts-backup.json');
}
```

---

## 📝 Export Script

### To Create Backups:

```bash
# Export all prompts
pnpm run export:prompts

# Export all learning resources
pnpm run export:resources

# Export all patterns
pnpm run export:patterns

# Export everything
pnpm run export:all
```

### Scripts (add to package.json):
```json
{
  "scripts": {
    "export:prompts": "tsx scripts/export-prompts.ts",
    "export:resources": "tsx scripts/export-resources.ts",
    "export:patterns": "tsx scripts/export-patterns.ts",
    "export:all": "tsx scripts/export-all.ts"
  }
}
```

---

## ⚠️ Important Notes

1. **MongoDB is Source of Truth** - Always use database in production
2. **JSON is Backup Only** - Don't edit JSON files directly
3. **Keep Backups Updated** - Export after major data changes
4. **Version Control** - Commit JSON backups to git
5. **Fallback Logic** - Only use JSON if MongoDB fails

---

## 🚀 Future Improvements

- [ ] Automated daily exports
- [ ] Backup to S3/cloud storage
- [ ] Restore script (JSON → MongoDB)
- [ ] Backup validation tests
- [ ] Backup age monitoring
