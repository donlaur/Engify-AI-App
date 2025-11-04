# Cloudflare CDN Setup for Engify.ai

**Goal:** Add Cloudflare CDN in front of Vercel to reduce costs, improve performance, and provide DDoS protection.

---

## Why Cloudflare?

### Cost Savings
- **Free Tier:** Unlimited bandwidth (vs Vercel's paid bandwidth)
- **MongoDB Reduction:** 97% fewer queries (static JSON cached)
- **Serverless Savings:** No cold starts = faster = cheaper

### Performance Benefits
- **Global CDN:** 200+ edge locations worldwide
- **Faster Load Times:** 10-50ms from nearest edge
- **Better SEO:** Improved Core Web Vitals scores

### Security Benefits
- **DDoS Protection:** Free included
- **WAF:** Web Application Firewall (free tier)
- **SSL/TLS:** Automatic HTTPS

---

## Setup Steps

### 1. Add Domain to Cloudflare (5 min)

1. Sign up at [cloudflare.com](https://cloudflare.com) (free account)
2. Click "Add a Site"
3. Enter `engify.ai`
4. Select "Free" plan
5. Cloudflare will scan your DNS records

### 2. Update Nameservers (5 min)

Cloudflare will provide new nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**At your domain registrar:**
1. Go to DNS settings
2. Replace nameservers with Cloudflare's
3. Wait 24-48 hours for propagation

### 3. Configure DNS Records (2 min)

**In Cloudflare Dashboard:**

```
Type    Name    Content                    Proxy Status
A       @       <Vercel IP>                Proxied (orange cloud)
CNAME   www     cname.vercel-dns.com       Proxied (orange cloud)
```

**Important:** Keep "Proxy" enabled (orange cloud) for CDN benefits.

### 4. Configure Caching Rules (5 min)

**Cloudflare Dashboard → Rules → Page Rules:**

**Rule 1: Cache Static JSON Files**
```
URL Pattern: engify.ai/data/*.json
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 hour
```

**Rule 2: Cache Static Assets**
```
URL Pattern: engify.ai/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

**Rule 3: Don't Cache API Routes**
```
URL Pattern: engify.ai/api/*
Settings:
  - Cache Level: Bypass
```

### 5. Verify Vercel Integration (2 min)

**In Vercel Dashboard:**
1. Go to **Settings → Domains**
2. Add `engify.ai` as custom domain
3. Vercel will auto-detect Cloudflare DNS
4. SSL certificate auto-provisioned

---

## Cache Configuration

### Static JSON Files (`/data/*.json`)

**Cloudflare Settings:**
- Cache Level: Cache Everything
- Edge Cache TTL: 1 hour
- Browser Cache TTL: 1 hour

**Why:** JSON regenerates hourly via cron, so 1 hour cache is perfect.

### ISR Pages (`/patterns/*`, `/prompts/*`)

**Cloudflare Settings:**
- Cache Level: Respect Existing Headers
- Edge Cache TTL: 1 hour (matches Vercel ISR)

**Why:** Respects Vercel's `revalidate` headers, Cloudflare caches for 1 hour.

### API Routes (`/api/*`)

**Cloudflare Settings:**
- Cache Level: Bypass

**Why:** Dynamic content, should never be cached.

---

## Performance Testing

### Verify Cloudflare is Active

```bash
# Check Cloudflare headers
curl -I https://engify.ai/data/patterns.json

# Should see:
# CF-Cache-Status: HIT (if cached)
# CF-Ray: <edge-location-id>
# Server: cloudflare
```

### Test Load Times

```bash
# From different locations
# US East
curl -w "@curl-format.txt" https://engify.ai/data/patterns.json

# Expected: 10-50ms (from Cloudflare edge)
```

### Monitor Cache Hit Rate

**Cloudflare Dashboard → Analytics:**
- Cache Hit Rate: Should be 90%+ for static files
- Bandwidth Saved: Shows how much bandwidth Cloudflare served

---

## Cost Analysis

### Before Cloudflare
- Vercel Bandwidth: $0.10/GB (after free tier)
- MongoDB Queries: ~1,000/day = $3/month
- Serverless Cold Starts: $5-10/month
- **Total:** ~$8-13/month

### After Cloudflare
- Cloudflare CDN: **Free** (unlimited bandwidth)
- MongoDB Queries: ~24/day = $0.07/month (97% reduction)
- Serverless: $0-2/month (no cold starts)
- **Total:** ~$0-2/month

### Savings
- **$8-11/month saved**
- **$96-132/year saved**

At scale (10K+ DAU):
- **$280-650/month saved**

---

## Security Features (Free Tier)

### DDoS Protection
- Automatic mitigation
- No configuration needed

### Web Application Firewall (WAF)
- Basic rules included
- Blocks common attacks

### SSL/TLS
- Automatic HTTPS
- Free SSL certificates
- TLS 1.3 support

---

## Troubleshooting

### Cloudflare is Caching Too Much

**Problem:** API routes cached, dynamic content stale

**Solution:** Add Page Rule:
```
URL Pattern: engify.ai/api/*
Cache Level: Bypass
```

### Cloudflare is Not Caching

**Problem:** Static files not cached

**Solution:**
1. Check Page Rules are active
2. Verify "Proxy" (orange cloud) is enabled
3. Check cache headers from Vercel

### SSL Certificate Issues

**Problem:** Mixed content warnings

**Solution:**
1. Cloudflare Dashboard → SSL/TLS
2. Set to "Full" (not "Flexible")
3. Wait 5 minutes for propagation

---

## Monitoring

### Key Metrics to Watch

1. **Cache Hit Rate:** Should be 90%+ for static files
2. **Bandwidth Saved:** Shows Cloudflare's contribution
3. **Load Time:** Should improve globally
4. **MongoDB Queries:** Should drop by 97%

### Cloudflare Dashboard

- **Analytics:** Cache performance, bandwidth saved
- **Security:** Attacks blocked, threats mitigated
- **Speed:** Load time improvements

---

## Next Steps

1. ✅ Add domain to Cloudflare
2. ✅ Update nameservers
3. ✅ Configure DNS records
4. ✅ Set up caching rules
5. ✅ Monitor cache hit rate
6. ✅ Verify cost savings

---

## References

- [Cloudflare Free Tier](https://www.cloudflare.com/plans/free/)
- [Cloudflare Caching Guide](https://developers.cloudflare.com/cache/)
- [Vercel + Cloudflare Setup](https://vercel.com/docs/concepts/edge-network/cloudflare-integration)

