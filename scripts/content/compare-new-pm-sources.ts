#!/usr/bin/env tsx
/**
 * Compare External PM Prompt Sources to Our Database
 * 
 * Analyzes prompts from multiple external sources:
 * - Userpilot.com
 * - TeamGPT.com
 * - Productboard.com
 * 
 * Usage:
 *   tsx scripts/content/compare-new-pm-sources.ts
 */

import { getDb } from '@/lib/mongodb';

// External prompts extracted from articles
const EXTERNAL_PROMPTS = {
  userpilot: [
    {
      title: 'Market Research',
      description: 'Find top competitors, alternatives, market size, SWOT analysis',
      category: 'product',
      tags: ['market-research', 'competitive-analysis', 'swot'],
    },
    {
      title: 'Brainstorm Product Ideas',
      description: 'Generate product ideas using AI, identify problems to solve',
      category: 'product',
      tags: ['ideation', 'product-ideas', 'innovation'],
    },
    {
      title: 'Product Pricing Strategy',
      description: 'Analyze industry, identify pricing strategies, formulate pricing model',
      category: 'product',
      tags: ['pricing', 'strategy', 'revenue'],
    },
    {
      title: 'Create Product Roadmap',
      description: 'Prioritize features, create multi-year roadmap categorized by quarter',
      category: 'product',
      tags: ['roadmap', 'planning', 'prioritization'],
    },
    {
      title: 'Create User Persona',
      description: 'Generate user personas with demographics, goals, pain points',
      category: 'product',
      tags: ['personas', 'user-research', 'target-audience'],
    },
    {
      title: 'Create User Stories',
      description: 'Generate user stories for features, format: As a [user], I want [goal] so that [benefit]',
      category: 'product',
      tags: ['user-stories', 'agile', 'requirements'],
    },
    {
      title: 'Analyze User Feedback',
      description: 'Categorize feedback by sentiment, identify themes and patterns',
      category: 'product',
      tags: ['feedback', 'analysis', 'sentiment'],
    },
    {
      title: 'Perform Data Analysis',
      description: 'Analyze datasets, identify trends, create forecasts',
      category: 'analytics',
      tags: ['data-analysis', 'forecasting', 'insights'],
    },
    {
      title: 'Improve Customer Onboarding',
      description: 'Brainstorm onboarding ideas, reduce drop-offs, increase engagement',
      category: 'product',
      tags: ['onboarding', 'user-experience', 'activation'],
    },
    {
      title: 'Improve Product Management Process',
      description: 'Get product management tool recommendations, process improvements',
      category: 'management',
      tags: ['process-improvement', 'tools', 'workflow'],
    },
    {
      title: 'Identify Key Performance Indicators',
      description: 'Create KPIs for features, identify metrics to track success',
      category: 'analytics',
      tags: ['kpis', 'metrics', 'measurement'],
    },
    {
      title: 'Create Questionnaire',
      description: 'Generate questions for customer interviews, surveys, feedback collection',
      category: 'product',
      tags: ['questionnaires', 'user-research', 'surveys'],
    },
    {
      title: 'Identify Feature Limitations',
      description: 'Critique features, identify weaknesses, challenges, and drawbacks',
      category: 'product',
      tags: ['feature-review', 'risk-analysis', 'critique'],
    },
  ],
  teamgpt: [
    {
      title: 'Product Strategy Development',
      description: 'Develop product strategy aligned with business goals',
      category: 'product',
      tags: ['strategy', 'planning', 'vision'],
    },
    {
      title: 'Feature Prioritization',
      description: 'Prioritize features based on value, effort, and strategic alignment',
      category: 'product',
      tags: ['prioritization', 'features', 'decision-making'],
    },
    {
      title: 'User Journey Mapping',
      description: 'Map user journeys, identify touchpoints and pain points',
      category: 'product',
      tags: ['user-journey', 'ux', 'customer-experience'],
    },
    {
      title: 'Competitive Analysis',
      description: 'Analyze competitors, identify strengths, weaknesses, opportunities',
      category: 'product',
      tags: ['competitive-analysis', 'market-research'],
    },
    {
      title: 'Product Launch Planning',
      description: 'Plan product launches, coordinate go-to-market strategy',
      category: 'product',
      tags: ['launch', 'gtm', 'product-marketing'],
    },
    {
      title: 'Stakeholder Communication',
      description: 'Create stakeholder updates, executive summaries, status reports',
      category: 'leadership',
      tags: ['communication', 'stakeholders', 'reporting'],
    },
    {
      title: 'Technical Requirement Documentation',
      description: 'Document technical requirements, API specs, system architecture',
      category: 'documentation',
      tags: ['technical-docs', 'requirements', 'architecture'],
    },
    {
      title: 'A/B Testing Plan',
      description: 'Design A/B tests, define hypotheses, success metrics',
      category: 'product',
      tags: ['ab-testing', 'experimentation', 'metrics'],
    },
    {
      title: 'Product Metrics Dashboard',
      description: 'Design dashboards, select key metrics, visualization strategy',
      category: 'analytics',
      tags: ['dashboards', 'metrics', 'analytics'],
    },
    {
      title: 'Product Requirements Document',
      description: 'Create comprehensive PRDs with goals, features, acceptance criteria',
      category: 'documentation',
      tags: ['prd', 'requirements', 'documentation'],
    },
  ],
  productboard: [
    {
      title: 'Predictive Analysis and Forecasting',
      description: 'Forecast product demand, user growth, identify industry trends',
      category: 'analytics',
      tags: ['forecasting', 'analytics', 'trends'],
    },
    {
      title: 'User Documentation Creation',
      description: 'Generate tutorials, guides, FAQs based on PRD',
      category: 'documentation',
      tags: ['documentation', 'user-guides', 'tutorials'],
    },
    {
      title: 'FAQ Generation',
      description: 'Develop comprehensive FAQ sections for common inquiries',
      category: 'documentation',
      tags: ['faq', 'documentation', 'user-support'],
    },
    {
      title: 'SWOT Analysis',
      description: 'Conduct SWOT analysis for product strategy assessment',
      category: 'product',
      tags: ['swot', 'strategic-analysis', 'planning'],
    },
    {
      title: 'Feature Prioritization Using RICE',
      description: 'Prioritize features using RICE framework',
      category: 'product',
      tags: ['rice', 'prioritization', 'framework'],
    },
    {
      title: 'User Research Synthesis',
      description: 'Synthesize user research findings, identify key insights',
      category: 'product',
      tags: ['user-research', 'synthesis', 'insights'],
    },
  ],
};

