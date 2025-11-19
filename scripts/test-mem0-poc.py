#!/usr/bin/env python3
"""
Mem0 Proof of Concept Test
==========================

Comprehensive test to prove Mem0 works for agent memory use cases.
Tests multiple scenarios relevant to MCP server integration.

Usage:
    python scripts/test-mem0-poc.py
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


def test_scenario(name: str, user_id: str, messages: list, query: str, expected_content: str):
    """Test a specific memory scenario"""
    print(f"\n{'='*60}")
    print(f"Scenario: {name}")
    print(f"{'='*60}")
    
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        print("❌ MEM0_API_KEY not found")
        return False
    
    client = MemoryClient(api_key=api_key)
    
    # Store memory
    try:
        result = client.add(messages=messages, user_id=user_id)
        print(f"✅ Memory stored")
        print(f"   User ID: {user_id}")
        print(f"   Messages: {len(messages)}")
        if result:
            status = result.get('results', [{}])[0].get('status', 'UNKNOWN')
            print(f"   Status: {status}")
    except Exception as e:
        print(f"❌ Failed to store: {e}")
        return False
    
    # Wait for processing (Mem0 processes memories in background)
    print("   Waiting for background processing...")
    time.sleep(5)  # Increased wait time for background processing
    
    # Search memory
    try:
        results = client.search(query=query, filters={"user_id": user_id})
        if results and results.get('results'):
            found_memory = results['results'][0].get('memory', '')
            if expected_content.lower() in found_memory.lower():
                print(f"✅ Search successful - found expected content")
                print(f"   Found: {found_memory[:100]}...")
                return True
            else:
                print(f"⚠️  Found memory but content doesn't match")
                print(f"   Expected: {expected_content}")
                print(f"   Found: {found_memory}")
                return False
        else:
            print(f"❌ No results found")
            return False
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return False


def main():
    """Run all proof-of-concept tests"""
    print("="*60)
    print("Mem0 Proof of Concept - Agent Memory Testing")
    print("="*60)
    print()
    
    results = []
    
    # Test 1: Basic workflow preference
    results.append(test_scenario(
        name="Workflow Preferences",
        user_id="test-user-123",
        messages=[
            {"role": "user", "content": "I prefer PBVR workflows for code reviews"}
        ],
        query="What workflows does the user prefer?",
        expected_content="PBVR"
    ))
    
    # Test 2: Multiple memories for same user
    results.append(test_scenario(
        name="Multiple Memories - Same User",
        user_id="test-user-123",
        messages=[
            {"role": "user", "content": "I use TypeScript for all new projects"},
            {"role": "assistant", "content": "Noted, I'll remember your preference for TypeScript"}
        ],
        query="What programming language does the user prefer?",
        expected_content="TypeScript"
    ))
    
    # Test 3: User isolation (different user)
    results.append(test_scenario(
        name="User Isolation - Different User",
        user_id="test-user-456",
        messages=[
            {"role": "user", "content": "I prefer Python over TypeScript"}
        ],
        query="What programming language does this user prefer?",
        expected_content="Python"
    ))
    
    # Test 4: Guardrails/constraints
    results.append(test_scenario(
        name="Guardrails and Constraints",
        user_id="test-user-123",
        messages=[
            {"role": "user", "content": "Never use console.log in production code"},
            {"role": "assistant", "content": "Understood, I'll avoid console.log in production"}
        ],
        query="What coding constraints should be followed?",
        expected_content="console.log"
    ))
    
    # Test 5: Complex workflow context
    results.append(test_scenario(
        name="Complex Workflow Context",
        user_id="test-user-123",
        messages=[
            {"role": "user", "content": "For pull requests, always run tests before merging and require at least one approval"},
            {"role": "assistant", "content": "I'll ensure tests pass and approvals are obtained before merging PRs"}
        ],
        query="What are the requirements for pull requests?",
        expected_content="tests"
    ))
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print(f"\n🎉 ALL TESTS PASSED - Mem0 is working correctly!")
        print(f"   Ready for MCP server integration")
        return True
    else:
        print(f"\n⚠️  Some tests failed - review results above")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

