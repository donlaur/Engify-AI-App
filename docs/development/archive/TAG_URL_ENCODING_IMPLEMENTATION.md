# Tag URL Encoding Implementation

## Summary

Implemented comprehensive tag URL encoding/decoding utilities to handle special characters in tags and ensure consistent matching between URLs and database tags.

## Problem

Tags with special characters (e.g., `CI/CD integration`, `C++`) could cause URL encoding issues:
- URLs like `/tags/ci%2fcd-integration` might not match database tags
- Only `/` was being normalized, other special characters could still break URLs
- Case sensitivity issues between URL-encoded tags and database tags

## Solution

Created a comprehensive tag encoding utility (`src/lib/utils/tag-encoding.ts`) with:

1. **`normalizeTagForDb()`** - Normalizes tags for database lookup
   - Converts to lowercase
   - Handles all special characters (not just `/`)
   - Replaces problematic characters with safe alternatives

2. **`decodeTagFromUrl()`** - Safely decodes and normalizes tags from URLs
   - Handles URL-encoded tags
   - Returns decoded, normalized, and original versions
   - Graceful error handling for malformed URLs

3. **`getTagVariations()`** - Returns all possible tag variations for database lookup
   - Tries decoded tag (original case)
   - Tries lowercase version
   - Tries normalized version
   - Removes duplicates

4. **`isValidTagUrl()`** - Validates tag URL format
   - Checks if tag can be decoded
   - Validates length and format

## Implementation

### Tag Page (`src/app/tags/[tag]/page.tsx`)

Updated to use the new encoding utilities:

1. **URL Validation**: Validates tag URL format before processing
2. **Multiple Variations**: Tries all tag variations when querying database
3. **Consistent Normalization**: Uses normalized tag for canonical URLs
4. **Error Handling**: Gracefully handles malformed URLs

### Features

- ✅ Handles tags with special characters (`CI/CD`, `C++`, etc.)
- ✅ Matches database tags regardless of URL encoding
- ✅ Prevents 404s from encoding mismatches
- ✅ Consistent canonical URLs (normalized format)
- ✅ Better error handling for malformed URLs

## Example Usage

```typescript
// Tag: "CI/CD integration"
// URL: /tags/ci%2fcd-integration

const { decoded, normalized } = decodeTagFromUrl('ci%2fcd-integration');
// decoded: "ci/cd-integration"
// normalized: "ci-cd-integration"

const variations = getTagVariations('ci%2fcd-integration');
// ["ci/cd-integration", "ci/cd-integration", "ci-cd-integration"]
```

## Testing

To test tag encoding:
1. Visit `/tags/CI%2FCD-integration` (URL-encoded)
2. Should find prompts tagged with "CI/CD integration"
3. Should display as "Ci Cd Integration" (title case)
4. Canonical URL should be normalized: `/tags/ci-cd-integration`

## Files Modified

- `src/lib/utils/tag-encoding.ts` - New utility file
- `src/app/tags/[tag]/page.tsx` - Updated to use new utilities
- `docs/security/RED_HAT_REVIEW_2025-11-05.md` - Marked issue as fixed

## Related Issues

- Resolves security review issue #7 from RED_HAT_REVIEW_2025-11-05.md
- Part of overall URL encoding and SEO improvements

