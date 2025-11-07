#!/usr/bin/env tsx
/**
 * Compare External PM Prompt Articles to Our Database
 * 
 * Analyzes prompts from external sources (Revo, Glean, Productboard, etc.)
 * and compares them to our existing PM prompts to identify gaps.
 * 
 * Usage:
 *   tsx scripts/content/compare-external-pm-prompts.ts
 */

import { getDb } from '@/lib/mongodb';

// External prompts extracted from articles
const EXTERNAL_PROMPTS = {
  revo: [
    {
      title: 'Product Vision Builder',
      description: 'Create product vision for the next 2-3 years with strategic pillars',
      category: 'product',
      tags: ['vision', 'strategy', 'planning'],
    },
    {
      title: 'Competitive Analysis Framework',
      description: 'Analyze competitive position, market gaps, threats, and strategic moves',
      category: 'product',
      tags: ['competitive-analysis', 'market-research', 'strategy'],
    },
    {
      title: 'Complete PRD Generator',
      description: 'Generate comprehensive PRD with UX requirements, social media integration',
      category: 'documentation',
      tags: ['prd', 'requirements', 'documentation'],
    },
    {
      title: 'RICE Scoring with Context',
      description: 'Prioritize features using RICE framework with stakeholder talking points',
      category: 'product',
      tags: ['prioritization', 'rice', 'features'],
    },
    {
      title: 'User Research Plan Development',
      description: 'Design research plan with methodology, participant strategy, timeline',
      category: 'product',
      tags: ['user-research', 'research-plan', 'methodology'],
    },
    {
      title: 'Customer Feedback Summary',
      description: 'Analyze feedback from multiple sources and create prioritized action plan',
      category: 'product',
      tags: ['feedback', 'customer-insights', 'analysis'],
    },
    {
      title: 'Executive Status Update Template',
      description: 'Create weekly status update for executives with business impact focus',
      category: 'leadership',
      tags: ['communication', 'stakeholders', 'reporting'],
    },
  ],
  glean: [
    {
      title: 'User Feedback Clustering',
      description: 'Cluster user feedback to identify common themes and pain points',
      category: 'product',
      tags: ['feedback', 'clustering', 'analysis'],
    },
    {
      title: 'Usability Test Script Creation',
      description: 'Generate usability test script for specific features',
      category: 'testing',
      tags: ['usability', 'testing', 'user-research'],
    },
    {
      title: 'Feature Breakdown Structure',
      description: 'Decompose features into manageable components for development',
      category: 'product',
      tags: ['feature-planning', 'breakdown', 'estimation'],
    },
    {
      title: 'Stakeholder Communication Plan',
      description: 'Develop communication strategy for product/feature launches',
      category: 'leadership',
      tags: ['communication', 'stakeholders', 'launch'],
    },
  ],
  productboard: [
    {
      title: 'Predictive Analysis and Forecasting',
      description: 'Forecast product demand and identify upcoming industry trends',
      category: 'analytics',
      tags: ['forecasting', 'analytics', 'trends'],
    },
    {
      title: 'User Documentation Creation',
      description: 'Generate tutorials, guides, and FAQs based on PRD',
      category: 'documentation',
      tags: ['documentation', 'user-guides', 'tutorials'],
    },
    {
      title: 'FAQ Generation',
      description: 'Develop comprehensive FAQ section for common user inquiries',
      category: 'documentation',
      tags: ['faq', 'documentation', 'user-support'],
    },
    {
      title: 'SWOT Analysis',
      description: 'Conduct SWOT analysis for product strategy assessment',
      category: 'product',
      tags: ['swot', 'strategic-analysis', 'planning'],
    },
  ],
};

// Best practices from articles (to analyze critically)
const BEST_PRACTICES = {
  fromArticles: [
    {
      source: 'Revo',
      practice: 'Start Small: Pick 2-3 prompts addressing biggest pain points',
      category: 'adoption',
    },
    {
      source: 'Revo',
      practice: 'Customize for Context: Adapt prompts to industry, product type, team culture',
      category: 'customization',
    },
    {
      source: 'Revo',
      practice: 'Share with Product Teams: Real value comes when whole organization uses consistent approaches',
      category: 'collaboration',
    },
    {
      source: 'Revo',
      practice: 'Iterate and Improve: Track which prompts work best and improve them over time',
      category: 'optimization',
    },
    {
      source: 'Revo',
      practice: 'Combine with automation: Use tools like Revo to automate frequent prompts',
      category: 'automation',
    },
    {
      source: 'General',
      practice: 'Clarity and Specificity: Ensure prompts are clear and specific',
      category: 'prompt-design',
    },
    {
      source: 'General',
      practice: 'Contextual Information: Provide sufficient context within prompts',
      category: 'prompt-design',
    },
    {
      source: 'General',
      practice: 'Iterative Refinement: Continuously refine prompts based on AI responses',
      category: 'optimization',
    },
    {
      source: 'General',
      practice: 'Ethical Considerations: Be mindful of ethical implications and biases',
      category: 'ethics',
    },
  ],
};

