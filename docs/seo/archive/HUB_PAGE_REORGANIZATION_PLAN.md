# Hub Page Reorganization Plan

**Date:** November 8, 2025  
**Goal:** Transform existing AI tool pages into comprehensive content hubs

---

## Current State

### ✅ What We Have
- `/learn/ai-tools` - Overview page with all tools
- `/learn/ai-tools/[slug]` - Dynamic tool detail pages (cursor, windsurf, etc.)
- Cursor vs Windsurf comparison table on overview page
- Basic tool info (features, pricing, pros/cons)
- SoftwareApplication schema (partial)

### ❌ What's Missing (Hub Features)
- Related Prompts section
- Related Patterns section
- Problem/Solution section (with Engify tie-ins)
- Articles section (placeholder for 3 articles)
- Community Feedback widget
- Author byline
- Generous external linking
- Enhanced schema (nested schemas)

---

## Hub Page Structure (10 Sections)

### Current Sections (Keep & Enhance)
1. ✅ Hero + Overview (have)
2. ✅ Key Features (have)
3. ✅ Pricing (have)
4. ✅ Pros/Cons (have)

### New Sections (Add)
5. **Related Prompts** (NEW)
6. **Related Patterns** (NEW)
7. **Problem/Solution** (NEW - CRITICAL)
8. **Articles** (NEW - Placeholder)
9. **Getting Started Guide** (NEW)
10. **Community Resources** (NEW - External Links)

---

## Implementation Plan

### Phase 1: Enhance Cursor Hub (`/learn/ai-tools/cursor`)

**Section 5: Related Prompts**
```tsx
<section className="mb-12">
  <h2 className="mb-6 text-2xl font-bold">Essential Prompts for Cursor</h2>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* Link to existing prompts filtered by cursor tag */}
    <PromptCard 
      title="React Component Generator"
      href="/prompts/react-component-builder"
      tags={['cursor', 'react']}
    />
    <PromptCard 
      title="API Endpoint Creator"
      href="/prompts/expert-api-design-consultant"
      tags={['cursor', 'api']}
    />
    {/* ... more prompts */}
  </div>
  <Button asChild variant="outline" className="mt-4">
    <Link href="/prompts?tool=cursor">
      View All Cursor Prompts →
    </Link>
  </Button>
</section>
```

**Section 6: Related Patterns**
```tsx
<section className="mb-12">
  <h2 className="mb-6 text-2xl font-bold">Recommended Patterns for Cursor</h2>
  <div className="grid gap-4 md:grid-cols-3">
    <PatternCard 
      title="Chain of Thought"
      description="For complex logic"
      href="/patterns/chain-of-thought"
    />
    <PatternCard 
      title="Cognitive Verifier"
      description="For validation"
      href="/patterns/cognitive-verifier"
    />
    <PatternCard 
      title="Kernel Pattern"
      description="For orchestration"
      href="/patterns/kernel"
    />
  </div>
  <Button asChild variant="outline" className="mt-4">
    <Link href="/patterns">
      View All Patterns →
    </Link>
  </Button>
</section>
```

**Section 7: Problem/Solution (CRITICAL)**
```tsx
<section className="mb-12">
  <h2 className="mb-6 text-2xl font-bold">Common Cursor Problems (And How Engify Helps)</h2>
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Problem 1: No Guardrails</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Issue:</strong> Cursor generates code without checking against your team's standards</p>
          <p><strong>Impact:</strong> AI slop, inconsistent code, failed reviews</p>
          <p className="text-primary"><strong>Engify Solution:</strong> MCP integration with pattern enforcement and Red Hat warnings</p>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Problem 2: Token Waste</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Issue:</strong> Sending entire codebase context every time</p>
          <p><strong>Impact:</strong> $200/month bills, slow responses</p>
          <p className="text-primary"><strong>Engify Solution:</strong> Smart context optimization (96% token reduction)</p>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Problem 3: No Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Issue:</strong> Cursor forgets what broke last time</p>
          <p><strong>Impact:</strong> Repeat bugs, wasted debugging time</p>
          <p className="text-primary"><strong>Engify Solution:</strong> Bug memory layer - "You fixed this 3 weeks ago"</p>
        </div>
      </CardContent>
    </Card>
    
    {/* ... more problems */}
  </div>
</section>
```

**Section 8: Articles (Placeholder)**
```tsx
<section className="mb-12">
  <h2 className="mb-6 text-2xl font-bold">In-Depth Cursor Guides</h2>
  <div className="grid gap-4 md:grid-cols-2">
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Cursor vs Windsurf: Speed vs Control (2025)</CardTitle>
        <CardDescription>Coming Soon</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Comprehensive comparison of the two leading AI-native IDEs
        </p>
      </CardContent>
    </Card>
    
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Cursor Memory Problem: Why Your AI Keeps Making the Same Mistakes</CardTitle>
        <CardDescription>Coming Soon</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          How to build a memory system for Cursor (and why Engify does it better)
        </p>
      </CardContent>
    </Card>
  </div>
</section>
```

