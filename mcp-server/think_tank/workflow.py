"""
Think Tank Multi-Agent Workflow
Uses LangGraph + LangChain + Mem0 for multi-perspective analysis with verification
"""

from typing import TypedDict, List, Literal, Optional
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from mem0 import MemoryClient
import os

# State schema
class ThinkTankState(TypedDict):
    # Input
    situation: str
    context: str
    user_id: str
    
    # Round 1: Initial Perspectives
    scrum_master_analysis: str
    product_manager_analysis: str
    vp_eng_analysis: str
    tech_lead_analysis: str
    architect_analysis: str
    
    # Round 2: Challenges & Refinements
    challenges: List[dict]
    refinements: List[dict]
    
    # Round 3: Consensus
    agreements: List[str]
    concerns: List[str]
    blockers: List[str]
    recommendations: List[dict]
    
    # Final Output
    consensus_reached: bool
    final_recommendation: str
    action_items: List[dict]
    next_steps: List[str]
    
    # Metadata
    round_count: int
    max_rounds: int
    consensus_threshold: float
    started_at: datetime
    completed_at: Optional[datetime]

# System prompts for each agent
SCRUM_MASTER_SYSTEM = """You are a Scrum Master facilitating a think tank discussion.
Your role is to:
- Facilitate the discussion and ensure all voices are heard
- Identify blockers, dependencies, and risks
- Track action items and decisions
- Ensure the team follows a structured process

Ask questions like:
- "What blockers might we encounter?"
- "How does this fit into our sprint?"
- "What dependencies exist?"
- "Is the team ready for this?"

Be concise, practical, and focused on process and team dynamics."""

PRODUCT_MANAGER_SYSTEM = """You are a Product Manager evaluating business value.
Your role is to:
- Validate user value and market fit
- Ensure user needs are met
- Prioritize features and approaches
- Define success metrics

Ask questions like:
- "What problem does this solve for users?"
- "How do we measure success?"
- "Is this the right priority?"
- "What's the ROI?"

Be focused on user value, metrics, and business impact."""

VP_ENG_SYSTEM = """You are a VP of Engineering making strategic decisions.
Your role is to:
- Align with company strategy
- Consider resource allocation
- Evaluate organizational impact
- Make go/no-go decisions

Ask questions like:
- "Does this align with our strategy?"
- "Do we have the resources?"
- "What's the organizational impact?"
- "Is this the right time?"

Be strategic, considerate of resources, and focused on organizational impact."""

TECH_LEAD_SYSTEM = """You are a Tech Lead evaluating technical feasibility.
Your role is to:
- Evaluate technical feasibility
- Identify technical risks
- Recommend implementation approach
- Ensure code quality standards

Ask questions like:
- "Is this technically feasible?"
- "What are the technical risks?"
- "How do we implement this?"
- "Does this meet our quality standards?"

Be technical, practical, and focused on implementation."""

ARCHITECT_SYSTEM = """You are a Software Architect designing system architecture.
Your role is to:
- Design system architecture
- Ensure scalability
- Validate security
- Consider long-term maintainability

Ask questions like:
- "How does this fit our architecture?"
- "Will this scale?"
- "What are the security implications?"
- "Is this maintainable long-term?"

Be architectural, forward-thinking, and focused on system design."""

# Initialize LLM (using GPT-4o-mini for cost-effectiveness)
def get_llm(model: str = "gpt-4o-mini", temperature: float = 0.7):
    return ChatOpenAI(model=model, temperature=temperature)

# Initialize Mem0 client
def get_mem0_client():
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        return None
    return MemoryClient(api_key=api_key)

# Retrieve relevant memories
async def get_relevant_memories(user_id: str, situation: str, context: str):
    client = get_mem0_client()
    if not client:
        return ""
    
    try:
        query = f"Situation: {situation}. Context: {context}"
        results = client.search(
            query=query,
            filters={"OR": [{"user_id": user_id}]},
            limit=5
        )
        
        if results and results.get('results'):
            memories = []
            for mem in results['results']:
                memory_text = mem.get('memory', mem.get('content', ''))
                if memory_text:
                    memories.append(f"- {memory_text}")
            return "\n".join(memories) if memories else ""
    except Exception as e:
        print(f"Error retrieving memories: {e}")
        return ""
    
    return ""

# Agent node functions
async def scrum_master_turn(state: ThinkTankState) -> ThinkTankState:
    """Scrum Master provides process and team perspective"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    memories = await get_relevant_memories(state['user_id'], state['situation'], state['context'])
    memory_context = f"\n\nRelevant Past Decisions:\n{memories}" if memories else ""
    
    llm = get_llm()
    messages = [
        SystemMessage(content=f"""{SCRUM_MASTER_SYSTEM}

