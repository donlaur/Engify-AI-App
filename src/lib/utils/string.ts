/**
 * String Utilities
 * Safe and consistent string handling across the app
 */

/**
 * Safely trim string
 */
export function safeTrim(str: string | null | undefined): string {
  return str?.trim() || '';
}

/**
 * Truncate string with ellipsis
 * @example truncate("Hello World", 5) // "Hello..."
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength) + suffix;
}

/**
 * Capitalize first letter
 * @example capitalize("hello") // "Hello"
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 * @example capitalizeWords("hello world") // "Hello World"
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert to kebab-case
 * @example toKebabCase("Hello World") // "hello-world"
 */
export function toKebabCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Convert to camelCase
 * @example toCamelCase("hello world") // "helloWorld"
 */
export function toCamelCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Convert to snake_case
 * @example toSnakeCase("Hello World") // "hello_world"
 */
export function toSnakeCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Slugify string for URLs
 * @example slugify("Hello World!") // "hello-world"
 */
export function slugify(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove HTML tags
 * @example stripHtml("<p>Hello</p>") // "Hello"
 */
export function stripHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if string contains substring (case-insensitive)
 */
export function containsIgnoreCase(
  str: string | null | undefined,
  search: string | null | undefined
): boolean {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Extract numbers from string
 * @example extractNumbers("Price: $123.45") // [123.45]
 */
export function extractNumbers(str: string | null | undefined): number[] {
  if (!str) return [];
  const matches = str.match(/-?\d+\.?\d*/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Count words in string
 */
export function wordCount(str: string | null | undefined): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Get initials from name
 * @example getInitials("John Doe") // "JD"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Mask sensitive string
 * @example maskString("1234567890", 4) // "******7890"
 */
export function maskString(
  str: string | null | undefined,
  visibleChars = 4,
  maskChar = '*'
): string {
  if (!str) return '';
  if (str.length <= visibleChars) return str;
  
  const masked = maskChar.repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
}

/**
 * Generate random string
 */
export function randomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Pluralize word
 * @example pluralize("cat", 2) // "cats"
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || word + 's';
}

/**
 * Format file size
 * @example formatFileSize(1024) // "1 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format number with commas
 * @example formatNumber(1000000) // "1,000,000"
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
