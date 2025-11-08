# Multi-Agent Content Generator Review & Recommendations

**Date:** November 8, 2025  
**Purpose:** Evaluate existing multi-agent system for SEO article generation

---

## Current System Overview

### Architecture: Engineering Leadership Discussion Tool

**Current Use Case:** Engineering leaders input a problem, get multi-perspective analysis

**4 Agents (All GPT-4o-mini):**
1. **Director of Engineering** - Strategic alignment, ROI, organizational impact
2. **Engineering Manager** - Team adoption, workflow integration, training
3. **Tech Lead** - Technical feasibility, tool selection, integration
4. **Architect** - System architecture, scalability, security

**Key Features:**
- ✅ RAG-enhanced (pulls from MongoDB prompt library)
- ✅ LangGraph state management
- ✅ Async execution
- ✅ 5-minute timeout (Lambda)
- ✅ Cost-optimized (GPT-4o-mini)

---

## Gap Analysis: Current vs SEO Content Needs

### What We Have
| Feature | Status | Notes |
|---------|--------|-------|
| Multi-agent pipeline | ✅ | 4 agents, LangGraph |
| RAG context injection | ✅ | MongoDB prompts/patterns |
| Async execution | ✅ | Fast, parallel |
| Cost optimization | ✅ | GPT-4o-mini ($0.40/prompt) |

### What We Need for SEO Articles
| Feature | Status | Gap |
|---------|--------|-----|
| **Technical Writer** | ❌ | Need: Structure, SEO, headings |
| **Developer Advocate** | ⚠️ | Have: Tech Lead (close, needs tweaks) |
| **Community Manager** | ❌ | Need: User quotes, experiences |
| **Product Marketer** | ⚠️ | Have: Director (close, needs tweaks) |
| **SEO Specialist** | ❌ | Need: Keywords, schema, links |
| **Long-form content** | ❌ | Current: Discussion notes, Need: 2000+ word articles |
| **External research** | ❌ | Current: Internal RAG, Need: Web search, Reddit, GitHub |

---

## Recommended Approach

### Option A: Extend Existing System (Fastest)

**Add 3 New Agents:**
1. **Technical Writer Agent** (GPT-4o)
2. **Community Manager Agent** (Claude Sonnet - better at empathy/quotes)
3. **SEO Specialist Agent** (GPT-4o-mini - structured output)

**Modify 2 Existing Agents:**
1. **Tech Lead** → **Developer Advocate** (add code examples, solutions)
2. **Director** → **Product Marketer** (add positioning, CTAs)

**Total: 5 Agents**
- Technical Writer (structure, SEO)
- Developer Advocate (code, solutions)
- Community Manager (quotes, experiences)
- Product Marketer (positioning, CTAs)
- SEO Specialist (keywords, schema, links)

**Cost:** ~$0.50-0.75 per article (5 agents × $0.10-0.15 each)  
**Time:** ~3-5 minutes per article  
**Quality:** Production-ready SEO content

### Option B: New Dedicated System (More Control)

**Build separate article generation pipeline:**
- Different state schema (article-focused, not discussion-focused)
- Different prompts (long-form content, not meeting prep)
- Different output format (markdown article, not notes)

**Pros:**
- ✅ Clean separation of concerns
- ✅ Optimized for article generation
- ✅ Easier to maintain

**Cons:**
- ❌ More work (2-3 hours to build)
- ❌ Duplicate infrastructure
- ❌ Two systems to maintain

---

## Recommendation: Option A (Extend Existing)

**Why:**
1. **Speed:** 30 minutes to add 3 agents vs 2-3 hours for new system
2. **Reuse:** Leverage existing RAG, LangGraph, Lambda infrastructure
3. **Proven:** Current system works, just needs different agents
4. **Cost:** Same cost structure (~$0.50/article)

**Implementation Plan:**

### Step 1: Add Technical Writer Agent (15 min)

