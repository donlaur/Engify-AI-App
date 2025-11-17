# Revenue Tracking Methodology

**Purpose:** Define how we track, measure, and attribute revenue from affiliate programs
**Owner:** Revenue/Analytics Team
**Last Updated:** 2025-11-17

## Overview

This document outlines our methodology for tracking and attributing revenue from affiliate partnerships. It provides a framework for measuring the effectiveness of our affiliate program and making data-driven optimization decisions.

## Revenue Attribution Model

### Attribution Window

We use a **30-day cookie window** for affiliate attribution:

```
User clicks affiliate link → Cookie set (30 days)
  ↓
User returns within 30 days → Signs up/purchases
  ↓
Conversion attributed to affiliate link
```

### Multi-Touch Attribution

For users who click multiple affiliate links, we use **last-touch attribution**:

```
Day 1: User clicks Cursor link (not attributed)
Day 5: User clicks Windsurf link (ATTRIBUTED ✓)
Day 7: User signs up via Windsurf link
```

**Rationale:** Last-touch attribution is simpler to implement and aligns with most affiliate program policies.

## Tracking Methodology

### 1. Click Tracking

**What we track:**
- Tool clicked (e.g., "cursor", "windsurf")
- Source page (e.g., "ai-coding-page", "comparison-table")
- Timestamp
- User session ID (for unique counting)
- User agent, referrer, IP address (for analysis)

**Storage:**
- **Primary:** Redis (fast, real-time)
- **Secondary:** MongoDB (persistent, queryable)

**Metrics:**
- Total clicks (all time)
- Unique clicks (by session, 24h window)
- Clicks by source
- Clicks by time period (today, week, month)

### 2. Conversion Tracking

**Method A: Server-Side Webhook (Preferred)**

Most affiliate networks provide webhooks for conversion notifications:

```
Affiliate Network → POST /api/webhooks/affiliate/conversion
  ↓
{
  "affiliateId": "cursor",
  "transactionId": "txn_123",
  "orderId": "order_456",
  "commission": 19.99,
  "status": "pending",
  "clickId": "click_789"
}
  ↓
Store in database, update stats
```

**Method B: Client-Side Conversion Pixel**

For networks without webhooks, use conversion pixel on thank-you page:

```html
<!-- On signup/purchase success page -->
<img src="https://affiliate-network.com/track?
  &id=engify
  &transaction=order_123
  &amount=19.99
  &currency=USD
" />
```

**Method C: Manual Reconciliation**

For programs without automation, manually reconcile monthly:

```
1. Download affiliate network report (CSV)
2. Import into MongoDB via admin panel
3. Match conversions to clicks by date/tool
4. Update revenue stats
```

### 3. Revenue Attribution

**Formula:**
```
Revenue = Σ (Commission × Conversions)

Where:
- Commission = $ amount or % of sale
- Conversions = confirmed sales/signups
```

**Example:**
```
Cursor: 5 conversions × $20 commission = $100
Windsurf: 10 conversions × $15 commission = $150
Replit: 3 conversions × $10 commission = $30
Total Revenue = $280
```

## Metrics & KPIs

### Primary Metrics

1. **Click-Through Rate (CTR)**
   ```
   CTR = (Affiliate Link Clicks / Page Views) × 100
   Target: 5-10%
   ```

2. **Conversion Rate**
   ```
   Conversion Rate = (Conversions / Unique Clicks) × 100
   Target: 3-5%
   ```

3. **Revenue Per Click (RPC)**
   ```
   RPC = Total Revenue / Total Clicks
   Target: $0.50 - $2.00
   ```

4. **Monthly Recurring Revenue (MRR)**
   ```
   MRR = Σ (Monthly Commissions from Active Referrals)
   Target: $1,000 - $10,000
   ```

5. **Customer Lifetime Value (LTV)**
   ```
   LTV = Average Commission × Average Months Retained
   Target: $100 - $500 per referral
   ```

### Secondary Metrics

- **Earnings Per 1000 Clicks (EPM):** Revenue / (Clicks / 1000)
- **Top Performing Tools:** Ranked by revenue
- **Top Traffic Sources:** Pages/sources with highest conversions
- **Seasonal Trends:** Revenue by month/quarter
- **Program Effectiveness:** Revenue per affiliate program

