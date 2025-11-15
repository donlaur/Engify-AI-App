#!/usr/bin/env tsx
/**
 * Batch Enrich All Version 1 & 2 Prompts
 * 
 * Finds all prompts with currentRevision <= 2 and enriches them
 * Processes prompts at revision 1 or 2 to upgrade them to version 3
 * Only processes prompts that haven't been enriched yet
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

/**
 * Robust JSON parsing with repair and fallback extraction
 * Handles truncated responses, incomplete strings, and malformed JSON
 */
function parseJSONWithFallback(responseContent: string, arrayMode: boolean = false): any {
  let jsonText = responseContent;
  
  // Try to extract from markdown code blocks first (use greedy matching to get full block)
  const codeBlockMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  } else if (arrayMode) {
    // For arrays, try to extract array from code blocks
    const arrayBlockMatch = responseContent.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
    if (arrayBlockMatch) {
      jsonText = arrayBlockMatch[1];
    } else {
      // Try to extract JSON object/array directly (use greedy to get full object)
      const jsonMatch = responseContent.match(arrayMode ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }
  } else {
    // Try to extract JSON object directly (use greedy to get full object)
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
  }
  
  // Repair common JSON issues
  // 1. Remove trailing commas before closing brackets/braces
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
  jsonText = jsonText.replace(/,(\s*$)/gm, '');
  
  // 2. Fix incomplete string literals in arrays (common issue with truncated responses)
  jsonText = jsonText.replace(/"([^"]*?)\.\.\.[^"]*$/gm, '"$1"'); // Remove trailing "..."
  // Close unclosed strings at end of line
  jsonText = jsonText.replace(/"([^"]+)(?:\n|$)/gm, (match, content) => {
    if (!match.endsWith('"')) {
      return `"${content}"`;
    }
    return match;
  });
  
  // 3. Try to close incomplete arrays/objects
  const openBraces = (jsonText.match(/\{/g) || []).length;
  const closeBraces = (jsonText.match(/\}/g) || []).length;
  const openBrackets = (jsonText.match(/\[/g) || []).length;
  const closeBrackets = (jsonText.match(/\]/g) || []).length;
  
  // Close incomplete structures
  if (openBrackets > closeBrackets) {
    jsonText += ']'.repeat(openBrackets - closeBrackets);
  }
  if (openBraces > closeBraces) {
    jsonText += '}'.repeat(openBraces - closeBraces);
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    // Fallback: extract partial data from incomplete JSON
    if (arrayMode) {
      return extractArrayItems(responseContent);
    }
    return null;
  }
}

/**
 * Extract array items from text (handles incomplete strings)
 */
function extractArrayItems(text: string): any[] {
  if (!text) return [];
  
  // First, try to find complete quoted strings
  const completeStrings: string[] = [];
  const completeMatches = text.match(/"([^"]+)"/g);
  if (completeMatches) {
    completeStrings.push(...completeMatches.map(m => m.replace(/^"|"$/g, '')));
  }
  
  // Then, try to find incomplete strings (lines that start with quote but don't end with quote)
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('"') && !trimmed.endsWith('"')) {
      const content = trimmed.replace(/^"|,$/g, '').trim();
      if (content.length > 0 && !completeStrings.includes(content)) {
        completeStrings.push(content);
      }
    }
  }
  
  return completeStrings.filter(s => s.length > 0);
}

