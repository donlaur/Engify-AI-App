/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SECURITY: This is a system-wide admin script, not user-scoped.
 * Direct DB access is intentional for admin user management.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient, ObjectId }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');
  
  // SECURITY: This query is intentionally system-wide (admin script)
  const user = await db.collection('users').findOne({ email: 'donlaur@engify.ai' });
  
  console.log('\n👤 User Account Check: donlaur@engify.ai\n');
  
  if (user) {
    console.log('✅ Account exists');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Has password:', user.password ? 'YES' : 'NO');
    
    if (user.role !== 'super_admin') {
      console.log('\n⚠️  Upgrading to super_admin...');
      await db.collection('users').updateOne(
        { email: 'donlaur@engify.ai' },
        { $set: { role: 'super_admin', updatedAt: new Date() } }
      );
      console.log('✅ Role updated to super_admin\n');
    } else {
      console.log('\n✅ Already super_admin - ready to login!\n');
    }
  } else {
    console.log('❌ Account NOT found - creating...\n');
    
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('TempPass123!', 12);
    
    const result = await db.collection('users').insertOne({
      _id: new ObjectId(),
      email: 'donlaur@engify.ai',
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
    
    console.log('✅ Created super_admin account');
    console.log('   Email: contact@engify.ai');
    console.log('   Temp Password: TempPass123!');
    console.log('   Role: super_admin');
    console.log('\n⚠️  Login and change password immediately!\n');
  }
  
  await client.close();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
