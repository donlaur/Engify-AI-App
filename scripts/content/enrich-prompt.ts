#!/usr/bin/env tsx
/**
 * Enrich and improve a prompt based on audit feedback
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

async function enrichPrompt(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Enriching Prompt Based on Audit Feedback              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  
  // Get the prompt
  const prompt = await db.collection('prompts').findOne({ id: promptId });
  if (!prompt) {
    console.error(`❌ Prompt not found: ${promptId}`);
    process.exit(1);
  }

  console.log(`📝 Enriching: "${prompt.title}"\n`);

  // Enhanced prompt based on audit feedback
  const enrichedPrompt = {
    ...prompt,
    // Enhanced title for SEO
    title: 'Product Strategy Red Team: Pressure Test Your Product Strategy Before Launch',
    
    // Enhanced description
    description: 'Acts as a critical Red Team consultant to pressure-test your product strategy, identify hidden assumptions, uncover potential weaknesses, and validate market fit before presenting to executives or committing resources.',
    
    // Enhanced content with better structure
    content: prompt.content,
    
    // Add case studies
    caseStudies: [
      {
        title: 'Pricing Strategy Validation',
        scenario: 'A PM used this prompt to validate a new SaaS pricing model before launch',
        challenge: 'The team was considering a freemium model with premium tiers, but needed to identify potential flaws',
        process: 'Used the Red Team prompt to challenge assumptions about customer willingness to pay, competitive positioning, and cannibalization risks',
        outcome: 'Discovered that the freemium model would cannibalize their existing enterprise product. Revised strategy to focus on mid-market segment instead, avoiding a $2M annual revenue loss.',
        keyLearning: 'Red teaming exposed a critical assumption about customer segmentation that wasn\'t validated'
      },
      {
        title: 'Feature Prioritization Pressure Test',
        scenario: 'A product leader needed to validate a major feature roadmap before board presentation',
        challenge: 'The roadmap included 3 major features targeting enterprise customers, but lacked rigorous validation',
        process: 'Applied Red Team questioning to each feature, focusing on market fit, competitive response, and execution risk',
        outcome: 'Identified that one feature would require 2x the engineering resources than estimated. Revised roadmap to de-prioritize that feature and focus on higher-ROI initiatives.',
        keyLearning: 'Execution risk assessment revealed resource constraints that would have caused project delays'
      },
      {
        title: 'Market Entry Strategy Critique',
        scenario: 'A startup wanted to expand into a new geographic market',
        challenge: 'The expansion strategy was based on assumptions about market demand and competitive landscape',
        process: 'Used Red Team prompt to challenge market research, competitive positioning, and go-to-market assumptions',
        outcome: 'Uncovered that local competitors had stronger distribution channels. Revised strategy to partner with local players instead of competing directly.',
        keyLearning: 'Competitive landscape questioning revealed strategic blind spots that would have led to market failure'
      }
    ],
    
    // Add best time to use
    bestTimeToUse: [
      'Before presenting product strategy to executive team or board',
      'After initial strategy development but before committing significant resources',
      'When validating assumptions about market fit, competitive positioning, or business model',
      'Before major product launches or market expansions',
      'When refining feature roadmaps or prioritization decisions',
      'During strategic planning cycles or quarterly business reviews',
      'When facing high-stakes decisions with significant resource implications'
    ],
    
    // Add recommended models
    recommendedModel: [
      {
        model: 'gpt-4o',
        provider: 'openai',
        reason: 'Best for complex strategic analysis and nuanced questioning. Strong reasoning capabilities for identifying logical flaws.',
        useCase: 'Complex product strategies with multiple variables and interdependencies'
      },
      {
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        reason: 'Excellent for thorough, analytical questioning. Strong at identifying hidden assumptions and edge cases.',
        useCase: 'Deep strategic analysis requiring rigorous logical examination'
      },
      {
        model: 'gpt-4o-mini',
        provider: 'openai',
        reason: 'Cost-effective alternative for initial strategy reviews. Good balance of quality and cost.',
        useCase: 'Quick strategy validation or when running multiple iterations'
      }
    ],
    
    // Enhanced use cases
    useCases: [
      'Product strategy validation before board presentation',
      'Feature roadmap pressure testing',
      'Market entry strategy critique',
      'Pricing model validation',
      'Product positioning strategy review',
      'Go-to-market strategy pressure test',
      'Competitive strategy assessment',
      'Business model validation',
      'Product-market fit hypothesis testing',
      'Strategic pivot decision validation'
    ],
    
    // Enhanced tags
    tags: [
      ...prompt.tags,
      'strategy-validation',
      'red-team',
      'risk-assessment',
      'decision-making',
      'executive-presentation',
      'market-research',
      'competitive-analysis'
    ],
    
    // Add examples
    examples: [
      {
        title: 'Pricing Strategy Input',
        input: 'We\'re launching a new SaaS product targeting SMBs. Our pricing strategy is $99/month per user with annual discounts. We plan to compete on price against our main competitor who charges $149/month.',
        expectedOutput: 'Red Team questions will challenge: customer willingness to pay, competitive response likelihood, market size assumptions, and financial model sustainability'
      },
      {
        title: 'Feature Roadmap Input',
        input: 'Our Q2 roadmap includes AI-powered analytics, mobile app, and API marketplace. We believe these will help us capture enterprise customers.',
        expectedOutput: 'Red Team questions will probe: market demand validation, execution feasibility, competitive differentiation, and resource allocation risks'
      }
    ],
    
    // Add best practices
    bestPractices: [
      'Be specific about your strategy - vague strategies get vague questions',
      'Provide context about your market, competitors, and constraints',
      'Prepare to defend your assumptions with data',
      'Use this early in the strategy process, not as a last-minute check',
      'Iterate based on Red Team feedback before finalizing strategy',
      'Document the Red Team questions and your responses for stakeholder communication',
      'Consider running multiple Red Team sessions with different focus areas'
    ],
    
    // Add when not to use
    whenNotToUse: [
      'For tactical decisions (use simpler frameworks)',
      'When you need quick, yes/no answers',
      'For brainstorming or ideation (use other prompts)',
      'When strategy is already finalized and resources committed'
    ],
    
    // Update timestamp
    updatedAt: new Date(),
    
    // Add SEO metadata
    seoKeywords: [
      'product strategy',
      'strategy validation',
      'red team analysis',
      'product strategy critique',
      'strategy pressure test',
      'product strategy review',
      'strategic planning',
      'product management',
      'product strategy framework'
    ],
    
    // Add difficulty level
    difficulty: 'intermediate',
    
    // Add estimated time
    estimatedTime: '15-30 minutes per strategy review'
  };

  // Update in database
  await db.collection('prompts').updateOne(
    { id: promptId },
    { $set: enrichedPrompt }
  );

  console.log('✅ Prompt enriched with:');
  console.log(`   📚 ${enrichedPrompt.caseStudies.length} case studies`);
  console.log(`   ⏰ ${enrichedPrompt.bestTimeToUse.length} "best time to use" scenarios`);
  console.log(`   🤖 ${enrichedPrompt.recommendedModel.length} recommended AI models`);
  console.log(`   📝 ${enrichedPrompt.useCases.length} use cases`);
  console.log(`   💡 ${enrichedPrompt.examples.length} examples`);
  console.log(`   🏷️  ${enrichedPrompt.tags.length} tags`);
  console.log(`   ✅ ${enrichedPrompt.bestPractices.length} best practices`);
  console.log(`\n📄 Updated prompt saved to database!\n`);

  return enrichedPrompt;
}

// Get prompt ID from command line
const promptId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 
                 process.argv[2];

if (!promptId) {
  console.error('Usage: tsx enrich-prompt.ts --id=<prompt-id>');
  process.exit(1);
}

enrichPrompt(promptId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

