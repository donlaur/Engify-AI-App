/**
 * CONTENT QUALITY SCORER
 * 
 * Combines multiple quality signals into a single score:
 * 1. AI Slop Detection (forbidden phrases, patterns)
 * 2. E-E-A-T Signals (experience, expertise, authority, trust)
 * 3. SEO Signals (keywords, structure, readability)
 * 4. Technical Quality (code examples, specificity, depth)
 */

import { detectAISlop, type SlopDetectionResult } from './ai-slop-detector';

export interface EEATSignals {
  experience: {
    score: number; // 0-10
    hasFirstHandTesting: boolean;
    hasSpecificMetrics: boolean;
    hasFailureMentions: boolean;
    hasTimestamps: boolean;
    examples: string[];
  };
  expertise: {
    score: number; // 0-10
    hasSpecificVersions: boolean;
    hasCodeExamples: boolean;
    explainsWhy: boolean;
    citesOfficialDocs: boolean;
    examples: string[];
  };
  authoritativeness: {
    score: number; // 0-10
    hasCitations: boolean;
    hasDataMetrics: boolean;
    mentionsCommunity: boolean;
    linksToSources: boolean;
    examples: string[];
  };
  trustworthiness: {
    score: number; // 0-10
    admitsLimitations: boolean;
    hasLastUpdated: boolean;
    distinguishesOpinionFact: boolean;
    noExaggeration: boolean;
    examples: string[];
  };
}

export interface SEOSignals {
  score: number; // 0-10
  hasTargetKeywords: boolean;
  keywordDensity: number; // 0-1
  hasHeadings: boolean;
  hasInternalLinks: boolean;
  readabilityScore: number; // 0-10
  wordCount: number;
}

export interface TechnicalQualitySignals {
  score: number; // 0-10
  hasCodeExamples: boolean;
  codeExampleCount: number;
  hasSpecificTools: boolean;
  hasVersionNumbers: boolean;
  depthScore: number; // 0-10 (surface vs deep)
}

export interface ContentQualityScore {
  overall: number; // 0-10 weighted average
  slopScore: number; // 0-10 from AI slop detector
  eeatScore: number; // 0-10 average of E-E-A-T signals
  seoScore: number; // 0-10 from SEO signals
  technicalScore: number; // 0-10 from technical signals
  
  // Detailed breakdowns
  slop: SlopDetectionResult;
  eeat: EEATSignals;
  seo: SEOSignals;
  technical: TechnicalQualitySignals;
  
  // Quality verdict
  verdict: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  publishReady: boolean;
  
  // Recommendations
  recommendations: string[];
}

/**
 * Analyze E-E-A-T signals in content
 */
