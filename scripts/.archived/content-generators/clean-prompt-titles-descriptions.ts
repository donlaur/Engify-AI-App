#!/usr/bin/env tsx

/**
 * Clean up prompt titles and descriptions
 * 
 * This script:
 * 1. Removes .md extensions from titles
 * 2. Converts slug-style titles to proper titles (e.g., "pestel-analysis-prompt-template" → "Pestel Analysis Prompt Template")
 * 3. Cleans descriptions that contain metadata like "**Prompt Name**: ..."
 * 4. Ensures all titles are properly capitalized
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';

/**
 * Convert a slug to a proper title
 * e.g., "pestel-analysis-prompt-template" → "Pestel Analysis Prompt Template"
 */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => {
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Check if a string looks like a slug (hyphenated, lowercase)
 * Returns true only if it's clearly a slug (all lowercase, hyphenated)
 */
function isSlug(text: string): boolean {
  // Must have hyphens
  if (!text.includes('-')) {
    return false;
  }
  
  // Must be all lowercase (no uppercase letters except in special cases like "1-on-1")
  // Allow numbers and hyphens
  const hasUppercase = /[A-Z]/.test(text);
  
  // If it has uppercase letters, check if it's already properly formatted
  if (hasUppercase) {
    // Check if it looks like proper title case (first letter of words is uppercase)
    const words = text.split(/-|\s+/);
    const allWordsProperlyCapitalized = words.every(word => {
      // Skip empty words, numbers, or special patterns like "1-on-1"
      if (!word || /^\d+$/.test(word) || word === 'on') return true;
      // First character should be uppercase (check length first)
      return word.length > 0 && word[0] === word[0].toUpperCase();
    });
    
    // If already properly capitalized, it's not a slug
    if (allWordsProperlyCapitalized) {
      return false;
    }
  }
  
  // It's a slug if it's all lowercase
  return text.toLowerCase() === text;
}

/**
 * Clean description that might contain metadata
 * Removes patterns like "**Prompt Name**: filename.md" or similar metadata
 */
function cleanDescription(description: string): string {
  let cleaned = description;

  // Remove metadata patterns like "**Prompt Name**: ..."
  cleaned = cleaned.replace(/^\*\*Prompt Name\*\*[:\s]*[^\n]+\n/gi, '');
  cleaned = cleaned.replace(/^\*\*Prompt Description\*\*[:\s]*/gi, '');
  cleaned = cleaned.replace(/^\*\*Attribution\*\*[:\s]*[^\n]+\n/gi, '');
  cleaned = cleaned.replace(/^\*\*Licensing\*\*[:\s]*[^\n]+\n/gi, '');
  
  // Remove lines that are just metadata separators
  cleaned = cleaned.replace(/^[-]{3,}\s*$/gm, '');
  
  // Clean up multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Normalize title to proper format
 */
function normalizeTitle(title: string): string {
  // Remove .md extension
  let normalized = title.replace(/\.md$/i, '');
  
  // If it looks like a slug (all lowercase, hyphenated), convert it to a title
  if (isSlug(normalized)) {
    normalized = slugToTitle(normalized);
  }
  // Don't change titles that are already properly formatted
  // The title is already good if it has any uppercase letters in proper positions

  return normalized;
}

async function cleanPromptTitlesAndDescriptions() {
  console.log('🔍 Finding prompts with title/description issues...\n');

  try {
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');

    // Find all prompts that might have issues
    const allPrompts = await promptsCollection.find({}).toArray();

    console.log(`📊 Analyzing ${allPrompts.length} prompts\n`);

    let titleUpdatedCount = 0;
    let descriptionUpdatedCount = 0;
    let skippedCount = 0;

    for (const prompt of allPrompts) {
      const originalTitle = prompt.title || '';
      const originalDescription = prompt.description || '';
      
      let needsTitleUpdate = false;
      let needsDescriptionUpdate = false;
      
      let newTitle = originalTitle;
      let newDescription = originalDescription;

      // Check if title needs fixing
      if (originalTitle) {
        // Only fix if it has .md extension OR if it's clearly a slug (all lowercase, hyphenated)
        if (originalTitle.match(/\.md$/i)) {
          newTitle = normalizeTitle(originalTitle);
          needsTitleUpdate = newTitle !== originalTitle;
        }
        // Only convert if it's clearly a slug (all lowercase, hyphenated)
        // Don't touch titles that already have proper capitalization
        else if (isSlug(originalTitle)) {
          newTitle = normalizeTitle(originalTitle);
          needsTitleUpdate = newTitle !== originalTitle;
        }
      }

      // Check if description needs cleaning
      if (originalDescription) {
        const cleanedDescription = cleanDescription(originalDescription);
        if (cleanedDescription !== originalDescription) {
          newDescription = cleanedDescription;
          needsDescriptionUpdate = true;
        }
      }

      // Skip if no changes needed
      if (!needsTitleUpdate && !needsDescriptionUpdate) {
        skippedCount++;
        continue;
      }

      // Check if another prompt already has the new title
      if (needsTitleUpdate && newTitle !== originalTitle) {
        const existingPrompt = await promptsCollection.findOne({
          title: newTitle,
          _id: { $ne: prompt._id },
        });

        if (existingPrompt) {
          console.log(`   ⚠️  Skipped title update: "${originalTitle}" → "${newTitle}" (title already exists)`);
          needsTitleUpdate = false;
        }
      }

      // Prepare update
      const updateFields: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (needsTitleUpdate) {
        updateFields.title = newTitle;
      }

      if (needsDescriptionUpdate) {
        updateFields.description = newDescription;
      }

      // Update the prompt
      await promptsCollection.updateOne(
        { _id: prompt._id },
        { $set: updateFields }
      );

      if (needsTitleUpdate) {
        console.log(`   ✅ Title: "${originalTitle}" → "${newTitle}"`);
        titleUpdatedCount++;
      }

      if (needsDescriptionUpdate) {
        console.log(`   ✅ Description cleaned (removed metadata)`);
        descriptionUpdatedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Titles updated: ${titleUpdatedCount}`);
    console.log(`   ✅ Descriptions cleaned: ${descriptionUpdatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount} prompts`);
    console.log(`   📈 Total processed: ${allPrompts.length} prompts\n`);

    if (titleUpdatedCount > 0 || descriptionUpdatedCount > 0) {
      console.log('✨ Cleanup completed successfully!');
    } else {
      console.log('ℹ️  No prompts needed cleanup.');
    }
  } catch (error) {
    logger.error('Failed to clean prompt titles and descriptions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Error cleaning prompts:', error);
    process.exit(1);
  }
}

// Run the script
cleanPromptTitlesAndDescriptions();

