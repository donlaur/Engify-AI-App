# OpsHub Admin - Script Migration Plan

**Goal:** Move CLI admin scripts to web-based OpsHub Admin for better UX

**Current State:** 7 admin scripts that should be web UI
**Target State:** Integrated into `/opshub` with proper RBAC

---

## Phase 1: User Management (HIGH PRIORITY)

### 1. `admin/check-user.ts` → User Management UI ⭐
**Current:** Hardcoded CLI script for checking one email
```bash
tsx scripts/admin/check-user.ts  # Only checks donlaur@engify.ai
```

**Migrate to:** `/opshub/users` page with:
- Search users by email/name
- View user details (name, email, role, password status)
- Update user roles (dropdown: user → admin → super_admin)
- Delete/suspend users
- User activity log

**API:** `/api/admin/users` (GET, PATCH, DELETE)
**RBAC:** super_admin only
**Impact:** Remove 1 script, better UX for user management

---

## Phase 2: Database Insights (HIGH PRIORITY)

### 2. `admin/db-stats.ts` → Database Dashboard ⭐
**Current:** CLI output of collection counts
```bash
pnpm admin:stats          # Shows all collections
pnpm admin:stats prompts  # Shows specific collection
```

**Migrate to:** `/opshub/database` page with:
- Collection cards showing document counts
- Visual charts (pie chart for categories, bar chart for trends)
- Filter by collection type
- Export to CSV/JSON
- Real-time updates

**API:** `/api/admin/database/stats` (GET)
**RBAC:** admin, super_admin
**Impact:** Remove 1 script, better data visibility

---

## Phase 3: Content Quality (MEDIUM PRIORITY)

### 3. `admin/review-prompts.ts` → Prompt Review UI
**Current:** CLI review workflow
```bash
pnpm admin:review-prompts
```

**Migrate to:** `/opshub/prompts/review` page with:
- List prompts needing review
- Rating system (1-5 stars)
- Bulk approve/reject
- Quality score display
- Edit inline

**API:** `/api/admin/prompts/review` (GET, POST)
**RBAC:** admin, super_admin
**Impact:** Remove 1 script, faster content review

### 4. `admin/audit-prompt-quality.ts` → Quality Dashboard
**Current:** CLI audit output
```bash
pnpm admin:audit-quality
```

**Migrate to:** `/opshub/quality` page with:
- Quality metrics dashboard
- Trend charts over time
- Filter by score range
- Download audit reports (PDF/CSV)
- Schedule automated audits

**API:** `/api/admin/quality/audit` (POST)
**RBAC:** admin, super_admin
**Impact:** Remove 1 script, better quality tracking

---

## Phase 4: Database Operations (MEDIUM PRIORITY)

### 5. `db/sync-ai-models-latest.ts` → AI Models Sync Button
**Current:** CLI sync command
```bash
pnpm db:sync-models
```

**Migrate to:** Add to existing `/opshub/ai-models` page:
- "Sync Latest Models" button
- Progress indicator (syncing X of Y models)
- Last sync timestamp
- Sync log (what changed)

**API:** `/api/admin/ai-models/sync` (POST)
**RBAC:** admin, super_admin
**Impact:** Better integration with existing AI Models CRUD

### 6. `db/backup-mongodb.ts` → Backup Management UI
**Current:** CLI backup command
```bash
pnpm db:backup
```

**Migrate to:** `/opshub/backups` page with:
- List recent backups (timestamp, size, status)
- "Create Backup Now" button
- Schedule automated backups (cron-like UI)
- Download backup files
- Restore from backup (with confirmation)

**API:** `/api/admin/backups` (GET, POST)
**RBAC:** super_admin only
**Impact:** Remove 1 script, better data protection UX

---

## Phase 5: Content Auditing (LOW PRIORITY)

### 7. `content/audit-prompts-patterns.ts` → Content Audit UI
**Current:** Used by API `/api/prompts/[id]/audit/route.ts`
**Status:** Already has API, just needs frontend

**Migrate to:** `/opshub/content/audit` page with:
- Trigger audits manually (button)
- View audit results (table)
- Filter by audit score
- Export audit reports
- Batch audit multiple items

**API:** Already exists at `/api/prompts/[id]/audit`
**RBAC:** admin, super_admin
**Impact:** Keep script (API uses it), add UI

---

## Implementation Priority

### Sprint 1: Foundation
1. ✅ User Management UI (check-user.ts)
2. ✅ Database Dashboard (db-stats.ts)

### Sprint 2: Quality
3. ⏳ Prompt Review UI (review-prompts.ts)
4. ⏳ Quality Dashboard (audit-prompt-quality.ts)

### Sprint 3: Operations
5. ⏳ AI Models Sync (sync-ai-models-latest.ts)
6. ⏳ Backup Management (backup-mongodb.ts)

### Sprint 4: Polish
7. ⏳ Content Audit UI (audit-prompts-patterns.ts)

---

## Technical Details

### Shared Components
Create reusable components:
- `<StatsCard />` - Show counts with icons
- `<DataTable />` - Filterable, sortable tables
- `<ProgressBar />` - For sync/backup operations
- `<ConfirmDialog />` - For destructive actions

### API Structure
```
/api/admin/
  ├── users/          # User management
  ├── database/       # DB stats
  │   └── stats/
  ├── quality/        # Quality audits
  │   └── audit/
  ├── ai-models/      # Model management (exists)
  │   └── sync/       # NEW
  └── backups/        # Backup management
```

### RBAC Matrix
| Feature | User | Admin | Super Admin |
|---------|------|-------|-------------|
| User Management | ❌ | ❌ | ✅ |
| Database Stats | ❌ | ✅ | ✅ |
| Prompt Review | ❌ | ✅ | ✅ |
| Quality Audit | ❌ | ✅ | ✅ |
| AI Models Sync | ❌ | ✅ | ✅ |
| Backup Mgmt | ❌ | ❌ | ✅ |
| Content Audit | ❌ | ✅ | ✅ |

---

## Benefits After Migration

✅ **Better UX:** Web UI vs CLI commands
✅ **Faster:** Click buttons vs typing commands
✅ **Accessible:** From anywhere, not just terminal
✅ **Visual:** Charts and graphs vs text output
✅ **RBAC:** Proper access control
✅ **Audit Trail:** All actions logged
✅ **Mobile Friendly:** Responsive design

---

## Scripts After Migration

**Can Remove (7 scripts):**
- `admin/check-user.ts`
- `admin/db-stats.ts`
- `admin/review-prompts.ts`
- `admin/audit-prompt-quality.ts`
- `db/sync-ai-models-latest.ts`
- `db/backup-mongodb.ts`

**Keep (used by API):**
- `content/audit-prompts-patterns.ts`

**Total Impact:** -6 scripts after full migration

---

**Last Updated:** 2025-11-18
**Status:** Planning
**Next Step:** Implement User Management UI (Sprint 1)
