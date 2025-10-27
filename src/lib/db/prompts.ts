/**
 * Database operations for prompts
 */

import { MongoClient } from 'mongodb';
import type { Prompt } from '@/lib/schemas/prompt';

const uri = process.env.MONGODB_URI || '';
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const prompts = await db
      .collection('prompts')
      .find({ isPublic: true })
      .sort({ isFeatured: -1, views: -1 })
      .toArray();

    return prompts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    })) as unknown as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const prompt = await db.collection('prompts').findOne({ slug, isPublic: true });

    if (!prompt) return null;

    return {
      ...prompt,
      _id: prompt._id.toString(),
    } as unknown as Prompt;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

export async function getPromptsByCategory(category: string): Promise<Prompt[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const prompts = await db
      .collection('prompts')
      .find({ category, isPublic: true })
      .sort({ views: -1 })
      .toArray();

    return prompts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    })) as unknown as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    return [];
  }
}

export async function getPromptsByRole(role: string): Promise<Prompt[]> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const prompts = await db
      .collection('prompts')
      .find({ role, isPublic: true })
      .sort({ views: -1 })
      .toArray();

    return prompts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    })) as unknown as Prompt[];
  } catch (error) {
    console.error('Error fetching prompts by role:', error);
    return [];
  }
}

export async function incrementPromptViews(slug: string): Promise<void> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    await db.collection('prompts').updateOne(
      { slug },
      { $inc: { views: 1 } }
    );
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}