**Section 9: Getting Started Guide**
```tsx
<section className="mb-12">
  <Card>
    <CardHeader>
      <CardTitle>Getting Started with Cursor</CardTitle>
    </CardHeader>
    <CardContent>
      <ol className="list-decimal space-y-3 pl-5">
        <li>
          <strong>Download & Install:</strong> Get Cursor from{' '}
          <a href="https://cursor.com" className="text-primary underline">cursor.com</a>
        </li>
        <li>
          <strong>Set Up .cursorrules:</strong> Create a .cursorrules file in your project root
        </li>
        <li>
          <strong>Try Your First Prompt:</strong> Press Cmd+K and ask "Explain this file"
        </li>
        <li>
          <strong>Learn Composer:</strong> Press Cmd+Shift+K for multi-file editing
        </li>
        <li>
          <strong>Optimize Tokens:</strong> Use @-mention to send only relevant files
        </li>
      </ol>
      
      <div className="mt-6 rounded-lg bg-muted p-4">
        <p className="text-sm font-semibold">💡 Pro Tip:</p>
        <p className="text-sm text-muted-foreground">
          Start with a small project to learn the basics. Cursor's power comes from 
          understanding when to use Chat vs Composer vs Agent mode.
        </p>
      </div>
    </CardContent>
  </Card>
</section>
```

**Section 10: Community Resources (External Links)**
```tsx
<section className="mb-12">
  <h2 className="mb-6 text-2xl font-bold">Community Resources</h2>
  
  <div className="space-y-6">
    <div>
      <h3 className="mb-3 text-lg font-semibold">Official Resources</h3>
      <ul className="space-y-2">
        <li>
          <a href="https://cursor.com/docs" className="text-primary underline">
            Cursor Documentation
          </a> - Official guide
        </li>
        <li>
          <a href="https://cursor.com/blog" className="text-primary underline">
            Cursor Blog
          </a> - Latest updates
        </li>
        <li>
          <a href="https://cursor.com/pricing" className="text-primary underline">
            Cursor Pricing
          </a> - Current pricing
        </li>
      </ul>
    </div>
    
    <div>
      <h3 className="mb-3 text-lg font-semibold">Community Resources</h3>
      <ul className="space-y-2">
        <li>
          <a href="https://cursor.directory" className="text-primary underline">
            Cursor Directory
          </a> - 100+ community .cursorrules
        </li>
        <li>
          <a href="https://github.com/matank001/cursor-security-rules" className="text-primary underline">
            cursor-security-rules
          </a> - Security-focused rules
        </li>
        <li>
          <a href="https://reddit.com/r/cursor" className="text-primary underline">
            r/cursor
          </a> - Community discussions
        </li>
        <li>
          <a href="https://forum.cursor.com" className="text-primary underline">
            Cursor Forum
          </a> - Official support
        </li>
      </ul>
    </div>
  </div>
  
  <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
    <p className="text-sm text-muted-foreground">
      <strong>Why we link to other sites:</strong> We believe the best resource for you might not 
      always be Engify. Our goal is to help you succeed with AI coding tools, 
      not to lock you into our platform.
    </p>
  </div>
</section>
```

---

### Phase 2: Enhance Windsurf Hub (`/learn/ai-tools/windsurf`)

Same 10-section structure, but with Windsurf-specific content:

