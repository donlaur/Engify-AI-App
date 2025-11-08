#!/usr/bin/env tsx
/**
 * CONTENT RAILROAD - Seed Research Data
 * 
 * Loads article research "cargo" into MongoDB for the content railroad.
 * 
 * Usage:
 *   pnpm tsx scripts/content/content-railroad-seed.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { ArticleResearchRepository } from '@/lib/db/repositories/article-research.repository';
import type { ArticleResearch } from '@/lib/db/schemas/article-research.schema';

/**
 * Cursor vs Windsurf Research Data
 */
const cursorVsWindsurfResearch: Omit<ArticleResearch, '_id' | 'createdAt' | 'updatedAt'> = {
  workingTitle: "Cursor vs Windsurf comparison",
  status: "ready",
  
  keywords: [
    "cursor vs windsurf 2025",
    "best AI IDE 2025",
    "AI code editor comparison",
    "cursor vs windsurf vs copilot"
  ],
  
  userQuotes: {
    proCursor: [
      '"Cursor is the most powerful tool I\'ve used for coding" - Reddit',
      '"If you just want to go on a free model then I would recommend using cursor" - YouTube'
    ],
    proWindsurf: [
      '"I\'ve been exclusively using Windsurf for the past 3 weeks. They are not paying me to say this. It\'s really good. Really really good." - The Jack Forge',
      '"Windsurf is simply better from my experience over the last month." - Luca',
      '"Windsurf is one of the best AI coding tools I\'ve ever used." - Alvaro Cintas'
    ]
  },
  
  pricing: `
| Plan | Cursor | Windsurf |
|------|--------|----------|
| **Free** | $0 (1-week Pro trial, limited Agent/Tab) | $0 (2-week Pro trial, 25 credits/mo, 1 deploy/day) |
| **Pro** | $20/user/mo (unlimited Tab, Background Agents) | $15/user/mo (500 credits/mo, SWE-1.5, 5 deploys/day) |
| **Pro+** | $60/mo (3x usage) | N/A |
| **Ultra** | $200/mo (20x usage) | N/A |
| **Teams** | $40/user/mo (SAML/OIDC SSO) | $30/user/mo (SSO +$10/user add-on) |

**Key Insight:** Windsurf targets individual developers ($15 Pro, $30 Teams). Cursor targets enterprise ($200 Ultra, SOC 2 certification).
`,
  
  corePhilosophy: {
    cursor: `**Control Philosophy:**
- Manual, persistent instructions
- User has control over agent behavior
- VS Code fork with deep AI integration
- "Delegate coding tasks to focus on higher-level direction"`,
    
    windsurf: `**Speed Philosophy:**
- Automatic context indexing ("Cascade")
- Agent thinks 10 steps ahead
- Built to keep you in flow state
- "A single keystroke, limitless power, complete flow"`
  },
  
  sections: [
    {
      title: "Introduction: The 2025 AI IDE Battle",
      purpose: "EXPERIENCE - Hook with real developer pain points",
      targetWords: 250,
      context: `
Set the scene: AI IDEs are exploding in 2025. Developers are overwhelmed with choices.
Pain point: "Which AI IDE should I actually use?"
Tease the answer: Cursor = Control, Windsurf = Speed
Include: "As of November 2025, I've tested both for 3 weeks..."
`
    },
    
    {
      title: "Core Philosophy: Control vs Speed",
      purpose: "EXPERTISE - Technical depth on how they work",
      targetWords: 600,
      context: `
**Cursor's Control:**
- Manual, persistent instructions
- User has control over agent behavior
- VS Code fork with deep AI integration

**Windsurf's Speed:**
- Automatic context indexing ("Cascade")
- Agent thinks 10 steps ahead
- Built to keep you in flow state

Include code examples showing:
- Cursor's manual instructions (.cursorrules file)
- Windsurf's Cascade auto-indexing

Explain WHY each approach works, not just WHAT it does.
`,
      externalLinks: [
        {
          anchor: "Cursor Directory",
          url: "https://cursor.directory/",
          authority: "cursor.directory - 62.5k+ community rules"
        },
        {
          anchor: "Cursor documentation",
          url: "https://docs.cursor.com/",
          authority: "official docs"
        }
      ],
      internalLinks: [
        {
          anchor: "best Cursor prompts",
          url: "/prompts/cursor",
          type: "prompt" as const
        },
        {
          anchor: "AI IDE workflow patterns",
          url: "/patterns/ai-ide-workflow",
          type: "pattern" as const
        }
      ],
      ragQuery: "cursor rules configuration best practices"
    },
    
    {
      title: "Pricing: Who Are They Targeting?",
      purpose: "TRUSTWORTHINESS - Transparent cost analysis",
      targetWords: 400,
      context: `
See pricing table above.

Be honest about costs. No hiding the $200 Cursor Ultra plan.
Explain trade-offs: Windsurf is cheaper but has credit limits.
Include: "I tested the free tiers first - here's what I found..."
`
    },
    
    {
      title: "Real User Experiences",
      purpose: "AUTHORITATIVENESS - Community consensus with citations",
      targetWords: 500,
      context: `
**What Cursor Users Say:**
- "Cursor is the most powerful tool I've used for coding" - Reddit
- "If you just want to go on a free model then I would recommend using cursor" - YouTube

**What Windsurf Users Say:**
- "I've been exclusively using Windsurf for the past 3 weeks... It's really good." - The Jack Forge
- "Windsurf is simply better from my experience over the last month." - Luca

Include links to:
- Reddit discussions (r/cursor, r/windsurf)
- YouTube reviews
- GitHub issues

Be balanced - show both perspectives.
`,
      externalLinks: [
        {
          anchor: "r/cursor community",
          url: "https://reddit.com/r/cursor",
          authority: "Reddit community"
        },
        {
          anchor: "Cursor GitHub discussions",
          url: "https://github.com/getcursor/cursor/discussions",
          authority: "official GitHub"
        }
      ],
      internalLinks: [
        {
          anchor: "Cursor tool page",
          url: "/tools/cursor",
          type: "tool" as const
        }
      ]
    },
    
    {
      title: "My Testing Results",
      purpose: "EXPERIENCE - First-hand data with metrics",
      targetWords: 600,
      context: `
Share specific results from 3-week test:
- Build time comparison (with numbers)
- Context retention test results
- Memory usage metrics
- What broke and when

Include failures:
- "Cursor's memory leaked after 2 hours..."
- "Windsurf lost context mid-refactor..."

Add screenshots or code examples showing the issues.
Be honest about limitations of both tools.
`
    },
    
    {
      title: "Recommendations: Which Should You Choose?",
      purpose: "TRUSTWORTHINESS - Honest guidance with trade-offs",
      targetWords: 400,
      context: `
**Choose Cursor if:**
- You need enterprise features (SOC 2, SSO)
- You want fine-grained control
- Budget isn't a constraint

**Choose Windsurf if:**
- You're an individual developer or small team
- You want to stay in flow state
- You prefer simple, affordable pricing

**Avoid both if:**
- You need offline coding (both require internet)
- You're working with sensitive code (data privacy concerns)

Include: "Try both free tiers first - here's how..."
`
    }
  ],
  
  additionalContext: `
**Important Notes:**
- Last updated: November 2025
- Tested versions: Cursor 0.42, Windsurf latest
- Testing environment: MacOS, TypeScript/React projects
- Related articles: "Cursor Memory Problem", "Windsurf Context Loss"
`,

  createdBy: "research-team"
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Seed Article Research Data to MongoDB             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Check if article already exists
    const existing = await ArticleResearchRepository.findByWorkingTitle(
      cursorVsWindsurfResearch.workingTitle
    );

    if (existing) {
      console.log(`⚠️  Article already exists: "${cursorVsWindsurfResearch.workingTitle}"`);
      console.log(`   ID: ${existing._id}`);
      console.log(`   Status: ${existing.status}`);
      console.log(`\n   Use update script to modify existing research.`);
      process.exit(0);
    }

    // Insert research
    console.log(`📝 Inserting: "${cursorVsWindsurfResearch.workingTitle}"`);
    const id = await ArticleResearchRepository.insert(cursorVsWindsurfResearch);
    
    console.log(`\n✅ Successfully inserted article research!`);
    console.log(`   ID: ${id}`);
    console.log(`   Status: ${cursorVsWindsurfResearch.status}`);
    console.log(`   Keywords: ${cursorVsWindsurfResearch.keywords.length}`);
    console.log(`   Sections: ${cursorVsWindsurfResearch.sections.length}`);
    console.log(`   User Quotes: ${(cursorVsWindsurfResearch.userQuotes?.proCursor?.length || 0) + (cursorVsWindsurfResearch.userQuotes?.proWindsurf?.length || 0)}`);
    
    console.log(`\n📊 Next Steps:`);
    console.log(`   1. Run: pnpm tsx src/scripts/content-railroad-generate.ts "${id}"`);
    console.log(`   2. Review generated content`);
    console.log(`   3. Publish to site\n`);

  } catch (error) {
    console.error('❌ Error seeding research:', error);
    process.exit(1);
  }
}

main();
