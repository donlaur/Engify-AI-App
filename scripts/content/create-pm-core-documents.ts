/**
 * Create Core PM Document Prompts
 *
 * Creates prompts for:
 * - Product Requirements Document (PRD)
 * - Lean Canvas
 * - Quarterly Roadmap
 *
 * Run with: pnpm tsx scripts/content/create-pm-core-documents.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

const PROMPTS_TO_CREATE = [
  {
    title: 'Product Requirements Document (PRD) Generator',
    description:
      'Create a comprehensive Product Requirements Document that outlines the problem, solution, success metrics, and implementation details for a new product or feature.',
    content: `# Product Requirements Document (PRD) Generator

## Problem Context

Product Managers need to create detailed Product Requirements Documents (PRDs) that clearly communicate the what, why, and how of a product or feature to stakeholders, engineers, designers, and other team members. A well-structured PRD ensures alignment, reduces ambiguity, and sets clear expectations.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for creating comprehensive PRDs. This prompt guides you through all essential sections of a PRD, ensuring nothing is missed.

## Prompt Template

Act as a Product Manager's assistant. I need to create a Product Requirements Document (PRD) for [product/feature name].

Please guide me through creating a comprehensive PRD with the following sections:

### 1. Overview
- **Product Name**: [Name]
- **Owner**: [Your name/role]
- **Stakeholders**: [List key stakeholders]
- **Date**: [Date]
- **Status**: [Draft/Review/Approved]

### 2. Problem Statement
- What problem are we solving?
- Who is affected by this problem?
- What is the current state, and why is it problematic?
- What evidence do we have that this problem exists?

### 3. Goals & Success Metrics
- What are the primary and secondary goals?
- How will we measure success? (KPIs, OKRs, metrics)
- What are the target metrics and timelines?
- What does "done" look like?

### 4. User Stories & Personas
- Who are the target users?
- Create user personas if needed
- Write user stories in format: "As a [user type], I want [goal] so that [benefit]"
- Prioritize user stories (Must Have, Should Have, Could Have)

### 5. Solution Overview
- High-level description of the solution
- Key features and functionality
- What's in scope vs. out of scope
- Assumptions and constraints

### 6. Functional Requirements
- Detailed feature specifications
- User flows and interactions
- Edge cases and error handling
- Dependencies on other features/systems

### 7. Non-Functional Requirements
- Performance requirements
- Security considerations
- Scalability needs
- Accessibility requirements
- Browser/device compatibility

### 8. Design & UX Considerations
- Wireframes or mockups (if available)
- Design principles to follow
- User experience guidelines
- Brand guidelines

### 9. Technical Considerations
- Integration points
- Data requirements
- API specifications (if applicable)
- Technical constraints or dependencies

### 10. Go-to-Market & Launch Plan
- Launch strategy
- Rollout plan (phased, beta, full launch)
- Marketing and communication plan
- Success criteria for launch

### 11. Timeline & Milestones
- Key milestones and deliverables
- Dependencies
- Estimated timeline
- Risks and mitigation strategies

### 12. Open Questions & Decisions Needed
- Questions that need answers
- Decisions that need to be made
- Research needed

---

**Instructions:**
1. For each section, ask me clarifying questions if needed
2. Provide clear, actionable content for each section
3. Ensure the PRD is comprehensive yet concise
4. Use markdown formatting for readability
5. Include examples where helpful

Once complete, format the PRD in a clean, professional document structure that I can share with stakeholders.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
    category: 'documentation',
    tags: [
      'prd',
      'product-requirements',
      'documentation',
      'planning',
      'strategy',
    ],
  },
  {
    title: 'Lean Canvas Generator',
    description:
      'Create a Lean Canvas document that captures the business model, problem, solution, and key metrics for a product or startup idea.',
    content: `# Lean Canvas Generator

## Problem Context

Product Managers and entrepreneurs need a quick, visual way to capture and communicate their business model. The Lean Canvas is a one-page business plan that helps validate ideas, identify risks, and align teams around a shared vision.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for completing a Lean Canvas. This prompt guides you through all nine sections of the Lean Canvas methodology.

## Prompt Template

Act as a Product Manager's assistant. I need to create a Lean Canvas for [product/startup name].

Please guide me through completing each section of the Lean Canvas:

### 1. Problem
- What are the top 3 problems your customers face?
- What existing alternatives do customers currently use?
- What is the biggest pain point?

### 2. Customer Segments
- Who are your target customers?
- What are the early adopters?
- Are there multiple customer segments? (list them)
- Which segment should you focus on first?

### 3. Unique Value Proposition
- What makes your solution unique?
- What's the single, clear message that states why you're different and worth paying attention to?
- How does it address the customer's problem?

### 4. Solution
- What are the top 3 features/solutions for each problem?
- What is the MVP (Minimum Viable Product)?
- What can you build quickly to test assumptions?

### 5. Channels
- How will you reach your customers?
- What are the paths to customers?
- What channels are most cost-effective?
- What's your acquisition strategy?

### 6. Revenue Streams
- How will you make money?
- What is the revenue model? (subscription, one-time, freemium, etc.)
- What is the lifetime value of a customer?
- What are the pricing assumptions?

### 7. Cost Structure
- What are the key activities/expenses?
- What are the fixed costs?
- What are the variable costs?
- What's the customer acquisition cost?

### 8. Key Metrics
- What are the key activities/expenses?
- What metrics will you track to measure success?
- What are the critical numbers that matter?
- What's the conversion funnel?

### 9. Unfair Advantage
- What can't be easily copied or bought?
- What's your moat?
- What unique assets, relationships, or knowledge do you have?
- What gives you a competitive edge?

---

**Instructions:**
1. For each section, ask me clarifying questions to help me think through each area
2. Challenge my assumptions where appropriate
3. Help me identify gaps or areas that need more thought
4. Suggest ways to validate assumptions
5. Format the final canvas in a clear, one-page format

Once complete, provide me with:
- A completed Lean Canvas document
- A summary of key risks and assumptions
- Suggestions for experiments to validate the canvas
- Recommendations for next steps

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
    category: 'general',
    tags: ['lean-canvas', 'business-model', 'strategy', 'planning', 'startup'],
  },
  {
    title: 'Quarterly Roadmap Planner',
    description:
      'Create a comprehensive quarterly product roadmap that aligns business goals with engineering capacity, prioritizes features, and communicates strategic direction to stakeholders.',
    content: `# Quarterly Roadmap Planner

## Problem Context

Product Managers need to create quarterly roadmaps that balance strategic vision with engineering capacity, stakeholder expectations, and market needs. A well-structured roadmap communicates priorities, dependencies, and timelines while remaining flexible enough to adapt to changing conditions.

## Solution Pattern: Chain-of-Thought Pattern

The Chain-of-Thought Pattern helps break down the complex task of roadmap planning into logical steps, ensuring all factors are considered and dependencies are identified.

## Multi-Step Workflow

This is a multi-step process. Follow each step in order:

### Step 1: Strategic Alignment & Goal Setting

**Prompt Template:**

Act as a Product Manager's assistant. I'm planning a quarterly roadmap for [Product/Team Name] for [Quarter, Year].

First, let's align on strategic goals:

1. **Business Objectives**: What are the top 3-5 business objectives for this quarter?
   - Revenue goals
   - User growth targets
   - Strategic initiatives
   - Market positioning goals

2. **Product Vision Alignment**: How does this quarter's work support the overall product vision?
   - What strategic themes are we focusing on?
   - What key outcomes are we driving toward?

3. **Stakeholder Priorities**: What are the key stakeholder priorities?
   - Executive priorities
   - Customer feedback and requests
   - Engineering priorities (tech debt, scalability)
   - Sales/marketing needs

Please help me synthesize these into clear, prioritized quarterly goals with measurable outcomes.

---

### Step 2: Feature & Initiative Inventory

**Prompt Template:**

Using the goals from Step 1, let's create a comprehensive inventory of potential features and initiatives for this quarter.

For each potential item, help me capture:
- **Title**: Clear name for the feature/initiative
- **Description**: What it is and why it matters
- **Goal Alignment**: Which quarterly goal(s) does this support?
- **Estimated Effort**: Rough estimate (S, M, L, XL or story points)
- **Dependencies**: What needs to happen first?
- **Risks**: What could block or delay this?
- **Value**: What's the expected impact? (High/Medium/Low)

Consider:
- New features from the backlog
- Customer requests and feedback
- Technical debt and infrastructure improvements
- Bug fixes and improvements
- Experiments and MVPs

Please organize this into a structured list and help me identify any gaps or overlaps.

---

### Step 3: Prioritization & Capacity Planning

**Prompt Template:**

Now let's prioritize the inventory from Step 2 and align with engineering capacity.

**Context:**
- Team capacity: [Number] engineers × [Number] weeks = [Total capacity]
- Average velocity: [Story points per sprint] (if available)
- Known constraints: [Holidays, other commitments, dependencies]

**Prioritization Framework:**
Help me prioritize using [RICE / Value vs Effort / MoSCoW / Custom framework]:

For each framework, walk me through:
1. Scoring criteria
2. How to score each item
3. Recommended prioritization order
4. Identification of "must-haves" vs "nice-to-haves"

**Capacity Planning:**
- How many items fit in the quarter?
- What's the recommended mix of:
  - Strategic features (60-70%)
  - Quick wins (10-20%)
  - Technical debt/infrastructure (10-20%)
  - Experiments (5-10%)

Provide a prioritized list with clear reasoning for the ordering.

---

### Step 4: Timeline & Milestone Planning

**Prompt Template:**

Using the prioritized list from Step 3, let's create a timeline with clear milestones.

Help me:
1. **Break down the quarter**: Into sprints or monthly milestones
2. **Assign features to milestones**: Based on dependencies and capacity
3. **Identify key dates**:
   - Feature completion dates
   - Beta/launch dates
   - Review and adjustment points
   - Stakeholder check-ins

4. **Plan for flexibility**:
   - What can be moved if priorities change?
   - What are the critical path items?
   - What are the buffers?

5. **Risk mitigation**:
   - What are the biggest risks to the timeline?
   - How can we mitigate them?
   - What's the contingency plan?

Create a visual timeline showing:
- Month/Sprint breakdown
- Key features per period
- Dependencies (with arrows/connections)
- Milestones and checkpoints

---

### Step 5: Communication & Stakeholder Alignment

**Prompt Template:**

Now let's create communication materials for different audiences based on the roadmap from Step 4.

**Create three versions:**

1. **Executive Summary** (1 page):
   - High-level themes and goals
   - Key initiatives and expected outcomes
   - Risks and dependencies
   - Resource needs

2. **Engineering Team Roadmap** (detailed):
   - Feature breakdown by sprint/month
   - Technical considerations
   - Dependencies and blockers
   - Resource allocation

3. **Stakeholder Roadmap** (user-friendly):
   - Customer-facing features
   - Expected benefits
   - Timeline (high-level)
   - How to track progress

**Plus:**
- A one-page visual roadmap (Gantt-style or timeline)
- FAQ document addressing common questions
- Success metrics dashboard template

---

## Example Use Case

**Scenario**: A PM at a SaaS company needs to plan Q1 2025 roadmap for a product analytics tool.

**Step 1**: Aligns on goals: Increase user engagement (DAU +30%), improve retention (monthly churn <5%), launch enterprise features.

**Step 2**: Creates inventory of 25 potential features including: custom dashboards, API improvements, new data connectors, UI/UX improvements, performance optimizations.

**Step 3**: Prioritizes using RICE framework, identifies top 12 features that fit capacity.

**Step 4**: Breaks down into 3 sprints per month, assigns features, identifies critical path items.

**Step 5**: Creates exec summary for leadership, detailed roadmap for engineering, customer-facing roadmap for sales/marketing.

**Result**: Clear, aligned roadmap that balances strategic goals with reality, with buy-in from all stakeholders.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
    category: 'general',
    tags: ['roadmap', 'planning', 'strategy', 'quarterly', 'prioritization'],
  },
];

async function main() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');
    console.log('✅ Connected to MongoDB\n');

    interface PromptDocument {
      id: string;
      slug: string;
      title: string;
      description: string;
      content: string;
      category: string;
      role: string;
      tags: string[];
      currentRevision: number;
      views: number;
      rating: number;
      ratingCount: number;
      createdAt: Date;
      updatedAt: Date;
      isPublic: boolean;
      isFeatured: boolean;
      active: boolean;
      source: string;
      pattern?: string;
    }
    const promptsToCreate: PromptDocument[] = [];
    const promptsToSkip: string[] = [];

    for (const promptData of PROMPTS_TO_CREATE) {
      const title = promptData.title;

      // Check if prompt already exists (by title or slug)
      const slug = generateSlug(title);
      const existing = await promptsCollection.findOne({
        $or: [{ title: title }, { slug: slug }],
      });

      if (existing) {
        promptsToSkip.push(title);
        console.log(`   ⏭️  Skipped: "${title}" (already exists)`);
        continue;
      }

      // Create prompt object
      const prompt = {
        id: randomUUID(),
        slug,
        title,
        description: promptData.description,
        content: promptData.content,
        category: promptData.category,
        role: 'product-manager',
        pattern: promptData.content.includes('Multi-Step')
          ? undefined
          : 'template',
        tags: promptData.tags,
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

      promptsToCreate.push(prompt);
      console.log(`   ✅ Will create: "${title}"`);
      console.log(`      Slug: ${slug}`);
      console.log(`      Category: ${promptData.category}`);
    }

    if (promptsToCreate.length === 0) {
      console.log('\n✨ All prompts already exist! Nothing to create.\n');
      if (promptsToSkip.length > 0) {
        console.log(`   Skipped: ${promptsToSkip.length} prompts\n`);
      }
      process.exit(0);
    }

    console.log(`\n📝 Creating ${promptsToCreate.length} prompt(s)...\n`);

    // Insert prompts
    if (promptsToCreate.length > 0) {
      const result = await promptsCollection.insertMany(promptsToCreate);
      console.log(
        `\n✨ Successfully created ${result.insertedCount} prompt(s)!`
      );
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Created: ${promptsToCreate.length}`);
    console.log(`   - Skipped: ${promptsToSkip.length}`);
    console.log(`\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
