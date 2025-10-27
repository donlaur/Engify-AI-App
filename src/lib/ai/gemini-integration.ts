/**
 * Gemini Deep Research Integration
 * Uses Gemini's 2M token context window for comprehensive research
 */

import { sendAIRequest } from './client';

export interface GeminiResearchRequest {
  topic: string;
  context?: string;
  depth: 'quick' | 'standard' | 'deep';
  outputFormat?: 'markdown' | 'json';
}

export interface GeminiResearchResult {
  content: string;
  sources: string[];
  keyFindings: string[];
  recommendations: string[];
  metadata: {
    tokensUsed: number;
    researchTime: number;
    confidence: 'low' | 'medium' | 'high';
  };
}

/**
 * Conduct deep research using Gemini's massive context window
 */
export async function conductGeminiResearch(
  request: GeminiResearchRequest
): Promise<GeminiResearchResult> {
  const systemPrompt = buildResearchSystemPrompt(request.depth);
  const userPrompt = buildResearchPrompt(request);

  const response = await sendAIRequest({
    model: 'gemini-1.5-pro', // Use Pro for deep research
    prompt: userPrompt,
    systemPrompt,
    temperature: 0.3, // Lower for factual research
    maxTokens: 8000,
  });

  return parseResearchResponse(response.content, response);
}

/**
 * Research prompt engineering patterns (for PROMPT_PATTERNS_RESEARCH.md)
 */
export async function researchPromptPatterns(): Promise<GeminiResearchResult> {
  const prompt = `
# Deep Research: Prompt Engineering Patterns

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

### 3. Specific Patterns
**Core Patterns**:
1. Persona Pattern - Assigning roles/expertise
2. Audience Persona Pattern - Tailoring for specific audiences
3. Cognitive Verifier Pattern - Breaking down complex reasoning
4. Chain of Thought (CoT) - Step-by-step reasoning
5. Question Refinement Pattern - Clarifying before answering
6. Template Pattern - Structured response formats
7. Few-Shot Learning - Learning from examples
8. Context Control Pattern - Managing context efficiently
9. Output Formatting Pattern - Structured data (JSON, etc.)
10. Constraint Pattern - Setting clear boundaries

**Advanced Patterns**:
11. Tree of Thoughts - Exploring multiple reasoning paths
12. ReAct Pattern - Reasoning + Acting
13. Self-Consistency - Multiple reasoning paths to same answer
14. Meta-Prompting - Prompts that generate prompts
15. Retrieval Augmented Generation (RAG) - Context injection

### 4. Engineering-Specific Patterns
Focus on patterns for:
- Code review and analysis
- System design and architecture
- Debugging and troubleshooting
- Technical documentation
- API design
- Performance optimization
- Security analysis

### 5. Product-Specific Patterns
Focus on patterns for:
- Feature specification
- User story generation
- Requirements gathering
- Competitive analysis
- Roadmap planning
- User research analysis

### 6. Token Optimization Strategies
- Context compression techniques
- Efficient prompt structures
- When to use few-shot vs zero-shot
- Optimal prompt length by use case
- Trade-offs between token cost and accuracy

### 7. Multi-Provider Considerations
How patterns perform across:
- OpenAI GPT-4
- Anthropic Claude 3
- Google Gemini Pro
- Provider-specific optimizations
- Universal patterns that work everywhere

### 8. Quality Metrics
How to measure prompt effectiveness:
- Response accuracy
- Token efficiency
- Latency/performance
- Consistency across runs
- User satisfaction

### 9. Anti-Patterns
What NOT to do:
- Common mistakes in prompt engineering
- Patterns that waste tokens
- Approaches that reduce quality
- Security risks (injection, jailbreaks)

### 10. Future Trends
- Latest research from 2024-2025
- Experimental patterns showing promise
- Industry direction and evolution

## Output Format
For each pattern, provide:

\`\`\`markdown
## [Pattern Name]

**Source**: [Company/Certification]
**Category**: [Role/Reasoning/Structure/Efficiency/Constraint]
**Experience Level**: [Beginner/Intermediate/Expert]

### Definition
[Clear explanation]

### When to Use
- [Use case 1]
- [Use case 2]
- [Use case 3]

### Structure/Template
\`\`\`
[Actual prompt template with variables]
\`\`\`

### Engineering Example
\`\`\`
[Real example for code review/debugging/architecture]
\`\`\`

### Product Example
\`\`\`
[Real example for feature spec/user story/analysis]
\`\`\`

### Token Efficiency
- Input tokens: [Estimate]
- Output tokens: [Estimate]
- Efficiency rating: [Low/Medium/High]

### Effectiveness Metrics
- Accuracy: [If available]
- Consistency: [If available]

### Combinations
Works well with: [Other patterns]

### Common Mistakes
- [Mistake 1]
- [Mistake 2]

### Best Practices
- [Practice 1]
- [Practice 2]
\`\`\`

## Success Criteria
The research should:
1. Document 50+ proven patterns
2. Categorize patterns by use case (eng vs product)
3. Provide token efficiency guidance
4. Show real-world examples for target users
5. Identify which patterns to teach first (MVP)
6. Understand how to combine patterns effectively
7. Know which patterns work best with which AI providers
8. Have metrics to grade prompt templates
9. Avoid common pitfalls and anti-patterns
10. Stay current with industry best practices

Please conduct comprehensive research and provide detailed documentation for each pattern.
`;

  return conductGeminiResearch({
    topic: 'Prompt Engineering Patterns',
    context: prompt,
    depth: 'deep',
    outputFormat: 'markdown',
  });
}

