# Extend Existing AI Tools for Hub Content

**Date:** November 8, 2025  
**Goal:** Add hub content fields to existing AI Tools schema + OpsHub CRUD

---

## Current State

### ✅ Already Have
- `/opshub/ai-tools` - Full CRUD interface
- `/api/admin/ai-tools` - CRUD API with RBAC
- `AIToolService` - Service layer
- `AIToolSchema` - Zod validation
- ISR + JSON cache pattern (from prompts/patterns)

### ❌ Missing
- Hub content fields (problems, resources, getting started, etc.)
- Hub content editor in OpsHub
- Related prompts/patterns linking

---

## Simple Approach: Extend Existing Schema

### Add Hub Fields to AITool Schema

```typescript
// src/lib/db/schemas/ai-tool.ts

// ADD these new fields to existing AIToolSchema:

export const AIToolSchema = z.object({
  // ... existing fields (id, name, slug, category, etc.) ...
  
  // NEW: Hub Content Fields
  hubContent: z.object({
    // Section 5: Related Prompts
    relatedPrompts: z.array(z.string()).default([]), // Prompt IDs
    promptsHeading: z.string().optional(),
    
    // Section 6: Related Patterns  
    relatedPatterns: z.array(z.string()).default([]), // Pattern IDs
    patternsHeading: z.string().optional(),
    
    // Section 7: Problems & Solutions
    problems: z.array(z.object({
      id: z.string(),
      title: z.string(),
      issue: z.string(),
      impact: z.string(),
      engifySolution: z.string(),
      order: z.number(),
    })).default([]),
    
    // Section 8: Articles (placeholders)
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      slug: z.string().optional(),
      status: z.enum(['coming_soon', 'published']).default('coming_soon'),
      order: z.number(),
    })).default([]),
    
    // Section 9: Getting Started
    gettingStarted: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
    })).default([]),
    gettingStartedProTip: z.string().optional(),
    
    // Section 10: Community Resources
    officialResources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      order: z.number(),
    })).default([]),
    communityResources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      order: z.number(),
    })).default([]),
  }).optional(), // Optional so existing tools don't break
});
```

---

## OpsHub UI Updates

### Add "Hub Content" Tab to Existing Editor

```typescript
// src/app/opshub/ai-tools/page.tsx

// ADD new tab to existing tool editor dialog:

<Tabs defaultValue="basic">
  <TabsList>
    <TabsTrigger value="basic">Basic Info</TabsTrigger>
    <TabsTrigger value="features">Features & Pricing</TabsTrigger>
    <TabsTrigger value="hub">Hub Content</TabsTrigger> {/* NEW */}
  </TabsList>
  
  {/* Existing tabs... */}
  
  <TabsContent value="hub">
    <HubContentEditor tool={editingTool} onChange={handleHubContentChange} />
  </TabsContent>
</Tabs>
```

### Hub Content Editor Component

```typescript
// src/components/opshub/HubContentEditor.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/lib/icons';

interface HubContentEditorProps {
  tool: AITool;
  onChange: (hubContent: any) => void;
}

export function HubContentEditor({ tool, onChange }: HubContentEditorProps) {
  const [hubContent, setHubContent] = useState(tool.hubContent || {});
  
  // Problems Section
  function addProblem() {
    const newProblem = {
      id: crypto.randomUUID(),
      title: '',
      issue: '',
      impact: '',
      engifySolution: '',
      order: (hubContent.problems?.length || 0) + 1,
    };
    
    const updated = {
      ...hubContent,
      problems: [...(hubContent.problems || []), newProblem],
    };
    
    setHubContent(updated);
    onChange(updated);
  }
  
  // Community Resources Section
  function addResource(type: 'official' | 'community') {
    const key = type === 'official' ? 'officialResources' : 'communityResources';
    const newResource = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      description: '',
      order: (hubContent[key]?.length || 0) + 1,
    };
    
    const updated = {
      ...hubContent,
      [key]: [...(hubContent[key] || []), newResource],
    };
    
    setHubContent(updated);
    onChange(updated);
  }
  
  return (
    <div className="space-y-6">
      {/* Problems & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Problems & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubContent.problems?.map((problem, idx) => (
              <Card key={problem.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Input
                      placeholder="Problem Title"
                      value={problem.title}
                      onChange={(e) => {
                        const updated = { ...hubContent };
                        updated.problems[idx].title = e.target.value;
                        setHubContent(updated);
                        onChange(updated);
                      }}
                    />
                    <Textarea
                      placeholder="Issue Description"
                      value={problem.issue}
                      onChange={(e) => {
                        const updated = { ...hubContent };
                        updated.problems[idx].issue = e.target.value;
                        setHubContent(updated);
                        onChange(updated);
                      }}
                    />
                    <Textarea
                      placeholder="Impact"
                      value={problem.impact}
                      onChange={(e) => {
                        const updated = { ...hubContent };
                        updated.problems[idx].impact = e.target.value;
                        setHubContent(updated);
                        onChange(updated);
                      }}
                    />
                    <Textarea
                      placeholder="Engify Solution"
                      value={problem.engifySolution}
                      onChange={(e) => {
                        const updated = { ...hubContent };
                        updated.problems[idx].engifySolution = e.target.value;
                        setHubContent(updated);
                        onChange(updated);
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updated = { ...hubContent };
                        updated.problems.splice(idx, 1);
                        setHubContent(updated);
                        onChange(updated);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addProblem}>
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Problem
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Community Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Community Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Official Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Official Resources</h4>
              {hubContent.officialResources?.map((resource, idx) => (
                <div key={resource.id} className="mb-3 space-y-2 rounded border p-3">
                  <Input
                    placeholder="Title"
                    value={resource.title}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.officialResources[idx].title = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    value={resource.url}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.officialResources[idx].url = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={resource.description}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.officialResources[idx].description = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const updated = { ...hubContent };
                      updated.officialResources.splice(idx, 1);
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => addResource('official')} size="sm">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Official Resource
              </Button>
            </div>
            
            {/* Community Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Community Resources</h4>
              {hubContent.communityResources?.map((resource, idx) => (
                <div key={resource.id} className="mb-3 space-y-2 rounded border p-3">
                  <Input
                    placeholder="Title"
                    value={resource.title}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.communityResources[idx].title = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    value={resource.url}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.communityResources[idx].url = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={resource.description}
                    onChange={(e) => {
                      const updated = { ...hubContent };
                      updated.communityResources[idx].description = e.target.value;
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const updated = { ...hubContent };
                      updated.communityResources.splice(idx, 1);
                      setHubContent(updated);
                      onChange(updated);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => addResource('community')} size="sm">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Community Resource
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Similar sections for Getting Started, Articles, etc. */}
    </div>
  );
}
```

