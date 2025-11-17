# Affiliate Tracking System

**Status:** ✅ Implemented
**Priority:** High - Revenue Opportunity ($10K-$100K)
**Owner:** Engineering Team
**Last Updated:** 2025-11-17

## Overview

The Affiliate Tracking System tracks clicks on affiliate and referral links across the Engify.ai platform. This system provides persistent storage of click data, real-time analytics, and conversion tracking to optimize monetization through AI tool referrals.

## Architecture

### Components

1. **Client-Side Tracking** (`/src/data/affiliate-links.ts`)
   - Tracks clicks via Google Analytics, PostHog, and Plausible
   - Calls server-side API for persistent storage
   - Provides `trackAffiliateClick(toolKey, source)` function

2. **Server-Side Tracking** (`/src/lib/analytics/affiliate-tracking.ts`)
   - Stores click metadata in Redis for fast access
   - Provides real-time analytics and statistics
   - Syncs to MongoDB hourly via cron

3. **API Endpoints**
   - `POST /api/affiliate/click` - Track affiliate click
   - `GET /api/admin/affiliate-links` - Get affiliate stats (admin only)
   - `POST /api/admin/affiliate-links` - Manage affiliate links (admin only)

4. **Admin Dashboard** (`/src/components/admin/AffiliateLinkManagement.tsx`)
   - View all affiliate links and stats
   - Track click-through rates
   - Monitor revenue estimates
   - Manage partnership outreach

## Data Flow

```
User clicks affiliate link
       ↓
trackAffiliateClick() called
       ↓
┌──────────────────┬──────────────────┐
│   Client-Side    │   Server-Side    │
│   (Fire & Forget)│   (Persistent)   │
├──────────────────┼──────────────────┤
│ • Google Analytics│ • POST /api/     │
│ • PostHog        │   affiliate/click│
│ • Plausible      │       ↓          │
└──────────────────┤   Store in Redis │
                   │       ↓          │
                   │   Sync to MongoDB│
                   │   (hourly cron)  │
                   └──────────────────┘
```

## Redis Data Structure

### Click Data
```
Key: affiliate:click:{clickId}
Value: JSON {
  toolKey, toolName, url, hasReferral, status,
  commission, userId, sessionId, userAgent,
  referrer, source, timestamp, ipAddress
}
TTL: 90 days
```

### Counters
```
affiliate:tool:{toolKey}:clicks              # Total clicks
affiliate:tool:{toolKey}:clicks:{date}       # Daily clicks (90 day TTL)
affiliate:tool:{toolKey}:unique              # Unique clicks (by session)
affiliate:tool:{toolKey}:conversions         # Conversion count
affiliate:tool:{toolKey}:revenue             # Revenue tracking
affiliate:tool:{toolKey}:lastClick           # Last click timestamp

affiliate:source:{source}:clicks             # Clicks by source
affiliate:source:{source}:clicks:{date}      # Daily by source

affiliate:unique:{toolKey}:{sessionId}       # Unique session (24h TTL)
affiliate:recent                             # Recent clicks list (100 max)
```

## MongoDB Collections

### affiliate_stats
Synced hourly from Redis via cron job.

```typescript
{
  toolKey: string,
  totalClicks: number,
  uniqueClicks: number,
  conversions: number,
  revenue: number,
  lastClickAt: Date,
  lastSyncedAt: Date
}
```

### affiliate_config
Managed via admin panel.

