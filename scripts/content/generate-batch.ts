#!/usr/bin/env tsx

/**
 * AI Summary: Batch script for automated content generation using CreatorAgent.
 * Reads topics from curated list and creates multiple content pieces. Part of Day 5 Phase 2.5.
 */

/* eslint-disable no-console */

import { CreatorAgent } from '../../src/lib/agents/CreatorAgent';
import { AIProviderFactory } from '../../src/lib/execution/factory/AIProviderFactory';
import { getEnabledTopics } from '../../src/lib/content/topics';

interface BatchTopic {
  topic: string;
  category: string;
  targetWordCount?: number;
  tags?: string[];
  priority?: number;
}

class ContentBatchGenerator {
  private creatorAgent: CreatorAgent;
  private topics: BatchTopic[];

  constructor(topics: BatchTopic[]) {
    const providerFactory = new AIProviderFactory();
    this.creatorAgent = new CreatorAgent(providerFactory);
    this.topics = topics.sort((a, b) => (b.priority || 0) - (a.priority || 0)); // High priority first
  }

  async generateBatch(limit?: number): Promise<{
    successful: number;
    failed: number;
    totalCost: number;
    totalWords: number;
    results: Array<{
      topic: string;
      success: boolean;
      contentId?: string;
      error?: string;
      wordCount?: number;
      cost?: number;
    }>;
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;
    let totalCost = 0;
    let totalWords = 0;

    const topicsToProcess = limit ? this.topics.slice(0, limit) : this.topics;

    console.log(`🚀 Starting batch content generation for ${topicsToProcess.length} topics...`);

    for (const [index, topic] of topicsToProcess.entries()) {
      console.log(`\n📝 Processing ${index + 1}/${topicsToProcess.length}: "${topic.topic}"`);

      try {
        const result = await this.creatorAgent.createContent({
          topic: topic.topic,
          category: topic.category,
          targetWordCount: topic.targetWordCount,
          tags: topic.tags,
        });

        if (result.success) {
          successful++;
          totalCost += result.cost || 0;
          totalWords += result.wordCount || 0;
          console.log(`✅ Success: ${result.wordCount} words, $${result.cost?.toFixed(4)}, ID: ${result.contentId}`);
        } else {
          failed++;
          console.log(`❌ Failed: ${result.error}`);
        }

        results.push({
          topic: topic.topic,
          success: result.success,
          contentId: result.contentId,
          error: result.error,
          wordCount: result.wordCount,
          cost: result.cost,
        });

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`💥 Error: ${errorMessage}`);

        results.push({
          topic: topic.topic,
          success: false,
          error: errorMessage,
        });
      }
    }

    console.log(`\n🎉 Batch complete!`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total words: ${totalWords}`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

    return {
      successful,
      failed,
      totalCost,
      totalWords,
      results,
    };
  }

  async getStats() {
    return await this.creatorAgent.getStats();
  }
}

// Load topics from curated allowlist
function loadTopics(): BatchTopic[] {
  return getEnabledTopics();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const limit = args[0] ? parseInt(args[0]) : undefined;

  try {
    const topics = loadTopics();
    const generator = new ContentBatchGenerator(topics);

    console.log(`📋 Loaded ${topics.length} topics for batch generation`);

    if (args.includes('--stats')) {
      console.log('\n📊 Current Content Creation Stats:');
      const stats = await generator.getStats();
      console.log(`Total created: ${stats.totalCreated}`);
      console.log(`Total words: ${stats.totalWords}`);
      console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
      console.log(`Average quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
      return;
    }

    const result = await generator.generateBatch(limit);

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = join(__dirname, `../../logs/batch-generation-${timestamp}.json`);

    try {
      const { writeFileSync } = await import('fs');
      writeFileSync(resultsPath, JSON.stringify(result, null, 2));
      console.log(`\n💾 Results saved to: ${resultsPath}`);
    } catch (error) {
      console.warn('Could not save results file:', error);
    }

  } catch (error) {
    console.error('Batch generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ContentBatchGenerator };
