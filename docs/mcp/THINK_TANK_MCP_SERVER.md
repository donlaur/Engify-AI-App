# Think Tank Multi-Agent MCP Server

**Date:** November 19, 2025  
**Status:** 🎯 Design Phase  
**Architecture:** LangChain + LangGraph + Mem0

---

## 🎯 Concept: "Think Tank" Multi-Agent Verification

### Problem Statement
When you're unsure about a situation, decision, or approach, you need multiple expert perspectives to verify your thinking. Instead of asking one AI, you get a **roundtable discussion** with real roles that challenge and refine the approach.

### Core Value Proposition
- ✅ **Multi-perspective analysis** - 5 different expert roles
- ✅ **Multi-round verification** - Agents challenge each other until consensus
- ✅ **Persistent memory** - Remembers past decisions and preferences
- ✅ **MCP-native** - Works seamlessly in Cursor, Claude Desktop, etc.

---

## 👥 Agent Roles & Responsibilities

### 1. **Scrum Master** (Facilitator)
**Focus:** Process, team dynamics, blockers, sprint planning
- Facilitates the discussion
- Identifies blockers and dependencies
- Ensures all voices are heard
- Tracks action items and decisions

**Questions they ask:**
- "What blockers might we encounter?"
- "How does this fit into our sprint?"
- "What dependencies exist?"
- "Is the team ready for this?"

### 2. **Product Manager** (Business Value)
**Focus:** User value, market fit, prioritization, metrics
- Validates business value
- Ensures user needs are met
- Prioritizes features/approaches
- Defines success metrics

**Questions they ask:**
- "What problem does this solve for users?"
- "How do we measure success?"
- "Is this the right priority?"
- "What's the ROI?"

### 3. **VP of Engineering** (Strategic Alignment)
**Focus:** Strategic direction, resource allocation, organizational impact
- Aligns with company strategy
- Considers resource implications
- Evaluates organizational impact
- Makes go/no-go decisions

**Questions they ask:**
- "Does this align with our strategy?"
- "Do we have the resources?"
- "What's the organizational impact?"
- "Is this the right time?"

### 4. **Tech Lead** (Technical Feasibility)
**Focus:** Implementation approach, technical risks, code quality
- Evaluates technical feasibility
- Identifies technical risks
- Recommends implementation approach
- Ensures code quality standards

**Questions they ask:**
- "Is this technically feasible?"
- "What are the technical risks?"
- "How do we implement this?"
- "Does this meet our quality standards?"

### 5. **Architect** (System Design)
**Focus:** Architecture, scalability, security, long-term maintainability
- Designs system architecture
- Ensures scalability
- Validates security
- Considers long-term maintainability

**Questions they ask:**
- "How does this fit our architecture?"
- "Will this scale?"
- "What are the security implications?"
- "Is this maintainable long-term?"

---

## 🔄 Multi-Round Verification Process

### Round 1: Initial Perspectives
Each agent provides their initial analysis from their role's perspective.

### Round 2: Challenge & Refine
Agents challenge each other's assumptions and refine the approach.

### Round 3: Consensus Building
Agents work toward consensus, identifying:
- ✅ **Agreements** - What everyone agrees on
- ⚠️ **Concerns** - What needs attention
- ❌ **Blockers** - What prevents moving forward

### Round 4: Final Verification (Optional)
If consensus isn't reached, agents do a final round to:
- Resolve remaining concerns
- Identify alternative approaches
- Make final recommendations

---

## 🏗️ Architecture

### Tech Stack
- **LangChain** - LLM orchestration
- **LangGraph** - Multi-agent workflow
- **Mem0** - Persistent memory (user preferences, past decisions)
- **MCP Server** - Protocol implementation
- **Python** - Backend (Lambda or FastAPI)

### State Schema
```python
from typing import TypedDict, List, Literal, Optional
from datetime import datetime

class ThinkTankState(TypedDict):
    # Input
    situation: str  # The situation/question to analyze
    context: str  # Additional context (company, team, etc.)
    user_id: str  # For Mem0 memory isolation
    
    # Agent Perspectives (Round 1)
    scrum_master_analysis: str
    product_manager_analysis: str
    vp_eng_analysis: str
    tech_lead_analysis: str
    architect_analysis: str
    
    # Challenge & Refine (Round 2)
    challenges: List[dict]  # Agent challenges to other agents
    refinements: List[dict]  # Refined perspectives
    
    # Consensus (Round 3)
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
    consensus_threshold: float  # 0.0-1.0, how much agreement needed
    started_at: datetime
    completed_at: Optional[datetime]
```

