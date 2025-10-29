/**
 * Gemini Deep Research Integration (Updated for v2 AI System)
 * Uses Gemini's 2M token context window for comprehensive research
 */

import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

export interface GeminiResearchRequest {
  topic: string;
  context?: string;
  depth?: 'quick' | 'standard' | 'deep';
  outputFormat?: 'markdown' | 'json' | 'structured';
  preset?: 'prompt-patterns' | 'architecture' | 'security' | 'performance';
}

export interface GeminiResearchResult {
  content: string;
  metadata: {
    topic: string;
    depth: string;
    outputFormat: string;
    preset?: string;
    researchAreas: string[];
    sources: string[];
    tokenUsage: {
      input: number;
      output: number;
      total: number;
    };
    processingTime: number;
  };
}

// Using static factory methods; no instance needed

/**
 * Conduct comprehensive research using Gemini's large context window
 */
export async function conductGeminiResearch(
  request: GeminiResearchRequest
): Promise<GeminiResearchResult> {
  const startTime = Date.now();

  // Get Gemini provider
  const geminiProvider = AIProviderFactory.create('gemini-pro');
  if (!geminiProvider) {
    throw new Error('Gemini provider not available');
  }

  // Build research prompt based on preset
  let systemPrompt = '';
  let researchPrompt = '';

  if (request.preset === 'prompt-patterns') {
    systemPrompt = `You are a senior AI research specialist with expertise in prompt engineering and software development. Your task is to conduct comprehensive research and provide detailed, actionable insights.`;
    researchPrompt = buildPromptPatternsResearchPrompt(
      request.topic,
      request.context
    );
  } else if (request.preset === 'architecture') {
    systemPrompt = `You are a senior software architect with expertise in system design and enterprise patterns. Your task is to conduct comprehensive research on software architecture topics.`;
    researchPrompt = buildArchitectureResearchPrompt(
      request.topic,
      request.context
    );
  } else {
    systemPrompt = `You are a senior research specialist with expertise in software engineering and technology. Your task is to conduct comprehensive research and provide detailed, actionable insights.`;
    researchPrompt = buildGeneralResearchPrompt(
      request.topic,
      request.context,
      request.depth
    );
  }

  // Execute research
  const response = await geminiProvider.execute({
    prompt: researchPrompt,
    systemPrompt,
    temperature: 0.3, // Lower temperature for more consistent research
    maxTokens: 8000, // Use Gemini's large context window
  });

  const processingTime = Date.now() - startTime;

  return {
    content: response.content,
    metadata: {
      topic: request.topic,
      depth: request.depth || 'standard',
      outputFormat: request.outputFormat || 'markdown',
      preset: request.preset,
      researchAreas: extractResearchAreas(response.content),
      sources: extractSources(response.content),
      tokenUsage: {
        input: response.usage.promptTokens,
        output: response.usage.completionTokens,
        total: response.usage.totalTokens,
      },
      processingTime,
    },
  };
}

/**
 * Research prompt engineering patterns
 */
export async function researchPromptPatterns(): Promise<GeminiResearchResult> {
  return conductGeminiResearch({
    topic: 'Prompt Engineering Patterns for Software Engineering',
    preset: 'prompt-patterns',
    depth: 'deep',
    outputFormat: 'structured',
  });
}

/**
 * Build research prompt for prompt patterns
 */
