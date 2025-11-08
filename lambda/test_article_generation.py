#!/usr/bin/env python3
"""
Test script for SEO article generation
Generates a single article from Gemini research data

Usage:
    python lambda/test_article_generation.py

Requirements:
    - OPENAI_API_KEY environment variable
    - ANTHROPIC_API_KEY environment variable
"""

import asyncio
import json
import os
from pathlib import Path
from agents.article_generation import app, ArticleState
from lib.ai_slop_detector import detect_ai_slop, print_detection_report

# Sample research data for "Cursor vs Windsurf" article
SAMPLE_RESEARCH = {
    "article_type": "comparison",
    "title": "Cursor vs Windsurf: Speed vs Control (2025)",
    "target_keywords": [
        "cursor vs windsurf",
        "best AI IDE 2025",
        "AI code editor comparison",
        "cursor vs windsurf vs copilot"
    ],
    "research_data": {
        "TechnicalWriter": {
            "core_philosophy_comparison": {
                "cursor": {
                    "philosophy": "Control",
                    "description": "Manual, persistent instructions. User has control over agent behavior.",
                    "positioning": "Delegate coding tasks to focus on higher-level direction"
                },
                "windsurf": {
                    "philosophy": "Speed",
                    "description": "Automatic context indexing (Cascade). Agent thinks 10 steps ahead.",
                    "positioning": "Built to keep you in flow state"
                }
            }
        },
        "CommunityManager": {
            "user_quotes_comparison": [
                {
                    "sentiment": "Pro-Windsurf (General Quality)",
                    "quote": "I've been exclusively using Windsurf for the past 3 weeks. They are not paying me to say this. It's really good. Really really good.",
                    "user": "The Jack Forge",
                    "source": "Reddit"
                },
                {
                    "sentiment": "Pro-Cursor (Free Tier)",
                    "quote": "if you just want to go on a free model then I would recommend using cursor because this is very very limited unless you are paying",
                    "user": "Unnamed YouTuber",
                    "source": "YouTube"
                }
            ]
        },
        "ProductMarketer": {
            "pricing_and_value_benchmark": {
                "free_tier": {
                    "tool": "Cursor (Hobby Plan)",
                    "price_monthly": "$0",
                    "details": "Includes a one-week Pro trial, limited Agent requests, and limited Tab completions."
                },
                "free_tier_comparison": {
                    "tool": "Windsurf (Free Plan)",
                    "price_monthly": "$0",
                    "details": "Includes a 2-week Pro trial, 25 prompt credits/month, and 1 App Deploy / day."
                },
                "pro_tier": {
                    "tool": "Cursor (Pro Plan)",
                    "price_monthly": "$20/user/month",
                    "details": "Includes unlimited Tab completions, Background Agents, and maximum context windows."
                },
                "pro_tier_comparison": {
                    "tool": "Windsurf (Pro Plan)",
                    "price_monthly": "$15/user/month",
                    "details": "Includes 500 prompt credits/month, SWE-1.5 model access, and 5 App Deploys / day."
                }
            }
        }
    }
}

async def generate_article():
    """Generate a single SEO article from research data"""
    
    print("🚀 Starting SEO Article Generation")
    print("=" * 60)
    
    # Check for API keys
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY not found in environment")
        return
    
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("❌ Error: ANTHROPIC_API_KEY not found in environment")
        return
    
    print(f"📝 Article: {SAMPLE_RESEARCH['title']}")
    print(f"🎯 Keywords: {', '.join(SAMPLE_RESEARCH['target_keywords'])}")
    print(f"📊 Type: {SAMPLE_RESEARCH['article_type']}")
    print()
    
    # Prepare state
    initial_state: ArticleState = {
        "research_data": json.dumps(SAMPLE_RESEARCH['research_data'], indent=2),
        "target_keywords": SAMPLE_RESEARCH['target_keywords'],
        "article_type": SAMPLE_RESEARCH['article_type'],
        "article_title": SAMPLE_RESEARCH['title'],
        "article_structure": "",
        "technical_content": "",
        "community_content": "",
        "product_content": "",
        "seo_content": "",
        "final_article": "",
        "turn_count": 0,
        "max_turns": 6,
    }
    
    print("🤖 Running 5-agent pipeline:")
    print("   1. Technical Writer (GPT-4o)")
    print("   2. Developer Advocate (GPT-4o)")
    print("   3. Community Manager (Claude Sonnet)")
    print("   4. Product Marketer (GPT-4o-mini)")
    print("   5. SEO Specialist (GPT-4o-mini)")
    print("   6. Assembler (GPT-4o)")
    print()
    
    try:
        # Run the pipeline
        result = await app.ainvoke(initial_state)
        
        print("✅ Article generation complete!")
        print()
        
        # Save the article
        output_dir = Path(__file__).parent.parent / "output" / "articles"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / "cursor-vs-windsurf-2025.md"
        output_file.write_text(result['final_article'])
        
        print(f"💾 Saved to: {output_file}")
        print()
        
        # Run AI slop detection
        print("🔍 Running AI slop detection...")
        detection = detect_ai_slop(result['final_article'])
        print_detection_report(detection)
        
        # Print preview
        print("📄 Article Preview:")
        print("=" * 60)
        lines = result['final_article'].split('\n')
        preview_lines = lines[:50]  # First 50 lines
        print('\n'.join(preview_lines))
        if len(lines) > 50:
            print(f"\n... ({len(lines) - 50} more lines)")
        print()
        
        # Print stats
        word_count = len(result['final_article'].split())
        char_count = len(result['final_article'])
        print("📊 Article Stats:")
        print(f"   Words: {word_count:,}")
        print(f"   Characters: {char_count:,}")
        print(f"   Lines: {len(lines):,}")
        print()
        
        # Final verdict
        if detection['quality_score'] >= 8:
            print("🎉 Success! Article passed quality check and ready for review.")
        elif detection['quality_score'] >= 6:
            print("⚠️  Article generated but needs manual review/editing.")
        else:
            print("❌ Article quality too low. Consider regenerating with stricter prompts.")
        
    except Exception as e:
        print(f"❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(generate_article())
