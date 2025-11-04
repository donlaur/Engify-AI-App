import { MainLayout } from '@/components/layout/MainLayout';
import { PatternsClient } from './patterns-client';
import { getAllPatterns } from '@/lib/patterns/mongodb-patterns';
import { promptRepository } from '@/lib/db/repositories/ContentService';

export default async function PatternsPage() {
  // Fetch patterns from MongoDB
  const patterns = await getAllPatterns();
  
  // Fetch all prompts to count by pattern
  const allPrompts = await promptRepository.getAll();
  
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
