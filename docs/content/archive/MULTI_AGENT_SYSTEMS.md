# Multi-Agent Systems - Engify.ai

We use **two separate multi-agent systems** for different purposes:

1. **Engineering Development Multi-Agent** - For code/workflow reviews
2. **Content Publishing Multi-Agent** - For article generation

---

## 1. Engineering Development Multi-Agent

**Purpose:** Review code, workflows, architecture decisions  
**Location:** `/api/multi-agent`  
**Documentation:** [Multi-Agent Workflow Safety](../development/MULTI_AGENT_WORKFLOW_SAFETY.md)

### Agents

| Role         | Focus                                      | Personality               |
| ------------ | ------------------------------------------ | ------------------------- |
| Engineer     | Technical feasibility, implementation      | Pragmatic, detail-oriented |
| Architect    | System design, scalability, patterns       | Strategic, cautious        |
| Director     | Budget, ROI, business impact               | Results-driven            |
| PM           | Customer needs, market fit, prioritization | User-focused              |
| Tech Lead    | Realistic timelines, risk assessment       | Balanced, practical        |
| Designer     | UX implications, accessibility             | Empathetic, creative       |
| QA           | Testing, quality, edge cases               | Meticulous, skeptical      |
| Security     | Vulnerabilities, compliance                | Vigilant, risk-averse      |
| DevOps       | Deployment, infrastructure                 | Reliability-focused        |

### Usage

```bash
# API call
POST /api/multi-agent
{
  "idea": "Should we implement multi-agent workflows?",
  "roles": ["engineer", "architect", "director"],
  "mode": "sequential"
}
```

**Use for:**
- ✅ Reviewing technical decisions
- ✅ Evaluating new tools/frameworks
- ✅ Planning architecture changes
- ✅ Risk assessment
- ✅ Team simulation for complex decisions

---

## 2. Content Publishing Multi-Agent ⭐ NEW

**Purpose:** Generate SEO-rich, human-sounding, actionable articles for publishing  
**Location:** `/api/content/publish`  
**Script:** `scripts/content/generate-article.ts`

### Publishing Pipeline

```
1. Content Generator (GPT-4)
   └─> Create initial draft (800-1500 words)

2. SEO Specialist (Claude)
   └─> Optimize for search (keywords, meta, structure)

3. Human Tone Editor (GPT-4)
   └─> Remove AI voice, make it sound natural

4. Learning Expert (Claude)
   └─> Ensure actionable & educational

5. Tech Accuracy SME (GPT-4)
   └─> Verify technical correctness

6. Web Designer (Claude)
   └─> Optimize for web formatting & visual hierarchy

7. Final Publisher (Claude)
   └─> Polish & approve for publication
```

### Agents in Detail

#### 1. Content Generator
- **Model:** GPT-4 Turbo
- **Focus:** Engaging, educational technical writing
- **Output:** 800-1500 word draft with code examples
- **Tone:** Professional but conversational

#### 2. SEO Specialist
- **Model:** Claude 3.5 Sonnet
- **Focus:** Search optimization without keyword stuffing
- **Checklist:**
  - Title tag (50-60 chars, keyword-rich)
  - Meta description (150-160 chars)
  - URL slug (short, descriptive)
  - H1/H2/H3 structure
  - Internal links
  - Structured data

#### 3. Human Tone Editor
- **Model:** GPT-4 Turbo
- **Focus:** Remove "AI voice", make it sound human
- **Removes:** "delve", "landscape", "harness", overly formal language
- **Adds:** Contractions, personality, varied sentence length, casual transitions

#### 4. Learning Expert
- **Model:** Claude 3.5 Sonnet
- **Focus:** Actionable, educational content
- **Ensures:**
  - Clear learning objectives
  - Scaffolding (simple → complex)
  - Concrete examples with code
  - Immediate applicability
  - Knowledge checks

#### 5. Tech Accuracy SME
- **Model:** GPT-4 Turbo
- **Focus:** Technical correctness
- **Catches:**
  - Outdated syntax/APIs
  - Incomplete code
  - Misleading performance claims
- Missing error handling
- Platform-specific issues

#### 6. Web Designer
- **Model:** Claude 3.5 Sonnet
- **Focus:** Web formatting, visual hierarchy, readability
- **Ensures:**
  - Proper heading hierarchy (H1 → H2 → H3)
  - Scannable content (short paragraphs, lists, bold text)
  - Correct markdown syntax for ReactMarkdown
  - Mobile-friendly formatting
  - Visual breaks between sections
  - Code blocks properly formatted
  - Consistent spacing and rhythm

#### 7. Final Publisher
- **Model:** Claude 3.5 Sonnet
- **Focus:** Final quality gate
- **Checks:**
  - Editorial quality (typos, grammar)
  - Brand alignment
  - Legal/compliance
  - Completeness
  - Value proposition

### Usage

#### CLI (Recommended)

```bash
# Basic usage
tsx scripts/content/generate-article.ts "How to use Cursor Agent Review"

# With options
tsx scripts/content/generate-article.ts "Mastering AI Prompts" \
  --category="Guide" \
  --tone="beginner" \
  --keywords="ai,prompts,best-practices"

# Advanced users
tsx scripts/content/generate-article.ts "Multi-Agent Workflows" \
  --category="Tutorial" \
  --tone="advanced" \
  --keywords="cursor,multi-agent,automation,ci-cd" \
  --output="content/blog"
```

#### API

```bash
POST /api/content/publish
{
  "topic": "How to use Cursor Agent Review",
  "category": "Tutorial",
  "targetKeywords": ["cursor", "agent-review", "ai-coding"],
  "tone": "intermediate"
}
```

### Output Files

The script generates 3 files:

