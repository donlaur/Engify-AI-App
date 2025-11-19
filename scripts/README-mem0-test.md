# Mem0 Standalone Test

This script tests Mem0 independently of MCP or Cursor to verify that Mem0 itself is working correctly.

## Purpose

Before troubleshooting MCP integration issues, this script verifies:
1. ✅ Mem0 can store memories
2. ✅ Mem0 can retrieve memories via search
3. ✅ Memories persist across runs

## Setup

1. **Install dependencies:**
   ```bash
   pip install mem0ai python-dotenv
   # Or from project root:
   pip install -r python/requirements.txt
   ```

2. **Set API key (if using Mem0 cloud):**
   ```bash
   # Add to .env.local
   MEM0_API_KEY=your-mem0-api-key-here
   ```

   Or use local Mem0 configuration (see [Mem0 docs](https://docs.mem0.ai/)).

## Usage

```bash
# From project root
python scripts/test-mem0-standalone.py

# Or make it executable and run directly
chmod +x scripts/test-mem0-standalone.py
./scripts/test-mem0-standalone.py
```

## Expected Output

**First Run:**
```
✅ Memory stored successfully
✅ Search completed
✅ Results contain expected memory content
```

**Second Run (without re-adding):**
```
✅ Search completed
✅ Results contain expected memory content (from previous run)
```

## Troubleshooting

### If memory is NOT found on second run:

1. **Check API key:**
   ```bash
   echo $MEM0_API_KEY
   ```

2. **Check database connection** (if using local Mem0):
   - Verify database is running
   - Check connection string in Mem0 config

3. **Check user ID consistency:**
   - Script uses `test-user-123` by default
   - Ensure same user_id is used for add and search

4. **Check Mem0 configuration:**
   - Review Mem0 logs/console for errors
   - Verify vector database is accessible

### If test fails:

- **Import error**: Install mem0ai package
- **API key error**: Set MEM0_API_KEY or configure local Mem0
- **Connection error**: Check network/database connectivity

## Next Steps

If this test passes:
- ✅ Mem0 is working correctly
- ✅ Issue is likely in MCP integration or Cursor configuration
- ✅ Proceed to test MCP server integration

If this test fails:
- ❌ Mem0 configuration issue
- ❌ Fix Mem0 setup before testing MCP integration

