#!/usr/bin/env tsx

/**
 * Seed Pattern Documentation to Knowledge Base
 * Creates structured documents for each prompt pattern that can be searched via RAG
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { promptPatterns } from '../../src/data/prompt-patterns';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable not set');
  process.exit(1);
}

interface KnowledgeDoc {
  _id: string;
  type: 'pattern' | 'article' | 'example';
  title: string;
  content: string;
  category: string;
  tags: string[];
  embedding?: number[]; // Will be generated later
  metadata: {
    source: 'internal';
    patternId?: string;
    difficulty?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

const patternDescriptions: Record<string, string> = {
  persona: `
## What is the Persona Pattern?

The Persona Pattern assigns a specific role, expertise, or identity to the AI, making it respond as if it were that person or entity.

**When to use:**
- You need domain-specific expertise
- You want consistent tone and perspective
- You're solving role-specific problems

**Example:**
"Act as a senior software engineer with 10 years of experience in distributed systems..."

**Benefits:**
- More relevant, contextual responses
- Consistent expertise level
- Better alignment with your needs
  `,
  'chain-of-thought': `
## What is Chain of Thought (CoT)?

Chain of Thought prompting asks the AI to show its reasoning step-by-step before giving the final answer.

**When to use:**
- Complex reasoning tasks
- Mathematical problems
- Multi-step problem solving
- Debugging and analysis

**Example:**
"Let's solve this step by step:
1. First, identify the key variables
2. Then, analyze their relationships
3. Finally, draw a conclusion"

**Benefits:**
- 30-50% improvement on complex tasks
- More transparent reasoning
- Easier to debug and improve
  `,
  'few-shot': `
## What is Few-Shot Learning?

Few-Shot Learning provides 2-5 examples of input→output pairs before your actual query.

**When to use:**
- Formatting tasks
- Style matching
- Classification
- Pattern recognition

**Example:**
"Here are examples:
Input: 'happy' → Output: 'joyful'
Input: 'sad' → Output: 'melancholy'
Now: Input: 'angry' → Output: ?"

**Benefits:**
- Teaches AI specific patterns
- Reduces need for detailed instructions
- Works well for formatting tasks
  `,
  template: `
## What is the Template Pattern?

The Template Pattern uses structured formats to ensure consistent outputs.

**When to use:**
- You need consistent formatting
- Creating structured documents
- Generating reports or summaries
- Standardized outputs

**Example:**
"Format your response as:
Problem | Solution | Impact"

**Benefits:**
- Consistent structure
- Easier to parse programmatically
- Professional appearance
  `,
};

function generatePatternDoc(pattern: (typeof promptPatterns)[0]): KnowledgeDoc {
  const description =
    patternDescriptions[pattern.id] ||
    `
## ${pattern.name}

${pattern.description}

**Category:** ${pattern.category}
**Difficulty:** ${pattern.difficulty}

**Example:**
${pattern.example}
  `;

  return {
    _id: `pattern-${pattern.id}`,
    type: 'pattern',
    title: `${pattern.name} - Prompt Pattern`,
    content: description.trim(),
    category: pattern.category.toLowerCase(),
    tags: [
      pattern.id,
      pattern.category.toLowerCase(),
      pattern.difficulty,
      'pattern',
      'prompt-engineering',
    ],
    metadata: {
      source: 'internal',
      patternId: pattern.id,
      difficulty: pattern.difficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

async function seedPatternDocs() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    // eslint-disable-next-line no-console
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');
    const collection = db.collection<KnowledgeDoc>('knowledge_base');

    // Clear existing pattern docs (optional - comment out to keep existing)
    const deleteResult = await collection.deleteMany({ type: 'pattern' });
    // eslint-disable-next-line no-console
    console.log(
      `🗑️  Deleted ${deleteResult.deletedCount} existing pattern docs`
    );

    // Generate docs for all patterns
    const docs = promptPatterns.map(generatePatternDoc);

    // Insert pattern docs
    if (docs.length > 0) {
      const insertResult = await collection.insertMany(docs);
      // eslint-disable-next-line no-console
      console.log(
        `✅ Inserted ${insertResult.insertedCount} pattern documents`
      );
    }

    // Show summary
    // eslint-disable-next-line no-console
    console.log('\n📊 Pattern Documents:');
    docs.forEach((doc) => {
      // eslint-disable-next-line no-console
      console.log(`  ✓ ${doc.title}`);
    });

    // eslint-disable-next-line no-console
    console.log('\n💡 Next Steps:');
    // eslint-disable-next-line no-console
    console.log('  1. Generate embeddings for these documents');
    // eslint-disable-next-line no-console
    console.log('  2. Create MongoDB Atlas Vector Search index');
    // eslint-disable-next-line no-console
    console.log('  3. Update Lambda to use real embeddings');
    // eslint-disable-next-line no-console
    console.log('  4. Test search quality');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error seeding pattern docs:', error);
    throw error;
  } finally {
    await client.close();
    // eslint-disable-next-line no-console
    console.log('\n✅ Done');
  }
}

seedPatternDocs().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});