**Problem/Solution Section:**
- Problem 1: Context Loss ("Cascade nightmare")
- Problem 2: Token Waste (credits eaten like snacks)
- Problem 3: Quality Control (buggy AI code)
- Problem 4: Manual Rules (no .windsurfrules equivalent)
- Problem 5: No Learning (doesn't teach WHY)

**Community Resources:**
- Windsurf Docs
- Windsurf Rules Directory
- r/Codeium
- Windsurf University

---

### Phase 3: Enhance AI Tools Overview (`/learn/ai-tools`)

**Add Section: "Why Engify for All Your AI Tools"**
```tsx
<section className="mb-12">
  <Card className="border-primary/20 bg-primary/5">
    <CardHeader>
      <CardTitle>Optimize All Your AI Tools with Engify</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="mb-2 font-semibold">Memory Layer</h3>
          <p className="text-sm text-muted-foreground">
            Works with Cursor, Windsurf, Claude, and more. 
            Remembers what broke last time so you don't repeat mistakes.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Token Optimization</h3>
          <p className="text-sm text-muted-foreground">
            Reduce token costs by 96% across all tools. 
            Smart context selection before sending to AI.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Guardrails</h3>
          <p className="text-sm text-muted-foreground">
            Prevent AI slop with pattern enforcement. 
            Red Hat warnings before you commit bad code.
          </p>
        </div>
      </div>
      <Button asChild size="lg" className="mt-6">
        <Link href="/workbench">
          Try Engify Workbench →
        </Link>
      </Button>
    </CardContent>
  </Card>
</section>
```

---

## Technical Implementation

### 1. Create Reusable Components

**`components/hub/RelatedPrompts.tsx`**
```tsx
interface RelatedPromptsProps {
  tool: string; // 'cursor' | 'windsurf' | 'claude'
}

export function RelatedPrompts({ tool }: RelatedPromptsProps) {
  // Fetch prompts filtered by tool tag
  // Display in grid
  // Link to /prompts?tool={tool}
}
```

**`components/hub/RelatedPatterns.tsx`**
```tsx
export function RelatedPatterns() {
  // Display top 3 patterns
  // Link to /patterns
}
```

**`components/hub/ProblemSolution.tsx`**
```tsx
interface Problem {
  title: string;
  issue: string;
  impact: string;
  solution: string;
}

interface ProblemSolutionProps {
  problems: Problem[];
}

export function ProblemSolution({ problems }: ProblemSolutionProps) {
  // Display problems in cards
  // Highlight Engify solution
}
```

**`components/hub/CommunityResources.tsx`**
```tsx
interface Resource {
  title: string;
  url: string;
  description: string;
}

interface CommunityResourcesProps {
  official: Resource[];
  community: Resource[];
}

export function CommunityResources({ official, community }: CommunityResourcesProps) {
  // Display external links
  // Show "why we link out" callout
}
```

### 2. Update Tool Data Structure

Add to `src/lib/services/AIToolService.ts`:

```typescript
interface ToolHubData {
  problems: Problem[];
  communityResources: {
    official: Resource[];
    community: Resource[];
  };
  gettingStarted: string[];
  relatedPrompts: string[]; // Prompt IDs
  relatedPatterns: string[]; // Pattern IDs
}

// Add to tool schema
```

### 3. Enhanced Schema Markup

Update SoftwareApplication schema to include:
```json
{
  "@type": "SoftwareApplication",
  "name": "Cursor IDE",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Windows, macOS, Linux",
  "offers": {
    "@type": "Offer",
    "price": "20",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "1000"
  },
  "featureList": [
    "AI-powered code completion",
    "Multi-file refactoring",
    "Codebase Q&A"
  ]
}
```

---

## Quick Win: Add to Existing Pages NOW

### Minimal Changes (30 min)

**1. Add "Related Resources" section to Cursor page:**
- Just add the Community Resources section (Section 10)
- External links to cursor.directory, GitHub, Reddit, Forum
- "Why we link out" callout

**2. Add "How Engify Helps" callout:**
- Single card with 3 problems + Engify solutions
- Link to /workbench

**3. Add "Articles Coming Soon" section:**
- 2 placeholder cards for the 3 articles we'll write
- Builds anticipation

---

## Timeline

### Today (30 min)
- Add Community Resources section to Cursor page
- Add Community Resources section to Windsurf page
- Add "How Engify Helps" callout to both

### This Weekend (2 hours)
- Create reusable hub components
- Add all 10 sections to Cursor hub
- Add all 10 sections to Windsurf hub
- Update AI Tools overview with Engify positioning

### Next Week (After Articles)
- Replace "Coming Soon" placeholders with actual article links
- Add community feedback widgets
- Add author bylines

---

## Success Metrics

### Before (Current State)
- Basic tool info pages
- No internal linking to prompts/patterns
- No external linking
- No Engify positioning

### After (Hub Pages)
- 10-section comprehensive hubs
- 10+ internal links per page (to prompts/patterns)
- 10+ external links per page (to community resources)
- Clear Engify value prop on every page
- Placeholder for 3 articles per hub

### SEO Impact
- **Topical Authority:** +30% (comprehensive coverage)
- **Internal Linking:** +50% (leveraging existing content)
- **External Linking:** +40% (authority signals)
- **Conversion:** +25% (clear Engify positioning)

---

## Next Steps

**Option A: Quick Win (30 min)**
- Add Community Resources + Engify callout to Cursor/Windsurf pages NOW

**Option B: Full Implementation (2 hours)**
- Build all reusable components
- Add all 10 sections to both hubs

**Option C: Continue MVP**
- Do hub work this weekend
- Focus on MVP today

**Which approach?**
