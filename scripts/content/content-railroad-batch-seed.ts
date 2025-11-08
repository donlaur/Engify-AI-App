#!/usr/bin/env tsx
/**
 * CONTENT RAILROAD - Batch Seed Multiple Articles
 * 
 * Seeds all article research from Gemini research into MongoDB
 * 
 * Usage:
 *   pnpm tsx scripts/content/content-railroad-batch-seed.ts
 *   pnpm tsx scripts/content/content-railroad-batch-seed.ts --force  # Delete existing first
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { ArticleResearchRepository } from '@/lib/db/repositories/article-research.repository';
import type { ArticleResearch } from '@/lib/db/schemas/article-research.schema';

const ARTICLES: Omit<ArticleResearch, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // Article 1: Cursor vs Windsurf
  {
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
| **Free** | $0 (1-week Pro trial) | $0 (2-week Pro trial, 25 credits/mo) |
| **Pro** | $20/user/mo | $15/user/mo (500 credits/mo) |
| **Ultra** | $200/mo (20x usage) | N/A |
| **Teams** | $40/user/mo (SSO) | $30/user/mo (SSO) |

**CRITICAL HIDDEN COST (Cursor):**
Power users report running out of tokens even on paid plans. Many spend $100-300/month BEYOND the subscription due to token overages. The "$20/month" is misleading - actual cost for heavy users can be $200-500/month.

**Key Insight:** Windsurf targets individual developers ($15 flat). Cursor targets enterprise ($200 Ultra, SOC 2) but has hidden overage costs.
`,
    corePhilosophy: {
      cursor: "Control - Manual instructions, user control, VS Code fork",
      windsurf: "Speed - Automatic context (Cascade), thinks 10 steps ahead, flow state"
    },
    sections: [
      {
        title: "Introduction: The 2025 AI IDE Battle",
        purpose: "EXPERIENCE - Hook with real developer pain points",
        targetWords: 250,
        context: "AI IDEs exploding in 2025. Developers overwhelmed. Cursor = Control, Windsurf = Speed. 'I tested both for 3 weeks...'"
      },
      {
        title: "Core Philosophy: Control vs Speed",
        purpose: "EXPERTISE - Technical depth",
        targetWords: 600,
        context: "Cursor: .cursorrules, manual control. Windsurf: Cascade auto-indexing. Code examples. Explain WHY.",
        externalLinks: [
          { anchor: "Cursor Directory", url: "https://cursor.directory/", authority: "62.5k+ community" },
          { anchor: "Cursor docs", url: "https://docs.cursor.com/", authority: "official" }
        ],
        internalLinks: [
          { anchor: "best Cursor prompts", url: "/prompts/cursor", type: "prompt" },
          { anchor: "AI IDE patterns", url: "/patterns/ai-ide-workflow", type: "pattern" }
        ]
      },
      {
        title: "Pricing: Who Are They Targeting?",
        purpose: "TRUSTWORTHINESS - Transparent costs",
        targetWords: 400,
        context: "Honest about $200 Cursor Ultra. CRITICAL: Cursor has hidden token overage costs - power users spend $200-500/month beyond subscription. '$20/month' is misleading. Windsurf is flat $15/month. 'I tested free tiers and hit limits fast...'"
      },
      {
        title: "Real User Experiences",
        purpose: "AUTHORITATIVENESS - Community consensus",
        targetWords: 500,
        context: "Pro-Cursor and Pro-Windsurf quotes. Balanced perspectives.",
        externalLinks: [
          { anchor: "r/cursor", url: "https://reddit.com/r/cursor", authority: "Reddit" },
          { anchor: "Cursor GitHub", url: "https://github.com/getcursor/cursor/discussions", authority: "official" }
        ],
        internalLinks: [
          { anchor: "Cursor tool page", url: "/tools/cursor", type: "tool" }
        ]
      },
      {
        title: "My Testing Results",
        purpose: "EXPERIENCE - First-hand data",
        targetWords: 600,
        context: "3-week test. Build times, context retention, memory usage. Include failures. Screenshots."
      },
      {
        title: "Recommendations: Which Should You Choose?",
        purpose: "TRUSTWORTHINESS - Honest guidance",
        targetWords: 400,
        context: "Choose Cursor if: enterprise, control, budget. Choose Windsurf if: individual, flow, affordable. Avoid both if: offline, sensitive code."
      }
    ],
    additionalContext: "Last updated: November 2025. Tested: Cursor 0.42, Windsurf latest. MacOS, TypeScript/React.",
    createdBy: "gemini-research"
  },

  // Article 2: Cursor Memory Problem
  {
    workingTitle: "Cursor memory leak problem",
    status: "ready",
    keywords: [
      "cursor ai memory leak",
      "cursor ai keeps freezing",
      "cursor consuming massive RAM",
      "cursor ai endless loop",
      "fix cursor ai crash"
    ],
    sections: [
      {
        title: "Introduction: The Productivity Killer",
        purpose: "EXPERIENCE - Real user pain",
        targetWords: 250,
        context: "'64GB RAM drained in an hour.' System freezes. Hard reboots. This is destroying productivity."
      },
      {
        title: "The Three Core Problems",
        purpose: "EXPERTISE - Technical analysis",
        targetWords: 800,
        context: "1) System memory leaks (60GB+). 2) Agent context loops. 3) Destructive overwrites. Real quotes, technical details.",
        externalLinks: [
          { anchor: "GitHub Issue #1294", url: "https://github.com/getcursor/cursor/issues/1294", authority: "official" },
          { anchor: "Forum thread", url: "https://forum.cursor.com/t/17171", authority: "community" }
        ]
      },
      {
        title: "Root Cause: Control is the Crash",
        purpose: "EXPERTISE - Deep analysis",
        targetWords: 400,
        context: "VS Code fork + Electron + unlimited context = perfect storm. Architecture analysis."
      },
      {
        title: "Community Solutions That Work",
        purpose: "AUTHORITATIVENESS - Proven fixes",
        targetWords: 1000,
        context: "1) Summary.md workaround. 2) .cursorignore. 3) Proactive prompting. 4) Git workflow. 5) Cache clear. Code examples.",
        externalLinks: [
          { anchor: "Cursor Directory", url: "https://cursor.directory/", authority: "community rules" }
        ],
        internalLinks: [
          { anchor: "Cursor prompts", url: "/prompts/cursor", type: "prompt" }
        ]
      },
      {
        title: "Prevention & Best Practices",
        purpose: "TRUSTWORTHINESS - Honest guidance",
        targetWords: 400,
        context: "Trade-offs. Limitations. When to use Cursor vs alternatives. Defensive workflows."
      }
    ],
    additionalContext: "Based on forum threads, GitHub issues, Reddit discussions. November 2025.",
    createdBy: "gemini-research"
  },

  // Article 3: Windsurf Context Loss
  {
    workingTitle: "Windsurf context loss problem",
    status: "ready",
    keywords: [
      "windsurf ai context loss",
      "windsurf ai forgets task",
      "windsurf cascade errors",
      "windsurf accidental code removal",
      "fix windsurf context"
    ],
    sections: [
      {
        title: "Introduction: The Flow State Killer",
        purpose: "EXPERIENCE - Real frustration",
        targetWords: 250,
        context: "'Forgets whole conversation.' Endless loops. Accidental deletions. This breaks flow state."
      },
      {
        title: "The Three Core Problems",
        purpose: "EXPERTISE - Technical analysis",
        targetWords: 800,
        context: "1) Mid-task amnesia. 2) Accidental code removal (vandalism). 3) Perceived quality degradation. Real quotes.",
        externalLinks: [
          { anchor: "r/windsurf", url: "https://reddit.com/r/windsurf", authority: "Reddit" },
          { anchor: "r/Codeium", url: "https://reddit.com/r/Codeium", authority: "Reddit" }
        ]
      },
      {
        title: "Critical Insight: It's the Model, Not the Tool",
        purpose: "EXPERTISE - Nuanced analysis",
        targetWords: 500,
        context: "Contradictory evidence. Wave-12 + GPT-5 = no context loss. Claude 3.5 > Gemini. Model-dependent problem."
      },
      {
        title: "Root Cause: Speed is the Danger",
        purpose: "EXPERTISE - Deep analysis",
        targetWords: 400,
        context: "Autonomous agent + context loss = destruction. Un-permissioned changes. Lock files as reactive fix."
      },
      {
        title: "Solutions That Actually Work",
        purpose: "AUTHORITATIVENESS - Proven fixes",
        targetWords: 900,
        context: "1) Manual @-mentions. 2) Code hygiene. 3) Lock files (critical). 4) Model selection. Examples.",
        externalLinks: [
          { anchor: "Windsurf docs", url: "https://docs.windsurf.com/", authority: "official" }
        ],
        internalLinks: [
          { anchor: "Windsurf tool page", url: "/tools/windsurf", type: "tool" }
        ]
      },
      {
        title: "Prevention & Best Practices",
        purpose: "TRUSTWORTHINESS - Honest guidance",
        targetWords: 400,
        context: "When to use Windsurf. Model recommendations. Defensive workflows. Trade-offs."
      }
    ],
    additionalContext: "Based on Reddit, official docs, community feedback. November 2025.",
    createdBy: "gemini-research"
  }
];

async function main() {
  const force = process.argv.includes('--force');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     CONTENT RAILROAD - Batch Seed Article Research        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📦 Seeding ${ARTICLES.length} articles from Gemini research\n`);

  let seeded = 0;
  let skipped = 0;
  let deleted = 0;

  for (const article of ARTICLES) {
    console.log(`📝 "${article.workingTitle}"`);
    
    // Check if exists
    const existing = await ArticleResearchRepository.findByWorkingTitle(article.workingTitle);
    
    if (existing) {
      if (force) {
        await ArticleResearchRepository.delete(existing._id!);
        console.log(`   🗑️  Deleted existing (ID: ${existing._id})`);
        deleted++;
      } else {
        console.log(`   ⏭️  Skipped (already exists, ID: ${existing._id})`);
        skipped++;
        continue;
      }
    }
    
    // Insert
    const id = await ArticleResearchRepository.insert(article);
    console.log(`   ✅ Seeded (ID: ${id})`);
    console.log(`      Keywords: ${article.keywords.length}`);
    console.log(`      Sections: ${article.sections.length}`);
    console.log('');
    seeded++;
  }

  console.log('═'.repeat(62));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Seeded: ${seeded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  if (deleted > 0) console.log(`   🗑️  Deleted: ${deleted}`);
  
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. List: pnpm tsx src/scripts/content-railroad-generate.ts --list`);
  console.log(`   2. Generate: pnpm tsx src/scripts/content-railroad-generate.ts <article-id>`);
  console.log(`   3. Review generated articles in content/drafts/\n`);
}

main();
