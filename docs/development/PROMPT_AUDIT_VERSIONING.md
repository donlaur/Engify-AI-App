# Prompt Audit Versioning & Dating

**Last Updated:** November 5, 2024  
**Status:** ✅ Implemented

---

## 📋 Overview

The audit system now automatically tracks version numbers and dates for all audit results. Each audit creates a new versioned record, allowing you to track audit history and improvements over time.

---

## 🔢 Version Numbering

### How It Works

1. **First Audit:** Creates version `1`
2. **Subsequent Audits:** Increments version (`2`, `3`, `4`, etc.)
3. **Version Lookup:** Finds latest audit by querying `{ auditVersion: -1 }` (descending)

### Version Calculation

```typescript
// Find existing audit with highest version
const existingAudit = await db.collection('prompt_audit_results').findOne(
  { promptId: prompt.id },
  { sort: { auditVersion: -1 } }
);

// Calculate next version
const auditVersion = existingAudit 
  ? (existingAudit.auditVersion || 0) + 1 
  : 1;
```

---

## 📅 Audit Dating

### Date Fields

Each audit record includes multiple date fields:

- **`auditDate`**: Primary audit date (used for versioning)
- **`auditedAt`**: Timestamp when audit completed (ISO format)
- **`createdAt`**: Record creation timestamp
- **`updatedAt`**: Record last update timestamp

### Date Format

All dates are stored as `Date` objects in MongoDB:
```typescript
const auditDate = new Date();
// Stored as: ISODate("2024-11-05T03:00:00.000Z")
```

---

## 💾 Database Schema

### Prompt Audit Results

```typescript
{
  _id: ObjectId,
  promptId: string,              // References prompt.id
  promptTitle: string,           // Snapshot of title at audit time
  auditVersion: number,          // Version number (1, 2, 3, ...)
  auditDate: Date,               // Primary audit date
  overallScore: number,          // Weighted score (1-10)
  categoryScores: {
    engineeringUsefulness: number,
    caseStudyQuality: number,
    completeness: number,
    seoEnrichment: number,
    enterpriseReadiness: number,
    securityCompliance: number,
    accessibility: number,
    performance: number,
  },
  agentReviews: Record<string, string>,
  issues: string[],
  recommendations: string[],
  missingElements: string[],
  needsFix: boolean,
  auditedAt: Date,               // Audit completion timestamp
  auditedBy: string,              // User ID or 'system'
  createdAt: Date,                // Record creation
  updatedAt: Date,                // Record update
}
```

### Pattern Audit Results

```typescript
{
  _id: ObjectId,
  patternId: string,             // References pattern.id
  patternName: string,           // Snapshot of name at audit time
  auditVersion: number,          // Version number (1, 2, 3, ...)
  auditDate: Date,               // Primary audit date
  // ... same fields as prompt audit
}
```

---

## 🔄 Audit Workflow

### 1. Initial Audit

```bash
# First audit creates version 1
pnpm tsx scripts/content/test-audit-adr.ts
```

**Result:**
```
✅ Audit saved to database
   Version: 1
   Date: 2024-11-05T03:00:00.000Z
```

### 2. Re-Audit After Improvements

```bash
# After enriching prompt, re-audit creates version 2
pnpm tsx scripts/content/test-audit-adr.ts
```

**Result:**
```
✅ Audit saved to database
   Version: 2
   Date: 2024-11-05T04:30:00.000Z
```

### 3. Query Audit History

```javascript
// Get all audit versions for a prompt
const audits = await db.collection('prompt_audit_results')
  .find({ promptId: 'doc-001' })
  .sort({ auditVersion: 1 })  // Ascending: oldest first
  .toArray();

// Get latest audit
const latestAudit = await db.collection('prompt_audit_results')
  .findOne(
    { promptId: 'doc-001' },
    { sort: { auditVersion: -1 } }  // Descending: latest first
  );
```

---

## 📊 Audit History Tracking

### Benefits

1. **Track Improvements:** See score changes between versions
2. **Audit Trail:** Complete history of all audits
3. **Regression Detection:** Compare scores across versions
4. **Compliance:** Timestamped audit records for compliance

