# Production Stability Checklist

> **Critical**: This site is actively used for job applications. Downtime = lost opportunities.

## Pre-Deployment Gate

Before merging ANY change to `main`:

### 1. Local Testing (Required)
- [ ] `pnpm build` succeeds locally
- [ ] `pnpm dev` runs without errors
- [ ] Test the specific feature/page you changed
- [ ] Check browser console for client-side errors
- [ ] Verify MongoDB connections close properly (no connection leaks)

### 2. Vercel Preview Deploy (Required)
- [ ] Create PR and wait for Vercel preview deployment
- [ ] Visit preview URL and test changed pages
- [ ] Check preview deployment logs for 5xx errors
- [ ] Verify no redirect loops (visit root, key pages)
- [ ] Test on mobile viewport

### 3. SEO/Redirect Changes (High Risk - Extra Review)
**If touching middleware.ts, next.config.js redirects, or canonical URLs:**
- [ ] Test www → non-www (or vice versa) manually
- [ ] Test HTTP → HTTPS redirect
- [ ] Verify no circular redirects with curl: `curl -I https://engify.ai`
- [ ] Check that existing indexed URLs still work (don't break Google)
- [ ] Preview deploy MUST be tested for 5+ minutes before merge

### 4. Database Changes (High Risk)
**If touching MongoDB queries, indexes, or connection logic:**
- [ ] Verify connection pooling limits respected (Atlas M0 = 100 max)
- [ ] Test with realistic data volumes (not just empty collections)
- [ ] Check for leaked connections: monitor Atlas metrics during preview
- [ ] Ensure proper error handling and fallback for connection failures

### 5. Rollback Plan (Always)
- [ ] Note current production commit SHA before merge
- [ ] Tag stable releases: `git tag stable-$(date +%Y%m%d)`
- [ ] Know how to revert: `git revert <commit> && git push`

## Emergency Response Playbook

### Site Down (5xx, Redirect Loop, etc.)
1. **Check Vercel deployment logs** (vercel.com/donlaurs-projects/engify-ai-app/deployments)
2. **Identify last commit**: `git log --oneline -5`
3. **Revert if recent change**: `git revert <sha> && git push`
4. **Check MongoDB Atlas**: Are we hitting connection limits?
5. **Vercel redeploy**: Sometimes edge cache needs clearing

### Slow Performance
1. Check Vercel metrics: response times, cache hit rate
2. MongoDB Atlas metrics: connection count, slow queries
3. Consider upgrading MongoDB tier if consistently hitting limits

## Known Fragile Areas

### High-Risk Files (Extra Caution)
- `src/middleware.ts` - Redirects run on EVERY request
- `next.config.js` - Redirects, headers, build config
- `src/lib/mongodb.ts` - Connection pooling, critical for all pages
- Any file with `permanentRedirect()` or `redirect()` calls

### MongoDB Connection Limits
- **Current**: Atlas M0 (free tier) = 100 concurrent connections
- **Symptoms**: Intermittent 5xx, "too many connections" errors
- **Mitigation**: Connection pooling (already in place), upgrade to M10 if needed

### Vercel Edge Caching
- ISR (Incremental Static Regeneration) can serve stale pages
- Revalidation cron jobs (vercel.json) run hourly/daily
- Manual revalidation: Vercel dashboard → Deployments → Redeploy

## Stability Improvements (TODO)

### Short-term (This Week)
- [ ] Set up Vercel alerts for 5xx errors (email/Slack)
- [ ] Tag current stable commit
- [ ] Document known-good MongoDB connection pool settings
- [ ] Add health check endpoint: `/api/health` (MongoDB + basic app check)

### Medium-term (This Month)
- [ ] Upgrade MongoDB Atlas to M10 ($57/mo) for stability
- [ ] Set up Sentry alerts for client-side errors
- [ ] Staging environment (separate Vercel project)
- [ ] Automated smoke tests on preview deploys

### Long-term (When Revenue Allows)
- [ ] Migrate to Railway Postgres (more stable, cheaper at scale)
- [ ] Full CI/CD pipeline with automated testing
- [ ] Blue/green deployments for zero-downtime updates

---

**Remember**: Every production issue during job search = potential lost opportunity. When in doubt, test twice, merge once.

