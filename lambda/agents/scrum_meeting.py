"""
Engineering Leadership Discussion Prep Tool - Multi-Perspective Analysis
4 engineering leadership roles: Director of Engineering, Engineering Manager, Tech Lead, Architect
Beta-optimized: 5-minute timeout, GPT-4o-mini, RAG-enhanced with prompt library context

Use Case: Engineering leaders input a problem/situation, get comprehensive multi-perspective 
analysis before meetings or ARB reviews. Perfect for preparing for engineering+product 
leadership discussions.

Each agent provides their unique perspective:
- Director: Strategic alignment, ROI, organizational impact
- Manager: Team adoption, workflow integration, training needs  
- Tech Lead: Technical feasibility, tool selection, integration points
- Architect: System architecture, scalability, security, maintainability

Agents reference Engify.ai's prompt library and patterns for actionable recommendations.
"""

from typing import TypedDict, List, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# State schema for AI integration workbench workflow
class AIIntegrationState(TypedDict):
    situation: str  # The problem/situation to discuss
    context: str  # Additional context about the company/team
    rag_context: str  # RAG-retrieved prompts/patterns from library
    current_topic: str  # Current discussion topic
    director_notes: str  # Director of Engineering perspective
    manager_notes: str  # Engineering Manager perspective
    tech_lead_notes: str  # Tech Lead perspective
    architect_notes: str  # Architect perspective
    recommendations: List[dict]  # AI integration recommendations
    implementation_plan: List[str]  # Step-by-step implementation plan
    risks_and_mitigations: List[str]  # Identified risks and mitigations
    turn_count: int
    max_turns: int

# System prompts for each agent - focused on AI integration strategy
DIRECTOR_SYSTEM = """You are a Director of Engineering leading a discussion on AI integration.
Focus on: Strategic alignment, ROI, organizational impact, change management, team readiness.

IMPORTANT: When making recommendations, reference specific prompts or patterns from the Engify.ai 
library provided in the context section. Cite them by name (e.g., "Use the Chain-of-Thought pattern" 
or "Try the 'Code Review Co-Pilot' prompt"). This demonstrates real, actionable guidance from 
Engify.ai's curated library.

Ask: 'What's the business value?' 'How does this align with our goals?' 'What's the change management plan?'
Consider: Budget, timeline, organizational readiness, competitive advantage."""

MANAGER_SYSTEM = """You are an Engineering Manager discussing AI integration.
Focus on: Team adoption, workflow integration, training needs, process changes, team concerns.

IMPORTANT: Reference specific prompts or patterns from the Engify.ai library in your recommendations.
Suggest concrete prompts that teams can use (e.g., "Have your team use the 'Pair Programming with AI' 
prompt to get started").

Ask: 'How will this change our workflows?' 'What training do we need?' 'How do we ensure adoption?'
Consider: Team capacity, learning curve, process improvements, team dynamics."""

TECH_LEAD_SYSTEM = """You are a Tech Lead evaluating AI integration.
Focus on: Technical feasibility, tool selection, integration points, code quality, developer experience.

IMPORTANT: Reference specific prompt patterns from Engify.ai library (e.g., Chain-of-Thought for 
complex problems, Persona pattern for role-specific tasks). Suggest actual prompts from the library 
that developers can use immediately.

Ask: 'What tools should we use?' 'How do we integrate this?' 'What's the developer experience?'
Consider: API integration, tooling, code review process, testing, monitoring."""

ARCHITECT_SYSTEM = """You are a Software Architect designing AI integration.
Focus on: System architecture, scalability, security, data flow, long-term maintainability.

IMPORTANT: Reference architectural patterns and prompt patterns from Engify.ai library. Suggest 
specific prompts that fit the architecture (e.g., "Use the Template pattern for consistent API 
documentation").

Ask: 'How does this fit our architecture?' 'What are the security implications?' 'How do we scale this?'
Consider: System design, data privacy, scalability, technical debt, architecture patterns."""

# Initialize agents (Beta: all use GPT-4o-mini for cost-effectiveness)
# Lazy initialization: Create agents only when needed (allows testing without API key)
def get_director():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    )

def get_manager():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    )

def get_tech_lead():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    )

def get_architect():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    )

