#!/usr/bin/env tsx
/**
 * Comprehensive Feed Configuration Seeder
 * 
 * Seeds the database with feed configurations based on Gemini intelligence report
 * Includes all verified feeds for AI model providers and tool vendors
 */

import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { FeedConfig } from '@/lib/db/schemas/feed-config';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logging/logger';

/**
 * Comprehensive feed configurations based on intelligence report
 * Organized by vendor and intelligence layer (Strategic, Operational, Tactical)
 */
const COMPREHENSIVE_FEEDS: Omit<FeedConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============================================================================
  // AI MODEL PROVIDERS
  // ============================================================================

  // Google (Gemini & DeepMind)
  {
    url: 'https://deepmind.google/blog/rss.xml',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Google DeepMind Blog',
    description: 'Research breakthroughs, frontier model announcements, and scientific advancements',
    enabled: true,
  },
  {
    url: 'https://blog.google/technology/ai/rss/',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Google AI Blog (The Keyword)',
    description: 'Google AI product announcements and integrations',
    enabled: true,
  },
  {
    url: 'https://workspaceupdates.googleblog.com/atom.xml',
    source: 'google-ai-blog',
    feedType: 'atom',
    type: 'blog-post',
    name: 'Google Workspace Updates',
    description: 'Workspace AI features like Gemini in Google Vids and Classroom',
    enabled: true,
  },
  {
    url: 'https://research.google/blog/rss',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Google Research Blog',
    description: 'Broader computer science research including responsible AI',
    enabled: true,
  },
  {
    url: 'https://www.google.com/appsstatus/rss/en',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Google Workspace Status',
    description: 'Gemini web interface and Workspace service status',
    enabled: true,
  },
  {
    url: 'https://status.cloud.google.com/en/feed.atom',
    source: 'google-ai-blog',
    feedType: 'atom',
    type: 'status-incident',
    name: 'Google Cloud Status (Vertex AI)',
    description: 'Vertex AI and regional API endpoint health',
    enabled: true,
  },
  {
    url: 'https://developers.google.com/feeds/gemini-code-assist-free-release-notes.xml',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'changelog',
    name: 'Gemini Code Assist Release Notes',
    description: 'VS Code and IntelliJ extension updates',
    enabled: true,
  },
  {
    url: 'https://cloud.google.com/feeds/vertex-ai-release-notes.xml',
    source: 'google-ai-blog',
    feedType: 'rss',
    type: 'changelog',
    name: 'Vertex AI Release Notes',
    description: 'Enterprise API updates, provisioned throughput, private endpoints',
    enabled: true,
  },

  // OpenAI (ChatGPT/GPT)
  {
    url: 'https://openai.com/news/rss.xml',
    source: 'openai-blog',
    feedType: 'rss',
    type: 'blog-post',
    name: 'OpenAI News/Blog',
    description: 'Model releases, partnerships, safety research, and product updates',
    enabled: true,
  },
  {
    url: 'https://status.openai.com/history.rss',
    source: 'openai-blog',
    feedType: 'rss',
    type: 'status-incident',
    name: 'OpenAI System Status',
    description: 'API, ChatGPT, Playground, and Labs service status',
    enabled: true,
  },
  {
    url: 'https://github.com/openai/openai-python/releases.atom',
    source: 'openai-blog',
    feedType: 'atom',
    type: 'changelog',
    name: 'OpenAI Python SDK (Proxy Changelog)',
    description: 'De facto API changelog via SDK releases (e.g., new model support)',
    enabled: true,
  },
  {
    url: 'https://github.com/openai/openai-node/releases.atom',
    source: 'openai-blog',
    feedType: 'atom',
    type: 'changelog',
    name: 'OpenAI Node.js SDK (Alternative Proxy)',
    description: 'Alternative proxy for API changelog via Node.js SDK',
    enabled: false, // Disabled by default, enable if needed
  },

  // Anthropic (Claude)
  {
    url: 'https://www.anthropic.com/index.xml',
    source: 'anthropic-blog',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Anthropic News & Research',
    description: 'Model announcements, research papers, and policy updates',
    enabled: true,
  },
  {
    url: 'https://status.claude.com/history.rss',
    source: 'anthropic-blog',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Claude & API Status',
    description: 'Consumer chat interface and developer API status',
    enabled: true,
  },
  {
    url: 'https://github.com/anthropics/anthropic-sdk-python/releases.atom',
    source: 'anthropic-blog',
    feedType: 'atom',
    type: 'changelog',
    name: 'Anthropic Python SDK (Proxy Changelog)',
    description: 'API feature announcements via SDK releases (e.g., prompt caching)',
    enabled: true,
  },

  // Meta (Llama)
  {
    url: 'https://ai.meta.com/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'model-release',
    name: 'Meta AI Blog',
    description: 'Llama model announcements and open-source releases',
    enabled: true,
  },
  {
    url: 'https://engineering.fb.com/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Meta Engineering Blog',
    description: 'Infrastructure deep dives and training cluster details',
    enabled: true,
  },
  {
    url: 'https://status.huggingface.co/history.rss',
    source: 'huggingface-blog',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Hugging Face Status (Llama Proxy)',
    description: 'Primary distribution hub for Llama model availability',
    enabled: true,
  },
  {
    url: 'https://github.com/meta-llama/llama/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    name: 'Llama GitHub Releases',
    description: 'Reference implementation, quantization scripts, safety guidelines',
    enabled: true,
  },

  // Mistral AI
  {
    url: 'https://mistral.ai/news/index.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Mistral News',
    description: 'Model announcements (Mistral NeMo, Codestral) and partnerships',
    enabled: true,
  },
  {
    url: 'https://status.mistral.ai/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Mistral Platform Status',
    description: 'Hosted API endpoints and le Chat consumer interface status',
    enabled: true,
  },
  {
    url: 'https://github.com/mistralai/client-python/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    name: 'Mistral Python Client (Proxy Changelog)',
    description: 'API parameter updates and new features via SDK releases',
    enabled: true,
  },

  // Cohere
  {
    url: 'https://cohere.com/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Cohere Blog',
    description: 'RAG, embeddings, reranking, and multilingual model deep dives',
    enabled: true,
  },
  {
    url: 'https://status.cohere.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Cohere System Status',
    description: 'Enterprise API and model endpoint status',
    enabled: true,
  },
  {
    url: 'https://docs.cohere.com/changelog.rss',
    source: 'other',
    feedType: 'rss',
    type: 'changelog',
    name: 'Cohere API Changelog',
    description: 'Official documentation changelog (best practice example)',
    enabled: true,
  },

  // xAI (Grok)
  {
    url: 'https://x.ai/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'xAI Blog',
    description: 'Grok model releases and vision capabilities',
    enabled: true,
  },
  {
    url: 'https://status.x.ai/feed.xml',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    name: 'xAI System Status',
    description: 'API status and availability (documented in API docs)',
    enabled: true,
  },

  // ============================================================================
  // AI TOOL VENDORS
  // ============================================================================

  // GitHub Copilot
  {
    url: 'https://github.blog/tag/github-copilot/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'github-copilot',
    name: 'GitHub Copilot Blog',
    description: 'Copilot Workspace, Enterprise, and feature announcements',
    enabled: true,
  },
  {
    url: 'https://www.githubstatus.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    toolId: 'github-copilot',
    name: 'GitHub System Status',
    description: 'GitHub platform status (filter for Copilot, Codespaces, API)',
    enabled: true,
  },
  {
    url: 'https://github.blog/changelog/label/copilot/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'changelog',
    toolId: 'github-copilot',
    name: 'GitHub Copilot Changelog',
    description: 'Iterative improvements like slash commands and model updates',
    enabled: true,
  },

  // Sourcegraph Cody
  {
    url: 'https://sourcegraph.com/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'sourcegraph-cody',
    name: 'Sourcegraph Blog',
    description: 'Context fetching, RAG, and LLM coding benchmarks',
    enabled: true,
  },
  {
    url: 'https://sourcegraphstatus.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    toolId: 'sourcegraph-cody',
    name: 'Sourcegraph Status',
    description: 'Cody and platform service status',
    enabled: true,
  },
  {
    url: 'https://sourcegraph.com/changelog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'changelog',
    toolId: 'sourcegraph-cody',
    name: 'Sourcegraph Changelog',
    description: 'Cody Enterprise availability and feature updates',
    enabled: true,
  },
  {
    url: 'https://github.com/sourcegraph/cody/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    toolId: 'sourcegraph-cody',
    name: 'Cody GitHub Releases (Alternative)',
    description: 'Alternative changelog source via GitHub releases',
    enabled: false, // Disabled, use main changelog instead
  },

  // Tabnine
  {
    url: 'https://www.tabnine.com/blog/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'tabnine',
    name: 'Tabnine Blog',
    description: 'Privacy-focused AI coding assistant updates',
    enabled: true,
  },
  {
    url: 'https://status.tabnine.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    toolId: 'tabnine',
    name: 'Tabnine System Status',
    description: 'Service status and availability',
    enabled: true,
  },
  {
    url: 'https://github.com/codota/tabnine-vscode/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    toolId: 'tabnine',
    name: 'Tabnine VS Code Extension',
    description: 'IDE plugin updates and feature releases',
    enabled: true,
  },

  // Replit
  {
    url: 'https://blog.replit.com/feed.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'replit',
    name: 'Replit Blog',
    description: 'Replit AI, Ghostwriter, and infrastructure improvements',
    enabled: true,
  },
  {
    url: 'https://status.replit.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    toolId: 'replit',
    name: 'Replit System Status',
    description: 'Platform and AI service status',
    enabled: true,
  },
  {
    url: 'https://docs.replit.com/updates/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'changelog',
    toolId: 'replit',
    name: 'Replit Updates',
    description: 'IDE feature drops like AI debugging pane and deployment rollbacks',
    enabled: true,
  },

  // Continue.dev
  {
    url: 'https://blog.continue.dev/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'continue',
    name: 'Continue Blog',
    description: 'Open-source AI coding assistant updates',
    enabled: true,
  },
  {
    url: 'https://github.com/continuedev/continue/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    toolId: 'continue',
    name: 'Continue Releases',
    description: 'Version releases and feature additions (e.g., DeepSeek Coder support)',
    enabled: true,
  },
  {
    url: 'https://github.com/continuedev/continue/issues.atom',
    source: 'other',
    feedType: 'atom',
    type: 'status-incident',
    toolId: 'continue',
    name: 'Continue GitHub Issues (Status Proxy)',
    description: 'Real-time status monitor for open-source tool health',
    enabled: false, // Disabled by default, enable for advanced monitoring
  },

  // Amazon CodeWhisperer (Amazon Q Developer)
  {
    url: 'https://aws.amazon.com/blogs/aws/category/artificial-intelligence/amazon-codewhisperer/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'amazon-codewhisperer',
    name: 'AWS ML Blog (CodeWhisperer)',
    description: 'Amazon Q Developer and CodeWhisperer announcements',
    enabled: true,
  },
  {
    url: 'https://status.aws.amazon.com/rss/all.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    toolId: 'amazon-codewhisperer',
    name: 'AWS Health Dashboard (Filtered)',
    description: 'AWS service status (requires filtering for CodeWhisperer/Q Developer)',
    enabled: true,
  },
  {
    url: 'https://github.com/aws/aws-toolkit-vscode/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    toolId: 'amazon-codewhisperer',
    name: 'AWS Toolkit for VS Code',
    description: 'Client-side AI feature updates and patches',
    enabled: true,
  },

  // JetBrains AI
  {
    url: 'https://blog.jetbrains.com/category/ai/feed/',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    toolId: 'jetbrains-ai',
    name: 'JetBrains AI Blog',
    description: 'AI Assistant, Junie, and LLM integration updates',
    enabled: true,
  },

  // ============================================================================
  // AI AGGREGATORS
  // ============================================================================

  // Together AI
  {
    url: 'https://www.together.ai/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Together AI Blog',
    description: 'New open-source models hosted on platform (e.g., Llama-3-70b)',
    enabled: true,
  },
  {
    url: 'https://status.together.ai/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Together AI Status',
    description: 'GPU cluster and inference endpoint health',
    enabled: true,
  },
  {
    url: 'https://github.com/togethercomputer/together/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    name: 'Together AI Python Library',
    description: 'API library updates and new model availability',
    enabled: true,
  },

  // Anyscale
  {
    url: 'https://www.anyscale.com/blog/rss.xml',
    source: 'other',
    feedType: 'rss',
    type: 'blog-post',
    name: 'Anyscale Blog',
    description: 'Distributed training, Ray Serve, and LLM operationalization',
    enabled: true,
  },
  {
    url: 'https://status.anyscale.com/history.rss',
    source: 'other',
    feedType: 'rss',
    type: 'status-incident',
    name: 'Anyscale Platform Status',
    description: 'Managed Ray service status',
    enabled: true,
  },
  {
    url: 'https://github.com/ray-project/ray/releases.atom',
    source: 'other',
    feedType: 'atom',
    type: 'changelog',
    name: 'Ray Framework Releases',
    description: 'Ray framework updates (proxy for Anyscale platform capabilities)',
    enabled: true,
  },

  // ============================================================================
  // EXISTING FEEDS (Keep for backward compatibility)
  // ============================================================================
  // Note: These are already in the original seed script, but included here
  // for completeness. The seed script will handle duplicates via upsert.
];