export function analyzeEEAT(content: string): EEATSignals {
  const lowerContent = content.toLowerCase();
  
  // EXPERIENCE signals
  const experienceMarkers = [
    'i tested', 'we tested', 'i found', 'we found', 'after trying',
    'in my experience', 'when i used', 'i noticed', 'we discovered'
  ];
  const hasFirstHandTesting = experienceMarkers.some(m => lowerContent.includes(m));
  
  const metricPatterns = /\d+%|\d+x faster|\d+ hours?|\d+ minutes?|\d+ seconds?|reduced by \d+/gi;
  const metrics = content.match(metricPatterns) || [];
  const hasSpecificMetrics = metrics.length > 0;
  
  const failureMarkers = [
    'didn\'t work', 'failed', 'broke', 'watch out', 'be careful',
    'limitation', 'trade-off', 'downside', 'caveat'
  ];
  const hasFailureMentions = failureMarkers.some(m => lowerContent.includes(m));
  
  const timestampPatterns = /as of \w+ \d{4}|updated \w+ \d{4}|november \d{4}|version \d+\.\d+/gi;
  const timestamps = content.match(timestampPatterns) || [];
  const hasTimestamps = timestamps.length > 0;
  
  // PENALTY: Fake metrics detection
  const fakeMetricMarkers = [
    'approximately 30%', 'reduced by 25%', 'improved by 40%',
    'decreased by 35%', 'increased by 50%' // Round numbers = suspicious
  ];
  const hasSuspiciousFakeMetrics = fakeMetricMarkers.some(m => lowerContent.includes(m));
  
  const experienceScore = Math.max(0, (
    (hasFirstHandTesting ? 3 : 0) +
    (hasSpecificMetrics ? 3 : 0) +
    (hasFailureMentions ? 2 : 0) +
    (hasTimestamps ? 2 : 0) -
    (hasSuspiciousFakeMetrics ? 5 : 0) // PENALTY for fake metrics
  ));
  
  // EXPERTISE signals
  const versionPatterns = /v?\d+\.\d+(\.\d+)?|version \d+|cursor \d+\.\d+|gpt-4o/gi;
  const versions = content.match(versionPatterns) || [];
  const hasSpecificVersions = versions.length > 0;
  
  const codeBlockPattern = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockPattern) || [];
  const hasCodeExamples = codeBlocks.length > 0;
  
  const whyMarkers = ['this works because', 'the reason', 'why this', 'because', 'due to'];
  const explainsWhy = whyMarkers.some(m => lowerContent.includes(m));
  
  const docMarkers = ['official docs', 'documentation', 'github', 'readme'];
  const citesOfficialDocs = docMarkers.some(m => lowerContent.includes(m));
  
  // PENALTY: Fake code detection (Python code in Cursor/Electron article)
  const hasPythonCode = codeBlocks.some(block => 
    block.includes('```python') || block.includes('def ') || block.includes('import ')
  );
  const isElectronArticle = lowerContent.includes('cursor') || lowerContent.includes('electron') || lowerContent.includes('vscode');
  const hasFakeCode = hasPythonCode && isElectronArticle; // Python in Electron article = fake
  
  const expertiseScore = Math.max(0, (
    (hasSpecificVersions ? 3 : 0) +
    (hasCodeExamples && !hasFakeCode ? 3 : 0) + // No points for fake code
    (explainsWhy ? 2 : 0) +
    (citesOfficialDocs ? 2 : 0) -
    (hasFakeCode ? 6 : 0) // MAJOR PENALTY for fake code
  ));
  
  // AUTHORITATIVENESS signals
  const citationPatterns = /\[.*?\]\(.*?\)|\bhttps?:\/\/\S+|according to|source:|via/gi;
  const citations = content.match(citationPatterns) || [];
  const hasCitations = citations.length > 0;
  
  const hasDataMetrics = metrics.length >= 2;
  
  const communityMarkers = ['reddit', 'community', 'developers prefer', 'most users', 'consensus'];
  const mentionsCommunity = communityMarkers.some(m => lowerContent.includes(m));
  
  const linksToSources = citations.length >= 3;
  
  const authorityScore = (
    (hasCitations ? 3 : 0) +
    (hasDataMetrics ? 2 : 0) +
    (mentionsCommunity ? 3 : 0) +
    (linksToSources ? 2 : 0)
  );
  
  // TRUSTWORTHINESS signals
  const limitationMarkers = [
    'limitation', 'trade-off', 'downside', 'not suitable for',
    'avoid if', 'won\'t work for', 'caveat', 'however'
  ];
  const admitsLimitations = limitationMarkers.some(m => lowerContent.includes(m));
  
  const updateMarkers = ['last updated', 'updated:', 'as of'];
  const hasLastUpdated = updateMarkers.some(m => lowerContent.includes(m));
  
  const opinionMarkers = ['in my opinion', 'i think', 'i believe', 'my experience'];
  const distinguishesOpinionFact = opinionMarkers.some(m => lowerContent.includes(m));
  
  const exaggerationWords = [
    'revolutionary', 'game-changing', 'best ever', 'perfect',
    'always', 'never fails', 'guaranteed', 'ultimate'
  ];
  const noExaggeration = !exaggerationWords.some(w => lowerContent.includes(w));
  
  const trustScore = (
    (admitsLimitations ? 3 : 0) +
    (hasLastUpdated ? 2 : 0) +
    (distinguishesOpinionFact ? 2 : 0) +
    (noExaggeration ? 3 : 0)
  );
  
  return {
    experience: {
      score: experienceScore,
      hasFirstHandTesting,
      hasSpecificMetrics,
      hasFailureMentions,
      hasTimestamps,
      examples: experienceMarkers.filter(m => lowerContent.includes(m))
    },
    expertise: {
      score: expertiseScore,
      hasSpecificVersions,
      hasCodeExamples,
      explainsWhy,
      citesOfficialDocs,
      examples: versions.slice(0, 3)
    },
    authoritativeness: {
      score: authorityScore,
      hasCitations,
      hasDataMetrics,
      mentionsCommunity,
      linksToSources,
      examples: citations.slice(0, 3)
    },
    trustworthiness: {
      score: trustScore,
      admitsLimitations,
      hasLastUpdated,
      distinguishesOpinionFact,
      noExaggeration,
      examples: limitationMarkers.filter(m => lowerContent.includes(m))
    }
  };
}