## Data Collection

### What We Collect

**Click-Level Data:**
```typescript
{
  clickId: "click_abc123",
  toolKey: "cursor",
  toolName: "Cursor",
  url: "https://cursor.sh",
  source: "ai-coding-page",
  timestamp: "2025-11-17T10:30:00Z",
  sessionId: "session_xyz",
  userId: "user_123", // if authenticated
  userAgent: "Mozilla/5.0...",
  referrer: "https://google.com/search?q=...",
  ipAddress: "192.168.1.1" // hashed for privacy
}
```

**Conversion-Level Data:**
```typescript
{
  conversionId: "conv_def456",
  toolKey: "cursor",
  clickId: "click_abc123",
  userId: "user_123",
  transactionId: "txn_789",
  orderId: "order_456",
  subscriptionType: "pro",
  revenue: 19.99,
  commission: 19.99, // 100% for first month example
  status: "confirmed",
  timestamp: "2025-11-17T14:00:00Z"
}
```

### Data Retention

- **Click Data:** 90 days in Redis, permanent in MongoDB
- **Conversion Data:** Permanent in MongoDB
- **Personal Data:** IP addresses hashed, PII anonymized after 30 days

## Reporting

### Daily Reports

**Automated Slack/Email at 9am:**
```
📊 Affiliate Performance - Nov 17, 2025

Clicks Yesterday: 234 (+15%)
Conversions: 11 (+3)
Revenue: $167 (+$45)
Top Tool: Windsurf (67 clicks, 4 conversions)
Top Source: ai-coding-page (102 clicks)
```

### Weekly Reports

**Every Monday at 9am:**
```
📈 Weekly Affiliate Report - Week of Nov 11-17

Total Clicks: 1,543
Unique Clicks: 892
Conversions: 47
Revenue: $706
Conversion Rate: 5.3%
Top Performers:
  1. Windsurf - $245 (12 conversions)
  2. Perplexity - $195 (13 conversions)
  3. Cursor - $156 (8 conversions)

Trends:
  ✓ Clicks up 12% vs last week
  ✓ Conversion rate up 0.3%
  ⚠ Revenue per click down 5%
```

### Monthly Reports

**First of each month:**

Full P&L with:
- Total revenue by program
- Revenue by source/channel
- Month-over-month growth
- Yearly projections
- Optimization recommendations

## Revenue Estimation

### Conservative Estimate

**Assumptions:**
- 10,000 monthly visitors
- 5% click-through rate → 500 clicks
- 3% conversion rate → 15 conversions
- $15 average commission

**Calculation:**
```
Monthly Revenue = 15 conversions × $15 = $225/month
Annual Revenue = $225 × 12 = $2,700/year
```

### Moderate Estimate

**Assumptions:**
- 50,000 monthly visitors
- 8% click-through rate → 4,000 clicks
- 5% conversion rate → 200 conversions
- $20 average commission

**Calculation:**
```
Monthly Revenue = 200 conversions × $20 = $4,000/month
Annual Revenue = $4,000 × 12 = $48,000/year
```

### Aggressive Estimate

**Assumptions:**
- 200,000 monthly visitors
- 10% click-through rate → 20,000 clicks
- 7% conversion rate → 1,400 conversions
- $25 average commission

**Calculation:**
```
Monthly Revenue = 1,400 conversions × $25 = $35,000/month
Annual Revenue = $35,000 × 12 = $420,000/year
```

### Target: $10K-$100K ARR

**Path to $10K/year ($833/month):**
- 55 conversions/month @ $15 avg commission
- OR 42 conversions/month @ $20 avg commission
- **Required Clicks:** ~1,100/month @ 5% conversion

**Path to $100K/year ($8,333/month):**
- 555 conversions/month @ $15 avg commission
- OR 417 conversions/month @ $20 avg commission
- **Required Clicks:** ~11,000/month @ 5% conversion

## Optimization Framework

### A/B Testing

**Test Variables:**
1. **Placement:** Hero vs sidebar vs inline vs footer
2. **Copy:** "Try Free" vs "Get Started" vs "Learn More"
3. **Visual:** Button vs text link vs card
4. **Timing:** Immediate vs scroll-triggered vs exit-intent
5. **Targeting:** All users vs new users vs returning users

