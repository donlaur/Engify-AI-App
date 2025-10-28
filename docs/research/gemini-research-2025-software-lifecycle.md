#!/usr/bin/env tsx

/\*\*

- Run Gemini Deep Research
- Script to conduct research and update documentation
  \*/

import _ as fs from 'fs';
import _ as path from 'path';
import { researchPromptPatterns, GeminiResearchResult } from '../src/lib/ai/gemini-integration-v2';

async function main() {
console.log('🔬 Starting Gemini Deep Research...\n');
console.log('Topic: Prompt Engineering Patterns');
console.log('Model: Gemini 1.5 Pro (2M token context)\n');

try {
// Conduct research
console.log('⏳ Conducting research (this may take 1-2 minutes)...\n');
const result = await researchPromptPatterns();

    // Display results
    console.log('✅ Research Complete!\n');
    console.log('📊 Metadata:');
    console.log(
      `  - Tokens Used: ${result.metadata.tokensUsed.toLocaleString()}`
    );
    console.log(
      `  - Research Time: ${(result.metadata.researchTime / 1000).toFixed(2)}s`
    );
    console.log(`  - Confidence: ${result.metadata.confidence}`);
    console.log(`  - Sources Found: ${result.sources.length}`);
    console.log(`  - Key Findings: ${result.keyFindings.length}`);
    console.log(`  - Recommendations: ${result.recommendations.length}\n`);

    // Display key findings
    if (result.keyFindings.length > 0) {
      console.log('🔑 Key Findings:');
      result.keyFindings.slice(0, 5).forEach((finding, i) => {
        console.log(`  ${i + 1}. ${finding}`);
      });
      console.log('');
    }

    // Display recommendations
    if (result.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      result.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log('');
    }

    // Save to file
    const outputPath = path.join(
      process.cwd(),
      'docs/GEMINI_RESEARCH_RESULTS.md'
    );
    const content = buildMarkdownOutput(result);
    fs.writeFileSync(outputPath, content);

    console.log(`📝 Full research saved to: ${outputPath}\n`);

    // Update PROMPT_PATTERNS_RESEARCH.md
    const patternsPath = path.join(
      process.cwd(),
      'docs/PROMPT_PATTERNS_RESEARCH.md'
    );
    if (fs.existsSync(patternsPath)) {
      const existingContent = fs.readFileSync(patternsPath, 'utf8');
      const updatedContent = mergeResearchResults(
        existingContent,
        result.content
      );
      fs.writeFileSync(patternsPath, updatedContent);
      console.log(`✅ Updated: ${patternsPath}\n`);
    }

    console.log('🎉 Research integration complete!');

} catch (error: unknown) {
const errorMessage = error instanceof Error ? error.message : 'Unknown error';
console.error('❌ Research failed:', errorMessage);

    if (errorMessage.includes('GOOGLE_API_KEY')) {
      console.error('\n💡 Tip: Set GOOGLE_API_KEY in .env.local');
      console.error('   Get your key at: https://ai.google.dev\n');
    }

    process.exit(1);

}
}

/\*\*

- Build markdown output
  \*/
  function buildMarkdownOutput(result: GeminiResearchResult): string {
  let md = '# Gemini Deep Research Results\n\n';
  md += `**Date**: ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Topic**: Prompt Engineering Patterns\n`;
  md += `**Model**: Gemini 1.5 Pro\n\n`;

md += '## Metadata\n\n';
md += `- **Tokens Used**: ${result.metadata.tokenUsage.total.toLocaleString()}\n`;
md += `- **Research Time**: ${(result.metadata.processingTime / 1000).toFixed(2)}s\n`;
md += `- **Research Areas**: ${result.metadata.researchAreas.length}\n`;
md += `- **Sources**: ${result.metadata.sources.length}\n\n`;

md += '---\n\n';
md += '## Full Research Results\n\n';
md += result.content;

return md;
}

/\*\*

- Merge research results with existing patterns
  \*/
  function mergeResearchResults(existing: string, newContent: string): string {
  // Add Gemini research section if not exists
  if (!existing.includes('## Gemini Research Integration')) {
  const header = existing.split('\n').slice(0, 10).join('\n');
  const body = existing.split('\n').slice(10).join('\n');

      const geminiSection = `\n\n---\n\n## Gemini Research Integration\n\n**Last Updated**: ${new Date().toISOString().split('T')[0]}\n\n${newContent}\n\n---\n\n`;

      return header + geminiSection + body;

  }

return existing;
}

// Run the script
main();
