#!/usr/bin/env tsx
/**
 * Seed Content Queue
 * Populates the queue with 25 planned content items
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const QUEUE_ITEMS = [
  // Batch 1: Pillar Pages
  {
    title: 'AI Estimation Reality Check: Why AI Time Estimates Fail and How to Fix Them',
    contentType: 'pillar-page',
    description: 'Comprehensive guide on AI estimation failures and the 1% rule',
    keywords: ['AI estimation', 'time estimates', 'engineering estimates', '5% rule', '1% rule'],
    targetWordCount: 5000,
    priority: 'high',
    batch: 'pillar-pages',
    source: 'ai-research',
  },
  {
    title: 'AI-Assisted Engineering Workflows: The Complete Guide to AI-Powered Development',
    contentType: 'pillar-page',
    description: 'Complete guide to AI workflows including PBVR, patterns, and best practices',
    keywords: ['AI workflows', 'engineering workflows', 'PBVR', 'AI patterns'],
    targetWordCount: 7000,
    priority: 'high',
    batch: 'pillar-pages',
    source: 'ai-research',
  },

  // Batch 2: AI-SDLC Spokes
  {
    title: 'What is AI-SDLC? A Complete Introduction to AI-Enabled Software Development Lifecycle',
    contentType: 'tutorial',
    description: 'Introduction to AI-SDLC concepts and benefits',
    keywords: ['AI-SDLC', 'software development lifecycle', 'AI development'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-SDLC vs Traditional SDLC: Key Differences and Benefits',
    contentType: 'tutorial',
    description: 'Comparison between AI-enabled and traditional SDLC',
    keywords: ['AI-SDLC', 'traditional SDLC', 'comparison', 'benefits'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },
  {
    title: 'How to Implement AI-SDLC: Step-by-Step Implementation Guide',
    contentType: 'tutorial',
    description: 'Practical guide to implementing AI-SDLC in your organization',
    keywords: ['AI-SDLC implementation', 'implementation guide', 'step-by-step'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI Memory Layer in SDLC: Building Institutional Knowledge for Better Development',
    contentType: 'tutorial',
    description: 'Deep dive into AI memory systems for SDLC',
    keywords: ['AI memory', 'institutional knowledge', 'AI-SDLC', 'memory layer'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI Guardrails for SDLC: Preventing Common Mistakes Before They Happen',
    contentType: 'tutorial',
    description: 'How to use AI guardrails to prevent development mistakes',
    keywords: ['AI guardrails', 'mistake prevention', 'AI-SDLC', 'quality assurance'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI Tool Integrations for SDLC: GitHub, Jira, VS Code, and MCP Integration Guide',
    contentType: 'tutorial',
    description: 'Complete guide to integrating AI tools with your development workflow',
    keywords: ['GitHub integration', 'Jira integration', 'VS Code', 'MCP', 'tool integration'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'ai-sdlc-spokes',
    source: 'ai-research',
  },

  // Batch 3: Agile Spokes
  {
    title: 'AI-Enabled Agile Overview: What Changes from Traditional Agile',
    contentType: 'tutorial',
    description: 'Overview of AI-enabled Agile practices',
    keywords: ['AI-enabled Agile', 'Agile transformation', 'AI in Agile'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Sprint Planning: Using AI to Plan Better Sprints',
    contentType: 'tutorial',
    description: 'How to use AI for more effective sprint planning',
    keywords: ['sprint planning', 'AI sprint planning', 'Agile planning'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Backlog Grooming: Automate Prioritization and Refinement',
    contentType: 'tutorial',
    description: 'Using AI to improve backlog grooming and prioritization',
    keywords: ['backlog grooming', 'prioritization', 'AI Agile', 'refinement'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Augmented Daily Standups: Making Standups More Effective with AI',
    contentType: 'tutorial',
    description: 'How AI can improve daily standup meetings',
    keywords: ['daily standups', 'AI standups', 'Agile ceremonies'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Augmented Retrospectives: Using AI to Improve Team Retrospectives',
    contentType: 'tutorial',
    description: 'Leveraging AI for better retrospective meetings',
    keywords: ['retrospectives', 'AI retros', 'team improvement', 'Agile'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },
  {
    title: 'Complete Guide to AI-Enabled Agile Ceremonies: All Ceremonies Explained',
    contentType: 'tutorial',
    description: 'Comprehensive guide to all Agile ceremonies with AI',
    keywords: ['Agile ceremonies', 'AI Agile', 'sprint ceremonies'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'agile-spokes',
    source: 'ai-research',
  },

  // Batch 4: Estimation Spokes
  {
    title: 'Why AI Estimation Fails: The Truth About AI Time Estimates',
    contentType: 'guide',
    description: 'Analysis of why AI time estimates are often wrong',
    keywords: ['AI estimation', 'estimation failures', 'time estimates'],
    targetWordCount: 3000,
    priority: 'high',
    batch: 'estimation-spokes',
    source: 'ai-research',
  },
  {
    title: 'The 5% Rule for AI Estimates: How to Get Realistic Engineering Timelines',
    contentType: 'guide',
    description: 'Explanation of the 5% rule and 1% reality for AI estimates',
    keywords: ['5% rule', '1% rule', 'AI estimates', 'realistic timelines'],
    targetWordCount: 3000,
    priority: 'high',
    batch: 'estimation-spokes',
    source: 'ai-research',
  },
  {
    title: 'WSJF and AI Prioritization: Combining Weighted Shortest Job First with AI',
    contentType: 'guide',
    description: 'How to use WSJF with AI for better prioritization',
    keywords: ['WSJF', 'prioritization', 'AI prioritization', 'Agile'],
    targetWordCount: 3000,
    priority: 'medium',
    batch: 'estimation-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Capacity Planning: Better Resource Allocation with AI',
    contentType: 'guide',
    description: 'Using AI for more accurate capacity planning',
    keywords: ['capacity planning', 'resource allocation', 'AI planning'],
    targetWordCount: 3000,
    priority: 'medium',
    batch: 'estimation-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI in Roadmap Planning: Using AI for Strategic Product Planning',
    contentType: 'guide',
    description: 'Leveraging AI for long-term product roadmap planning',
    keywords: ['roadmap planning', 'product planning', 'AI strategy'],
    targetWordCount: 3000,
    priority: 'medium',
    batch: 'estimation-spokes',
    source: 'ai-research',
  },

  // Batch 5: Workflow Spokes
  {
    title: 'The PBVR Cycle: Plan, Build, Verify, Review with AI Assistance',
    contentType: 'tutorial',
    description: 'Complete guide to the PBVR development cycle',
    keywords: ['PBVR', 'development cycle', 'AI workflows'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
  {
    title: '20 Must-Use AI Patterns for Software Engineers',
    contentType: 'tutorial',
    description: 'Essential AI patterns every engineer should know',
    keywords: ['AI patterns', 'engineering patterns', 'best practices'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Pull Request Reviews: Automate Code Review with AI',
    contentType: 'tutorial',
    description: 'How to use AI for better code reviews',
    keywords: ['code review', 'pull requests', 'AI review', 'PR automation'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Test Generation: Automated Testing with AI',
    contentType: 'tutorial',
    description: 'Using AI to generate and maintain tests',
    keywords: ['test generation', 'automated testing', 'AI testing'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Documentation Workflow: Generate and Maintain Docs with AI',
    contentType: 'tutorial',
    description: 'How to use AI for documentation generation and maintenance',
    keywords: ['documentation', 'AI docs', 'technical writing'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
  {
    title: 'AI-Enabled Debugging and Refactoring: Fix Bugs Faster with AI',
    contentType: 'tutorial',
    description: 'Using AI to debug and refactor code more effectively',
    keywords: ['debugging', 'refactoring', 'AI debugging', 'code quality'],
    targetWordCount: 2000,
    priority: 'medium',
    batch: 'workflow-spokes',
    source: 'ai-research',
  },
];

async function seedQueue() {
  console.log('🌱 Seeding content queue...\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment');
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  console.log('✅ Connected to MongoDB\n');

  const db = client.db();
  const collection = db.collection('content_queue');

  // Clear existing queue
  await collection.deleteMany({});
  console.log('✅ Cleared existing queue\n');

  // Insert items
  const items = QUEUE_ITEMS.map(item => ({
    ...item,
    id: new ObjectId().toString(),
    status: 'queued',
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await collection.insertMany(items as any);

  console.log(`✅ Added ${items.length} items to queue\n`);

  // Show stats
  const byBatch = items.reduce((acc, item) => {
    acc[item.batch] = (acc[item.batch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Queue Stats:');
  console.log(`   Total: ${items.length} items`);
  console.log('\n   By Batch:');
  Object.entries(byBatch).forEach(([batch, count]) => {
    console.log(`   - ${batch}: ${count} items`);
  });

  console.log('\n✨ Queue seeded successfully!');
  
  await client.close();
  process.exit(0);
}

seedQueue().catch(error => {
  console.error('❌ Error seeding queue:', error);
  process.exit(1);
});
