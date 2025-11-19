#!/usr/bin/env python3
"""
Direct Test of Mem0 MCP Server Functions
Tests save_memory and recall_memory functions directly without MCP protocol
"""

import asyncio
import os
import sys
import time
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


async def save_memory(text: str, user_id: str = "default-user"):
    """Save a memory to Mem0"""
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        raise ValueError("MEM0_API_KEY not found")
    
    client = MemoryClient(api_key=api_key)
    
    messages = [
        {"role": "user", "content": text}
    ]
    result = client.add(
        messages=messages,
        user_id=user_id,
        version="v2",
        output_format="v1.1"
    )
    
    return result


async def recall_memory(query: str, user_id: str = "default-user"):
    """Recall memories from Mem0"""
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        raise ValueError("MEM0_API_KEY not found")
    
    client = MemoryClient(api_key=api_key)
    
    filters = {
        "OR": [
            {"user_id": user_id}
        ]
    }
    results = client.search(
        query=query,
        filters=filters,
        version="v2",
        output_format="v1.1"
    )
    
    return results


async def test_direct():
    """Test save_memory and recall_memory directly"""
    print("=" * 70)
    print("Direct Mem0 MCP Server Function Test")
    print("=" * 70)
    print()
    
    user_id = "donnie-test"
    test_text = "My favorite language is TypeScript"
    test_query = "What is my favorite language?"
    
    # Test 1: Save Memory
    print("-" * 70)
    print("Test 1: Save Memory")
    print("-" * 70)
    print(f"Text: '{test_text}'")
    print(f"User ID: {user_id}")
    print()
    
    try:
        result = await save_memory(test_text, user_id)
        print("✅ Memory saved successfully")
        print(f"Result: {result}")
    except Exception as e:
        print(f"❌ Error saving memory: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    print("⏳ Waiting 10 seconds for Mem0 to process memory...")
    time.sleep(10)
    print()
    
    # Test 2: Recall Memory
    print("-" * 70)
    print("Test 2: Recall Memory")
    print("-" * 70)
    print(f"Query: '{test_query}'")
    print(f"User ID: {user_id}")
    print()
    
    try:
        results = await recall_memory(test_query, user_id)
        print("✅ Search completed")
        print(f"Results: {results}")
        print()
        
        # Verify the result
        print("-" * 70)
        print("Verification")
        print("-" * 70)
        
        if results and results.get("results"):
            memories = results["results"]
            found = False
            for mem in memories:
                memory_text = mem.get("memory", mem.get("content", str(mem)))
                if "TypeScript" in memory_text:
                    found = True
                    print(f"✅ SUCCESS: Found memory containing 'TypeScript'")
                    print(f"   Memory: {memory_text}")
                    print()
                    print("✅ The MCP server → Mem0 integration functions are working!")
                    print("   These functions can be used in the MCP server implementation.")
                    return True
            
            if not found:
                print("❌ FAILURE: Memory was not found in results")
                print("   Check:")
                print("   - MEM0_API_KEY is correct")
                print("   - Wait longer for background processing")
                print("   - User ID matches between save and recall")
                return False
        else:
            print("⚠️  No results returned")
            print("   Memory may still be processing. Try waiting longer.")
            return False
            
    except Exception as e:
        print(f"❌ Error searching memory: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    try:
        success = asyncio.run(test_direct())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

