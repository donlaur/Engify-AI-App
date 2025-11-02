/**
 * Seed Affiliate Links to MongoDB
 * Migrate affiliate link data from TypeScript to MongoDB
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import {
  affiliateLinks,
  partnershipOutreach,
} from '../../src/data/affiliate-links';

async function seedAffiliateLinks() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set');
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');
    const linksCollection = db.collection('affiliate_config');
    const outreachCollection = db.collection('partnership_outreach');

    // Clear existing data
    console.log('🗑️  Clearing existing affiliate data...');
    await linksCollection.deleteMany({});
    await outreachCollection.deleteMany({});

    // Seed affiliate links
    console.log('📝 Seeding affiliate links...');
    const links = Object.values(affiliateLinks).map((link) => ({
      ...link,
      clickCount: 0,
      conversionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const linksResult = await linksCollection.insertMany(links);
    console.log(`✅ Inserted ${linksResult.insertedCount} affiliate links`);

    // Seed partnership outreach
    console.log('📝 Seeding partnership outreach...');
    const outreach = partnershipOutreach.map((item) => ({
      ...item,
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const outreachResult = await outreachCollection.insertMany(outreach);
    console.log(`✅ Inserted ${outreachResult.insertedCount} outreach items`);

    console.log('✅ Affiliate links migration complete!');
  } catch (error) {
    console.error('❌ Error seeding affiliate links:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

seedAffiliateLinks();
