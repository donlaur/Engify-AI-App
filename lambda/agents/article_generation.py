"""
SEO Article Generation System - Multi-Agent Pipeline
5 specialized agents for production-ready SEO content

Use Case: Generate 2000+ word SEO articles from Gemini research data.
Input: Gemini research JSON with user quotes, pricing, problems, solutions
Output: Production-ready markdown article with E-E-A-T compliance

Agents:
1. Technical Writer - Structure, SEO, headings
2. Developer Advocate - Code examples, solutions
3. Community Manager - User quotes, experiences
4. Product Marketer - Subtle Engify positioning
5. SEO Specialist - Schema, links, optimization

Cost: ~$0.50 per article
Time: ~3 minutes per article
Quality: Production-ready, E-E-A-T compliant
"""

from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
import json

# State schema for article generation workflow
class ArticleState(TypedDict):
    # Input
    research_data: str  # Gemini research JSON
    target_keywords: List[str]  # Primary + secondary keywords
    article_type: str  # "comparison", "problem", "guide"
    article_title: str  # Working title
    
    # Agent outputs
    article_structure: str  # Technical Writer output
    technical_content: str  # Developer Advocate output
    community_content: str  # Community Manager output
    product_content: str    # Product Marketer output
    seo_content: str        # SEO Specialist output
    
    # Final output
    final_article: str  # Assembled markdown article
    
    # Metadata
    turn_count: int
    max_turns: int

# System prompts for each agent

TECHNICAL_WRITER_SYSTEM = """You are a Technical Writer specializing in SEO-optimized developer content.

Your role:
- Structure articles with proper H2/H3 headings
- Optimize for target keywords (provided in context)
- Write clear, scannable content (bullets, lists, code blocks)
- Include meta title and description
- Add internal linking opportunities
- Follow E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)

Input: Gemini research JSON with user quotes, pricing, problems, solutions
Output: Article structure with:
- Title (60 chars, keyword-optimized)
- Meta description (160 chars)
- H2/H3 outline with keyword placement
- Section summaries (what each section should cover)
- Internal link suggestions
- Schema markup recommendations

Requirements:
- Cite sources (Reddit, GitHub, forums)
- Include real user quotes
- Add "Last updated" date
- Clear hierarchy (H2 → H3, never skip levels)
- Keyword density 1-2% (natural, not stuffed)
- Scannable format (bullets, numbered lists, code blocks)

IMPORTANT: This is the STRUCTURE only. Don't write full content yet.
Provide an outline that other agents will fill in."""

DEVELOPER_ADVOCATE_SYSTEM = """You are a Developer Advocate creating practical, code-focused content.

Your role:
- Write step-by-step solutions with code examples
- Explain "wrong way vs right way"
- Add command-line examples
- Include configuration files (.cursorrules, .cursorignore)
- Show real error messages and fixes
- Prove experience (E-E-A-T)

Input: Article structure + Gemini research with solutions
Output: Developer-focused content with:
- Code examples (tested, working)
- Step-by-step guides (numbered lists)
- Configuration examples
- Command-line snippets (bash, git)
- Error message examples
- "Why it works" explanations

Requirements:
- Show actual code, not pseudo-code
- Include real error messages from research
- Add "I tried this and it failed" examples
- Use proper syntax highlighting markers (```bash, ```python, etc.)
- Explain WHY, not just WHAT
- Add trade-offs and limitations

IMPORTANT: Fill in the technical sections from the structure.
Focus on solutions, code, and practical guidance."""

COMMUNITY_MANAGER_SYSTEM = """You are a Community Manager curating authentic developer voices.

Your role:
- Extract and organize real user quotes from research
- Categorize by sentiment (Pro-Cursor, Pro-Windsurf, Frustrated, etc.)
- Add context to quotes (source, user, date)
- Identify patterns in community feedback
- Suggest "Share Your Experience" prompts

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
- Add blockquote formatting (> quote)
- Include "Share Your Experience" call-to-action

IMPORTANT: Fill in the community sections from the structure.
Focus on real user voices and experiences."""

PRODUCT_MARKETER_SYSTEM = """You are a Product Marketer positioning Engify subtly within educational content.

Your role:
- Identify where Engify solves mentioned problems
- Write subtle product positioning (not sales pitches)
- Create CTAs (calls-to-action)
- Position competitors fairly
- Add "How Engify Helps" sections

Input: Article content with problems and solutions
Output: Product positioning with:
- "How Engify Solves This" sections (subtle)
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

IMPORTANT: Fill in the product positioning sections.
Be subtle and helpful, not salesy."""

SEO_SPECIALIST_SYSTEM = """You are an SEO Specialist optimizing technical content for search engines.

Your role:
- Generate schema markup (Article, FAQPage, HowTo, BreadcrumbList)
- Identify internal linking opportunities
- Suggest external links (official docs, community resources)
- Optimize keyword density
- Create meta tags
- Add alt text for images

Input: Complete article content
Output: SEO enhancements:
- Schema.org JSON-LD markup
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

IMPORTANT: Add SEO enhancements to the final article.
Focus on schema, links, and optimization."""

# Initialize agents (lazy initialization for testing without API keys)
def get_technical_writer():
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,  # Lower temp for consistency
    )

def get_developer_advocate():
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.4,
    )

def get_community_manager():
    return ChatAnthropic(
        model="claude-3-5-sonnet-20241022",
        temperature=0.5,  # Claude better at empathy
    )

def get_product_marketer():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
    )

def get_seo_specialist():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.2,  # Very low for consistency
    )

# Node functions for each agent

