# Adapt Existing Multi-Agent System for SEO Articles

**Date:** November 8, 2025  
**Current System:** 6-agent prompt generation pipeline  
**Goal:** Adapt for SEO article generation

---

## Current 6-Agent System (For Prompts)

### Generation Pipeline
```
1. ML Researcher (GPT-4o)
   └─> Technical foundation, research-backed

2. Prompt Engineer (GPT-4o)
   └─> Production optimization, theoretical foundation

3. Domain Expert (Claude Sonnet)
   └─> Role-specific context, real-world use cases

4. Editor + SEO Specialist (Claude Sonnet)
   └─> Combined editing & SEO optimization

5. Enterprise SaaS Expert (GPT-4o)
   └─> Enterprise readiness, security, compliance

6. Quality Reviewer (Claude Sonnet)
   └─> Final quality check and scoring
```

**Cost:** $0.40 per prompt  
**Time:** 1.5-2 minutes  
**Quality:** Production-ready

---

## Mapping to SEO Article Needs

### What We Need for Articles
1. **Technical Writer** - Structure, SEO, headings
2. **Developer Advocate** - Code examples, solutions
3. **Community Manager** - User quotes, experiences
4. **Product Marketer** - Positioning, CTAs
5. **SEO Specialist** - Keywords, schema, links

### What We Already Have
| Need | Current Agent | Adaptation |
|------|--------------|------------|
| Technical Writer | ❌ None | **Add new agent** |
| Developer Advocate | ⚠️ ML Researcher | **Modify system prompt** |
| Community Manager | ❌ None | **Add new agent** |
| Product Marketer | ⚠️ Enterprise SaaS Expert | **Modify system prompt** |
| SEO Specialist | ✅ Editor + SEO | **Already have!** |

---

## Recommended Approach: Parallel Pipelines

### Keep Existing: Prompt Generation (6 agents)
- Don't touch the working system
- Continue using for prompts/patterns
- $0.40 per prompt, proven quality

### Add New: Article Generation (5 agents)
- Separate pipeline optimized for articles
- Different system prompts
- Different output format (markdown article vs prompt)

**Why Separate:**
- ✅ Don't risk breaking working system
- ✅ Different inputs (Gemini research vs topic)
- ✅ Different outputs (2000-word article vs 800-word prompt)
- ✅ Different quality criteria (E-E-A-T vs engineering usefulness)

---

## New Article Generation Pipeline (5 Agents)

### Agent 1: Technical Writer (GPT-4o)
**Role:** Structure SEO-optimized articles

**System Prompt:**
```
You are a Technical Writer specializing in SEO-optimized developer content.

Input: Gemini research JSON with user quotes, pricing, problems, solutions
Output: Article structure with:
- Title (60 chars, keyword-optimized)
- Meta description (160 chars)
- H2/H3 outline with keyword placement
- Section summaries
- Internal link opportunities
- Schema markup recommendations

Requirements:
- Follow E-E-A-T principles (cite sources)
- Scannable content (bullets, lists, code blocks)
- Clear hierarchy (H2 → H3, never skip levels)
- Keyword density 1-2% (natural, not stuffed)
- Include "Last updated" date

Example Input:
{
  "TechnicalWriter": {
    "problem_definition": "...",
    "official_documentation_references": [...]
  },
  "CommunityManager": {
    "user_quotes": [...]
  }
}

Example Output:
# Cursor vs Windsurf: Speed vs Control (2025)

Meta: "Cursor vs Windsurf comparison: pricing, features, and real user experiences. Which AI IDE is right for you in 2025?"

## H2: The 2025 AI IDE Landscape
[Summary: Set context, mention both tools]

## H2: Core Philosophy: Control vs Speed
### H3: Cursor's Control Approach
### H3: Windsurf's Speed Philosophy

[Continue outline...]
```

**Cost:** ~$0.15 per article  
**Time:** ~30 seconds

---

### Agent 2: Developer Advocate (GPT-4o)
**Role:** Add code examples and technical solutions

