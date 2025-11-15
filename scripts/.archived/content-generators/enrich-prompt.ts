#!/usr/bin/env tsx
/**
 * AI-Powered Prompt Enrichment Based on Audit Feedback
 * Uses AI to generate case studies, examples, and best practices based on audit recommendations
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

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

async function enrichPromptWithAI(promptId: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI-Powered Prompt Enrichment Based on Audit Feedback ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();
  
  // Get the prompt
  const prompt = await db.collection('prompts').findOne({ id: promptId });
  if (!prompt) {
    console.error(`❌ Prompt not found: ${promptId}`);
    process.exit(1);
  }

  // Get latest audit results
  const auditResult = await db.collection('prompt_audit_results').findOne(
    { promptId: prompt.id },
    { sort: { auditVersion: -1 } }
  );

  if (!auditResult) {
    console.error(`❌ No audit results found for prompt: ${promptId}`);
    console.error('   Please run audit first: pnpm tsx scripts/content/test-audit-adr.ts');
    process.exit(1);
  }

  // Only enrich prompts at revision 1 (not yet improved)
  // Check prompt revision, not audit version
  const promptRevision = prompt.currentRevision || 1;
  if (promptRevision > 1) {
    console.log(`ℹ️  Skipping enrichment: Prompt already enriched (revision ${promptRevision})`);
    console.log(`   Only enriching prompts at revision 1`);
    process.exit(0);
  }

  console.log(`📝 Enriching: "${prompt.title}"`);
  console.log(`   Current Revision: ${promptRevision}`);
  console.log(`   Latest Audit Score: ${auditResult.overallScore}/10`);
  console.log(`   Missing Elements: ${auditResult.missingElements?.length || 0}`);
  console.log(`   Recommendations: ${auditResult.recommendations?.length || 0}\n`);

  const provider = new OpenAIAdapter('gpt-4o');

  // Generate case studies
  let caseStudies = prompt.caseStudies || [];
  if (!caseStudies || caseStudies.length === 0) {
    console.log('📚 Generating case studies...');
    const caseStudyPrompt = `Generate 3 detailed case studies for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Real-world scenarios where this prompt would be used
- Show challenge, process, outcome, and key learning
- Include measurable outcomes
- Diverse use cases

Format as JSON array:
[
  {
    "title": "...",
    "scenario": "...",
    "challenge": "...",
    "process": "...",
    "outcome": "...",
    "keyLearning": "..."
  }
]`;

    try {
      const response = await provider.execute({
        prompt: caseStudyPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      // Extract JSON from response (with robust parsing)
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          caseStudies = parseJSONWithFallback(response.content, true);
          if (caseStudies && Array.isArray(caseStudies) && caseStudies.length > 0) {
            console.log(`   ✅ Generated ${caseStudies.length} case studies`);
          } else {
            // Try fallback extraction
            caseStudies = extractArrayItems(response.content);
            if (caseStudies.length > 0) {
              console.log(`   ✅ Extracted ${caseStudies.length} case studies (partial)`);
            }
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse case studies:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate case studies:', error);
    }
  }

  // Generate examples
  let examples = prompt.examples || [];
  if (!examples || examples.length === 0) {
    console.log('💡 Generating examples...');
    const examplePrompt = `Generate 2-3 practical examples for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Show concrete input/output pairs
- Practical, real-world scenarios
- Clear title for each example

Format as JSON array:
[
  {
    "title": "...",
    "input": "...",
    "expectedOutput": "..."
  }
]`;

    try {
      const response = await provider.execute({
        prompt: examplePrompt,
        temperature: 0.7,
        maxTokens: 1500,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          examples = parseJSONWithFallback(response.content, true);
          if (examples && Array.isArray(examples) && examples.length > 0) {
            console.log(`   ✅ Generated ${examples.length} examples`);
          } else {
            examples = extractArrayItems(response.content);
            if (examples.length > 0) {
              console.log(`   ✅ Extracted ${examples.length} examples (partial)`);
            }
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse examples:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate examples:', error);
    }
  }

  // Generate best practices
  let bestPractices = prompt.bestPractices || [];
  if (!bestPractices || bestPractices.length === 0) {
    console.log('✅ Generating best practices...');
    const bestPracticesPrompt = `Generate 5-7 best practices for using this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...

Requirements:
- Actionable, specific advice
- Based on prompt content and purpose
- Practical tips for effective use

Format as JSON array:
["practice 1", "practice 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: bestPracticesPrompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          bestPractices = parseJSONWithFallback(response.content, true);
          if (bestPractices && Array.isArray(bestPractices) && bestPractices.length > 0) {
            console.log(`   ✅ Generated ${bestPractices.length} best practices`);
          } else {
            bestPractices = extractArrayItems(response.content);
            if (bestPractices.length > 0) {
              console.log(`   ✅ Extracted ${bestPractices.length} best practices (partial)`);
            }
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse best practices:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best practices:', error);
    }
  }

  // Generate use cases
  let useCases = prompt.useCases || [];
  if (!useCases || useCases.length === 0) {
    console.log('📝 Generating use cases...');
    const useCasesPrompt = `Generate 5-10 specific use cases for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}

Requirements:
- Specific scenarios where this prompt would be valuable
- Clear, actionable use cases
- Diverse applications

Format as JSON array:
["use case 1", "use case 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: useCasesPrompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          useCases = parseJSONWithFallback(response.content, true);
          if (useCases && Array.isArray(useCases) && useCases.length > 0) {
            console.log(`   ✅ Generated ${useCases.length} use cases`);
          } else {
            useCases = extractArrayItems(response.content);
            if (useCases.length > 0) {
              console.log(`   ✅ Extracted ${useCases.length} use cases (partial)`);
            }
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse use cases:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate use cases:', error);
    }
  }

  // Generate best time to use
  let bestTimeToUse = prompt.bestTimeToUse || [];
  if (!bestTimeToUse || (Array.isArray(bestTimeToUse) && bestTimeToUse.length === 0)) {
    console.log('⏰ Generating "best time to use" scenarios...');
    const bestTimePrompt = `Generate 5-7 scenarios for when to use this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}

Requirements:
- Specific situations/timing
- Clear guidance on when this prompt is most valuable

Format as JSON array:
["scenario 1", "scenario 2", ...]`;

    try {
      const response = await provider.execute({
        prompt: bestTimePrompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          bestTimeToUse = parseJSONWithFallback(response.content, true);
          if (bestTimeToUse && Array.isArray(bestTimeToUse) && bestTimeToUse.length > 0) {
            console.log(`   ✅ Generated ${bestTimeToUse.length} "best time to use" scenarios`);
          } else {
            bestTimeToUse = extractArrayItems(response.content);
            if (bestTimeToUse.length > 0) {
              console.log(`   ✅ Extracted ${bestTimeToUse.length} scenarios (partial)`);
            }
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse best time to use:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate best time to use:', error);
    }
  }

  // Generate "What is" and "Why Use" explanations
  let whatIs = prompt.whatIs;
  let whyUse = prompt.whyUse || [];
  
  // Check if whatIs is just the title or too short - regenerate if so
  const isWhatIsJustTitle = whatIs && (
    whatIs.trim() === prompt.title.trim() ||
    whatIs.trim().toLowerCase() === prompt.title.trim().toLowerCase() ||
    whatIs.length < 50 // Too short to be a proper explanation
  );
  
  if (!whatIs || isWhatIsJustTitle || !whyUse || whyUse.length === 0) {
    console.log('📖 Generating "What is" and "Why Use" explanations...');
    const explanationPrompt = `Generate educational content for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 500)}...
CATEGORY: ${prompt.category}

Requirements:
1. "What is" section: Write a comprehensive explanation (3-5 sentences) that explains what ${prompt.title} is. Do NOT just repeat the title. Explain the concept, its purpose, and how it works. Write for SEO and user education. Be specific and informative.

2. "Why Use" section: Generate 6-8 specific reasons why someone would use ${prompt.title}. Focus on practical benefits and real-world value.

IMPORTANT: The "What is" response must be a full explanation, not just the title repeated. Minimum 3 sentences explaining the concept.

Format as JSON:
{
  "whatIs": "Full explanation of what this concept is (3-5 sentences, not just the title)...",
  "whyUse": [
    "Reason 1",
    "Reason 2",
    ...
  ]
}`;

    try {
      const response = await provider.execute({
        prompt: explanationPrompt,
        temperature: 0.7,
        maxTokens: 1500,
      });
      
      // Extract JSON from response (with robust parsing)
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const explanationData = parseJSONWithFallback(response.content, false);
          if (explanationData) {
            if (explanationData.whatIs) {
              whatIs = explanationData.whatIs;
            }
            if (explanationData.whyUse && Array.isArray(explanationData.whyUse)) {
              whyUse = explanationData.whyUse;
            }
            console.log(`   ✅ Generated "What is" and ${whyUse.length} "Why Use" reasons`);
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse explanations:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate explanations:', error);
    }
  }

  // Generate recommended models
  let recommendedModel = prompt.recommendedModel || [];
  if (!recommendedModel || recommendedModel.length === 0) {
    console.log('🤖 Generating recommended models...');
    const modelsPrompt = `Recommend 2-3 AI models for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description}
CONTENT: ${prompt.content.substring(0, 300)}...

Requirements:
- Consider prompt complexity and requirements
- Include models from different providers (OpenAI, Anthropic, etc.)
- Provide reason for each recommendation

Format as JSON array:
[
  {
    "model": "gpt-4o",
    "provider": "openai",
    "reason": "...",
    "useCase": "..."
  }
]`;

    try {
      const response = await provider.execute({
        prompt: modelsPrompt,
        temperature: 0.5,
        maxTokens: 1000,
      });
      
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          recommendedModel = parseJSONWithFallback(response.content, true);
          if (recommendedModel && Array.isArray(recommendedModel) && recommendedModel.length > 0) {
            console.log(`   ✅ Generated ${recommendedModel.length} recommended models`);
          } else {
            recommendedModel = [];
          }
        } catch (error) {
          console.warn('   ⚠️  Failed to parse recommended models:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate recommended models:', error);
    }
  }

  // Generate interactive parameters/leading questions
  let parameters = prompt.parameters || [];
  if (!parameters || parameters.length === 0) {
    console.log('🔧 Generating interactive parameters...');
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
  },
  {
    "id": "focus_areas",
    "label": "Top Concerns",
    "type": "multiselect",
    "required": false,
    "options": ["Security", "Performance", "Bug Reduction", "Code Quality", "Best Practices"],
    "description": "Select the main areas you want the review to focus on",
    "example": "Security, Bug Reduction"
  }
]

Focus on:
- What information is needed to make this prompt accurate?
- What customization options would help users?
- What parameters would make this prompt more useful?
- Be specific and actionable`;

    try {
      const response = await provider.execute({
        prompt: parametersPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
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
          console.warn('   ⚠️  Failed to parse parameters:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate parameters:', error);
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
    updatedAt: new Date(),
    // Add meta description if missing
    metaDescription: prompt.metaDescription || prompt.description.substring(0, 160),
  };

  // Update in database with revision tracking
  // Increment revision number since we're modifying content
  const newRevision = promptRevision + 1;
  
  // Create revision record before updating (for history tracking)
  const { createRevision } = await import('@/lib/db/schemas/prompt-revision');
  const revision = createRevision(
    prompt.id || prompt._id?.toString(),
    prompt,
    { ...prompt, ...enrichedPrompt },
    'system',
    'AI enrichment based on audit feedback'
  );

  // Save revision to history
  await db.collection('prompt_revisions').insertOne({
    ...revision,
    revisionNumber: newRevision,
    createdAt: new Date(),
  });

  // Update prompt with enriched content AND increment revision
  await db.collection('prompts').updateOne(
    { id: promptId },
    { 
      $set: {
        ...enrichedPrompt,
        currentRevision: newRevision,
        lastRevisedBy: 'system',
        lastRevisedAt: new Date(),
        updatedAt: new Date(),
      }
    }
  );

  console.log('\n✅ Prompt enriched with:');
  if (caseStudies.length > 0) console.log(`   📚 ${caseStudies.length} case studies`);
  if (examples.length > 0) console.log(`   💡 ${examples.length} examples`);
  if (bestPractices.length > 0) console.log(`   ✅ ${bestPractices.length} best practices`);
  if (useCases.length > 0) console.log(`   📝 ${useCases.length} use cases`);
  if (bestTimeToUse.length > 0) console.log(`   ⏰ ${bestTimeToUse.length} "best time to use" scenarios`);
  if (recommendedModel.length > 0) console.log(`   🤖 ${recommendedModel.length} recommended models`);
  if (whatIs) console.log(`   📖 "What is" explanation`);
  if (whyUse.length > 0) console.log(`   ❓ ${whyUse.length} "Why Use" reasons`);
  console.log(`\n📄 Updated prompt saved to database!`);
  console.log(`   📌 Revision: ${promptRevision} → ${newRevision} (content updated)`);

  await db.client.close();
  return enrichedPrompt;
}

// Export for use in batch scripts
export { enrichPromptWithAI };

// Get prompt ID from command line (only if run directly)
if (require.main === module) {
  const promptId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1] || 
                   process.argv[2];

  if (!promptId) {
    console.error('Usage: tsx enrich-prompt.ts --id=<prompt-id>');
    process.exit(1);
  }

  enrichPromptWithAI(promptId)
    .then(() => {
      console.log('✨ Enrichment complete! Run audit again to see score improvement.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
