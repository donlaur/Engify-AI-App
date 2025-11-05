# Quick Start Guide - Prompt Audit Workflow

## 🎯 Current Task
Audit and improve the **Architecture Decision Record (ADR)** prompt (`doc-001`)

## 🚀 Commands

### 1. Run Audit
```bash
pnpm tsx scripts/content/test-audit-adr.ts
```

### 2. Check Results in Database
```bash
# Via MongoDB shell or script
db.prompt_audit_results.findOne({ promptId: 'doc-001' })
```

### 3. View on Website
- Prompt Page: https://www.engify.ai/prompts/architecture-decision-record-adr
- Audit scores appear in `PromptAuditScores` component

### 4. Revise Prompt
```bash
pnpm tsx scripts/content/enrich-prompt.ts --id=doc-001
```

### 5. Re-Audit
```bash
pnpm tsx scripts/content/test-audit-adr.ts
```

## 🔧 Verify Build Works
```bash
pnpm run build
```

## 📊 Check Current Status
```bash
# Check prompt exists
pnpm tsx -e "
import { getMongoDb } from './src/lib/db/mongodb.ts';
const db = await getMongoDb();
const prompt = await db.collection('prompts').findOne({ id: 'doc-001' });
console.log('Prompt:', prompt?.title);
console.log('Revision:', prompt?.currentRevision);
"

# Check audit results
pnpm tsx -e "
import { getMongoDb } from './src/lib/db/mongodb.ts';
const db = await getMongoDb();
const audit = await db.collection('prompt_audit_results').findOne({ promptId: 'doc-001' });
console.log('Has Audit:', !!audit);
if (audit) console.log('Score:', audit.overallScore);
"
```

## ⚠️ Important Notes
- Stay on **v1** until changes approved
- All updates create revisions automatically
- After approval, system creates **v2**
- Check that all AI models work before proceeding


