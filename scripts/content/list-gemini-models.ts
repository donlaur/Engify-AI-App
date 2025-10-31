/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * List Available Gemini Models
 * 
 * Queries Google AI API to see what models are actually available.
 * Run this monthly to keep our model list current.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function listGeminiModels() {
  console.log('\n🔍 QUERYING GOOGLE AI FOR AVAILABLE MODELS\n');
  console.log('='.repeat(70));
  
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GOOGLE_API_KEY not found in .env.local');
    process.exit(1);
  }
  
  console.log('✅ API Key found');
  console.log('🔑 Key:', apiKey.substring(0, 8) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try common model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
    ];
    
    console.log('\n📋 TESTING MODEL NAMES:\n');
    
    const workingModels: string[] = [];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test" if you can read this');
        const text = result.response.text();
        
        if (text) {
          console.log(`✅ ${modelName.padEnd(30)} WORKS`);
          workingModels.push(modelName);
        }
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.log(`❌ ${modelName.padEnd(30)} NOT FOUND`);
        } else if (errorMsg.includes('quota') || errorMsg.includes('rate')) {
          console.log(`⚠️  ${modelName.padEnd(30)} RATE LIMITED (probably works)`);
          workingModels.push(modelName);
        } else {
          console.log(`⚠️  ${modelName.padEnd(30)} ERROR: ${errorMsg.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ WORKING MODELS (${workingModels.length}):\n`);
    workingModels.forEach(m => console.log(`   - ${m}`));
    
    console.log('\n💡 UPDATE src/lib/config/ai-models.ts with these model names\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listGeminiModels();

