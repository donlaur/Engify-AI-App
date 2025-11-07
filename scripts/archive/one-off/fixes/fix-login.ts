/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/**
 * URGENT: Create/Reset Admin User for Login
 * 
 * This script creates or updates your admin user in MongoDB
 * Run this to fix login issues immediately.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient, ObjectId }) => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    console.error('   Please add your MongoDB connection string to .env.local');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('engify');
    
    // SECURITY: Admin email from environment variable
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'donlaur@engify.ai';
    
    // SECURITY: This is an admin script - direct DB access is intentional
    // System-wide admin access - no organizationId filter needed
    // eslint-disable-next-line engify/no-hardcoded-collections, engify/require-organization-id
    const existingUser = await db.collection('users').findOne({ 
      email: ADMIN_EMAIL
    });
    
    const bcrypt = await import('bcryptjs');
    
    // SECURITY: Password MUST be provided via environment variable
    const NEW_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!NEW_PASSWORD || NEW_PASSWORD.length < 8) {
      console.error('❌ ADMIN_PASSWORD environment variable is required and must be at least 8 characters');
      console.error('   Usage: ADMIN_PASSWORD=YourSecurePassword123! pnpm tsx scripts/admin/fix-login.ts');
      process.exit(1);
    }
    const hashedPassword = await bcrypt.default.hash(NEW_PASSWORD, 12);
    
    if (existingUser) {
      console.log(`👤 Found existing user: ${ADMIN_EMAIL}`);
      console.log('   Current role:', existingUser.role || 'user');
      console.log('   Has password:', existingUser.password ? 'YES' : 'NO');
      console.log('\n🔄 Updating user...\n');
      
      // Update user
      // eslint-disable-next-line engify/no-hardcoded-collections
      await db.collection('users').updateOne(
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
      
      console.log('✅ User updated successfully!');
    } else {
      console.log('👤 Creating new admin user...\n');
      
      // Create new user
      // eslint-disable-next-line engify/no-hardcoded-collections
      await db.collection('users').insertOne({
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
      
      console.log('✅ User created successfully!');
    }
    
    console.log('\n✅ Admin user ready for login');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Role: super_admin');
    console.log('\n⚠️  SECURITY: Password was set but not displayed. Change password after first login!\n');
    
    // Verify the user exists
    // System-wide admin access - no organizationId filter needed
    // eslint-disable-next-line engify/no-hardcoded-collections, engify/require-organization-id
    const verifyUser = await db.collection('users').findOne({ 
      email: ADMIN_EMAIL
    });
    
    if (verifyUser && verifyUser.password) {
      console.log('✅ Verification: User exists and has password set');
      console.log('✅ Ready to login at: https://engify.ai/login\n');
    } else {
      console.error('❌ Verification failed: User not found or missing password');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.close();
  }
}).catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

