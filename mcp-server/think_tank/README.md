# Think Tank Multi-Agent MCP Server

Multi-perspective analysis tool with 5 expert roles and multi-round verification.

## Quick Start

### 1. Install Dependencies

```bash
pip install langchain langchain-openai langgraph mem0ai python-dotenv
```

### 2. Set Environment Variables

```bash
export OPENAI_API_KEY="your-openai-key"
export MEM0_API_KEY="your-mem0-key"
```

### 3. Run Example

```python
from workflow import app
from datetime import datetime

state = {
    "situation": "Should we migrate from MongoDB to PostgreSQL?",
    "context": "We have 50GB of data, 10 microservices, team knows MongoDB well",
    "user_id": "test-user",
    "scrum_master_analysis": "",
    "product_manager_analysis": "",
    "vp_eng_analysis": "",
    "tech_lead_analysis": "",
    "architect_analysis": "",
    "challenges": [],
    "refinements": [],
    "agreements": [],
    "concerns": [],
    "blockers": [],
    "recommendations": [],
    "consensus_reached": False,
    "final_recommendation": "",
    "action_items": [],
    "next_steps": [],
    "round_count": 0,
    "max_rounds": 3,
    "consensus_threshold": 0.7,
    "started_at": datetime.now(),
    "completed_at": None,
}

result = await app.ainvoke(state)
print(result["final_recommendation"])
```

## Next Steps

1. **MCP Server Implementation** - Wrap this in an MCP server
2. **Structured Output** - Improve consensus extraction with structured LLM output
3. **Memory Integration** - Better memory retrieval and storage
4. **Testing** - Add comprehensive tests
5. **Production** - Deploy to Lambda or FastAPI

## See Also

- [Full Design Document](../../docs/mcp/THINK_TANK_MCP_SERVER.md)
- [Mem0 Integration Guide](../../docs/integrations/MEM0_INTEGRATIONS_ANALYSIS.md)

