<!--
AI Summary: Comprehensive tag taxonomy for content discoverability and SEO optimization.
Tags enable filtering, browse pages, and search engine indexing.
-->

# Tag Taxonomy Design

This work is part of Day 6: [Day 6 Plan](../planning/DAY_6_PLAN.md).

## Overview

Comprehensive tagging system for all content (prompts, patterns, learning resources) to enable:
- User filtering and discovery
- SEO optimization (/tags/[tag] browse pages)
- Related content recommendations
- Analytics on popular topics

## Tag Categories

### Role Tags (11 tags)
- `junior-engineer` - Junior/entry-level software engineers
- `mid-engineer` - Mid-level engineers (3-5 years)
- `senior-engineer` - Senior engineers (5-8 years)
- `staff-engineer` - Staff/principal engineers
- `engineering-manager` - First-line engineering managers
- `director` - Directors of engineering
- `vp-engineering` - VP of Engineering
- `cto` - Chief Technology Officer
- `product-manager` - Product managers
- `designer` - UX/UI designers
- `qa-engineer` - QA/test engineers

### Category Tags (7 tags)
- `engineering` - Software development, architecture
- `product` - Product management, strategy
- `design` - UX/UI, user research
- `marketing` - Marketing, growth, content
- `sales` - Sales, customer success
- `operations` - DevOps, IT operations
- `leadership` - Executive leadership, management

### Pattern Tags (14 tags)
- `craft` - CRAFT framework
- `kernel` - KERNEL framework
- `chain-of-thought` - Step-by-step reasoning
- `few-shot` - Learning from examples
- `zero-shot` - No examples needed
- `persona` - Role-playing prompts
- `context-window` - Long-context techniques
- `role-prompting` - Assign specific roles to AI
- `tree-of-thought` - Branching exploration
- `self-consistency` - Multiple reasoning paths
- `meta-prompting` - Prompts about prompts
- `rag` - Retrieval-Augmented Generation
- `cot` - Chain-of-Thought (abbreviation)
- `react` - ReAct (Reasoning + Acting)

### Skill Tags (8 tags)
- `debugging` - Bug fixing, troubleshooting
- `architecture` - System design, technical decisions
- `code-review` - Review processes, feedback
- `refactoring` - Code improvement, tech debt
- `testing` - Test strategies, QA
- `documentation` - Writing docs, API specs
- `performance` - Optimization, profiling
- `security` - Security practices, threat modeling

### Use-Case Tags (8 tags)
- `onboarding` - New hire onboarding
- `1-on-1s` - One-on-one meetings
- `okrs` - OKR planning and tracking
- `retros` - Retrospectives, post-mortems
- `tech-debt` - Technical debt planning
- `incident-response` - Incident management
- `planning` - Sprint/project planning
- `communication` - Stakeholder communication

### Difficulty Tags (4 tags)
- `beginner` - Entry level, foundational
- `intermediate` - Some experience required
- `advanced` - Deep expertise needed
- `expert` - Cutting-edge, specialized

## Tagging Rules

**Each prompt should have 4-8 tags total**:
- 1 role tag (primary audience)
- 1 category tag (domain)
- 1-2 pattern tags (techniques used)
- 1-3 skill/use-case tags (what it helps with)
- Optional: difficulty tag

**Example**:
```typescript
{
  title: "Code Review Feedback Template",
  tags: [
    'senior-engineer',        // role
    'engineering',            // category
    'craft',                  // pattern
    'code-review',            // skill
    'communication'           // skill
  ]
}
```

## MongoDB Schema

```typescript
// src/lib/db/schemas/tags.ts
import { z } from 'zod';

export const RoleTag = z.enum([
  'junior-engineer',
  'mid-engineer',
  'senior-engineer',
  'staff-engineer',
  'engineering-manager',
  'director',
  'vp-engineering',
  'cto',
  'product-manager',
  'designer',
  'qa-engineer',
]);

export const CategoryTag = z.enum([
  'engineering',
  'product',
  'design',
  'marketing',
  'sales',
  'operations',
  'leadership',
]);

export const PatternTag = z.enum([
  'craft',
  'kernel',
  'chain-of-thought',
  'few-shot',
  'zero-shot',
  'persona',
  'context-window',
  'role-prompting',
  'tree-of-thought',
  'self-consistency',
  'meta-prompting',
  'rag',
  'cot',
  'react',
]);

export const SkillTag = z.enum([
  'debugging',
  'architecture',
  'code-review',
  'refactoring',
  'testing',
  'documentation',
  'performance',
  'security',
]);

export const UseCaseTag = z.enum([
  'onboarding',
  '1-on-1s',
  'okrs',
  'retros',
  'tech-debt',
  'incident-response',
  'planning',
  'communication',
]);

export const DifficultyTag = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const Tag = z.union([
  RoleTag,
  CategoryTag,
  PatternTag,
  SkillTag,
  UseCaseTag,
  DifficultyTag,
]);

export type Tag = z.infer<typeof Tag>;
```

## MongoDB Indexes

```javascript
// Add to Collections.PROMPT_TEMPLATES indexes
db.prompt_templates.createIndex({ tags: 1 });
db.prompt_templates.createIndex({ 'tags': 1, 'category': 1 });
db.prompt_templates.createIndex({ 'tags': 1, 'role': 1 });
```

## SEO Benefits

- Browse pages: `/tags/debugging` shows all debugging-related prompts
- Better categorization: Users find content by skill, not just role
- Search engine keywords: Each tag becomes a target keyword
- Related content: Tags enable "similar prompts" recommendations

## Implementation Tasks

1. Create tag schema file
2. Update PromptTemplateSchema to validate tags
3. Create migration script to apply tags to existing prompts
4. Build tag browse page component
5. Add tag filtering to library page
6. Update seed scripts with comprehensive tags

