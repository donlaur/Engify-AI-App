/**
 * Slug generation and normalization utilities
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') || 'untitled'; // Remove leading/trailing hyphens, fallback to 'untitled'
}

/**
 * Get slug from prompt title or use existing slug
 */
export function getPromptSlug(prompt: { title?: string; slug?: string | null; id?: string }): string {
  if (prompt.slug && typeof prompt.slug === 'string') {
    return prompt.slug;
  }
  if (prompt.title && typeof prompt.title === 'string') {
    return generateSlug(prompt.title);
  }
  // Fallback to ID if title is missing
  return prompt.id || 'untitled';
}

