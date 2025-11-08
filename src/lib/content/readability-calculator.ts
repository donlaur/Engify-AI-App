/**
 * Readability Calculator - Flesch-Kincaid and other metrics
 * 
 * Calculates readability scores for content quality assessment
 */

export interface ReadabilityMetrics {
  fleschKincaid: number; // Grade level (0-18+)
  fleschReadingEase: number; // 0-100 (higher = easier)
  avgSentenceLength: number;
  avgWordLength: number;
  avgParagraphLength: number;
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  totalParagraphs: number;
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  
  // Remove trailing e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  // Count vowel groups
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

/**
 * Split text into sentences
 */
function getSentences(text: string): string[] {
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Split on sentence boundaries
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Split text into paragraphs
 */
function getParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Get words from text (excluding code blocks)
 */
function getWords(text: string): string[] {
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove markdown syntax
  text = text.replace(/[#*_`\[\]()]/g, '');
  
  // Split into words
  return text
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0 && /[a-zA-Z]/.test(w));
}

/**
 * Calculate readability metrics for content
 */
export function calculateReadability(content: string): ReadabilityMetrics {
  const sentences = getSentences(content);
  const paragraphs = getParagraphs(content);
  const words = getWords(content);
  
  const totalSentences = sentences.length || 1;
  const totalWords = words.length || 1;
  const totalParagraphs = paragraphs.length || 1;
  
  // Calculate syllables
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Average metrics
  const avgSentenceLength = totalWords / totalSentences;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / totalWords;
  const avgParagraphLength = totalWords / totalParagraphs;
  
  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschReadingEase = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * avgSentenceLength - 84.6 * (totalSyllables / totalWords)
    )
  );
  
  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const fleschKincaid = Math.max(
    0,
    0.39 * avgSentenceLength + 11.8 * (totalSyllables / totalWords) - 15.59
  );
  
  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
    totalWords,
    totalSentences,
    totalSyllables,
    totalParagraphs,
  };
}

/**
 * Get readability score (0-10) based on Flesch Reading Ease
 */
export function getReadabilityScore(metrics: ReadabilityMetrics): number {
  const { fleschReadingEase } = metrics;
  
  // Target: 60-70 (Plain English, 8th-9th grade)
  // Score based on how close to target range
  if (fleschReadingEase >= 60 && fleschReadingEase <= 70) {
    return 10; // Perfect
  } else if (fleschReadingEase >= 50 && fleschReadingEase < 60) {
    return 8; // Good (fairly difficult)
  } else if (fleschReadingEase >= 70 && fleschReadingEase < 80) {
    return 8; // Good (fairly easy)
  } else if (fleschReadingEase >= 40 && fleschReadingEase < 50) {
    return 6; // Acceptable (difficult)
  } else if (fleschReadingEase >= 80 && fleschReadingEase < 90) {
    return 6; // Acceptable (easy)
  } else if (fleschReadingEase < 40) {
    return 4; // Too difficult (college level+)
  } else {
    return 4; // Too easy (5th grade or below)
  }
}

/**
 * Print readability report
 */
export function printReadabilityReport(metrics: ReadabilityMetrics): void {
  console.log(`\n📖 READABILITY METRICS:`);
  console.log(`   Flesch-Kincaid Grade: ${metrics.fleschKincaid} (target: 8-10)`);
  console.log(`   Flesch Reading Ease: ${metrics.fleschReadingEase}/100 (target: 60-70)`);
  console.log(`   Avg Sentence Length: ${metrics.avgSentenceLength} words`);
  console.log(`   Avg Word Length: ${metrics.avgWordLength} chars`);
  console.log(`   Avg Paragraph Length: ${metrics.avgParagraphLength} words`);
  console.log(`   Total: ${metrics.totalWords} words, ${metrics.totalSentences} sentences, ${metrics.totalParagraphs} paragraphs`);
  console.log(`   Readability Score: ${getReadabilityScore(metrics)}/10`);
}