/**
 * Build system prompt based on research depth
 */
function buildResearchSystemPrompt(depth: 'quick' | 'standard' | 'deep'): string {
  const basePrompt = `You are an expert AI researcher with deep knowledge of prompt engineering, software engineering, and product management. Your research is thorough, well-cited, and actionable.`;

  switch (depth) {
    case 'quick':
      return `${basePrompt} Provide a concise summary with key findings and top recommendations.`;
    case 'standard':
      return `${basePrompt} Provide comprehensive research with examples, best practices, and clear recommendations.`;
    case 'deep':
      return `${basePrompt} Conduct exhaustive research covering all aspects of the topic. Include detailed examples, metrics, comparisons, and actionable insights. Cite sources and provide evidence-based recommendations.`;
  }
}

/**
 * Build research prompt
 */
function buildResearchPrompt(request: GeminiResearchRequest): string {
  let prompt = `# Research Topic: ${request.topic}\n\n`;

  if (request.context) {
    prompt += `## Context\n${request.context}\n\n`;
  }

  prompt += `## Research Requirements\n`;
  prompt += `- Depth: ${request.depth}\n`;
  prompt += `- Output Format: ${request.outputFormat || 'markdown'}\n\n`;

  prompt += `## Instructions\n`;
  prompt += `1. Conduct comprehensive research on the topic\n`;
  prompt += `2. Cite authoritative sources\n`;
  prompt += `3. Provide specific examples\n`;
  prompt += `4. Include actionable recommendations\n`;
  prompt += `5. Organize findings clearly\n\n`;

  prompt += `Please begin your research.`;

  return prompt;
}

/**
 * Parse research response
 */
function parseResearchResponse(content: string, response: any): GeminiResearchResult {
  // Extract sources (look for citations, URLs, references)
  const sources = extractSources(content);

  // Extract key findings (look for bullet points, numbered lists)
  const keyFindings = extractKeyFindings(content);

  // Extract recommendations
  const recommendations = extractRecommendations(content);

  // Determine confidence based on source count and content depth
  const confidence = determineConfidence(sources.length, content.length);

  return {
    content,
    sources,
    keyFindings,
    recommendations,
    metadata: {
      tokensUsed: response.parsed.metadata?.tokens?.total || 0,
      researchTime: response.latency,
      confidence,
    },
  };
}

/**
 * Extract sources from content
 */
function extractSources(content: string): string[] {
  const sources: string[] = [];

  // Extract URLs
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const urls = content.match(urlRegex) || [];
  sources.push(...urls);

  // Extract citations (e.g., "According to OpenAI...", "Source: ...")
  const citationRegex = /(?:According to|Source:|From|Reference:)\s+([^.\n]+)/gi;
  let match;
  while ((match = citationRegex.exec(content)) !== null) {
    sources.push(match[1].trim());
  }

  // Remove duplicates
  return [...new Set(sources)];
}

/**
 * Extract key findings
 */
function extractKeyFindings(content: string): string[] {
  const findings: string[] = [];

  // Look for sections titled "Key Findings", "Summary", "Main Points"
  const sections = content.split(/#{1,3}\s+(Key Findings|Summary|Main Points|Findings)/i);
  if (sections.length > 1) {
    const findingsSection = sections[1];
    const bullets = findingsSection.match(/^[-*]\s+(.+)$/gm) || [];
    findings.push(...bullets.map(b => b.replace(/^[-*]\s+/, '').trim()));
  }

  // If no dedicated section, extract first few bullet points
  if (findings.length === 0) {
    const bullets = content.match(/^[-*]\s+(.+)$/gm) || [];
    findings.push(...bullets.slice(0, 5).map(b => b.replace(/^[-*]\s+/, '').trim()));
  }

  return findings.slice(0, 10); // Limit to top 10
}

/**
 * Extract recommendations
 */
function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];

  // Look for sections titled "Recommendations", "Best Practices", "Action Items"
  const sections = content.split(/#{1,3}\s+(Recommendations|Best Practices|Action Items|Next Steps)/i);
  if (sections.length > 1) {
    const recSection = sections[1];
    const bullets = recSection.match(/^[-*]\s+(.+)$/gm) || [];
    recommendations.push(...bullets.map(b => b.replace(/^[-*]\s+/, '').trim()));
  }

  return recommendations.slice(0, 10); // Limit to top 10
}

/**
 * Determine confidence level
 */
function determineConfidence(sourceCount: number, contentLength: number): 'low' | 'medium' | 'high' {
  if (sourceCount >= 5 && contentLength > 5000) return 'high';
  if (sourceCount >= 3 && contentLength > 2000) return 'medium';
  return 'low';
}