function buildPromptPatternsResearchPrompt(
  topic: string,
  context?: string
): string {
  return `
# Deep Research: ${topic}

## Research Objective
Identify and document the most effective prompt engineering patterns for software engineering and product management use cases, based on leading industry standards and certifications.

## Research Areas

### 1. Industry Standards & Certifications
Research prompt engineering best practices from:
- OpenAI (GPT-4 Prompt Engineering Guide)
- Anthropic (Claude Prompt Engineering)
- Google (Gemini Prompting Best Practices)
- AWS (Bedrock Prompt Engineering)
- Microsoft (Azure OpenAI Service)
- DeepLearning.AI (ChatGPT Prompt Engineering Course)
- Vanderbilt University (Prompt Engineering Patterns)

### 2. Core Patterns to Document
For each pattern, provide:
- **Name**: Official name from source
- **Definition**: What it is and how it works
- **Structure**: Template/format
- **Use Cases**: When to use it (especially for eng/product)
- **Token Efficiency**: Input/output token considerations
- **Examples**: Real-world engineering/product examples
- **Effectiveness**: Any published metrics or studies
- **Combinations**: Which patterns work well together

### 3. Software Engineering Specific Patterns
Focus on patterns that are particularly effective for:
- Code generation and review
- Architecture design and documentation
- Testing strategy development
- Performance optimization
- Security analysis
- DevOps automation
- Product requirement analysis
- User story creation
- Technical specification writing

## Output Format
Provide a comprehensive structured analysis with:
1. Executive summary
2. Detailed pattern documentation
3. Implementation guidelines
4. Best practices and recommendations
5. Common pitfalls to avoid

${context ? `\n## Additional Context\n${context}` : ''}

Please conduct thorough research and provide actionable insights that can be immediately applied in software engineering contexts.
`;
}

/**
 * Build research prompt for architecture topics
 */
function buildArchitectureResearchPrompt(
  topic: string,
  context?: string
): string {
  return `
# Deep Research: ${topic}

## Research Objective
Conduct comprehensive research on software architecture patterns, best practices, and implementation strategies.

## Research Areas

### 1. Architecture Patterns
- Microservices vs Monoliths
- Event-driven architecture
- CQRS and Event Sourcing
- Domain-driven design
- Clean Architecture
- Hexagonal Architecture
- SOLID principles in practice

### 2. Technology Considerations
- Scalability patterns
- Performance optimization
- Security architecture
- Data architecture
- Integration patterns
- Deployment strategies

### 3. Industry Best Practices
- AWS Well-Architected Framework
- Google Cloud Architecture Center
- Microsoft Azure Architecture Center
- Netflix Technology Blog
- Uber Engineering Blog
- Spotify Engineering Culture

## Output Format
Provide a comprehensive analysis with:
1. Executive summary
2. Architecture patterns and trade-offs
3. Implementation strategies
4. Technology recommendations
5. Migration considerations
6. Monitoring and observability

${context ? `\n## Additional Context\n${context}` : ''}

Please provide actionable insights for software architects and engineering teams.
`;
}

/**
 * Build general research prompt
 */
function buildGeneralResearchPrompt(
  topic: string,
  context?: string,
  depth?: string
): string {
  const depthInstructions = {
    quick: 'Provide a concise overview with key points and recommendations.',
    standard:
      'Provide comprehensive analysis with detailed explanations and examples.',
    deep: 'Provide exhaustive research with multiple perspectives, detailed analysis, and extensive examples.',
  };

  return `
# Deep Research: ${topic}

## Research Objective
Conduct ${depth || 'standard'} research on ${topic} with focus on practical applications in software engineering and technology.

## Research Approach
${depthInstructions[depth as keyof typeof depthInstructions] || depthInstructions.standard}

## Key Areas to Cover
1. Current state and trends
2. Best practices and methodologies
3. Tools and technologies
4. Implementation strategies
5. Common challenges and solutions
6. Future outlook and recommendations

## Output Format
Provide structured analysis with:
1. Executive summary
2. Detailed findings
3. Practical recommendations
4. Implementation guidelines
5. Resources and references

${context ? `\n## Additional Context\n${context}` : ''}

Please provide actionable insights that can be immediately applied in software engineering contexts.
`;
}

/**
 * Extract research areas from content
 */
function extractResearchAreas(content: string): string[] {
  const areas: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.match(/^#{1,3}\s+.+/) || line.match(/^\d+\.\s+.+/)) {
      areas.push(line.trim());
    }
  }

  return areas.slice(0, 10); // Limit to first 10 areas
}

/**
 * Extract sources from content
 */
function extractSources(content: string): string[] {
  const sources: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Look for URLs, citations, or references
    const urlMatch = line.match(/https?:\/\/[^\s]+/g);
    if (urlMatch) {
      sources.push(...urlMatch);
    }

    // Look for academic-style citations
    const citationMatch = line.match(/\[.*?\]\(.*?\)/g);
    if (citationMatch) {
      sources.push(...citationMatch);
    }
  }

  return [...new Set(sources)].slice(0, 20); // Remove duplicates and limit
}
