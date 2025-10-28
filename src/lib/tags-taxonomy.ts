/**
 * Hierarchical Tag Taxonomy for Learning Resources
 * 
 * Structure: Category → Subcategory → Tags
 * Enables filtering, navigation, and SEO
 */

export interface TagCategory {
  id: string;
  name: string;
  description: string;
  subcategories: TagSubcategory[];
}

export interface TagSubcategory {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoKeywords?: string[];
  relatedTags?: string[]; // IDs of related tags
}

/**
 * Complete Tag Taxonomy
 */
export const tagTaxonomy: TagCategory[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Core concepts and basics',
    subcategories: [
      {
        id: 'llm-basics',
        name: 'LLM Basics',
        description: 'Understanding large language models',
        tags: [
          {
            id: 'llm',
            name: 'LLM',
            slug: 'llm',
            description: 'Large Language Models',
            seoKeywords: ['large language model', 'llm', 'ai model'],
          },
          {
            id: 'tokens',
            name: 'Tokens',
            slug: 'tokens',
            description: 'Token usage and limits',
            seoKeywords: ['tokens', 'tokenization', 'context window'],
          },
          {
            id: 'context-window',
            name: 'Context Window',
            slug: 'context-window',
            description: 'Understanding context limits',
            seoKeywords: ['context window', 'context length', 'token limit'],
          },
          {
            id: 'embeddings',
            name: 'Embeddings',
            slug: 'embeddings',
            description: 'Vector representations of text',
            seoKeywords: ['embeddings', 'vectors', 'semantic search'],
          },
        ],
      },
      {
        id: 'prompt-basics',
        name: 'Prompt Engineering Basics',
        description: 'Core prompting techniques',
        tags: [
          {
            id: 'prompt-engineering',
            name: 'Prompt Engineering',
            slug: 'prompt-engineering',
            description: 'Art and science of prompting',
            seoKeywords: ['prompt engineering', 'prompting', 'ai prompts'],
          },
          {
            id: 'few-shot',
            name: 'Few-Shot Learning',
            slug: 'few-shot',
            description: 'Learning from examples',
            seoKeywords: ['few-shot', 'examples', 'in-context learning'],
          },
          {
            id: 'zero-shot',
            name: 'Zero-Shot',
            slug: 'zero-shot',
            description: 'No examples needed',
            seoKeywords: ['zero-shot', 'no examples'],
          },
          {
            id: 'chain-of-thought',
            name: 'Chain-of-Thought',
            slug: 'chain-of-thought',
            description: 'Step-by-step reasoning',
            seoKeywords: ['chain of thought', 'cot', 'reasoning'],
          },
        ],
      },
    ],
  },
  {
    id: 'advanced-techniques',
    name: 'Advanced Techniques',
    description: 'Advanced prompting and AI patterns',
    subcategories: [
      {
        id: 'rag',
        name: 'RAG (Retrieval-Augmented Generation)',
        description: 'Combining retrieval with generation',
        tags: [
          {
            id: 'rag',
            name: 'RAG',
            slug: 'rag',
            description: 'Retrieval-Augmented Generation',
            seoKeywords: ['rag', 'retrieval augmented generation', 'vector search'],
            relatedTags: ['embeddings', 'vector-db'],
          },
          {
            id: 'vector-db',
            name: 'Vector Databases',
            slug: 'vector-db',
            description: 'Storing and searching embeddings',
            seoKeywords: ['vector database', 'pinecone', 'weaviate', 'chroma'],
            relatedTags: ['rag', 'embeddings'],
          },
          {
            id: 'semantic-search',
            name: 'Semantic Search',
            slug: 'semantic-search',
            description: 'Meaning-based search',
            seoKeywords: ['semantic search', 'similarity search'],
            relatedTags: ['embeddings', 'rag'],
          },
        ],
      },
      {
        id: 'agents',
        name: 'AI Agents',
        description: 'Autonomous AI systems',
        tags: [
          {
            id: 'agents',
            name: 'AI Agents',
            slug: 'agents',
            description: 'Autonomous AI systems',
            seoKeywords: ['ai agents', 'autonomous ai', 'agent systems'],
          },
          {
            id: 'multi-agent',
            name: 'Multi-Agent Systems',
            slug: 'multi-agent',
            description: 'Multiple agents working together',
            seoKeywords: ['multi-agent', 'agent collaboration'],
            relatedTags: ['agents'],
          },
          {
            id: 'function-calling',
            name: 'Function Calling',
            slug: 'function-calling',
            description: 'LLMs using tools and APIs',
            seoKeywords: ['function calling', 'tool use', 'api integration'],
            relatedTags: ['agents'],
          },
          {
            id: 'tool-use',
            name: 'Tool Use',
            slug: 'tool-use',
            description: 'AI using external tools',
            seoKeywords: ['tool use', 'tools', 'api calls'],
            relatedTags: ['function-calling', 'agents'],
          },
        ],
      },
      {
        id: 'workflows',
        name: 'Workflows & Orchestration',
        description: 'Complex AI workflows',
        tags: [
          {
            id: 'prompt-chaining',
            name: 'Prompt Chaining',
            slug: 'prompt-chaining',
            description: 'Connecting multiple prompts',
            seoKeywords: ['prompt chaining', 'workflow', 'orchestration'],
          },
          {
            id: 'langchain',
            name: 'LangChain',
            slug: 'langchain',
            description: 'LangChain framework',
            seoKeywords: ['langchain', 'framework', 'orchestration'],
          },
          {
            id: 'llamaindex',
            name: 'LlamaIndex',
            slug: 'llamaindex',
            description: 'LlamaIndex framework',
            seoKeywords: ['llamaindex', 'framework', 'data'],
          },
        ],
      },
    ],
  },
  {
    id: 'production',
    name: 'Production & Engineering',
    description: 'Building production AI systems',
    subcategories: [
      {
        id: 'testing',
        name: 'Testing & Quality',
        description: 'Testing and evaluating prompts',
        tags: [
          {
            id: 'testing',
            name: 'Testing',
            slug: 'testing',
            description: 'Prompt testing strategies',
            seoKeywords: ['testing', 'evaluation', 'quality assurance'],
          },
          {
            id: 'evaluation',
            name: 'Evaluation',
            slug: 'evaluation',
            description: 'Measuring prompt quality',
            seoKeywords: ['evaluation', 'metrics', 'measurement'],
          },
          {
            id: 'ab-testing',
            name: 'A/B Testing',
            slug: 'ab-testing',
            description: 'Comparing prompt variants',
            seoKeywords: ['a/b testing', 'split testing', 'comparison'],
          },
        ],
      },
      {
        id: 'optimization',
        name: 'Optimization',
        description: 'Performance and cost optimization',
        tags: [
          {
            id: 'cost-optimization',
            name: 'Cost Optimization',
            slug: 'cost-optimization',
            description: 'Reducing AI costs',
            seoKeywords: ['cost optimization', 'reduce costs', 'budget'],
          },
          {
            id: 'performance',
            name: 'Performance',
            slug: 'performance',
            description: 'Speed and efficiency',
            seoKeywords: ['performance', 'speed', 'latency'],
          },
          {
            id: 'caching',
            name: 'Caching',
            slug: 'caching',
            description: 'Caching strategies',
            seoKeywords: ['caching', 'cache', 'optimization'],
          },
        ],
      },
      {
        id: 'monitoring',
        name: 'Monitoring & Observability',
        description: 'Tracking production systems',
        tags: [
          {
            id: 'monitoring',
            name: 'Monitoring',
            slug: 'monitoring',
            description: 'System monitoring',
            seoKeywords: ['monitoring', 'observability', 'tracking'],
          },
          {
            id: 'logging',
            name: 'Logging',
            slug: 'logging',
            description: 'Logging best practices',
            seoKeywords: ['logging', 'logs', 'audit'],
          },
          {
            id: 'analytics',
            name: 'Analytics',
            slug: 'analytics',
            description: 'Usage analytics',
            seoKeywords: ['analytics', 'metrics', 'insights'],
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    name: 'Security & Safety',
    description: 'Secure and safe AI systems',
    subcategories: [
      {
        id: 'security',
        name: 'Security',
        description: 'AI security practices',
        tags: [
          {
            id: 'prompt-injection',
            name: 'Prompt Injection',
            slug: 'prompt-injection',
            description: 'Preventing prompt attacks',
            seoKeywords: ['prompt injection', 'security', 'attacks'],
          },
          {
            id: 'data-privacy',
            name: 'Data Privacy',
            slug: 'data-privacy',
            description: 'Protecting user data',
            seoKeywords: ['data privacy', 'gdpr', 'compliance'],
          },
          {
            id: 'pii',
            name: 'PII Protection',
            slug: 'pii',
            description: 'Handling personal information',
            seoKeywords: ['pii', 'personal information', 'privacy'],
          },
        ],
      },
      {
        id: 'safety',
        name: 'AI Safety',
        description: 'Safe and responsible AI',
        tags: [
          {
            id: 'safety',
            name: 'AI Safety',
            slug: 'safety',
            description: 'Safe AI practices',
            seoKeywords: ['ai safety', 'responsible ai', 'ethics'],
          },
          {
            id: 'bias',
            name: 'Bias Detection',
            slug: 'bias',
            description: 'Identifying and mitigating bias',
            seoKeywords: ['bias', 'fairness', 'ethics'],
          },
          {
            id: 'hallucination',
            name: 'Hallucination Prevention',
            slug: 'hallucination',
            description: 'Reducing false information',
            seoKeywords: ['hallucination', 'accuracy', 'factuality'],
          },
        ],
      },
    ],
  },
  {
    id: 'providers',
    name: 'AI Providers',
    description: 'Specific AI model providers',
    subcategories: [
      {
        id: 'providers',
        name: 'Model Providers',
        description: 'AI service providers',
        tags: [
          {
            id: 'openai',
            name: 'OpenAI',
            slug: 'openai',
            description: 'OpenAI models (GPT-4, GPT-3.5)',
            seoKeywords: ['openai', 'gpt-4', 'gpt-3.5', 'chatgpt'],
          },
          {
            id: 'anthropic',
            name: 'Anthropic',
            slug: 'anthropic',
            description: 'Anthropic Claude models',
            seoKeywords: ['anthropic', 'claude', 'claude 3'],
          },
          {
            id: 'google',
            name: 'Google',
            slug: 'google',
            description: 'Google Gemini models',
            seoKeywords: ['google', 'gemini', 'palm'],
          },
          {
            id: 'groq',
            name: 'Groq',
            slug: 'groq',
            description: 'Groq fast inference',
            seoKeywords: ['groq', 'fast inference', 'llama'],
          },
        ],
      },
    ],
  },
  {
    id: 'use-cases',
    name: 'Use Cases',
    description: 'Industry and application-specific',
    subcategories: [
      {
        id: 'business',
        name: 'Business Applications',
        description: 'Business use cases',
        tags: [
          {
            id: 'customer-support',
            name: 'Customer Support',
            slug: 'customer-support',
            description: 'AI for support',
            seoKeywords: ['customer support', 'chatbot', 'helpdesk'],
          },
          {
            id: 'sales',
            name: 'Sales',
            slug: 'sales',
            description: 'AI for sales',
            seoKeywords: ['sales', 'outreach', 'lead generation'],
          },
          {
            id: 'marketing',
            name: 'Marketing',
            slug: 'marketing',
            description: 'AI for marketing',
            seoKeywords: ['marketing', 'content', 'seo'],
          },
        ],
      },
      {
        id: 'engineering',
        name: 'Engineering',
        description: 'Developer use cases',
        tags: [
          {
            id: 'code-generation',
            name: 'Code Generation',
            slug: 'code-generation',
            description: 'Generating code with AI',
            seoKeywords: ['code generation', 'copilot', 'coding'],
          },
          {
            id: 'code-review',
            name: 'Code Review',
            slug: 'code-review',
            description: 'AI code review',
            seoKeywords: ['code review', 'quality', 'bugs'],
          },
          {
            id: 'debugging',
            name: 'Debugging',
            slug: 'debugging',
            description: 'AI-assisted debugging',
            seoKeywords: ['debugging', 'troubleshooting', 'errors'],
          },
        ],
      },
    ],
  },
];

/**
 * Flatten all tags for easy lookup
 */
export function getAllTags(): Tag[] {
  const tags: Tag[] = [];
  
  tagTaxonomy.forEach(category => {
    category.subcategories.forEach(subcategory => {
      tags.push(...subcategory.tags);
    });
  });
  
  return tags;
}

/**
 * Get tag by ID
 */
export function getTagById(id: string): Tag | undefined {
  return getAllTags().find(tag => tag.id === id);
}

/**
 * Get tag by slug
 */
export function getTagBySlug(slug: string): Tag | undefined {
  return getAllTags().find(tag => tag.slug === slug);
}

/**
 * Get tags by category
 */
export function getTagsByCategory(categoryId: string): Tag[] {
  const category = tagTaxonomy.find(c => c.id === categoryId);
  if (!category) return [];
  
  const tags: Tag[] = [];
  category.subcategories.forEach(sub => {
    tags.push(...sub.tags);
  });
  
  return tags;
}

/**
 * Get related tags
 */
export function getRelatedTags(tagId: string): Tag[] {
  const tag = getTagById(tagId);
  if (!tag || !tag.relatedTags) return [];
  
  return tag.relatedTags
    .map(id => getTagById(id))
    .filter((t): t is Tag => t !== undefined);
}

/**
 * Suggest tags based on content
 */
export function suggestTags(title: string, description: string, content?: string): string[] {
  const text = `${title} ${description} ${content || ''}`.toLowerCase();
  const suggestedTags: string[] = [];
  
  getAllTags().forEach(tag => {
    // Check if tag keywords appear in content
    const keywords = [tag.name.toLowerCase(), ...(tag.seoKeywords || [])];
    
    if (keywords.some(keyword => text.includes(keyword))) {
      suggestedTags.push(tag.id);
    }
  });
  
  return suggestedTags;
}
