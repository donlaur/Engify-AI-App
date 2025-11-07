/**
 * Full Prompt & Pattern Audit
 * 
 * Reviews:
 * - Incomplete prompts (missing fields, short content)
 * - Patterns with no example prompts
 * - Patterns that need enrichment (missing fullDescription, useCases, etc.)
 * - Data in DB but not displayed on pages
 * - Patterns with high value scores but low content (like Cognitive Verifier)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');

  // ============================================
  // 1. PROMPT AUDIT
  // ============================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 PROMPT AUDIT');
  console.log('='.repeat(80) + '\n');

  const prompts = await db.collection('prompts').find({}).toArray();
  console.log(`Total Prompts in DB: ${prompts.length}\n`);

  // Active vs Inactive
  const active = prompts.filter((p: any) => p.active !== false);
  const inactive = prompts.filter((p: any) => p.active === false);
  console.log(`✅ Active: ${active.length}`);
  console.log(`❌ Inactive: ${inactive.length}\n`);

  // Incomplete Prompts
  const incompletePrompts = prompts.filter((p: any) => {
    const content = p.content || '';
    const hasTitle = !!p.title;
    const hasDescription = !!p.description && p.description.length > 20;
    const hasContent = content.length >= 100;
    const hasCategory = !!p.category;
    
    return !hasTitle || !hasDescription || !hasContent || !hasCategory;
  });

  console.log(`⚠️  INCOMPLETE PROMPTS: ${incompletePrompts.length}`);
  if (incompletePrompts.length > 0) {
    console.log('\nTop 20 incomplete prompts:');
    incompletePrompts.slice(0, 20).forEach((p: any, i: number) => {
      const content = p.content || '';
      const issues: string[] = [];
      if (!p.title) issues.push('NO TITLE');
      if (!p.description || p.description.length <= 20) issues.push('NO/MINIMAL DESCRIPTION');
      if (content.length < 100) issues.push(`SHORT CONTENT (${content.length} chars)`);
      if (!p.category) issues.push('NO CATEGORY');
      
      console.log(`  ${i + 1}. [${p.id || 'NO ID'}] ${p.title || 'NO TITLE'}`);
      console.log(`     Issues: ${issues.join(', ')}`);
      console.log(`     Category: ${p.category || 'MISSING'} | Pattern: ${p.pattern || 'NONE'}`);
    });
    if (incompletePrompts.length > 20) {
      console.log(`     ... and ${incompletePrompts.length - 20} more`);
    }
  }

  // Prompts by Pattern
  const promptsByPattern = new Map<string, any[]>();
  prompts.forEach((p: any) => {
    if (p.pattern) {
      const existing = promptsByPattern.get(p.pattern) || [];
      existing.push(p);
      promptsByPattern.set(p.pattern, existing);
    }
  });

  console.log(`\n📋 Prompts by Pattern:`);
  const sortedPatterns = Array.from(promptsByPattern.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  sortedPatterns.forEach(([pattern, patternPrompts]) => {
    const activeCount = patternPrompts.filter((p: any) => p.active !== false).length;
    console.log(`  ${pattern}: ${patternPrompts.length} total (${activeCount} active)`);
  });

  // ============================================
  // 2. PATTERN AUDIT
  // ============================================
  console.log('\n' + '='.repeat(80));
  console.log('🎯 PATTERN AUDIT');
  console.log('='.repeat(80) + '\n');

  const patterns = await db.collection('patterns').find({}).toArray();
  console.log(`Total Patterns in DB: ${patterns.length}\n`);

  // Patterns missing enrichment
  const patternsNeedingEnrichment = patterns.filter((p: any) => {
    return !p.fullDescription || 
           !p.shortDescription || 
           !p.useCases || 
           p.useCases.length === 0 ||
           !p.bestPractices || 
           p.bestPractices.length === 0;
  });

  console.log(`⚠️  PATTERNS NEEDING ENRICHMENT: ${patternsNeedingEnrichment.length}`);
  patternsNeedingEnrichment.forEach((p: any, i: number) => {
    const missing: string[] = [];
    if (!p.fullDescription) missing.push('fullDescription');
    if (!p.shortDescription) missing.push('shortDescription');
    if (!p.useCases || p.useCases.length === 0) missing.push('useCases');
    if (!p.bestPractices || p.bestPractices.length === 0) missing.push('bestPractices');
    if (!p.commonMistakes || p.commonMistakes.length === 0) missing.push('commonMistakes');
    if (!p.howItWorks) missing.push('howItWorks');

    const promptCount = promptsByPattern.get(p.id || '')?.length || 0;
    console.log(`  ${i + 1}. [${p.id}] ${p.name || 'NO NAME'}`);
    console.log(`     Missing: ${missing.join(', ')}`);
    console.log(`     Description: "${p.description || 'NONE'}"`);
    console.log(`     Prompts using this pattern: ${promptCount}`);
    console.log('');
  });

  // Patterns with no prompts
  const patternsWithNoPrompts = patterns.filter((p: any) => {
    const promptCount = promptsByPattern.get(p.id || '')?.length || 0;
    return promptCount === 0;
  });

  console.log(`\n❌ PATTERNS WITH NO PROMPTS: ${patternsWithNoPrompts.length}`);
  patternsWithNoPrompts.forEach((p: any, i: number) => {
    console.log(`  ${i + 1}. [${p.id}] ${p.name || 'NO NAME'}`);
    console.log(`     Description: "${p.description || 'NONE'}"`);
    console.log(`     Category: ${p.category || 'MISSING'} | Level: ${p.level || 'MISSING'}`);
  });

  // ============================================
  // 3. COGNITIVE VERIFIER SPECIFIC CHECK
  // ============================================
  console.log('\n' + '='.repeat(80));
  console.log('🔍 COGNITIVE VERIFIER DEEP DIVE');
  console.log('='.repeat(80) + '\n');

  const cognitiveVerifier = patterns.find((p: any) => p.id === 'cognitive-verifier');
  if (cognitiveVerifier) {
    console.log('Pattern Details:');
    console.log(`  Name: ${cognitiveVerifier.name}`);
    console.log(`  Description: "${cognitiveVerifier.description || 'NONE'}"`);
    console.log(`  Full Description: ${cognitiveVerifier.fullDescription ? '✅ Present' : '❌ MISSING'}`);
    console.log(`  Short Description: ${cognitiveVerifier.shortDescription ? '✅ Present' : '❌ MISSING'}`);
    console.log(`  Use Cases: ${cognitiveVerifier.useCases?.length || 0} (${cognitiveVerifier.useCases?.length ? '✅' : '❌ MISSING'})`);
    console.log(`  Best Practices: ${cognitiveVerifier.bestPractices?.length || 0} (${cognitiveVerifier.bestPractices?.length ? '✅' : '❌ MISSING'})`);
    console.log(`  Common Mistakes: ${cognitiveVerifier.commonMistakes?.length || 0} (${cognitiveVerifier.commonMistakes?.length ? '✅' : '❌ MISSING'})`);
    console.log(`  How It Works: ${cognitiveVerifier.howItWorks ? '✅ Present' : '❌ MISSING'}`);

    const cvPrompts = promptsByPattern.get('cognitive-verifier') || [];
    console.log(`\n  Prompts using Cognitive Verifier: ${cvPrompts.length}`);
    if (cvPrompts.length > 0) {
      console.log('\n  Example prompts:');
      cvPrompts.slice(0, 5).forEach((p: any, i: number) => {
        console.log(`    ${i + 1}. ${p.title || 'NO TITLE'}`);
        console.log(`       Category: ${p.category || 'MISSING'}`);
        console.log(`       Active: ${p.active !== false ? '✅' : '❌'}`);
      });
    } else {
      console.log('\n  ⚠️  NO PROMPTS FOUND FOR THIS PATTERN');
    }
  } else {
    console.log('❌ Cognitive Verifier pattern not found in database');
  }

  // ============================================
  // 4. DATA DISPLAY GAP ANALYSIS
  // ============================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 DATA DISPLAY GAP ANALYSIS');
  console.log('='.repeat(80) + '\n');

  console.log('Patterns with prompts in DB but may not be displaying:');
  patterns.forEach((p: any) => {
    const patternPrompts = promptsByPattern.get(p.id || '') || [];
    const activePrompts = patternPrompts.filter((pr: any) => pr.active !== false);
    
    if (activePrompts.length > 0 && (!p.fullDescription || !p.shortDescription)) {
      console.log(`  ⚠️  [${p.id}] ${p.name}: ${activePrompts.length} prompts exist but pattern lacks enrichment`);
    }
  });

  // ============================================
  // 5. SUMMARY & RECOMMENDATIONS
  // ============================================
  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80) + '\n');

  console.log('1. INCOMPLETE PROMPTS:');
  console.log(`   - ${incompletePrompts.length} prompts need completion`);
  console.log('   - Fix missing titles, descriptions, or short content');
  console.log('   - Mark truly incomplete ones as inactive\n');

  console.log('2. PATTERNS NEEDING ENRICHMENT:');
  console.log(`   - ${patternsNeedingEnrichment.length} patterns need fullDescription, useCases, bestPractices`);
  console.log('   - Focus on Cognitive Verifier, Hypothesis Testing, RAG, Reverse Engineering\n');

  console.log('3. PATTERNS WITH NO PROMPTS:');
  console.log(`   - ${patternsWithNoPrompts.length} patterns have no example prompts`);
  console.log('   - These patterns show "No prompts found" on their detail pages');
  console.log('   - Either create prompts or hide these patterns\n');

  console.log('4. COGNITIVE VERIFIER SPECIFIC:');
  if (cognitiveVerifier) {
    const cvPrompts = promptsByPattern.get('cognitive-verifier') || [];
    if (cvPrompts.length === 0) {
      console.log('   - CRITICAL: No prompts exist for this pattern');
      console.log('   - Create at least 3-5 example prompts demonstrating Cognitive Verifier');
    }
    if (!cognitiveVerifier.fullDescription || !cognitiveVerifier.useCases || cognitiveVerifier.useCases.length === 0) {
      console.log('   - CRITICAL: Pattern lacks enrichment content');
      console.log('   - Add fullDescription, useCases, bestPractices, commonMistakes');
    }
    console.log('   - This pattern cannot have a high value score without content\n');
  }

  console.log('='.repeat(80) + '\n');

  await client.close();
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
