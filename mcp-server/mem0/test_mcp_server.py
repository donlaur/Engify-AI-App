#!/usr/bin/env python3
"""
Test Mem0 MCP Server
Tests the MCP server's save_memory and recall_memory tools independently of Cursor
"""

import asyncio
import json
import subprocess
import sys
import time
from typing import Any, Dict

try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
except ImportError:
    print("❌ Error: mcp package not installed")
    print("   Install with: pip install mcp")
    sys.exit(1)


async def test_mcp_server():
    """Test the MCP server with save_memory and recall_memory"""
    print("=" * 70)
    print("Mem0 MCP Server Test")
    print("=" * 70)
    print()
    
    # Server parameters - run the MCP server as a subprocess
    server_params = StdioServerParameters(
        command="python3",
        args=["mcp-server/mem0/mcp_server.py"],
        env=None
    )
    
    print("Starting MCP server...")
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the session
            await session.initialize()
            
            print("✅ MCP server connected")
            print()
            
            # Test 1: Save Memory
            print("-" * 70)
            print("Test 1: Save Memory")
            print("-" * 70)
            
            save_result = await session.call_tool(
                "save_memory",
                arguments={
                    "text": "My favorite language is TypeScript",
                    "user_id": "donnie-test"
                }
            )
            
            print("Result:")
            for content in save_result.content:
                if hasattr(content, 'text'):
                    print(content.text)
                else:
                    print(content)
            print()
            
            # Wait for Mem0 to process (background queue)
            print("⏳ Waiting 10 seconds for Mem0 to process memory...")
            time.sleep(10)
            print()
            
            # Test 2: Recall Memory
            print("-" * 70)
            print("Test 2: Recall Memory")
            print("-" * 70)
            
            recall_result = await session.call_tool(
                "recall_memory",
                arguments={
                    "query": "What is my favorite language?",
                    "user_id": "donnie-test"
                }
            )
            
            print("Result:")
            for content in recall_result.content:
                if hasattr(content, 'text'):
                    print(content.text)
                else:
                    print(content)
            print()
            
            # Verify the result
            print("-" * 70)
            print("Verification")
            print("-" * 70)
            
            found = False
            for content in recall_result.content:
                text = content.text if hasattr(content, 'text') else str(content)
                if "TypeScript" in text:
                    found = True
                    break
            
            if found:
                print("✅ SUCCESS: Memory was saved and retrieved correctly!")
                print("   The MCP server → Mem0 integration is working.")
            else:
                print("❌ FAILURE: Memory was not found in results")
                print("   Check:")
                print("   - MEM0_API_KEY is correct")
                print("   - Mem0 service is accessible")
                print("   - User ID matches between save and recall")
                print("   - Wait longer for background processing")
            
            print()
            print("=" * 70)
            print("Test Complete")
            print("=" * 70)


if __name__ == "__main__":
    try:
        asyncio.run(test_mcp_server())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

