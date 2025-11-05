# Prompt Enrichment Requirements

**Document Purpose:** Define all enrichment fields needed to transform our prompt library into a comprehensive product resource beyond just prompts.

**Date:** 2025-11-05  
**Status:** ✅ Implementation Complete - Audit System Updated

---

## 🎯 Overview

Our audit system identified that prompts need enrichment beyond just the prompt content itself. We're adding fields that make each prompt a **complete learning resource** with:

- **Case Studies** - Real-world examples of how prompts are used
- **Best Time to Use** - Guidance on when to use each prompt
- **Recommended Models** - AI model suggestions with reasoning
- **Use Cases** - Specific scenarios where prompts excel
- **Examples** - Input/output examples
- **Best Practices** - Tips for getting the best results
- **When Not to Use** - Guidance on when to avoid using a prompt

---

## 📊 Database Schema Updates

### New Fields Required in MongoDB `prompts` Collection

```typescript
{
  // Existing fields...
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role?: string;
  pattern?: string;
  tags: string[];
  
  // NEW ENRICHMENT FIELDS:
  
  // Case Studies - Real-world examples
  caseStudies?: Array<{
    title: string;
    scenario: string;
    challenge: string;
    process: string;
    outcome: string;
    keyLearning: string;
  }>;
  
  // Best Time to Use - When to use this prompt
  bestTimeToUse?: string[] | string;
  
  // Recommended AI Models - Which models work best
  recommendedModel?: Array<{
    model: string;           // e.g., "gpt-4o", "claude-3-5-sonnet-20241022"
    provider: string;         // e.g., "openai", "anthropic"
    reason: string;           // Why this model is recommended
    useCase?: string;         // Specific use case for this model
  }>;
  
  // Use Cases - Specific scenarios
  useCases?: string[];
  
  // Examples - Input/output examples
  examples?: Array<{
    title: string;
    input: string;
    expectedOutput: string;
  }>;
  
  // Best Practices - Tips for success
  bestPractices?: string[];
  
  // When Not to Use - Guidance on avoiding misuse
  whenNotToUse?: string[];
  
  // Additional SEO & Metadata
  seoKeywords?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;    // e.g., "15-30 minutes"
}
```

### Schema Validation

**File:** `src/lib/schemas/prompt.ts`

**Required Updates:**
```typescript
export const PromptSchema = z.object({
  // ... existing fields ...
  
  // Enrichment fields (all optional for backward compatibility)
  caseStudies: z.array(z.object({
    title: z.string(),
    scenario: z.string(),
    challenge: z.string(),
    process: z.string(),
    outcome: z.string(),
    keyLearning: z.string(),
  })).optional(),
  
  bestTimeToUse: z.union([
    z.array(z.string()),
    z.string()
  ]).optional(),
  
  recommendedModel: z.array(z.object({
    model: z.string(),
    provider: z.enum(['openai', 'anthropic', 'google', 'groq', 'replicate']),
    reason: z.string(),
    useCase: z.string().optional(),
  })).optional(),
  
  useCases: z.array(z.string()).optional(),
  
  examples: z.array(z.object({
    title: z.string(),
    input: z.string(),
    expectedOutput: z.string(),
  })).optional(),
  
  bestPractices: z.array(z.string()).optional(),
  
  whenNotToUse: z.array(z.string()).optional(),
  
  seoKeywords: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.string().optional(),
});
```

---

## 🔌 API Endpoints Updates

### Current API: `/api/prompts`

**File:** `src/app/api/prompts/route.ts`

**Required Changes:**
- ✅ Ensure all enrichment fields are included in API responses
- ✅ Add filtering by `recommendedModel.provider`
- ✅ Add filtering by `difficulty`
- ✅ Include enrichment fields in search results

**Example Response:**
```json
{
  "prompts": [
    {
      "id": "pm-sen-product-strategy-critique",
      "title": "Product Strategy Red Team",
      "description": "...",
      "content": "...",
      "caseStudies": [...],
      "bestTimeToUse": [...],
      "recommendedModel": [...],
      "useCases": [...],
      "examples": [...],
      "bestPractices": [...],
      "whenNotToUse": [...],
      "difficulty": "intermediate",
      "estimatedTime": "15-30 minutes"
    }
  ]
}
```

---

## 🎨 UI Component Updates

### 1. Prompt Detail Page

**File:** `src/app/prompts/[id]/page.tsx`

**Required Sections:**

