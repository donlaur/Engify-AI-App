# Phase 1: Comprehensive QA Audit - Day 7

**Parent Document:** [Day 7 QA & Frontend Improvements Plan](../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)  
**Phase:** 1 of 7  
**Status:** ⚠️ In Progress  
**Priority:** Critical

---

## Overview

User-driven manual QA audit of entire engify.ai site to identify all broken features, mocked data, bad UX, bad UI, and missing functionality before fixing.

## Goal

Create comprehensive audit report documenting every issue across all pages, properly categorized and prioritized for systematic resolution.

## Why This Approach?

- **User perspective:** Catches real usability issues AI/developers might miss
- **Systematic:** Ensures no pages or features are overlooked
- **Prioritized:** Critical issues fixed first, nice-to-haves deferred
- **Documentation:** Clear acceptance criteria for each fix
- **Prevents waste:** Don't build wrong thing, fix what's actually broken

---

## Audit Methodology

### Issue Categories

1. **BROKEN** - Feature errors or doesn't work
   - Examples: 500 error, button does nothing, API fails
   - Priority: Always Critical or High

2. **MOCKED** - Fake data, hardcoded values, dummy content
   - Examples: "views: 576", hardcoded achievements, fake ratings
   - Priority: High (user repeatedly emphasized this)

3. **BAD_UX** - Confusing, hard to use, unclear
   - Examples: No feedback on action, unclear labels, hidden features
   - Priority: Medium to High

4. **BAD_UI** - Hard to read, poor contrast, layout issues
   - Examples: White text on white background, tiny touch targets, text overflow
   - Priority: Medium (unless accessibility issue = High)

5. **MISSING** - Planned features not implemented
   - Examples: Forgot password doesn't work, search broken, filters missing
   - Priority: Varies by feature importance

### Severity Levels

- **Critical:** Blocks core functionality, user can't complete primary task
- **High:** Significantly impacts usability or trust
- **Medium:** Noticeable issue but workarounds exist
- **Low:** Minor polish, nice-to-have

---

## Pages to Test

### Public Pages (Logged Out)

- [ ] **Homepage** (`/`)
  - Hero section, value props, social proof
  - Navigation, footer links
  - CTA buttons functionality
  - Mobile responsive

- [ ] **Prompt Library** (`/prompts`)
  - List display, pagination
  - Search functionality
  - Category/role filters
  - Sort options
  - Card layout and information
  - Mobile responsive

- [ ] **Prompt Detail** (`/prompts/[id]`)
  - Prompt content display
  - Copy button functionality
  - Pattern explanation
  - Tags display
  - Related prompts
  - Mobile responsive

- [ ] **Category Pages** (`/prompts/category/[category]`)
  - Filtered prompt list
  - Category description
  - Related categories
  - Breadcrumbs

- [ ] **Role Pages** (`/prompts/role/[role]`)
  - Role-specific prompts
  - Role description
  - Related roles

- [ ] **Tag Pages** (`/tags/[tag]`)
  - Tag-filtered prompts
  - Related tags
  - Tag description

- [ ] **Pattern Library** (`/patterns`)
  - Pattern list
  - Pattern descriptions
  - Filter/search

- [ ] **Pattern Detail** (`/patterns/[pattern]`)
  - Pattern explanation
  - Example prompts
  - When to use

- [ ] **CTO Landing Page** (`/for-ctos`)
  - Executive content
  - Value proposition
  - CTA

- [ ] **Login** (`/login`)
  - Email/password login
  - Error messages
  - Remember me
  - Forgot password link

- [ ] **Signup** (`/signup`)
  - Email/password signup
  - Validation
  - Error messages
  - Success flow

### Authenticated Pages (Logged In)

- [ ] **Dashboard** (`/dashboard`)
  - User stats (XP, level, streak)
  - Achievements display
  - Recent activity
  - Quick actions
  - All data real (not mocked)

- [ ] **User Settings** (`/settings`)
  - Profile information
  - Email/password change
  - Preferences
  - Gamification settings
  - Data pulls from MongoDB

- [ ] **Workbench** (`/workbench`)
  - Tool list display
  - Tool functionality
  - Copy/paste features
  - Responsive design

- [ ] **Favorites** (if accessible)
  - Favorited prompts
  - Remove from favorites
  - Sync across devices

### Admin Pages (Super Admin)

- [ ] **OpsHub Dashboard** (`/opshub`)
  - Overview stats (real data)
  - Quick actions
  - Navigation to other panels

