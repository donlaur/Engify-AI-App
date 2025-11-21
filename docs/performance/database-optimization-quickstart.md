# Database Optimization - Quick Start Guide

## 🚀 Quick Implementation (5 minutes)

### Step 1: Create Critical Indexes (HIGH Priority)
```bash
# Run the comprehensive index creation script
pnpm exec tsx scripts/db/create-all-indexes.ts --priority=HIGH

# Expected output: ~20 indexes created
# Time: 30-60 seconds
```

### Step 2: Verify Indexes
```bash
# Connect to MongoDB and check indexes
mongosh "$MONGODB_URI"

# In mongosh:
use engify
db.prompt_history.getIndexes()
db.users.getIndexes()
db.audit_logs.getIndexes()
```

### Step 3: Deploy Query Optimizations
Update these files with optimized queries:

**High Impact Changes:**

1. `/src/app/api/admin/stats/route.ts` (Lines 79-86)
   - Replace `countDocuments()` with `estimatedDocumentCount()`
   - **Impact:** 80-95% faster dashboard load

2. `/src/lib/repositories/EnhancedUserRepository.ts` (Lines 173-205)
   - Combine aggregations using `$facet`
   - **Impact:** 50-70% faster user stats

3. `/src/lib/repositories/mongodb/PromptRepository.ts` (Lines 250-268)
   - Use text search instead of regex
   - **Impact:** 70-90% faster search

### Step 4: Test Performance
```bash
# Before optimization
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/admin/stats"

# After optimization
# Should see 70-80% improvement in response time
```

---

## 📊 Priority Implementation Schedule

### Week 1: Critical Performance (HIGH Priority)
**Collections:** prompt_history, prompt_collections, users, audit_logs, ai_usage_logs

**Actions:**
1. ✅ Run: `pnpm exec tsx scripts/db/create-all-indexes.ts --priority=HIGH`
2. ✅ Deploy query optimizations
3. ✅ Monitor performance metrics

**Expected Results:**
- Dashboard: 2-3s → 400-600ms
- User history: 1-2s → 200-400ms
- Search: 800ms → 200-300ms

### Week 2: Enhanced Features (MEDIUM Priority)
**Collections:** ai_models, workflows, patterns, learning_content

**Actions:**
1. ✅ Run: `pnpm exec tsx scripts/db/create-all-indexes.ts --priority=MEDIUM`
2. ✅ Add TTL indexes for automatic cleanup
3. ✅ Verify index usage

**Expected Results:**
- Workflow queries: 30-50% faster
- Model selection: 40-60% faster
- Automatic log cleanup active

---

## 🔍 Verification Commands

### Check Index Creation
```javascript
// In mongosh
db.getCollectionNames().forEach(function(collection) {
  print("\n" + collection + ":");
  db[collection].getIndexes().forEach(function(idx) {
    print("  - " + idx.name);
  });
});
```

### Monitor Index Usage
```javascript
// Check which indexes are being used
db.prompts.aggregate([{ $indexStats: {} }])

// See index usage over time
db.prompts.aggregate([
  { $indexStats: {} },
  { $project: {
      name: 1,
      'accesses.ops': 1,
      'accesses.since': 1
  }}
])
```

### Find Slow Queries
```javascript
// Enable profiling for slow queries (>100ms)
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty()
```

---

## 🎯 Quick Wins Checklist

### Database Indexes
- [ ] prompt_history: userId + createdAt
- [ ] prompt_collections: userId + updatedAt
- [ ] users: role, plan, createdAt
- [ ] audit_logs: eventType + timestamp
- [ ] ai_usage_logs: userId + createdAt
- [ ] user_usage_quota: userId (unique)
- [ ] blocked_content: contentHash (unique)

### Query Optimizations
- [ ] Admin stats: Use estimatedDocumentCount()
- [ ] User stats: Combined aggregation with $facet
- [ ] Text search: Use text index instead of regex
- [ ] Add projections to limit returned fields
- [ ] Use .hint() for index optimization

### Monitoring
- [ ] Set up slow query logging
- [ ] Add index usage tracking
- [ ] Monitor connection pool stats
- [ ] Set up performance alerts

---

## 🐛 Troubleshooting

### Issue: Index Creation Fails
```bash
# Check if index already exists
mongosh "$MONGODB_URI" --eval "use engify; db.collection_name.getIndexes()"

# Drop existing index if needed (CAREFUL!)
mongosh "$MONGODB_URI" --eval "use engify; db.collection_name.dropIndex('index_name')"

# Recreate index
pnpm exec tsx scripts/db/create-all-indexes.ts --priority=HIGH
```

### Issue: Queries Still Slow
```javascript
// Force use of specific index
db.prompts.find({ category: 'engineering' }).hint({ category: 1 })

// Explain query to see index usage
db.prompts.find({ category: 'engineering' }).explain('executionStats')
```

### Issue: Too Many Connections (M0 Limit)
Current settings already optimized for M0:
- maxPoolSize: 1
- minPoolSize: 0
- maxIdleTimeMS: 5000

If still hitting limits:
```javascript
// Check current connections
db.serverStatus().connections

// Kill idle connections (last resort)
db.currentOp({ "active": false, "secs_running": { $gt: 60 } })
```

---

## 📈 Expected Performance Improvements

| Metric | Before | After | Command to Test |
|--------|--------|-------|-----------------|
| Dashboard Load | 2-3s | 400-600ms | `curl -w "@curl-format.txt" /api/admin/stats` |
| User History | 1-2s | 200-400ms | `curl -w "@curl-format.txt" /api/prompts/history` |
| Search Query | 800ms | 200-300ms | `curl -w "@curl-format.txt" /api/prompts?search=test` |
| Rate Limit Check | 300ms | 20-50ms | Check server logs |

### curl-format.txt
```
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
```

---

## 📚 Additional Resources

- **Full Report:** `/docs/database-optimization-report.md`
- **Index Script:** `/scripts/db/create-all-indexes.ts`
- **Existing Scripts:**
  - `/scripts/db/create-prompt-indexes.ts` (already run)
  - `/scripts/db/create-revision-indexes.ts` (already run)

---

## 🔐 Safety Notes

1. **Backup First:** All indexes are created with `background: true`
2. **No Data Loss:** Index creation doesn't modify data
3. **M0 Safe:** All indexes tested on MongoDB M0 free tier
4. **Rollback:** Indexes can be dropped if needed

---

## 🎉 Success Criteria

After implementing Week 1 (HIGH priority):
- ✅ Dashboard loads in <600ms
- ✅ User history queries <400ms
- ✅ No full collection scans in logs
- ✅ Index usage >90% on monitored queries

After implementing Week 2 (MEDIUM priority):
- ✅ All features 30-50% faster
- ✅ TTL indexes automatically cleaning up
- ✅ Storage usage stable/decreasing

---

**Next Steps:**
1. Run HIGH priority indexes now
2. Deploy query optimizations today
3. Schedule MEDIUM priority for next week
4. Set up monitoring to track improvements

**Questions?** See full report at `/docs/database-optimization-report.md`
