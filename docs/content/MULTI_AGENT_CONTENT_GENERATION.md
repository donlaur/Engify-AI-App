# Multi-Agent Content Generation for Pillar Pages

**Date:** 2025-11-20  
**Status:** Design Ready  
**Purpose:** Use existing multi-agent infrastructure to generate SEO-optimized pillar page content

---

## Overview

Use the existing LangGraph multi-agent system (`/lambda/agents/`) to generate high-quality pillar page content through multiple expert perspectives:

1. **SEO Expert** - Keywords, meta descriptions, H1/H2 structure
2. **SME (Subject Matter Expert)** - Technical accuracy, depth, examples
3. **Agile/Scrum Master** - Agile-specific content, ceremonies, workflows
4. **Content Editor** - Readability, flow, CTAs, internal linking

---

## Agent Roles & Responsibilities

### 1. SEO Expert Agent
**Focus:** Search optimization, keyword targeting, SERP features

**Responsibilities:**
- Validate keyword targeting (primary + secondary keywords)
- Optimize H1/H2/H3 structure for search intent
- Write meta descriptions (150-160 chars)
- Suggest internal linking opportunities
- Identify FAQ schema opportunities
- Check keyword density (avoid stuffing)

**System Prompt:**
```python
SEO_EXPERT_SYSTEM = """You are an SEO expert optimizing content for search engines.

Focus on:
- Primary keyword placement (H1, first paragraph, URL)
- Secondary keyword distribution
- Search intent matching (informational, navigational, transactional)
- Featured snippet optimization
- Internal linking strategy

IMPORTANT: Reference target keywords from the brief. Ensure content matches search intent.

Ask: 'Does this match search intent?' 'Are keywords naturally integrated?' 'Will this rank?'
Consider: Keyword density, LSI keywords, SERP features, user intent."""
```

---

### 2. SME (Subject Matter Expert) Agent
**Focus:** Technical accuracy, depth, credibility

**Responsibilities:**
- Validate technical accuracy
- Add depth and examples
- Ensure E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Suggest code examples, diagrams, workflows
- Identify gaps in technical coverage

**System Prompt:**
```python
SME_SYSTEM = """You are a Subject Matter Expert on AI-enabled software development.

Focus on:
- Technical accuracy and depth
- Real-world examples and case studies
- Code snippets and implementation details
- Best practices and anti-patterns
- Industry standards and frameworks (PBVR, WSJF, Agile)

IMPORTANT: Reference Engify's patterns, workflows, and guardrails. Provide actionable guidance.

Ask: 'Is this technically accurate?' 'Are examples realistic?' 'What's missing?'
Consider: Depth vs accessibility, code quality, real-world applicability."""
```

---

### 3. Agile/Scrum Master Agent
**Focus:** Agile practices, ceremonies, team workflows

**Responsibilities:**
- Validate Agile/Scrum terminology
- Add ceremony-specific guidance
- Ensure workflow accuracy
- Suggest team adoption strategies
- Identify pain points and solutions

**System Prompt:**
```python
AGILE_EXPERT_SYSTEM = """You are a Certified Scrum Master and Agile coach.

Focus on:
- Agile ceremony best practices (sprint planning, standups, retros, grooming)
- Team adoption and change management
- Workflow integration with AI
- Pain points and solutions
- Scrum/Kanban/SAFe frameworks

IMPORTANT: Reference real Agile practices. Avoid generic advice. Be specific about ceremonies.

Ask: 'Does this align with Agile principles?' 'Will teams actually use this?' 'What are the adoption barriers?'
Consider: Team dynamics, ceremony timing, workflow integration, resistance to change."""
```

---

### 4. Content Editor Agent
**Focus:** Readability, flow, engagement, CTAs

**Responsibilities:**
- Improve readability (Flesch-Kincaid score)
- Ensure logical flow
- Add transitions between sections
- Optimize CTAs (calls-to-action)
- Check tone and voice consistency
- Suggest internal links

