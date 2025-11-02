/**
 * Simple Prompt Quality Audit Script
 * Lists all prompts and their quality metrics
 * 
 * Run with: MONGODB_URI=xxx node scripts/admin/audit-prompt-quality.js
 */

const { MongoClient } = require('mongodb');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const db = client.db('engify');
    const prompts = await db.collection('prompts').find({}).toArray();

    console.log('\n📊 PROMPT QUALITY AUDIT\n');
    console.log('=' + '='.repeat(70) + '\n');
    console.log(`Total Prompts: ${prompts.length}\n`);

    // Group by active status
    const active = prompts.filter(p => p.active !== false);
    const inactive = prompts.filter(p => p.active === false);
    
    console.log(`✅ Active: ${active.length}`);
    console.log(`❌ Inactive: ${inactive.length}\n`);

    // Group by source
    const bySource = {};
    prompts.forEach((p) => {
      let source = p.source || 'unknown';
      if (p.id?.startsWith('generated-') && !p.source) source = 'ai-generated';
      else if (!p.source) source = 'seed';
      
      if (!bySource[source]) bySource[source] = [];
      bySource[source].push(p);
    });

    console.log('📋 By Source:');
    Object.entries(bySource).forEach(([source, items]) => {
      const activeCount = items.filter(p => p.active !== false).length;
      console.log(`  ${source}: ${items.length} total (${activeCount} active)`);
    });

    // Content quality check
    const incomplete = prompts.filter((p) => {
      const content = p.content || p.prompt || '';
      return content.length < 100 || !p.title || !p.description || !p.category;
    });

    console.log(`\n⚠️  Incomplete Prompts: ${incomplete.length}`);
    if (incomplete.length > 0) {
      console.log('\nSample incomplete prompts:');
      incomplete.slice(0, 10).forEach((p, i) => {
        const content = p.content || p.prompt || '';
        const active = p.active !== false ? '✅' : '❌';
        console.log(`  ${i + 1}. ${active} [${p.id}] ${p.title || 'NO TITLE'}`);
        console.log(`     Category: ${p.category || 'MISSING'} | Content length: ${content.length} chars`);
      });
      if (incomplete.length > 10) {
        console.log(`     ... and ${incomplete.length - 10} more`);
      }
    }

    // Quality score distribution
    const withScores = prompts.filter((p) => p.qualityScore);
    console.log(`\n📊 Quality Scores:`);
    console.log(`  Prompts with scores: ${withScores.length}/${prompts.length}`);
    console.log(`  Prompts without scores: ${prompts.length - withScores.length}`);

    if (withScores.length > 0) {
      const avgScore = withScores.reduce((sum, p) => 
        sum + (p.qualityScore?.overall || 0), 0) / withScores.length;
      console.log(`  Average score: ${avgScore.toFixed(2)}/10`);
    }

    // Show recommendations
    console.log(`\n💡 RECOMMENDATIONS:\n`);
    if (incomplete.length > 0) {
      console.log(`1. Mark ${incomplete.length} incomplete prompts as inactive:`);
      console.log(`   These have < 100 chars of content or missing fields\n`);
    }
    if (prompts.length - withScores.length > 0) {
      console.log(`2. ${prompts.length - withScores.length} prompts need quality scores`);
      console.log(`   These should be reviewed and scored manually\n`);
    }
    
    const aiGenerated = bySource['ai-generated'] || [];
    const aiActive = aiGenerated.filter(p => p.active !== false);
    if (aiActive.length > 0) {
      console.log(`3. ${aiActive.length} AI-generated prompts are still active`);
      console.log(`   Review these and mark low-quality ones as inactive\n`);
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();


