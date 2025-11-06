#!/usr/bin/env tsx
/**
 * Create Prioritization Framework Prompts for Leaders
 * 
 * Creates prompts for prioritization frameworks beyond RICE:
 * - ICE (Impact, Confidence, Ease)
 * - WSJF (Weighted Shortest Job First)
 * - MoSCoW (Must have, Should have, Could have, Won't have)
 * - Value vs Effort Matrix
 * - Kano Model
 * - Cost of Delay
 * 
 * Usage:
 *   tsx scripts/content/create-prioritization-frameworks.ts
 */

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface FrameworkPrompt {
  title: string;
  description: string;
  role: string;
  category: string;
  tags: string[];
  content: string;
}

const FRAMEWORK_PROMPTS: FrameworkPrompt[] = [
  {
    title: 'ICE Scoring Framework for Leaders',
    description: 'Prioritize initiatives using ICE (Impact, Confidence, Ease) scoring - a simpler alternative to RICE for quick decision-making.',
    role: 'engineering-manager',
    category: 'leadership',
    tags: ['ice', 'prioritization-framework', 'decision-making', 'frameworks'],
    content: `# ICE Scoring Framework for Leaders

Act as a leader prioritizing initiatives using ICE scoring.

## ICE Framework
**ICE Score = Impact × Confidence × Ease**

- **Impact**: How much will this help? (1-10)
- **Confidence**: How sure are we it will work? (1-10)
- **Ease**: How easy is this to implement? (1-10)

## Context
- **Scope**: [Team/Department/Organization]
- **Timeframe**: [Sprint/Quarter/Year]
- **Capacity**: [Available resources]

## Initiatives to Evaluate
[List initiatives]

## For Each Initiative

### [Initiative Name]

**1. Impact Score (1-10)**
- How much will this help achieve goals?
- **Score**: [X] - [Reasoning]

**2. Confidence Score (1-10)**
- How sure are we this will work?
- **Score**: [X] - [Reasoning]

**3. Ease Score (1-10)**
- How easy is this to implement?
- **Score**: [X] - [Reasoning]

**ICE Score**: [X] = [Impact] × [Confidence] × [Ease]

Rank by ICE score (highest first).`,
  },
  {
    title: 'WSJF (Weighted Shortest Job First) Prioritization',
    description: 'Prioritize work using WSJF methodology from SAFe - perfect for agile teams balancing value, time criticality, and job size.',
    role: 'engineering-manager',
    category: 'leadership',
    tags: ['wsjf', 'prioritization-framework', 'safe', 'agile', 'frameworks'],
    content: `# WSJF (Weighted Shortest Job First) Prioritization

Act as a leader prioritizing work using WSJF.

## WSJF Formula
**WSJF = (User Business Value + Time Criticality + Risk Reduction/Opportunity Enablement) / Job Size**

## For Each Initiative

### [Initiative Name]

**1. User Business Value (1-10)**
- How valuable is this to users/business?
- **Score**: [X] - [Reasoning]

**2. Time Criticality (1-10)**
- How time-sensitive is this?
- **Score**: [X] - [Reasoning]

**3. Risk Reduction/Opportunity Enablement (1-10)**
- How much does this reduce risk or enable opportunities?
- **Score**: [X] - [Reasoning]

**4. Job Size (1-10)**
- How much effort is required?
- **Score**: [X] - [Reasoning]

**WSJF Score**: [X.XX] = ([Value] + [Time] + [Risk]) / [Size]

Rank by WSJF score (highest first).`,
  },
  {
    title: 'MoSCoW Prioritization Framework',
    description: 'Categorize requirements using MoSCoW (Must have, Should have, Could have, Wont have) for clear prioritization and scope management.',
    role: 'product-manager',
    category: 'product',
    tags: ['moscow', 'prioritization-framework', 'requirements', 'scope', 'frameworks'],
    content: `# MoSCoW Prioritization Framework

Act as a Product Manager prioritizing requirements using MoSCoW.

## MoSCoW Categories

- **M = Must Have**: Critical for launch (typically 60% of scope)
- **S = Should Have**: Important but not critical (typically 20% of scope)
- **C = Could Have**: Nice to have if time allows (typically 20% of scope)
- **W = Won't Have**: Out of scope for this release

## Requirements to Categorize
[List requirements]

## For Each Requirement

### [Requirement Name]

**Category**: [M/S/C/W]

**Reasoning**:
- [Why this category]
- [Impact if excluded]
- [Dependencies]

**Scope Allocation**:
- Must Have: [60% allocation]
- Should Have: [20% allocation]
- Could Have: [20% allocation]`,
  },
  {
    title: 'Value vs Effort Matrix Prioritization',
    description: 'Plot initiatives on a Value vs Effort matrix to identify quick wins, major projects, time sinks, and fill-ins.',
    role: 'engineering-manager',
    category: 'leadership',
    tags: ['value-effort', 'prioritization-framework', 'matrix', 'decision-making', 'frameworks'],
    content: `# Value vs Effort Matrix Prioritization

Act as a leader prioritizing using Value vs Effort analysis.

## Matrix Quadrants

**High Value, Low Effort** = Quick Wins (Do First)
**High Value, High Effort** = Major Projects (Plan Carefully)
**Low Value, Low Effort** = Fill-ins (Do if time allows)
**Low Value, High Effort** = Time Sinks (Avoid)

## For Each Initiative

### [Initiative Name]

**Value Score**: [1-10] - [Reasoning]
**Effort Score**: [1-10] - [Reasoning]

**Quadrant**: [Quick Win / Major Project / Fill-in / Time Sink]

**Priority**: [High / Medium / Low / Avoid]

Plot on matrix and prioritize accordingly.`,
  },
  {
    title: 'Kano Model Analysis for Product Features',
    description: 'Categorize features using Kano Model: Basic (must-haves), Performance (more is better), Delight (surprise features).',
    role: 'product-manager',
    category: 'product',
    tags: ['kano', 'prioritization-framework', 'user-satisfaction', 'frameworks'],
    content: `# Kano Model Analysis for Product Features

Act as a Product Manager analyzing features using Kano Model.

## Kano Categories

- **Basic (Must-Haves)**: Expected features, dissatisfaction if missing
- **Performance (More is Better)**: Linear satisfaction, more = better
- **Delight (Exciters)**: Unexpected features that create delight

## Features to Analyze
[List features]

## For Each Feature

### [Feature Name]

**Category**: [Basic / Performance / Delight]

**User Satisfaction Impact**:
- If present: [Satisfaction level]
- If absent: [Dissatisfaction level]

**Prioritization**:
1. Basic features: Must have (table stakes)
2. Performance features: Prioritize by ROI
3. Delight features: Differentiators, but lower priority

**Recommendation**: [Priority level]`,
  },
  {
    title: 'Cost of Delay Analysis',
    description: 'Prioritize work based on Cost of Delay - how much value is lost by delaying each initiative.',
    role: 'engineering-manager',
    category: 'leadership',
    tags: ['cost-of-delay', 'prioritization-framework', 'urgency', 'frameworks'],
    content: `# Cost of Delay Analysis

Act as a leader prioritizing based on Cost of Delay.

## Cost of Delay Factors

- **User Value**: Revenue/retention lost per day/week
- **Opportunity Cost**: Market opportunity shrinking
- **Risk Accumulation**: Technical/customer risk increasing
- **Competitive Threat**: Competitors gaining advantage

## For Each Initiative

### [Initiative Name]

**Cost of Delay per [Time Period]**:
- User Value Lost: [\$X or X users]
- Opportunity Cost: [Market share/revenue]
- Risk Accumulation: [Technical debt/customer churn]
- Competitive Threat: [Competitive disadvantage]

**Total Cost of Delay**: [Aggregated impact]

**Job Duration**: [Time to complete]

**Priority**: [Rank by Cost of Delay / Duration]

Prioritize initiatives with highest Cost of Delay relative to duration.`,
  },
];