---

## Update Hub Page to Use New Fields

```typescript
// src/app/learn/ai-tools/[slug]/page.tsx

export default async function AIToolDetailPage({ params }: PageProps) {
  const tool = await aiToolService.findBySlug(params.slug);
  
  if (!tool) {
    notFound();
  }
  
  const hubContent = tool.hubContent;
  
  return (
    <MainLayout>
      {/* Existing sections (Hero, Features, Pricing, Pros/Cons) */}
      
      {/* NEW: Hub Content Sections */}
      {hubContent && (
        <>
          {/* Section 7: Problems & Solutions */}
          {hubContent.problems && hubContent.problems.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">
                Common {tool.name} Problems (And How Engify Helps)
              </h2>
              <div className="space-y-4">
                {hubContent.problems.map((problem) => (
                  <Card key={problem.id}>
                    <CardHeader>
                      <CardTitle>{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Issue:</strong> {problem.issue}</p>
                        <p><strong>Impact:</strong> {problem.impact}</p>
                        <p className="text-primary">
                          <strong>Engify Solution:</strong> {problem.engifySolution}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {/* Section 10: Community Resources */}
          {(hubContent.officialResources?.length > 0 || hubContent.communityResources?.length > 0) && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">Community Resources</h2>
              
              {hubContent.officialResources && hubContent.officialResources.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold">Official Resources</h3>
                  <ul className="space-y-2">
                    {hubContent.officialResources.map((resource) => (
                      <li key={resource.id}>
                        <a href={resource.url} className="text-primary underline">
                          {resource.title}
                        </a>
                        {resource.description && (
                          <span className="text-muted-foreground"> - {resource.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {hubContent.communityResources && hubContent.communityResources.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Community Resources</h3>
                  <ul className="space-y-2">
                    {hubContent.communityResources.map((resource) => (
                      <li key={resource.id}>
                        <a href={resource.url} className="text-primary underline">
                          {resource.title}
                        </a>
                        {resource.description && (
                          <span className="text-muted-foreground"> - {resource.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Why we link to other sites:</strong> We believe the best resource for you might not 
                  always be Engify. Our goal is to help you succeed with AI coding tools, 
                  not to lock you into our platform.
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </MainLayout>
  );
}
```

---

## Implementation Steps

### Step 1: Update Schema (5 min)
- Add `hubContent` field to `AIToolSchema`
- Make it optional so existing tools don't break

### Step 2: Create Hub Content Editor Component (30 min)
- Create `HubContentEditor.tsx`
- Add forms for problems, resources, getting started, articles

### Step 3: Add Tab to OpsHub (10 min)
- Add "Hub Content" tab to existing AI Tools editor
- Wire up the `HubContentEditor` component

### Step 4: Update Hub Page (20 min)
- Add new sections to `/learn/ai-tools/[slug]/page.tsx`
- Conditionally render based on `hubContent` existence

### Step 5: Seed Initial Data (15 min)
- Add hub content for Cursor
- Add hub content for Windsurf

---

## Total Time: ~1.5 hours

**This is way simpler than creating a new collection!**

- ✅ Reuses existing CRUD infrastructure
- ✅ Reuses existing RBAC/auth
- ✅ Reuses existing ISR pattern
- ✅ No new API routes needed
- ✅ No new service layer needed

---

## Next Steps

**Want me to:**
1. Update the AITool schema with hubContent field
2. Create the HubContentEditor component
3. Add the tab to OpsHub
4. Update the hub page to render new sections

**Or continue with MVP work and do this later?**