**System Prompt:**
```
You are a Developer Advocate creating practical, code-focused content.

Input: Article structure + Gemini research with solutions
Output: Technical content with:
- Step-by-step solutions (numbered lists)
- Code examples (tested, working)
- Configuration files (.cursorrules, .cursorignore)
- Command-line snippets (bash, git)
- "Wrong way vs Right way" comparisons
- Real error messages

Requirements:
- Prove experience (E-E-A-T): Show actual code, not pseudo-code
- Include real error messages from research
- Add "I tried this and it failed" examples
- Use proper syntax highlighting markers
- Explain WHY, not just WHAT

Example Input:
{
  "DeveloperAdvocate": {
    "community_sourced_solutions": [
      {
        "solution_name": "The .cursorignore File",
        "steps": ["Create .cursorignore", "Add node_modules/", ...]
      }
    ]
  }
}

Example Output:
### Solution 2: The .cursorignore File

Create a `.cursorignore` file in your project root:

```bash
# .cursorignore
node_modules/
dist/
build/
*.log
.git/
```

**Why it works:** Reduces context volume by 80-90%, preventing system overload.

**Trade-off:** Limits the "unlimited context" value proposition.

**Real user result:** "After adding .cursorignore, my RAM usage dropped from 60GB to 8GB" - Forum user
```

**Cost:** ~$0.15 per article  
**Time:** ~30 seconds

---

### Agent 3: Community Manager (Claude Sonnet)
**Role:** Curate authentic user voices

**System Prompt:**
```
You are a Community Manager curating authentic developer voices.

Input: Gemini research with user quotes from Reddit, GitHub, forums
Output: Organized quotes with:
- Category (frustration, success, comparison, etc.)
- Quote text (verbatim, don't paraphrase)
- Attribution (user, source, date)
- Context (why this quote matters)
- Sentiment analysis

Requirements:
- Authenticity is key: Use real quotes verbatim
- Cite sources properly (Reddit thread, GitHub issue #)
- Include both positive and negative feedback
- Show diversity of opinions
- Add "Share Your Experience" prompts

Example Input:
{
  "CommunityManager": {
    "user_quotes_frustration": [
      {
        "category": "System Crashes",
        "quote": "64 GB of RAM is drained within an hour",
        "source": "Forum thread 17171"
      }
    ]
  }
}

Example Output:
### What Users Are Saying

**System Crashes:**
> "64 GB of RAM is drained within an hour, leading to freezes. Started a week ago or so"
> — Forum user, [Thread 17171](https://forum.cursor.com/t/17171)

> "After about 2 hours of use cursor freezes computer requiring a hard reboot"
> — Forum user, [Thread 48330](https://forum.cursor.com/t/48330)

**User Churn:**
> "I'm using Zed now and works flawlessly."
> — Forum user switching to competitor

### Share Your Experience
Have you experienced memory leaks with Cursor? [Share your story →]
```

**Cost:** ~$0.10 per article  
**Time:** ~20 seconds

---

### Agent 4: Product Marketer (GPT-4o-mini)
**Role:** Subtle Engify positioning

**System Prompt:**
```
You are a Product Marketer positioning Engify subtly within educational content.

Input: Article content with problems and solutions
Output: Product positioning with:
- "How Engify Solves This" sections (subtle, not salesy)
- CTAs (Try Engify, Get Early Access)
- Competitive positioning (fair, not attacking)
- Value propositions (memory, optimization, guardrails)

Requirements:
- Provide value first, product second
- Don't interrupt educational content with sales pitches
- Use callout boxes for product mentions
- Keep tone factual, not promotional
- Position as "natural extension" of solutions
- Never say "revolutionary" or "game-changing"

Example Input:
Problem: Cursor memory leaks cause system crashes
Solution: .cursorignore file reduces context

Example Output:
### How Engify Solves This

While the `.cursorignore` workaround is effective, it requires manual context management that breaks your flow.

Engify's memory layer automatically optimizes context:
- **Smart Context Selection:** Only sends relevant files (96% token reduction)
- **Proactive Warnings:** Alerts before memory-intensive operations
- **No Configuration:** Works out of the box, no .cursorignore needed

This isn't about replacing Cursor—it's about making it work better.

[Try Engify Free →]
```

**Cost:** ~$0.05 per article  
**Time:** ~20 seconds

---

### Agent 5: SEO Specialist (GPT-4o-mini)
**Role:** Schema, links, optimization

**System Prompt:**
```
You are an SEO Specialist optimizing technical content for search.

Input: Complete article content
Output: SEO enhancements:
- Schema.org JSON-LD markup (Article, FAQPage, HowTo, BreadcrumbList)
- Internal links (to /prompts, /patterns, other articles)
- External links (official docs, Reddit, GitHub)
- Keyword optimization suggestions
- Alt text for images
- Meta tags validation

Requirements:
- Follow "generous linking" strategy
- Link to official docs (cursor.com, windsurf.com)
- Link to community resources (cursor.directory, Reddit)
- Link to GitHub issues
- Add "Why we link out" callout
- Validate keyword density (1-2%)

Example Input:
Article about Cursor memory problems

Example Output:
### Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cursor Memory Problem: Why Your AI Keeps Making the Same Mistakes",
  "author": {
    "@type": "Person",
    "name": "Donnie Laur",
    "url": "https://engify.ai/hire-me"
  },
  "datePublished": "2025-11-08",
  "dateModified": "2025-11-08"
}
```