/**
 * Analyze SEO signals
 */
export function analyzeSEO(content: string, targetKeywords: string[] = []): SEOSignals {
  const wordCount = content.split(/\s+/).length;

  // Keyword density
  let keywordMatches = 0;
  targetKeywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = content.match(regex) || [];
    keywordMatches += matches.length;
  });
  const keywordDensity = wordCount > 0 ? keywordMatches / wordCount : 0;
  const hasTargetKeywords = keywordMatches >= 3;
  
  // Headings
  const headingPattern = /^#{1,6}\s+.+$/gm;
  const headings = content.match(headingPattern) || [];
  const hasHeadings = headings.length >= 3;
  
  // Internal links (markdown links)
  const linkPattern = /\[.*?\]\(.*?\)/g;
  const links = content.match(linkPattern) || [];
  const hasInternalLinks = links.length >= 2;
  
  // Readability (simple Flesch-Kincaid approximation)
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
  const readabilityScore = Math.max(0, Math.min(10, 10 - (avgWordsPerSentence - 15) / 5));
  
  const seoScore = (
    (hasTargetKeywords ? 3 : 0) +
    (keywordDensity > 0.01 && keywordDensity < 0.03 ? 2 : 0) +
    (hasHeadings ? 2 : 0) +
    (hasInternalLinks ? 2 : 0) +
    (readabilityScore >= 7 ? 1 : 0)
  );
  
  return {
    score: seoScore,
    hasTargetKeywords,
    keywordDensity,
    hasHeadings,
    hasInternalLinks,
    readabilityScore,
    wordCount
  };
}

/**
 * Analyze technical quality signals
 */
export function analyzeTechnical(content: string): TechnicalQualitySignals {
  const lowerContent = content.toLowerCase();
  
  // Code examples
  const codeBlockPattern = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockPattern) || [];
  const hasCodeExamples = codeBlocks.length > 0;
  const codeExampleCount = codeBlocks.length;
  
  // Specific tools mentioned
  const toolPatterns = /cursor|windsurf|copilot|vscode|github|openai|anthropic|gemini/gi;
  const tools = content.match(toolPatterns) || [];
  const hasSpecificTools = tools.length >= 3;
  
  // Version numbers
  const versionPattern = /v?\d+\.\d+(\.\d+)?/g;
  const versions = content.match(versionPattern) || [];
  const hasVersionNumbers = versions.length >= 2;
  
  // Depth score (based on technical detail)
  const technicalMarkers = [
    'architecture', 'implementation', 'algorithm', 'performance',
    'optimization', 'configuration', 'integration', 'api'
  ];
  const technicalDepth = technicalMarkers.filter(m => lowerContent.includes(m)).length;
  const depthScore = Math.min(10, technicalDepth * 1.5);
  
  const technicalScore = (
    (hasCodeExamples ? 3 : 0) +
    (codeExampleCount >= 3 ? 2 : 0) +
    (hasSpecificTools ? 2 : 0) +
    (hasVersionNumbers ? 2 : 0) +
    (depthScore >= 5 ? 1 : 0)
  );
  
  return {
    score: technicalScore,
    hasCodeExamples,
    codeExampleCount,
    hasSpecificTools,
    hasVersionNumbers,
    depthScore
  };
}

/**
 * Calculate overall content quality score
 */