- [ ] **Content Management**
  - CRUD operations
  - Search/filter
  - Bulk actions
  - AI generation buttons

- [ ] **Prompt Management** (if exists)
  - Prompt list
  - Active/inactive toggle
  - Quality scoring
  - Bulk operations

- [ ] **User Management** (if exists)
  - User list
  - Role management
  - Account status

- [ ] **Audit Logs** (if exists)
  - Log viewer
  - Filters
  - Export

- [ ] **Settings** (if exists)
  - System configuration
  - Feature flags

---

## Issue Report Template

For each issue found, document using this format:

```markdown
### Issue #X: [Brief Description]

**Page:** `/path/to/page`  
**Severity:** Critical | High | Medium | Low  
**Category:** BROKEN | MOCKED | BAD_UX | BAD_UI | MISSING

**Current Behavior:**
[Describe what happens now]
[Attach screenshot if visual issue]

**Expected Behavior:**
[Describe what should happen]

**Steps to Reproduce:**

1. Go to [page]
2. Click [element]
3. Observe [issue]

**Technical Notes:**

- Component: `[ComponentName]`
- File: `src/path/to/file.tsx`
- API: `/api/endpoint` (if applicable)
- Console errors: [paste any errors]

**Fix Complexity:** Easy | Medium | Hard
**Estimated Time:** [X hours]

**Acceptance Criteria:**

- [ ] [Specific testable condition 1]
- [ ] [Specific testable condition 2]
```

---

## Example Issues (From Phase 0)

### Issue #1: Confusing Quality Score Badges

**Page:** `/prompts`  
**Severity:** High  
**Category:** BAD_UX

**Current Behavior:**
Numbers like "3.0" and "4.0" appear on prompt cards after several seconds. User doesn't understand what they mean.

**Expected Behavior:**
Either remove (done in Phase 0) or add clear label like "Quality: 4.0/5.0"

**Status:** ✅ Fixed in Phase 0

---

### Issue #2: "Make it Mine" Button Doesn't Work

**Page:** `/prompts`  
**Severity:** High  
**Category:** BROKEN + BAD_UX

**Current Behavior:**
Every prompt card has "Make it Mine" button that goes to a random workbench page. Feature not implemented.

**Expected Behavior:**
Remove button until feature is ready (done in Phase 0)

**Status:** ✅ Fixed in Phase 0

---

### Issue #3: Fake Views and Ratings

**Page:** `/prompts/[id]`  
**Severity:** Critical  
**Category:** MOCKED

**Current Behavior:**
Prompt detail modal shows "576 views" and "4.9 (5 ratings)" - all fake data

**Expected Behavior:**
Remove fake stats (done in Phase 0) or show real data from MongoDB

**Status:** ✅ Fixed in Phase 0

---

## Audit Report Structure

After completing the audit, organize findings:

### Summary

- Total issues found: [X]
- By severity:
  - Critical: [X]
  - High: [X]
  - Medium: [X]
  - Low: [X]
- By category:
  - BROKEN: [X]
  - MOCKED: [X]
  - BAD_UX: [X]
  - BAD_UI: [X]
  - MISSING: [X]

### Critical Issues (Fix in Day 7)

[List all Critical issues]

### High Priority Issues (Fix in Day 7 if time permits)

[List all High issues]

### Medium Priority Issues (Defer to Day 8)

[List all Medium issues]

### Low Priority Issues (Backlog)

[List all Low issues]

---

## Next Steps

After audit is complete:

1. Review findings with senior team member (or self-review)
2. Validate priorities (are Critical issues really Critical?)
3. Estimate fix time for each issue
4. Update Phase 2-7 plans based on findings
5. Create GitHub issues or task list
6. Begin systematic fixes in priority order

---

## Success Criteria

- [ ] Every page tested systematically
- [ ] All issues documented with screenshots
- [ ] Issues categorized (BROKEN, MOCKED, BAD_UX, BAD_UI, MISSING)
- [ ] Issues prioritized (Critical, High, Medium, Low)
- [ ] Fix complexity estimated for each issue
- [ ] Clear acceptance criteria for each fix
- [ ] Audit report reviewed and approved

---

---

## 🔴 ACTIVE QA AUDIT FINDINGS

### Issue #4: Logout Page Returns 404

**Page:** `/logout`  
**Severity:** Critical  
**Category:** BROKEN

**Current Behavior:**
Navigating to `/logout` returns 404 error page

