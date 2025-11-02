#!/usr/bin/env tsx
/**
 * Engify Admin CLI
 * 
 * Consolidated admin tool replacing 10+ one-off scripts.
 * Single entry point for all administrative tasks.
 * 
 * Usage:
 *   pnpm admin stats                    # Show all stats
 *   pnpm admin stats prompts            # Prompt stats
 *   pnpm admin stats users              # User stats
 *   pnpm admin user <email>             # Check user
 *   pnpm admin user reset <email>       # Reset user password
 *   pnpm admin prompts review           # Review prompts
 *   pnpm admin db indexes               # Ensure text indexes
 *   pnpm admin db check                 # Check DB connection
 */

import { Command } from 'commander';
import { getMongoDb } from '@/lib/db/mongodb';

const program = new Command();

program
  .name('engify-admin')
  .description('Consolidated admin tool for Engify.ai')
  .version('1.0.0');

/**
 * Stats Commands
 */
const statsCommand = program
  .command('stats')
  .description('Display statistics');

statsCommand
  .command('all')
  .description('Show all statistics')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      console.log('\n📊 Engify.ai Statistics\n');
      
      // Prompts
      const promptsCount = await db.collection('prompts').countDocuments();
      const activePrompts = await db.collection('prompts').countDocuments({ active: { $ne: false } });
      const featuredPrompts = await db.collection('prompts').countDocuments({ isFeatured: true });
      
      console.log('📝 Prompts:');
      console.log(`  Total: ${promptsCount}`);
      console.log(`  Active: ${activePrompts}`);
      console.log(`  Featured: ${featuredPrompts}`);
      
      // Patterns
      const patternsCount = await db.collection('patterns').countDocuments();
      const activePatterns = await db.collection('patterns').countDocuments({ active: { $ne: false } });
      
      console.log('\n🎨 Patterns:');
      console.log(`  Total: ${patternsCount}`);
      console.log(`  Active: ${activePatterns}`);
      
      // Users
      const usersCount = await db.collection('users').countDocuments();
      const activeUsers = await db.collection('users').countDocuments({ status: 'active' });
      
      console.log('\n👥 Users:');
      console.log(`  Total: ${usersCount}`);
      console.log(`  Active: ${activeUsers}`);
      
      // Beta Requests
      const betaRequests = await db.collection('beta_requests').countDocuments();
      const pendingRequests = await db.collection('beta_requests').countDocuments({ status: 'pending' });
      
      console.log('\n🎫 Beta Requests:');
      console.log(`  Total: ${betaRequests}`);
      console.log(`  Pending: ${pendingRequests}`);
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error fetching stats:', error);
      process.exit(1);
    }
  });

statsCommand
  .command('prompts')
  .description('Show prompt statistics')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      console.log('\n📝 Prompt Statistics\n');
      
      const total = await db.collection('prompts').countDocuments();
      const active = await db.collection('prompts').countDocuments({ active: { $ne: false } });
      const featured = await db.collection('prompts').countDocuments({ isFeatured: true });
      
      // By category
      const categories = await db.collection('prompts').aggregate([
        { $match: { active: { $ne: false } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      
      // By role
      const roles = await db.collection('prompts').aggregate([
        { $match: { active: { $ne: false } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      
      console.log(`Total: ${total}`);
      console.log(`Active: ${active}`);
      console.log(`Featured: ${featured}`);
      
      console.log('\nBy Category:');
      categories.forEach((cat) => {
        console.log(`  ${cat._id}: ${cat.count}`);
      });
      
      console.log('\nBy Role:');
      roles.forEach((role) => {
        console.log(`  ${role._id}: ${role.count}`);
      });
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error fetching prompt stats:', error);
      process.exit(1);
    }
  });

statsCommand
  .command('users')
  .description('Show user statistics')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      console.log('\n👥 User Statistics\n');
      
      const total = await db.collection('users').countDocuments();
      const active = await db.collection('users').countDocuments({ status: 'active' });
      const suspended = await db.collection('users').countDocuments({ status: 'suspended' });
      
      // By plan
      const plans = await db.collection('users').aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      
      // By role
      const roles = await db.collection('users').aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();
      
      console.log(`Total: ${total}`);
      console.log(`Active: ${active}`);
      console.log(`Suspended: ${suspended}`);
      
      console.log('\nBy Plan:');
      plans.forEach((plan) => {
        console.log(`  ${plan._id || 'none'}: ${plan.count}`);
      });
      
      console.log('\nBy Role:');
      roles.forEach((role) => {
        console.log(`  ${role._id || 'user'}: ${role.count}`);
      });
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      process.exit(1);
    }
  });

statsCommand
  .command('beta')
  .description('Show beta request statistics')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      console.log('\n🎫 Beta Request Statistics\n');
      
      const total = await db.collection('beta_requests').countDocuments();
      const pending = await db.collection('beta_requests').countDocuments({ status: 'pending' });
      const approved = await db.collection('beta_requests').countDocuments({ status: 'approved' });
      const rejected = await db.collection('beta_requests').countDocuments({ status: 'rejected' });
      
      console.log(`Total: ${total}`);
      console.log(`Pending: ${pending}`);
      console.log(`Approved: ${approved}`);
      console.log(`Rejected: ${rejected}`);
      
      // Recent requests
      const recent = await db.collection('beta_requests')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      console.log('\nRecent Requests:');
      recent.forEach((req) => {
        const date = new Date(req.createdAt).toLocaleDateString();
        console.log(`  ${req.email} - ${req.status} (${date})`);
      });
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error fetching beta stats:', error);
      process.exit(1);
    }
  });