export function scoreContent(
  content: string,
  targetKeywords: string[] = []
): ContentQualityScore {
  // Run all analyzers
  const slop = detectAISlop(content);
  const eeat = analyzeEEAT(content);
  const seo = analyzeSEO(content, targetKeywords);
  const technical = analyzeTechnical(content);
  
  // Calculate component scores
  const slopScore = slop.qualityScore;
  const eeatScore = (
    eeat.experience.score +
    eeat.expertise.score +
    eeat.authoritativeness.score +
    eeat.trustworthiness.score
  ) / 4;
  const seoScore = seo.score;
  const technicalScore = technical.score;
  
  // Weighted overall score
  // Slop: 30%, E-E-A-T: 40%, SEO: 15%, Technical: 15%
  const overall = (
    slopScore * 0.30 +
    eeatScore * 0.40 +
    seoScore * 0.15 +
    technicalScore * 0.15
  );
  
  // Determine verdict (TOUGHER THRESHOLDS)
  let verdict: ContentQualityScore['verdict'];
  if (overall >= 9.0) verdict = 'excellent';  // Raised from 8.5
  else if (overall >= 7.5) verdict = 'good';  // Raised from 7.0
  else if (overall >= 6.0) verdict = 'needs-improvement';  // Raised from 5.0
  else verdict = 'poor';
  
  // MUCH TOUGHER publish requirements
  const publishReady = overall >= 8.5 &&  // Raised from 8.0
                       slopScore >= 8.0 &&  // Raised from 7.0
                       eeatScore >= 8.0 &&  // Raised from 7.0
                       !content.includes('```python');  // NO FAKE CODE
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (slopScore < 7) {
    recommendations.push(`🚩 AI Slop Score Low (${slopScore.toFixed(1)}/10): ${slop.flags.join(', ')}`);
  }
  
  if (!eeat.experience.hasFirstHandTesting) {
    recommendations.push('📝 Add first-hand testing: "I tested...", "We found..."');
  }
  
  if (!eeat.experience.hasSpecificMetrics) {
    recommendations.push('📊 Add specific metrics: "40% faster", "saved 2 hours"');
  }
  
  if (!eeat.expertise.hasCodeExamples) {
    recommendations.push('💻 Add code examples with real file paths');
  }
  
  if (!eeat.authoritativeness.hasCitations) {
    recommendations.push('🔗 Add citations: link to official docs, GitHub, Reddit');
  }
  
  if (!eeat.trustworthiness.admitsLimitations) {
    recommendations.push('⚖️ Admit limitations: "This won\'t work for...", "Trade-offs..."');
  }
  
  if (!seo.hasTargetKeywords) {
    recommendations.push('🎯 Include target keywords naturally (3+ times)');
  }
  
  if (!technical.hasCodeExamples) {
    recommendations.push('⚙️ Add technical code examples');
  }
  
  return {
    overall,
    slopScore,
    eeatScore,
    seoScore,
    technicalScore,
    slop,
    eeat,
    seo,
    technical,
    verdict,
    publishReady,
    recommendations
  };
}

/**
 * Print detailed quality report
 */
export function printQualityReport(score: ContentQualityScore): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              CONTENT QUALITY SCORE REPORT                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Overall score
  const verdictEmoji = {
    'excellent': '🌟',
    'good': '✅',
    'needs-improvement': '⚠️',
    'poor': '❌'
  }[score.verdict];
  
  console.log(`📊 OVERALL SCORE: ${score.overall.toFixed(1)}/10 ${verdictEmoji} ${score.verdict.toUpperCase()}`);
  console.log(`   Publish Ready: ${score.publishReady ? '✅ YES' : '❌ NO'}\n`);
  
  // Component scores
  console.log('📈 COMPONENT SCORES:');
  console.log(`   AI Slop:     ${score.slopScore.toFixed(1)}/10 ${score.slopScore >= 8 ? '✅' : score.slopScore >= 6 ? '⚠️' : '❌'}`);
  console.log(`   E-E-A-T:     ${score.eeatScore.toFixed(1)}/10 ${score.eeatScore >= 8 ? '✅' : score.eeatScore >= 6 ? '⚠️' : '❌'}`);
  console.log(`   SEO:         ${score.seoScore.toFixed(1)}/10 ${score.seoScore >= 8 ? '✅' : score.seoScore >= 6 ? '⚠️' : '❌'}`);
  console.log(`   Technical:   ${score.technicalScore.toFixed(1)}/10 ${score.technicalScore >= 8 ? '✅' : score.technicalScore >= 6 ? '⚠️' : '❌'}\n`);
  
  // E-E-A-T breakdown
  console.log('🎯 E-E-A-T BREAKDOWN:');
  console.log(`   Experience:        ${score.eeat.experience.score}/10`);
  console.log(`   Expertise:         ${score.eeat.expertise.score}/10`);
  console.log(`   Authoritativeness: ${score.eeat.authoritativeness.score}/10`);
  console.log(`   Trustworthiness:   ${score.eeat.trustworthiness.score}/10\n`);
  
  // Recommendations
  if (score.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    score.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    console.log('');
  }
  
  console.log('═'.repeat(62) + '\n');
}
