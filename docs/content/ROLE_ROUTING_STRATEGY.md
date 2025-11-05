# Role Routing & Slug Strategy

**Engify.ai - Role-Based Page Routing**

---

## 🎯 Current Routing Patterns

We have **two different routing patterns** for role-based pages:

### Pattern 1: Static Pages (`/for-{role}`)

**Existing Pages:**
- `/for-engineers` ✅
- `/for-managers` ✅
- `/for-pms` ✅
- `/for-qa` ✅
- `/for-designers` ✅
- `/for-directors` ✅
- `/for-c-level` ✅

**Used In:**
- `src/components/roles/RoleSelector.tsx`
- `src/lib/constants.ts` → `ROLE_ROUTES`
- `src/app/sitemap.ts`

**Pros:**
- Simple, straightforward URLs
- Good for SEO (static pages)
- Already established pattern

**Cons:**
- Requires manual page creation for each role
- Not scalable (one file per role)

---

### Pattern 2: Dynamic Route (`/prompts/role/[role]`)

**Existing Route:**
- `/prompts/role/[role]` ✅

**Database Role Values:**
- `engineer`
- `engineering-manager`
- `product-manager`
- `qa`
- `architect`
- `devops-sre`
- `scrum-master`
- `product-owner`
- `director`
- `designer`

**Example URLs:**
- `/prompts/role/engineer`
- `/prompts/role/engineering-manager`
- `/prompts/role/product-manager`

**Pros:**
- Scalable (one component handles all roles)
- Automatically supports new roles
- Uses database role values directly

**Cons:**
- Less SEO-friendly (dynamic route)
- URL structure is less intuitive (`/prompts/role/` vs `/for-`)

---

## 🔄 Role Mapping

### Database → Static Page Mapping

| Database Role | Static Page Slug | URL | Status |
|--------------|------------------|-----|--------|
| `engineer` | `engineers` | `/for-engineers` | ✅ Exists |
| `engineering-manager` | `managers` | `/for-managers` | ✅ Exists |
| `product-manager` | `pms` | `/for-pms` | ✅ Exists |
| `qa` | `qa` | `/for-qa` | ✅ Exists |
| `designer` | `designers` | `/for-designers` | ✅ Exists |
| `director` | `directors` | `/for-directors` | ✅ Exists |
| `architect` | `architects` | `/for-architects` | ❌ **Needs creation** |
| `devops-sre` | `devops-sre` | `/for-devops-sre` | ❌ **Needs creation** |
| `scrum-master` | `scrum-masters` | `/for-scrum-masters` | ❌ **Needs creation** |
| `product-owner` | `product-owners` | `/for-product-owners` | ❌ **Needs creation** |

---

## 💡 Recommended Approach

### Option 1: Enhance Existing Static Pages (Recommended)

**Keep `/for-{role}` pattern** and enhance existing pages with:
- Featured prompts from database
- Pattern showcase
- Use cases
- Dynamic content loading

**Add new static pages for missing roles:**
- `/for-architects`
- `/for-devops-sre`
- `/for-scrum-masters`
- `/for-product-owners`

**Pros:**
- Consistent with existing pattern
- Good SEO (static pages)
- Clear, memorable URLs
- Users already familiar with `/for-*` pattern

**Cons:**
- Requires manual page creation
- But only 4 new pages needed

---

### Option 2: Create Dynamic `/roles/[role]` Route

**Create new dynamic route:**
- `/roles/[role]` → maps to database role values

**URL Examples:**
- `/roles/engineers` → database role `engineer`
- `/roles/engineering-managers` → database role `engineering-manager`
- `/roles/architects` → database role `architect`

**Pros:**
- Scalable (one component)
- Automatically supports new roles
- More RESTful URL structure

**Cons:**
- Different from existing `/for-*` pattern
- Requires URL slug → database role mapping
- May confuse users familiar with `/for-*`

---

### Option 3: Hybrid Approach

**Use both patterns:**
- `/for-{role}` → Enhanced landing pages (marketing/SEO)
- `/prompts/role/[role]` → Keep for filtering/browsing

**Pros:**
- Best of both worlds
- Landing pages for SEO
- Dynamic filtering for functionality