/**
 * User Commands
 */
const userCommand = program
  .command('user')
  .description('User management commands');

userCommand
  .command('check <email>')
  .description('Check user details')
  .action(async (email: string) => {
    try {
      const db = await getMongoDb();
      const user = await db.collection('users').findOne({ email });
      
      if (!user) {
        console.log(`\n❌ User not found: ${email}\n`);
        process.exit(1);
      }
      
      console.log('\n👤 User Details\n');
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name || 'N/A'}`);
      console.log(`Role: ${user.role || 'user'}`);
      console.log(`Plan: ${user.plan || 'free'}`);
      console.log(`Status: ${user.status || 'active'}`);
      console.log(`Created: ${new Date(user.createdAt).toLocaleString()}`);
      
      if (user.lastLoginAt) {
        console.log(`Last Login: ${new Date(user.lastLoginAt).toLocaleString()}`);
      }
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error checking user:', error);
      process.exit(1);
    }
  });

userCommand
  .command('list')
  .description('List recent users')
  .option('-l, --limit <number>', 'Number of users to show', '10')
  .action(async (options) => {
    try {
      const db = await getMongoDb();
      const limit = parseInt(options.limit);
      
      const users = await db.collection('users')
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      console.log(`\n👥 Recent Users (${users.length})\n`);
      
      users.forEach((user) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        const role = user.role || 'user';
        const plan = user.plan || 'free';
        console.log(`${user.email} - ${role} (${plan}) - ${date}`);
      });
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error listing users:', error);
      process.exit(1);
    }
  });

/**
 * Prompts Commands
 */
const promptsCommand = program
  .command('prompts')
  .description('Prompt management commands');

promptsCommand
  .command('review')
  .description('Review prompts for quality')
  .option('-l, --limit <number>', 'Number of prompts to review', '10')
  .action(async (options) => {
    try {
      const db = await getMongoDb();
      const limit = parseInt(options.limit);
      
      const prompts = await db.collection('prompts')
        .find({ active: { $ne: false } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      console.log(`\n📝 Reviewing ${prompts.length} Prompts\n`);
      
      prompts.forEach((prompt, index) => {
        console.log(`${index + 1}. ${prompt.title}`);
        console.log(`   Category: ${prompt.category} | Role: ${prompt.role}`);
        console.log(`   Featured: ${prompt.isFeatured ? 'Yes' : 'No'}`);
        console.log(`   Length: ${prompt.content?.length || 0} chars`);
        console.log('');
      });
      
      process.exit(0);
    } catch (error) {
      console.error('Error reviewing prompts:', error);
      process.exit(1);
    }
  });

promptsCommand
  .command('inactive')
  .description('List inactive prompts')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      const prompts = await db.collection('prompts')
        .find({ active: false })
        .sort({ updatedAt: -1 })
        .toArray();
      
      console.log(`\n📝 Inactive Prompts (${prompts.length})\n`);
      
      prompts.forEach((prompt) => {
        console.log(`${prompt.title} - ${prompt.category}`);
      });
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error listing inactive prompts:', error);
      process.exit(1);
    }
  });

/**
 * Database Commands
 */
const dbCommand = program
  .command('db')
  .description('Database maintenance commands');

dbCommand
  .command('check')
  .description('Check database connection')
  .action(async () => {
    try {
      const db = await getMongoDb();
      const result = await db.admin().ping();
      
      console.log('\n✅ Database connection successful\n');
      console.log(`Response: ${JSON.stringify(result)}`);
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Database connection failed\n');
      console.error(error);
      console.log('');
      process.exit(1);
    }
  });

dbCommand
  .command('indexes')
  .description('Ensure text indexes exist')
  .action(async () => {
    try {
      const db = await getMongoDb();
      
      console.log('\n🔍 Creating text indexes...\n');
      
      // Prompts text index
      await db.collection('prompts').createIndex(
        { title: 'text', description: 'text', content: 'text' },
        { name: 'prompts_text_search' }
      );
      console.log('✅ Created prompts text index');
      
      // Patterns text index
      await db.collection('patterns').createIndex(
        { title: 'text', description: 'text', explanation: 'text' },
        { name: 'patterns_text_search' }
      );
      console.log('✅ Created patterns text index');
      
      // Learning content text index
      await db.collection('learning_content').createIndex(
        { title: 'text', description: 'text', content: 'text' },
        { name: 'learning_content_text_search' }
      );
      console.log('✅ Created learning content text index');
      
      console.log('\n✅ All text indexes created successfully\n');
      process.exit(0);
    } catch (error) {
      console.error('Error creating indexes:', error);
      process.exit(1);
    }
  });

dbCommand
  .command('collections')
  .description('List all collections')
  .action(async () => {
    try {
      const db = await getMongoDb();
      const collections = await db.listCollections().toArray();
      
      console.log(`\n📦 Collections (${collections.length})\n`);
      
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`${coll.name}: ${count} documents`);
      }
      
      console.log('\n');
      process.exit(0);
    } catch (error) {
      console.error('Error listing collections:', error);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

