/**
 * AI Slop Detection for Generated Content
 * Detects AI-generated patterns and quality issues
 * 
 * Based on research: Google E-E-A-T framework and AI content detection signals
 */

export interface SlopDetectionResult {
  aiProbability: number; // 0-1 (0=human, 1=AI)
  qualityScore: number; // 0-10 (10=best)
  flags: string[];
  recommendations: string[];
  metrics: {
    wordCount: number;
    slopCount: number;
    slopPhrases: Array<{ phrase: string; count: number }>;
    emDashCount: number;
    emDashRatio: number;
    sentenceCount: number;
    avgSentenceLength: number;
    sentenceStdDev: number;
    hedgeCount: number;
    hedgeRatio: number;
    vagueCount: number;
    personalCount: number;
    hasCode: boolean;
    hasNumbers: boolean;
    hasLinks: boolean;
  };
}

const SLOP_PHRASES = [
  'delve', 'delve into', 'delving',
  'leverage', 'leveraging',
  'utilize', 'utilization',
  'robust', 'seamless', 'cutting-edge', 'state-of-the-art',
  'revolutionary', 'game-changing', 'transformative',
  "it's important to note", 'it should be noted',
  "in today's fast-paced world", 'in this day and age',
  'at the end of the day', 'first and foremost',
  'it goes without saying', 'needless to say',
];

const HEDGE_WORDS = [
  'may', 'might', 'could', 'possibly', 'generally',
  'typically', 'often', 'usually', 'in most cases',
];

const VAGUE_PHRASES = [
  'many experts', 'studies show', 'research indicates',
  "it's widely known", "it's well established", "it's commonly accepted",
];

const PERSONAL_MARKERS = [
  'i tried', 'i tested', 'in my experience', 'i found',
  'we built', 'we discovered', 'our team', 'i noticed',
  'after testing', 'when i used',
];

export function detectAISlop(text: string): SlopDetectionResult {
  const flags: string[] = [];
  const recommendations: string[] = [];

  const textLower = text.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  // 1. AI Slop Phrases
  let slopCount = 0;
  const slopFound: Array<{ phrase: string; count: number }> = [];

  for (const phrase of SLOP_PHRASES) {
    const count = (textLower.match(new RegExp(phrase, 'g')) || []).length;
    if (count > 0) {
      slopCount += count;
      slopFound.push({ phrase, count });
    }
  }

  if (slopCount > 0) {
    flags.push(`AI slop phrases: ${slopCount} total`);
    recommendations.push('Remove AI slop phrases, use natural language');
  }

  // 2. Em Dash Overuse (AI loves em dashes)
  const emDashCount = (text.match(/—/g) || []).length;
  const emDashRatio = wordCount > 0 ? (emDashCount / (wordCount / 100)) : 0;

  if (emDashRatio > 1) {
    flags.push(`Overuse of em dashes (${emDashCount} total, ${emDashRatio.toFixed(1)} per 100 words)`);
    recommendations.push('Replace em dashes with periods or colons');
  }

  // 3. Sentence Length Uniformity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);

  let stdDev = 0;
  if (sentenceLengths.length > 5) {
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    stdDev = Math.sqrt(variance);

    // AI text has low variance (uniform sentences)
    if (stdDev < 5) {
      flags.push(`Uniform sentence length (std dev: ${stdDev.toFixed(1)})`);
      recommendations.push('Vary sentence length (mix short punchy + long complex)');
    }
  }

  // 4. Hedging Language (AI is overly cautious)
  let hedgeCount = 0;
  for (const hedge of HEDGE_WORDS) {
    hedgeCount += (textLower.match(new RegExp(`\\b${hedge}\\b`, 'g')) || []).length;
  }
  const hedgeRatio = wordCount > 0 ? hedgeCount / wordCount : 0;

  if (hedgeRatio > 0.02) {
    flags.push(`Excessive hedging language (${(hedgeRatio * 100).toFixed(1)}%)`);
    recommendations.push('Be more direct, reduce qualifiers');
  }

  // 5. Vague Claims Without Citations
  let vagueCount = 0;
  for (const phrase of VAGUE_PHRASES) {
    vagueCount += (textLower.match(new RegExp(phrase, 'g')) || []).length;
  }

  if (vagueCount > 2) {
    flags.push(`Vague claims without citations (${vagueCount}x)`);
    recommendations.push('Add specific citations and sources');
  }

  // 6. Personal Experience Markers (good = human)
  let personalCount = 0;
  for (const marker of PERSONAL_MARKERS) {
    personalCount += (textLower.match(new RegExp(marker, 'g')) || []).length;
  }

  if (personalCount === 0) {
    flags.push('No personal experience markers');
    recommendations.push("Add personal testing/experience ('I tested...', 'We found...')");
  }

  // 7. Specific Examples (good = human)
  const hasCode = text.includes('```') || text.includes('`');
  const hasNumbers = /\d/.test(text);
  const hasLinks = /https?:\/\//.test(text) || /\[.*\]\(.*\)/.test(text);

  if (!hasCode) {
    flags.push('No code examples');
    recommendations.push('Add code examples with syntax highlighting');
  }
  if (!hasNumbers) {
    flags.push('No specific numbers/data');
    recommendations.push('Add specific metrics, measurements, or data');
  }
  if (!hasLinks) {
    flags.push('No citations/links');
    recommendations.push('Add citations to sources (Reddit, GitHub, docs)');
  }

  // 8. Generic Structures (AI patterns)
  const genericPatterns = [
    'there are several reasons why',
    "let's explore the key factors",
    'here are some important considerations',
    "in conclusion, it's clear that",
    "to summarize, we've discussed",
  ];

  let genericCount = 0;
  for (const pattern of genericPatterns) {
    genericCount += (textLower.match(new RegExp(pattern, 'g')) || []).length;
  }

  if (genericCount > 1) {
    flags.push(`Generic AI structures (${genericCount}x)`);
    recommendations.push('Use more direct, specific language');
  }

  // Calculate AI probability
  const flagWeight = flags.length * 0.08; // Each flag adds 8%
  const slopWeight = Math.min(0.3, slopCount * 0.02); // Slop phrases add up to 30%
  const uniformityWeight = stdDev < 5 ? 0.2 : 0;

  let aiProbability = Math.min(1.0, flagWeight + slopWeight + uniformityWeight);

  // Calculate quality score (inverse of AI probability)
  let qualityScore = Math.max(0, 10 - aiProbability * 10);

  // Adjust quality based on positive signals
  if (personalCount > 0) qualityScore += 0.5;
  if (hasCode) qualityScore += 0.5;
  if (hasNumbers) qualityScore += 0.3;
  if (hasLinks) qualityScore += 0.3;

  qualityScore = Math.min(10, qualityScore);

  return {
    aiProbability: Math.round(aiProbability * 100) / 100,
    qualityScore: Math.round(qualityScore * 10) / 10,
    flags,
    recommendations,
    metrics: {
      wordCount,
      slopCount,
      slopPhrases: slopFound,
      emDashCount,
      emDashRatio: Math.round(emDashRatio * 100) / 100,
      sentenceCount: sentences.length,
      avgSentenceLength: sentenceLengths.length > 0
        ? Math.round((sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length) * 10) / 10
        : 0,
      sentenceStdDev: Math.round(stdDev * 10) / 10,
      hedgeCount,
      hedgeRatio: Math.round(hedgeRatio * 1000) / 1000,
      vagueCount,
      personalCount,
      hasCode,
      hasNumbers,
      hasLinks,
    },
  };
}

