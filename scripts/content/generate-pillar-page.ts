#!/usr/bin/env tsx
/**
 * Generate Pillar Page - CLI Tool
 * 
 * Generates 8,000-10,000 word pillar pages using section-based processing
 * to handle large context windows. Uses multi-agent content publishing pipeline.
 * 
 * Usage:
 *   tsx scripts/content/generate-pillar-page.ts --id=ai-first-engineering-organization
 *   tsx scripts/content/generate-pillar-page.ts --all-planned
 *   tsx scripts/content/generate-pillar-page.ts "Building an AI-First Engineering Organization" --target-word-count=8000
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import https from 'https';
import OpenAI from 'openai';
import {
  PILLAR_PAGES,
  getPillarPage,
  getPlannedPillarPages,
  type PillarPageConfig,
} from '@/lib/data/pillar-pages';
import { getResearchBasedSections } from '@/lib/data/pillar-page-sections';
import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import { getMongoDb } from '@/lib/db/mongodb';
import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';
import { getModelsByProvider } from '@/lib/services/AIModelRegistry';

// Initialize OpenAI client (only if API key exists)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Normalize model ID by stripping provider prefix and invalid suffixes
 * Example: "openai/gpt-4o" -> "gpt-4o"
 * Example: "claude-3.7-sonnet:thinking" -> "claude-3.7-sonnet"
 */
function normalizeModelId(modelId: string, provider: string): string {
  let normalized = modelId;
  
  // Remove provider prefix if present
  const prefix = `${provider}/`;
  if (normalized.startsWith(prefix)) {
    normalized = normalized.substring(prefix.length);
  }
  
  // Remove invalid suffixes (like :thinking, :expanded, etc.)
  // These are not valid model IDs for API calls
  const invalidSuffixes = [':thinking', ':expanded', ':beta', ':preview'];
  for (const suffix of invalidSuffixes) {
    if (normalized.includes(suffix)) {
      normalized = normalized.split(suffix)[0];
    }
  }
  
  return normalized;
}

/**
 * Get a valid text-to-text model ID from database registry for a provider
 * Uses the EXACT same filtering logic as audit-prompts-patterns.ts
 * Filters out image/video/audio/realtime/transcribe models
 * Prefers verified/working models (recent lastVerified date)
 */