**Expected Behavior:**
Should log user out and redirect to homepage with success message

**Technical Notes:**

- Missing route or page file
- Check if logout should be handled via API endpoint instead

**Fix Complexity:** Easy  
**Estimated Time:** 30 minutes

**Acceptance Criteria:**

- [ ] `/logout` route exists and works
- [ ] User is logged out of session
- [ ] User redirected to homepage
- [ ] Success toast notification shown

---

### Issue #5: Hardcoded/Inconsistent Prompt Counts (CRITICAL DRY VIOLATION)

**Page:** Homepage + Multiple pages  
**Severity:** Critical  
**Category:** MOCKED + BAD_UX

**Current Behavior:**

- Homepage shows "76+ EXPERT PROMPTS"
- Another section says "23 prompts"
- Yet another says "113"
- All hardcoded, not pulling from DB

**Expected Behavior:**

- **ONE SINGLE SOURCE OF TRUTH** for all stats
- Use API endpoint or ISR-generated JSON
- Store in global state (localStorage, context, or static JSON)
- Update via webhooks when content changes
- All components pull from this source

**Technical Notes:**

- Violates DRY principle repeatedly
- User has emphasized this "many times"
- Solution: Create `/api/stats` endpoint (cached)
- Return JSON with all counts:
  ```json
  {
    "prompts": { "total": 76, "byRole": {...}, "byCategory": {...} },
    "patterns": { "total": 23 },
    "users": 1250,
    "lastUpdated": "2025-11-02T10:00:00Z"
  }
  ```
- Generate static JSON via ISR (revalidate every hour)
- Use QStash webhook to trigger revalidation on content changes

**Fix Complexity:** Medium  
**Estimated Time:** 2-3 hours

**Acceptance Criteria:**

- [ ] Single `/api/stats` endpoint created
- [ ] Returns all site statistics from MongoDB
- [ ] ISR with 1-hour revalidation
- [ ] QStash webhook triggers on-demand revalidation
- [ ] All hardcoded numbers removed from codebase
- [ ] All components use same stats source
- [ ] Stats include breakdown by role/category/persona

---

### Issue #6: Tagline "AI-Powered Prompt Engineering is Taking Off 🚀"

**Page:** Homepage  
**Severity:** Medium  
**Category:** BAD_UX

**Current Behavior:**
Banner says "🚁 ⚡ AI-Powered Prompt Engineering is Taking Off 🚀"

**Expected Behavior:**

- Remove "rocket engineering" pun (too cheesy)
- Rephrase to focus on engineering workflows/productivity
- Align with brand: "Amplify Engineering with [X]"
- Suggestions:
  - "Amplify Engineering Workflows"
  - "Amplify Engineering Productivity"
  - "Engineering Excellence, Amplified"
  - Remove "AI Power" (sounds generic/cheesy)

**Fix Complexity:** Easy  
**Estimated Time:** 15 minutes

**Acceptance Criteria:**

- [ ] Tagline updated to focus on engineering workflows/productivity
- [ ] No cheesy "powered by AI" or rocket puns
- [ ] Aligns with "Amplify Engineering" brand

---

### Issue #7: Mobile CTA Buttons Don't Stack

**Page:** Homepage (mobile view)  
**Severity:** High  
**Category:** BAD_UI

**Current Behavior:**
CTA buttons ("Browse Prompt Playbook", "Request Beta Access") display side-by-side on mobile, causing layout issues

**Expected Behavior:**

- Buttons should stack vertically on mobile
- Full width on mobile for easy tapping
- Proper spacing between stacked buttons

**Technical Notes:**

- Add responsive classes: `flex-col sm:flex-row`
- Ensure touch targets are 44x44px minimum

**Fix Complexity:** Easy  
**Estimated Time:** 15 minutes

**Acceptance Criteria:**

- [ ] Buttons stack vertically on mobile (<640px)
- [ ] Buttons full-width on mobile
- [ ] Proper spacing between buttons
- [ ] Touch targets 44x44px minimum

---

### Issue #8: CTA Buttons Don't Link Anywhere (CRITICAL)

**Page:** Homepage  
**Severity:** Critical  
**Category:** BROKEN

**Current Behavior:**
CTA buttons ("Browse Prompt Playbook", "Request Beta Access") don't link anywhere or do nothing

**Expected Behavior:**

- "Browse Prompt Playbook" → `/prompts`
- "Request Beta Access" → `/signup` or beta request form

