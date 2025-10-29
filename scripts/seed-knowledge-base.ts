#!/usr/bin/env tsx

/**
 * Knowledge Base Seeder
 * Populates MongoDB with content for RAG search
 */

import { MongoClient } from 'mongodb';
// import { SentenceTransformer } from 'sentence-transformers'; // TODO: Implement actual embedding generation
import { seedPrompts } from '../src/data/seed-prompts';
import { directorPrompts } from '../src/data/director-prompts';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

interface KnowledgeDocument {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // In a real implementation, you would use a proper embedding service
  // For now, we'll create mock embeddings
  // eslint-disable-next-line no-console
  console.log('Generating embeddings for', texts.length, 'documents...');

  // Mock embedding generation (replace with actual SentenceTransformer)
  return texts.map(() =>
    Array.from({ length: 384 }, () => Math.random() - 0.5)
  );
}

async function seedKnowledgeBase() {
  try {
    await client.connect();
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection<KnowledgeDocument>('knowledge_base');

    // Clear existing documents
    await collection.deleteMany({});
    // eslint-disable-next-line no-console
    console.log('Cleared existing knowledge base');

    const documents: KnowledgeDocument[] = [];

    // Add prompt templates
    // eslint-disable-next-line no-console
    console.log('Processing prompt templates...');
    for (const prompt of seedPrompts) {
      const content = `**${prompt.title}**\n\n${prompt.description}\n\n**Prompt:**\n${prompt.content}\n\n**Category:** ${prompt.category}\n**Pattern:** ${prompt.pattern}\n**Tags:** ${prompt.tags.join(', ')}`;

      documents.push({
        _id: `prompt-${prompt.id}`,
        title: prompt.title,
        content,
        category: 'prompts',
        tags: prompt.tags,
        embedding: [], // Will be filled after embedding generation
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add director prompts
    // eslint-disable-next-line no-console
    console.log('Processing director prompts...');
    for (const prompt of directorPrompts) {
      const content = `**${prompt.title}**\n\n${prompt.description}\n\n**Prompt:**\n${prompt.content}\n\n**Category:** ${prompt.category}\n**Pattern:** ${prompt.pattern}\n**Tags:** ${prompt.tags.join(', ')}`;

      documents.push({
        _id: `director-${prompt.id}`,
        title: prompt.title,
        content,
        category: 'leadership',
        tags: prompt.tags,
        embedding: [], // Will be filled after embedding generation
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add learning resources
    // eslint-disable-next-line no-console
    console.log('Processing learning resources...');
    const learningResources = [
      {
        id: 'rag-intro',
        title: 'What is RAG (Retrieval-Augmented Generation)?',
        content: `RAG (Retrieval-Augmented Generation) is a technique that combines an LLM with a search system to access external knowledge. Instead of relying only on the LLM's training data, RAG retrieves relevant information from your documents and includes it in the prompt.

**How RAG Works:**
1. **Index**: Convert your documents into vector embeddings and store them
2. **Retrieve**: When a user asks a question, find the most relevant documents
3. **Augment**: Add the retrieved documents to the prompt as context
4. **Generate**: The LLM answers using both its knowledge and your documents

**Key Components:**
- **Vector Database**: Pinecone, Weaviate, Supabase pgvector, Chroma
- **Embeddings**: Convert text to numbers (OpenAI ada-002, Cohere)
- **Similarity Search**: Find relevant documents using cosine similarity
- **Prompt Template**: Structure that combines query + retrieved docs

**Use Cases:**
- Customer support chatbots
- Internal knowledge bases
- Document Q&A systems
- Code documentation search
- Legal/compliance queries`,
        category: 'learning',
        tags: ['rag', 'advanced', 'retrieval', 'embeddings', 'vector-db'],
      },
      {
        id: 'prompt-patterns',
        title: 'Essential Prompt Patterns',
        content: `**1. Persona Pattern**
"Act as a [role] with expertise in [domain]..."
Example: "Act as a senior software architect with expertise in microservices..."

**2. Few-Shot Learning**
Provide 2-5 examples of input → output pairs, then your actual query.
Example: "Here are examples: Input: 'happy' → Output: 'joyful'..."

**3. Chain of Thought**
Ask the AI to "think step by step" before answering.
Example: "Let's solve this step by step: 1. First, identify the key variables..."

**4. Template Pattern**
Use structured formats for consistent outputs.
Example: "Format your response as: Problem: [description], Solution: [approach]..."

**5. Cognitive Verifier**
Have the AI check its own work.
Example: "After providing your answer, verify it by checking each step..."`,
        category: 'learning',
        tags: ['patterns', 'prompting', 'techniques', 'best-practices'],
      },
    ];

    for (const resource of learningResources) {
      documents.push({
        _id: `resource-${resource.id}`,
        title: resource.title,
        content: resource.content,
        category: resource.category,
        tags: resource.tags,
        embedding: [], // Will be filled after embedding generation
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate embeddings
    // eslint-disable-next-line no-console
    console.log('Generating embeddings...');
    const texts = documents.map((doc) => `${doc.title}\n${doc.content}`);
    const embeddings = await generateEmbeddings(texts);

    // Add embeddings to documents
    documents.forEach((doc, index) => {
      doc.embedding = embeddings[index];
    });

    // Insert documents
    // eslint-disable-next-line no-console
    console.log('Inserting documents into knowledge base...');
    const result = await collection.insertMany(documents);
    // eslint-disable-next-line no-console
    console.log(`Inserted ${result.insertedCount} documents`);

    // Create vector search index
    // eslint-disable-next-line no-console
    console.log('Creating vector search index...');
    try {
      await db.createCollection('knowledge_base', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'content', 'embedding'],
            properties: {
              title: { bsonType: 'string' },
              content: { bsonType: 'string' },
              embedding: { bsonType: 'array' },
            },
          },
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Collection already exists or index creation failed:', error);
    }

    // eslint-disable-next-line no-console
    console.log('Knowledge base seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  } finally {
    await client.close();
  }
}

// Run the seeder
seedKnowledgeBase().catch(console.error);