**Cons:**
- Two different patterns to maintain

---

## 🎨 Recommended Slug Format

### For Static Pages (`/for-{role}`)

**Pattern:** `/for-{plural-kebab-case}`

| Role | Slug | URL |
|------|------|-----|
| Engineers | `engineers` | `/for-engineers` |
| Engineering Managers | `managers` | `/for-managers` |
| Product Managers | `pms` | `/for-pms` |
| QA Engineers | `qa` | `/for-qa` |
| Architects | `architects` | `/for-architects` |
| DevOps/SRE | `devops-sre` | `/for-devops-sre` |
| Scrum Masters | `scrum-masters` | `/for-scrum-masters` |
| Product Owners | `product-owners` | `/for-product-owners` |
| Directors | `directors` | `/for-directors` |
| Designers | `designers` | `/for-designers` |

### For Dynamic Routes (`/prompts/role/[role]`)

**Pattern:** Use database role values directly

| Database Role | URL |
|--------------|-----|
| `engineer` | `/prompts/role/engineer` |
| `engineering-manager` | `/prompts/role/engineering-manager` |
| `product-manager` | `/prompts/role/product-manager` |
| `qa` | `/prompts/role/qa` |
| `architect` | `/prompts/role/architect` |
| `devops-sre` | `/prompts/role/devops-sre` |
| `scrum-master` | `/prompts/role/scrum-master` |
| `product-owner` | `/prompts/role/product-owner` |
| `director` | `/prompts/role/director` |
| `designer` | `/prompts/role/designer` |

---

## 📋 Implementation Checklist

### Phase 1: Enhance Existing Pages

- [x] `/for-engineers` - ✅ Exists
- [x] `/for-managers` - ✅ Exists
- [x] `/for-pms` - ✅ Exists
- [x] `/for-qa` - ✅ Exists
- [x] `/for-designers` - ✅ Exists
- [x] `/for-directors` - ✅ Exists

**Action:** Enhance these pages with dynamic content from database

### Phase 2: Create Missing Pages

- [ ] `/for-architects` - ❌ Create new page
- [ ] `/for-devops-sre` - ❌ Create new page
- [ ] `/for-scrum-masters` - ❌ Create new page
- [ ] `/for-product-owners` - ❌ Create new page

**Action:** Create new static pages following existing pattern

---

## 🔗 URL Mapping Helper

```typescript
// src/lib/utils/role-mapping.ts

/**
 * Maps database role values to static page slugs
 */
export const DB_ROLE_TO_SLUG: Record<string, string> = {
  'engineer': 'engineers',
  'engineering-manager': 'managers',
  'product-manager': 'pms',
  'qa': 'qa',
  'architect': 'architects',
  'devops-sre': 'devops-sre',
  'scrum-master': 'scrum-masters',
  'product-owner': 'product-owners',
  'director': 'directors',
  'designer': 'designers',
};

/**
 * Maps static page slugs to database role values
 */
export const SLUG_TO_DB_ROLE: Record<string, string> = {
  'engineers': 'engineer',
  'managers': 'engineering-manager',
  'pms': 'product-manager',
  'qa': 'qa',
  'architects': 'architect',
  'devops-sre': 'devops-sre',
  'scrum-masters': 'scrum-master',
  'product-owners': 'product-owner',
  'directors': 'director',
  'designers': 'designer',
};

/**
 * Get static page URL for a database role
 */
export function getRolePageUrl(dbRole: string): string {
  const slug = DB_ROLE_TO_SLUG[dbRole] || dbRole;
  return `/for-${slug}`;
}

/**
 * Get database role from static page slug
 */
export function getDbRoleFromSlug(slug: string): string {
  return SLUG_TO_DB_ROLE[slug] || slug;
}
```

---

## 📚 Related Documentation

- [Landing Page Strategy](./LANDING_PAGE_STRATEGY.md)
- [Multi-Agent System Comprehensive Guide](./MULTI_AGENT_SYSTEM_COMPREHENSIVE.md)

---

**Last Updated:** November 5, 2025  
**Status:** 📋 Planning Phase  
**Recommendation:** Use `/for-{role}` pattern (Option 1)
