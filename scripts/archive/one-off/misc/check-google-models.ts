/**
 * Check Google/Gemini models in database
 */
import { getMongoDb } from '@/lib/db/mongodb';

async function checkGoogleModels() {
  const db = await getMongoDb();
  const googleModels = await db.collection('ai_models')
    .find({ provider: 'google', status: 'active' })
    .sort({ recommended: -1, tier: 1 })
    .toArray();
  
  console.log('\n📊 Google/Gemini Models in Database:');
  console.log('=====================================\n');
  
  if (googleModels.length === 0) {
    console.log('❌ No Google models found in database');
    console.log('   Run: pnpm tsx scripts/db/sync-ai-models-latest.ts');
    return;
  }
  
  googleModels.forEach((m, i) => {
    console.log(`${i + 1}. ${m.displayName}`);
    console.log(`   ID: ${m.id}`);
    console.log(`   Provider: ${m.provider}`);
    console.log(`   Recommended: ${m.recommended ? '✅' : '❌'}`);
    console.log(`   Tier: ${m.tier}`);
    console.log(`   Status: ${m.status}`);
    console.log('');
  });
  
  // Find recommended model
  const recommended = googleModels.find(m => m.recommended);
  if (recommended) {
    console.log(`✅ Recommended Model: ${recommended.id} (${recommended.displayName})`);
  } else {
    console.log('⚠️  No recommended model - using first active model');
    if (googleModels.length > 0) {
      console.log(`   Using: ${googleModels[0].id} (${googleModels[0].displayName})`);
    }
  }
}

checkGoogleModels().catch(console.error);