### LangGraph Workflow
```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from mem0.integrations.langgraph import Mem0Memory

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

# Round 4: Final Verification (if needed)
workflow.add_node("final_verification", final_verification)

# Entry point
workflow.set_entry_point("scrum_master")

# Sequential flow
workflow.add_edge("scrum_master", "product_manager")
workflow.add_edge("product_manager", "vp_eng")
workflow.add_edge("vp_eng", "tech_lead")
workflow.add_edge("tech_lead", "architect")
workflow.add_edge("architect", "challenge_round")
workflow.add_edge("challenge_round", "consensus_building")

# Conditional: consensus reached or need final round?
workflow.add_conditional_edges(
    "consensus_building",
    should_continue,
    {
        "consensus": END,
        "need_verification": "final_verification",
        "continue": "scrum_master"  # Loop back for another round
    }
)

workflow.add_edge("final_verification", END)

# Compile with Mem0 memory
memory = Mem0Memory(api_key=os.getenv('MEM0_API_KEY'))
app = workflow.compile(checkpointer=memory)
```

---

## 🧠 Mem0 Memory Integration

### What Gets Remembered
- **User preferences** - "User prefers TypeScript over JavaScript"
- **Past decisions** - "User chose X approach for similar situation"
- **Team context** - "Team uses React, MongoDB, AWS"
- **Guardrails** - "No console.log in production"
- **Workflow patterns** - "User prefers PBVR workflows"

### Memory Usage in Think Tank
```python
# Before starting, retrieve relevant memories
memories = client.search(
    query=f"Situation: {situation}. Context: {context}",
    filters={"OR": [{"user_id": user_id}]},
    limit=5
)

# Add memories to agent context
agent_context = f"""
Situation: {situation}
Context: {context}

Relevant Past Decisions:
{format_memories(memories)}

User Preferences:
{format_preferences(memories)}
"""

# After consensus, store the decision
client.add(
    messages=[{
        "role": "user",
        "content": f"Situation: {situation}. Decision: {final_recommendation}"
    }],
    user_id=user_id
)
```

---

## 🔌 MCP Server Implementation

### MCP Tool: `think_tank_analyze`

**Tool Definition:**
```json
{
  "name": "think_tank_analyze",
  "description": "Get multi-perspective analysis from 5 expert roles (Scrum Master, Product Manager, VP of Engineering, Tech Lead, Architect) with multi-round verification until consensus is reached.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "situation": {
        "type": "string",
        "description": "The situation, question, or decision you need help with"
      },
      "context": {
        "type": "string",
        "description": "Additional context about your company, team, or situation"
      },
      "max_rounds": {
        "type": "number",
        "description": "Maximum number of discussion rounds (default: 3)",
        "default": 3,
        "minimum": 1,
        "maximum": 5
      },
      "consensus_threshold": {
        "type": "number",
        "description": "How much agreement is needed (0.0-1.0, default: 0.7)",
        "default": 0.7,
        "minimum": 0.0,
        "maximum": 1.0
      }
    },
    "required": ["situation"]
  }
}
```

**Tool Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "# Think Tank Analysis\n\n## Situation\n{...}\n\n## Round 1: Initial Perspectives\n\n### Scrum Master\n{...}\n\n### Product Manager\n{...}\n\n### VP of Engineering\n{...}\n\n### Tech Lead\n{...}\n\n### Architect\n{...}\n\n## Round 2: Challenges & Refinements\n{...}\n\n## Round 3: Consensus\n\n### Agreements\n- ✅ {agreement1}\n- ✅ {agreement2}\n\n### Concerns\n- ⚠️ {concern1}\n- ⚠️ {concern2}\n\n### Blockers\n- ❌ {blocker1}\n\n## Final Recommendation\n{final_recommendation}\n\n## Action Items\n1. {action1}\n2. {action2}\n\n## Next Steps\n1. {step1}\n2. {step2}"
    }
  ],
  "metadata": {
    "rounds": 3,
    "consensus_reached": true,
    "agents_participated": 5,
    "processing_time": 45.2
  }
}
```

### MCP Server Structure
```
mcp-server/
├── __init__.py
├── server.py              # MCP server implementation
├── tools/
│   ├── __init__.py
│   └── think_tank.py      # Think tank tool handler
├── agents/
│   ├── __init__.py
│   ├── scrum_master.py
│   ├── product_manager.py
│   ├── vp_eng.py
│   ├── tech_lead.py
│   └── architect.py
├── workflows/
│   ├── __init__.py
│   └── think_tank_workflow.py
├── memory/
│   ├── __init__.py
│   └── mem0_client.py
└── requirements.txt
```

---

## 📝 Example Usage

### In Cursor/Claude Desktop
```
User: "I'm not sure if we should migrate from MongoDB to PostgreSQL. 
       We have 50GB of data, 10 microservices, and our team knows MongoDB well."

AI Assistant: *calls think_tank_analyze tool*

Think Tank Analysis:
===================

## Situation
Should we migrate from MongoDB to PostgreSQL?

## Round 1: Initial Perspectives

### Scrum Master
"Migration would require significant sprint planning. We'd need to:
- Plan data migration sprints (4-6 sprints minimum)
- Train team on PostgreSQL
- Coordinate with all 10 microservices
- Risk: Major disruption to current work"

### Product Manager
"Need to understand the business value:
- What problem does this solve?
- What's the ROI?
- Can we measure success?
- Risk: Migration might delay feature work"

### VP of Engineering
"Strategic considerations:
- Does this align with our long-term strategy?
- Do we have resources for migration?
- What's the organizational impact?
- Risk: High cost, uncertain benefit"

