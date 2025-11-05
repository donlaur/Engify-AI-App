#!/usr/bin/env tsx
/**
 * Pre-Enrich Prompts Before Auditing
 * 
 * Adds missing enrichment fields (whatIs, whyUse, SEO basics) to prompts
 * so they get better audit scores. Safe to run multiple times.
 * 
 * Usage:
 *   pnpm tsx scripts/content/pre-enrich-prompts.ts
 *   pnpm tsx scripts/content/pre-enrich-prompts.ts --limit=20
 *   pnpm tsx scripts/content/pre-enrich-prompts.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

interface EnrichmentStats {
  whatIsAdded: number;
  whyUseAdded: number;
  metaDescriptionsAdded: number;
  slugsOptimized: number;
  totalImproved: number;
}

async function preEnrichPrompts(limit?: number, dryRun: boolean = false): Promise<EnrichmentStats> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Pre-Enrich Prompts (Before Auditing)                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  const db = await getMongoDb();
  const provider = new OpenAIAdapter('gpt-4o');

  const stats: EnrichmentStats = {
    whatIsAdded: 0,
    whyUseAdded: 0,
    metaDescriptionsAdded: 0,
    slugsOptimized: 0,
    totalImproved: 0,
  };

  // Get prompts that need enrichment
  const prompts = await db.collection('prompts').find({}).limit(limit || 1000).toArray();
  console.log(`📋 Found ${prompts.length} prompts to check\n`);

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const improvements: string[] = [];
    const updates: any = {};

    // Check if whatIs is missing or just the title
    const isWhatIsJustTitle = prompt.whatIs && (
      prompt.whatIs.trim() === prompt.title.trim() ||
      prompt.whatIs.trim().toLowerCase() === prompt.title.trim().toLowerCase() ||
      prompt.whatIs.length < 50
    );

    if (!prompt.whatIs || isWhatIsJustTitle) {
      console.log(`[${i + 1}/${prompts.length}] 📝 ${prompt.title || prompt.id}`);
      console.log(`   📖 Generating "What is" explanation...`);
      
      if (!dryRun) {
        try {
          const whatIsPrompt = `Generate a clear, comprehensive explanation (3-5 sentences) of what "${prompt.title}" is.

Description: ${prompt.description?.substring(0, 300) || 'N/A'}
Category: ${prompt.category || 'N/A'}

Requirements:
- Explain what the concept/prompt is (NOT just repeat the title)
- 3-5 sentences, written for SEO and user education
- Be specific and informative
- Write naturally, not AI-generated sounding

Return ONLY the explanation text (no JSON, no markdown, just the text):`;

          const response = await provider.execute({
            prompt: whatIsPrompt,
            temperature: 0.7,
            maxTokens: 300,
          });

          const whatIs = response.content.trim();
          if (whatIs && whatIs.length > 50 && whatIs.toLowerCase() !== prompt.title.toLowerCase()) {
            updates.whatIs = whatIs;
            improvements.push('Added "What is" explanation');
            stats.whatIsAdded++;
          }
        } catch (error) {
          console.error(`   ❌ Error generating whatIs: ${error}`);
        }
      } else {
        improvements.push('Would add "What is" explanation');
      }
    }

    // Check if whyUse is missing or empty
    if (!prompt.whyUse || prompt.whyUse.length === 0) {
      if (improvements.length === 0) {
        console.log(`[${i + 1}/${prompts.length}] 📝 ${prompt.title || prompt.id}`);
      }
      console.log(`   ❓ Generating "Why use" reasons...`);
      
      if (!dryRun) {
        try {
          const whyUsePrompt = `Generate 6-8 specific reasons why someone would use "${prompt.title}".

Description: ${prompt.description?.substring(0, 300) || 'N/A'}
Category: ${prompt.category || 'N/A'}

Requirements:
- Focus on practical benefits and real-world value
- Be specific and actionable
- Each reason should be a complete sentence

Return as JSON array:
["reason 1", "reason 2", ...]`;

          const response = await provider.execute({
            prompt: whyUsePrompt,
            temperature: 0.7,
            maxTokens: 500,
          });

          const jsonMatch = response.content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const whyUse = JSON.parse(jsonMatch[0]);
            if (Array.isArray(whyUse) && whyUse.length >= 3) {
              updates.whyUse = whyUse;
              improvements.push(`Added ${whyUse.length} "Why use" reasons`);
              stats.whyUseAdded++;
            }
          }
        } catch (error) {
          console.error(`   ❌ Error generating whyUse: ${error}`);
        }
      } else {
        improvements.push('Would add "Why use" reasons');
      }
    }

    // Check if meta description is missing or too short
    if (!prompt.metaDescription || prompt.metaDescription.length < 100) {
      if (improvements.length === 0) {
        console.log(`[${i + 1}/${prompts.length}] 📝 ${prompt.title || prompt.id}`);
      }
      console.log(`   🔍 Generating meta description...`);
      
      if (!dryRun) {
        try {
          const metaPrompt = `Generate an SEO-optimized meta description (150-160 characters) for this prompt:

Title: ${prompt.title}
Description: ${prompt.description?.substring(0, 200) || 'N/A'}

Requirements:
- Exactly 150-160 characters
- Keyword-rich and compelling
- Include main value proposition

Return ONLY the meta description text (no quotes, no JSON):`;

          const response = await provider.execute({
            prompt: metaPrompt,
            temperature: 0.5,
            maxTokens: 200,
          });

          const metaDescription = response.content.trim().replace(/^["']|["']$/g, '');
          if (metaDescription.length >= 100 && metaDescription.length <= 165) {
            updates.metaDescription = metaDescription;
            improvements.push('Added meta description');
            stats.metaDescriptionsAdded++;
          }
        } catch (error) {
          console.error(`   ❌ Error generating meta description: ${error}`);
        }
      } else {
        improvements.push('Would add meta description');
      }
    }

    // Check if slug is missing or not SEO-friendly
    const hasSlug = prompt.slug && prompt.slug.length > 0;
    const isSlugPoor = hasSlug && (
      prompt.slug === prompt.id ||
      prompt.slug.includes('_') ||
      prompt.slug.length > 60 ||
      prompt.slug.split('-').length < 2
    );

    if (!hasSlug || isSlugPoor) {
      if (improvements.length === 0) {
        console.log(`[${i + 1}/${prompts.length}] 📝 ${prompt.title || prompt.id}`);
      }
      console.log(`   🔗 Optimizing slug...`);
      
      if (!dryRun) {
        try {
          const slugPrompt = `Generate an SEO-friendly slug for this prompt:

Title: ${prompt.title}
Current slug: ${prompt.slug || 'none'}

Requirements:
- Short, descriptive, keyword-rich
- Lowercase, hyphens only (no underscores)
- 3-8 words maximum
- Include main keywords

Return ONLY the slug (no quotes, no JSON, just: slug-text-here):`;

          const response = await provider.execute({
            prompt: slugPrompt,
            temperature: 0.3,
            maxTokens: 50,
          });

          const slug = response.content.trim()
            .toLowerCase()
            .replace(/^["']|["']$/g, '')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          if (slug && slug.length > 5 && slug.length < 60) {
            // Validate slug uniqueness before saving
            const existingPrompt = await db.collection('prompts').findOne({
              slug: slug,
              id: { $ne: prompt.id }
            });
            
            if (existingPrompt) {
              // Generate unique slug with numeric suffix
              const { generateUniqueSlug } = await import('@/lib/utils/slug');
              const allSlugs = new Set<string>();
              const allPrompts = await db.collection('prompts').find({}).toArray();
              allPrompts.forEach((p: any) => {
                if (p.slug && p.id !== prompt.id) {
                  allSlugs.add(p.slug);
                }
              });
              
              const uniqueSlug = generateUniqueSlug(prompt.title || slug, allSlugs);
              updates.slug = uniqueSlug;
              improvements.push('Optimized slug (unique)');
              stats.slugsOptimized++;
              console.log(`   ✅ Generated unique slug: ${uniqueSlug}`);
            } else {
              updates.slug = slug;
              improvements.push('Optimized slug');
              stats.slugsOptimized++;
            }
          }
        } catch (error) {
          console.error(`   ❌ Error generating slug: ${error}`);
        }
      } else {
        improvements.push('Would optimize slug');
      }
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      if (dryRun) {
        console.log(`   🔍 Would apply: ${improvements.join(', ')}`);
      } else {
        await db.collection('prompts').updateOne(
          { id: prompt.id },
          { 
            $set: {
              ...updates,
              updatedAt: new Date(),
            }
          }
        );
        console.log(`   ✅ Applied: ${improvements.join(', ')}`);
        stats.totalImproved++;
      }
    } else if (improvements.length === 0) {
      // Silent skip - only log if there were improvements attempted
    }
  }

  await db.client.close();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📖 "What is" explanations added: ${stats.whatIsAdded}`);
  console.log(`❓ "Why use" reasons added: ${stats.whyUseAdded}`);
  console.log(`🔍 Meta descriptions added: ${stats.metaDescriptionsAdded}`);
  console.log(`🔗 Slugs optimized: ${stats.slugsOptimized}`);
  console.log(`\n✅ Total prompts improved: ${stats.totalImproved}`);

  return stats;
}

const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

preEnrichPrompts(limit, dryRun)
  .then(() => {
    console.log('\n✅ Pre-enrichment completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Pre-enrichment failed:', error);
    process.exit(1);
  });

