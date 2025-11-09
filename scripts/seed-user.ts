#!/usr/bin/env tsx
/**
 * Seed User Account
 * Creates a user account for donlaur@gmail.com with password
 */

import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

async function seedUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/engify';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔐 Seeding user account...');
    
    await client.connect();
    const db = client.db();
    
    const email = 'donlaur@gmail.com';
    const password = 'temppass123'; // Change this after first login
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('✅ User already exists:', email);
      console.log('   User ID:', existingUser._id.toString());
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection('users').insertOne({
      _id: new ObjectId(),
      email,
      name: 'Donnie Laur',
      password: hashedPassword,
      role: 'admin',
      plan: 'pro',
      emailVerified: new Date(),
      image: null,
      organizationId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      favoritePrompts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ User created successfully!');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   User ID:', result.insertedId.toString());
    console.log('');
    console.log('⚠️  IMPORTANT: Change your password after first login!');
    
  } catch (error) {
    console.error('❌ Error seeding user:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedUser()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
