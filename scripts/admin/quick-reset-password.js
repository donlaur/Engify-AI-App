#!/usr/bin/env node
/**
 * Quick password reset for admin user
 * Usage: MONGODB_URI="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." node scripts/admin/quick-reset-password.js
 */

const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'donlaur@engify.ai';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI required');
  process.exit(1);
}

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('❌ ADMIN_PASSWORD required (min 8 chars)');
  process.exit(1);
}

async function resetPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected');
    
    const db = client.db('engify');
    const users = db.collection('users');
    
    console.log(`\n🔍 Looking for user: ${ADMIN_EMAIL}`);
    const existingUser = await users.findOne({ email: ADMIN_EMAIL });
    
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    if (existingUser) {
      console.log('👤 User found - updating password');
      await users.updateOne(
        { email: ADMIN_EMAIL },
        {
          $set: {
            password: hashedPassword,
            role: 'super_admin',
            emailVerified: new Date(),
            updatedAt: new Date(),
          },
        }
      );
      console.log('✅ Password updated');
    } else {
      console.log('👤 User not found - creating new user');
      await users.insertOne({
        _id: new ObjectId(),
        email: ADMIN_EMAIL,
        name: 'Donnie Laur',
        password: hashedPassword,
        role: 'super_admin',
        emailVerified: new Date(),
        image: null,
        organizationId: null,
        plan: 'enterprise_premium',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ User created');
    }
    
    console.log('\n✅ Done! You can now login with:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: [the one you set]`);
    console.log('\n🌐 Login at: https://engify.ai/login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetPassword();