async function getModelIdFromRegistry(provider: string, preferredModel?: string): Promise<string | null> {
  try {
    const allModels = await getModelsByProvider(provider);
    
    // Filter to only ACTIVE, ALLOWED, text-to-text models (skip image/video/audio/realtime/transcribe)
    // CRITICAL: Must explicitly check status === 'active' and isAllowed === true
    const models = allModels.filter((m: any) => {
      // MUST be active (explicit check, not just "not deprecated")
      const status = ('status' in m ? m.status : 'active');
      if (status !== 'active') {
        return false; // Reject if not explicitly active
      }
      
      // MUST be allowed for use
      if ('isAllowed' in m && m.isAllowed === false) {
        return false; // Reject if explicitly not allowed
      }
      
      // Skip deprecated or sunset models (safety check)
      if (status === 'deprecated' || status === 'sunset') {
        return false;
      }
      
      // Skip models marked as unsuitable for text-to-text
      const tags = m.tags || [];
      if (tags.includes('audio-only') || tags.includes('realtime-only') || tags.includes('unsuitable-for-text')) {
        return false;
      }
      
      const capabilities = m.capabilities || [];
      const modelId = (m.id || '').toLowerCase();
      
      // Must have 'text' capability
      if (!capabilities.includes('text')) {
        return false;
      }
      
      // Skip audio models (they require audio input/output)
      if (capabilities.includes('audio-generation') ||
          capabilities.includes('audio') ||
          tags.includes('audio') ||
          tags.includes('audio-only') ||
          modelId.includes('audio') ||
          modelId.includes('transcribe')) { // CRITICAL: Filter out transcription models
        return false;
      }
      
      // Skip realtime models (they use different API endpoints)
      if (tags.includes('realtime-only') ||
          modelId.includes('realtime') ||
          modelId.includes('rt-')) {
        return false;
      }
      
      // Skip image/video/audio generation models
      if (capabilities.includes('image-generation') || 
          capabilities.includes('video-generation') ||
          tags.includes('image-generation') ||
          tags.includes('video-generation') ||
          modelId.includes('image') ||
          modelId.includes('flux') ||
          modelId.includes('sora') ||
          modelId.includes('video') ||
          modelId.includes('dalle') ||
          modelId.includes('midjourney')) {
        return false;
      }
      
      return true;
    });
    
    if (models.length === 0) {
      return null;
    }
    
    // If preferred model specified and exists, use it (must be active)
    if (preferredModel) {
      // Handle generic keywords that mean "find latest recommended model"
      const normalizedPreferred = preferredModel.toLowerCase();
      
      // Try exact match first (for specific model IDs)
      const preferred = models.find(m => {
        const status = ('status' in m ? m.status : 'active');
        const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
        const modelId = normalizeModelId(m.id, provider).toLowerCase();
        // CRITICAL: Must match exactly AND be active AND allowed
        return (modelId === normalizedPreferred || m.id === preferredModel) && 
               status === 'active' && 
               isAllowed !== false;
      });
      if (preferred) {
        return normalizeModelId(preferred.id, provider);
      }
      
      // Handle generic keywords
      if (normalizedPreferred.includes('claude')) {
        // Try Sonnet first, fallback to Haiku if not available
        const claudeSonnet = models.find(m => {
          const status = ('status' in m ? m.status : 'active');
          const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
          const modelId = (m.id || '').toLowerCase();
          
          return status === 'active' && 
                 isAllowed !== false && 
                 modelId.includes('sonnet') &&
                 !modelId.includes('transcribe') &&
                 !modelId.includes(':thinking');
        });
        
        if (claudeSonnet) {
          return normalizeModelId(claudeSonnet.id, provider);
        } else {
          // Fallback to Haiku if Sonnet not available
          const claudeHaiku = models.find(m => {
            const status = ('status' in m ? m.status : 'active');
            const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
            const modelId = (m.id || '').toLowerCase();
            
            return status === 'active' && 
                   isAllowed !== false && 
                   modelId.includes('haiku');
          });
          
          if (claudeHaiku) {
            return normalizeModelId(claudeHaiku.id, provider);
          }
        }
      }
      
      if (normalizedPreferred.includes('gemini') || normalizedPreferred === 'google') {
        const geminiFlash = models.find(m => {
          const status = ('status' in m ? m.status : 'active');
          const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
          const isRecommended = ('recommended' in m ? (m as any).recommended : false);
          const modelId = (m.id || '').toLowerCase();
          
          // Must be active, allowed, and include "flash" in ID
          return status === 'active' && 
                 isAllowed !== false && 
                 modelId.includes('flash') &&
                 isRecommended; // Prefer recommended models
        }) || models.find(m => {
          // Fallback: any active Gemini Flash model
          const status = ('status' in m ? m.status : 'active');
          const isAllowed = ('isAllowed' in m ? m.isAllowed : true);
          const modelId = (m.id || '').toLowerCase();
          
          return status === 'active' && 
                 isAllowed !== false && 
                 modelId.includes('flash');
        });
        if (geminiFlash) return normalizeModelId(geminiFlash.id, provider);
      }
    }
    
    // Prefer recommended models, then verified models, then any active model
    const recommended = models.find(m => ('recommended' in m ? (m as any).recommended : false));
    if (recommended) return normalizeModelId(recommended.id, provider);
    
    const verified = models.filter(m => m.lastVerified).sort((a, b) => {
      const aDate = a.lastVerified ? new Date(a.lastVerified).getTime() : 0;
      const bDate = b.lastVerified ? new Date(b.lastVerified).getTime() : 0;
      return bDate - aDate;
    });
    if (verified.length > 0) return normalizeModelId(verified[0].id, provider);
    
    return normalizeModelId(models[0].id, provider);
  } catch (error) {
    console.warn(`   ⚠️  Failed to query DB for models:`, error);
    return null;
  }
}

/**
 * Execute AI provider with graceful fallback
 */
