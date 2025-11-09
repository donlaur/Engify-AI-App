import { MainLayout } from '@/components/layout/MainLayout';
import { PatternsClient } from './patterns-client';
import { patternRepository } from '@/lib/db/repositories/ContentService';
import { promptRepository } from '@/lib/db/repositories/ContentService';

export default async function PatternsPage() {
  // Add timeout and better error handling for MongoDB connections
  let patterns = [];
  try {
    patterns = await Promise.race([
      patternRepository.getAll(),
      new Promise<[]>((_, reject) =>
        setTimeout(() => reject(new Error('Patterns fetch timeout')), 10000)
      ),
    ]);
  } catch (error) {
    console.error('Failed to fetch patterns from database, using fallback:', error);
    // Use empty array as fallback during build or timeouts
  }
  
  // Add timeout and better error handling for prompts
  let allPrompts = [];
  try {
    allPrompts = await Promise.race([
      promptRepository.getAll(),
      new Promise<[]>((_, reject) =>
        setTimeout(() => reject(new Error('Prompts fetch timeout')), 10000)
      ),
    ]);
  } catch (error) {
    console.error('Failed to fetch prompts from database, using fallback:', error);
    // Use empty array as fallback during build or timeouts
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