# Node functions for each agent
def director_turn(state: AIIntegrationState) -> AIIntegrationState:
    """Director of Engineering provides strategic perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    rag_context = state.get('rag_context', '')
    rag_section = f"\n\n{rag_context}" if rag_context else ""
    
    director = get_director()
    
    messages = [
        SystemMessage(content=f"""{DIRECTOR_SYSTEM}

{rag_section}

Situation: {state['situation']}
Context: {state['context']}"""),
        HumanMessage(content=f"Current topic: {state['current_topic']}. Provide strategic guidance on AI integration. Previous notes: {state['director_notes']}")
    ]
    
    response = director.invoke(messages)
    
    return {
        **state,
        "director_notes": state['director_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def manager_turn(state: AIIntegrationState) -> AIIntegrationState:
    """Engineering Manager provides team adoption perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    rag_context = state.get('rag_context', '')
    rag_section = f"\n\n{rag_context}" if rag_context else ""
    
    manager = get_manager()
    
    messages = [
        SystemMessage(content=f"""{MANAGER_SYSTEM}

{rag_section}

Situation: {state['situation']}
Context: {state['context']}"""),
        HumanMessage(content=f"Topic: {state['current_topic']}. Discuss team adoption and workflow integration. Previous notes: {state['manager_notes']}. Director said: {state['director_notes'][-500:]}")
    ]
    
    response = manager.invoke(messages)
    
    return {
        **state,
        "manager_notes": state['manager_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def tech_lead_turn(state: AIIntegrationState) -> AIIntegrationState:
    """Tech Lead provides technical implementation perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    rag_context = state.get('rag_context', '')
    rag_section = f"\n\n{rag_context}" if rag_context else ""
    
    tech_lead = get_tech_lead()
    
    messages = [
        SystemMessage(content=f"""{TECH_LEAD_SYSTEM}

{rag_section}

Situation: {state['situation']}
Context: {state['context']}"""),
        HumanMessage(content=f"Topic: {state['current_topic']}. Discuss technical feasibility and tool selection. Previous notes: {state['tech_lead_notes']}. Manager said: {state['manager_notes'][-500:]}")
    ]
    
    response = tech_lead.invoke(messages)
    
    return {
        **state,
        "tech_lead_notes": state['tech_lead_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def architect_turn(state: AIIntegrationState) -> AIIntegrationState:
    """Architect provides system design perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    rag_context = state.get('rag_context', '')
    rag_section = f"\n\n{rag_context}" if rag_context else ""
    
    architect = get_architect()
    
    messages = [
        SystemMessage(content=f"""{ARCHITECT_SYSTEM}

{rag_section}

Situation: {state['situation']}
Context: {state['context']}"""),
        HumanMessage(content=f"Topic: {state['current_topic']}. Discuss architecture and scalability considerations. Previous notes: {state['architect_notes']}. Tech Lead said: {state['tech_lead_notes'][-500:]}")
    ]
    
    response = architect.invoke(messages)
    
    # Extract recommendations and risks from architect response
    content = response.content.lower()
    if "recommendation" in content or "suggest" in content:
        # Simple extraction (can be improved)
        pass
    
    return {
        **state,
        "architect_notes": state['architect_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def should_continue(state: AIIntegrationState) -> Literal["continue", "end"]:
    """Decide whether to continue or end"""
    if state['turn_count'] >= state['max_turns']:
        return "end"
    if state['turn_count'] >= 8 and state['current_topic']:  # Minimum 2 rounds
        return "end"
    return "continue"

# Build workflow graph
workflow = StateGraph(AIIntegrationState)

# Add nodes
workflow.add_node("director", director_turn)
workflow.add_node("manager", manager_turn)
workflow.add_node("tech_lead", tech_lead_turn)
workflow.add_node("architect", architect_turn)

# Set entry point
workflow.set_entry_point("director")

# Add edges - sequential discussion with feedback loop
workflow.add_edge("director", "manager")
workflow.add_edge("manager", "tech_lead")
workflow.add_edge("tech_lead", "architect")
workflow.add_conditional_edges(
    "architect",
    should_continue,
    {
        "continue": "director",  # Loop back for next round
        "end": END
    }
)

# Compile workflow
app = workflow.compile()