export function printDetectionReport(detection: SlopDetectionResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('AI SLOP DETECTION REPORT');
  console.log('='.repeat(60));

  console.log(`\n📊 Overall Scores:`);
  console.log(`   AI Probability: ${(detection.aiProbability * 100).toFixed(0)}%`);
  console.log(`   Quality Score: ${detection.qualityScore}/10`);

  if (detection.flags.length > 0) {
    console.log(`\n⚠️  Flags (${detection.flags.length}):`);
    detection.flags.forEach(flag => console.log(`   - ${flag}`));
  } else {
    console.log(`\n✅ No flags detected`);
  }

  if (detection.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    detection.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }

  const m = detection.metrics;
  console.log(`\n📈 Metrics:`);
  console.log(`   Words: ${m.wordCount.toLocaleString()}`);
  console.log(`   Sentences: ${m.sentenceCount}`);
  console.log(`   Avg Sentence Length: ${m.avgSentenceLength} words`);
  console.log(`   Sentence Variation (std dev): ${m.sentenceStdDev}`);
  console.log(`   AI Slop Phrases: ${m.slopCount}`);
  console.log(`   Em Dashes: ${m.emDashCount} (${m.emDashRatio} per 100 words)`);
  console.log(`   Personal Markers: ${m.personalCount}`);
  console.log(`   Has Code: ${m.hasCode ? '✅' : '❌'}`);
  console.log(`   Has Numbers: ${m.hasNumbers ? '✅' : '❌'}`);
  console.log(`   Has Links: ${m.hasLinks ? '✅' : '❌'}`);

  if (m.slopPhrases.length > 0) {
    console.log(`\n🚫 AI Slop Phrases Found:`);
    m.slopPhrases.forEach(slop => console.log(`   - '${slop.phrase}' (${slop.count}x)`));
  }

  console.log('\n' + '='.repeat(60));

  // Overall verdict
  if (detection.qualityScore >= 8) {
    console.log('✅ PASS: Article meets quality standards');
  } else if (detection.qualityScore >= 6) {
    console.log('⚠️  REVIEW: Article needs minor improvements');
  } else {
    console.log('❌ REJECT: Article needs major revision or regeneration');
  }

  console.log('='.repeat(60) + '\n');
}
