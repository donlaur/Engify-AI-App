#!/usr/bin/env tsx
/**
 * Restore User from Backup
 * Restores donlaur@engify.ai account from Nov 6 backup
 */

import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

async function restoreUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/engify';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Restoring user from backup...');
    
    // Read backup
    const backupPath = path.join(process.cwd(), 'backups', 'users_2025-11-06_15-44-50.json');
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    const originalUser = backup[0];
    
    await client.connect();
    const db = client.db();
    
    // Delete the gmail account I just created
    await db.collection('users').deleteOne({ email: 'donlaur@gmail.com' });
    console.log('🗑️  Removed temporary gmail account');
    
    // Check if original account already exists
    const existing = await db.collection('users').findOne({ _id: new ObjectId(originalUser._id) });
    if (existing) {
      console.log('✅ Original account already exists');
      return;
    }
    
    // Restore original account
    const userToRestore = {
      ...originalUser,
      _id: new ObjectId(originalUser._id),
      emailVerified: originalUser.emailVerified ? new Date(originalUser.emailVerified) : null,
      createdAt: new Date(originalUser.createdAt),
      updatedAt: new Date(originalUser.updatedAt),
      favoritePrompts: originalUser.favoritePrompts || [],
    };
    
    await db.collection('users').insertOne(userToRestore);
    
    console.log('✅ User restored successfully!');
    console.log('   Email:', originalUser.email);
    console.log('   Role:', originalUser.role);
    console.log('   User ID:', originalUser._id);
    console.log('');
    console.log('⚠️  You can log in with your original password');
    
  } catch (error) {
    console.error('❌ Error restoring user:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

restoreUser()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