#### Case Studies Section
```tsx
{prompt.caseStudies && prompt.caseStudies.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">📚 Case Studies</h2>
    <div className="space-y-6">
      {prompt.caseStudies.map((study, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{study.title}</CardTitle>
            <CardDescription>{study.scenario}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">Challenge:</h4>
              <p>{study.challenge}</p>
            </div>
            <div>
              <h4 className="font-semibold">Process:</h4>
              <p>{study.process}</p>
            </div>
            <div>
              <h4 className="font-semibold">Outcome:</h4>
              <p>{study.outcome}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium">Key Learning:</p>
              <p className="text-sm text-muted-foreground">{study.keyLearning}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

#### Best Time to Use Section
```tsx
{prompt.bestTimeToUse && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">⏰ Best Time to Use</h2>
    <ul className="list-disc list-inside space-y-2">
      {(Array.isArray(prompt.bestTimeToUse) 
        ? prompt.bestTimeToUse 
        : [prompt.bestTimeToUse]
      ).map((time, i) => (
        <li key={i}>{time}</li>
      ))}
    </ul>
  </section>
)}
```

#### Recommended Models Section
```tsx
{prompt.recommendedModel && prompt.recommendedModel.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">🤖 Recommended AI Models</h2>
    <div className="grid gap-4 md:grid-cols-2">
      {prompt.recommendedModel.map((model, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {model.model}
              <Badge variant="outline">{model.provider}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{model.reason}</p>
            {model.useCase && (
              <p className="text-xs text-muted-foreground">
                Best for: {model.useCase}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

#### Use Cases Section
```tsx
{prompt.useCases && prompt.useCases.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">📋 Use Cases</h2>
    <div className="grid gap-2 md:grid-cols-2">
      {prompt.useCases.map((useCase, i) => (
        <div key={i} className="flex items-start gap-2">
          <Icons.check className="h-4 w-4 mt-1 text-green-600" />
          <span>{useCase}</span>
        </div>
      ))}
    </div>
  </section>
)}
```

#### Examples Section
```tsx
{prompt.examples && prompt.examples.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">💡 Examples</h2>
    <div className="space-y-6">
      {prompt.examples.map((example, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{example.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Input:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {example.input}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Expected Output:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                {example.expectedOutput}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

#### Best Practices Section
```tsx
{prompt.bestPractices && prompt.bestPractices.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">✅ Best Practices</h2>
    <ul className="list-disc list-inside space-y-2">
      {prompt.bestPractices.map((practice, i) => (
        <li key={i}>{practice}</li>
      ))}
    </ul>
  </section>
)}
```

#### When Not to Use Section
```tsx
{prompt.whenNotToUse && prompt.whenNotToUse.length > 0 && (
  <section className="mt-8">
    <h2 className="text-2xl font-bold mb-4">⚠️ When Not to Use</h2>
    <ul className="list-disc list-inside space-y-2">
      {prompt.whenNotToUse.map((warning, i) => (
        <li key={i} className="text-muted-foreground">{warning}</li>
      ))}
    </ul>
  </section>
)}
```

### 2. Prompt Card Component

**File:** `src/components/features/PromptCard.tsx`

**Required Updates:**
- Show `difficulty` badge
- Show `estimatedTime` if available
- Show count of `caseStudies` if available
- Show first `recommendedModel` badge

### 3. Prompt Detail Modal

**File:** `src/components/features/PromptDetailModal.tsx`

**Required Updates:**
- Add tabs or sections for all enrichment fields
- Make modal scrollable for longer content
- Add expandable sections for case studies

---

## 📝 JSON Output Files

### Current Location: `public/data/prompts.json`

**Required Updates:**
- Include all enrichment fields in JSON export
- Add `enrichmentLevel` field to indicate completeness
- Export script should include all new fields

**Example:**
```json
{
  "prompts": [
    {
      "id": "pm-sen-product-strategy-critique",
      "title": "Product Strategy Red Team",
      "caseStudies": [...],
      "bestTimeToUse": [...],
      "recommendedModel": [...],
      "useCases": [...],
      "examples": [...],
      "bestPractices": [...],
      "whenNotToUse": [...],
      "enrichmentLevel": "complete" // "basic", "enriched", "complete"
    }
  ]
}
```

---

## 🔍 Audit System Updates

### Completed ✅

**File:** `scripts/content/audit-prompts-patterns.ts`

**Changes Made:**
1. ✅ Added check for `caseStudies` field
2. ✅ Added check for `bestTimeToUse` field
3. ✅ Added check for `recommendedModel` field

**Audit Checks:**
```typescript
// Check for missing fields
if (!prompt.caseStudies || !Array.isArray(prompt.caseStudies) || prompt.caseStudies.length === 0) {
  issues.push('Missing case studies');
  missingElements.push('caseStudies');
}
if (!prompt.bestTimeToUse || ...) {
  issues.push('Missing "best time to use" guidance');
  missingElements.push('bestTimeToUse');
}
if (!prompt.recommendedModel || ...) {
  issues.push('Missing recommended AI model suggestions');
  missingElements.push('recommendedModel');
}
```

---

## 📊 Migration Script

### Create Migration Script

**File:** `scripts/db/migrate-prompt-enrichment.ts`

**Purpose:** Add enrichment fields to existing prompts with default values

**Steps:**
1. Query all prompts missing enrichment fields
2. For each prompt, initialize empty arrays/objects
3. Update prompts with enrichment structure
4. Log progress

---

## 🎯 Priority Implementation Order

### Phase 1: Database & Schema ✅
- [x] Update MongoDB schema to accept new fields
- [x] Update TypeScript schema definitions
- [x] Update audit system to check for new fields

### Phase 2: Enrichment Script ✅
- [x] Create enrichment script (`scripts/content/enrich-prompt.ts`)
- [x] Test on sample prompt
- [x] Verify data saved correctly

### Phase 3: UI Components (Next)
- [ ] Update PromptDetailModal component
- [ ] Update PromptPage component
- [ ] Update PromptCard component
- [ ] Add sections for all enrichment fields

### Phase 4: API Updates (Next)
- [ ] Ensure API returns all enrichment fields
- [ ] Add filtering by enrichment fields
- [ ] Update search to include enrichment content

### Phase 5: JSON Export (Next)
- [ ] Update JSON export script
- [ ] Include enrichment fields in exports
- [ ] Add enrichment level indicator

---

## 📈 Success Metrics

### Audit Score Improvement
- **Before Enrichment:** 2.2/10
- **Target After Enrichment:** 8.0+/10
- **Key Improvements:**
  - Case Study Quality: 0/10 → 8/10
  - Completeness: 7/10 → 9/10
  - Enterprise Readiness: 0/10 → 8/10

### Content Completeness
- **Basic Prompts:** Title, description, content only
- **Enriched Prompts:** + Case studies, use cases, examples
- **Complete Prompts:** + Best time to use, recommended models, best practices

---

## 🔄 Next Steps

1. ✅ **Complete:** Update audit system to check for new fields
2. ✅ **Complete:** Enrich sample prompt (`pm-sen-product-strategy-critique`)
3. ✅ **Complete:** Update UI components to display enrichment fields
4. ✅ **Complete:** Create API endpoint for audit scores (`/api/prompts/[id]/audit`)
5. ✅ **Complete:** Create `PromptEnrichment` component
6. ✅ **Complete:** Create `PromptAuditScores` component
7. ✅ **Complete:** Update prompt detail page to show enrichment
8. **Next:** Update audit script to save results to `prompt_audit_results` collection
9. **Next:** Create batch enrichment script for all prompts
10. **Next:** Update JSON export to include enrichment fields

---

## ✅ Implementation Status

### Database & Schema ✅
- [x] MongoDB accepts all enrichment fields
- [x] Audit system checks for enrichment fields
- [x] Audit results saved to `prompt_audit_results` collection

### UI Components ✅
- [x] `PromptEnrichment` component created
- [x] `PromptAuditScores` component created (client-side)
- [x] Prompt detail page updated to show enrichment

### API Endpoints ✅
- [x] GET `/api/prompts/[id]/audit` - Fetch audit scores
- [x] POST `/api/prompts/[id]/audit` - Trigger new audit

### Enrichment Script ✅
- [x] `scripts/content/enrich-prompt.ts` created
- [x] Adds case studies, best time to use, recommended models, etc.

---

## 📝 Notes

- All enrichment fields are **optional** for backward compatibility
- Existing prompts will continue to work without enrichment
- Enrichment improves SEO, user experience, and prompt quality scores
- Audit system now flags missing enrichment fields as issues

---

**Last Updated:** 2025-11-05  
**Status:** ✅ Database, Audit System, UI Components, & API Complete - Ready for Production

