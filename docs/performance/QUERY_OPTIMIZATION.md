# Query Optimization Patterns

Comprehensive guide to optimizing MongoDB queries in the Engify AI App.

## Overview

Query optimization is critical for application performance. This guide covers:
- Index strategies
- Query patterns
- Common anti-patterns
- Optimization techniques
- Real-world examples

## Index Fundamentals

### Types of Indexes

#### 1. Single Field Index

```typescript
// Create single field index
await collection.createIndex({ category: 1 });

// Used by queries that filter on category
await collection.find({ category: 'prompt-engineering' });
```

#### 2. Compound Index

```typescript
// Create compound index
await collection.createIndex({ category: 1, active: 1, createdAt: -1 });

// Used by queries that filter on prefix fields
await collection.find({ category: 'prompt-engineering', active: true })
  .sort({ createdAt: -1 });

// ⚠️ Not used: different order
await collection.find({ active: true, category: 'prompt-engineering' });
```

#### 3. Text Index

```typescript
// Create text index
await collection.createIndex({ title: 'text', description: 'text' });

// Used for text search
await collection.find({ $text: { $search: 'chatgpt prompt' } });
```

#### 4. Multikey Index

```typescript
// Automatically created for arrays
await collection.createIndex({ tags: 1 });

// Used when querying array fields
await collection.find({ tags: 'ai' });
await collection.find({ tags: { $in: ['ai', 'chatgpt'] } });
```

### Index Guidelines

#### ESR Rule

**E**quality, **S**ort, **R**ange - order fields in compound indexes:

```typescript
// ✅ Good: Equality, Sort, Range
await collection.createIndex({
  category: 1,      // E: Equality filter
  createdAt: -1,    // S: Sort field
  favorites: 1,     // R: Range query
});

// Efficient query
await collection
  .find({
    category: 'prompt-engineering',  // Equality
    favorites: { $gt: 10 },          // Range
  })
  .sort({ createdAt: -1 });          // Sort
```

#### Index Selectivity

Create indexes on fields with high selectivity:

```typescript
// ✅ High selectivity: email (unique)
await collection.createIndex({ email: 1 }, { unique: true });

// ✅ Good selectivity: category (10-20 values)
await collection.createIndex({ category: 1 });

// ❌ Poor selectivity: active (true/false)
// Don't create standalone index on boolean fields
```

## Query Optimization Patterns

### Pattern 1: Covered Query

Query can be satisfied entirely by index:

```typescript
// Create index with all needed fields
await collection.createIndex({
  category: 1,
  title: 1,
  createdAt: 1,
});

// Covered query - no document fetch needed
await collection.find(
  { category: 'prompt-engineering' },
  { projection: { _id: 0, title: 1, createdAt: 1 } }
);
```

### Pattern 2: Index Intersection

Use multiple indexes together:

```typescript
// Two indexes
await collection.createIndex({ category: 1 });
await collection.createIndex({ favorites: 1 });

// MongoDB can use both indexes
await collection.find({
  category: 'prompt-engineering',
  favorites: { $gt: 100 },
});

// ✅ Better: Single compound index
await collection.createIndex({ category: 1, favorites: 1 });
```

### Pattern 3: Partial Index

Index only documents matching a filter:

```typescript
// Only index active prompts
await collection.createIndex(
  { category: 1, createdAt: -1 },
  {
    partialFilterExpression: { active: true },
    name: 'active_prompts_idx',
  }
);

// Query must include the filter
await collection.find({
  category: 'prompt-engineering',
  active: true, // Required for index use
});
```

### Pattern 4: Sparse Index

Index only documents with the field:

```typescript
// Only index documents with featured field
await collection.createIndex(
  { featured: 1 },
  { sparse: true }
);

// Efficient for optional fields
await collection.find({ featured: true });
```

## Common Anti-Patterns

### 1. Collection Scan

```typescript
// ❌ Bad: No index
await collection.find({ category: 'prompt-engineering' });

// ✅ Good: Create index
await collection.createIndex({ category: 1 });
await collection.find({ category: 'prompt-engineering' });
```

### 2. Regex Without Anchor

