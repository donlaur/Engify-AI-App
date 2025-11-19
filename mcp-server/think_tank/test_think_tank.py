#!/usr/bin/env python3
"""
Test Script for Think Tank Multi-Agent Workflow
Tests the workflow with example scenarios and demonstrates memory integration
"""

import asyncio
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from workflow import app, store_decision

# Test scenarios
TEST_SCENARIOS = [
    {
        "name": "Database Migration Decision",
        "situation": "Should we migrate from MongoDB to PostgreSQL?",
        "context": "We have 50GB of data, 10 microservices, and our team knows MongoDB well. We're experiencing some query performance issues with complex joins.",
        "user_id": "test-user-donnie"
    },
    {
        "name": "AI Tool Adoption",
        "situation": "Should we adopt Cursor IDE for the entire engineering team?",
        "context": "Team of 20 engineers, mix of experience levels. Currently using VS Code. Budget is $40/user/month. Some team members are skeptical about AI tools.",
        "user_id": "test-user-donnie"
    },
    {
        "name": "Architecture Decision",
        "situation": "Should we build a microservices architecture or stick with monolith?",
        "context": "Startup with 5 engineers, growing fast. Current monolith is getting complex. Need to scale to 50+ engineers in next year.",
        "user_id": "test-user-donnie"
    }
]

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")

def print_agent_perspective(role: str, analysis: str):
    """Print an agent's perspective"""
    print(f"### {role}")
    print("-" * 80)
    print(analysis[:500] + ("..." if len(analysis) > 500 else ""))
    print()

