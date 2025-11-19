#!/usr/bin/env python3
"""
Test Mem0 Standalone
===================

This script tests Mem0 independently of MCP or Cursor to verify:
1. Mem0 can store memories
2. Mem0 can retrieve memories via search
3. Memories persist across runs

Usage:
    python scripts/test-mem0-standalone.py

Requirements:
    - mem0 package installed: pip install mem0ai
    - MEM0_API_KEY environment variable set (or use local config)
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

try:
    from mem0 import MemoryClient
except ImportError:
    print("❌ Error: mem0 package not installed")
    print("   Install with: pip install mem0ai")
    sys.exit(1)


def test_mem0_basic():
    """Test basic Mem0 functionality"""
    print("=" * 60)
    print("Mem0 Standalone Test")
    print("=" * 60)
    print()

    # Get API key
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        print("⚠️  Warning: MEM0_API_KEY not found in environment")
        print()
        print("To get your Mem0 API key:")
        print("1. Sign up at https://mem0.ai/")
        print("2. Get your API key from the dashboard")
        print("3. Add to .env.local: MEM0_API_KEY=your-key-here")
        print()
        print("Or use local Mem0 setup (see https://docs.mem0.ai/)")
        print()
        
        # Try to initialize without API key (for local setup)
        try:
            print("Attempting to initialize with local config...")
            client = MemoryClient()
            print(f"✅ MemoryClient initialized with local config")
        except Exception as e:
            print(f"❌ Failed to initialize MemoryClient: {e}")
            print()
            print("Please set MEM0_API_KEY in .env.local or configure local Mem0")
            return False
    else:
        # Initialize with API key
        try:
            client = MemoryClient(api_key=api_key)
            print(f"✅ MemoryClient initialized with API key")
        except Exception as e:
            print(f"❌ Failed to initialize MemoryClient: {e}")
            return False

    # Test user ID
    user_id = "test-user-123"
    test_memory = "Donnie likes PBVR workflows"
    test_query = "What workflows does Donnie like?"

    print()
    print("-" * 60)
    print("Test 1: Store Memory")
    print("-" * 60)
    try:
        # Mem0 API requires messages format
        messages = [
            {"role": "user", "content": test_memory}
        ]
        result = client.add(messages=messages, user_id=user_id, version="v2", output_format="v1.1")
        print(f"✅ Memory stored successfully")
        print(f"   Memory: '{test_memory}'")
        print(f"   User ID: {user_id}")
        if result:
            print(f"   Result: {result}")
    except Exception as e:
        print(f"❌ Failed to store memory: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

    print()
    print("-" * 60)
    print("Test 2: Retrieve Memory (Immediate)")
    print("-" * 60)
    print("   Note: Memory processing is queued, may need to wait a few seconds...")
    import time
    time.sleep(10)  # Wait for background processing (official docs recommend 10s)
    
    try:
        # Mem0 API requires filters in OR format (official pattern)
        filters = {
            "OR": [
                {"user_id": user_id}
            ]
        }
        results = client.search(
            query=test_query,
            filters=filters,
            version="v2",
            output_format="v1.1"
        )
        print(f"✅ Search completed")
        print(f"   Query: '{test_query}'")
        print(f"   User ID: {user_id}")
        print(f"   Results: {results}")
        
        # Check if results contain the expected memory
        if results:
            results_str = str(results).lower()
            if "pbvr" in results_str.lower() or "workflow" in results_str.lower():
                print(f"✅ Results contain expected memory content")
            else:
                print(f"⚠️  Results may not contain expected content")
                print(f"   Expected to find: 'PBVR workflows'")
                print(f"   Full results: {results}")
        else:
            print(f"⚠️  No results returned (memory may still be processing)")
    except Exception as e:
        print(f"❌ Failed to search memory: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

    print()
    print("-" * 60)
    print("Test 3: Verify Persistence")
    print("-" * 60)
    print("   Note: Run this script again to verify memory persists")
    print("   The memory should be found without re-adding it")
    print()

    # Get all memories for user (optional - requires filters in OR format)
    try:
        filters = {
            "OR": [
                {"user_id": user_id}
            ]
        }
        all_memories = client.get_all(filters=filters)
        print(f"✅ Retrieved all memories for user")
        print(f"   Total memories: {len(all_memories) if all_memories else 0}")
        if all_memories:
            print(f"   Memories:")
            for i, mem in enumerate(all_memories[:5], 1):  # Show first 5
                mem_text = mem.get('memory', mem.get('content', str(mem)))
                print(f"     {i}. {mem_text}")
            if len(all_memories) > 5:
                print(f"     ... and {len(all_memories) - 5} more")
    except Exception as e:
        print(f"⚠️  Could not retrieve all memories: {e}")
        print("   (This is optional, search test is the main check)")

    print()
    print("=" * 60)
    print("✅ Basic Mem0 test completed")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Run this script again to verify memory persists")
    print("2. If memory is found on second run, Mem0 is working correctly")
    print("3. If memory is NOT found, check:")
    print("   - MEM0_API_KEY is correct")
    print("   - Database connection (if using local config)")
    print("   - User ID consistency")
    print()

    return True


if __name__ == "__main__":
    success = test_mem0_basic()
    sys.exit(0 if success else 1)

