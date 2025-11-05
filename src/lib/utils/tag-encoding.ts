/**
 * Tag URL encoding and normalization utilities
 * 
 * Handles special characters in tags for URL-safe encoding/decoding
 * Ensures consistent matching between URLs and database tags
 */

/**
 * Normalize tag for database lookup
 * - Converts to lowercase
 * - Handles special characters consistently
 * - Replaces problematic characters with safe alternatives
 */
export function normalizeTagForDb(tag: string): string {
  if (!tag || typeof tag !== 'string') {
    return '';
  }
  
  return tag
    .toLowerCase()
    .trim()
    // Replace common special characters with hyphens
    .replace(/[\/\\]/g, '-')      // Forward/back slashes
    .replace(/[^\w\s-]/g, '')      // Remove other special chars
    .replace(/[\s_-]+/g, '-')      // Multiple spaces/hyphens to single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Normalize tag for URL (slug-safe)
 * - URL-encodes special characters
 * - Handles edge cases
 */
export function normalizeTagForUrl(tag: string): string {
  if (!tag || typeof tag !== 'string') {
    return '';
  }
  
  // First normalize, then encode
  const normalized = normalizeTagForDb(tag);
  
  // If normalization removed everything, use original tag (encoded)
  if (!normalized && tag) {
    return encodeURIComponent(tag);
  }
  
  return encodeURIComponent(normalized);
}

/**
 * Decode and normalize tag from URL
 * Handles URL-encoded tags and normalizes them for database lookup
 */
export function decodeTagFromUrl(urlTag: string): {
  decoded: string;
  normalized: string;
  original: string;
} {
  try {
    // Decode URL-encoded tag
    const decoded = decodeURIComponent(urlTag);
    
    // Normalize for database lookup
    const normalized = normalizeTagForDb(decoded);
    
    return {
      decoded,
      normalized,
      original: urlTag,
    };
  } catch (error) {
    // If decoding fails (malformed URL), return safe fallback
    console.warn('Failed to decode tag from URL', { urlTag, error });
    return {
      decoded: urlTag,
      normalized: normalizeTagForDb(urlTag),
      original: urlTag,
    };
  }
}

/**
 * Get all possible tag variations for database lookup
 * Returns array of tag strings to try when querying database
 */
export function getTagVariations(urlTag: string): string[] {
  const { decoded, normalized } = decodeTagFromUrl(urlTag);
  
  const variations: string[] = [];
  
  // Add decoded tag (original case)
  if (decoded) {
    variations.push(decoded);
  }
  
  // Add lowercase version
  if (decoded.toLowerCase() !== decoded) {
    variations.push(decoded.toLowerCase());
  }
  
  // Add normalized version
  if (normalized && normalized !== decoded && normalized !== decoded.toLowerCase()) {
    variations.push(normalized);
  }
  
  // Add original URL tag (if it's different)
  if (urlTag !== decoded && urlTag !== normalized) {
    variations.push(normalizeTagForDb(urlTag));
  }
  
  // Remove duplicates
  return Array.from(new Set(variations.filter(Boolean)));
}

/**
 * Validate tag URL format
 * Checks if a tag URL segment is valid
 */
export function isValidTagUrl(tag: string): boolean {
  if (!tag || typeof tag !== 'string') {
    return false;
  }
  
  try {
    // Try to decode
    const decoded = decodeURIComponent(tag);
    
    // Check if decoded tag is reasonable
    if (decoded.length === 0 || decoded.length > 100) {
      return false;
    }
    
    return true;
  } catch {
    // Invalid URL encoding
    return false;
  }
}