```typescript
{
  tool: string,
  baseUrl: string,
  referralUrl?: string,
  affiliateCode?: string,
  commission?: string,
  status: 'active' | 'pending' | 'requested',
  notes?: string,
  clickCount: number,
  conversionCount: number,
  lastClickAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### partnership_outreach
Tracks partnership outreach efforts.

```typescript
{
  company: string,
  priority: 'high' | 'medium' | 'low',
  contact: string,
  rating?: number,
  traffic?: string,
  status: 'pending' | 'contacted' | 'responded' | 'partnership',
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

### Tracking a Click

```typescript
import { trackAffiliateClick } from '@/data/affiliate-links';

// Basic usage
trackAffiliateClick('cursor');

// With source tracking
trackAffiliateClick('windsurf', 'ai-coding-page');
trackAffiliateClick('replit', 'workbench');
trackAffiliateClick('perplexity', 'comparison-table');
```

### Getting Stats

```typescript
import {
  getAffiliateStats,
  getToolAffiliateStats,
  getTopAffiliateLinks
} from '@/lib/analytics/affiliate-tracking';

// Overall stats
const stats = await getAffiliateStats();
console.log(stats.totalClicks, stats.uniqueClicks, stats.estimatedRevenue);

// Tool-specific stats
const cursorStats = await getToolAffiliateStats('cursor');
console.log(cursorStats.clicksToday, cursorStats.clicksThisWeek);

// Top performers
const topLinks = await getTopAffiliateLinks(10);
```

### Tracking Conversions

```typescript
import { trackAffiliateConversion } from '@/lib/analytics/affiliate-tracking';

// When user signs up via affiliate link
await trackAffiliateConversion('cursor', {
  userId: 'user-123',
  subscriptionType: 'pro',
  revenue: 19.99
});
```

## Admin Dashboard

Access at: `/opshub` → Affiliate Links tab

### Features

1. **Overview Stats**
   - Total clicks (all time)
   - Unique clicks
   - Conversion rate (estimated)
   - Estimated revenue
   - Active links count

2. **Link Management**
   - View all affiliate links
   - Click stats (total, unique, today, week, month)
   - Edit link details
   - Add new links
   - Track last click timestamp

3. **Partnership Outreach**
   - Track outreach to potential partners
   - Priority levels (high, medium, low)
   - Status tracking (pending, contacted, responded, partnership)
   - Contact information

## Active Affiliate Programs

### Currently Active (8 programs)

1. **Windsurf (Codeium)**
   - Referral URL: `https://windsurf.com/refer?referral_code=9e4uju62dcni2vev`
   - Commission: 250 bonus credits per referral
   - Status: ✅ Active

2. **Codeium**
   - Referral URL: `https://codeium.com/referral`
   - Commission: Bonus add-on prompt credits
   - Status: ✅ Active

3. **Replit AI**
   - Referral URL: `https://replit.com/refer/donlaur`
   - Commission: TBD
   - Status: ✅ Active

4. **Warp Terminal**
   - Referral URL: `https://app.warp.dev/referral/QPG4E6`
   - Commission: TBD
   - Status: ✅ Active

5. **Lovable (GPT Engineer)**
   - Referral URL: `https://lovable.dev/?via=donnie`
   - Commission: TBD
   - Status: ✅ Active

6. **Google Cloud (Gemini AI Studio)**
   - Referral URL: `https://cloud.google.com/affiliate-program`
   - Commission: Cash reward per eligible referral (no annual cap)
   - Status: ✅ Active
   - Notes: Via CJ Affiliate, referred users get $350 free trial credits

7. **Perplexity AI**
   - Referral URL: `https://partners.dub.co/perplexity`
   - Commission: Up to $15 per lead
   - Status: ✅ Active
   - Notes: Via Dub affiliate program

8. **Anthropic Claude**
   - Referral URL: `https://anthropic.com/referral/`
   - Commission: Enterprise referral program
   - Status: ⏳ Pending (contact required)
   - Notes: Enterprise referral partner program, VC Partner Program available

### Pending / Need Outreach (6 programs)

1. **Cursor** - No referral program confirmed
2. **GitHub Copilot** - No public affiliate program
3. **Tabnine** - B2B partner program only (enterprise)
4. **Bolt.new** - User referral only (200k tokens per referral)
5. **v0.dev (Vercel)** - No affiliate program
6. **Groq** - Invite-only partner program

## Conversion Tracking

### Make It Mine Button

The "Make It Mine" button now includes comprehensive tracking:

```typescript
// Tracks when users click the button
gtag('event', 'make_it_mine_click', {
  event_category: 'Conversion',
  prompt_id: promptId,
  user_type: 'pro' | 'free'
});

// Tracks upgrade intent
gtag('event', 'upgrade_intent', {
  event_category: 'Conversion',
  source: 'make_it_mine_modal',
  prompt_id: promptId
});
```

### Conversion Funnel

1. **Affiliate Click** → User clicks affiliate link
2. **Site Visit** → User visits affiliate site
3. **Sign Up** → User creates account (tracked via affiliate cookie/param)
4. **Conversion** → User purchases/subscribes
5. **Commission** → We receive commission

## Revenue Estimation

### Current Model

```typescript
// Assumed metrics (update based on actual data)
uniqueClicks = 1000         // Monthly unique clicks
conversionRate = 0.05       // 5% conversion rate
avgCommission = 15          // $15 average commission

estimatedRevenue = uniqueClicks × conversionRate × avgCommission
                 = 1000 × 0.05 × 15
                 = $750/month
```

### Scaling Projections

| Monthly Traffic | Conversion Rate | Avg Commission | Monthly Revenue |
|----------------|----------------|----------------|-----------------|
| 1,000          | 5%             | $15            | $750            |
| 5,000          | 5%             | $15            | $3,750          |
| 10,000         | 5%             | $15            | $7,500          |
| 20,000         | 5%             | $15            | $15,000         |
| 50,000         | 5%             | $15            | $37,500         |
| 100,000        | 5%             | $15            | $75,000         |

**Target:** $10K-$100K annual recurring revenue from affiliate commissions

## Optimization Strategies

### 1. Click-Through Optimization
- Place affiliate links strategically (comparison tables, tool reviews)
- A/B test placement and copy
- Use compelling CTAs ("Try Cursor Free", "Get 250 Bonus Credits")

### 2. Conversion Optimization
- Provide honest, valuable comparisons
- Include discount codes when available
- Create targeted content for each tool
- Build trust through genuine recommendations

### 3. Partnership Development
- Reach out to pending programs (see partnership outreach list)
- Negotiate higher commission rates
- Explore sponsored content opportunities
- Co-marketing initiatives

### 4. Content Strategy
- AI Coding Tools comparison page
- Individual tool reviews
- "Best AI Tool for X" guides
- Case studies featuring tools
- Video tutorials using tools

## Cron Jobs

### Hourly Sync
Sync affiliate stats from Redis to MongoDB.

```bash
# Run via Vercel Cron or QStash
POST /api/cron/sync-affiliate-stats
```

Implementation:
```typescript
import { syncAffiliateStatsToMongoDB } from '@/lib/analytics/affiliate-tracking';

export async function POST(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await syncAffiliateStatsToMongoDB();
  return NextResponse.json({ success: true });
}
```

## Analytics Integration

### Google Analytics Events

```javascript
// Affiliate click
gtag('event', 'affiliate_click', {
  event_category: 'Affiliate',
  event_label: toolKey,
  tool_name: 'Cursor',
  has_referral: true,
  status: 'active'
});

// Make it mine click
gtag('event', 'make_it_mine_click', {
  event_category: 'Conversion',
  prompt_id: 'prompt-123',
  user_type: 'free'
});

// Upgrade intent
gtag('event', 'upgrade_intent', {
  event_category: 'Conversion',
  source: 'make_it_mine_modal'
});
```

### PostHog Events

```javascript
posthog.capture('affiliate_click', {
  toolKey: 'cursor',
  toolName: 'Cursor',
  source: 'ai-coding-page',
  hasReferral: true
});

posthog.capture('make_it_mine_click', {
  promptId: 'prompt-123',
  userType: 'free'
});
```

## Testing

### Manual Testing

1. **Click Tracking**
   ```
   1. Open browser devtools (Network tab)
   2. Click an affiliate link on the site
   3. Verify POST to /api/affiliate/click succeeds
   4. Check admin dashboard for click count increase
   ```

2. **Stats Display**
   ```
   1. Go to /opshub → Affiliate Links
   2. Verify stats are displayed correctly
   3. Check today/week/month counts
   4. Verify overall stats (total, unique, revenue)
   ```

3. **Make It Mine Tracking**
   ```
   1. Click "Make It Mine" on any prompt
   2. Check browser console for tracking events
   3. Verify GA event fires (check GA Real-Time)
   4. Verify PostHog event (check PostHog dashboard)
   ```

### Automated Testing

```typescript
// TODO: Add integration tests
describe('Affiliate Tracking', () => {
  it('tracks affiliate click', async () => {
    const response = await fetch('/api/affiliate/click', {
      method: 'POST',
      body: JSON.stringify({
        toolKey: 'cursor',
        toolName: 'Cursor',
        url: 'https://cursor.sh',
        hasReferral: false,
        status: 'pending'
      })
    });
    expect(response.ok).toBe(true);
  });

  it('gets affiliate stats', async () => {
    const stats = await getAffiliateStats();
    expect(stats.totalClicks).toBeGreaterThanOrEqual(0);
  });
});
```

## Troubleshooting

### Issue: Clicks not tracking

**Symptoms:** Affiliate link clicks don't appear in admin dashboard

**Solutions:**
1. Check browser console for API errors
2. Verify Redis connection (check environment variables)
3. Check rate limiting (may be blocking requests)
4. Verify affiliate link exists in `affiliateLinks` object

### Issue: Stats showing 0

**Symptoms:** Admin dashboard shows 0 clicks despite tracking

**Solutions:**
1. Check Redis keys exist: `redis-cli KEYS "affiliate:*"`
2. Verify cron job ran successfully (check logs)
3. Check MongoDB connection
4. Verify tool key matches between tracking and display

### Issue: Tracking API returns 429

**Symptoms:** Too many requests error

**Solutions:**
1. Check rate limit settings in `/lib/rate-limit.ts`
2. Verify IP address extraction is working
3. Consider increasing rate limits for authenticated users
4. Implement exponential backoff in client

## Security Considerations

1. **Rate Limiting:** Prevents abuse of tracking API
2. **Admin-Only Access:** Affiliate stats dashboard requires admin role
3. **Data Privacy:** IP addresses stored but not exposed in public APIs
4. **Input Validation:** Zod schemas validate all API inputs
5. **Audit Logging:** All admin actions are logged

## Future Enhancements

### Short Term
- [ ] Add conversion tracking webhooks (when affiliate notifies us of conversion)
- [ ] Implement A/B testing for affiliate link placement
- [ ] Add revenue attribution per source page
- [ ] Create affiliate performance reports (weekly/monthly emails)

### Medium Term
- [ ] Integrate with affiliate networks (CJ, Impact, ShareASale)
- [ ] Add deep linking for better conversion tracking
- [ ] Implement cookie-based attribution (30-day window)
- [ ] Create affiliate content recommendation engine

### Long Term
- [ ] Build affiliate partner portal (self-service for partners)
- [ ] Implement machine learning for conversion prediction
- [ ] Add multi-touch attribution modeling
- [ ] Create revenue forecasting dashboard

## Related Documentation

- [Tech Debt - Affiliate Tracking](/docs/TECHNICAL_DEBT.md#monetization) (#9-18)
- [Freemium Strategy](/docs/business/FREEMIUM_STRATEGY.md)
- [Analytics Implementation](/docs/analytics/README.md)
- [Partnership Template](/src/data/affiliate-links.ts#partnership-template)

## Support & Contacts

**Engineering Owner:** Engineering Team
**Business Owner:** Product/Revenue Team
**Questions:** Slack #engineering or #revenue

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Next Review:** 2025-12-17