interface ComparisonResult {
  existing: number;
  similar: Array<{ title: string; similarity: string }>;
  gaps: Array<{
    title: string;
    description: string;
    category: string;
    tags: string[];
    source: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

async function compareExternalPrompts(): Promise<void> {
  console.log('🔍 Comparing External PM Prompts to Our Database\n');
  console.log('='.repeat(70));

  const db = await getDb();
  
  // Get all PM prompts from our database
  const ourPrompts = await db.collection('prompts').find({
    role: { $in: ['pm', 'product-manager', 'product_manager', 'product-managers'] },
  }).project({
    title: 1,
    description: 1,
    category: 1,
    tags: 1,
  }).toArray();

  console.log(`\n📊 Our Database: ${ourPrompts.length} PM prompts found\n`);

  // Flatten external prompts
  const allExternal: Array<{
    title: string;
    description: string;
    category: string;
    tags: string[];
    source: string;
  }> = [];

  Object.entries(EXTERNAL_PROMPTS).forEach(([source, prompts]) => {
    prompts.forEach(p => {
      allExternal.push({
        ...p,
        source: source.charAt(0).toUpperCase() + source.slice(1),
      });
    });
  });

  console.log(`📚 External Sources: ${allExternal.length} prompts found\n`);

  // Compare titles and descriptions
  const gaps: ComparisonResult['gaps'] = [];
  const similar: ComparisonResult['similar'] = [];

  for (const external of allExternal) {
    const externalTitleLower = external.title.toLowerCase();
    const externalDescLower = external.description.toLowerCase();

    // Check for exact or very similar matches
    const matches = ourPrompts.filter(p => {
      const ourTitleLower = (p.title || '').toLowerCase();
      const ourDescLower = (p.description || '').toLowerCase();

      // Exact title match
      if (ourTitleLower === externalTitleLower) return true;

      // Title contains key words or vice versa
      const externalKeywords = externalTitleLower.split(/\s+/).filter(w => w.length > 3);
      const ourKeywords = ourTitleLower.split(/\s+/).filter(w => w.length > 3);
      const keywordOverlap = externalKeywords.filter(k => ourKeywords.includes(k)).length;
      
      if (keywordOverlap >= 2 && keywordOverlap / Math.max(externalKeywords.length, ourKeywords.length) > 0.5) {
        return true;
      }

      // Description similarity (simple keyword matching)
      const descKeywords = externalDescLower.split(/\s+/).filter(w => w.length > 4);
      const ourDescKeywords = ourDescLower.split(/\s+/).filter(w => w.length > 4);
      const descOverlap = descKeywords.filter(k => ourDescKeywords.includes(k)).length;
      
      if (descOverlap >= 3) return true;

      return false;
    });

    if (matches.length > 0) {
      similar.push({
        title: external.title,
        similarity: matches[0].title,
      });
    } else {
      // Determine priority
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      // High priority: Missing categories or high-value prompts
      if (external.category === 'analytics' || 
          external.tags.includes('forecasting') ||
          external.tags.includes('usability') ||
          external.tags.includes('clustering')) {
        priority = 'high';
      }
      
      // Low priority: Already well-covered areas
      if (external.category === 'documentation' && 
          ourPrompts.filter(p => p.category === 'documentation').length > 10) {
        priority = 'low';
      }

      gaps.push({
        ...external,
        priority,
      });
    }
  }

  // Print results
  console.log('\n✅ SIMILAR PROMPTS (Already in DB):');
  console.log('-'.repeat(70));
  similar.forEach(s => {
    console.log(`  "${s.title}" → Similar to "${s.similarity}"`);
  });

  console.log(`\n\n📋 GAPS IDENTIFIED: ${gaps.length} new prompts\n`);
  console.log('='.repeat(70));

  const highPriority = gaps.filter(g => g.priority === 'high');
  const mediumPriority = gaps.filter(g => g.priority === 'medium');
  const lowPriority = gaps.filter(g => g.priority === 'low');

  if (highPriority.length > 0) {
    console.log('\n🔴 HIGH PRIORITY GAPS:');
    highPriority.forEach((gap, i) => {
      console.log(`\n${i + 1}. ${gap.title} (${gap.source})`);
      console.log(`   ${gap.description}`);
      console.log(`   Category: ${gap.category} | Tags: ${gap.tags.join(', ')}`);
    });
  }

  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY GAPS:');
    mediumPriority.forEach((gap, i) => {
      console.log(`\n${i + 1}. ${gap.title} (${gap.source})`);
      console.log(`   ${gap.description}`);
      console.log(`   Category: ${gap.category} | Tags: ${gap.tags.join(', ')}`);
    });
  }

  if (lowPriority.length > 0) {
    console.log('\n🟢 LOW PRIORITY GAPS:');
    lowPriority.forEach((gap, i) => {
      console.log(`\n${i + 1}. ${gap.title} (${gap.source})`);
      console.log(`   ${gap.description}`);
    });
  }

  // Analyze best practices
  console.log('\n\n🎩 RED HAT ANALYSIS: Best Practices\n');
  console.log('='.repeat(70));

  const redHatAnalysis = analyzeBestPractices(BEST_PRACTICES.fromArticles, ourPrompts.length);
  
  console.log('\n✅ VALIDATED PRACTICES:');
  redHatAnalysis.validated.forEach(p => {
    console.log(`  ✓ ${p.practice} (${p.category})`);
    console.log(`    Reason: ${p.reason}`);
  });

  console.log('\n⚠️  QUESTIONABLE PRACTICES:');
  redHatAnalysis.questionable.forEach(p => {
    console.log(`  ⚠ ${p.practice} (${p.category})`);
    console.log(`    Concerns: ${p.concerns}`);
  });

  console.log('\n❌ SKEPTICAL PRACTICES:');
  redHatAnalysis.skeptical.forEach(p => {
    console.log(`  ✗ ${p.practice} (${p.category})`);
    console.log(`    Criticism: ${p.criticism}`);
  });

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total External Prompts Analyzed: ${allExternal.length}`);
  console.log(`Already in Database: ${similar.length}`);
  console.log(`Gaps Identified: ${gaps.length}`);
  console.log(`  - High Priority: ${highPriority.length}`);
  console.log(`  - Medium Priority: ${mediumPriority.length}`);
  console.log(`  - Low Priority: ${lowPriority.length}`);
  console.log(`\nBest Practices Validated: ${redHatAnalysis.validated.length}`);
  console.log(`Best Practices Questionable: ${redHatAnalysis.questionable.length}`);
  console.log(`Best Practices Skeptical: ${redHatAnalysis.skeptical.length}`);

  process.exit(0);
}

interface BestPracticeAnalysis {
  validated: Array<{ practice: string; category: string; reason: string }>;
  questionable: Array<{ practice: string; category: string; concerns: string }>;
  skeptical: Array<{ practice: string; category: string; criticism: string }>;
}

function analyzeBestPractices(
  practices: Array<{ source: string; practice: string; category: string }>,
  ourPromptCount: number
): BestPracticeAnalysis {
  const validated: BestPracticeAnalysis['validated'] = [];
  const questionable: BestPracticeAnalysis['questionable'] = [];
  const skeptical: BestPracticeAnalysis['skeptical'] = [];

  for (const practice of practices) {
    if (practice.category === 'prompt-design') {
      // Clarity and context are validated principles
      validated.push({
        practice: practice.practice,
        category: practice.category,
        reason: 'Aligns with KERNEL framework (Explicit Constraints, Logical Structure)',
      });
    } else if (practice.category === 'optimization') {
      // Iterative refinement is validated
      validated.push({
        practice: practice.practice,
        category: practice.category,
        reason: 'Proven approach - matches our audit/enrichment workflow',
      });
    } else if (practice.category === 'ethics') {
      // Ethics is important but vague
      questionable.push({
        practice: practice.practice,
        category: practice.category,
        concerns: 'Too vague - needs specific actionable guidelines (bias detection, data privacy, transparency)',
      });
    } else if (practice.category === 'adoption') {
      // Start small is good but...
      questionable.push({
        practice: practice.practice,
        category: practice.category,
        concerns: 'Good advice but ignores that PMs need comprehensive coverage - partial adoption creates gaps',
      });
    } else if (practice.category === 'customization') {
      // Customization is necessary but...
      questionable.push({
        practice: practice.practice,
        category: practice.category,
        concerns: 'Requires expertise many PMs lack - needs templates/frameworks, not just "adapt"',
      });
    } else if (practice.category === 'collaboration') {
      // Sharing is good but...
      validated.push({
        practice: practice.practice,
        category: practice.category,
        reason: 'True - consistent frameworks improve team efficiency',
      });
    } else if (practice.category === 'automation') {
      // Automation is vendor-specific
      skeptical.push({
        practice: practice.practice,
        category: practice.category,
        criticism: 'Vendor lock-in risk - "tools like Revo" is marketing, not best practice. Better: Open-source prompt libraries, version control, API-first approach',
      });
    }
  }

  return { validated, questionable, skeptical };
}

// Run comparison
compareExternalPrompts().catch(console.error);

