# AI Integration Workbench - RAG Context Integration Plan

**Status:** Proposal  
**Priority:** HIGH - Required for quality output  
**Estimated Time:** 2-3 hours

---

## Current RAG Infrastructure ✅

**What We Have:**
1. ✅ MongoDB text indexes (`prompts_text_search`, `patterns_text_search`)
2. ✅ RAG Lambda with `simple_text_search()` function
3. ✅ Text search working in `/api/chat` route
4. ✅ MongoDB connection already in multi-agent Lambda

---

## Integration Options

### Option 1: Reuse RAG Lambda Function (Recommended) ⭐

**Approach:** Call the existing RAG Lambda function from multi-agent Lambda

**Pros:**
- ✅ Reuses existing code
- ✅ Same search logic
- ✅ Can search both prompts + patterns
- ✅ Already tested and working

**Cons:**
- ⚠️ Adds Lambda-to-Lambda invocation overhead (~100-200ms)
- ⚠️ Requires Lambda permissions

**Implementation:**
```python
# In lambda_handler_multi_agent.py
import boto3

lambda_client = boto3.client('lambda')

def get_rag_context(situation: str) -> dict:
    """Call RAG Lambda to get relevant prompts/patterns"""
    try:
        response = lambda_client.invoke(
            FunctionName='engify-rag-service',  # Or env var
            Payload=json.dumps({
                'query': situation,
                'collection': 'prompts',
                'top_k': 5
            })
        )
        result = json.loads(response['Payload'].read())
        return result.get('results', [])
    except Exception as e:
        print(f"RAG search failed: {e}")
        return []

# Also search patterns
def get_pattern_context(situation: str) -> dict:
    """Call RAG Lambda to get relevant patterns"""
    # Similar to above, but search patterns collection
    pass
```

---

### Option 2: Direct MongoDB Search in Multi-Agent Lambda ⭐⭐ (Best)

**Approach:** Add RAG search function directly to multi-agent Lambda

**Pros:**
- ✅ Faster (no Lambda-to-Lambda call)
- ✅ Same MongoDB connection already available
- ✅ More control over search logic
- ✅ Can search both prompts + patterns in one function

**Cons:**
- ⚠️ Code duplication (but minimal)

**Implementation:**
```python
# In lambda_handler_multi_agent.py, reuse get_db() function
def get_rag_context(situation: str, db) -> str:
    """
    Search MongoDB for relevant prompts and patterns
    Returns formatted context string for agents
    """
    context_parts = []
    
    # 1. Search prompts collection
    try:
        prompts = db.collection('prompts').find(
            {
                '$text': {'$search': situation},
                'isPublic': True,
                'active': {'$ne': False}
            },
            {
                'score': {'$meta': 'textScore'}
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(5).toArray()
        
        if prompts:
            context_parts.append("## Relevant Prompts from Engify.ai Library:")
            for p in prompts:
                context_parts.append(
                    f"- **{p.get('title', 'Untitled')}** ({p.get('pattern', 'unknown')} pattern): "
                    f"{p.get('description', '')[:200]}"
                )
    except Exception as e:
        print(f"Prompt search failed: {e}")
    
    # 2. Search patterns collection
    try:
        patterns = db.collection('patterns').find(
            {
                '$text': {'$search': situation}
            },
            {
                'score': {'$meta': 'textScore'}
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(3).toArray()
        
        if patterns:
            context_parts.append("\n## Relevant Prompt Patterns:")
            for pat in patterns:
                context_parts.append(
                    f"- **{pat.get('name', 'Unknown')}**: {pat.get('description', '')[:150]}"
                )
    except Exception as e:
        print(f"Pattern search failed: {e}")
    
    return "\n".join(context_parts) if context_parts else ""
```

---

### Option 3: Shared RAG Utility Module (Most Reusable)

**Approach:** Create shared `rag_utils.py` module used by both Lambdas

**Pros:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Consistent search logic
- ✅ Easy to maintain

**Cons:**
- ⚠️ Requires refactoring both Lambdas

**Implementation:**
```python
# lambda/rag_utils.py (new file)
def search_prompts(db, query: str, limit: int = 5) -> List[dict]:
    """Search prompts collection"""
    # Reusable search logic

def search_patterns(db, query: str, limit: int = 3) -> List[dict]:
    """Search patterns collection"""
    # Reusable search logic

def get_context_for_agents(db, situation: str) -> str:
    """Get formatted context for agent injection"""
    prompts = search_prompts(db, situation, 5)
    patterns = search_patterns(db, situation, 3)
    return format_context(prompts, patterns)
```

---

## Recommended Approach: Option 2 (Direct MongoDB Search)

**Why:**
- Fastest (no Lambda invocation overhead)
- Uses existing MongoDB connection
- Simple to implement
- Can search both collections efficiently

---

## Implementation Plan

### Step 1: Add RAG Context Function (30 min)

