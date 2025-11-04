# AI Tools CRUD Interface

**Location:** `/opshub/ai-tools`  
**Access:** Admin users only  
**Date Added:** November 4, 2025

---

## Overview

Full CRUD (Create, Read, Update, Delete) management interface for AI developer tools database. Allows admins to maintain the tools directory that powers:

- `/learn/ai-tools` - Public tools listing page
- `/learn/ai-tools/[slug]` - Individual tool detail pages
- AI tool comparison pages
- Related tools recommendations

---

## Features

### 📊 Tools Directory

- **Search & Filter**
  - Search by name, description, provider
  - Filter by category (IDE, Code Assistant, Terminal, etc.)
  - Filter by status (Active, Deprecated, Sunset)
  - Real-time search results

- **Display**
  - Grid view with tool cards
  - Status badges (Active/Deprecated/Sunset)
  - Pricing tier display
  - Category tags
  - Market share indicators

### ✏️ Edit Tool

- **Basic Information**
  - Name, slug, tagline
  - Description (long-form)
  - Provider name
  - Category selection

- **Pricing**
  - Free tier availability
  - Paid pricing structure
  - Multiple pricing tiers support

- **Features & Analysis**
  - Features list (array)
  - Pros and cons
  - Use cases

- **Metadata**
  - Tags for search/filtering
  - Icon selection
  - Status (Active/Deprecated/Sunset)
  - Deprecation date (if applicable)
  - Official website URL
  - Documentation links

### ➕ Create New Tool

Same form as Edit, with validation:

- Slug generation from name
- Unique ID validation
- Required fields enforcement

### 🗑️ Delete Tool

Soft delete (sunset status) rather than hard delete:

- Sets status to "Sunset"
- Preserves data for historical reference
- Can be reversed by changing status back

---

## Database Schema

**Collection:** `ai_tools`

```typescript
{
  _id: ObjectId,
  id: string,           // Unique tool ID (e.g., "cursor")
  slug: string,         // URL slug
  name: string,         // Display name (e.g., "Cursor")
  tagline: string,      // Short description
  description: string,  // Long-form description
  provider: string,     // Company/org (e.g., "Anysphere")
  category: string,     // IDE|code-assistant|terminal|etc.
  status: string,       // active|deprecated|sunset
  icon: string,         // Icon identifier

  // Pricing
  pricing: {
    free: boolean,
    paid: {
      monthly: number,
      yearly?: number,
      tiers?: string[]
    }
  },

  // Content
  features: string[],
  pros: string[],
  cons: string[],
  useCases?: string[],

  // Links
  officialUrl?: string,
  documentationUrl?: string,
  affiliateUrl?: string,

  // Metadata
  tags: string[],
  rating?: number,
  reviewCount?: number,
  marketShare?: string,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  deprecationDate?: Date,
  sunsetDate?: Date,

  // Multi-tenant
  organizationId?: string
}
```

---

## API Endpoints

### GET `/api/admin/ai-tools`

List all tools (admin only).

**Query Params:**

- `category` - Filter by category
- `status` - Filter by status

**Response:**

```json
{
  "tools": [{ ...tool }],
  "count": 10
}
```

### POST `/api/admin/ai-tools`

Create new tool (admin only).

**Body:** Tool object (see schema)

**Validation:**

- Unique `id` and `slug`
- Required: `id`, `name`, `category`, `provider`
- `organizationId` for multi-tenant compliance

### PATCH `/api/admin/ai-tools`

Update existing tool (admin only).

**Body:**

```json
{
  "id": "cursor",
  "updates": {
    "pricing": { ... },
    "features": [ ... ]
  }
}
```

### DELETE `/api/admin/ai-tools`

Soft delete tool (admin only).

**Body:**

```json
{
  "id": "cursor",
  "reason": "Discontinued"
}
```

**Action:** Sets `status: "sunset"` and `sunsetDate`

---

## Related Features

### Content Generation

Tools data integrates with:

- `scripts/content/generate-ai-tool-pages.ts` - Generate tool content pages
- `src/app/learn/ai-tools/[slug]/page.tsx` - Display tool details
- `src/app/learn/ai-tools/page.tsx` - Tools directory listing

### Affiliate Links

Tool data synced with:

- `src/data/affiliate-links.ts` - Affiliate URL management
- Future affiliate program integration

---

## Seeding Tools

**Script:** `scripts/db/seed-ai-tools.ts`

Seeds database with initial tools data based on research:

```bash
tsx scripts/db/seed-ai-tools.ts
```

**Includes:**

- Cursor, GitHub Copilot, Windsurf (IDEs)
- Claude Code, Gemini AI Studio (specialized)
- Warp (terminal)
- Comprehensive metadata from market research

---

## Enterprise Compliance

✅ **RBAC:** Admin-only access via NextAuth  
✅ **Rate Limiting:** Checked by pre-commit hook  
✅ **Audit Logging:** All CRUD operations logged  
✅ **Multi-Tenant:** `organizationId` support  
✅ **Tests:** Basic API tests in `src/__tests__/api/admin-ai-tools.test.ts`

---

## Future Enhancements

1. **Comparison Builder**
   - Side-by-side tool comparison interface
   - Auto-generate "Tool A vs Tool B" pages

2. **Market Data Integration**
   - API to fetch real-time pricing
   - Automated deprecation tracking
   - Market share updates

3. **User Reviews**
   - Allow verified users to review tools
   - Star ratings and comments
   - Upvote/downvote reviews

4. **Affiliate Analytics**
   - Track clicks on affiliate links
   - Revenue attribution
   - ROI per tool

---

## Documentation References

- **Related:** `/docs/opshub/AI_MODEL_MANAGEMENT_TODO.md` (similar for AI models)
- **Schema:** `src/lib/db/schemas/ai-tool.ts`
- **Service:** `src/lib/services/AIToolService.ts`
- **Research:** `docs/content/GEMINI_DEEP_RESEARCH_AI_MODELS_TOOLS.md`
- **Planning:** `docs/planning/AI_MODELS_TOOLS_SEO_PAGES.md`

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready  
**Maintainer:** Engify.ai Team