```typescript
// ❌ Bad: Can't use index
await collection.find({ title: /chatgpt/ });

// ✅ Good: Anchored regex can use index
await collection.find({ title: /^chatgpt/ });

// ✅ Better: Use text search
await collection.createIndex({ title: 'text' });
await collection.find({ $text: { $search: 'chatgpt' } });
```

### 3. $ne and $nin

```typescript
// ❌ Bad: Can't efficiently use index
await collection.find({ category: { $ne: 'archived' } });

// ✅ Good: Use $in with explicit values
await collection.find({
  category: { $in: ['prompt-engineering', 'ai-models', ...] }
});
```

### 4. Sorting Without Index

```typescript
// ❌ Bad: In-memory sort (32MB limit)
await collection.find({}).sort({ createdAt: -1 });

// ✅ Good: Index supports sort
await collection.createIndex({ createdAt: -1 });
await collection.find({}).sort({ createdAt: -1 });
```

### 5. Fetching All Documents

```typescript
// ❌ Bad: Fetches everything
const allDocs = await collection.find({}).toArray();

// ✅ Good: Use pagination
const page1 = await collection.find({}).limit(20).toArray();

// ✅ Better: Cursor-based pagination
const page1 = await collection
  .find({ _id: { $gt: lastId } })
  .limit(20)
  .toArray();
```

## Optimization Techniques

### 1. Projection

Fetch only needed fields:

```typescript
// ❌ Bad: Fetch all fields
const prompts = await collection.find({}).toArray();

// ✅ Good: Project only needed fields
const prompts = await collection
  .find({})
  .project({ title: 1, category: 1, _id: 0 })
  .toArray();
```

### 2. Lean Queries

In Mongoose, use lean() to get plain objects:

```typescript
// ❌ Bad: Mongoose document (overhead)
const prompts = await Prompt.find({});

// ✅ Good: Plain objects (faster)
const prompts = await Prompt.find({}).lean();
```

### 3. Aggregation Pipeline

Use aggregation for complex queries:

```typescript
// ✅ Efficient aggregation
const stats = await collection.aggregate([
  { $match: { active: true } },
  { $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgFavorites: { $avg: '$favorites' },
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 },
]).toArray();
```

### 4. Bulk Operations

Use bulk operations for multiple writes:

```typescript
// ❌ Bad: Individual updates
for (const prompt of prompts) {
  await collection.updateOne(
    { _id: prompt._id },
    { $inc: { views: 1 } }
  );
}

// ✅ Good: Bulk update
const bulkOps = prompts.map(prompt => ({
  updateOne: {
    filter: { _id: prompt._id },
    update: { $inc: { views: 1 } },
  },
}));
await collection.bulkWrite(bulkOps);
```

## Real-World Examples

### Prompts Collection

#### Schema

```typescript
interface Prompt {
  _id: ObjectId;
  title: string;
  description: string;
  content: string;
  category: string;
  pattern: string;
  tags: string[];
  active: boolean;
  featured: boolean;
  favorites: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Recommended Indexes

```typescript
// 1. Category browsing
await collection.createIndex({
  category: 1,
  active: 1,
  createdAt: -1,
}, {
  name: 'category_active_createdAt_idx',
  background: true,
});

// 2. Pattern filtering
await collection.createIndex({
  pattern: 1,
  active: 1,
}, {
  name: 'pattern_active_idx',
  background: true,
});

// 3. Popular prompts
await collection.createIndex({
  active: 1,
  favorites: -1,
}, {
  name: 'active_favorites_idx',
  background: true,
});

// 4. Text search
await collection.createIndex({
  title: 'text',
  description: 'text',
  tags: 'text',
}, {
  name: 'text_search_idx',
  background: true,
});

// 5. Featured prompts (sparse)
await collection.createIndex({
  featured: 1,
  createdAt: -1,
}, {
  sparse: true,
  name: 'featured_idx',
  background: true,
});

// 6. Unique constraint
await collection.createIndex({
  slug: 1,
}, {
  unique: true,
  name: 'slug_unique_idx',
  background: true,
});
```

#### Common Queries

```typescript
// Query 1: Browse by category
await collection
  .find({ category: 'prompt-engineering', active: true })
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();
// Uses: category_active_createdAt_idx

// Query 2: Search prompts
await collection
  .find({ $text: { $search: 'chatgpt prompt' }, active: true })
  .sort({ score: { $meta: 'textScore' } })
  .toArray();
