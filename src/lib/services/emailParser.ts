/**
 * Email Parser Service
 *
 * Parses inbound emails for AI content generation, help requests, etc.
 * Processes emails queued via SendGrid webhooks + QStash
 */

export interface ParsedEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: Date;
  metadata?: {
    messageId?: string;
    replyTo?: string;
    categories?: string[];
  };
}

export interface EmailContent {
  type: 'help_request' | 'article_suggestion' | 'feedback' | 'unknown';
  priority: 'high' | 'medium' | 'low';
  summary: string;
  originalText: string;
  extractedData?: {
    topic?: string;
    category?: string;
    urgency?: string;
  };
}

/**
 * Parse email content to determine type and extract relevant information
 */
export function parseEmailContent(email: ParsedEmail): EmailContent {
  const text = email.text.toLowerCase();
  const subject = email.subject.toLowerCase();

  // Help request patterns
  const helpPatterns = [
    /help/i,
    /support/i,
    /question/i,
    /how do i/i,
    /trouble/i,
    /problem/i,
    /issue/i,
    /error/i,
  ];

  // Article suggestion patterns
  const articlePatterns = [
    /article/i,
    /write about/i,
    /content/i,
    /blog/i,
    /tutorial/i,
    /guide/i,
  ];

  // Feedback patterns
  const feedbackPatterns = [
    /feedback/i,
    /suggestion/i,
    /improve/i,
    /better/i,
    /feature/i,
    /idea/i,
  ];

  // Determine email type
  let type: EmailContent['type'] = 'unknown';
  let priority: EmailContent['priority'] = 'low';

  if (
    helpPatterns.some((pattern) => pattern.test(text) || pattern.test(subject))
  ) {
    type = 'help_request';
    priority =
      text.includes('urgent') || text.includes('critical') ? 'high' : 'medium';
  } else if (
    articlePatterns.some(
      (pattern) => pattern.test(text) || pattern.test(subject)
    )
  ) {
    type = 'article_suggestion';
    priority = 'medium';
  } else if (
    feedbackPatterns.some(
      (pattern) => pattern.test(text) || pattern.test(subject)
    )
  ) {
    type = 'feedback';
    priority = 'low';
  }

  // Extract topic/category from subject or first paragraph
  // split('\n\n') can return empty array, so we check length
  const paragraphs = text.split('\n\n');
  const firstParagraph =
    paragraphs.length >= 1 ? paragraphs[0] : text.substring(0, 200);
  const topicMatch = subject.match(/(?:about|re:|topic:)\s*(.+)/i);
  const topic =
    topicMatch && topicMatch.length > 1 ? topicMatch[1].trim() : undefined;

  // Generate summary
  const summary =
    firstParagraph.length > 200
      ? `${firstParagraph.substring(0, 197)}...`
      : firstParagraph;

  return {
    type,
    priority,
    summary,
    originalText: email.text,
    extractedData: {
      topic,
      category: type,
      urgency:
        priority === 'high'
          ? 'urgent'
          : priority === 'medium'
            ? 'normal'
            : 'low',
    },
  };
}

/**
 * Generate AI article suggestion from email
 */
export function generateArticleSuggestion(email: ParsedEmail): {
  title: string;
  description: string;
  suggestedContent: string[];
} {
  const content = parseEmailContent(email);

  // Extract key topics from email
  const keywords = extractKeywords(email.text);

  const title =
    content.extractedData?.topic || email.subject || 'AI Engineering Topic';
  const description = content.summary;

  // Generate suggested content sections based on email content
  const firstKeyword = keywords.length > 0 ? keywords[0] : 'the topic';
  const suggestedContent = [
    'Introduction and context',
    `Explanation of ${firstKeyword}`,
    'Best practices and examples',
    'Common pitfalls to avoid',
    'Summary and next steps',
  ];

  return {
    title,
    description,
    suggestedContent,
  };
}

/**
 * Extract keywords from email text
 */
function extractKeywords(text: string, maxKeywords = 5): string[] {
  // Simple keyword extraction (in production, use NLP library)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const wordCounts = new Map<string, number>();
  words.forEach((word) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  const stopWords = new Set([
    'this',
    'that',
    'with',
    'from',
    'about',
    'their',
    'would',
    'there',
    'these',
    'email',
    'message',
  ]);

  return Array.from(wordCounts.entries())
    .filter(([word]) => !stopWords.has(word))
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Queue email for AI processing
 */
export interface EmailProcessingJob {
  emailId: string;
  email: ParsedEmail;
  contentType: EmailContent['type'];
  priority: EmailContent['priority'];
}

export function createEmailProcessingJob(
  email: ParsedEmail,
  emailId: string
): EmailProcessingJob {
  const content = parseEmailContent(email);

  return {
    emailId,
    email,
    contentType: content.type,
    priority: content.priority,
  };
}
