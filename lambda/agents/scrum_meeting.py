"""
Scrum Meeting Multi-Agent Workflow
4 independent agents: Scrum Master, PM, PO, Engineer
Beta-optimized: 5-minute timeout, GPT-4o-mini, simple state management
"""

from typing import TypedDict, List, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

# State schema for scrum meeting workflow
class ScrumState(TypedDict):
    agenda: str
    topics: List[str]
    current_topic: str
    scrum_master_notes: str
    pm_notes: str
    po_notes: str
    engineer_notes: str
    action_items: List[dict]
    next_sprint_goals: List[str]
    blockers: List[str]
    turn_count: int
    max_turns: int

# Initialize agents (Beta: all use GPT-4o-mini for cost-effectiveness)
scrum_master = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    system_message="""You are a Scrum Master facilitating a sprint planning meeting.
    Focus on: timeboxing, removing blockers, facilitating discussion.
    Ask: 'What are the blockers?' 'Can we commit to this?' 'What's our velocity?'"""
)

pm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    system_message="""You are a Product Manager.
    Focus on: business value, priorities, user needs, ROI.
    Ask: 'Why is this important?' 'What's the business impact?' 'What's the priority?'"""
)

po = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    system_message="""You are a Product Owner.
    Focus on: story clarity, acceptance criteria, definition of done.
    Ensure stories are well-defined and testable."""
)

engineer = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    system_message="""You are a Senior Engineer.
    Focus on: technical feasibility, effort estimation, implementation details.
    Ask: 'Can we build this?' 'How long?' 'What are the risks?'"""
)

# Node functions for each agent
def scrum_master_turn(state: ScrumState) -> ScrumState:
    """Scrum Master opens topic and facilitates"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    response = scrum_master.invoke([
        {"role": "system", "content": f"Meeting agenda: {state['agenda']}"},
        {"role": "user", "content": f"Current topic: {state['current_topic']}. Facilitate discussion. Previous notes: {state['scrum_master_notes']}"}
    ])
    
    return {
        **state,
        "scrum_master_notes": state['scrum_master_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def pm_turn(state: ScrumState) -> ScrumState:
    """PM provides business perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    response = pm.invoke([
        {"role": "system", "content": f"Meeting agenda: {state['agenda']}"},
        {"role": "user", "content": f"Topic: {state['current_topic']}. Provide business perspective. Previous notes: {state['pm_notes']}. Scrum Master said: {state['scrum_master_notes'][-200:]}"}
    ])
    
    return {
        **state,
        "pm_notes": state['pm_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def po_turn(state: ScrumState) -> ScrumState:
    """PO clarifies requirements"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    response = po.invoke([
        {"role": "system", "content": f"Meeting agenda: {state['agenda']}"},
        {"role": "user", "content": f"Topic: {state['current_topic']}. Clarify requirements. Previous notes: {state['po_notes']}. PM said: {state['pm_notes'][-200:]}"}
    ])
    
    return {
        **state,
        "po_notes": state['po_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def engineer_turn(state: ScrumState) -> ScrumState:
    """Engineer provides technical assessment"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    response = engineer.invoke([
        {"role": "system", "content": f"Meeting agenda: {state['agenda']}"},
        {"role": "user", "content": f"Topic: {state['current_topic']}. Provide technical assessment. Previous notes: {state['engineer_notes']}. PO said: {state['po_notes'][-200:]}"}
    ])
    
    # Extract action items and blockers from engineer response
    content = response.content.lower()
    if "action item" in content or "todo" in content:
        # Simple extraction (can be improved)
        pass
    
    return {
        **state,
        "engineer_notes": state['engineer_notes'] + "\n" + response.content,
        "turn_count": state['turn_count'] + 1,
    }

def should_continue(state: ScrumState) -> Literal["continue", "end"]:
    """Decide whether to continue or end"""
    if state['turn_count'] >= state['max_turns']:
        return "end"
    if state['turn_count'] >= 8 and state['current_topic']:  # Minimum 2 rounds
        return "end"
    return "continue"

# Build workflow graph
workflow = StateGraph(ScrumState)

# Add nodes
workflow.add_node("scrum_master", scrum_master_turn)
workflow.add_node("pm", pm_turn)
workflow.add_node("po", po_turn)
workflow.add_node("engineer", engineer_turn)

# Set entry point
workflow.set_entry_point("scrum_master")

# Add edges
workflow.add_edge("scrum_master", "pm")
workflow.add_edge("pm", "po")
workflow.add_edge("po", "engineer")
workflow.add_conditional_edges(
    "engineer",
    should_continue,
    {
        "continue": "scrum_master",  # Loop back for next round
        "end": END
    }
)

# Compile workflow
app = workflow.compile()

