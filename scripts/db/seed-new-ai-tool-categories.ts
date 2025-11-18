#!/usr/bin/env tsx

/**
 * Seed New AI Tool Categories
 * 
 * Adds tools for new strategic categories:
 * - AI Testing & QA
 * - MLOps & Experiment Tracking
 * - Agentic Assistants
 * - Cloud-Optimized Assistants
 * 
 * Run with: tsx scripts/db/seed-new-ai-tool-categories.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import { generateSlug } from '@/lib/utils/slug';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const NEW_TOOLS = [
  // Agentic Assistants
  {
    id: 'claude-code',
    name: 'Claude Code',
    tagline: 'Agentic AI coding assistant with large context windows',
    description: 'Claude Code is Anthropic\'s agentic AI coding assistant built on the Claude LLM family. It excels at handling extensive codebases with significantly larger context windows, enabling better reasoning across multiple files and complex prompts. Unlike traditional IDE-based tools, Claude Code operates natively in the terminal, allowing developers to interact naturally at the command line and deploy sophisticated agentic automation. For enterprise users, it offers robust integrations with critical deployment, database, monitoring, and version control tools including GitHub, DataDog, Stripe, and Circle CI.',
    category: 'agentic-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 20, // Estimated based on Claude API pricing
        tier: 'Pro',
      },
    },
    features: [
      'Large context windows for multi-file reasoning',
      'Terminal-native execution and automation',
      'Deep GitHub integration',
      'DevOps pipeline integration (DataDog, Stripe, Circle CI)',
      'Natural language orchestration of complex operations',
      'Multi-agent cooperation capabilities',
      'Enterprise-grade context awareness',
    ],
    pros: [
      'Superior context handling for large codebases',
      'Terminal-native workflow integration',
      'Strong enterprise DevOps integrations',
      'Advanced agentic automation capabilities',
      'Better reasoning across multiple files',
    ],
    cons: [
      'Requires terminal familiarity',
      'Less visual than IDE-based tools',
      'Learning curve for agentic workflows',
    ],
    tags: ['agentic', 'terminal', 'anthropic', 'claude', 'enterprise', 'devops'],
    icon: 'terminal',
    websiteUrl: 'https://www.anthropic.com/claude',
  },
  
  // Cloud-Optimized Assistants
  {
    id: 'amazon-q-developer',
    name: 'Amazon Q Developer',
    tagline: 'AWS-native AI coding assistant with cloud resource provisioning',
    description: 'Amazon Q Developer is AWS\'s dedicated AI-powered coding assistant, strategically designed for teams operating within the AWS ecosystem. It offers natural language-to-code generation, cloud resource provisioning, and deployment guidance specifically optimized for AWS infrastructure. The tool employs a unique, proprietary method of usage metering using "lines of code submitted" rather than standard token counts. The Free Tier allows 1,000 lines of code per month, while the Pro Tier ($19 per user/month) offers 4,000 lines of code per month pooled at the account level. Pro Tier includes advanced features such as enterprise access controls and the ability to customize Amazon Q to specific codebases.',
    category: 'cloud-optimized',
    pricing: {
      free: true,
      paid: {
        monthly: 19,
        tier: 'Pro',
      },
    },
    features: [
      'Deep AWS Services integration (IDE/CLI/Console)',
      'Cloud resource provisioning via natural language',
      'Application deployment guidance',
      'Proprietary "lines of code" metering',
      'Enterprise access controls (Pro Tier)',
      'Codebase customization (Pro Tier)',
      'Access to latest Claude models via AWS',
    ],
    pros: [
      'Unmatched AWS ecosystem integration',
      'Cloud resource provisioning automation',
      'Unique metering model (lines of code)',
      'Enterprise-grade access controls',
      'Pooled usage at account level',
    ],
    cons: [
      'Vendor lock-in to AWS ecosystem',
      'Proprietary metering can be confusing',
      'Limited to AWS infrastructure',
      'Free tier limits (1,000 LOC/month)',
    ],
    tags: ['aws', 'cloud', 'amazon', 'enterprise', 'devops', 'infrastructure'],
    icon: 'cloud',
    websiteUrl: 'https://aws.amazon.com/q/developer/',
  },

  // AI Testing & QA
  {
    id: 'virtuoso-qa',
    name: 'Virtuoso QA',
    tagline: 'GenAI-native testing agent with self-healing automation',
    description: 'Virtuoso QA is a GenAI-native testing platform that enables non-technical testers and developers to author, manage, and debug tests in natural language. The platform offers QA Agent-as-a-Service capabilities with industry-leading self-healing automation that can reduce test maintenance by up to 85%. It provides AI-powered visual validation and autonomous adaptation to minor UI changes, dramatically increasing test suite resilience.',
    category: 'ai-testing-qa',
    pricing: {
      free: false,
      paid: {
        monthly: 50, // Estimated
        tier: 'Professional',
      },
    },
    features: [
      'Natural language test creation',
      'Self-healing automation (85% maintenance reduction)',
      'AI-powered visual validation',
      'GenAI-native testing agents',
      'QA Agent-as-a-Service',
      'Non-technical test authoring',
      'Automated test debugging',
    ],
    pros: [
      'Dramatic reduction in test maintenance (85%)',
      'Natural language test creation',
      'Self-healing capabilities',
      'Accessible to non-technical users',
      'Strong visual validation',
    ],
    cons: [
      'Higher pricing tier',
      'Learning curve for advanced features',
      'Requires understanding of test workflows',
    ],
    tags: ['testing', 'qa', 'automation', 'self-healing', 'visual-validation', 'genai'],
    icon: 'shield-check',
    websiteUrl: 'https://www.virtuoso.qa',
  },

  {
    id: 'lambdatest-kaneai',
    name: 'LambdaTest KaneAI',
    tagline: 'AI-powered test orchestration and execution',
    description: 'LambdaTest KaneAI provides AI-powered test orchestration and execution capabilities. The platform\'s HyperExecute feature uses AI to optimize test orchestration and execution for speed and reliability, claiming up to 70% faster execution than traditional cloud-based grids. It offers comprehensive testing solutions including cross-browser testing, visual regression testing, and AI-driven test maintenance.',
    category: 'ai-testing-qa',
    pricing: {
      free: true,
      paid: {
        monthly: 25,
        tier: 'Professional',
      },
    },
    features: [
      'AI-powered test orchestration',
      'HyperExecute for 70% faster execution',
      'Cross-browser testing',
      'Visual regression testing',
      'AI-driven test maintenance',
      'Cloud-based test grid',
      'Natural language test authoring',
    ],
    pros: [
      'Significantly faster test execution (70%)',
      'Comprehensive browser coverage',
      'AI-optimized orchestration',
      'Free tier available',
      'Strong visual testing capabilities',
    ],
    cons: [
      'Cloud dependency',
      'Pricing can scale with usage',
      'Requires internet connection',
    ],
    tags: ['testing', 'qa', 'orchestration', 'cross-browser', 'visual-testing', 'cloud'],
    icon: 'zap',
    websiteUrl: 'https://www.lambdatest.com/kane-ai',
  },

  // MLOps
  {
    id: 'weights-biases',
    name: 'Weights & Biases (W&B)',
    tagline: 'ML experiment tracking and model management platform',
    description: 'Weights & Biases (W&B) is a comprehensive MLOps platform crucial for managing dozens of experiments by tracking key metrics, logging hyperparameters, and automating workflows for hyperparameter optimization and prompt engineering. W&B supports advanced features like model management and no-code ML app development. It ensures experiment reproducibility and provides essential governance for production ML deployments.',
    category: 'mlops',
    pricing: {
      free: true,
      paid: {
        monthly: 50,
        tier: 'Team',
      },
    },
    features: [
      'Experiment tracking and management',
      'Hyperparameter optimization automation',
      'Prompt engineering workflows',
      'Model management and versioning',
      'No-code ML app development',
      'Data and artifact versioning',
      'Reproducibility guarantees',
      'Integration with cloud storage (S3, GCP, Azure)',
    ],
    pros: [
      'Industry-standard experiment tracking',
      'Strong reproducibility features',
      'Comprehensive model management',
      'Free tier for individuals',
      'Excellent cloud integrations',
    ],
    cons: [
      'Can be expensive for large teams',
      'Learning curve for advanced features',
      'Requires understanding of ML workflows',
    ],
    tags: ['mlops', 'experiment-tracking', 'model-management', 'reproducibility', 'ml'],
    icon: 'chart-line',
    websiteUrl: 'https://wandb.ai',
  },

  {
    id: 'dvc',
    name: 'DVC (Data Version Control)',
    tagline: 'Version control for data and ML artifacts',
    description: 'DVC (Data Version Control) is an open-source tool essential for ensuring data lineage and versioning, guaranteeing that every change to a dataset is tracked. This is fundamental for model reproducibility and compliance. DVC tracks both code and data artifacts, enabling developers to reproduce production models exactly. It integrates seamlessly with Git and supports large-scale data storage on cloud platforms.',
    category: 'mlops',
    pricing: {
      free: true,
      paid: {
        monthly: 0, // Open source, but may have cloud hosting costs
        tier: 'Open Source',
      },
    },
    features: [
      'Data version control',
      'ML artifact tracking',
      'Git integration',
      'Cloud storage support (S3, GCS, Azure)',
      'Reproducibility guarantees',
      'Data lineage tracking',
      'Large file handling',
      'Pipeline orchestration',
    ],
    pros: [
      'Open source and free',
      'Strong Git integration',
      'Excellent for data versioning',
      'Cloud storage support',
      'Essential for reproducibility',
    ],
    cons: [
      'Requires technical setup',
      'Learning curve for Git workflows',
      'Cloud storage costs separate',
    ],
    tags: ['mlops', 'version-control', 'open-source', 'data-versioning', 'reproducibility'],
    icon: 'git-branch',
    websiteUrl: 'https://dvc.org',
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Seeding new AI tool categories...\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const toolData of NEW_TOOLS) {
      const existing = await collection.findOne({ id: toolData.id });

      const tool = {
        ...toolData,
        slug: generateSlug(toolData.name),
        status: 'active' as const,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
        lastUpdated: new Date(),
      };

      if (existing) {
        // Update existing
        await collection.updateOne(
          { id: toolData.id },
          {
            $set: {
              ...tool,
              _id: existing._id,
            },
          }
        );
        console.log(`✅ Updated: ${toolData.name}`);
        updated++;
      } else {
        // Create new
        await collection.insertOne(tool);
        console.log(`✨ Created: ${toolData.name}`);
        created++;
      }
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   - Created: ${created} tools`);
    console.log(`   - Updated: ${updated} tools`);
    console.log(`   - Skipped: ${skipped} tools\n`);

  } catch (error) {
    logger.error('Failed to seed new AI tool categories', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