// Add same frameworks for other leadership roles
const LEADERSHIP_ROLES = [
  'engineering-director',
  'product-director',
  'vp-engineering',
  'vp-product',
  'director',
  'vp',
  'cto',
];

async function createFrameworkPrompts() {
  console.log('🚀 Creating Prioritization Framework Prompts for Leaders\n');
  console.log('='.repeat(70));

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;
  const allPrompts: FrameworkPrompt[] = [...FRAMEWORK_PROMPTS];

  // Create framework prompts for each leadership role
  for (const role of LEADERSHIP_ROLES) {
    for (const framework of FRAMEWORK_PROMPTS) {
      // Skip if role-specific framework already exists
      if (framework.role === role) continue;

      // Create role-specific version
      const roleFramework: FrameworkPrompt = {
        ...framework,
        title: `${framework.title.replace(/for Leaders/i, '')} for ${role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
        role,
        tags: [...framework.tags, role],
      };
      allPrompts.push(roleFramework);
    }
  }

  console.log(`\n📊 Total frameworks to create: ${allPrompts.length}\n`);

  for (const prompt of allPrompts) {
    // Check if prompt already exists
    const existing = await promptsCollection.findOne({
      role: prompt.role,
      title: { $regex: new RegExp(prompt.title.split(' for ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    });

    if (existing) {
      console.log(`⏭️  Skipped: "${prompt.title}" (already exists)`);
      skipped++;
      continue;
    }

    // Generate unique slug
    const baseSlug = generateSlug(prompt.title);
    let slug = baseSlug;
    let suffix = 1;
    
    while (await promptsCollection.findOne({ slug })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    const promptDoc = {
      id: randomUUID(),
      slug,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      role: prompt.role,
      tags: prompt.tags,
      currentRevision: 1,
      views: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isFeatured: false,
      active: true,
      source: 'seed' as const,
    };

    try {
      await promptsCollection.insertOne(promptDoc);
      created++;
      console.log(`✅ Created: "${prompt.title}" (${prompt.role})`);
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        skipped++;
      } else {
        console.error(`❌ Error: "${prompt.title}" -`, error);
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   - Created: ${created} prompts`);
  console.log(`   - Skipped: ${skipped} prompts`);
  console.log(`\n✨ Complete!`);

  process.exit(0);
}

createFrameworkPrompts().catch(console.error);