async function executeWithFallback(
  provider: string,
  preferredModel: string,
  fallbackModels: string[],
  executeFn: (modelId: string) => Promise<any>
): Promise<any> {
  const modelsToTry = [preferredModel, ...fallbackModels];
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelId = modelsToTry[i];
    try {
      // Resolve from DB first
      const resolvedId = await getModelIdFromRegistry(provider, modelId);
      const finalModelId = resolvedId || normalizeModelId(modelId, provider);
      
      console.log(`   🔄 Trying model: ${finalModelId}${i > 0 ? ' (fallback)' : ''}`);
      
      return await executeFn(finalModelId);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isLastAttempt = i === modelsToTry.length - 1;
      
      if (isLastAttempt) {
        console.error(`   ❌ All models failed. Last error: ${errorMsg}`);
        throw error;
      }
      
      // Check if it's a model-specific error (invalid model ID, not a chat model, etc.)
      if (errorMsg.includes('invalid model') || 
          errorMsg.includes('not a chat model') ||
          errorMsg.includes('404') ||
          errorMsg.includes('400')) {
        console.warn(`   ⚠️  Model ${modelId} failed: ${errorMsg.substring(0, 100)}...`);
        continue; // Try next model
      }
      
      // For other errors (rate limits, network), throw immediately
      throw error;
    }
  }
  
  throw new Error('All model attempts failed');
}

interface Section {
  id: string;
  title: string;
  order: number;
  targetWordCount: number;
  content: string;
  keywords: string[];
  relatedRoles: string[];
}

interface PillarPageImage {
  filename: string;
  url: string;
  alt: string;
  type: 'hero' | 'section';
  sectionId?: string;
}

interface PillarPageGenerationResult {
  config: PillarPageConfig;
  sections: Section[];
  fullContent: string;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
    slug: string;
  };
  faq: Array<{ question: string; answer: string }>;
  hubAndSpokeLinks: {
    roles: string[];
    prompts: string[];
    patterns: string[];
    articles: string[];
    tools: string[];
  };
  images: PillarPageImage[];
  readabilityScore: number;
  publishReady: boolean;
}

/**
 * Generate section outline for a pillar page
 * Uses research-based sections if available, otherwise generates via AI
 */
async function generateSectionOutline(
  config: PillarPageConfig,
  service: ContentPublishingService
): Promise<Section[]> {
  // First, check if we have research-based sections for this page
  const researchSections = getResearchBasedSections(config);
  
  if (researchSections.length > 0) {
    console.log(`   📋 Using research-based section structure (${researchSections.length} sections)`);
    return researchSections.map(s => ({
      id: s.id,
      title: s.title,
      order: s.order,
      targetWordCount: s.targetWordCount,
      content: '',
      keywords: s.keywords,
      relatedRoles: s.relatedRoles,
    }));
  }
  
  // Fallback to AI generation for pages without research-based structures
  const sections: Section[] = [];
  const wordsPerSection = Math.ceil(config.targetWordCount / 8); // ~8 sections for 8K words

  const outlinePrompt = `Create a detailed outline for a comprehensive ${config.targetWordCount}-word pillar page titled "${config.title}".

Target Audience: ${config.audience}
Category: ${config.category}
Level: ${config.level}
Keywords: ${config.targetKeywords.join(', ')}

Create 6-8 major sections, each targeting ${wordsPerSection} words. For each section, provide:
1. Section title (descriptive, keyword-rich)
2. Key topics to cover
3. Related keywords
4. Related roles that would benefit

Format as JSON array:
[
  {
    "title": "Section Title",
    "order": 1,
    "targetWordCount": ${wordsPerSection},
    "keywords": ["keyword1", "keyword2"],
    "relatedRoles": ["role1", "role2"],
    "topics": ["topic1", "topic2", "topic3"]
  }
]`;

  try {
    // Use fallback mechanism with multiple model options
    const outlineResponse = await executeWithFallback(
      'openai',
      'gpt-4o',
      ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'],
      async (modelId: string) => {
        const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
        const provider = new OpenAIAdapter(modelId);
        return await provider.execute({
          prompt: outlinePrompt,
          systemPrompt: 'You are an expert content strategist. Generate structured outlines in valid JSON format only.',
          temperature: 0.7,
          maxTokens: 2000,
        });
      }
    );

    // Parse JSON from response
    const jsonMatch = outlineResponse.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((s: any, idx: number) => ({
        id: `section-${idx + 1}`,
        title: s.title,
        order: s.order || idx + 1,
        targetWordCount: s.targetWordCount || wordsPerSection,
        content: '',
        keywords: s.keywords || [],
        relatedRoles: s.relatedRoles || config.relatedRoles || [],
      }));
    }
  } catch (error) {
    console.warn('⚠️  Could not parse outline, using default structure');
  }

  // Fallback: Create default sections based on category
  const defaultSections = getDefaultSections(config, wordsPerSection);
  return defaultSections;
}

