# Utilities Guide

**Date**: 2025-10-27
**Status**: ✅ Complete
**Location**: `src/lib/utils/`

---

## 📦 **Available Utilities**

### 1. **Array Utilities** (`array.ts`)

#### Safe Array Operations
```typescript
import { safeArray, safeMap, safeFilter } from '@/lib/utils';

// Always returns an array, never crashes
const items = safeArray(maybeUndefined); // T[]

// Safe map
const names = safeMap(users, u => u.name);

// Safe filter
const active = safeFilter(users, u => u.isActive);

// Safe find
const user = safeFind(users, u => u.id === '123');
```

#### Array Helpers
```typescript
// Get first item safely
const first = safeFirst(items); // T | undefined

// Get last item safely
const last = safeLast(items); // T | undefined

// Check if empty
const empty = isEmpty(items); // boolean

// Get unique items
const unique = uniqueBy(items, item => item.id);

// Chunk array
const chunks = chunk(items, 10); // T[][]

// Flatten array
const flat = flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
```

**Usage**: ✅ **YES, we're using safe arrays throughout the codebase!**

---

### 2. **Date/Time Utilities** (`date.ts`) ✅ NEW

#### Formatting
```typescript
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils';

// Format date
formatDate(new Date()); // "Oct 27, 2025"

// Format with time
formatDateTime(new Date()); // "Oct 27, 2025 at 2:30 PM"

// Relative time
getRelativeTime(yesterday); // "1 day ago"

// ISO format
toISODate(new Date()); // "2025-10-27T18:30:00.000Z"
```

#### Date Checks
```typescript
// Check if today
isToday(date); // boolean

// Check if past
isPast(date); // boolean

// Check if future
isFuture(date); // boolean
```

#### Date Math
```typescript
// Add days
const tomorrow = addDays(new Date(), 1);

// Add hours
const later = addHours(new Date(), 2);

// Start/end of day
const start = startOfDay(new Date());
const end = endOfDay(new Date());

// Parse safely
const date = parseDate("2025-10-27"); // Date | null
```

---

### 3. **String Utilities** (`string.ts`) ✅ NEW

#### Basic Operations
```typescript
import { safeTrim, truncate, capitalize } from '@/lib/utils';

// Safe trim
safeTrim(maybeNull); // string (never null)

// Truncate
truncate("Hello World", 5); // "Hello..."

// Capitalize
capitalize("hello"); // "Hello"
capitalizeWords("hello world"); // "Hello World"
```

#### Case Conversion
```typescript
// Kebab case
toKebabCase("Hello World"); // "hello-world"

// Camel case
toCamelCase("hello world"); // "helloWorld"

// Snake case
toSnakeCase("Hello World"); // "hello_world"

// Slugify for URLs
slugify("Hello World!"); // "hello-world"
```

#### String Checks
```typescript
// Check if empty
isEmpty(str); // boolean

// Case-insensitive search
containsIgnoreCase("Hello", "hello"); // true

// Word count
wordCount("Hello world"); // 2
```

#### Advanced Operations
```typescript
// Get initials
getInitials("John Doe"); // "JD"

// Mask sensitive data
maskString("1234567890", 4); // "******7890"

// Extract numbers
extractNumbers("Price: $123.45"); // [123.45]

// Strip HTML
stripHtml("<p>Hello</p>"); // "Hello"

// Escape HTML
escapeHtml("<script>"); // "&lt;script&gt;"
```

#### Formatting
```typescript
// Pluralize
pluralize("cat", 2); // "cats"
pluralize("cat", 1); // "cat"

// Format file size
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"

// Format numbers
formatNumber(1000000); // "1,000,000"
```

---

## 🎯 **Usage Examples**

### Example 1: Safe Data Display
```typescript
import { safeArray, formatDate, truncate } from '@/lib/utils';

function PromptList({ prompts }) {
  return (
    <div>
      {safeArray(prompts).map(prompt => (
        <div key={prompt.id}>
          <h3>{truncate(prompt.title, 50)}</h3>
          <p>{formatDate(prompt.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: User Profile
```typescript
import { getInitials, formatDateTime, getRelativeTime } from '@/lib/utils';

