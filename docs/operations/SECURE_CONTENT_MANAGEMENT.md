# Secure Content Management Strategy

## 🚨 Problem: Content Exposure in Public Repo

**Current State:**

- **90+ prompts** exposed in `src/data/seed-prompts.ts`
- **Management prompts** in `src/data/prompts/management/*.ts`
- **Director prompts** in `src/data/director-prompts.ts`
- **Learning resources** in JSON files
- **All content is stealable** from public GitHub repo

**Risk:** Anyone can copy all your valuable prompts and content.

## ✅ Solution: Direct Database Content Management

### Core Principle

**Content should live in MongoDB only, created via:**

1. Admin UI (OpsHub)
2. Private scripts (not in public repo)
3. API endpoints (admin-only)

### What Should Stay Public

- **Minimal example prompts** (3-5 examples for documentation)
- **Pattern definitions** (teaching concepts, not prompts)
- **API schemas** (how to use the system)
- **Documentation** (how things work)

### What Should Be Private

- **All production prompts** (90+ prompts)
- **Management templates**
- **Director prompts**
- **Learning resources content**
- **Knowledge base articles**

## 📋 Migration Plan

### Phase 1: Create Admin Content Management UI

**Location:** `/opshub/content/create`

**Features:**

- Create prompts directly in MongoDB
- Edit existing prompts
- Upload bulk content (JSON/CSV)
- Manage categories, tags, patterns
- Preview before publishing

**API Endpoints:**

- `POST /api/admin/prompts` - Create prompt
- `PUT /api/admin/prompts/[id]` - Update prompt
- `DELETE /api/admin/prompts/[id]` - Delete prompt
- `POST /api/admin/prompts/bulk` - Bulk import

### Phase 2: Move Content to MongoDB

**Steps:**

1. Run one-time migration script (private, not in repo)
2. Import all prompts from TypeScript files → MongoDB
3. Verify all content is in database
4. **Delete** or **deprecate** seed scripts

**Migration Script (Private):**

```typescript
// scripts/private/migrate-content-to-db.ts
// NOT in public repo - run locally or on secure server
// One-time script to move all content from TS files to MongoDB
```

### Phase 3: Remove Content from Public Repo

**Files to Remove/Deprecate:**

- ❌ `src/data/seed-prompts.ts` (keep only 3-5 examples)
- ❌ `src/data/director-prompts.ts` (move to DB)
- ❌ `src/data/prompts/management/*.ts` (move to DB)
- ❌ `src/data/additional-prompts.ts` (move to DB)
- ✅ Keep `src/data/prompt-patterns.ts` (patterns are teaching concepts)
- ✅ Keep minimal examples in `src/data/examples/` (3-5 prompts only)

**Replace with:**

```typescript
// src/data/examples/prompt-examples.ts
// Only 3-5 example prompts for documentation
export const examplePrompts = [
  // Minimal examples showing patterns
];
```

### Phase 4: Update Seed Scripts

**New Approach:**

- Seed scripts only for **initial setup** (empty database)
- Include **minimal example data** (3-5 prompts)
- **NOT** for production content
- Mark as deprecated in documentation

**Example:**

```typescript
// scripts/db/seed-examples.ts
// Only seeds minimal example data for development/testing
// NOT for production content!
```

## 🔐 Security Best Practices

### Content Creation Workflow

**Option 1: Admin UI (Recommended)**

```
Admin logs in → /opshub/content/create
→ Fills form → Saves to MongoDB
→ Content immediately available
```

**Option 2: Private Scripts**

```
Admin runs private script locally
→ Script reads from secure location
→ Inserts directly to MongoDB
→ Never committed to repo
```

**Option 3: API Import**

```
Admin uploads JSON/CSV via API
→ Validates content
→ Inserts to MongoDB
→ Audit logged
```

### Access Control

**All content creation requires:**

- ✅ Admin role (`super_admin`, `org_admin`)
- ✅ RBAC protection on API routes
- ✅ Audit logging for all changes
- ✅ Rate limiting on bulk imports

## 📊 Implementation Steps

### Step 1: Create Admin Content UI (Week 1)

**File:** `src/app/opshub/content/create/page.tsx`

**Features:**

- Form for creating prompts
- Rich text editor for content
- Tag/category selection
- Pattern selection
- Preview mode
- Save to MongoDB button

**API:** `POST /api/admin/prompts`

### Step 2: Create Migration Script (Week 1)

**File:** `scripts/private/migrate-content-to-db.ts` (NOT in repo)

**Purpose:**

- One-time migration of all TS file content to MongoDB
- Run locally or on secure server
- Never commit to repo

**After running:**

- All content is in MongoDB
- Can delete TS files with full content

### Step 3: Deprecate Seed Scripts (Week 2)

**Update:**

- Add deprecation warnings
- Update documentation
- Keep only minimal example seeding

**Remove:**

- `scripts/content/seed-management-prompts.ts`
- Bulk content seeding from public files

### Step 4: Clean Up Public Repo (Week 2)

**Actions:**

- Move full prompts to `.gitignore` pattern
- Create `src/data/examples/` with minimal examples
- Update imports to use MongoDB instead of TS files
- Remove full content files

## 🎯 New Content Workflow

### Creating New Prompts

**Old Way (Insecure):**

```typescript
// Add to src/data/seed-prompts.ts
// Commit to repo
// Anyone can copy
```

**New Way (Secure):**

```
1. Log into /opshub/content/create
2. Fill form with prompt details
3. Click "Save"
4. Prompt saved directly to MongoDB
5. Never touches public repo
```

### Bulk Import

**Old Way:**

```typescript
// Add JSON file to repo
// Seed script reads it
// Anyone can copy
```

**New Way:**

```
1. Prepare JSON/CSV file (private)
2. Upload via /opshub/content/import
3. Or use private script
4. Content goes directly to MongoDB
```

## 📝 Documentation Updates

### Update Seed Documentation

**New Message:**

```markdown
⚠️ **Deprecated:** Seed scripts are for minimal example data only.
Production content should be created via admin UI or private scripts.

See: [Content Management Guide](../operations/CONTENT_MANAGEMENT.md)
```

### Create Content Management Guide

**File:** `docs/operations/CONTENT_MANAGEMENT.md`

**Content:**

- How to create prompts via admin UI
- How to bulk import (private scripts)
- Security best practices
- Content versioning strategy

## 🔄 Backward Compatibility

### During Migration

**Keep:**

- Seed scripts work temporarily
- TS files as fallback
- Gradual migration

**After Migration:**

- Remove seed scripts
- Remove TS files with full content
- Use MongoDB as single source of truth

## ✅ Benefits

1. **Security:** Content not exposed in public repo
2. **Flexibility:** Easy to update content without code changes
3. **Audit Trail:** All changes logged in MongoDB
4. **Version Control:** Can track content changes in database
5. **User Management:** Multiple admins can create content
6. **A/B Testing:** Easy to test different content versions

## 🚀 Quick Wins

**Today:**

1. Create `/opshub/content/create` page
2. Create `POST /api/admin/prompts` endpoint
3. Document new workflow

**This Week:**

1. Migrate existing content to MongoDB (private script)
2. Deprecate seed scripts
3. Update documentation

**Next Week:**

1. Remove full content from public repo
2. Keep only minimal examples
3. Update all references to use MongoDB

---

**Summary:** Stop seeding from public files. Create content directly in MongoDB via admin UI or private scripts. Keep only minimal examples in public repo for documentation.
