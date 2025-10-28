/**
 * Test Results Analyzer
 * Analyzes batch test results and generates insights
 *
 * Usage: pnpm analyze:tests
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  promptId: string;
  promptTitle: string;
  category: string;
  patterns?: string[];
  provider: 'openai' | 'gemini';
  success: boolean;
  responseTime: number;
  responseLength: number;
  error?: string;
  quality: {
    hasStructure: boolean;
    hasExamples: boolean;
    isCoherent: boolean;
    followsPattern: boolean;
  };
  timestamp: string;
}

interface BatchReport {
  batchNumber: number;
  totalTested: number;
  successRate: number;
  averageResponseTime: number;
  results: TestResult[];
  summary: {
    openai: { success: number; failed: number };
    gemini: { success: number; failed: number };
  };
  timestamp: string;
}

interface Analysis {
  totalTests: number;
  overallSuccessRate: number;
  providerComparison: {
    openai: {
      successRate: number;
      avgResponseTime: number;
      avgQualityScore: number;
    };
    gemini: {
      successRate: number;
      avgResponseTime: number;
      avgQualityScore: number;
    };
  };
  patternPerformance: Record<
    string,
    {
      tested: number;
      successRate: number;
      avgQualityScore: number;
    }
  >;
  categoryPerformance: Record<
    string,
    {
      tested: number;
      successRate: number;
    }
  >;
  failedPrompts: Array<{
    promptId: string;
    promptTitle: string;
    provider: string;
    error: string;
  }>;
  recommendations: string[];
}

/**
 * Load all test reports
 */
function loadReports(): BatchReport[] {
  const reportsDir = path.join(process.cwd(), 'test-reports');

  if (!fs.existsSync(reportsDir)) {
    console.log(
      'No test reports found. Run tests first with: pnpm test:prompts'
    );
    return [];
  }

  const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith('.json'));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
    return JSON.parse(content) as BatchReport;
  });
}

/**
 * Calculate quality score
 */
function calculateQualityScore(quality: TestResult['quality']): number {
  const weights = {
    hasStructure: 0.3,
    hasExamples: 0.2,
    isCoherent: 0.3,
    followsPattern: 0.2,
  };

  return (
    Object.entries(quality).reduce((score, [key, value]) => {
      return score + (value ? weights[key as keyof typeof weights] : 0);
    }, 0) * 100
  );
}

/**
 * Analyze all test results
 */
function analyzeResults(reports: BatchReport[]): Analysis {
  const allResults = reports.flatMap((r) => r.results);

  // Overall metrics
  const totalTests = allResults.length;
  const successfulTests = allResults.filter((r) => r.success).length;
  const overallSuccessRate = (successfulTests / totalTests) * 100;

  // Provider comparison
  const openaiResults = allResults.filter((r) => r.provider === 'openai');
  const geminiResults = allResults.filter((r) => r.provider === 'gemini');

  const providerComparison = {
    openai: {
      successRate:
        (openaiResults.filter((r) => r.success).length / openaiResults.length) *
        100,
      avgResponseTime:
        openaiResults.reduce((sum, r) => sum + r.responseTime, 0) /
        openaiResults.length,
      avgQualityScore:
        openaiResults.reduce(
          (sum, r) => sum + calculateQualityScore(r.quality),
          0
        ) / openaiResults.length,
    },
    gemini: {
      successRate:
        (geminiResults.filter((r) => r.success).length / geminiResults.length) *
        100,
      avgResponseTime:
        geminiResults.reduce((sum, r) => sum + r.responseTime, 0) /
        geminiResults.length,
      avgQualityScore:
        geminiResults.reduce(
          (sum, r) => sum + calculateQualityScore(r.quality),
          0
        ) / geminiResults.length,
    },
  };

  // Pattern performance
  const patternPerformance: Analysis['patternPerformance'] = {};
  allResults.forEach((result) => {
    if (result.patterns) {
      result.patterns.forEach((pattern) => {
        if (!patternPerformance[pattern]) {
          patternPerformance[pattern] = {
            tested: 0,
            successRate: 0,
            avgQualityScore: 0,
          };
        }
        patternPerformance[pattern].tested++;
        if (result.success) {
          patternPerformance[pattern].successRate++;
        }
        patternPerformance[pattern].avgQualityScore += calculateQualityScore(
          result.quality
        );
      });
    }
  });

  // Calculate averages for patterns
  Object.keys(patternPerformance).forEach((pattern) => {
    const data = patternPerformance[pattern];
    data.successRate = (data.successRate / data.tested) * 100;
    data.avgQualityScore = data.avgQualityScore / data.tested;
  });

  // Category performance
  const categoryPerformance: Analysis['categoryPerformance'] = {};
  allResults.forEach((result) => {
    if (!categoryPerformance[result.category]) {
      categoryPerformance[result.category] = { tested: 0, successRate: 0 };
    }
    categoryPerformance[result.category].tested++;
    if (result.success) {
      categoryPerformance[result.category].successRate++;
    }
  });

  Object.keys(categoryPerformance).forEach((category) => {
    const data = categoryPerformance[category];
    data.successRate = (data.successRate / data.tested) * 100;
  });

  // Failed prompts
  const failedPrompts = allResults
    .filter((r) => !r.success)
    .map((r) => ({
      promptId: r.promptId,
      promptTitle: r.promptTitle,
      provider: r.provider,
      error: r.error || 'Unknown error',
    }));

  // Recommendations
  const recommendations: string[] = [];

  if (overallSuccessRate < 90) {
    recommendations.push(
      'Overall success rate is below 90%. Review failed prompts for common issues.'
    );
  }

  if (
    providerComparison.openai.successRate <
    providerComparison.gemini.successRate - 10
  ) {
    recommendations.push(
      'OpenAI has significantly lower success rate. Check API configuration.'
    );
  }

  if (
    providerComparison.gemini.successRate <
    providerComparison.openai.successRate - 10
  ) {
    recommendations.push(
      'Gemini has significantly lower success rate. Check API configuration.'
    );
  }

  Object.entries(patternPerformance).forEach(([pattern, data]) => {
    if (data.successRate < 80) {
      recommendations.push(
        `Pattern "${pattern}" has low success rate (${data.successRate.toFixed(1)}%). Review prompts using this pattern.`
      );
    }
  });

  return {
    totalTests,
    overallSuccessRate,
    providerComparison,
    patternPerformance,
    categoryPerformance,
    failedPrompts,
    recommendations,
  };
}

