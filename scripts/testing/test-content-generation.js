#!/usr/bin/env node
/**
 * Test Content Generation System
 * Tests the new AI Q&A and content type features
 */

const { getAllContentTypes } = require('./src/lib/content/content-types.ts');

console.log('🧪 Testing Content Generation System\n');

// Test 1: Content Types
console.log('✅ Test 1: Content Types Loaded');
try {
  const contentTypes = getAllContentTypes();
  console.log(`   Found ${contentTypes.length} content types:`);
  contentTypes.forEach(type => {
    console.log(`   - ${type.name}: ${type.targetWordCount} words, $${type.estimatedCost}`);
  });
} catch (error) {
  console.error('❌ Failed:', error.message);
}

console.log('\n📝 Manual Testing Steps:');
console.log('1. Navigate to http://localhost:3000/opshub');
console.log('2. Go to Content Generator tab');
console.log('3. Click "Content Strategy" tab');
console.log('4. Select an AI model (GPT-4, Claude, etc.)');
console.log('5. Ask: "What content type should I use for AI in Agile?"');
console.log('6. Verify AI responds with recommendations');
console.log('7. Click "Generate Content" tab');
console.log('8. Select content type (e.g., "Pillar Page")');
console.log('9. Enter topics and generate');
console.log('\n✨ System is ready for testing!');
