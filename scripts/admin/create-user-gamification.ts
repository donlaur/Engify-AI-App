/**
 * Create User Gamification Data
 * 
 * Run this to initialize gamification for existing users
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { GamificationService } from '../../src/lib/services/GamificationService';
import { getDb } from '../../src/lib/db/mongodb';

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Usage: pnpm tsx scripts/admin/create-user-gamification.ts <email>');
    process.exit(1);
  }

  console.log(`\n🎮 Creating gamification data for: ${email}\n`);

  try {
    const db = await getDb();
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name || email}`);
    console.log(`   User ID: ${user._id.toString()}`);

    // Initialize gamification
    const gamificationService = new GamificationService();
    const gamification = await gamificationService.getUserGamification(user._id.toString());

    console.log('\n📊 Gamification Data:');
    console.log(`   Level: ${gamification.level}`);
    console.log(`   XP: ${gamification.xp}`);
    console.log(`   Daily Streak: ${gamification.dailyStreak}`);
    console.log(`   Achievements: ${gamification.achievements.length}`);
    console.log(`   Prompts Used: ${gamification.stats.promptsUsed}`);
    console.log(`   Patterns Completed: ${gamification.stats.patternsCompleted}`);

    console.log('\n✅ Gamification data initialized!');
    console.log(`   Dashboard: https://engify.ai/dashboard`);
    console.log(`   API: https://engify.ai/api/gamification/stats\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

