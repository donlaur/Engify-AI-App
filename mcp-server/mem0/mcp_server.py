#!/usr/bin/env python3
"""
Mem0 MCP Server
Simple MCP server to test Mem0 read/write functionality
"""

import asyncio
import os
import sys
from typing import Any, Sequence
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent
except ImportError:
    print("❌ Error: mcp package not installed")
    print("   Install with: pip install mcp")
    sys.exit(1)

try:
    from mem0 import MemoryClient
except ImportError:
    print("❌ Error: mem0 package not installed")
    print("   Install with: pip install mem0ai")
    sys.exit(1)

# Initialize Mem0 client
api_key = os.getenv('MEM0_API_KEY')
if not api_key:
    print("❌ Error: MEM0_API_KEY not found in environment")
    sys.exit(1)

mem0_client = MemoryClient(api_key=api_key)

# Create MCP server
server = Server("mem0-mcp-server")

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="save_memory",
            description="Save a memory to Mem0. Takes text content and optional user_id.",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The text content to save as a memory"
                    },
                    "user_id": {
                        "type": "string",
                        "description": "The user ID to associate with this memory (defaults to 'default-user')",
                        "default": "default-user"
                    }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="recall_memory",
            description="Search and retrieve memories from Mem0. Takes a query and optional user_id.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find relevant memories"
                    },
                    "user_id": {
                        "type": "string",
                        "description": "The user ID to filter memories (defaults to 'default-user')",
                        "default": "default-user"
                    }
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> Sequence[TextContent]:
    """Handle tool calls"""
    
    if name == "save_memory":
        text = arguments.get("text")
        user_id = arguments.get("user_id", "default-user")
        
        if not text:
            return [TextContent(
                type="text",
                text=f"❌ Error: 'text' parameter is required"
            )]
        
        try:
            # Mem0 API requires messages format
            messages = [
                {"role": "user", "content": text}
            ]
            result = mem0_client.add(
                messages=messages,
                user_id=user_id,
                version="v2",
                output_format="v1.1"
            )
            
            return [TextContent(
                type="text",
                text=f"✅ Memory saved successfully\nUser ID: {user_id}\nMemory: {text}\nResult: {result}"
            )]
        except Exception as e:
            return [TextContent(
                type="text",
                text=f"❌ Error saving memory: {str(e)}"
            )]
    
    elif name == "recall_memory":
        query = arguments.get("query")
        user_id = arguments.get("user_id", "default-user")
        
        if not query:
            return [TextContent(
                type="text",
                text=f"❌ Error: 'query' parameter is required"
            )]
        
        try:
            # Mem0 API requires filters in OR format
            filters = {
                "OR": [
                    {"user_id": user_id}
                ]
            }
            results = mem0_client.search(
                query=query,
                filters=filters,
                version="v2",
                output_format="v1.1"
            )
            
            # Format results
            if results and results.get("results"):
                memories = results["results"]
                formatted = f"✅ Found {len(memories)} memory/memories:\n\n"
                for i, mem in enumerate(memories, 1):
                    memory_text = mem.get("memory", mem.get("content", str(mem)))
                    score = mem.get("score", 0)
                    formatted += f"{i}. {memory_text} (score: {score:.3f})\n"
                return [TextContent(type="text", text=formatted)]
            else:
                return [TextContent(
                    type="text",
                    text=f"⚠️  No memories found for query: '{query}' (user_id: {user_id})"
                )]
        except Exception as e:
            return [TextContent(
                type="text",
                text=f"❌ Error searching memory: {str(e)}"
            )]
    
    else:
        return [TextContent(
            type="text",
            text=f"❌ Unknown tool: {name}"
        )]

async def main():
    """Run the MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())