**Fix Complexity:** Easy  
**Estimated Time:** 10 minutes

**Acceptance Criteria:**

- [ ] "Browse Prompt Playbook" links to `/prompts`
- [ ] "Request Beta Access" links to `/signup` or beta form
- [ ] Links work on all devices
- [ ] Navigation is immediate (no loading delay)

---

### Issue #9: "API Reference" Link in Footer (SECURITY RISK)

**Page:** All pages (footer)  
**Severity:** Critical  
**Category:** BAD_UX + SECURITY

**Current Behavior:**
Footer has "API Reference" link that goes to `/api-docs` - exposes API structure publicly

**Expected Behavior:**

- Remove from public footer
- Move to authenticated docs area (like `/docs` for logged-in users)
- OR move to separate developer portal (not linked from main site)
- API documentation should not be wide open for hackers

**Technical Notes:**

- Check what's exposed at `/api-docs`
- Consider moving to authenticated route
- Add RBAC if keeping docs public

**Fix Complexity:** Easy  
**Estimated Time:** 30 minutes

**Acceptance Criteria:**

- [ ] "API Reference" removed from public footer
- [ ] API docs moved to authenticated area OR removed entirely
- [ ] No sensitive API structure exposed publicly
- [ ] Developer docs accessible only to authorized users

---

### Issue #10: "Patterns" Listed Twice in Footer

**Page:** All pages (footer)  
**Severity:** Low  
**Category:** BAD_UX

**Current Behavior:**
Footer lists "Patterns" in multiple sections (duplicate)

**Expected Behavior:**

- List "Patterns" only once
- Organize footer logically:
  - **Product:** AI Workbench, Patterns, Library, Pricing
  - **Company:** About, Built in Public, Contact
  - **Resources:** Documentation, Prompt Library
  - **Legal:** Privacy, Terms
  - **Social:** GitHub, LinkedIn, Hire Me (resume link)

**Fix Complexity:** Easy  
**Estimated Time:** 20 minutes

**Acceptance Criteria:**

- [ ] "Patterns" appears only once in footer
- [ ] Footer organized into clear sections
- [ ] No duplicate links
- [ ] All links work correctly

---

### Issue #11: Duplicate Footer (Version Bottom)

**Page:** All pages  
**Severity:** Medium  
**Category:** BAD_UI

**Current Behavior:**
Footer appears to be duplicated with links in multiple places
Version at bottom has redundant links

**Expected Behavior:**

- Single footer with clear sections
- GitHub, LinkedIn, "Hire Me" (resume link) acceptable
- Remove GitHub from "Legal" section (doesn't belong there)
- Footer structure:
  - Top: Main footer with product/company/resources/legal sections
  - Bottom: Simple copyright line + social links only

**Fix Complexity:** Easy  
**Estimated Time:** 30 minutes

**Acceptance Criteria:**

- [ ] Single cohesive footer design
- [ ] No duplicate sections
- [ ] GitHub under Social, not Legal
- [ ] LinkedIn and "Hire Me" resume link added
- [ ] Copyright + social links at bottom only

---

### Issue #12: Homepage Needs Stats Breakdown by Section

**Page:** Homepage  
**Severity:** Medium  
**Category:** MISSING

**Current Behavior:**
Homepage shows generic counts (76 prompts, 23 patterns) without breakdown

**Expected Behavior:**
Add stats section showing:

- Prompts by role (Engineers: 24, Managers: 18, Designers: 12, etc.)
- Prompts by category (Code Generation: 15, Debugging: 12, etc.)
- Prompts by persona
- Patterns by type
- Active users count (if available)

**Technical Notes:**

- Pull from same `/api/stats` endpoint (Issue #5)
- Use shadcn/ui stats cards or badges
- Make it visually interesting (icons, colors)

**Fix Complexity:** Medium  
**Estimated Time:** 2 hours

**Acceptance Criteria:**

- [ ] Stats breakdown section added to homepage
- [ ] Shows prompts by role/category/persona
- [ ] Shows patterns by type
- [ ] All data from `/api/stats` endpoint
- [ ] Responsive design
- [ ] Visually engaging (icons, colors, layout)

---

**Last Updated:** November 2, 2025 10:35 AM (Active QA in progress)  
**Status:** 🔴 Adding issues as discovered  
**Next Phase:** [Phase 2: OpsHub Enterprise Build-Out](../planning/OPSHUB_ENTERPRISE_BUILDOUT.md)