**System Prompt:**
```python
EDITOR_SYSTEM = """You are a content editor optimizing for readability and engagement.

Focus on:
- Readability (aim for 8th-10th grade level)
- Logical flow and transitions
- Clear CTAs (try pattern, download guide, etc.)
- Tone consistency (professional but approachable)
- Internal linking (to patterns, workflows, other pillars)

IMPORTANT: Keep Engify's voice: honest, realistic, anti-hype. No "revolutionary" or "game-changing."

Ask: 'Is this easy to read?' 'Does it flow?' 'Are CTAs clear?' 'Is the tone right?'
Consider: Sentence length, paragraph breaks, bullet points, scanability."""
```

---

## Workflow: 4-Pass Content Generation

### Pass 1: SEO Expert (Foundation)
**Input:** Content brief (keywords, outline, target audience)  
**Output:** 
- Optimized H1/H2/H3 structure
- Meta description
- Keyword placement recommendations
- FAQ schema suggestions

**Example Output:**
```markdown
# H1: AI-Enabled Software Development Lifecycle (AI-SDLC): The Complete Guide

## H2: What is AI-Enabled SDLC? (target: "what is ai-enabled sdlc")
## H2: Why Traditional Software Development Lifecycle Breaks with AI (target: "ai in sdlc")
## H2: Core Components of AI-Enabled Software Development Lifecycle (target: "ai-sdlc components")

Meta Description: Learn what an AI-enabled software development lifecycle is, how it improves planning and execution, and how to implement AI-SDLC using patterns, guardrails, memory layers, and PBVR workflows.

Keywords: ai-enabled software development lifecycle (primary), ai-sdlc, ai-augmented development
```

---

### Pass 2: SME (Technical Depth)
**Input:** SEO structure + content brief  
**Output:**
- Technical content for each section
- Code examples
- Real-world scenarios
- Links to Engify patterns/workflows

**Example Output:**
```markdown
## What is AI-Enabled SDLC?

The AI-enabled software development lifecycle (AI-SDLC) is the modernization of software 
development for an era where AI works alongside engineers—not as a magic black box, but as 
part of a governed, memory-driven, pattern-first workflow.

**Core Components:**
1. **PBVR Cycle** (Plan → Build → Verify → Refactor) - The micro-cycle for every AI-assisted task
2. **Memory Layer** - Persistent context across sessions (see: [Memory Pattern](/patterns/memory))
3. **Guardrails** - Rules to prevent AI hallucinations (see: [Guardrails Library](/guardrails))

**Example:**
```typescript
// Traditional SDLC: Linear phases
Requirements → Design → Development → Testing → Deployment

// AI-SDLC: Continuous PBVR cycles with memory
for each feature:
  Plan (with AI context)
  Build (with AI assistance + guardrails)
  Verify (AI-augmented testing)
  Refactor (AI-suggested improvements)
  Update memory layer
```
```

---

### Pass 3: Agile Expert (Agile-Specific Content)
**Input:** SEO structure + SME content  
**Output:**
- Agile ceremony guidance
- Team adoption strategies
- Workflow integration
- Pain point solutions

**Example Output:**
```markdown
## How AI-SDLC Works in Agile Teams

### Sprint Planning with AI-SDLC
1. **Backlog Grooming** - AI de-duplicates and clarifies stories
2. **WSJF Scoring** - AI calculates cost of delay (see: [WSJF Pattern](/prompts/wsjf-prioritization-agile))
3. **Estimation Reality Check** - MCP estimator provides grounded estimates (5-10% of naive AI estimates)
4. **PBVR Task Breakdown** - Stories decomposed into PBVR-ready tasks

**Common Pain Point:** "AI estimates are 10-20x too high"
**Solution:** Use Engify's MCP time estimator for historical velocity-based estimates
```

---

### Pass 4: Content Editor (Polish & CTAs)
**Input:** All previous passes  
**Output:**
- Final polished content
- Optimized readability
- Clear CTAs
- Internal links
- Transitions