```python
# Add to lambda_handler_multi_agent.py

def get_rag_context(situation: str, context: str, db) -> str:
    """
    Get relevant prompts and patterns from MongoDB for agent context injection
    
    Args:
        situation: The user's situation/problem
        context: Additional context provided
        db: MongoDB database instance
    
    Returns:
        Formatted context string with prompts and patterns
    """
    if not db:
        return ""
    
    context_parts = []
    search_query = f"{situation} {context}".strip()
    
    # Search prompts
    try:
        prompts = list(db.collection('prompts').find(
            {
                '$text': {'$search': search_query},
                'isPublic': True,
                'active': {'$ne': False}
            },
            {
                'score': {'$meta': 'textScore'},
                'title': 1,
                'description': 1,
                'pattern': 1,
                'category': 1,
                'tags': 1
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(5))
        
        if prompts:
            context_parts.append("## Relevant Prompts from Engify.ai Library:")
            for p in prompts:
                pattern = p.get('pattern', 'unknown')
                category = p.get('category', '')
                desc = p.get('description', '')[:200]
                context_parts.append(
                    f"- **{p.get('title', 'Untitled')}** "
                    f"({pattern} pattern, {category}): {desc}"
                )
    except Exception as e:
        print(f"Prompt search error: {e}")
        # Fallback: Try regex search if text index fails
        try:
            query_words = search_query.lower().split()
            prompts = list(db.collection('prompts').find({
                'isPublic': True,
                'active': {'$ne': False},
                '$or': [
                    {'title': {'$regex': '|'.join(query_words[:3]), '$options': 'i'}},
                    {'description': {'$regex': '|'.join(query_words[:3]), '$options': 'i'}},
                    {'tags': {'$in': query_words[:3]}}
                ]
            }).limit(3))
            
            if prompts:
                context_parts.append("## Relevant Prompts:")
                for p in prompts:
                    context_parts.append(f"- **{p.get('title')}**: {p.get('description', '')[:150]}")
        except Exception as e2:
            print(f"Fallback prompt search error: {e2}")
    
    # Search patterns
    try:
        patterns = list(db.collection('patterns').find(
            {
                '$text': {'$search': search_query}
            },
            {
                'score': {'$meta': 'textScore'},
                'name': 1,
                'description': 1,
                'category': 1
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(3))
        
        if patterns:
            context_parts.append("\n## Relevant Prompt Patterns:")
            for pat in patterns:
                context_parts.append(
                    f"- **{pat.get('name', 'Unknown')}**: {pat.get('description', '')[:150]}"
                )
    except Exception as e:
        print(f"Pattern search error: {e}")
    
    return "\n".join(context_parts) if context_parts else ""
```

---

### Step 2: Inject Context into Agents (30 min)

**Modify agent system prompts:**

```python
# In lambda/agents/scrum_meeting.py

def director_turn(state: AIIntegrationState) -> AIIntegrationState:
    """Director of Engineering provides strategic perspective"""
    if state['turn_count'] >= state['max_turns']:
        return state
    
    # Get RAG context (passed via state)
    rag_context = state.get('rag_context', '')
    
    messages = [
        SystemMessage(content=f"""{DIRECTOR_SYSTEM}

{rag_context}

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
```

**Update state schema:**
```python
class AIIntegrationState(TypedDict):
    situation: str
    context: str
    rag_context: str  # NEW: Injected context from RAG
    current_topic: str
    # ... rest of fields
```

---

### Step 3: Call RAG Function in Handler (15 min)

```python
# In lambda_handler_multi_agent.py, before workflow

# Get RAG context
db = get_db()
rag_context = get_rag_context(situation, context, db)

# Initialize state with RAG context
initial_state = {
    'situation': situation,
    'context': context,
    'rag_context': rag_context,  # NEW
    'current_topic': situation,
    # ... rest of fields
}
```

---

### Step 4: Enhance Agent Instructions (30 min)

**Update system prompts to reference library:**

```python
DIRECTOR_SYSTEM = """You are a Director of Engineering leading a discussion on AI integration.
Focus on: Strategic alignment, ROI, organizational impact, change management, team readiness.

IMPORTANT: When making recommendations, reference specific prompts or patterns from the 
Engify.ai library provided in the context. Cite them by name (e.g., "Use the Chain-of-Thought 
pattern" or "Try the 'Code Review Co-Pilot' prompt").

Consider: Budget, timeline, organizational readiness, competitive advantage."""
```

---

## Expected Improvements

**Before (Without RAG):**
- Generic: "Consider using AI tools for code review"
- No library references
- Feels scripted

**After (With RAG):**
- Specific: "I recommend using the Chain-of-Thought pattern from your library for complex code review scenarios. The 'Code Review Co-Pilot' prompt (persona pattern) could help your team standardize review quality."
- References actual prompts/patterns
- Feels authentic and valuable

---

## Performance Impact

**Time Added:**
- MongoDB search: ~100-200ms
- Context formatting: ~10ms
- **Total overhead: ~200ms** ✅ Negligible

**Token Cost:**
- Context adds ~300-500 tokens per agent
- 4 agents × 500 tokens = +2000 tokens
- **Cost increase: ~$0.01 per session** ✅ Acceptable

---

## Testing Checklist

- [ ] RAG context retrieval works
- [ ] Prompts search returns relevant results
- [ ] Patterns search returns relevant results
- [ ] Context injected into all 4 agents
- [ ] Agents reference library content in responses
- [ ] Fallback works if MongoDB search fails
- [ ] Performance acceptable (< 300ms overhead)

---

## Next Steps

1. **Implement Option 2** (Direct MongoDB search)
2. **Test with real situations**
3. **Verify agents cite library content**
4. **Measure quality improvement**

**Estimated Total Time:** 2-3 hours