async function comparePrompts() {
  console.log('🔍 Comparing External PM Prompt Sources to Our Database\n');
  console.log('='.repeat(70) + '\n');

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  // Fetch existing PM prompts from our DB
  const existingPrompts = await promptsCollection
    .find({
      role: { $in: ['pm', 'product-manager', 'product_manager', 'product-managers'] },
    })
    .toArray();

  const existingTitles = new Set(
    existingPrompts.map((p) => p.title?.toLowerCase().trim())
  );

  console.log(`📊 Our Database: ${existingPrompts.length} PM prompts found\n`);

  // Flatten all external prompts
  const allExternalPrompts = [
    ...EXTERNAL_PROMPTS.userpilot.map((p) => ({ ...p, source: 'Userpilot' })),
    ...EXTERNAL_PROMPTS.teamgpt.map((p) => ({ ...p, source: 'TeamGPT' })),
    ...EXTERNAL_PROMPTS.productboard.map((p) => ({ ...p, source: 'Productboard' })),
  ];

  console.log(`📚 External Sources: ${allExternalPrompts.length} prompts found\n`);
  console.log(`   - Userpilot: ${EXTERNAL_PROMPTS.userpilot.length} prompts`);
  console.log(`   - TeamGPT: ${EXTERNAL_PROMPTS.teamgpt.length} prompts`);
  console.log(`   - Productboard: ${EXTERNAL_PROMPTS.productboard.length} prompts\n`);

  const similarPrompts: Array<{ external: typeof allExternalPrompts[0]; internal: any }> = [];
  const newPrompts: typeof allExternalPrompts = [];

  for (const externalPrompt of allExternalPrompts) {
    const externalTitleLower = externalPrompt.title.toLowerCase().trim();
    let foundSimilar = false;

    // Check for exact title match
    if (existingTitles.has(externalTitleLower)) {
      const internalMatch = existingPrompts.find(
        (p) => p.title?.toLowerCase().trim() === externalTitleLower
      );
      if (internalMatch) {
        similarPrompts.push({ external: externalPrompt, internal: internalMatch });
        foundSimilar = true;
      }
    } else {
      // Check for semantic similarity (keyword matching)
      const titleWords = externalTitleLower.split(/\s+/).filter((w) => w.length > 3);
      const internalMatch = existingPrompts.find((p) => {
        const pTitle = p.title?.toLowerCase().trim() || '';
        return titleWords.some((word) => pTitle.includes(word)) ||
          titleWords.some((word) => pTitle.split(/\s+/).some((pw) => pw.includes(word)));
      });

      if (internalMatch) {
        similarPrompts.push({ external: externalPrompt, internal: internalMatch });
        foundSimilar = true;
      }
    }

    if (!foundSimilar) {
      newPrompts.push(externalPrompt);
    }
  }

  console.log(`\n✅ SIMILAR PROMPTS (Already in DB): ${similarPrompts.length}`);
  console.log('-'.repeat(70));
  if (similarPrompts.length > 0) {
    similarPrompts.forEach((match) => {
      console.log(`  "${match.external.title}" (${match.external.source})`);
      console.log(`    → Similar to: "${match.internal.title}"`);
      console.log('');
    });
  } else {
    console.log('  None found.');
  }

  console.log(`\n📋 GAPS IDENTIFIED: ${newPrompts.length} new prompts`);
  console.log('='.repeat(70) + '\n');

  // Group by source
  const gapsBySource = {
    Userpilot: newPrompts.filter((p) => p.source === 'Userpilot'),
    TeamGPT: newPrompts.filter((p) => p.source === 'TeamGPT'),
    Productboard: newPrompts.filter((p) => p.source === 'Productboard'),
  };

  Object.entries(gapsBySource).forEach(([source, prompts]) => {
    if (prompts.length > 0) {
      console.log(`\n📌 ${source.toUpperCase()} - ${prompts.length} gaps:`);
      prompts.forEach((p, index) => {
        console.log(`\n${index + 1}. ${p.title}`);
        console.log(`   ${p.description}`);
        console.log(`   Category: ${p.category} | Tags: ${p.tags.join(', ')}`);
      });
    }
  });

  console.log(`\n\n📊 SUMMARY`);
  console.log('='.repeat(70));
  console.log(`Total External Prompts Analyzed: ${allExternalPrompts.length}`);
  console.log(`Already in Database: ${similarPrompts.length}`);
  console.log(`Gaps Identified: ${newPrompts.length}`);
  console.log(`   - Userpilot: ${gapsBySource.Userpilot.length}`);
  console.log(`   - TeamGPT: ${gapsBySource.TeamGPT.length}`);
  console.log(`   - Productboard: ${gapsBySource.Productboard.length}`);

  process.exit(0);
}

comparePrompts().catch(console.error);

