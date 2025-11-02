# Package.json Scripts Update - Admin CLI

**Proposed Update**: Add unified admin CLI scripts to package.json  
**Date:** November 2, 2025  
**Status:** Ready to apply  
**Impact:** Low - adds new scripts, keeps old ones for backwards compatibility

---

## Proposed Changes

### Add These Scripts

```json
{
  "scripts": {
    // New unified admin CLI
    "admin": "tsx scripts/admin/engify-admin.ts",
    "admin:help": "tsx scripts/admin/engify-admin.ts --help",
    
    // Stats commands
    "admin:stats:all": "tsx scripts/admin/engify-admin.ts stats all",
    "admin:stats:prompts": "tsx scripts/admin/engify-admin.ts stats prompts",
    "admin:stats:users": "tsx scripts/admin/engify-admin.ts stats users",
    "admin:stats:beta": "tsx scripts/admin/engify-admin.ts stats beta",
    
    // User commands
    "admin:user:check": "tsx scripts/admin/engify-admin.ts user check",
    "admin:user:list": "tsx scripts/admin/engify-admin.ts user list",
    
    // Prompt commands
    "admin:prompts:review": "tsx scripts/admin/engify-admin.ts prompts review",
    "admin:prompts:inactive": "tsx scripts/admin/engify-admin.ts prompts inactive",
    
    // Database commands
    "admin:db:check": "tsx scripts/admin/engify-admin.ts db check",
    "admin:db:indexes": "tsx scripts/admin/engify-admin.ts db indexes",
    "admin:db:collections": "tsx scripts/admin/engify-admin.ts db collections"
  }
}
```

### Keep Existing (Backwards Compatibility)

```json
{
  "scripts": {
    // Keep these - they're still used in docs
    "admin:stats": "tsx scripts/admin/db-stats.ts",
    "admin:review-prompts": "tsx scripts/admin/review-prompts.ts"
  }
}
```

---

## Usage Examples

### Before
```bash
# Long commands
pnpm exec tsx scripts/admin/db-stats.ts
pnpm exec tsx scripts/admin/review-prompts.ts
```

### After
```bash
# Short, discoverable commands
pnpm admin stats all
pnpm admin prompts review
pnpm admin user check user@example.com
pnpm admin db check
```

### Help
```bash
pnpm admin --help
pnpm admin stats --help
pnpm admin user --help
```

---

## Benefits

1. **Discoverable**: Tab completion shows all admin commands
2. **Consistent**: All admin tasks use `admin:` prefix
3. **Shorter**: Less typing for common tasks
4. **Backwards Compatible**: Old scripts still work
5. **Professional**: Matches industry patterns (next, eslint, etc.)

---

## Migration Path

### Phase 1: Add New Scripts (This Update)
- Add all `admin:*` commands
- Document new commands
- Keep old scripts working

### Phase 2: Update Documentation (Later)
- Update README with new commands
- Add examples to docs
- Deprecation notices in old script files

### Phase 3: Remove Old Scripts (Much Later)
- After 3+ months
- After confirming new CLI is stable
- Only if team agrees

---

## Complete Diff

```diff
  "scripts": {
    "dev": "next dev",
    // ... existing scripts ...
    
+   // Unified Admin CLI
+   "admin": "tsx scripts/admin/engify-admin.ts",
+   "admin:help": "tsx scripts/admin/engify-admin.ts --help",
+   
+   // Stats Commands
+   "admin:stats:all": "tsx scripts/admin/engify-admin.ts stats all",
+   "admin:stats:prompts": "tsx scripts/admin/engify-admin.ts stats prompts",
+   "admin:stats:users": "tsx scripts/admin/engify-admin.ts stats users",
+   "admin:stats:beta": "tsx scripts/admin/engify-admin.ts stats beta",
+   
+   // User Commands
+   "admin:user:check": "tsx scripts/admin/engify-admin.ts user check",
+   "admin:user:list": "tsx scripts/admin/engify-admin.ts user list",
+   
+   // Prompt Commands
+   "admin:prompts:review": "tsx scripts/admin/engify-admin.ts prompts review",
+   "admin:prompts:inactive": "tsx scripts/admin/engify-admin.ts prompts inactive",
+   
+   // Database Commands
+   "admin:db:check": "tsx scripts/admin/engify-admin.ts db check",
+   "admin:db:indexes": "tsx scripts/admin/engify-admin.ts db indexes",
+   "admin:db:collections": "tsx scripts/admin/engify-admin.ts db collections",
    
    // Keep existing (backwards compatibility)
    "admin:stats": "tsx scripts/admin/db-stats.ts",
    "admin:review-prompts": "tsx scripts/admin/review-prompts.ts",
    
    "content:sitemap": "tsx scripts/content/sitemap-crawl.ts",
    // ... rest of existing scripts ...
  }
```

---

## Testing

```bash
# Test each new command
pnpm admin --help
pnpm admin stats all
pnpm admin stats prompts
pnpm admin prompts review
pnpm admin user list
pnpm admin db check

# Verify old commands still work
pnpm admin:stats
pnpm admin:review-prompts
```

---

## Recommendation

✅ **Apply this update** - Low risk, high benefit

- Adds professional admin CLI interface
- Maintains backwards compatibility
- No breaking changes
- Easy to test and verify