**Success Metrics:**
- Primary: Conversion rate
- Secondary: Click-through rate, revenue per visitor

### Attribution Analysis

**Questions to Answer:**
1. Which pages drive most affiliate revenue?
2. Which tools have highest conversion rates?
3. What's the optimal placement for each tool?
4. Which user segments convert best?
5. What's the typical customer journey?

**Data Sources:**
- Affiliate click tracking (Redis/MongoDB)
- Google Analytics (user journey)
- PostHog (funnel analysis)
- Affiliate network reports (conversions)

### Revenue Optimization Tactics

1. **Content Optimization**
   - Create comparison pages for high-commission tools
   - Write in-depth reviews for top converters
   - Add affiliate links to existing high-traffic content

2. **Placement Optimization**
   - A/B test link placement on high-traffic pages
   - Add contextual affiliate links in relevant content
   - Create dedicated landing pages for each tool

3. **Commission Optimization**
   - Negotiate higher rates for top performers
   - Focus promotion on high-commission tools
   - Request exclusive discount codes

4. **Conversion Optimization**
   - Provide honest, valuable comparisons
   - Include social proof (reviews, case studies)
   - Reduce friction (clear CTAs, mobile optimization)

## Compliance & Ethics

### FTC Guidelines

**Required Disclosures:**
```html
<p className="text-sm text-muted-foreground">
  ⓘ This page contains affiliate links. We may earn a commission
  when you purchase through these links, at no additional cost to you.
</p>
```

**Placement:** Above or near affiliate links, visible and clear

### Affiliate Program Terms

**Must Comply With:**
- Each affiliate network's terms of service
- No cookie stuffing or fraudulent clicks
- Honest representation of tools (no false claims)
- Clear disclosure of affiliate relationships
- No incentivized clicks (pay-per-click schemes)

### Privacy

**User Data Protection:**
- Hash IP addresses for anonymity
- Don't share PII with affiliate networks
- Comply with GDPR/CCPA for EU/CA users
- Provide opt-out mechanism for tracking

## Troubleshooting

### Revenue Lower Than Expected

**Possible Causes:**
1. Low traffic → Focus on SEO, content marketing
2. Low CTR → Improve placement, copy, design
3. Low conversion rate → Better tool selection, clearer value prop
4. Low commissions → Negotiate higher rates, switch programs
5. Attribution issues → Verify tracking, check cookie settings

**Solutions:**
- Audit tracking implementation
- Review affiliate network reports
- Analyze user feedback
- Test different approaches
- Consider switching tools/networks

### Tracking Discrepancies

**Network shows more conversions than we tracked:**
- Check for missing tracking calls
- Verify Redis/MongoDB sync is working
- Review rate limiting (may be blocking some tracks)

**We show more clicks than network:**
- Normal (not all clicks convert within window)
- Check for bot traffic (filter by user agent)
- Verify tracking isn't firing multiple times

## Next Steps

### Q4 2025 Goals
- [ ] Implement conversion tracking webhooks for top 3 programs
- [ ] A/B test affiliate link placement on homepage
- [ ] Reach $1,000/month in affiliate revenue
- [ ] Sign 2 new high-commission affiliate partnerships

### Q1 2026 Goals
- [ ] Automate monthly revenue reports
- [ ] Implement multi-touch attribution
- [ ] Launch dedicated affiliate landing pages
- [ ] Reach $5,000/month in affiliate revenue

### Q2 2026 Goals
- [ ] Machine learning conversion prediction
- [ ] Personalized affiliate recommendations
- [ ] Partner portal for self-service
- [ ] Reach $10,000/month in affiliate revenue

## Resources

- **Affiliate Networks:** CJ, Impact, ShareASale, PartnerStack
- **Tracking Tools:** PostHog, Google Analytics, Branch
- **Analytics:** Affiliate network dashboards, custom dashboards
- **Documentation:** This file + `/docs/monetization/`

---

**Last Updated:** 2025-11-17
**Next Review:** 2025-12-17
**Owner:** Revenue Team
