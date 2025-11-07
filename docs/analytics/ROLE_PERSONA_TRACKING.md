# Role & Persona Tracking - Analytics Strategy

## 🎯 Goal
Track which roles/personas are most engaged to inform product decisions, content strategy, and potential consolidation of the 19 role landing pages.

## 📊 Current State

### ✅ What We Have
- **Google Analytics 4** integrated (`G-1X4BJ3EEKD`)
- **Page view tracking** on route changes
- **Custom event tracking** via `trackEvent()` function
- **Basic events**: `prompt_view`, `prompt_copy`, `prompt_execute`, `signup`, `login`

### ❌ What We're Missing
- **No role/persona context** in events
- **No click tracking** on role selectors
- **No conversion funnel** by role
- **No engagement metrics** by role
- **No attribution** from role pages to prompt usage

## 🔧 Recommended Events to Add

### 1. Role Page Events
```typescript
// When user lands on role page
trackEvent('role_page_view', {
  role: 'engineering-manager',
  source: 'organic' | 'direct' | 'referral',
  session_id: string
});

// When user clicks role selector
trackEvent('role_selected', {
  from_role: 'qa' | null,
  to_role: 'engineering-manager',
  location: 'header' | 'role-selector-component' | 'footer'
});

// When user scrolls to specific sections
trackEvent('role_section_view', {
  role: 'engineering-manager',
  section: 'prompts' | 'patterns' | 'use-cases' | 'faqs'
});
```

### 2. Prompt Interaction Events (Enhanced)
```typescript
// Add role context to existing events
trackEvent('prompt_view', {
  promptId: string,
  role: 'engineering-manager', // NEW
  source_page: '/for-managers', // NEW
  user_role: 'engineering-manager' // From profile if logged in
});

trackEvent('prompt_copy', {
  promptId: string,
  role: 'engineering-manager', // NEW
  pattern: 'chain-of-thought', // NEW
  source_page: '/for-managers' // NEW
});

trackEvent('prompt_execute', {
  promptId: string,
  model: string,
  role: 'engineering-manager', // NEW
  pattern: 'chain-of-thought' // NEW
});
```

### 3. Navigation & Engagement Events
```typescript
// CTA clicks from role pages
trackEvent('role_cta_click', {
  role: 'engineering-manager',
  cta_type: 'signup' | 'view-prompts' | 'view-patterns',
  cta_text: string,
  location: 'hero' | 'mid-page' | 'footer'
});

// Time on page (send after 30s, 60s, 120s)
trackEvent('role_engagement', {
  role: 'engineering-manager',
  time_on_page: 30 | 60 | 120,
  scroll_depth: number // percentage
});

// Pattern clicks from role pages
trackEvent('pattern_click', {
  role: 'engineering-manager',
  pattern: 'chain-of-thought',
  source_page: '/for-managers'
});
```

### 4. Conversion Events
```typescript
// Signup with role context
trackEvent('signup', {
  method: 'google' | 'github' | 'email',
  source_role_page: '/for-managers', // NEW
  selected_role: 'engineering-manager' // NEW
});

// First prompt usage after role page visit
trackEvent('role_conversion', {
  role: 'engineering-manager',
  time_to_conversion: number, // seconds
  first_action: 'prompt_view' | 'prompt_copy' | 'prompt_execute'
});
```

## 📈 Key Metrics to Track

### By Role
1. **Page Views** - Which roles get the most traffic?
2. **Engagement Rate** - Time on page, scroll depth, section views
3. **Bounce Rate** - Do users leave immediately?
4. **Conversion Rate** - Role page → Prompt usage → Signup
5. **Prompt Affinity** - Which prompts do each role use most?
6. **Pattern Affinity** - Which patterns resonate with each role?

### Funnel Analysis
```
Role Page View → Role Selected → Prompt View → Prompt Copy → Signup
```

Track drop-off at each stage by role.

## 🛠️ Implementation Plan

### Phase 1: Add Role Context (Week 1)
- [ ] Add `role` parameter to all existing events
- [ ] Track role page views with metadata
- [ ] Track role selector clicks
- [ ] Deploy and validate events in GA4

### Phase 2: Enhanced Engagement (Week 2)
- [ ] Add scroll depth tracking
- [ ] Add time-on-page milestones
- [ ] Add section view tracking
- [ ] Add CTA click tracking

### Phase 3: Conversion Tracking (Week 3)
- [ ] Add role attribution to signups
- [ ] Track role → prompt → signup funnel
- [ ] Add first-action tracking
- [ ] Create GA4 custom reports

### Phase 4: Analysis & Optimization (Week 4)
- [ ] Review 30 days of data
- [ ] Identify top-performing roles
- [ ] Identify underperforming roles
- [ ] Make consolidation decisions

## 📊 GA4 Custom Dimensions

Add these custom dimensions in GA4:

1. **user_role** - Role from user profile (if logged in)
2. **page_role** - Role from current page context
3. **prompt_role** - Role associated with prompt
4. **pattern_name** - Pattern being used
5. **source_role_page** - Role page that led to conversion

## 🎯 Success Criteria

After 30-60 days, we should be able to answer:

1. **Which roles drive the most engagement?**
   - Page views, time on page, scroll depth

2. **Which roles convert best?**
   - Role page → Prompt usage → Signup

3. **Which roles should we prioritize?**
   - High traffic + high conversion = keep
   - Low traffic + low conversion = consider consolidating

4. **Which prompts/patterns resonate by role?**
   - Inform content strategy and recommendations

## 💡 Quick Wins

### Immediate (This Week)
1. Add `role` parameter to `trackPromptView()`, `trackPromptCopy()`, `trackPromptExecute()`
2. Add `trackRolePageView()` function
3. Add `trackRoleSelected()` for role selector clicks

### Short-term (Next 2 Weeks)
1. Add scroll depth tracking to role pages
2. Add CTA click tracking
3. Create GA4 dashboard for role analytics

### Long-term (1-2 Months)
1. Analyze data and make consolidation decisions
2. A/B test role page variations
3. Personalize content based on role

## 🔗 Related Docs
- `/docs/operations/ISR_CACHE_WARMING.md` - ISR strategy
- `/docs/development/ADR/012-static-json-isr-architecture.md` - Architecture decisions
- `/src/lib/utils/analytics.ts` - Current analytics implementation
- `/src/components/analytics/GoogleAnalytics.tsx` - GA4 integration

## 📝 Notes
- All tracking should be GDPR-compliant (no PII without consent)
- Use session IDs, not user IDs, for anonymous tracking
- Respect user privacy preferences
- Consider adding PostHog or Mixpanel for more advanced analytics
