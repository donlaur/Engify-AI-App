import { MainLayout } from '@/components/layout/MainLayout';
import { PatternsClient } from './patterns-client';
import { loadPatternsFromJson } from '@/lib/patterns/load-patterns-from-json';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import type { Pattern } from '@/lib/db/schemas/pattern';
import type { Prompt } from '@/lib/schemas/prompt';

export default async function PatternsPage() {
  // Use JSON loader with triple fallback: JSON → Backup → MongoDB
  let patterns: Pattern[] = [];
  try {
    patterns = await loadPatternsFromJson();
  } catch (error) {
    console.error('Failed to load patterns (all fallbacks failed):', error);
    // Use empty array as absolute last resort
  }
  
  // Use JSON loader with triple fallback for prompts too
  let allPrompts: Prompt[] = [];
  try {
    allPrompts = await loadPromptsFromJson();
  } catch (error) {
    console.error('Failed to load prompts (all fallbacks failed):', error);
    // Use empty array as absolute last resort
  }
  
  // Count prompts per pattern
  const promptsByPattern = new Map<string, number>();
  allPrompts.forEach((prompt) => {
    if (prompt.pattern) {
      promptsByPattern.set(
        prompt.pattern,
        (promptsByPattern.get(prompt.pattern) || 0) + 1
      );
    }
  });

  // Calculate total prompts using patterns
  const totalPromptsUsingPatterns = Array.from(promptsByPattern.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <MainLayout>
      <PatternsClient 
        patterns={patterns} 
        promptsByPattern={promptsByPattern}
        totalPromptsUsingPatterns={totalPromptsUsingPatterns}
      />
    </MainLayout>
  );
}