async def test_think_tank_without_memory(scenario: dict):
    """Test Think Tank without memory (baseline)"""
    print_section(f"Test: {scenario['name']} (WITHOUT Memory)")
    
    initial_state = {
        "situation": scenario["situation"],
        "context": scenario["context"],
        "user_id": scenario["user_id"],
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
    
    print(f"Situation: {scenario['situation']}")
    print(f"Context: {scenario['context']}\n")
    print("Running Think Tank workflow...\n")
    
    try:
        result = await app.ainvoke(initial_state)
        
        print_section("Round 1: Initial Perspectives")
        if result.get('scrum_master_analysis'):
            print_agent_perspective("Scrum Master", result['scrum_master_analysis'])
        if result.get('product_manager_analysis'):
            print_agent_perspective("Product Manager", result['product_manager_analysis'])
        if result.get('vp_eng_analysis'):
            print_agent_perspective("VP of Engineering", result['vp_eng_analysis'])
        if result.get('tech_lead_analysis'):
            print_agent_perspective("Tech Lead", result['tech_lead_analysis'])
        if result.get('architect_analysis'):
            print_agent_perspective("Architect", result['architect_analysis'])
        
        print_section("Challenges & Refinements")
        for challenge in result.get('challenges', []):
            print(f"**{challenge.get('role', 'Unknown')}**: {challenge.get('challenge', '')[:300]}\n")
        
        print_section("Consensus & Final Recommendation")
        print("Agreements:")
        for agreement in result.get('agreements', []):
            print(f"  ✅ {agreement}")
        
        print("\nConcerns:")
        for concern in result.get('concerns', []):
            print(f"  ⚠️  {concern}")
        
        print("\nBlockers:")
        for blocker in result.get('blockers', []):
            print(f"  ❌ {blocker}")
        
        print(f"\n📋 Final Recommendation:")
        print(result.get('final_recommendation', 'No recommendation generated'))
        
        print(f"\n📊 Stats:")
        print(f"  - Rounds: {result.get('round_count', 0)}")
        print(f"  - Consensus Reached: {result.get('consensus_reached', False)}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

async def test_think_tank_with_memory(scenario: dict):
    """Test Think Tank WITH memory (enhanced)"""
    print_section(f"Test: {scenario['name']} (WITH Memory)")
    
    # First, seed some relevant memories
    from mem0 import MemoryClient
    
    api_key = os.getenv('MEM0_API_KEY')
    if not api_key:
        print("⚠️  MEM0_API_KEY not set - skipping memory test")
        return None
    
    client = MemoryClient(api_key=api_key)
    user_id = scenario['user_id']
    
    # Seed memories that might be relevant
    print("📝 Seeding relevant memories...\n")
    
    memories_to_add = [
        "User prefers TypeScript over JavaScript for new projects",
        "User's team has experience with MongoDB and prefers it for document-based data",
        "User values team expertise and learning curve when making technology decisions",
        "User prefers gradual migrations over big-bang changes",
        "User's organization values cost-effectiveness and ROI in technology decisions",
    ]
    
    for memory_text in memories_to_add:
        try:
            client.add(
                messages=[{"role": "user", "content": memory_text}],
                user_id=user_id
            )
            print(f"  ✅ Stored: {memory_text}")
        except Exception as e:
            print(f"  ⚠️  Failed to store: {memory_text} - {e}")
    
    print("\n⏳ Waiting for memory processing (10s)...")
    await asyncio.sleep(10)  # Wait for background processing
    
    # Now run the same test
    initial_state = {
        "situation": scenario["situation"],
        "context": scenario["context"],
        "user_id": user_id,
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
    
    print(f"\nSituation: {scenario['situation']}")
    print(f"Context: {scenario['context']}\n")
    print("Running Think Tank workflow WITH memory...\n")
    
    try:
        result = await app.ainvoke(initial_state)
        
        # Show how memory influenced the discussion
        print_section("Memory-Influenced Perspectives")
        print("💡 Note: Agents now have access to past decisions and preferences\n")
        
        if result.get('scrum_master_analysis'):
            print_agent_perspective("Scrum Master", result['scrum_master_analysis'])
        if result.get('product_manager_analysis'):
            print_agent_perspective("Product Manager", result['product_manager_analysis'])
        if result.get('vp_eng_analysis'):
            print_agent_perspective("VP of Engineering", result['vp_eng_analysis'])
        if result.get('tech_lead_analysis'):
            print_agent_perspective("Tech Lead", result['tech_lead_analysis'])
        if result.get('architect_analysis'):
            print_agent_perspective("Architect", result['architect_analysis'])
        
        print_section("Final Recommendation (Memory-Enhanced)")
        print(result.get('final_recommendation', 'No recommendation generated'))
        
        # Store the decision for future reference
        print("\n💾 Storing decision in memory...")
        await store_decision(result)
        print("  ✅ Decision stored for future reference")
        
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None

async def compare_with_and_without_memory(scenario: dict):
    """Compare results with and without memory"""
    print_section(f"COMPARISON: {scenario['name']}")
    
    print("=" * 80)
    print("TEST 1: WITHOUT Memory (Baseline)")
    print("=" * 80)
    result_without = await test_think_tank_without_memory(scenario)
    
    print("\n\n")
    
    print("=" * 80)
    print("TEST 2: WITH Memory (Enhanced)")
    print("=" * 80)
    result_with = await test_think_tank_with_memory(scenario)
    
    if result_without and result_with:
        print_section("Key Differences")
        print("🔍 Compare the recommendations above to see how memory influences:")
        print("  - More personalized recommendations")
        print("  - References to past decisions")
        print("  - Consideration of user preferences")
        print("  - Consistency with previous choices")

async def main():
    """Run all tests"""
    print_section("Think Tank Multi-Agent Test Suite")
    
    if len(sys.argv) > 1:
        # Run specific scenario
        scenario_num = int(sys.argv[1]) - 1
        if 0 <= scenario_num < len(TEST_SCENARIOS):
            scenario = TEST_SCENARIOS[scenario_num]
            await compare_with_and_without_memory(scenario)
        else:
            print(f"❌ Invalid scenario number. Choose 1-{len(TEST_SCENARIOS)}")
    else:
        # Run first scenario as example
        print("Running first scenario as example...")
        print("Usage: python test_think_tank.py [scenario_number]")
        print(f"Available scenarios: 1-{len(TEST_SCENARIOS)}\n")
        
        scenario = TEST_SCENARIOS[0]
        await compare_with_and_without_memory(scenario)

if __name__ == "__main__":
    asyncio.run(main())