// Import the enrichment logic directly (not the script)
async function enrichPromptWithAI(promptId: string) {
  const db = await getMongoDb();
  
  // Get the prompt
  const prompt = await db.collection('prompts').findOne({ id: promptId });
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  // Get latest audit results
  const auditResult = await db.collection('prompt_audit_results').findOne(
    { promptId: prompt.id },
    { sort: { auditVersion: -1 } }
  );

  if (!auditResult) {
    throw new Error(`No audit results found for prompt: ${promptId}`);
  }

  // Only enrich prompts at revision 1 (not yet improved)
  // Check prompt revision, not audit version
  const promptRevision = prompt.currentRevision || 1;
  if (promptRevision > 2) {
    return { skipped: true, reason: `Prompt revision ${promptRevision}, not revision 1 or 2` };
  }

  const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
  const provider = new OpenAIAdapter('gpt-4o');

  // Generate enrichment fields (same logic as enrich-prompt.ts)
  let caseStudies = prompt.caseStudies || [];
  let examples = prompt.examples || [];
  let bestPractices = prompt.bestPractices || [];
  let useCases = prompt.useCases || [];
  let bestTimeToUse = prompt.bestTimeToUse || [];
  let recommendedModel = prompt.recommendedModel || [];
  let whatIs = prompt.whatIs;
  let whyUse = prompt.whyUse || [];

  // Generate case studies if missing
  if (!caseStudies || caseStudies.length === 0) {
    try {
      const caseStudyPrompt = `Generate 3 detailed case studies for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
Format as JSON array with: title, scenario, challenge, process, outcome, keyLearning`;
      const response = await provider.execute({ prompt: caseStudyPrompt, temperature: 0.7, maxTokens: 2000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          caseStudies = parseJSONWithFallback(response.content, true);
          if (!caseStudies || !Array.isArray(caseStudies) || caseStudies.length === 0) {
            caseStudies = extractArrayItems(response.content);
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse case studies: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate case studies: ${error}`);
    }
  }

  // Generate examples if missing
  if (!examples || examples.length === 0) {
    try {
      const examplePrompt = `Generate 2-3 practical examples for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array with: title, input, expectedOutput`;
      const response = await provider.execute({ prompt: examplePrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          examples = parseJSONWithFallback(response.content, true);
          if (!examples || !Array.isArray(examples) || examples.length === 0) {
            examples = extractArrayItems(response.content);
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse examples: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate examples: ${error}`);
    }
  }

  // Generate best practices if missing
  if (!bestPractices || bestPractices.length === 0) {
    try {
      const bestPracticesPrompt = `Generate 5-7 best practices for using this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: bestPracticesPrompt, temperature: 0.7, maxTokens: 1000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          bestPractices = parseJSONWithFallback(response.content, true);
          if (!bestPractices || !Array.isArray(bestPractices) || bestPractices.length === 0) {
            bestPractices = extractArrayItems(response.content);
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse best practices: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate best practices: ${error}`);
    }
  }

  // Generate use cases if missing
  if (!useCases || useCases.length === 0) {
    try {
      const useCasesPrompt = `Generate 5-10 specific use cases for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: useCasesPrompt, temperature: 0.7, maxTokens: 800 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          useCases = parseJSONWithFallback(response.content, true);
          if (!useCases || !Array.isArray(useCases) || useCases.length === 0) {
            useCases = extractArrayItems(response.content);
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse use cases: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate use cases: ${error}`);
    }
  }

  // Generate best time to use if missing
  if (!bestTimeToUse || (Array.isArray(bestTimeToUse) && bestTimeToUse.length === 0)) {
    try {
      const bestTimePrompt = `Generate 5-7 scenarios for when to use this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array of strings`;
      const response = await provider.execute({ prompt: bestTimePrompt, temperature: 0.7, maxTokens: 800 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          bestTimeToUse = parseJSONWithFallback(response.content, true);
          if (!bestTimeToUse || !Array.isArray(bestTimeToUse) || bestTimeToUse.length === 0) {
            bestTimeToUse = extractArrayItems(response.content);
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse best time to use: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate best time to use: ${error}`);
    }
  }

  // Generate "What is" and "Why Use" explanations if missing
  if (!whatIs || !whyUse || whyUse.length === 0) {
    // Check if whatIs is just the title or too short - regenerate if so
    const isWhatIsJustTitle = whatIs && (
      whatIs.trim() === prompt.title.trim() ||
      whatIs.trim().toLowerCase() === prompt.title.trim().toLowerCase() ||
      whatIs.length < 50 // Too short to be a proper explanation
    );
    
    if (!whatIs || isWhatIsJustTitle || !whyUse || whyUse.length === 0) {
    try {
      const explanationPrompt = `Generate educational content for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
CATEGORY: ${prompt.category}
Requirements:
1. "What is" section: Write a comprehensive explanation (3-5 sentences) that explains what ${prompt.title} is. Do NOT just repeat the title. Explain the concept, its purpose, and how it works. Write for SEO and user education. Be specific and informative.
2. "Why Use" section: Generate 6-8 specific reasons why someone would use ${prompt.title}. Focus on practical benefits and real-world value.
IMPORTANT: The "What is" response must be a full explanation, not just the title repeated. Minimum 3 sentences explaining the concept.
Format as JSON: { "whatIs": "Full explanation (3-5 sentences, not just the title)...", "whyUse": ["reason1", "reason2", ...] }`;
      const response = await provider.execute({ prompt: explanationPrompt, temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const explanationData = parseJSONWithFallback(response.content, false);
          if (explanationData) {
            if (explanationData.whatIs) whatIs = explanationData.whatIs;
            if (explanationData.whyUse && Array.isArray(explanationData.whyUse)) {
              whyUse = explanationData.whyUse;
            }
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse explanations: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate explanations: ${error}`);
    }
    }
  }

  // Generate recommended models if missing
  if (!recommendedModel || recommendedModel.length === 0) {
    try {
      const modelsPrompt = `Recommend 2-3 AI models for this prompt:
TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
Format as JSON array with: model, provider, reason, useCase`;
      const response = await provider.execute({ prompt: modelsPrompt, temperature: 0.5, maxTokens: 1000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          recommendedModel = parseJSONWithFallback(response.content, true);
          if (!recommendedModel || !Array.isArray(recommendedModel) || recommendedModel.length === 0) {
            recommendedModel = [];
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse recommended models: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate recommended models: ${error}`);
    }
  }

  // Generate interactive parameters/leading questions if missing
  let parameters = prompt.parameters || [];
  if (!parameters || parameters.length === 0) {
    try {
      const parametersPrompt = `Generate interactive parameters/leading questions for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CATEGORY: ${prompt.category}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Identify what inputs/users need to provide before using this prompt
- For code review prompts: programming language, security focus, bug reduction focus
- For other prompts: identify key variables that need customization
- Create clear, helpful questions that guide users
- Use appropriate input types (text, select, textarea, multiselect)
- Include examples to guide users

Format as JSON array:
[
  {
    "id": "programming_language",
    "label": "Programming Language",
    "type": "select",
    "required": true,
    "options": ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "Other"],
    "description": "Select the programming language for the code review",
    "example": "JavaScript"
  }
]

Focus on:
- What information is needed to make this prompt accurate?
- What customization options would help users?
- What parameters would make this prompt more useful?
- Be specific and actionable`;

      const response = await provider.execute({ prompt: parametersPrompt, temperature: 0.7, maxTokens: 2000 });
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parameters = parseJSONWithFallback(response.content, true);
          if (parameters && Array.isArray(parameters) && parameters.length > 0) {
            console.log(`   ✅ Generated ${parameters.length} parameters`);
          } else {
            parameters = [];
          }
        } catch (error) {
          console.warn(`   ⚠️  Failed to parse parameters: ${error}`);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to generate parameters: ${error}`);
    }
  }

  // Update prompt with enriched data
  const enrichedPrompt = {
    ...prompt,
    caseStudies: caseStudies.length > 0 ? caseStudies : prompt.caseStudies,
    examples: examples.length > 0 ? examples : prompt.examples,
    bestPractices: bestPractices.length > 0 ? bestPractices : prompt.bestPractices,
    useCases: useCases.length > 0 ? useCases : prompt.useCases,
    bestTimeToUse: bestTimeToUse.length > 0 ? bestTimeToUse : prompt.bestTimeToUse,
    recommendedModel: recommendedModel.length > 0 ? recommendedModel : prompt.recommendedModel,
    whatIs: whatIs || prompt.whatIs,
    whyUse: whyUse.length > 0 ? whyUse : prompt.whyUse,
    parameters: parameters.length > 0 ? parameters : prompt.parameters,
    currentRevision: promptRevision + 1, // Increment revision (1→2 or 2→3)
    updatedAt: new Date(),
  };

  await db.collection('prompts').updateOne(
    { id: promptId },
    { $set: enrichedPrompt }
  );

  return { success: true, enrichedPrompt };
}

async function enrichAllVersion1Prompts() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Enrich Version 1 & 2 Prompts (→ Version 3)     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Find prompts with revision 1 (not yet improved)
  // We want to enrich prompts that haven't been improved yet
  const prompts = await db.collection('prompts').find({
    currentRevision: { $lte: 2 } // Only revision 1 or 2 (upgrade to version 3)
  }).toArray();
  
  if (prompts.length === 0) {
    console.log('✅ No prompts found at revision 1 or 2');
    console.log('   All prompts have been enriched\n');
    await db.client.close();
    process.exit(0);
  }

  console.log(`📋 Found ${prompts.length} prompts at revision 1 or 2 (will upgrade to version 3)\n`);
  console.log('🚀 Starting batch enrichment...\n');

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    total: prompts.length,
  };

  // Process each prompt
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    try {
      console.log(`[${i + 1}/${prompts.length}] 📝 Enriching: "${prompt.title}"`);
      console.log(`   ID: ${prompt.id}\n`);

      const result = await enrichPromptWithAI(prompt.id);
      
      if (result.skipped) {
        results.skipped++;
        console.log(`   ℹ️  ${result.reason}\n`);
      } else if (result.success) {
        results.success++;
        const newRevision = (prompt.currentRevision || 1) + 1;
        console.log(`   ✅ Enrichment complete (Revision: ${prompt.currentRevision || 1} → ${newRevision})\n`);
      }
    } catch (error) {
      results.failed++;
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Enrichment Complete                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${results.success}/${results.total}`);
  console.log(`   ℹ️  Skipped: ${results.skipped}/${results.total}`);
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`);
  console.log(`\n✨ All version 1 prompts processed!\n`);

  await db.client.close();
  process.exit(0);
}

enrichAllVersion1Prompts().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