async function seedComprehensiveFeeds() {
  const repository = new FeedConfigRepository();
  
  // Ensure indexes
  await repository.ensureIndexes();
  
  logger.info('Seeding comprehensive feed configurations', { 
    count: COMPREHENSIVE_FEEDS.length 
  });

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const feed of COMPREHENSIVE_FEEDS) {
    try {
      const feedConfig: FeedConfig = {
        ...feed,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await repository.upsert(feedConfig);
      if (result.created) {
        created++;
        logger.info('Created feed config', { 
          url: feed.url, 
          name: feed.name 
        });
      } else {
        updated++;
        logger.debug('Updated feed config', { 
          url: feed.url, 
          name: feed.name 
        });
      }
    } catch (error) {
      errors++;
      logger.error('Error seeding feed config', {
        url: feed.url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Comprehensive feed configuration seeding complete', { 
    created, 
    updated, 
    errors 
  });
  
  return { created, updated, errors };
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveFeeds()
    .then(({ created, updated, errors }) => {
      console.log(`✅ Seeded ${created} new feeds, updated ${updated} existing feeds`);
      if (errors > 0) {
        console.log(`⚠️  ${errors} errors encountered`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding feeds:', error);
      process.exit(1);
    });
}

export { seedComprehensiveFeeds };