```python
TECHNICAL_WRITER_SYSTEM = """You are a Technical Writer specializing in SEO-optimized developer content.

Your role:
- Structure articles with proper H2/H3 headings
- Optimize for target keywords (provided in context)
- Write clear, scannable content (bullets, lists, code blocks)
- Include meta title and description
- Add internal linking opportunities

Input: Research data from Gemini (user quotes, pricing, problems)
Output: Article structure with:
- Title (60 chars, keyword-optimized)
- Meta description (160 chars)
- H2/H3 outline
- Section summaries
- Internal link suggestions

IMPORTANT: Follow E-E-A-T principles:
- Cite sources (Reddit, GitHub, forums)
- Include real user quotes
- Add "Last updated" date
- Link to official docs
"""

def get_technical_writer():
    return ChatOpenAI(
        model="gpt-4o",  # Need GPT-4o for better structure
        temperature=0.3,  # Lower temp for consistency
    )

async def technical_writer_turn(state: ArticleState) -> ArticleState:
    """Technical Writer creates article structure and SEO optimization"""
    writer = get_technical_writer()
    
    messages = [
        SystemMessage(content=f"""{TECHNICAL_WRITER_SYSTEM}
        
Research Data:
{state['research_data']}

Target Keywords:
{state['target_keywords']}

Article Type: {state['article_type']}
"""),
        HumanMessage(content="Create SEO-optimized article structure with proper headings, meta tags, and internal linking.")
    ]
    
    response = await writer.ainvoke(messages)
    
    return {
        **state,
        "article_structure": response.content,
        "turn_count": state['turn_count'] + 1,
    }
```

### Step 2: Add Community Manager Agent (10 min)

```python
COMMUNITY_MANAGER_SYSTEM = """You are a Community Manager who curates authentic developer voices.

Your role:
- Extract and organize real user quotes from research
- Categorize by sentiment (Pro-Cursor, Pro-Windsurf, Frustrated, etc.)
- Add context to quotes (source, user, date)
- Identify patterns in community feedback
- Suggest "Share Your Experience" prompts

Input: Research data with Reddit/GitHub/forum quotes
Output: Organized quotes with:
- Category (frustration, success, comparison, etc.)
- Quote text
- Attribution (user, source, date)
- Context (why this quote matters)

IMPORTANT: Authenticity is key:
- Use real quotes verbatim (don't paraphrase)
- Cite sources properly
- Include both positive and negative feedback
- Show diversity of opinions
"""

def get_community_manager():
    return ChatOpenAI(
        model="claude-3-5-sonnet-20241022",  # Claude better at empathy
        temperature=0.5,
    )

async def community_manager_turn(state: ArticleState) -> ArticleState:
    """Community Manager curates user quotes and experiences"""
    manager = get_community_manager()
    
    messages = [
        SystemMessage(content=f"""{COMMUNITY_MANAGER_SYSTEM}
        
Research Data:
{state['research_data']}
"""),
        HumanMessage(content="Extract and organize all user quotes by category. Include source citations.")
    ]
    
    response = await manager.ainvoke(messages)
    
    return {
        **state,
        "community_quotes": response.content,
        "turn_count": state['turn_count'] + 1,
    }
```

### Step 3: Add SEO Specialist Agent (10 min)

```python
SEO_SPECIALIST_SYSTEM = """You are an SEO Specialist optimizing technical content for search engines.

Your role:
- Generate schema markup (Article, FAQPage, HowTo, BreadcrumbList)
- Identify internal linking opportunities
- Suggest external links (official docs, community resources)
- Optimize keyword density
- Create meta tags

Input: Article structure and content
Output: SEO enhancements:
- Schema.org JSON-LD markup
- Internal links (to /prompts, /patterns, other articles)
- External links (official docs, Reddit, GitHub)
- Keyword optimization suggestions
- Alt text for images

IMPORTANT: Follow "generous linking" strategy:
- Link to official docs (cursor.com, windsurf.com)
- Link to community resources (cursor.directory, Reddit)
- Link to GitHub issues
- Add "Why we link out" callout
"""

def get_seo_specialist():
    return ChatOpenAI(
        model="gpt-4o-mini",  # Structured output, cheaper
        temperature=0.2,  # Very low for consistency
    )

async def seo_specialist_turn(state: ArticleState) -> ArticleState:
    """SEO Specialist adds schema, links, and optimization"""
    specialist = get_seo_specialist()
    
    messages = [
        SystemMessage(content=f"""{SEO_SPECIALIST_SYSTEM}
        
Article Structure:
{state['article_structure']}

Target Keywords:
{state['target_keywords']}
"""),
        HumanMessage(content="Generate schema markup, internal/external links, and SEO optimizations.")
    ]
    
    response = await specialist.ainvoke(messages)
    
    return {
        **state,
        "seo_enhancements": response.content,
        "turn_count": state['turn_count'] + 1,
    }
```

### Step 4: Modify Tech Lead → Developer Advocate (5 min)

