#!/usr/bin/env tsx
/**
 * Seed AI Adoption Questions to MongoDB
 *
 * This seeds educational content for engineering leaders about
 * critical questions to ask before AI adoption. Content is used by:
 * - RAG chatbot for answering adoption questions
 * - /for-ctos page and decision framework pages
 * - Learning content recommendations
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { aiAdoptionQuestions } from '../../src/data/content/ai-adoption-questions';

// Load environment variables
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedAIAdoptionQuestions() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('learning_content');

    // Transform questions into learning content format for RAG
    const learningContent = aiAdoptionQuestions.map((question) => ({
      type: 'ai_adoption_question',
      category: question.category,
      title: question.question,
      content: `
# ${question.question}

## Why This Matters
${question.why}

## How to Answer This Question
${question.howToAnswer.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Red Flags to Watch For
${question.redFlags.map((flag) => `⚠️ ${flag}`).join('\n')}

## Success Indicators
${question.successIndicators.map((indicator) => `✅ ${indicator}`).join('\n')}

${
  question.relatedFrameworks && question.relatedFrameworks.length > 0
    ? `
## Related Frameworks
${question.relatedFrameworks.map((fw) => `- ${fw}`).join('\n')}
`
    : ''
}
      `.trim(),
      tags: [
        'ai-adoption',
        'engineering-leadership',
        question.category.toLowerCase().replace(/\s+/g, '-'),
        ...question.howToAnswer
          .map((step) => {
            // Extract key terms for tags
            const terms = step
              .toLowerCase()
              .match(
                /\b(roi|cost|security|compliance|testing|team|workflow|vendor|strategy|metrics|culture)\b/g
              );
            return terms || [];
          })
          .flat(),
      ].filter((tag, index, self) => self.indexOf(tag) === index), // Unique tags
      metadata: {
        questionId: question.id,
        category: question.category,
        relatedFrameworks: question.relatedFrameworks || [],
        difficulty: 'intermediate', // All questions are leadership-level
        targetAudience: [
          'CTO',
          'VP Engineering',
          'Engineering Manager',
          'Director',
        ],
      },
      searchableText: `
        ${question.question}
        ${question.why}
        ${question.howToAnswer.join(' ')}
        ${question.redFlags.join(' ')}
        ${question.successIndicators.join(' ')}
      `.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Clear existing AI adoption questions
    const deleteResult = await collection.deleteMany({
      type: 'ai_adoption_question',
    });
    console.log(
      `🗑️  Deleted ${deleteResult.deletedCount} existing AI adoption questions`
    );

    // Insert new content
    const insertResult = await collection.insertMany(learningContent);
    console.log(
      `✅ Inserted ${insertResult.insertedCount} AI adoption questions`
    );

    // Create indexes for efficient RAG retrieval
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ searchableText: 'text' });
    await collection.createIndex({ 'metadata.targetAudience': 1 });
    console.log('✅ Created indexes for efficient retrieval');

    // Summary by category
    const categories = learningContent.reduce(
      (acc, content) => {
        acc[content.category] = (acc[content.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('\n📊 Content Summary by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

    console.log('\n✨ AI Adoption Questions seeding complete!');
    console.log(
      `📝 Total: ${learningContent.length} questions across ${Object.keys(categories).length} categories`
    );
  } catch (error) {
    console.error('❌ Error seeding AI adoption questions:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the seeding
seedAIAdoptionQuestions();