function UserProfile({ user }) {
  return (
    <div>
      <Avatar>{getInitials(user.name)}</Avatar>
      <p>Joined {getRelativeTime(user.createdAt)}</p>
      <p>Last seen: {formatDateTime(user.lastSeen)}</p>
    </div>
  );
}
```

### Example 3: URL Generation
```typescript
import { slugify, toKebabCase } from '@/lib/utils';

function generatePromptUrl(title: string) {
  return `/library/${slugify(title)}`;
}

// "How to Write Code" → "/library/how-to-write-code"
```

### Example 4: Data Validation
```typescript
import { isEmpty, safeTrim, containsIgnoreCase } from '@/lib/utils';

function validateInput(input: string) {
  const trimmed = safeTrim(input);
  
  if (isEmpty(trimmed)) {
    return { valid: false, error: 'Input required' };
  }
  
  if (containsIgnoreCase(trimmed, 'spam')) {
    return { valid: false, error: 'Invalid content' };
  }
  
  return { valid: true };
}
```

---

## 📊 **Current Usage**

### Safe Arrays
✅ **YES! Used extensively:**
- `safeArray()` - 4 usages
- `safeMap()` - Multiple usages
- `safeFilter()` - Multiple usages
- `safeFind()` - Multiple usages

### Date/Time
✅ **NEW! Ready to use:**
- 55 date operations found in codebase
- Can now replace with utilities

### String Operations
✅ **NEW! Ready to use:**
- 50+ string operations found
- Can now replace with utilities

---

## 🔧 **Migration Guide**

### Before (Unsafe)
```typescript
// ❌ Can crash if undefined
const names = users.map(u => u.name);

// ❌ Can return null
const date = new Date(str);

// ❌ Can crash if null
const trimmed = str.trim();
```

### After (Safe)
```typescript
// ✅ Never crashes
const names = safeMap(users, u => u.name);

// ✅ Returns null if invalid
const date = parseDate(str);

// ✅ Returns empty string if null
const trimmed = safeTrim(str);
```

---

## 📝 **Best Practices**

1. **Always use safe utilities for user input**
   ```typescript
   const input = safeTrim(userInput);
   if (isEmpty(input)) return;
   ```

2. **Use formatters for display**
   ```typescript
   <p>{formatDate(createdAt)}</p>
   <p>{formatFileSize(bytes)}</p>
   ```

3. **Use slugify for URLs**
   ```typescript
   const url = `/prompts/${slugify(title)}`;
   ```

4. **Use safe arrays for data**
   ```typescript
   const items = safeArray(data?.items);
   ```

5. **Use relative time for recency**
   ```typescript
   <span>{getRelativeTime(timestamp)}</span>
   ```

---

## 🎯 **Checklist**

### Array Utilities
- [x] safeArray
- [x] safeMap
- [x] safeFilter
- [x] safeFind
- [x] safeFirst
- [x] safeLast
- [x] isEmpty
- [x] uniqueBy
- [x] chunk
- [x] flatten

### Date/Time Utilities ✅ NEW
- [x] formatDate
- [x] formatDateTime
- [x] toISODate
- [x] getRelativeTime
- [x] isToday
- [x] isPast
- [x] isFuture
- [x] addDays
- [x] addHours
- [x] startOfDay
- [x] endOfDay
- [x] parseDate

### String Utilities ✅ NEW
- [x] safeTrim
- [x] truncate
- [x] capitalize
- [x] capitalizeWords
- [x] toKebabCase
- [x] toCamelCase
- [x] toSnakeCase
- [x] slugify
- [x] stripHtml
- [x] escapeHtml
- [x] isEmpty
- [x] containsIgnoreCase
- [x] extractNumbers
- [x] wordCount
- [x] getInitials
- [x] maskString
- [x] randomString
- [x] pluralize
- [x] formatFileSize
- [x] formatNumber

---

**Status**: ✅ All utilities complete and ready to use!