Situation: {state['situation']}
Context: {state['context']}{memory_context}"""),
        HumanMessage(content="Provide your analysis from a Scrum Master perspective. Focus on process, blockers, dependencies, and team readiness.")
    ]
    
    response = await llm.ainvoke(messages)
    
    return {
        **state,
        "scrum_master_analysis": response.content,
        "round_count": state['round_count'] + 1,
    }

async def product_manager_turn(state: ThinkTankState) -> ThinkTankState:
    """Product Manager provides business value perspective"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    memories = await get_relevant_memories(state['user_id'], state['situation'], state['context'])
    memory_context = f"\n\nRelevant Past Decisions:\n{memories}" if memories else ""
    
    llm = get_llm()
    messages = [
        SystemMessage(content=f"""{PRODUCT_MANAGER_SYSTEM}

Situation: {state['situation']}
Context: {state['context']}{memory_context}

Previous perspective (Scrum Master): {state.get('scrum_master_analysis', '')[:500]}"""),
        HumanMessage(content="Provide your analysis from a Product Manager perspective. Focus on user value, metrics, and business impact.")
    ]
    
    response = await llm.ainvoke(messages)
    
    return {
        **state,
        "product_manager_analysis": response.content,
        "round_count": state['round_count'] + 1,
    }

async def vp_eng_turn(state: ThinkTankState) -> ThinkTankState:
    """VP of Engineering provides strategic perspective"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    memories = await get_relevant_memories(state['user_id'], state['situation'], state['context'])
    memory_context = f"\n\nRelevant Past Decisions:\n{memories}" if memories else ""
    
    llm = get_llm()
    messages = [
        SystemMessage(content=f"""{VP_ENG_SYSTEM}

Situation: {state['situation']}
Context: {state['context']}{memory_context}

Previous perspectives:
- Scrum Master: {state.get('scrum_master_analysis', '')[:300]}
- Product Manager: {state.get('product_manager_analysis', '')[:300]}"""),
        HumanMessage(content="Provide your analysis from a VP of Engineering perspective. Focus on strategy, resources, and organizational impact.")
    ]
    
    response = await llm.ainvoke(messages)
    
    return {
        **state,
        "vp_eng_analysis": response.content,
        "round_count": state['round_count'] + 1,
    }

async def tech_lead_turn(state: ThinkTankState) -> ThinkTankState:
    """Tech Lead provides technical feasibility perspective"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    memories = await get_relevant_memories(state['user_id'], state['situation'], state['context'])
    memory_context = f"\n\nRelevant Past Decisions:\n{memories}" if memories else ""
    
    llm = get_llm()
    messages = [
        SystemMessage(content=f"""{TECH_LEAD_SYSTEM}

Situation: {state['situation']}
Context: {state['context']}{memory_context}

Previous perspectives:
- VP of Engineering: {state.get('vp_eng_analysis', '')[:300]}
- Product Manager: {state.get('product_manager_analysis', '')[:300]}"""),
        HumanMessage(content="Provide your analysis from a Tech Lead perspective. Focus on technical feasibility, risks, and implementation.")
    ]
    
    response = await llm.ainvoke(messages)
    
    return {
        **state,
        "tech_lead_analysis": response.content,
        "round_count": state['round_count'] + 1,
    }

async def architect_turn(state: ThinkTankState) -> ThinkTankState:
    """Architect provides system design perspective"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    memories = await get_relevant_memories(state['user_id'], state['situation'], state['context'])
    memory_context = f"\n\nRelevant Past Decisions:\n{memories}" if memories else ""
    
    llm = get_llm()
    messages = [
        SystemMessage(content=f"""{ARCHITECT_SYSTEM}

Situation: {state['situation']}
Context: {state['context']}{memory_context}

Previous perspectives:
- Tech Lead: {state.get('tech_lead_analysis', '')[:300]}
- VP of Engineering: {state.get('vp_eng_analysis', '')[:300]}"""),
        HumanMessage(content="Provide your analysis from an Architect perspective. Focus on architecture, scalability, security, and maintainability.")
    ]
    
    response = await llm.ainvoke(messages)
    
    return {
        **state,
        "architect_analysis": response.content,
        "round_count": state['round_count'] + 1,
    }

async def challenge_round(state: ThinkTankState) -> ThinkTankState:
    """Agents challenge each other's assumptions"""
    if state['round_count'] >= state['max_rounds']:
        return state
    
    llm = get_llm()
    
    # Each agent challenges others
    all_analyses = {
        "Scrum Master": state.get('scrum_master_analysis', ''),
        "Product Manager": state.get('product_manager_analysis', ''),
        "VP of Engineering": state.get('vp_eng_analysis', ''),
        "Tech Lead": state.get('tech_lead_analysis', ''),
        "Architect": state.get('architect_analysis', ''),
    }
    
    challenges = []
    for role, analysis in all_analyses.items():
        other_analyses = {k: v for k, v in all_analyses.items() if k != role}
        other_text = "\n".join([f"{k}: {v[:500]}" for k, v in other_analyses.items()])
        
        messages = [
            SystemMessage(content=f"""You are the {role}. Review the other perspectives and challenge assumptions or ask clarifying questions.

Other perspectives:
{other_text}"""),
            HumanMessage(content="What assumptions do you challenge? What questions do you have? What needs clarification?")
        ]
        
        response = await llm.ainvoke(messages)
        challenges.append({
            "role": role,
            "challenge": response.content
        })
    
    return {
        **state,
        "challenges": challenges,
        "round_count": state['round_count'] + 1,
    }