### Tech Lead
"Technical feasibility:
- 50GB migration is manageable
- Team knows MongoDB, learning curve for PostgreSQL
- Need to evaluate query patterns
- Risk: Performance regression possible"

### Architect
"Architecture implications:
- PostgreSQL fits better with relational data?
- Need to evaluate schema design
- Consider data consistency requirements
- Risk: Architecture mismatch"

## Round 2: Challenges & Refinements

**Scrum Master challenges Product Manager:**
"Before we discuss ROI, we need to understand: What's the actual problem we're solving?"

**Product Manager responds:**
"Good point. Let me clarify: We're experiencing query performance issues with complex joins. PostgreSQL might solve this, but we need data first."

**Tech Lead challenges Architect:**
"Are we sure PostgreSQL is better? MongoDB handles our document structure well. What specific problems does PostgreSQL solve?"

## Round 3: Consensus

### Agreements
- ✅ Need to measure current performance first
- ✅ Migration is high-risk, high-cost
- ✅ Team expertise in MongoDB is valuable

### Concerns
- ⚠️ Performance issues need investigation
- ⚠️ Migration would be disruptive
- ⚠️ ROI is unclear

### Blockers
- ❌ No clear business case for migration
- ❌ Team doesn't have PostgreSQL expertise

## Final Recommendation

**DO NOT MIGRATE** - Instead:

1. **Investigate Performance Issues First**
   - Profile MongoDB queries
   - Identify slow queries
   - Optimize indexes and queries
   - Measure improvement

2. **Evaluate Alternatives**
   - MongoDB Atlas performance tiers
   - Query optimization
   - Caching strategies
   - Read replicas

3. **If Migration Still Needed**
   - Build business case with data
   - Plan 6-month migration timeline
   - Train team on PostgreSQL
   - Start with one microservice as pilot

## Action Items
1. [Tech Lead] Profile MongoDB queries this sprint
2. [Product Manager] Define success metrics for performance
3. [Architect] Evaluate MongoDB optimization options

## Next Steps
1. Schedule follow-up in 2 weeks with performance data
2. Re-evaluate migration decision with data
3. If migration needed, create detailed migration plan
```

---

## 🧪 Testing Strategy

### Unit Tests
- Test each agent's perspective generation
- Test consensus detection logic
- Test memory retrieval and storage

### Integration Tests
- Test full workflow end-to-end
- Test MCP tool invocation
- Test Mem0 memory integration

### Example Test
```python
async def test_think_tank_consensus():
    state = {
        "situation": "Should we use TypeScript or JavaScript?",
        "context": "New project, team knows both",
        "user_id": "test-user",
        "max_rounds": 3,
        "consensus_threshold": 0.7
    }
    
    result = await app.ainvoke(state)
    
    assert result["consensus_reached"] == True
    assert len(result["recommendations"]) > 0
    assert len(result["agreements"]) > 0
```

---

## 🚀 Implementation Plan

### Phase 1: Core Multi-Agent Workflow (Week 1)
- [ ] Set up LangChain + LangGraph
- [ ] Implement 5 agent roles
- [ ] Build basic workflow (Round 1 only)
- [ ] Test with simple scenarios

### Phase 2: Multi-Round Verification (Week 2)
- [ ] Implement challenge round
- [ ] Implement consensus building
- [ ] Add final verification round
- [ ] Test consensus detection

### Phase 3: Mem0 Integration (Week 3)
- [ ] Integrate Mem0 memory
- [ ] Add memory retrieval to agents
- [ ] Store decisions in memory
- [ ] Test memory persistence

### Phase 4: MCP Server (Week 4)
- [ ] Implement MCP protocol
- [ ] Create `think_tank_analyze` tool
- [ ] Add error handling
- [ ] Test with Cursor/Claude Desktop

### Phase 5: Production Ready (Week 5)
- [ ] Add comprehensive tests
- [ ] Add logging and monitoring
- [ ] Optimize performance
- [ ] Deploy to production

---

## 💰 Cost Estimation

### Per Think Tank Session
- **5 agents** × **3 rounds** = **15 LLM calls**
- Using GPT-4o-mini: ~$0.15-0.30 per session
- Using GPT-4o: ~$1.50-3.00 per session

### Monthly (100 sessions)
- GPT-4o-mini: $15-30/month
- GPT-4o: $150-300/month

**Recommendation:** Start with GPT-4o-mini, upgrade to GPT-4o for complex decisions.

---

## 🎯 Success Metrics

- ✅ **Consensus Rate** - % of sessions reaching consensus
- ✅ **User Satisfaction** - Feedback on recommendations
- ✅ **Decision Quality** - Are decisions good in hindsight?
- ✅ **Memory Usage** - Are past decisions being used?
- ✅ **Tool Adoption** - How often is tool used?

---

## 📚 References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Mem0 LangGraph Integration](https://docs.mem0.ai/integrations/langgraph)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Your Current Multi-Agent Implementation](../lambda/agents/scrum_meeting.py)

