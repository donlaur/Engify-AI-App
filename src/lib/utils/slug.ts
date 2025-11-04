/**
 * Slug generation and normalization utilities
 * 
 * IMPORTANT: Slugs should NOT include IDs or record identifiers
 * Clean slugs improve SEO and don't expose internal structure
 * Example: "unit-test-generator" (good) vs "unit-test-generator-test-001" (bad)
 */

/**
 * Generate a URL-friendly slug from a string
 * 
 * Rules:
 * - Lowercase
 * - Remove special characters
 * - Replace spaces/underscores with hyphens
 * - Remove leading/trailing hyphens
 * - Max length: 60 characters (for SEO)
 * 
 * @param text - The text to convert to a slug
 * @returns A clean, URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }
  
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Limit length for SEO (60 chars is optimal for URLs)
  if (slug.length > 60) {
    slug = slug.substring(0, 60);
    // Remove trailing hyphen if truncated
    slug = slug.replace(/-+$/, '');
  }
  
  return slug || 'untitled';
}

/**
 * Generate a unique slug from a title
 * Handles duplicates by appending numeric suffix (not ID)
 * 
 * @param title - The title to convert to a slug
 * @param existingSlugs - Set of existing slugs to check for uniqueness
 * @returns A unique slug
 * 
 * @example
 * generateUniqueSlug("Unit Test Generator", new Set()) 
 * // => "unit-test-generator"
 * 
 * generateUniqueSlug("Unit Test Generator", new Set(["unit-test-generator"]))
 * // => "unit-test-generator-2"
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: Set<string> = new Set()
): string {
  const baseSlug = generateSlug(title);
  
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }
  
  // Append numeric suffix if duplicate (not ID)
  let suffix = 2;
  let uniqueSlug = `${baseSlug}-${suffix}`;
  
  while (existingSlugs.has(uniqueSlug)) {
    suffix++;
    uniqueSlug = `${baseSlug}-${suffix}`;
  }
  
  return uniqueSlug;
}

/**
 * Get slug from prompt title or use existing slug
 * 
 * IMPORTANT: This function does NOT append IDs
 * Slugs should be clean and human-readable
 */
export function getPromptSlug(prompt: { title?: string; slug?: string | null; id?: string }): string {
  if (prompt.slug && typeof prompt.slug === 'string') {
    return prompt.slug;
  }
  if (prompt.title && typeof prompt.title === 'string') {
    return generateSlug(prompt.title);
  }
  // Fallback to ID if title is missing (shouldn't happen in production)
  return prompt.id || 'untitled';
}