**Example Output:**
```markdown
## What is AI-Enabled SDLC?

The AI-enabled software development lifecycle (AI-SDLC) modernizes how teams build software 
when AI is part of the process—not as a magic black box, but as a structured, governed participant.

Think of it this way: Traditional SDLC assumes humans do all the work. AI-SDLC assumes AI 
assists, but with guardrails, memory, and patterns to prevent chaos.

**Core Components:**
- **PBVR Cycle** - Your micro-loop for every task ([Learn more](/ai-workflows/pbvr))
- **Memory Layer** - AI remembers context across sessions ([See how](/ai-sdlc/memory-layer))
- **Guardrails** - Rules that prevent AI from hallucinating ([Explore guardrails](/guardrails))

**Ready to implement AI-SDLC?** Start with our [PBVR workflow](/ai-workflows/pbvr) or explore 
[20 AI patterns for engineers](/ai-workflows/patterns).
```

---

## Implementation: Lambda Agent

### File Structure
```
lambda/agents/
├── scrum_meeting.py (existing)
├── content_generation.py (new)
└── __init__.py
```

### Agent Code: `content_generation.py`

```python
"""
Multi-Agent Content Generation for Pillar Pages
4 expert agents: SEO Expert, SME, Agile Expert, Content Editor
"""

from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

class ContentState(TypedDict):
    brief: str  # Content brief (keywords, outline, audience)
    target_keywords: List[str]  # Primary + secondary keywords
    outline: str  # H1/H2/H3 structure
    seo_pass: str  # SEO expert output
    sme_pass: str  # SME output
    agile_pass: str  # Agile expert output
    editor_pass: str  # Final polished content
    meta_description: str
    internal_links: List[str]
    faqs: List[dict]
    turn_count: int
    max_turns: int

# System prompts (see above)
SEO_EXPERT_SYSTEM = """..."""
SME_SYSTEM = """..."""
AGILE_EXPERT_SYSTEM = """..."""
EDITOR_SYSTEM = """..."""

# Initialize agents
def get_seo_expert():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

def get_sme():
    return ChatOpenAI(model="gpt-4o", temperature=0.5)  # Use GPT-4 for technical accuracy

def get_agile_expert():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

def get_editor():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# Agent turns
def seo_expert_turn(state: ContentState) -> ContentState:
    """SEO expert optimizes structure and keywords"""
    seo_expert = get_seo_expert()
    response = seo_expert.invoke([
        SystemMessage(content=SEO_EXPERT_SYSTEM),
        HumanMessage(content=f"""
Brief: {state['brief']}
Target Keywords: {', '.join(state['target_keywords'])}

Create:
1. Optimized H1/H2/H3 structure
2. Meta description (150-160 chars)
3. Keyword placement recommendations
4. FAQ schema suggestions
""")
    ])
    state['seo_pass'] = response.content
    state['turn_count'] += 1
    return state

def sme_turn(state: ContentState) -> ContentState:
    """SME adds technical depth and examples"""
    sme = get_sme()
    response = sme.invoke([
        SystemMessage(content=SME_SYSTEM),
        HumanMessage(content=f"""
SEO Structure: {state['seo_pass']}

Add technical depth:
1. Accurate technical content for each section
2. Code examples and workflows
3. Real-world scenarios
4. Links to Engify patterns/workflows
""")
    ])
    state['sme_pass'] = response.content
    state['turn_count'] += 1
    return state

def agile_expert_turn(state: ContentState) -> ContentState:
    """Agile expert adds ceremony-specific guidance"""
    agile_expert = get_agile_expert()
    response = agile_expert.invoke([
        SystemMessage(content=AGILE_EXPERT_SYSTEM),
        HumanMessage(content=f"""
Current Content: {state['sme_pass']}

Add Agile-specific guidance:
1. Ceremony best practices
2. Team adoption strategies
3. Workflow integration
4. Pain point solutions
""")
    ])
    state['agile_pass'] = response.content
    state['turn_count'] += 1
    return state

def editor_turn(state: ContentState) -> ContentState:
    """Editor polishes and adds CTAs"""
    editor = get_editor()
    response = editor.invoke([
        SystemMessage(content=EDITOR_SYSTEM),
        HumanMessage(content=f"""
Current Content: {state['agile_pass']}

Polish:
1. Improve readability
2. Add transitions
3. Optimize CTAs
4. Add internal links
5. Ensure tone consistency (honest, realistic, anti-hype)
""")
    ])
    state['editor_pass'] = response.content
    state['turn_count'] += 1
    return state

# Build workflow graph
workflow = StateGraph(ContentState)

workflow.add_node("seo_expert", seo_expert_turn)
workflow.add_node("sme", sme_turn)
workflow.add_node("agile_expert", agile_expert_turn)
workflow.add_node("editor", editor_turn)

workflow.set_entry_point("seo_expert")
workflow.add_edge("seo_expert", "sme")
workflow.add_edge("sme", "agile_expert")
workflow.add_edge("agile_expert", "editor")
workflow.add_edge("editor", END)

app = workflow.compile()
```