async def consensus_building(state: ThinkTankState) -> ThinkTankState:
    """Build consensus from all perspectives"""
    llm = get_llm()
    
    all_analyses = f"""
Scrum Master: {state.get('scrum_master_analysis', '')}
Product Manager: {state.get('product_manager_analysis', '')}
VP of Engineering: {state.get('vp_eng_analysis', '')}
Tech Lead: {state.get('tech_lead_analysis', '')}
Architect: {state.get('architect_analysis', '')}
"""
    
    challenges_text = "\n".join([f"{c['role']}: {c['challenge']}" for c in state.get('challenges', [])])
    
    messages = [
        SystemMessage(content=f"""You are synthesizing a think tank discussion. Analyze all perspectives and challenges to build consensus.

All Perspectives:
{all_analyses}

Challenges:
{challenges_text}

Situation: {state['situation']}
Context: {state['context']}"""),
        HumanMessage(content="""Identify:
1. Agreements - What everyone agrees on
2. Concerns - What needs attention
3. Blockers - What prevents moving forward
4. Recommendations - What should be done
5. Action Items - Specific next steps
6. Final Recommendation - Your synthesis

Format as JSON with keys: agreements, concerns, blockers, recommendations, action_items, final_recommendation""")
    ]
    
    response = await llm.ainvoke(messages)
    
    # Simple extraction (can be improved with structured output)
    content = response.content
    
    # Extract agreements, concerns, blockers, recommendations
    agreements = []
    concerns = []
    blockers = []
    recommendations = []
    action_items = []
    final_recommendation = content
    
    # Try to parse structured content
    if "Agreements" in content or "agreements" in content.lower():
        # Simple extraction - can be improved
        pass
    
    return {
        **state,
        "agreements": agreements,
        "concerns": concerns,
        "blockers": blockers,
        "recommendations": recommendations,
        "action_items": action_items,
        "final_recommendation": final_recommendation,
        "consensus_reached": len(blockers) == 0 and len(agreements) > 0,
        "round_count": state['round_count'] + 1,
    }

def should_continue(state: ThinkTankState) -> Literal["consensus", "need_verification", "continue"]:
    """Decide whether to continue or end"""
    if state['round_count'] >= state['max_rounds']:
        return "consensus"
    if state.get('consensus_reached', False):
        return "consensus"
    if state['round_count'] >= 2 and len(state.get('blockers', [])) > 0:
        return "need_verification"
    return "continue"

# Build workflow
workflow = StateGraph(ThinkTankState)

# Round 1: Initial Perspectives
workflow.add_node("scrum_master", scrum_master_turn)
workflow.add_node("product_manager", product_manager_turn)
workflow.add_node("vp_eng", vp_eng_turn)
workflow.add_node("tech_lead", tech_lead_turn)
workflow.add_node("architect", architect_turn)

# Round 2: Challenge & Refine
workflow.add_node("challenge_round", challenge_round)

# Round 3: Consensus
workflow.add_node("consensus_building", consensus_building)

# Entry point
workflow.set_entry_point("scrum_master")

# Sequential flow
workflow.add_edge("scrum_master", "product_manager")
workflow.add_edge("product_manager", "vp_eng")
workflow.add_edge("vp_eng", "tech_lead")
workflow.add_edge("tech_lead", "architect")
workflow.add_edge("architect", "challenge_round")
workflow.add_edge("challenge_round", "consensus_building")

# Conditional: consensus reached or need verification?
workflow.add_conditional_edges(
    "consensus_building",
    should_continue,
    {
        "consensus": END,
        "need_verification": END,  # For now, end here (can add final_verification later)
        "continue": "scrum_master"  # Loop back for another round
    }
)

# Compile workflow
app = workflow.compile()

# Store decision in memory after completion
async def store_decision(state: ThinkTankState):
    """Store the final decision in Mem0"""
    client = get_mem0_client()
    if not client:
        return
    
    try:
        decision_text = f"""
Situation: {state['situation']}
Context: {state['context']}
Final Recommendation: {state.get('final_recommendation', '')}
Agreements: {', '.join(state.get('agreements', []))}
Concerns: {', '.join(state.get('concerns', []))}
"""
        client.add(
            messages=[{"role": "user", "content": decision_text}],
            user_id=state['user_id']
        )
    except Exception as e:
        print(f"Error storing decision: {e}")

