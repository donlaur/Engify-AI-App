#!/usr/bin/env tsx

/**
 * Update Cline and Cline Clones/Alternatives
 * 
 * Based on research, updates:
 * - Cline: Enhanced description noting it's the leading autonomous agent
 * - Aider: Note it's a CLI-native alternative to Cline
 * - Continue: Note it's an extensible alternative (already added, but update)
 * - Add OpenHands, Tabby, Aider if missing
 * 
 * Run with: tsx scripts/db/update-cline-and-clones.ts
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

const CLINE_ENHANCEMENT = {
  description: `Cline is an autonomous coding agent that operates directly within VS Code, representing a paradigm shift from passive code suggestion to full-spectrum autonomous development. Cline implements a rigorous Plan-Act-Observe-React loop, enabling it to execute complex, multi-step tasks across diverse environments. Unlike traditional copilots, Cline can simulate browser interaction for end-to-end testing and visual debugging, providing functional capabilities often missing in competitors. Its reliance on the Model Context Protocol (MCP) allows for unparalleled customization and integration into specific enterprise workflows. Cline is model-agnostic, supporting direct API access (Anthropic, OpenAI, Google, xAI), aggregators, and local models (Ollama, LM Studio) via a "Bring Your Own Key" (BYOK) economic model.`,
  features: [
    'Autonomous Plan-Act-Observe-React agentic system',
    'VS Code deep integration',
    'Interactive browser debugging and end-to-end testing',
    'Model Context Protocol (MCP) extensibility',
    'Model-agnostic (Direct API, Aggregator, Local models)',
    'BYOK (Bring Your Own Key) economic model',
    'Terminal monitoring and reactive error correction',
    'Native tool calling with parallel execution',
    'Full audit trail via Timeline feature',
    'Git-aware editing with diff review',
  ],
  pros: [
    'Revolutionary autonomous capabilities beyond code generation',
    'Browser interaction for visual debugging and E2E testing',
    'MCP extensibility for enterprise customization',
    'Model-agnostic architecture (no vendor lock-in)',
    'Deep VS Code integration (minimal workflow disruption)',
    'Full observability and audit trail',
    'BYOK model for cost control and security',
  ],
  cons: [
    'Requires understanding of agentic workflows',
    'May need oversight for complex system changes',
    'Local model setup requires infrastructure',
    'Learning curve for MCP customization',
  ],
  tags: ['autonomous-agent', 'vscode', 'agentic', 'mcp', 'browser-debugging', 'byok', 'open-source'],
  cloneType: 'original',
  agentCapabilities: [
    'test-generation',
    'refactoring',
    'file-creation',
    'autonomous-workflows',
    'browser-interaction',
    'end-to-end-testing',
    'terminal-monitoring',
    'error-correction',
  ],
};

const CLONE_TOOLS = [
  {
    id: 'aider',
    name: 'Aider',
    tagline: 'CLI-native autonomous coding agent with Git-aware editing',
    description: `Aider is a popular open-source autonomous coding agent that operates primarily within the command-line interface (CLI). It serves as a terminal pair-programmer, providing write access to repositories and specializing in Git-aware editing. Aider can modify existing files or create new ones based on conversational commands. Similar to Cline, Aider adheres to the BYOK (Bring Your Own Key) model, requiring users to supply their own API keys for LLMs such as GPT-4. While Aider focuses on structured, Git-aware edits and command-line efficiency, it operates at a lower level of autonomy compared to Cline's browser interaction and MCP extensibility capabilities.`,
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'CLI-native terminal pair-programmer',
      'Git-aware editing',
      'Repository write access',
      'Conversational code modification',
      'BYOK (Bring Your Own Key) model',
      'Multi-file editing',
      'Command-line efficiency',
    ],
    pros: [
      'Lightweight CLI interface',
      'Git-aware operations',
      'Open-source and free',
      'BYOK cost model',
      'Fast terminal workflow',
    ],
    cons: [
      'Limited to CLI interface',
      'No browser interaction',
      'No MCP extensibility',
      'Lower autonomy than Cline',
      'No visual debugging',
    ],
    tags: ['autonomous-agent', 'cli', 'git-aware', 'byok', 'open-source', 'cline-alternative'],
    icon: 'terminal',
    websiteUrl: 'https://aider.chat/',
    badges: ['open-source', 'free', 'cli-tool'],
    supportedModels: ['GPT-4', 'Claude', 'Local models'],
    agentCapabilities: ['refactoring', 'file-creation', 'git-aware-editing'],
    inspiredBy: 'cline',
    cloneType: 'alternative',
    marketplaceLinks: {
      github: 'https://github.com/paul-gauthier/aider',
    },
  },

  {
    id: 'openhands',
    name: 'OpenHands',
    tagline: 'Full-capability autonomous software developer agent',
    description: `OpenHands is marketed as a "full-capability software developer" agent designed to perform a complete range of tasks, including modifying code, running commands, browsing the web, calling external APIs, and even sourcing code snippets from public repositories like StackOverflow. OpenHands features a comprehensive, multi-component interface that includes a chat panel, a dedicated file management workspace with VS Code integration, Jupyter notebook support, an application viewer for testing, a browser, and a terminal. While OpenHands offers high feature density and maximum autonomy, its comprehensive workspace design imposes higher adoption friction compared to Cline's seamless VS Code integration.`,
    category: 'ide',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Full-capability developer agent',
      'Multi-component workspace',
      'VS Code integration',
      'Jupyter notebook support',
      'Application viewer for testing',
      'Built-in browser',
      'Terminal integration',
      'Web browsing capabilities',
      'External API calling',
      'Code sourcing from StackOverflow',
    ],
    pros: [
      'Maximum autonomy and capability',
      'All-in-one workspace',
      'Comprehensive tool integration',
      'Open-source',
      'Web browsing and API access',
    ],
    cons: [
      'Higher adoption friction',
      'Complex multi-component interface',
      'Requires workspace setup',
      'Less seamless than IDE integration',
      'May be overkill for simple tasks',
    ],
    tags: ['autonomous-agent', 'full-capability', 'workspace', 'open-source', 'cline-alternative'],
    icon: 'code',
    websiteUrl: 'https://openhands.dev/',
    badges: ['open-source', 'free'],
    supportedModels: ['GPT-4', 'Claude', 'Local models'],
    agentCapabilities: [
      'test-generation',
      'refactoring',
      'file-creation',
      'web-browsing',
      'api-calling',
      'code-sourcing',
    ],
    inspiredBy: 'cline',
    cloneType: 'alternative',
    marketplaceLinks: {
      github: 'https://github.com/allenai/open-hand',
    },
  },

  {
    id: 'tabby',
    name: 'Tabby',
    tagline: 'Self-hosted, open-source code completion agent',
    description: `Tabby is positioned as an open-source, self-hosted solution that primarily provides autocomplete functionality, placing it in the category of code assistance rather than full autonomy. Unlike Cline and other high-autonomy agents, Tabby focuses on lightweight, fast code completion rather than autonomous multi-step task execution. It's designed for developers who want self-hosted AI assistance with minimal overhead, making it suitable for organizations with strict security requirements or those who prefer a simpler, completion-focused tool over full agentic capabilities.`,
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Self-hosted code completion',
      'Open-source',
      'Lightweight autocomplete',
      'VS Code extension',
      'Local model support',
      'Privacy-focused',
      'Minimal overhead',
    ],
    pros: [
      'Completely self-hosted',
      'Lightweight and fast',
      'Privacy-focused',
      'Open-source',
      'Simple autocomplete focus',
    ],
    cons: [
      'Limited to autocomplete (not autonomous)',
      'No agentic capabilities',
      'Requires self-hosting infrastructure',
      'Less capable than full agents',
    ],
    tags: ['code-assistant', 'self-hosted', 'autocomplete', 'open-source', 'privacy'],
    icon: 'code',
    websiteUrl: 'https://tabby.tabbyml.com/',
    badges: ['vscode-plugin', 'open-source', 'free'],
    supportedModels: ['Local models', 'Self-hosted'],
    agentCapabilities: ['code-completion'],
    inspiredBy: 'cline',
    cloneType: 'alternative',
    marketplaceLinks: {
      vscode: 'https://marketplace.visualstudio.com/items?itemName=TabbyML.tabby',
      github: 'https://github.com/TabbyML/tabby',
    },
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Updating Cline and adding Cline clones/alternatives...\n');

    let created = 0;
    let updated = 0;

    // Update Cline with enhanced description
    const cline = await collection.findOne({ id: 'cline' });
    if (cline) {
      await collection.updateOne(
        { id: 'cline' },
        {
          $set: {
            ...CLINE_ENHANCEMENT,
            _id: cline._id,
            id: 'cline',
            slug: cline.slug || generateSlug('Cline'),
            name: 'Cline',
            category: cline.category || 'code-assistant',
            createdAt: cline.createdAt || new Date(),
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Cline (enhanced with research details)`);
      updated++;
    } else {
      // Create Cline if it doesn't exist
      const newCline = {
        id: 'cline',
        slug: generateSlug('Cline'),
        name: 'Cline',
        tagline: 'Autonomous coding agent right in your IDE',
        category: 'code-assistant',
        pricing: {
          free: true,
          paid: {
            monthly: 0,
            tier: 'Open Source',
          },
        },
        websiteUrl: 'https://cline.bot/',
        badges: ['vscode-plugin', 'open-source', 'free'],
        supportedModels: ['GPT-4', 'Claude', 'Gemini', 'Ollama', 'LM Studio'],
        marketplaceLinks: {
          vscode: 'https://marketplace.visualstudio.com/items?itemName=Cline.cline',
          github: 'https://github.com/clinebot/cline',
        },
        ...CLINE_ENHANCEMENT,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdated: new Date(),
      };
      await collection.insertOne(newCline);
      console.log(`✨ Created: Cline`);
      created++;
    }

    // Update Continue to note it's a Cline alternative
    const continueTool = await collection.findOne({ id: 'continue' });
    if (continueTool) {
      await collection.updateOne(
        { id: 'continue' },
        {
          $set: {
            inspiredBy: 'cline',
            cloneType: 'alternative',
            tags: [...(continueTool.tags || []), 'cline-alternative'],
            updatedAt: new Date(),
            lastUpdated: new Date(),
          },
        }
      );
      console.log(`✅ Updated: Continue (noted as Cline alternative)`);
      updated++;
    }

    // Add clone tools
    for (const toolData of CLONE_TOOLS) {
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
        await collection.insertOne(tool);
        console.log(`✨ Created: ${toolData.name}`);
        created++;
      }
    }

    console.log(`\n✨ Update complete!`);
    console.log(`   - Created: ${created} tools`);
    console.log(`   - Updated: ${updated} tools\n`);

  } catch (error) {
    logger.error('Failed to update Cline and clones', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }

  process.exit(0);
}

main();