```python
DEVELOPER_ADVOCATE_SYSTEM = """You are a Developer Advocate creating practical, code-focused content.

Your role:
- Write step-by-step solutions with code examples
- Explain "wrong way vs right way"
- Add command-line examples
- Include configuration files (.cursorrules, .cursorignore)
- Show real error messages and fixes

Input: Research data with problems and solutions
Output: Developer-focused content:
- Code examples (tested, working)
- Step-by-step guides
- Configuration examples
- Command-line snippets
- Error message examples

IMPORTANT: Prove experience (E-E-A-T):
- Show actual code, not pseudo-code
- Include real error messages
- Add "I tried this and it failed" examples
- Use syntax highlighting
- Test all code before including
"""

# Modify existing tech_lead_turn to use this system prompt
```

### Step 5: Modify Director → Product Marketer (5 min)

```python
PRODUCT_MARKETER_SYSTEM = """You are a Product Marketer positioning Engify subtly within content.

Your role:
- Identify where Engify solves mentioned problems
- Write subtle product positioning (not sales pitches)
- Create CTAs (calls-to-action)
- Position competitors fairly
- Add "How Engify Helps" sections

Input: Article content with problems and solutions
Output: Product positioning:
- "How Engify Solves This" sections (subtle)
- CTAs (Try Engify, Get Early Access)
- Competitive positioning (fair, not attacking)
- Value propositions (memory, optimization, guardrails)

IMPORTANT: Subtle, not salesy:
- Provide value first, product second
- Don't interrupt educational content
- Use callout boxes for product mentions
- Keep tone factual, not promotional
- Position as "natural extension" of solutions
"""

# Modify existing director_turn to use this system prompt
```

---

## New State Schema for Articles

```python
class ArticleState(TypedDict):
    # Input
    research_data: str  # Gemini research JSON
    target_keywords: List[str]  # Primary + secondary keywords
    article_type: str  # "comparison", "problem", "guide"
    article_title: str  # Working title
    
    # Agent outputs
    article_structure: str  # Technical Writer output
    community_quotes: str  # Community Manager output
    developer_content: str  # Developer Advocate output
    product_positioning: str  # Product Marketer output
    seo_enhancements: str  # SEO Specialist output
    
    # Final output
    final_article: str  # Assembled markdown article
    
    # Metadata
    turn_count: int
    max_turns: int
```

---

## Usage Example

```python
# Input: Gemini research for "Cursor vs Windsurf"
research_data = """
{
  "TechnicalWriter": { ... },
  "DeveloperAdvocate": { ... },
  "CommunityManager": { "user_quotes": [...] },
  "ProductMarketer": { ... },
  "SEOSpecialist": { "primary_keywords": [...] }
}
"""

# Run multi-agent pipeline
result = await app.ainvoke({
    "research_data": research_data,
    "target_keywords": ["cursor vs windsurf", "best AI IDE 2025"],
    "article_type": "comparison",
    "article_title": "Cursor vs Windsurf: Speed vs Control (2025)",
    "turn_count": 0,
    "max_turns": 5,
})

# Output: Complete markdown article
print(result["final_article"])
```

---

## Cost & Performance Estimates

### Per Article
| Agent | Model | Cost | Time |
|-------|-------|------|------|
| Technical Writer | GPT-4o | $0.15 | 30s |
| Community Manager | Claude Sonnet | $0.10 | 30s |
| Developer Advocate | GPT-4o | $0.15 | 30s |
| Product Marketer | GPT-4o-mini | $0.05 | 20s |
| SEO Specialist | GPT-4o-mini | $0.05 | 20s |
| **Total** | **Mixed** | **$0.50** | **~3 min** |

### For 18 Articles
- **Cost:** $9 total
- **Time:** ~54 minutes (3 min × 18)
- **Output:** 18 production-ready, 2000+ word articles

---

## Implementation Timeline

| Task | Time | Status |
|------|------|--------|
| Add Technical Writer agent | 15 min | ⏳ |
| Add Community Manager agent | 10 min | ⏳ |
| Add SEO Specialist agent | 10 min | ⏳ |
| Modify Tech Lead → Dev Advocate | 5 min | ⏳ |
| Modify Director → Product Marketer | 5 min | ⏳ |
| Update state schema | 5 min | ⏳ |
| Test with 1 article | 10 min | ⏳ |
| **Total** | **60 min** | ⏳ |

---

## Next Steps

1. **Today:** Extend multi-agent system (60 min)
2. **This Weekend:** Generate all 18 articles (54 min runtime)
3. **Next Week:** Review, add screenshots, publish

**Ready to extend the system or want to review the current agents first?**
