# Affiliate Integration Guide

Quick guide for developers to add affiliate tracking to new pages and components.

## Quick Start

### 1. Basic Affiliate Link with Tracking

```tsx
import { getToolLink, trackAffiliateClick } from '@/data/affiliate-links';

function MyComponent() {
  const handleClick = (toolKey: string) => {
    // Track the click
    trackAffiliateClick(toolKey, 'my-page-name');

    // Navigate to affiliate link
    window.open(getToolLink(toolKey), '_blank');
  };

  return (
    <button onClick={() => handleClick('cursor')}>
      Try Cursor
    </button>
  );
}
```

### 2. Affiliate Link in Comparison Table

```tsx
import { affiliateLinks, getToolLink, trackAffiliateClick } from '@/data/affiliate-links';

function ComparisonTable() {
  return (
    <table>
      {Object.entries(affiliateLinks).map(([key, link]) => (
        <tr key={key}>
          <td>{link.tool}</td>
          <td>
            <a
              href={getToolLink(key)}
              onClick={() => trackAffiliateClick(key, 'comparison-table')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Site →
            </a>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### 3. Track Button Clicks

```tsx
import { trackAffiliateClick } from '@/data/affiliate-links';

function ToolCard({ tool }: { tool: string }) {
  return (
    <button
      onClick={() => {
        trackAffiliateClick(tool, 'tool-grid');
        window.location.href = `/learn/ai-tools/${tool}`;
      }}
    >
      Learn More
    </button>
  );
}
```

## Source Tracking

Always include a `source` parameter to track where clicks come from:

```typescript
// Page sources
trackAffiliateClick('cursor', 'ai-coding-page');
trackAffiliateClick('windsurf', 'homepage-hero');
trackAffiliateClick('replit', 'comparison-table');
trackAffiliateClick('perplexity', 'workbench-sidebar');

// Feature sources
trackAffiliateClick('lovable', 'search-results');
trackAffiliateClick('warp', 'recommended-tools');
trackAffiliateClick('groq', 'model-selector');
```

### Recommended Source Names

| Page/Feature | Source Name |
|-------------|-------------|
| Homepage | `homepage-hero`, `homepage-featured` |
| AI Coding Tools Page | `ai-coding-page`, `ai-coding-grid` |
| Comparison Page | `comparison-table`, `comparison-hero` |
| Tool Detail Page | `tool-detail-cta`, `tool-detail-pricing` |
| Workbench | `workbench-sidebar`, `workbench-settings` |
| Blog Post | `blog-{slug}`, `blog-inline` |
| Search Results | `search-results` |
| Recommendations | `recommended-tools` |

## Advanced Usage

### Conditional Tracking (Active Links Only)

```tsx
import { affiliateLinks, trackAffiliateClick } from '@/data/affiliate-links';

function SmartAffiliateLink({ toolKey }: { toolKey: string }) {
  const link = affiliateLinks[toolKey];

  if (!link) return null;

  // Only track active affiliate links
  const shouldTrack = link.status === 'active' && link.referralUrl;

  return (
    <a
      href={link.referralUrl || link.baseUrl}
      onClick={() => {
        if (shouldTrack) {
          trackAffiliateClick(toolKey, 'smart-link');
        }
      }}
      target="_blank"
    >
      {link.tool}
    </a>
  );
}
```

### Track with Additional Metadata

For server-side tracking with custom metadata:

```tsx
// Client-side
const handleClick = async () => {
  await fetch('/api/affiliate/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toolKey: 'cursor',
      toolName: 'Cursor',
      url: 'https://cursor.sh',
      hasReferral: false,
      status: 'pending',
      source: 'custom-widget',
      // Custom metadata
      userId: currentUser?.id,
      sessionId: getSessionId(),
    })
  });
};
```

### Track Conversion Events

When a user signs up via your affiliate link:

```tsx
import { trackAffiliateConversion } from '@/lib/analytics/affiliate-tracking';

// Server-side only
async function handleUserSignup(userId: string, referralSource: string) {
  // Parse referral source (e.g., from cookie or URL param)
  const toolKey = parseReferralSource(referralSource);

  if (toolKey) {
    await trackAffiliateConversion(toolKey, {
      userId,
      subscriptionType: 'pro',
      revenue: 19.99
    });
  }
}
```

## Adding New Affiliate Programs

### 1. Update affiliate-links.ts

```typescript
// src/data/affiliate-links.ts