### Example: Score Improvement

```
Version 1 (2024-11-05T03:00:00Z):
  Overall Score: 3.7/10
  Issues: 3
  Missing Elements: 3

Version 2 (2024-11-05T04:30:00Z):
  Overall Score: 7.2/10
  Issues: 0
  Missing Elements: 0
```

---

## 🔍 API Endpoints

### GET `/api/prompts/[id]/audit`

Returns latest audit with version info:

```json
{
  "hasAudit": true,
  "promptId": "doc-001",
  "auditResult": {
    "auditVersion": 2,
    "auditDate": "2024-11-05T04:30:00.000Z",
    "overallScore": 7.2,
    "categoryScores": { ... },
    ...
  }
}
```

### POST `/api/prompts/[id]/audit`

Creates new audit version:

```json
{
  "success": true,
  "auditResult": {
    "auditVersion": 2,
    "auditDate": "2024-11-05T04:30:00.000Z",
    "overallScore": 7.2,
    ...
  }
}
```

---

## 📝 Implementation Details

### Files Updated

1. **`src/app/api/prompts/[id]/audit/route.ts`**
   - Updated to use `insertOne` instead of `updateOne`
   - Calculates version number before saving
   - Returns version and date in response

2. **`scripts/content/test-audit-adr.ts`**
   - Calculates version number
   - Saves with `auditVersion` and `auditDate`
   - Displays version and date in output

3. **`scripts/content/audit-prompts-patterns.ts`**
   - Batch audit saves each result with version
   - Supports both prompts and patterns

### Key Changes

**Before:**
```typescript
// Old: Overwrites existing audit
await db.collection('prompt_audit_results').updateOne(
  { promptId: prompt.id },
  { $set: { ... } },
  { upsert: true }
);
```

**After:**
```typescript
// New: Creates new versioned audit
const existingAudit = await db.collection('prompt_audit_results').findOne(
  { promptId: prompt.id },
  { sort: { auditVersion: -1 } }
);

const auditVersion = existingAudit 
  ? (existingAudit.auditVersion || 0) + 1 
  : 1;

await db.collection('prompt_audit_results').insertOne({
  promptId: prompt.id,
  auditVersion,
  auditDate: new Date(),
  ...
});
```

---

## 🎯 Best Practices

### When to Audit

1. **Initial Audit:** After creating new prompt
2. **After Enrichment:** When adding case studies, examples, etc.
3. **After Major Changes:** When updating prompt content significantly
4. **Regular Reviews:** Monthly or quarterly audits

### Version Management

- **Don't delete old audits:** Keep full history
- **Always increment:** Never reuse version numbers
- **Use latest for display:** Query with `{ auditVersion: -1 }`
- **Compare versions:** Use version numbers to track improvements

### Date Usage

- **`auditDate`**: Use for sorting and filtering audits
- **`auditedAt`**: Use for precise timestamp display
- **`createdAt`**: System field, don't modify
- **`updatedAt`**: System field, auto-updated

---

## 📈 Querying Audit History

### Get All Versions

```typescript
const audits = await db.collection('prompt_audit_results')
  .find({ promptId: 'doc-001' })
  .sort({ auditVersion: 1 })  // Oldest first
  .toArray();
```

### Get Score Improvement

```typescript
const audits = await db.collection('prompt_audit_results')
  .find({ promptId: 'doc-001' })
  .sort({ auditVersion: 1 })
  .toArray();

const improvement = audits[audits.length - 1].overallScore 
  - audits[0].overallScore;
```

### Get Audit Count

```typescript
const auditCount = await db.collection('prompt_audit_results')
  .countDocuments({ promptId: 'doc-001' });
```

---

## ✅ Checklist

When auditing:
- [ ] Version number is calculated correctly
- [ ] Date is set to current timestamp
- [ ] Previous audit is found (if exists)
- [ ] Version increments properly
- [ ] All date fields are populated
- [ ] Version and date displayed in output

---

**Last Updated:** November 5, 2024  
**Maintained By:** Engify AI Team

