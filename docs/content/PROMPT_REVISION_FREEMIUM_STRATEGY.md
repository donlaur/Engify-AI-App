/**
 * Prompt Revision & Freemium Strategy Documentation
 * 
 * This document outlines the revision tracking system and freemium strategy
 * for prompts on Engify.ai
 */

# Prompt Revision Tracking & Freemium Strategy

## Overview

We've implemented a comprehensive revision tracking system for prompts that:
1. **Tracks all changes** to prompts for audit and history purposes
2. **Enables freemium model** by marking prompts as premium/public
3. **Provides SEO benefits** through rich revision history
4. **Supports enterprise features** with detailed change tracking

## Revision System

### Database Schema

**Collection: `prompt_revisions`**

Each revision document contains:
- `promptId`: Reference to the prompt
- `revisionNumber`: Sequential revision number (1, 2, 3, ...)
- `changes`: Array of field-level changes
  - `field`: Field name (e.g., 'title', 'content', 'caseStudies')
  - `oldValue`: Previous value (truncated to 500 chars)
  - `newValue`: New value (truncated to 500 chars)
  - `changeType`: 'created', 'updated', 'deleted', or 'enriched'
- `changedBy`: User ID or 'system'
- `changeReason`: Description of why the change was made
- `snapshot`: Full snapshot of prompt at this revision
- `createdAt`: Timestamp

**Collection: `prompts`** (updated fields):
- `currentRevision`: Current revision number (default: 1)
- `lastRevisedBy`: User who last revised
- `lastRevisedAt`: Timestamp of last revision
- `isPremium`: Boolean - true if behind firewall
- `isPublic`: Boolean - true if publicly accessible
- `requiresAuth`: Boolean - true if authentication required

### API Endpoints

**GET `/api/prompts/[id]/revisions`**
- Returns revision history for a prompt
- Public access (no auth required)
- Returns last 50 revisions sorted by revision number (descending)

**PATCH `/api/prompts/[id]`** (updated)
- Automatically creates a revision when a prompt is updated
- Requires `prompts:write` permission
- Includes `changeReason` in request body (optional)

### Usage

When updating a prompt via API:

```typescript
PATCH /api/prompts/[id]
{
  "title": "Updated Title",
  "content": "Updated content...",
  "changeReason": "Enrichment based on audit feedback"
}
```

The system will:
1. Find the existing prompt
2. Compare old vs new values
3. Create a revision document with all changes
4. Increment `currentRevision` on the prompt
5. Update `lastRevisedBy` and `lastRevisedAt`

## Freemium Strategy

### Field Definitions

- **`isPremium`**: `true` = premium content (behind firewall), `false` = free
- **`isPublic`**: `true` = publicly accessible, `false` = private/internal
- **`requiresAuth`**: `true` = requires authentication to view

### Usage Patterns

1. **Free Public Prompts** (default):
   ```json
   {
     "isPremium": false,
     "isPublic": true,
     "requiresAuth": false
   }
   ```

2. **Premium Prompts** (behind firewall):
   ```json
   {
     "isPremium": true,
     "isPublic": false,
     "requiresAuth": true
   }
   ```

3. **Private/Internal Prompts**:
   ```json
   {
     "isPremium": false,
     "isPublic": false,
     "requiresAuth": true
   }
   ```

### SEO Strategy

**Free Tier (Current)**:
- Show ~10-20 high-quality prompts publicly
- Full SEO optimization
- Rich metadata (revisions, audit scores, enrichment)
- Indexed by search engines

**Premium Tier (Future)**:
- Hundreds of prompts behind authentication
- Full revision history visible to authenticated users
- Advanced features (export, team sharing, custom prompts)
- Access via subscription or enterprise license

### Content Strategy

1. **Featured Prompts** (`isFeatured: true`):
   - Always public and free
   - Highest quality scores
   - Best SEO optimization
   - Used for marketing and lead generation

2. **Premium Prompts**:
   - Advanced patterns and techniques
   - Industry-specific prompts
   - Custom/enterprise prompts
   - Requires subscription

3. **Revision History**:
   - Shows evolution and improvement
   - Demonstrates quality and care
   - Builds trust with users
   - SEO benefit: fresh content signals

## UI Components

### PromptRevisions Component

Located at: `src/components/features/PromptRevisions.tsx`

Features:
- Expandable revision cards
- Color-coded change types (created/updated/deleted/enriched)
- Before/after comparisons
- Change reason and author tracking
- Chronological display (newest first)

### Integration

The revision history is displayed on the prompt detail page (`/prompts/[id]`) below the audit scores and above the metrics.

## Database Indexes

Recommended indexes for performance:

```javascript
// prompt_revisions collection
db.prompt_revisions.createIndex({ promptId: 1, revisionNumber: -1 });
db.prompt_revisions.createIndex({ createdAt: -1 });
db.prompt_revisions.createIndex({ changedBy: 1 });

// prompts collection (existing + new)
db.prompts.createIndex({ isPremium: 1, isPublic: 1 });
db.prompts.createIndex({ currentRevision: -1 });
db.prompts.createIndex({ lastRevisedAt: -1 });
```

## Migration

For existing prompts:

1. Set `currentRevision: 1` for all existing prompts
2. Optionally create an initial revision for each prompt:
   ```javascript
   db.prompts.find().forEach(prompt => {
     db.prompt_revisions.insertOne({
       promptId: prompt.id || prompt._id.toString(),
       revisionNumber: 1,
       changes: [{
         field: 'created',
         changeType: 'created',
         newValue: 'Initial creation'
       }],
       snapshot: {
         title: prompt.title,
         description: prompt.description,
         content: prompt.content,
         // ... other fields
       },
       createdAt: prompt.createdAt || new Date()
     });
   });
   ```

## Future Enhancements

1. **Revision Comparison**: Side-by-side diff view
2. **Rollback**: Restore a prompt to a previous revision
3. **Branching**: Create branches from revisions
4. **Revision Analytics**: Track which revisions improved quality scores
5. **Team Collaboration**: Comments on revisions
6. **Approval Workflow**: Require approval for revisions
7. **Export History**: Export revision history as CSV/JSON

## SEO Benefits

1. **Fresh Content Signals**: Frequent revisions signal active maintenance
2. **Rich Schema**: Revision history can be included in structured data
3. **User Trust**: Visible revision history builds credibility
4. **Long-tail Keywords**: Revision dates and reasons provide additional content
5. **Internal Linking**: Revision pages can link to related prompts

## Enterprise Features

- **Audit Trail**: Full history of who changed what and when
- **Compliance**: Meet regulatory requirements for change tracking
- **Quality Assurance**: Track improvements over time
- **Collaboration**: Multiple team members can see changes
- **Version Control**: Similar to Git, but for prompts