/**
 * Print analysis report
 */
function printAnalysis(analysis: Analysis): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE TEST ANALYSIS');
  console.log('='.repeat(70));

  console.log(`\n📈 Overall Metrics:`);
  console.log(`  Total Tests: ${analysis.totalTests}`);
  console.log(`  Success Rate: ${analysis.overallSuccessRate.toFixed(2)}%`);

  console.log(`\n🤖 Provider Comparison:`);
  console.log(`  OpenAI:`);
  console.log(
    `    Success Rate: ${analysis.providerComparison.openai.successRate.toFixed(2)}%`
  );
  console.log(
    `    Avg Response Time: ${analysis.providerComparison.openai.avgResponseTime.toFixed(0)}ms`
  );
  console.log(
    `    Avg Quality Score: ${analysis.providerComparison.openai.avgQualityScore.toFixed(1)}/100`
  );

  console.log(`  Gemini:`);
  console.log(
    `    Success Rate: ${analysis.providerComparison.gemini.successRate.toFixed(2)}%`
  );
  console.log(
    `    Avg Response Time: ${analysis.providerComparison.gemini.avgResponseTime.toFixed(0)}ms`
  );
  console.log(
    `    Avg Quality Score: ${analysis.providerComparison.gemini.avgQualityScore.toFixed(1)}/100`
  );

  console.log(`\n🎯 Pattern Performance:`);
  Object.entries(analysis.patternPerformance)
    .sort((a, b) => b[1].successRate - a[1].successRate)
    .forEach(([pattern, data]) => {
      console.log(`  ${pattern}:`);
      console.log(
        `    Tested: ${data.tested} | Success: ${data.successRate.toFixed(1)}% | Quality: ${data.avgQualityScore.toFixed(1)}/100`
      );
    });

  console.log(`\n📁 Category Performance:`);
  Object.entries(analysis.categoryPerformance)
    .sort((a, b) => b[1].successRate - a[1].successRate)
    .forEach(([category, data]) => {
      console.log(
        `  ${category}: ${data.tested} tested | ${data.successRate.toFixed(1)}% success`
      );
    });

  if (analysis.failedPrompts.length > 0) {
    console.log(`\n❌ Failed Prompts (${analysis.failedPrompts.length}):`);
    analysis.failedPrompts.slice(0, 10).forEach((prompt) => {
      console.log(
        `  • ${prompt.promptTitle} (${prompt.provider}): ${prompt.error}`
      );
    });
    if (analysis.failedPrompts.length > 10) {
      console.log(`  ... and ${analysis.failedPrompts.length - 10} more`);
    }
  }

  if (analysis.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    analysis.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log('\n' + '='.repeat(70));
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing test results...\n');

  const reports = loadReports();

  if (reports.length === 0) {
    console.log('No reports to analyze.');
    return;
  }

  console.log(`Found ${reports.length} test report(s)`);

  const analysis = analyzeResults(reports);
  printAnalysis(analysis);

  // Save analysis
  const analysisPath = path.join(
    process.cwd(),
    'test-reports',
    'analysis.json'
  );
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 Analysis saved: ${analysisPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { analyzeResults, Analysis };