// Uses: text_search_idx

// Query 3: Popular prompts
await collection
  .find({ active: true })
  .sort({ favorites: -1 })
  .limit(10)
  .toArray();
// Uses: active_favorites_idx

// Query 4: Pattern-based
await collection
  .find({ pattern: 'persona', active: true })
  .toArray();
// Uses: pattern_active_idx
```

### Users Collection

#### Schema

```typescript
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin: Date;
  createdAt: Date;
}
```

#### Recommended Indexes

```typescript
// 1. Email lookup (authentication)
await collection.createIndex({
  email: 1,
}, {
  unique: true,
  name: 'email_unique_idx',
});

// 2. Role-based queries
await collection.createIndex({
  role: 1,
  active: 1,
}, {
  name: 'role_active_idx',
});

// 3. Recent logins
await collection.createIndex({
  active: 1,
  lastLogin: -1,
}, {
  name: 'active_lastLogin_idx',
});
```

## Performance Testing

### Analyze Query Performance

```typescript
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

const optimizer = new QueryOptimizer();
const collection = db.collection('prompts');

// Analyze a query
const analysis = await optimizer.analyzeQuery(
  collection,
  { category: 'prompt-engineering', active: true },
  { sort: { createdAt: -1 } }
);

optimizer.printReport(analysis);
/*
=== Query Analysis Report ===
Collection: prompts
Query: {"category":"prompt-engineering","active":true}
Execution Time: 15ms
Documents Examined: 20
Documents Returned: 20
Index Used: category_active_createdAt_idx
Stage: IXSCAN
Performance Score: 100/100
*/
```

### Get Index Recommendations

```typescript
// Get recommendations for a collection
const recommendations = await optimizer.suggestIndexes('prompts');

console.log(recommendations);
/*
[
  {
    collection: 'prompts',
    keys: { category: 1, active: 1, createdAt: -1 },
    reason: 'Common query pattern: category + active filter with time sorting',
    impact: 'high',
    estimatedImprovement: 'Speeds up category browsing by 5-10x'
  },
  ...
]
*/
```

### Create Indexes

```typescript
// Dry run - see what would be created
await optimizer.createRecommendedIndexes(
  'prompts',
  recommendations,
  true // dry run
);

// Actually create indexes
await optimizer.createRecommendedIndexes(
  'prompts',
  recommendations,
  false
);
```

## Monitoring

### Track Slow Queries

```typescript
import { QueryMonitor } from '@/lib/performance/query-monitor';

const monitor = new QueryMonitor({
  slowQueryTime: 100, // Log queries > 100ms
});

// Monitor queries
const { result, metrics } = await monitor.monitorFind(
  collection,
  { category: 'prompt-engineering' }
);

// Get slow queries
const slowQueries = monitor.getSlowQueries();

// Print report
monitor.printReport();
```

### Performance Budgets

Set performance budgets for queries:

```typescript
const monitor = new QueryMonitor({
  slowQueryTime: 100,
  warnQueryTime: 50,
  maxDocsScanned: 1000,
  minIndexSelectivity: 0.5,
});

// Violations will be logged automatically
```

## Tools and Commands

### Explain Plans

```typescript
// Get execution statistics
const explain = await collection
  .find({ category: 'prompt-engineering' })
  .explain('executionStats');

console.log(explain.executionStats);
/*
{
  executionTimeMillis: 15,
  totalKeysExamined: 20,
  totalDocsExamined: 20,
  nReturned: 20,
  executionStages: {
    stage: 'IXSCAN', // Index scan (good!)
    indexName: 'category_active_idx'
  }
}
*/
```

### List Indexes

```typescript
// Get all indexes for a collection
const indexes = await collection.indexes();
console.log(indexes);
```

### Index Statistics

```typescript
// Get index usage statistics
const stats = await collection.aggregate([
  { $indexStats: {} }
]).toArray();

console.log(stats);
// Shows which indexes are being used
```

## Resources

- [MongoDB Index Strategies](https://docs.mongodb.com/manual/applications/indexes/)
- [Compound Index Optimization](https://docs.mongodb.com/manual/core/index-compound/)
- [Text Search](https://docs.mongodb.com/manual/text-search/)
- [Aggregation Pipeline Optimization](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/)