export const affiliateLinks: Record<string, AffiliateLink> = {
  // ... existing links ...

  mynewtool: {
    tool: 'My New Tool',
    baseUrl: 'https://mynewtool.com',
    referralUrl: 'https://mynewtool.com/ref/engify',
    affiliateCode: 'engify',
    status: 'active',
    commission: '20% recurring',
    notes: 'Affiliate program via their partner portal',
  },
};
```

### 2. Add to Partnership Outreach (if pending)

```typescript
export const partnershipOutreach = [
  // ... existing outreach ...

  {
    company: 'My New Tool',
    priority: 'high',
    contact: 'partnerships@mynewtool.com',
    rating: 4.5,
    traffic: 'High conversion potential',
  },
];
```

### 3. Test the Integration

```typescript
// In your component
import { getToolLink, trackAffiliateClick } from '@/data/affiliate-links';

const link = getToolLink('mynewtool');
trackAffiliateClick('mynewtool', 'test-page');
```

## Best Practices

### DO ✅

- **Always include source parameter** for attribution
- **Use meaningful source names** (descriptive, consistent)
- **Track only user-initiated actions** (not automatic page loads)
- **Open affiliate links in new tab** (`target="_blank"`)
- **Use rel="noopener noreferrer"** for security
- **Track Make It Mine clicks** for conversion funnel analysis
- **Test tracking in dev** (check console logs)

### DON'T ❌

- **Don't track on every page load** (only on user clicks)
- **Don't block user navigation** (fire-and-forget tracking)
- **Don't track inactive links** (status !== 'active')
- **Don't expose affiliate codes** unnecessarily
- **Don't track personal user data** without consent
- **Don't hardcode affiliate URLs** (use `getToolLink()`)

## Testing Your Integration

### 1. Development Console Check

```bash
# Should see in browser console:
Affiliate click tracked: {
  toolKey: "cursor",
  toolName: "Cursor",
  source: "my-new-page",
  ...
}
```

### 2. Network Tab Verification

```
POST /api/affiliate/click
Status: 200 OK
Response: { success: true }
```

### 3. Admin Dashboard Check

1. Go to `/opshub` → Affiliate Links
2. Find your tool
3. Verify click count increased
4. Check source breakdown

### 4. Analytics Verification

**Google Analytics:**
- Events → Affiliate → affiliate_click
- Should see event with your toolKey and source

**PostHog:**
- Events → Filter by "affiliate_click"
- Should see event with metadata

## Common Issues

### Issue: Click not tracked

```tsx
// ❌ Wrong - missing source
trackAffiliateClick('cursor');

// ✅ Correct - includes source
trackAffiliateClick('cursor', 'my-page');
```

### Issue: Link doesn't open

```tsx
// ❌ Wrong - blocks navigation
onClick={(e) => {
  e.preventDefault();
  trackAffiliateClick('cursor', 'page');
}}

// ✅ Correct - track then navigate
onClick={() => {
  trackAffiliateClick('cursor', 'page');
  window.open(getToolLink('cursor'), '_blank');
}}
```

### Issue: Tool key not found

```tsx
// ❌ Wrong - typo in key
trackAffiliateClick('Cursor', 'page'); // Capital C

// ✅ Correct - lowercase key
trackAffiliateClick('cursor', 'page');
```

## Examples

### Example 1: Hero CTA Button

```tsx
function HeroSection() {
  return (
    <div>
      <h1>The Best AI Coding Tool</h1>
      <button
        onClick={() => {
          trackAffiliateClick('cursor', 'homepage-hero');
          window.open(getToolLink('cursor'), '_blank');
        }}
      >
        Try Cursor Free →
      </button>
    </div>
  );
}
```

### Example 2: Comparison Grid

```tsx
import { affiliateLinks, getToolLink, trackAffiliateClick } from '@/data/affiliate-links';

function ToolGrid() {
  const activeTools = Object.entries(affiliateLinks)
    .filter(([_, link]) => link.status === 'active');

  return (
    <div className="grid grid-cols-3 gap-4">
      {activeTools.map(([key, link]) => (
        <div key={key} className="card">
          <h3>{link.tool}</h3>
          <p>{link.commission}</p>
          <a
            href={getToolLink(key)}
            onClick={() => trackAffiliateClick(key, 'tool-grid')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Site →
          </a>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Recommended Tools Widget

```tsx
function RecommendedTools({ category }: { category: string }) {
  const tools = ['cursor', 'windsurf', 'replit']; // Based on category

  return (
    <aside>
      <h4>Recommended Tools</h4>
      <ul>
        {tools.map(toolKey => {
          const link = affiliateLinks[toolKey];
          return (
            <li key={toolKey}>
              <a
                href={getToolLink(toolKey)}
                onClick={() => trackAffiliateClick(toolKey, 'recommended-widget')}
                target="_blank"
              >
                {link.tool}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
```

## Questions?

- **Documentation:** See `/docs/monetization/AFFILIATE_TRACKING_SYSTEM.md`
- **API Reference:** See `/src/lib/analytics/affiliate-tracking.ts`
- **Support:** Slack #engineering or #revenue

---

**Last Updated:** 2025-11-17
