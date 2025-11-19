# Mem0 MCP Server

Simple MCP server to test Mem0 read/write functionality independently of Cursor/Claude.

## ✅ Status

**Core Functions Tested:** ✅ Working
- `save_memory` - Successfully saves memories to Mem0
- `recall_memory` - Successfully retrieves memories from Mem0

**MCP Protocol:** 🚧 In Progress
- Server implementation created
- Full MCP protocol test pending (requires MCP SDK setup)

## 📁 Files

- `mcp_server.py` - MCP server with `save_memory` and `recall_memory` tools
- `test_direct.py` - Direct function test (✅ PASSING)
- `test_mcp_server.py` - Full MCP protocol test (requires MCP SDK)

## 🧪 Testing

### Direct Function Test (Recommended)

Tests the core functions without MCP protocol:

```bash
python3 mcp-server/mem0/test_direct.py
```

**Expected Output:**
```
✅ SUCCESS: Found memory containing 'TypeScript'
✅ The MCP server → Mem0 integration functions are working!
```

### Full MCP Protocol Test

Tests the complete MCP server via stdio protocol:

```bash
python3 mcp-server/mem0/test_mcp_server.py
```

**Note:** Requires MCP Python SDK to be installed and configured.

## 🔧 Tools

### 1. `save_memory`

Saves a memory to Mem0.

**Parameters:**
- `text` (required): The text content to save
- `user_id` (optional): User ID (defaults to "default-user")

**Example:**
```python
await session.call_tool(
    "save_memory",
    arguments={
        "text": "My favorite language is TypeScript",
        "user_id": "donnie-test"
    }
)
```

### 2. `recall_memory`

Searches and retrieves memories from Mem0.

**Parameters:**
- `query` (required): The search query
- `user_id` (optional): User ID to filter (defaults to "default-user")

**Example:**
```python
await session.call_tool(
    "recall_memory",
    arguments={
        "query": "What is my favorite language?",
        "user_id": "donnie-test"
    }
)
```

## ✅ Verification

The direct test proves:
1. ✅ Memory can be saved to Mem0 via `save_memory` function
2. ✅ Memory can be retrieved from Mem0 via `recall_memory` function
3. ✅ User ID filtering works correctly
4. ✅ Mem0 background processing completes within 10 seconds

**Conclusion:** The MCP server → Mem0 wiring is correct. If the AI doesn't call the tools, the issue is with tool invocation, not the memory system.

## 🚀 Next Steps

1. **Install MCP SDK** (if needed):
   ```bash
   pip install mcp
   ```

2. **Test Full MCP Protocol:**
   ```bash
   python3 mcp-server/mem0/test_mcp_server.py
   ```

3. **Integrate with Cursor/Claude Desktop:**
   - Add MCP server configuration
   - Test tool invocation from AI

4. **Add Error Handling:**
   - Better error messages
   - Retry logic for Mem0 API
   - Timeout handling

## 📝 Notes

- Mem0 processes memories in the background (queued)
- Wait 10 seconds after saving before searching
- User ID must match between save and recall
- Results include relevance scores (0.0 to 1.0)