### Internal Links
- Link to: [Cursor vs Windsurf](/learn/ai-tools/cursor-vs-windsurf)
- Link to: [Cursor Prompts](/prompts?tool=cursor)
- Link to: [Memory Optimization Pattern](/patterns/memory-optimization)

### External Links
- [GitHub Issue #1294](https://github.com/getcursor/cursor/issues/1294)
- [Forum: Memory Consumption](https://forum.cursor.com/t/17171)
- [Official Cursor Docs](https://docs.cursor.com)

### Why We Link Out
> We believe the best resource might not always be Engify. Our goal is to help you succeed with AI coding tools, not lock you into our platform.
```

**Cost:** ~$0.05 per article  
**Time:** ~20 seconds

---

## Implementation

### File Structure
```
/Users/donlaur/dev/Engify-AI-App/
├── lambda/
│   ├── agents/
│   │   ├── scrum_meeting.py          # Existing (engineering leadership)
│   │   └── article_generation.py     # NEW (SEO articles)
│   ├── lambda_handler_multi_agent.py # Existing
│   └── lambda_handler_articles.py    # NEW
└── scripts/
    └── content/
        ├── generate-prompts.ts        # Existing
        └── generate-articles.ts       # NEW
```

### New State Schema
```python
class ArticleState(TypedDict):
    # Input
    research_data: str  # Gemini research JSON
    target_keywords: List[str]
    article_type: str  # "comparison", "problem", "guide"
    article_title: str
    
    # Agent outputs
    article_structure: str  # Technical Writer
    technical_content: str  # Developer Advocate
    community_content: str  # Community Manager
    product_content: str    # Product Marketer
    seo_content: str        # SEO Specialist
    
    # Final
    final_article: str
    
    # Metadata
    turn_count: int
    max_turns: int
```

### Usage
```python
# Input: Gemini research
research = load_json("article_outlines_from_research.json")

# Run pipeline
result = await article_app.ainvoke({
    "research_data": research["article_1_cursor_vs_windsurf"],
    "target_keywords": ["cursor vs windsurf", "best AI IDE 2025"],
    "article_type": "comparison",
    "article_title": "Cursor vs Windsurf: Speed vs Control (2025)",
    "turn_count": 0,
    "max_turns": 5,
})

# Output: Complete markdown article
save_article(result["final_article"], "cursor-vs-windsurf-2025.md")
```

---

## Cost Comparison

### Per Article
| Agent | Model | Cost |
|-------|-------|------|
| Technical Writer | GPT-4o | $0.15 |
| Developer Advocate | GPT-4o | $0.15 |
| Community Manager | Claude Sonnet | $0.10 |
| Product Marketer | GPT-4o-mini | $0.05 |
| SEO Specialist | GPT-4o-mini | $0.05 |
| **Total** | **Mixed** | **$0.50** |

### For 18 Articles
- **Cost:** $9 total
- **Time:** ~54 minutes (3 min × 18)
- **Output:** 18 production-ready articles

### vs Existing Prompt System
| Metric | Prompts | Articles |
|--------|---------|----------|
| Cost | $0.40 | $0.50 |
| Time | 1.5-2 min | 3 min |
| Output | 800 words | 2000+ words |
| Quality | Engineering | SEO + E-E-A-T |

---

## Implementation Timeline

| Task | Time | Priority |
|------|------|----------|
| Create `article_generation.py` | 30 min | HIGH |
| Define ArticleState schema | 10 min | HIGH |
| Write 5 agent system prompts | 20 min | HIGH |
| Create LangGraph workflow | 20 min | HIGH |
| Test with 1 article | 15 min | HIGH |
| Generate all 18 articles | 54 min | MEDIUM |
| **Total** | **2.5 hours** | - |

---

## Next Steps

1. **Today (2.5 hours):** Build article generation pipeline
2. **This Weekend:** Generate all 18 articles
3. **Next Week:** Review, add screenshots, publish

**Ready to build the article generation system?**
