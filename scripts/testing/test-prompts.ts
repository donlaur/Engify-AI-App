/**
 * Prompt Testing Script
 * Tests all prompts with OpenAI and Google Gemini to validate quality
 */

import { playbookCategories } from '../src/data/playbooks';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface TestResult {
  promptId: string;
  promptTitle: string;
  provider: 'openai' | 'gemini';
  success: boolean;
  responseLength: number;
  responseTime: number;
  error?: string;
  feedback?: string;
}

const results: TestResult[] = [];

async function testWithOpenAI(
  promptId: string,
  promptTitle: string,
  promptText: string
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: promptText.replace(/\[.*?\]/g, 'example'), // Replace placeholders
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    const responseTime = Date.now() - startTime;

    return {
      promptId,
      promptTitle,
      provider: 'openai',
      success: true,
      responseLength: response.length,
      responseTime,
      feedback:
        response.length < 50
          ? 'Response too short'
          : response.length > 2000
            ? 'Response too long'
            : 'Good',
    };
  } catch (error: unknown) {
    return {
      promptId,
      promptTitle,
      provider: 'openai',
      success: false,
      responseLength: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testWithGemini(
  promptId: string,
  promptTitle: string,
  promptText: string
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      promptText.replace(/\[.*?\]/g, 'example')
    );
    const response = result.response.text();
    const responseTime = Date.now() - startTime;

    return {
      promptId,
      promptTitle,
      provider: 'gemini',
      success: true,
      responseLength: response.length,
      responseTime,
      feedback:
        response.length < 50
          ? 'Response too short'
          : response.length > 2000
            ? 'Response too long'
            : 'Good',
    };
  } catch (error: unknown) {
    return {
      promptId,
      promptTitle,
      provider: 'gemini',
      success: false,
      responseLength: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testAllPrompts() {
  console.log('🧪 Starting Prompt Quality Test\n');
  console.log('Testing with OpenAI GPT-3.5 and Google Gemini Pro\n');

  let totalPrompts = 0;
  let testedPrompts = 0;

  // Count total prompts
  for (const category of playbookCategories) {
    totalPrompts += category.recipes.length;
  }

  console.log(`📊 Total prompts to test: ${totalPrompts}\n`);

  // Test each prompt with both providers (sample 10% to save API costs)
  for (const category of playbookCategories) {
    console.log(`\n📁 Category: ${category.title}`);

    for (const recipe of category.recipes) {
      // Only test every 10th prompt to save costs (or set to 1 for all)
      if (Math.random() > 0.1) continue;

      testedPrompts++;
      console.log(`  Testing: ${recipe.title}...`);

      // Test with OpenAI
      const openaiResult = await testWithOpenAI(
        recipe.id,
        recipe.title,
        recipe.prompt
      );
      results.push(openaiResult);

      if (openaiResult.success) {
        console.log(
          `    ✅ OpenAI: ${openaiResult.responseTime}ms, ${openaiResult.responseLength} chars - ${openaiResult.feedback}`
        );
      } else {
        console.log(`    ❌ OpenAI: ${openaiResult.error}`);
      }

      // Wait 1 second to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test with Gemini
      const geminiResult = await testWithGemini(
        recipe.id,
        recipe.title,
        recipe.prompt
      );
      results.push(geminiResult);

      if (geminiResult.success) {
        console.log(
          `    ✅ Gemini: ${geminiResult.responseTime}ms, ${geminiResult.responseLength} chars - ${geminiResult.feedback}`
        );
      } else {
        console.log(`    ❌ Gemini: ${geminiResult.error}`);
      }

      // Wait 1 second between prompts
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Print summary
  console.log('\n\n📊 Test Summary\n');
  console.log(`Total prompts in library: ${totalPrompts}`);
  console.log(`Prompts tested (10% sample): ${testedPrompts}`);

  const openaiResults = results.filter((r) => r.provider === 'openai');
  const geminiResults = results.filter((r) => r.provider === 'gemini');

  const openaiSuccess = openaiResults.filter((r) => r.success).length;
  const geminiSuccess = geminiResults.filter((r) => r.success).length;

  console.log(
    `\nOpenAI Success Rate: ${openaiSuccess}/${openaiResults.length} (${Math.round((openaiSuccess / openaiResults.length) * 100)}%)`
  );
  console.log(
    `Gemini Success Rate: ${geminiSuccess}/${geminiResults.length} (${Math.round((geminiSuccess / geminiResults.length) * 100)}%)`
  );

  const avgOpenAITime =
    openaiResults.reduce((sum, r) => sum + r.responseTime, 0) /
    openaiResults.length;
  const avgGeminiTime =
    geminiResults.reduce((sum, r) => sum + r.responseTime, 0) /
    geminiResults.length;

  console.log(`\nAvg OpenAI Response Time: ${Math.round(avgOpenAITime)}ms`);
  console.log(`Avg Gemini Response Time: ${Math.round(avgGeminiTime)}ms`);

  // Issues found
  const issues = results.filter((r) => !r.success || r.feedback !== 'Good');
  if (issues.length > 0) {
    console.log(`\n⚠️  Issues Found: ${issues.length}`);
    issues.forEach((issue) => {
      console.log(
        `  - ${issue.promptTitle} (${issue.provider}): ${issue.error || issue.feedback}`
      );
    });
  } else {
    console.log('\n✅ No issues found!');
  }

  console.log('\n✨ Test complete!\n');
}

// Run tests
testAllPrompts().catch(console.error);