/**
 * Get default sections based on pillar page category
 */
function getDefaultSections(
  config: PillarPageConfig,
  wordsPerSection: number
): Section[] {
  if (config.category === 'strategy' && config.audience === 'engineering-leaders') {
    return [
      {
        id: 'section-1',
        title: 'Introduction: What Does This Mean?',
        order: 1,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(0, 3),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-2',
        title: 'The Strategic Foundation',
        order: 2,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(3, 6),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-3',
        title: 'Organizational Transformation',
        order: 3,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(0, 3),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-4',
        title: 'Technical Infrastructure',
        order: 4,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(3, 6),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-5',
        title: 'Process and Workflow Integration',
        order: 5,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(0, 3),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-6',
        title: 'Measuring Success',
        order: 6,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(3, 6),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-7',
        title: 'Common Pitfalls and How to Avoid Them',
        order: 7,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(0, 3),
        relatedRoles: config.relatedRoles || [],
      },
      {
        id: 'section-8',
        title: 'Case Studies and Examples',
        order: 8,
        targetWordCount: wordsPerSection,
        content: '',
        keywords: config.targetKeywords.slice(3, 6),
        relatedRoles: config.relatedRoles || [],
      },
    ];
  }

  // Default structure for other categories
  return [
    {
      id: 'section-1',
      title: 'Introduction',
      order: 1,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(0, 3),
      relatedRoles: config.relatedRoles || [],
    },
    {
      id: 'section-2',
      title: 'Core Concepts',
      order: 2,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(3, 6),
      relatedRoles: config.relatedRoles || [],
    },
    {
      id: 'section-3',
      title: 'Implementation',
      order: 3,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(0, 3),
      relatedRoles: config.relatedRoles || [],
    },
    {
      id: 'section-4',
      title: 'Best Practices',
      order: 4,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(3, 6),
      relatedRoles: config.relatedRoles || [],
    },
    {
      id: 'section-5',
      title: 'Advanced Techniques',
      order: 5,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(0, 3),
      relatedRoles: config.relatedRoles || [],
    },
    {
      id: 'section-6',
      title: 'Real-World Examples',
      order: 6,
      targetWordCount: wordsPerSection,
      content: '',
      keywords: config.targetKeywords.slice(3, 6),
      relatedRoles: config.relatedRoles || [],
    },
  ];
}

/**
 * Generate content for a single section
 */
async function generateSectionContent(
  section: Section,
  config: PillarPageConfig,
  previousSections: Section[],
  service: ContentPublishingService
): Promise<string> {
  const contextSummary = previousSections
    .map((s) => `## ${s.title}\n${s.content.substring(0, 500)}...`)
    .join('\n\n');

  const sectionPrompt = `Write section "${section.title}" for a comprehensive pillar page titled "${config.title}".

Section Requirements:
- Target: ${section.targetWordCount} words (MINIMUM - write at least this many words)
- Audience: ${config.audience}
- Level: ${config.level}
- Keywords to include: ${section.keywords.join(', ')}
- Related roles: ${section.relatedRoles.join(', ')}

${previousSections.length > 0 ? `\nPrevious sections context:\n${contextSummary}\n\nEnsure this section flows naturally from previous content.` : ''}

Write comprehensive, authoritative content that:
1. Covers the topic in depth (aim for ${section.targetWordCount}+ words)
2. Includes practical examples and case studies
3. Uses the target keywords naturally
4. Provides actionable insights and frameworks
5. Connects to related concepts
6. Includes subsections (### headings) to break up content
7. Addresses C-suite concerns (ROI, risk, strategy) for engineering leaders
8. Provides specific metrics and measurement frameworks where relevant

CRITICAL WORD COUNT REQUIREMENT: This section MUST be at least ${section.targetWordCount} words. 
- Write in EXTREME detail with multiple subsections
- Include extensive examples, case studies, frameworks, and actionable steps
- Expand on every point with depth and nuance
- Add subsections (###) to break down complex topics
- Include specific metrics, numbers, and quantifiable examples
- Write ${section.targetWordCount}+ words - this is NOT optional

For engineering leaders audience, focus on:
- Strategic frameworks and decision-making tools
- ROI and measurement approaches
- Organizational structure and team design
- Risk management and governance
- Real-world case studies with quantifiable results

Format with proper markdown headings (## for section title, ### for subsections).`;

  try {
    const result = await service.generateArticle(section.title, {
      category: config.category.charAt(0).toUpperCase() + config.category.slice(1),
      targetKeywords: section.keywords,
      tone: config.level,
    });

    const generatedContent = result.finalContent;
    const wordCount = generatedContent.split(/\s+/).length;
    
    // Validate word count - if too short, add a warning but continue
    if (wordCount < section.targetWordCount * 0.7) {
      console.warn(`   ⚠️  Section "${section.title}" is ${wordCount} words (target: ${section.targetWordCount}). Consider regenerating.`);
    }
    
    return generatedContent;
  } catch (error) {
    console.error(`❌ Error generating section "${section.title}":`, error);
    return `## ${section.title}\n\n[Content generation failed. Please generate manually.]`;
  }
}

