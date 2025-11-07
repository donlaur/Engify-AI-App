#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'donlaur@engify.ai';
const NEW_PASSWORD = 'TempPass123!';

async function fixPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting...');
    await client.connect();
    console.log('✅ Connected\n');
    
    const db = client.db('engify');
    const users = db.collection('users');
    
    // Get current user
    const user = await users.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    console.log('👤 Current user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Has password: ${user.password ? 'YES' : 'NO'}`);
    console.log(`   Password hash length: ${user.password?.length || 0}`);
    console.log('');
    
    // Hash new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
    console.log(`   New hash: ${hashedPassword.substring(0, 20)}...`);
    console.log(`   Hash length: ${hashedPassword.length}`);
    console.log('');
    
    // Verify the hash works BEFORE updating DB
    console.log('✅ Testing hash locally...');
    const testValid = await bcrypt.compare(NEW_PASSWORD, hashedPassword);
    console.log(`   Test result: ${testValid ? 'PASS ✅' : 'FAIL ❌'}`);
    
    if (!testValid) {
      console.error('❌ Hash test failed! Not updating DB.');
      process.exit(1);
    }
    
    // Update database
    console.log('\n💾 Updating database...');
    const result = await users.updateOne(
      { email: ADMIN_EMAIL },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );
    
    console.log(`   Modified: ${result.modifiedCount}`);
    console.log('');
    
    // Verify update worked
    console.log('🔍 Verifying update...');
    const updatedUser = await users.findOne({ email: ADMIN_EMAIL });
    const verifyValid = await bcrypt.compare(NEW_PASSWORD, updatedUser.password);
    console.log(`   Verification: ${verifyValid ? 'PASS ✅' : 'FAIL ❌'}`);
    
    if (verifyValid) {
      console.log('\n✅ SUCCESS! Password updated and verified.');
      console.log('\n🌐 Login at: https://engify.ai/login');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log('');
    } else {
      console.error('\n❌ Verification failed after update!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fixPassword();