async def technical_writer_turn(state: ArticleState) -> ArticleState:
    """Technical Writer creates article structure and SEO optimization"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    writer = get_technical_writer()
    
    keywords_str = ", ".join(state['target_keywords'])
    
    messages = [
        SystemMessage(content=f"""{TECHNICAL_WRITER_SYSTEM}

Research Data:
{state['research_data']}

Target Keywords: {keywords_str}
Article Type: {state['article_type']}
Working Title: {state['article_title']}
"""),
        HumanMessage(content="Create SEO-optimized article structure with proper headings, meta tags, and section summaries. Provide an outline that other agents will fill in.")
    ]
    
    response = await writer.ainvoke(messages)
    
    return {
        **state,
        "article_structure": response.content,
        "turn_count": state['turn_count'] + 1,
    }

async def developer_advocate_turn(state: ArticleState) -> ArticleState:
    """Developer Advocate adds code examples and technical solutions"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    advocate = get_developer_advocate()
    
    messages = [
        SystemMessage(content=f"""{DEVELOPER_ADVOCATE_SYSTEM}

Article Structure:
{state['article_structure']}

Research Data:
{state['research_data']}
"""),
        HumanMessage(content="Fill in the technical sections with code examples, step-by-step solutions, and practical guidance. Focus on the 'Solutions' and 'How It Works' sections.")
    ]
    
    response = await advocate.ainvoke(messages)
    
    return {
        **state,
        "technical_content": response.content,
        "turn_count": state['turn_count'] + 1,
    }

async def community_manager_turn(state: ArticleState) -> ArticleState:
    """Community Manager curates user quotes and experiences"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    manager = get_community_manager()
    
    messages = [
        SystemMessage(content=f"""{COMMUNITY_MANAGER_SYSTEM}

Article Structure:
{state['article_structure']}

Research Data:
{state['research_data']}
"""),
        HumanMessage(content="Extract and organize all user quotes by category. Fill in the 'What Users Are Saying' and community sections. Include source citations and 'Share Your Experience' prompts.")
    ]
    
    response = await manager.ainvoke(messages)
    
    return {
        **state,
        "community_content": response.content,
        "turn_count": state['turn_count'] + 1,
    }

async def product_marketer_turn(state: ArticleState) -> ArticleState:
    """Product Marketer adds subtle Engify positioning"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    marketer = get_product_marketer()
    
    messages = [
        SystemMessage(content=f"""{PRODUCT_MARKETER_SYSTEM}

Article Structure:
{state['article_structure']}

Technical Content:
{state['technical_content']}

Community Content:
{state['community_content']}
"""),
        HumanMessage(content="Add subtle 'How Engify Solves This' sections and CTAs. Be helpful, not salesy. Position Engify as a natural extension of the solutions discussed.")
    ]
    
    response = await marketer.ainvoke(messages)
    
    return {
        **state,
        "product_content": response.content,
        "turn_count": state['turn_count'] + 1,
    }

async def seo_specialist_turn(state: ArticleState) -> ArticleState:
    """SEO Specialist adds schema, links, and optimization"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    specialist = get_seo_specialist()
    
    keywords_str = ", ".join(state['target_keywords'])
    
    messages = [
        SystemMessage(content=f"""{SEO_SPECIALIST_SYSTEM}

Article Structure:
{state['article_structure']}

Target Keywords: {keywords_str}
Article Type: {state['article_type']}
"""),
        HumanMessage(content="Generate schema markup, internal/external links, and SEO optimizations. Add 'Why we link out' callout and validate keyword density.")
    ]
    
    response = await specialist.ainvoke(messages)
    
    return {
        **state,
        "seo_content": response.content,
        "turn_count": state['turn_count'] + 1,
    }

async def assemble_article(state: ArticleState) -> ArticleState:
    """Assemble final article from all agent outputs"""
    
    # Use GPT-4o to intelligently combine all sections
    assembler = ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,
    )
    
    messages = [
        SystemMessage(content="""You are an expert editor assembling a final article from multiple agent outputs.

Your task:
1. Combine all sections into a coherent, flowing article
2. Ensure proper markdown formatting
3. Remove any duplicate content
4. Maintain consistent tone and style
5. Add smooth transitions between sections
6. Include all schema markup and SEO elements
7. Ensure all quotes are properly formatted
8. Add table of contents if article is long

Output: Complete markdown article ready for publication."""),
        HumanMessage(content=f"""Assemble the final article from these components:

STRUCTURE:
{state['article_structure']}

TECHNICAL CONTENT:
{state['technical_content']}

COMMUNITY CONTENT:
{state['community_content']}

PRODUCT CONTENT:
{state['product_content']}

SEO CONTENT:
{state['seo_content']}

Create a complete, production-ready markdown article.""")
    ]
    
    response = await assembler.ainvoke(messages)
    
    return {
        **state,
        "final_article": response.content,
    }

# Build the workflow graph
workflow = StateGraph(ArticleState)

# Add nodes
workflow.add_node("technical_writer", technical_writer_turn)
workflow.add_node("developer_advocate", developer_advocate_turn)
workflow.add_node("community_manager", community_manager_turn)
workflow.add_node("product_marketer", product_marketer_turn)
workflow.add_node("seo_specialist", seo_specialist_turn)
workflow.add_node("assemble", assemble_article)

# Define the flow
workflow.set_entry_point("technical_writer")
workflow.add_edge("technical_writer", "developer_advocate")
workflow.add_edge("developer_advocate", "community_manager")
workflow.add_edge("community_manager", "product_marketer")
workflow.add_edge("product_marketer", "seo_specialist")
workflow.add_edge("seo_specialist", "assemble")
workflow.add_edge("assemble", END)

# Compile the graph
app = workflow.compile()

# Export for Lambda handler
__all__ = ['app', 'ArticleState']