/**
 * Generate FAQ section
 */
async function generateFAQ(
  config: PillarPageConfig,
  service: ContentPublishingService
): Promise<Array<{ question: string; answer: string }>> {
  const faqPrompt = `Generate 8-10 FAQ questions and answers for a pillar page titled "${config.title}".

Target Keywords: ${config.targetKeywords.join(', ')}
Audience: ${config.audience}

Create questions that:
1. Target question-based search queries
2. Address common concerns
3. Provide valuable information
4. Include target keywords naturally

Format as JSON array:
[
  {
    "question": "Question text?",
    "answer": "Comprehensive answer (2-3 paragraphs)"
  }
]`;

  try {
    // Use fallback mechanism with multiple model options
    const faqResponse = await executeWithFallback(
      'openai',
      'gpt-4o',
      ['gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'],
      async (modelId: string) => {
        const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
        const provider = new OpenAIAdapter(modelId);
        return await provider.execute({
          prompt: faqPrompt,
          systemPrompt: 'You are an expert content writer. Generate FAQ questions and answers in valid JSON format only.',
          temperature: 0.7,
          maxTokens: 2000,
        });
      }
    );

    const jsonMatch = faqResponse.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('⚠️  Could not generate FAQ, using empty array');
  }

  return [];
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

/**
 * Generate hero image for pillar page
 */
async function generateHeroImage(
  config: PillarPageConfig
): Promise<PillarPageImage | null> {
  const outputDir = path.join(process.cwd(), 'public/images/pillar-pages');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${config.slug}-hero.png`;
  const filepath = path.join(outputDir, filename);

  // Create DALL-E prompt for hero image
  const prompt = `Create a professional, modern hero image for a technical article about "${config.title}". 

Style: Clean, minimalist, tech-focused illustration. Use a professional color scheme with blues (#1e293b, #3b82f6), purples (#7c3aed), and accent colors. 

Visual elements should represent: ${config.description.substring(0, 200)}

Format: Wide banner style suitable for article header. No text overlays. Modern flat design with subtle gradients. Professional SaaS/enterprise software aesthetic.

Size: 1792x1024 pixels, wide format.`;

  if (!openai) {
    console.warn(`   ⚠️  OpenAI API key not found, skipping image generation`);
    return null;
  }

  try {
    console.log(`   🎨 Generating hero image...`);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      console.warn(`   ⚠️  No image URL returned`);
      return null;
    }

    await downloadImage(imageUrl, filepath);
    console.log(`   ✅ Hero image saved: ${filename}`);

    return {
      filename,
      url: `/images/pillar-pages/${filename}`,
      alt: `${config.title} - Hero image`,
      type: 'hero',
    };
  } catch (error) {
    console.error(`   ❌ Error generating hero image:`, error);
    return null;
  }
}

/**
 * Generate section images for key sections
 */
async function generateSectionImages(
  config: PillarPageConfig,
  sections: Section[]
): Promise<PillarPageImage[]> {
  const outputDir = path.join(process.cwd(), 'public/images/pillar-pages');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const images: PillarPageImage[] = [];
  
  // Generate images for first 3 sections (most important)
  const sectionsToIllustrate = sections.slice(0, 3);

  for (const section of sectionsToIllustrate) {
    const filename = `${config.slug}-${section.id}.png`;
    const filepath = path.join(outputDir, filename);

    const prompt = `Create a professional technical diagram or illustration for a section titled "${section.title}" in an article about "${config.title}".

Style: Clean, modern, minimalist. Use professional tech colors: blues (#1e293b, #3b82f6), purples (#7c3aed), greens (#10b981). 

Visual concept: ${section.title}. Should be suitable for a technical blog article. Can be a diagram, flowchart, or conceptual illustration.

Format: Wide format suitable for article content. No text overlays. Modern flat design. Professional SaaS aesthetic.

Size: 1792x1024 pixels.`;

    if (!openai) {
      console.warn(`   ⚠️  OpenAI API key not found, skipping section image`);
      continue;
    }

    try {
      console.log(`   🎨 Generating image for section: "${section.title}"...`);

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        console.warn(`   ⚠️  No image URL returned for section ${section.id}`);
        continue;
      }

      await downloadImage(imageUrl, filepath);
      console.log(`   ✅ Section image saved: ${filename}`);

      images.push({
        filename,
        url: `/images/pillar-pages/${filename}`,
        alt: `${section.title} - ${config.title}`,
        type: 'section',
        sectionId: section.id,
      });
    } catch (error) {
      console.error(`   ❌ Error generating image for section ${section.id}:`, error);
    }
  }

  return images;
}

/**
 * Find hub-and-spoke links
 */
async function findHubAndSpokeLinks(
  config: PillarPageConfig,
  sections: Section[]
): Promise<PillarPageGenerationResult['hubAndSpokeLinks']> {
  // Aggregate keywords and roles from all sections
  const allKeywords = [
    ...config.targetKeywords,
    ...sections.flatMap((s) => s.keywords),
  ];
  const allRoles = [
    ...(config.relatedRoles || []),
    ...sections.flatMap((s) => s.relatedRoles),
  ];

  // TODO: Query database for related content
  // For now, return based on config
  return {
    roles: [...new Set(allRoles)],
    prompts: [], // TODO: Query prompts by tags/roles
    patterns: [], // TODO: Query patterns by keywords
    articles: [], // TODO: Query articles by tags
    tools: [], // TODO: Query AI tools by use cases
  };
}

/**
 * Generate full pillar page
 */
async function generatePillarPage(
  config: PillarPageConfig,
  options: { skipImages?: boolean } = {}
): Promise<PillarPageGenerationResult> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Pillar Page Generator - Section-Based Processing      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📄 Title: "${config.title}"`);
  console.log(`🎯 Audience: ${config.audience}`);
  console.log(`📊 Target Word Count: ${config.targetWordCount}`);
  console.log(`🔑 Keywords: ${config.targetKeywords.slice(0, 5).join(', ')}...`);
  console.log('');
  console.log('⏳ This will take 10-15 minutes (section-based generation)...');
  console.log('');

  const service = new ContentPublishingService('cli-pillar-generation');

  // Step 1: Generate section outline
  console.log('📋 Step 1: Generating section outline...');
  const sections = await generateSectionOutline(config, service);
  console.log(`   ✅ Created ${sections.length} sections`);
  console.log('');

  // Step 2: Generate each section
  const generatedSections: Section[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`📝 Step ${i + 2}: Generating section "${section.title}" (${i + 1}/${sections.length})...`);

    const content = await generateSectionContent(
      section,
      config,
      generatedSections,
      service
    );

    generatedSections.push({
      ...section,
      content,
    });

    const wordCount = content.split(/\s+/).length;
    console.log(`   ✅ Generated ${wordCount} words`);
    console.log('');
  }

  // Step 3: Combine sections
  console.log('🔗 Step 3: Combining sections...');
  const fullContent = generatedSections
    .sort((a, b) => a.order - b.order)
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join('\n\n---\n\n');
  const totalWordCount = fullContent.split(/\s+/).length;
  console.log(`   ✅ Combined into ${totalWordCount} words`);
  console.log('');

  // Step 4: Final review
  console.log('🔍 Step 4: Final review with all agents...');
  const finalResult = await service.generateArticle(config.title, {
    category: config.category.charAt(0).toUpperCase() + config.category.slice(1),
    targetKeywords: config.targetKeywords,
    tone: config.level,
  });
  console.log(`   ✅ Final score: ${finalResult.readabilityScore.toFixed(1)}/10`);
  console.log('');

  // Step 5: Generate FAQ
  console.log('❓ Step 5: Generating FAQ section...');
  const faq = await generateFAQ(config, service);
  console.log(`   ✅ Generated ${faq.length} FAQ items`);
  console.log('');

  // Step 6: Find hub-and-spoke links
  console.log('🔗 Step 6: Finding hub-and-spoke links...');
  const hubAndSpokeLinks = await findHubAndSpokeLinks(config, generatedSections);
  console.log(`   ✅ Found links to ${hubAndSpokeLinks.roles.length} roles`);
  console.log('');

  // Step 7: Generate images (optional)
  let heroImage: PillarPageImage | null = null;
  let sectionImages: PillarPageImage[] = [];
  
  if (!options.skipImages) {
    console.log('🎨 Step 7: Generating images...');
    console.log(`   💰 Estimated cost: ~$${((1 + Math.min(3, generatedSections.length)) * 0.04).toFixed(2)} (DALL-E 3)`);
    console.log('');
    
    heroImage = await generateHeroImage(config);
    sectionImages = await generateSectionImages(config, generatedSections);
    const allImages = heroImage ? [heroImage, ...sectionImages] : sectionImages;
    
    console.log(`   ✅ Generated ${allImages.length} images`);
    console.log('');
  } else {
    console.log('⏭️  Step 7: Skipping image generation (--no-images flag set)');
    console.log('');
  }

  return {
    config,
    sections: generatedSections,
    fullContent: finalResult.finalContent || fullContent,
    seoMetadata: finalResult.seoMetadata,
    faq,
    hubAndSpokeLinks,
    images: heroImage ? [heroImage, ...sectionImages] : sectionImages,
    readabilityScore: finalResult.readabilityScore,
    publishReady: finalResult.publishReady,
  };
}

/**
 * Save pillar page to MongoDB
 */
async function saveToMongoDB(result: PillarPageGenerationResult): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection('learning_resources');

  const document = {
    id: result.config.slug,
    title: result.config.title,
    description: result.config.description,
    category: result.config.category,
    type: 'pillar',
    level: result.config.level,
    contentHtml: result.fullContent,
    tags: [
      ...result.config.targetKeywords,
      ...result.config.relatedTags || [],
    ],
    seo: {
      metaTitle: result.seoMetadata.title,
      metaDescription: result.seoMetadata.description,
      keywords: result.seoMetadata.keywords,
      slug: result.config.slug,
      canonicalUrl: `https://engify.ai/learn/${result.config.slug}`,
      ogImage: result.images.find((img) => img.type === 'hero')?.url || null,
    },
    faq: result.faq,
    hubAndSpoke: result.hubAndSpokeLinks,
    images: result.images,
    wordCount: result.fullContent.split(/\s+/).length,
    auditVersion: 0,
    currentRevision: 1,
    status: 'draft',
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.updateOne(
    { id: result.config.slug },
    { $set: document },
    { upsert: true }
  );

  console.log(`💾 Saved to MongoDB: learning_resources collection`);
  console.log(`   ID: ${result.config.slug}`);
  console.log(`   URL: /learn/${result.config.slug}`);
}

/**
 * Save pillar page to file (for review)
 */
function saveToFile(result: PillarPageGenerationResult, outputDir: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const fullOutputDir = path.join(process.cwd(), outputDir);

  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }

  const contentPath = path.join(
    fullOutputDir,
    `${timestamp}-${result.config.slug}.md`
  );

  const heroImage = result.images.find((img) => img.type === 'hero');
  const sectionImages = result.images.filter((img) => img.type === 'section');

  const contentWithMeta = `---
title: "${result.config.title}"
description: "${result.config.description}"
slug: "${result.config.slug}"
category: "${result.config.category}"
level: "${result.config.level}"
keywords: [${result.seoMetadata.keywords.map((k) => `"${k}"`).join(', ')}]
wordCount: ${result.fullContent.split(/\s+/).length}
score: ${result.readabilityScore.toFixed(1)}
publishReady: ${result.publishReady}
heroImage: "${heroImage?.url || ''}"
images: [${result.images.map((img) => `"${img.url}"`).join(', ')}]
generatedAt: "${new Date().toISOString()}"
---

${heroImage ? `![${heroImage.alt}](${heroImage.url})\n\n` : ''}${result.fullContent}

${sectionImages.length > 0 ? `\n\n---\n\n## Images\n\n${sectionImages.map((img) => {
  const section = result.sections.find((s) => s.id === img.sectionId);
  return `![${img.alt}](${img.url})\n*${section?.title || 'Section illustration'}*`;
}).join('\n\n')}\n` : ''}

---

## FAQ

${result.faq.map((item) => `### ${item.question}\n\n${item.answer}\n`).join('\n')}
`;

  fs.writeFileSync(contentPath, contentWithMeta);
  console.log(`💾 Saved to file: ${contentPath}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const idArg = args.find((arg) => arg.startsWith('--id='));
  const allPlannedArg = args.includes('--all-planned');
  const skipImagesArg = args.includes('--no-images');
  const titleArg = args.find((arg) => !arg.startsWith('--'));

  let pillarPagesToGenerate: PillarPageConfig[] = [];

  if (allPlannedArg) {
    // Generate all planned pillar pages
    pillarPagesToGenerate = getPlannedPillarPages();
    console.log(`📋 Found ${pillarPagesToGenerate.length} planned pillar pages`);
  } else if (idArg) {
    // Generate by ID
    const id = idArg.split('=')[1];
    const pillarPage = getPillarPage(id);
    if (!pillarPage) {
      console.error(`❌ Pillar page not found: ${id}`);
      console.log('\nAvailable pillar pages:');
      PILLAR_PAGES.forEach((p) => {
        console.log(`   - ${p.id} (${p.status}): ${p.title}`);
      });
      process.exit(1);
    }
    pillarPagesToGenerate = [pillarPage];
  } else if (titleArg) {
    // Generate by title (will create new config)
    console.warn('⚠️  Title-based generation not yet implemented');
    console.log('Please use --id=<pillar-id> or add to pillar-pages.ts config first');
    process.exit(1);
  } else {
    console.error('❌ No pillar page specified');
    console.log('\nUsage:');
    console.log('  tsx scripts/content/generate-pillar-page.ts --id=<pillar-id>');
    console.log('  tsx scripts/content/generate-pillar-page.ts --all-planned');
    console.log('  tsx scripts/content/generate-pillar-page.ts --id=<pillar-id> --no-images');
    console.log('\nFlags:');
    console.log('  --no-images    Skip image generation (saves ~$0.16 per page)');
    console.log('\nAvailable pillar pages:');
    PILLAR_PAGES.forEach((p) => {
      console.log(`   - ${p.id} (${p.status}): ${p.title}`);
    });
    process.exit(1);
  }

  // Generate each pillar page
  for (const config of pillarPagesToGenerate) {
    if (config.status === 'complete') {
      console.log(`⏭️  Skipping ${config.id} (already complete)`);
      continue;
    }

    try {
      const result = await generatePillarPage(config, { skipImages: skipImagesArg });

      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 GENERATION COMPLETE');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log(`✅ Status: ${result.publishReady ? 'READY TO PUBLISH' : 'NEEDS REVISION'}`);
      console.log(`📈 Overall Score: ${result.readabilityScore.toFixed(1)}/10`);
      console.log(`📄 Word Count: ${result.fullContent.split(/\s+/).length} words`);
      console.log(`📋 Sections: ${result.sections.length}`);
      console.log(`❓ FAQ Items: ${result.faq.length}`);
      if (result.images.length > 0) {
        console.log(`🖼️  Images: ${result.images.length} (${result.images.filter((i) => i.type === 'hero').length} hero, ${result.images.filter((i) => i.type === 'section').length} sections)`);
      } else {
        console.log(`⏭️  Images: Skipped (--no-images flag)`);
      }
      console.log('');

      // Save to file for review
      saveToFile(result, 'content/drafts');

      // Save to MongoDB if structure is mongodb
      if (config.structure === 'mongodb') {
        await saveToMongoDB(result);
      }

      console.log('');
      console.log('✅ Next steps:');
      console.log('1. Review the generated content');
      console.log('2. Check SEO metadata');
      console.log('3. Verify hub-and-spoke links');
      console.log('4. Update config status to "complete" when ready');
      console.log('');
    } catch (error) {
      console.error(`❌ Error generating ${config.id}:`, error);
      if (error instanceof Error) {
        console.error(`   ${error.message}`);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generatePillarPage, saveToMongoDB, saveToFile };