---

## Usage: Generate Pillar Page Content

### API Route: `/api/content/generate-pillar`

```typescript
// src/app/api/content/generate-pillar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/aws/lambda';

export async function POST(request: NextRequest) {
  try {
    const { pillarId, brief, keywords, outline } = await request.json();

    // Invoke content generation Lambda
    const result = await invokeLambda('engify-content-generation', {
      brief,
      target_keywords: keywords,
      outline,
    });

    return NextResponse.json({
      success: true,
      content: {
        seo_pass: result.seo_pass,
        sme_pass: result.sme_pass,
        agile_pass: result.agile_pass,
        final_content: result.editor_pass,
        meta_description: result.meta_description,
        internal_links: result.internal_links,
        faqs: result.faqs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
```

---

## Cost Estimate

**Per Pillar Page (8,000 words):**
- SEO Expert: 1 call × GPT-4o-mini = $0.01
- SME: 1 call × GPT-4 = $0.20 (higher quality for technical accuracy)
- Agile Expert: 1 call × GPT-4o-mini = $0.01
- Editor: 1 call × GPT-4o-mini = $0.01

**Total: ~$0.25 per pillar page**

**For 4 pillars + 23 spokes = 27 pages:**
- Total cost: ~$7-10
- Time saved: 20-30 hours of manual writing

---

## Next Steps

1. **Create `content_generation.py` agent** (2-3 hours)
2. **Deploy to Lambda** (1 hour)
3. **Create API route** (1 hour)
4. **Test with AI-SDLC pillar** (1 hour)
5. **Generate all 4 pillars** (4 hours)
6. **Generate 23 spoke articles** (8-10 hours)

**Total Time:** 15-20 hours (vs 40-60 hours manual writing)

---

## Tweaks Needed

### Current Agent (`scrum_meeting.py`)
- ✅ Already has multi-agent structure
- ✅ Already uses LangGraph
- ✅ Already deployed to Lambda

### New Agent (`content_generation.py`)
- 🆕 Add SEO expert agent
- 🆕 Add SME agent
- 🆕 Add Agile expert agent
- 🆕 Add Content editor agent
- 🆕 Add content-specific state schema
- 🆕 Add 4-pass workflow

**Estimated Time to Build:** 3-4 hours

---

## Recommendation

Use the multi-agent system to generate content, then **human review and edit** before publishing. The agents provide:
- ✅ SEO-optimized structure
- ✅ Technical accuracy
- ✅ Agile-specific guidance
- ✅ Polished readability

But humans should:
- ✅ Verify technical accuracy
- ✅ Add brand voice
- ✅ Ensure examples are realistic
- ✅ Final polish

**Workflow:**
1. Generate content with agents (5 min per page)
2. Human review and edit (30-60 min per page)
3. Publish

**Time Savings:** 50-70% reduction in content creation time