1. **Final Content** (`YYYY-MM-DD-slug.md`)
   - Includes frontmatter with SEO metadata
   - Publication-ready markdown
   - All agent improvements applied

2. **Review Report** (`YYYY-MM-DD-slug-REVIEW.md`)
   - Scores from each agent
   - Feedback and improvements
   - Decision: APPROVE | NEEDS_REVISION

3. **Original Draft** (`YYYY-MM-DD-slug-DRAFT.md`)
   - Initial content before reviews
   - For comparison purposes

### Example Output

```markdown
---
title: "Mastering Cursor Agent Review: A Developer's Guide"
description: "Learn how to use Cursor's new Agent Review feature to catch bugs before committing. Includes real examples and best practices."
slug: "mastering-cursor-agent-review"
category: "Tutorial"
keywords: ["cursor", "agent-review", "ai-coding", "bug-detection"]
publishReady: true
score: 8.7
generatedAt: "2025-11-02T21:00:00.000Z"
---

# Mastering Cursor Agent Review: A Developer's Guide

Cursor 2.0.43 just dropped a game-changer: Agent Review...

[Rest of article]
```

### Scoring System

Each agent scores 1-10:

- **9-10:** Excellent - publish immediately
- **7-8:** Good - minor tweaks needed
- **5-6:** Fair - significant revisions required
- **3-4:** Poor - major rewrite needed
- **1-2:** Reject - doesn't meet standards

**Overall Score:** Average of all agents  
**Publish Ready:** All agents approve + overall ≥ 8.0

---

## When to Use Which System

### Use Engineering Multi-Agent When:
- 🔧 Reviewing code or architecture
- 🤔 Making technical decisions
- 📊 Evaluating tools/frameworks
- 🚨 Assessing risks
- 👥 Simulating team discussions

### Use Content Publishing Multi-Agent When:
- 📝 Writing blog posts
- 📚 Creating tutorials
- 📖 Generating documentation
- 🎓 Producing learning content
- 📢 Publishing announcements

---

## Cost Comparison

### Engineering Multi-Agent
- **Tokens:** ~2,000-4,000 per review
- **Cost:** ~$0.10-0.20 per review
- **Time:** 10-30 seconds
- **Use:** As needed for decisions

### Content Publishing Multi-Agent
- **Tokens:** ~10,000-15,000 per article
- **Cost:** ~$0.50-1.00 per article
- **Time:** 2-3 minutes
- **Use:** For high-quality content production

---

## Quality Standards

### Engineering Reviews
- ✅ Technical accuracy
- ✅ Risk identification
- ✅ Multiple perspectives
- ✅ Balanced recommendations

### Content Publishing
- ✅ SEO optimization (title, meta, keywords)
- ✅ Human-sounding tone (no AI voice)
- ✅ Actionable & educational
- ✅ Technically accurate
- ✅ Publication-ready quality

---

## Integration with Existing Workflows

### Engineering Workflow

```
1. Write code
2. Pre-commit hooks catch issues (FREE)
3. If complex: Use Engineering Multi-Agent ($0.10-0.20)
4. Fix any issues
5. Commit & push
```

### Content Workflow

```
1. Identify topic
2. Run Content Publishing Multi-Agent ($0.50-1.00)
3. Review generated content
4. Make any final tweaks
5. Publish to site
```

---

## Best Practices

### Engineering Multi-Agent

1. **Use for complex decisions** - Don't waste on simple choices
2. **Pick relevant roles** - 3-5 roles usually sufficient
3. **Sequential mode** - Better for building consensus
4. **Review output carefully** - AI suggests, you decide

### Content Publishing Multi-Agent

1. **Specific topics** - "How to X" works better than "All about Y"
2. **Target keywords** - Include 3-5 relevant keywords
3. **Match tone to audience** - Beginner/intermediate/advanced
4. **Review before publishing** - AI is 90% there, you polish the 10%
5. **Build content library** - Consistent quality at scale

---

## Examples

### Engineering Review Example

**Input:**
```
Should we implement multi-agent workflows with pre-commit hooks?
Roles: engineer, architect, security, director
```

**Output:**
```
Engineer: ✅ Technically sound, great DX
Architect: ⚠️  Consider scalability, add retry logic
Security: ✅ Good guardrails, audit logging present
Director: ✅ Cost-effective, improves velocity

Consensus: APPROVE with Architect's suggestions
```

### Content Publishing Example

**Input:**
```bash
tsx scripts/content/generate-article.ts "Why Pre-Commit Hooks Matter" \
  --category="Best Practices" \
  --tone="intermediate"
```

**Output:**
```
✅ Content Generator: 9/10 - Great structure
✅ SEO Specialist: 8/10 - Good keywords, add 2 internal links
✅ Human Tone Editor: 9/10 - Natural voice, conversational
✅ Learning Expert: 8/10 - Actionable, add one more example
✅ Tech Accuracy SME: 9/10 - Technically correct
✅ Final Publisher: 9/10 - APPROVED FOR PUBLICATION

Overall Score: 8.7/10
Status: ✅ READY TO PUBLISH
```

---

## Future Enhancements

### Planned Features

**Engineering Multi-Agent:**
- [ ] Cost estimation agent
- [ ] Performance benchmark agent
- [ ] Regulatory compliance agent

**Content Publishing:**
- [ ] Image generation integration
- [ ] Video script generation
- [ ] Social media post generation
- [ ] A/B testing variations
- [ ] Auto-scheduling to CMS

---

## Documentation

- [Engineering Multi-Agent](../development/MULTI_AGENT_WORKFLOW_SAFETY.md)
- [Content Publishing API](../../src/app/api/content/publish/route.ts)
- [Article Generation Script](../../scripts/content/generate-article.ts)

---

**Last Updated:** November 2, 2025  
**Maintained By:** Engify.ai Team

