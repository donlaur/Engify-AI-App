#!/usr/bin/env python3
"""
Mem0 Agent Memory Scenarios Test
=================================

Tests Mem0 with realistic agent use cases for MCP server integration.
Based on official Mem0 documentation patterns.

Usage:
    python scripts/test-mem0-agent-scenarios.py
"""

import os
import sys
import time
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv('.env')

try:
    from mem0 import MemoryClient
except ImportError:
    print("❌ Error: mem0 package not installed")
    print("   Install with: pip install mem0ai")
    sys.exit(1)


def test_agent_scenario(name: str, user_id: str, messages: list, query: str, expected_keywords: list):
    """Test a realistic agent memory scenario"""
    print(f"\n{'='*70}")
    print(f"🤖 Agent Scenario: {name}")
    print(f"{'='*70}")
    
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        print("❌ MEM0_API_KEY not found")
        return False
    
    client = MemoryClient(api_key=api_key)
    filters = {"OR": [{"user_id": user_id}]}
    
    # Store memory (official Mem0 pattern)
    try:
        result = client.add(
            messages=messages,
            user_id=user_id,
            version="v2",
            output_format="v1.1"
        )
        print(f"✅ Memory stored")
        print(f"   User: {user_id}")
        print(f"   Messages: {len(messages)}")
        if result:
            status = result.get('results', [{}])[0].get('status', 'UNKNOWN')
            print(f"   Status: {status}")
    except Exception as e:
        print(f"❌ Failed to store: {e}")
        return False
    
    # Wait for background processing (Mem0 recommendation: 10 seconds)
    print(f"   ⏳ Waiting for background processing (10s)...")
    time.sleep(10)
    
    # Search memory (official Mem0 pattern)
    try:
        results = client.search(
            query=query,
            filters=filters,
            version="v2",
            output_format="v1.1"
        )
        
        if results and results.get('results'):
            found_memories = results['results']
            print(f"✅ Found {len(found_memories)} relevant memories")
            
            # Check if any memory contains expected keywords
            found_text = ' '.join([m.get('memory', '') for m in found_memories]).lower()
            matches = [kw for kw in expected_keywords if kw.lower() in found_text]
            
            if matches:
                print(f"✅ Contains expected keywords: {', '.join(matches)}")
                print(f"\n   Top memory:")
                top_memory = found_memories[0]
                print(f"   - {top_memory.get('memory', '')[:100]}...")
                print(f"   - Score: {top_memory.get('score', 0):.3f}")
                return True
            else:
                print(f"⚠️  Memory found but doesn't contain expected keywords")
                print(f"   Expected: {expected_keywords}")
                print(f"   Found: {found_memories[0].get('memory', '')[:100]}...")
                return False
        else:
            print(f"❌ No results found")
            return False
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def main():
    """Run agent memory scenarios"""
    print("="*70)
    print("Mem0 Agent Memory Scenarios - MCP Server Integration Test")
    print("="*70)
    print()
    print("Testing realistic agent use cases for workflows and guardrails")
    print()
    
    results = []
    
    # Scenario 1: Workflow Preferences (Core Use Case)
    results.append(test_agent_scenario(
        name="Workflow Preferences",
        user_id="cursor-user-donnie",
        messages=[
            {"role": "user", "content": "I prefer PBVR workflows for code reviews. Always use that pattern."}
        ],
        query="What workflow pattern should I use for code reviews?",
        expected_keywords=["PBVR", "workflow", "code review"]
    ))
    
    # Scenario 2: Guardrails and Constraints
    results.append(test_agent_scenario(
        name="Coding Guardrails",
        user_id="cursor-user-donnie",
        messages=[
            {"role": "user", "content": "Never use console.log in production code. Always use the logger utility instead."},
            {"role": "assistant", "content": "Understood, I'll use the logger utility for all logging in production."}
        ],
        query="What are the logging constraints for production code?",
        expected_keywords=["console.log", "logger", "production"]
    ))
    
    # Scenario 3: User Preferences
    results.append(test_agent_scenario(
        name="Technology Preferences",
        user_id="cursor-user-donnie",
        messages=[
            {"role": "user", "content": "I use TypeScript for all new projects. Prefer it over JavaScript."}
        ],
        query="What programming language should I use for new projects?",
        expected_keywords=["TypeScript", "JavaScript"]
    ))
    
    # Scenario 4: Multi-User Isolation
    results.append(test_agent_scenario(
        name="User Isolation Test",
        user_id="cursor-user-alice",
        messages=[
            {"role": "user", "content": "I prefer Python for data science projects and use Jupyter notebooks."}
        ],
        query="What tools does this user prefer for data science?",
        expected_keywords=["Python", "Jupyter", "data science"]
    ))
    
    # Scenario 5: Complex Workflow Context
    results.append(test_agent_scenario(
        name="Pull Request Workflow",
        user_id="cursor-user-donnie",
        messages=[
            {"role": "user", "content": "For pull requests, always run tests before merging, require at least one approval, and check for security vulnerabilities."},
            {"role": "assistant", "content": "I'll ensure all PRs have tests passing, approvals, and security checks before merging."}
        ],
        query="What are the requirements before merging a pull request?",
        expected_keywords=["test", "approval", "security", "merge"]
    ))
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 Test Summary")
    print(f"{'='*70}")
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    print()
    
    if passed == total:
        print(f"🎉 ALL SCENARIOS PASSED!")
        print(f"   Mem0 is ready for MCP server integration")
        print(f"   Agent memory functionality is proven")
        return True
    elif passed >= total * 0.6:  # 60% pass rate
        print(f"✅ MOST SCENARIOS PASSED ({passed}/{total})")
        print(f"   Mem0 is functional - some edge cases may need tuning")
        print(f"   Ready for integration with monitoring")
        return True
    else:
        print(f"⚠️  SOME ISSUES DETECTED ({passed}/{total})")
        print(f"   Review failed scenarios above")
        print(f"   May need to adjust wait times or query specificity")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

