#!/usr/bin/env tsx
/**
 * AI-Powered Article Generator
 * 
 * Uses OpenAI GPT-4 to generate 10 high-quality learning articles
 * Adds them as ACTIVE resources in MongoDB
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { MongoClient } from 'mongodb';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'engify';
const COLLECTION = 'learning_resources';

// 10 high-value topics to generate
const topicsToGenerate = [
  {
    title: 'Prompt Engineering for Code Review: Best Practices',
    category: 'engineering',
    level: 'intermediate',
    tags: ['code-review', 'engineering', 'best-practices'],
    outline: 'Write a comprehensive guide on using AI for code review. Include: 1) How to structure code review prompts, 2) Common pitfalls to avoid, 3) Examples of good vs bad prompts, 4) How to handle security concerns, 5) Best practices for different languages.',
  },
  {
    title: 'Building Your First RAG Application: Step-by-Step Tutorial',
    category: 'advanced',
    level: 'advanced',
    tags: ['rag', 'tutorial', 'implementation'],
    outline: 'Create a hands-on tutorial for building a RAG system. Cover: 1) Choosing a vector database, 2) Creating embeddings, 3) Implementing semantic search, 4) Integrating with LLM, 5) Code examples in Python/TypeScript, 6) Common mistakes and how to avoid them.',
  },
  {
    title: 'Cost Optimization Strategies for Production LLM Applications',
    category: 'production',
    level: 'advanced',
    tags: ['cost-optimization', 'production', 'performance'],
    outline: 'Detailed guide on reducing AI costs. Include: 1) Token optimization techniques, 2) Caching strategies, 3) Model selection (when to use GPT-4 vs 3.5), 4) Batch processing, 5) Real cost analysis examples, 6) ROI calculations.',
  },
  {
    title: 'Prompt Injection Attacks: How to Protect Your AI Application',
    category: 'security',
    level: 'advanced',
    tags: ['security', 'prompt-injection', 'safety'],
    outline: 'Security-focused article on prompt injection. Cover: 1) What is prompt injection, 2) Real-world attack examples, 3) Defense strategies with code, 4) Input validation techniques, 5) Testing for vulnerabilities, 6) Security checklist.',
  },
  {
    title: 'Zero-Shot vs Few-Shot vs Fine-Tuning: When to Use Each',
    category: 'basics',
    level: 'intermediate',
    tags: ['zero-shot', 'few-shot', 'fine-tuning', 'comparison'],
    outline: 'Comparison guide for different AI approaches. Include: 1) Definitions and examples, 2) Cost comparison, 3) Performance trade-offs, 4) Decision framework, 5) Real use cases for each, 6) Implementation examples.',
  },
  {
    title: 'Streaming AI Responses: Building ChatGPT-Style UX',
    category: 'production',
    level: 'intermediate',
    tags: ['streaming', 'ux', 'implementation'],
    outline: 'Technical guide on implementing streaming. Cover: 1) Why streaming matters for UX, 2) Server-Sent Events vs WebSockets, 3) Implementation in Next.js, 4) Error handling, 5) Code examples, 6) Performance considerations.',
  },
  {
    title: 'Multi-Agent Systems: Coordinating Multiple AI Agents',
    category: 'advanced',
    level: 'expert',
    tags: ['multi-agent', 'agents', 'orchestration'],
    outline: 'Advanced guide on multi-agent systems. Include: 1) When to use multiple agents, 2) Communication patterns, 3) Task delegation strategies, 4) Example architectures, 5) Code implementation, 6) Common pitfalls.',
  },
  {
    title: 'Prompt Templates: Building Reusable AI Components',
    category: 'patterns',
    level: 'beginner',
    tags: ['templates', 'patterns', 'reusability'],
    outline: 'Practical guide on prompt templates. Cover: 1) What are prompt templates, 2) Variable substitution, 3) Template libraries, 4) Best practices, 5) Examples for common use cases, 6) How to test templates.',
  },
  {
    title: 'LLM Evaluation Metrics: Measuring AI Quality',
    category: 'production',
    level: 'advanced',
    tags: ['evaluation', 'metrics', 'quality'],
    outline: 'Guide on measuring LLM performance. Include: 1) Common metrics (BLEU, ROUGE, perplexity), 2) Custom evaluation criteria, 3) Human evaluation vs automated, 4) A/B testing strategies, 5) Tools and frameworks, 6) Case studies.',
  },
  {
    title: 'Context Window Management: Handling Long Documents',
    category: 'advanced',
    level: 'intermediate',
    tags: ['context-window', 'optimization', 'chunking'],
    outline: 'Technical guide on context management. Cover: 1) Understanding token limits, 2) Chunking strategies, 3) Sliding window techniques, 4) When to use RAG instead, 5) Code examples, 6) Performance optimization.',
  },
];

async function generateArticle(topic: typeof topicsToGenerate[0]): Promise<typeof topicsToGenerate[0] & { content: string; contentLength: number; tokensUsed: number } | null> {
  console.log(`\n📝 Generating: "${topic.title}"...`);
  
  const prompt = `You are an expert technical writer specializing in AI and prompt engineering. Write a comprehensive, professional article on the following topic.

TOPIC: ${topic.title}

OUTLINE: ${topic.outline}

REQUIREMENTS:
1. Write 1000-1500 words
2. Use clear, professional language
3. Include practical examples and code snippets where relevant
4. Use markdown formatting (##, ###, -, *, etc.)
5. Be specific and actionable, not generic
6. Include real-world use cases
7. Write for an audience of engineers and technical professionals

FORMAT:
Start with a brief introduction (2-3 sentences).
Then organize into clear sections with headers.
End with key takeaways or next steps.

Write the article now:`;

  try {
    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.7,
      system: 'You are an expert technical writer who creates high-quality, actionable content about AI and prompt engineering.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.content[0].type === 'text' ? completion.content[0].text : '';
    
    if (!content || content.length < 500) {
      throw new Error('Generated content too short');
    }

    console.log(`✅ Generated ${content.length} characters`);
    
    return {
      ...topic,
      content,
      contentLength: content.length,
      tokensUsed: (completion.usage.input_tokens + completion.usage.output_tokens) || 0,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to generate "${topic.title}":`, errorMessage);
    return null;
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function convertToHtml(markdown: string): string {
  let html = markdown;
  
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Paragraphs
  html = html.split('\n\n').map(p => {
    if (!p.startsWith('<')) {
      return `<p>${p.trim()}</p>`;
    }
    return p;
  }).join('\n');
  
  return html;
}

async function main() {
  console.log('🤖 AI Article Generator\n');
  console.log('Generating 10 articles with GPT-4...\n');
  
  const articles = [];
  let totalTokens = 0;
  
  // Generate articles one by one (to avoid rate limits)
  for (const topic of topicsToGenerate) {
    const article = await generateArticle(topic);
    
    if (article) {
      articles.push(article);
      totalTokens += article.tokensUsed;
      
      // Wait 2 seconds between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n✅ Generated ${articles.length} articles`);
  console.log(`📊 Total tokens used: ${totalTokens}`);
  console.log(`💰 Estimated cost: $${(totalTokens / 1000 * 0.03).toFixed(2)}\n`);
  
  if (articles.length === 0) {
    console.log('❌ No articles generated. Exiting.');
    return;
  }
  
  // Save to MongoDB
  console.log('💾 Saving to MongoDB...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);
    
    const resources = articles.map(article => {
      const slug = generateSlug(article.title);
      const description = article.content.substring(0, 160).replace(/\n/g, ' ');
      
      return {
        id: `ai-gen-${slug}`,
        title: article.title,
        description,
        content: article.content,
        contentHtml: convertToHtml(article.content),
        category: article.category,
        type: 'guide',
        level: article.level,
        duration: `${Math.ceil(article.contentLength / 1000 * 4)} min`, // ~250 words/min
        tags: article.tags,
        featured: false,
        status: 'active', // ← ACTIVE!
        seo: {
          metaTitle: `${article.title} | Engify.ai`,
          metaDescription: description,
          keywords: article.tags,
          slug,
          canonicalUrl: `https://engify.ai/learn/${slug}`,
          ogImage: `https://engify.ai/og/${slug}.png`,
        },
        source: 'AI Generated (GPT-4)',
        author: 'Engify.ai Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        views: 0,
        shares: 0,
      };
    });
    
    await collection.insertMany(resources);
    
    console.log(`✅ Saved ${resources.length} articles to MongoDB\n`);
    
    // Show what was created
    console.log('📚 Generated Articles:');
    resources.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title} (${r.level})`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB error:', error);
  } finally {
    await client.close();
  }
  
  console.log('\n🎉 Done! 10 new ACTIVE articles added to the system.');
}

main();
