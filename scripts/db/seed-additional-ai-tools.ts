#!/usr/bin/env tsx

/**
 * Seed Additional AI Tools from Research
 * 
 * Adds tools from ChatGPT deep research:
 * - AI IDEs: Augment Code, JetBrains AI Assistant
 * - Code Assistants: IntelliCode, CodeGeeX, AskCodi, CodeGPT
 * - AI Terminals: Gemini CLI
 * - App Builders: Anything (Create.xyz), DronaHQ
 * - UI Generators: Locofy.ai, TeleportHQ
 * - Code Review: Qodo, CodeRabbit
 * 
 * Run with: tsx scripts/db/seed-additional-ai-tools.ts
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

const ADDITIONAL_TOOLS = [
  // AI IDEs
  {
    id: 'augment-code',
    name: 'Augment Code',
    tagline: 'AI-powered development platform with deep codebase indexing',
    description: 'Augment Code is an AI-powered development platform that deeply indexes your codebase to drive intelligent completions, natural-language instructions, and multi-file "agents" in editors like VS Code, JetBrains, and Vim/Neovim. It focuses on enterprise-scale workflows with full project awareness, enabling developers to work with large codebases more efficiently through intelligent code understanding and generation.',
    category: 'ide',
    pricing: {
      free: false,
      paid: {
        monthly: 30,
        tier: 'Pro',
      },
    },
    features: [
      'Deep codebase indexing',
      'Intelligent code completions',
      'Natural-language instructions',
      'Multi-file agent capabilities',
      'VS Code, JetBrains, Vim/Neovim support',
      'Enterprise-scale workflow support',
      'Full project awareness',
    ],
    pros: [
      'Deep codebase understanding',
      'Multi-editor support',
      'Enterprise-focused features',
      'Advanced agentic capabilities',
      'Natural language interaction',
    ],
    cons: [
      'Requires codebase indexing time',
      'Learning curve for advanced features',
      'May be resource-intensive for large projects',
    ],
    tags: ['ide', 'codebase-indexing', 'multi-file', 'enterprise', 'agents'],
    icon: 'code',
    websiteUrl: 'https://www.augmentcode.com/',
  },

  {
    id: 'jetbrains-ai-assistant',
    name: 'JetBrains AI Assistant',
    tagline: 'Contextual AI code suggestions within JetBrains IDEs',
    description: 'JetBrains AI Assistant is an IntelliJ plugin that offers contextual code suggestions, explanations, and documentation within JetBrains IDEs. It provides intelligent code completion, refactoring suggestions, and natural language explanations of code, all within the familiar JetBrains development environment. The assistant understands your project context and provides relevant suggestions based on your codebase.',
    category: 'code-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 10, // Estimated
        tier: 'Professional',
      },
    },
    features: [
      'Contextual code suggestions',
      'Code explanations',
      'Documentation generation',
      'IntelliJ, PyCharm, WebStorm support',
      'Project-aware completions',
      'Refactoring assistance',
      'Natural language code queries',
    ],
    pros: [
      'Deep JetBrains IDE integration',
      'Context-aware suggestions',
      'Familiar IDE environment',
      'Strong for Java/Kotlin development',
      'Project context understanding',
    ],
    cons: [
      'Limited to JetBrains IDEs',
      'Requires JetBrains subscription',
      'May have performance impact',
    ],
    tags: ['code-assistant', 'jetbrains', 'intellij', 'ide-plugin', 'contextual'],
    icon: 'code',
    websiteUrl: 'https://www.jetbrains.com/ai/',
  },

  // Code Assistants
  {
    id: 'microsoft-intellicode',
    name: 'Microsoft IntelliCode',
    tagline: 'ML-based code completions built into Visual Studio and VS Code',
    description: 'Microsoft IntelliCode is an AI-powered code completion tool built into Visual Studio and VS Code. It uses machine learning to provide intelligent code suggestions based on patterns learned from thousands of open-source projects. IntelliCode offers context-aware completions, suggests entire lines of code, and learns from your coding patterns to provide increasingly relevant suggestions.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Free',
      },
    },
    features: [
      'ML-based code completions',
      'Context-aware suggestions',
      'Visual Studio integration',
      'VS Code integration',
      'Learns from open-source projects',
      'Multi-language support',
      'Whole-line completions',
    ],
    pros: [
      'Free and built-in',
      'Works in Visual Studio and VS Code',
      'Learns from your patterns',
      'No additional setup required',
      'Strong Microsoft ecosystem integration',
    ],
    cons: [
      'Limited to Microsoft ecosystem',
      'May be less advanced than paid alternatives',
      'Requires internet for some features',
    ],
    tags: ['code-assistant', 'microsoft', 'visual-studio', 'vscode', 'ml', 'free'],
    icon: 'code',
    websiteUrl: 'https://visualstudio.microsoft.com/services/intellicode/',
  },

  {
    id: 'codegeex',
    name: 'CodeGeeX',
    tagline: 'Open-source AI code assistant with multi-language support',
    description: 'CodeGeeX is an open-source AI code assistant that provides intelligent code completions and generation across multiple programming languages. It offers both online and offline capabilities, making it suitable for developers who need privacy-focused AI assistance. CodeGeeX supports code generation, translation, and explanation across a wide range of programming languages.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Open-source code assistant',
      'Multi-language support',
      'Code generation',
      'Code translation',
      'Code explanation',
      'Offline capabilities',
      'Privacy-focused',
      'VS Code extension',
    ],
    pros: [
      'Completely open-source',
      'Privacy-focused',
      'Offline capabilities',
      'Multi-language support',
      'Free to use',
    ],
    cons: [
      'May be less advanced than commercial alternatives',
      'Requires setup for offline mode',
      'Community-driven support',
    ],
    tags: ['code-assistant', 'open-source', 'multi-language', 'privacy', 'free'],
    icon: 'code',
    websiteUrl: 'https://codegeex.cn/',
  },

  {
    id: 'askcodi',
    name: 'AskCodi',
    tagline: 'AI chatbot for coding assistance and code generation',
    description: 'AskCodi is an AI-powered chatbot designed specifically for coding assistance. It helps developers generate code, answer technical questions, and provide coding guidance through natural language conversations. AskCodi integrates with popular IDEs and provides context-aware suggestions based on your codebase and coding patterns.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 9,
        tier: 'Pro',
      },
    },
    features: [
      'AI chatbot for coding',
      'Code generation',
      'Technical Q&A',
      'IDE integration',
      'Natural language interface',
      'Context-aware suggestions',
      'Multi-language support',
    ],
    pros: [
      'Chat-based interface',
      'Natural language interaction',
      'Free tier available',
      'IDE integration',
      'Helpful for learning',
    ],
    cons: [
      'Chat interface may be slower than inline completions',
      'Requires clear prompts',
      'May need refinement for complex tasks',
    ],
    tags: ['code-assistant', 'chatbot', 'code-generation', 'qa', 'natural-language'],
    icon: 'message-square',
    websiteUrl: 'https://www.askcodi.com/',
  },

  {
    id: 'codegpt',
    name: 'CodeGPT',
    tagline: 'AI coding assistant chatbot for developers',
    description: 'CodeGPT is an AI-powered coding assistant that provides chat-based code generation, explanation, and debugging assistance. It integrates with popular IDEs and offers natural language interaction for coding tasks. CodeGPT helps developers understand code, generate implementations, and solve coding challenges through conversational AI.',
    category: 'code-assistant',
    pricing: {
      free: true,
      paid: {
        monthly: 8,
        tier: 'BYOK Pro',
      },
    },
    features: [
      'Chat-based code assistant',
      'Code generation',
      'Code explanation',
      'Debugging assistance',
      'IDE integration',
      'Natural language interface',
      'Multi-language support',
    ],
    pros: [
      'Conversational interface',
      'Good for learning and exploration',
      'Free tier available',
      'IDE integration',
      'Helpful explanations',
    ],
    cons: [
      'Chat interface workflow',
      'May require multiple interactions',
      'Less immediate than inline completions',
    ],
    tags: ['code-assistant', 'chatbot', 'code-generation', 'debugging', 'natural-language'],
    icon: 'message-square',
    websiteUrl: 'https://www.codegpt.co/',
  },

  // AI Terminals
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    tagline: "Google's open-source AI agent for the command line",
    description: 'Gemini CLI is Google\'s open-source AI agent for the command line that brings Google\'s Gemini model into your shell. It allows natural-language queries and code generation directly in the terminal. Gemini CLI excels at coding-related tasks and can handle documentation, code search, and even image generation through built-in tools. It provides a seamless way to interact with AI capabilities from the command line.',
    category: 'ai-terminal',
    pricing: {
      free: true,
      paid: {
        monthly: 0,
        tier: 'Open Source',
      },
    },
    features: [
      'Open-source CLI AI agent',
      'Natural language terminal queries',
      'Code generation in terminal',
      'Documentation assistance',
      'Code search capabilities',
      'Image generation support',
      'Gemini model integration',
      'Cross-platform support',
    ],
    pros: [
      'Open-source and free',
      'Powerful Gemini model',
      'Terminal-native workflow',
      'Excellent for coding tasks',
      'Image generation support',
    ],
    cons: [
      'Requires API key setup',
      'Terminal-only interface',
      'Learning curve for CLI usage',
    ],
    tags: ['terminal', 'cli', 'gemini', 'open-source', 'google', 'natural-language'],
    icon: 'terminal',
    websiteUrl: 'https://github.com/google-gemini/gemini-cli',
    marketplaceLinks: {
      github: 'https://github.com/google-gemini/gemini-cli',
    },
  },

  // App Builders
  {
    id: 'anything-create',
    name: 'Anything (Create.xyz)',
    tagline: 'Text-to-app builder turning words into sites, tools, and apps',
    description: 'Anything (Create.xyz) is a text-to-app builder where "your words [are turned] into sites, tools, apps and products... built with code" using GPT-4o. It enables rapid prototyping and development by converting natural language descriptions into functional applications. Anything supports building web applications, tools, and products through conversational AI, making app development accessible to non-technical users.',
    category: 'builder',
    pricing: {
      free: true,
      paid: {
        monthly: 20, // Estimated
        tier: 'Pro',
      },
    },
    features: [
      'Text-to-app generation',
      'GPT-4o powered',
      'Rapid prototyping',
      'Natural language to code',
      'Web app generation',
      'Tool creation',
      'Product development',
      'Non-technical friendly',
    ],
    pros: [
      'Very accessible for non-developers',
      'Rapid prototyping',
      'Natural language interface',
      'GPT-4o powered',
      'Free tier available',
    ],
    cons: [
      'May require refinement',
      'Limited customization',
      'Dependent on AI interpretation',
    ],
    tags: ['builder', 'text-to-app', 'gpt-4', 'rapid-prototyping', 'no-code'],
    icon: 'sparkles',
    websiteUrl: 'https://create.xyz',
  },

  {
    id: 'dronahq',
    name: 'DronaHQ',
    tagline: 'Low-code platform with AI features for app development',
    description: 'DronaHQ is a low-code platform with AI features that enables rapid application development. It provides visual builders, pre-built components, and AI-assisted development capabilities to help teams build applications faster. DronaHQ supports building web and mobile applications with integrated AI features for enhanced productivity.',
    category: 'builder',
    pricing: {
      free: true,
      paid: {
        monthly: 25, // Estimated
        tier: 'Professional',
      },
    },
    features: [
      'Low-code platform',
      'AI-assisted development',
      'Visual builders',
      'Pre-built components',
      'Web and mobile app support',
      'Rapid development',
      'Enterprise features',
    ],
    pros: [
      'Low-code approach',
      'AI assistance',
      'Rapid development',
      'Enterprise features',
      'Visual interface',
    ],
    cons: [
      'Platform lock-in',
      'Limited customization',
      'Learning curve',
    ],
    tags: ['builder', 'low-code', 'ai-assisted', 'enterprise', 'visual-builder'],
    icon: 'layout',
    websiteUrl: 'https://www.dronahq.com/',
  },

  // UI Generators
  {
    id: 'locofy-ai',
    name: 'Locofy.ai',
    tagline: 'Convert Figma/Sketch designs to production-ready React/Flutter code',
    description: 'Locofy.ai converts Figma and Sketch designs into production-ready React, Flutter, and other framework code. It emphasizes converting design mockups into high-quality, maintainable code that developers can use directly in production. Locofy.ai maintains design fidelity while generating clean, component-based code that follows best practices.',
    category: 'ui-generator',
    pricing: {
      free: true,
      paid: {
        monthly: 29, // Estimated
        tier: 'Pro',
      },
    },
    features: [
      'Figma to code',
      'Sketch to code',
      'React code generation',
      'Flutter code generation',
      'Production-ready code',
      'Component-based output',
      'Design fidelity preservation',
      'Multiple framework support',
    ],
    pros: [
      'Design-to-code workflow',
      'Production-ready output',
      'Multiple framework support',
      'Maintains design fidelity',
      'Component-based architecture',
    ],
    cons: [
      'Requires design files',
      'May need code refinement',
      'Design tool dependency',
    ],
    tags: ['ui-generator', 'figma', 'sketch', 'react', 'flutter', 'design-to-code'],
    icon: 'palette',
    websiteUrl: 'https://www.locofy.ai/',
  },

  {
    id: 'teleporthq',
    name: 'TeleportHQ',
    tagline: 'Generate HTML/CSS from design mockups with AI assistance',
    description: 'TeleportHQ generates HTML and CSS code from design mockups, enabling designers and developers to quickly convert visual designs into functional code. It provides AI-assisted code generation that maintains design consistency and produces clean, semantic HTML and CSS. TeleportHQ supports responsive design generation and component-based architectures.',
    category: 'ui-generator',
    pricing: {
      free: true,
      paid: {
        monthly: 19, // Estimated
        tier: 'Pro',
      },
    },
    features: [
      'Design mockup to HTML/CSS',
      'AI-assisted generation',
      'Responsive design support',
      'Component-based output',
      'Semantic HTML generation',
      'Clean CSS output',
      'Design consistency',
    ],
    pros: [
      'Fast design-to-code conversion',
      'Responsive output',
      'Semantic HTML',
      'AI assistance',
      'Free tier available',
    ],
    cons: [
      'Limited to HTML/CSS',
      'May need refinement',
      'Design file dependency',
    ],
    tags: ['ui-generator', 'html', 'css', 'design-to-code', 'responsive'],
    icon: 'palette',
    websiteUrl: 'https://teleporthq.io/',
  },

  // Code Review Tools
  {
    id: 'qodo',
    name: 'Qodo',
    tagline: 'AI-powered code quality platform with end-to-end code review',
    description: 'Qodo is an AI-powered code quality platform that emphasizes end-to-end code review, test generation, and compliance. It integrates into VS Code, JetBrains IDEs, and CI pipelines, providing "agentic" code review agents and test generators. Qodo helps teams maintain code quality, catch bugs early, and ensure compliance with coding standards through intelligent automation.',
    category: 'code-review',
    pricing: {
      free: true,
      paid: {
        monthly: 15, // Estimated
        tier: 'Team',
      },
    },
    features: [
      'AI-powered code review',
      'Test generation',
      'Compliance checking',
      'VS Code integration',
      'JetBrains integration',
      'CI pipeline integration',
      'Agentic code review agents',
      'Automated quality checks',
    ],
    pros: [
      'Comprehensive code quality',
      'Test generation',
      'CI/CD integration',
      'Multiple IDE support',
      'Compliance features',
    ],
    cons: [
      'May require configuration',
      'Learning curve',
      'Can be opinionated',
    ],
    tags: ['code-review', 'code-quality', 'testing', 'compliance', 'ci-cd'],
    icon: 'shield-check',
    websiteUrl: 'https://www.qodo.ai/',
  },

  {
    id: 'coderabbit',
    name: 'CodeRabbit',
    tagline: 'AI code reviews in-editor with auto-learning from feedback',
    description: 'CodeRabbit offers AI code reviews directly in your editor. It auto-learns from user feedback and provides pull-request summaries and fixes, even from a simple chat interface. CodeRabbit provides contextual code review suggestions, identifies potential issues, and helps maintain code quality throughout the development process. It learns from your team\'s coding patterns and preferences.',
    category: 'code-review',
    pricing: {
      free: true,
      paid: {
        monthly: 12, // Estimated
        tier: 'Pro',
      },
    },
    features: [
      'In-editor code reviews',
      'Auto-learning from feedback',
      'Pull request summaries',
      'Chat-based fixes',
      'Contextual suggestions',
      'Issue identification',
      'Team pattern learning',
      'GitHub integration',
    ],
    pros: [
      'In-editor experience',
      'Learns from feedback',
      'Chat-based interaction',
      'GitHub integration',
      'Free tier available',
    ],
    cons: [
      'GitHub-focused',
      'May need training period',
      'Requires feedback for learning',
    ],
    tags: ['code-review', 'in-editor', 'auto-learning', 'github', 'pull-requests'],
    icon: 'git-pull-request',
    websiteUrl: 'https://www.coderabbit.ai/',
  },

  // Agentic Assistants
  {
    id: 'zencoder',
    name: 'Zencoder',
    tagline: 'The most integrated, customizable, and intuitive coding agent',
    description: 'Zencoder is an AI coding agent designed to handle routine development tasks like bug fixing, refactoring, and new feature development using advanced AI workflows. It features Agentic Chat for unprecedented collaboration between human and AI with self-reasoning agents, Coffee Mode for autonomous agent execution, and Repo Grokking™ technology that deeply understands your codebase context. Zencoder integrates with 20+ tools including Jira, Sentry, GitHub, and GitLab, and offers enterprise-grade security with ISO 27001, GDPR, CCPA, and SOC 2 compliance.',
    category: 'agentic-assistant',
    pricing: {
      free: false,
      paid: {
        monthly: 0, // Pricing not publicly disclosed, free 14-day trial available
        tier: 'Pro',
      },
    },
    features: [
      'Agentic Chat with self-reasoning agents',
      'Coffee Mode for autonomous code execution',
      'Repo Grokking™ - deep codebase understanding',
      'Agentic Pipeline - self-improving AI with feedback loops',
      'Code generation and autocomplete',
      'Unit test generation',
      'Code review and quality checks',
      'Custom agents for specific workflows',
      'VS Code and JetBrains IDE integration',
      '20+ platform integrations (Jira, Sentry, GitHub, GitLab)',
      'Multi-language support (Python, Java, JavaScript, TypeScript, C#, Kotlin)',
      'Real-time error detection and fixes',
      'Enterprise security (ISO 27001, GDPR, CCPA, SOC 2)',
      'SSO, SAML, and audit trails',
      'Admin portal and team management',
    ],
    pros: [
      'Deep repository understanding with Repo Grokking™',
      'Autonomous agent execution (Coffee Mode)',
      'Self-improving AI pipeline with feedback loops',
      'Extensive integrations (20+ tools)',
      'Enterprise-grade security and compliance',
      'Seamless IDE integration',
      'Multi-language support',
      'Real-time error detection and fixes',
      'Custom agent creation',
    ],
    cons: [
      'Pricing not publicly disclosed',
      'Requires setup and configuration',
      'Learning curve for advanced features',
      'May be resource-intensive for large projects',
    ],
    tags: ['agentic-assistant', 'ide-integration', 'enterprise', 'code-generation', 'testing', 'code-review', 'integrations'],
    icon: 'sparkles',
    websiteUrl: 'https://zencoder.ai/',
    badges: ['vscode-plugin', 'jetbrains-plugin', 'enterprise'],
    supportedModels: ['Gemini', 'GPT-4', 'Claude'], // Inferring from context
    agentCapabilities: [
      'code-generation',
      'test-generation',
      'refactoring',
      'code-review',
      'bug-fixing',
      'file-creation',
      'autonomous-execution',
      'error-detection',
      'custom-agents',
    ],
    marketplaceLinks: {
      vscode: undefined, // VS Code extension available, URL not specified
      jetbrains: undefined, // JetBrains plugin available, URL not specified
    },
  },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('ai_tools');

    console.log('📝 Seeding additional AI tools from research...\n');

    let created = 0;
    let updated = 0;

    for (const toolData of ADDITIONAL_TOOLS) {
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
    console.log(`   - Updated: ${updated} tools\n`);

  } catch (error) {
    logger.error('Failed to seed additional AI tools', {
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

