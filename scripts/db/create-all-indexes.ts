#!/usr/bin/env tsx
/**
 * Comprehensive Index Creation Script
 * Creates all recommended indexes for optimal database performance
 *
 * Usage:
 *   pnpm exec tsx scripts/db/create-all-indexes.ts
 *
 * Options:
 *   --dry-run    Preview indexes without creating them
 *   --priority=HIGH|MEDIUM|LOW  Create only specific priority indexes
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

interface IndexSpec {
  collection: string;
  key: Record<string, number | string>;
  options: {
    name: string;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    expireAfterSeconds?: number;
    weights?: Record<string, number>;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

const INDEXES: IndexSpec[] = [
  // ========================================
  // HIGH PRIORITY - Critical Performance
  // ========================================

  // prompt_history - User history queries
  {
    collection: 'prompt_history',
    key: { userId: 1, createdAt: -1 },
    options: { name: 'idx_prompt_history_userId_createdAt', background: true },
    priority: 'HIGH',
    description: 'User prompt history with date sorting'
  },

  // prompt_collections - User collections
  {
    collection: 'prompt_collections',
    key: { userId: 1, updatedAt: -1 },
    options: { name: 'idx_prompt_collections_userId_updatedAt', background: true },
    priority: 'HIGH',
    description: 'User collections with update sorting'
  },
  {
    collection: 'prompt_collections',
    key: { userId: 1, originalPromptId: 1, title: 1 },
    options: { name: 'idx_prompt_collections_lookup', background: true },
    priority: 'HIGH',
    description: 'Duplicate check for customized prompts'
  },

  // users - Enhanced query indexes
  {
    collection: 'users',
    key: { role: 1 },
    options: { name: 'idx_users_role', background: true },
    priority: 'HIGH',
    description: 'User role filtering'
  },
  {
    collection: 'users',
    key: { plan: 1 },
    options: { name: 'idx_users_plan', background: true },
    priority: 'HIGH',
    description: 'Subscription plan filtering'
  },
  {
    collection: 'users',
    key: { createdAt: -1 },
    options: { name: 'idx_users_createdAt', background: true },
    priority: 'HIGH',
    description: 'Date-based user queries'
  },
  {
    collection: 'users',
    key: { lastLoginAt: -1 },
    options: { name: 'idx_users_lastLoginAt', background: true, sparse: true },
    priority: 'HIGH',
    description: 'Last login tracking'
  },
  {
    collection: 'users',
    key: { favoritePrompts: 1 },
    options: { name: 'idx_users_favoritePrompts', background: true, sparse: true },
    priority: 'HIGH',
    description: 'User favorites array queries'
  },

  // audit_logs - Enhanced security indexes
  {
    collection: 'audit_logs',
    key: { eventType: 1, timestamp: -1 },
    options: { name: 'idx_audit_logs_eventType_timestamp', background: true },
    priority: 'HIGH',
    description: 'Event type filtering with date sorting'
  },
  {
    collection: 'audit_logs',
    key: { eventCategory: 1, organizationId: 1, timestamp: -1 },
    options: { name: 'idx_audit_logs_category_org_timestamp', background: true, sparse: true },
    priority: 'HIGH',
    description: 'Organization-specific audit queries'
  },
  {
    collection: 'audit_logs',
    key: { resourceType: 1, resourceId: 1, timestamp: -1 },
    options: { name: 'idx_audit_logs_resource_timestamp', background: true, sparse: true },
    priority: 'HIGH',
    description: 'Resource audit tracking'
  },
  {
    collection: 'audit_logs',
    key: { createdAt: 1 },
    options: {
      name: 'idx_audit_logs_ttl',
      background: true,
      expireAfterSeconds: 31536000 // 365 days
    },
    priority: 'HIGH',
    description: 'TTL index for automatic audit log cleanup'
  },

  // ai_usage_logs - Usage tracking and rate limiting
  {
    collection: 'ai_usage_logs',
    key: { userId: 1, createdAt: -1 },
    options: { name: 'idx_ai_usage_logs_userId_createdAt', background: true },
    priority: 'HIGH',
    description: 'User usage history'
  },
  {
    collection: 'ai_usage_logs',
    key: { organizationId: 1, createdAt: -1 },
    options: { name: 'idx_ai_usage_logs_organizationId_createdAt', background: true, sparse: true },
    priority: 'HIGH',
    description: 'Organization usage tracking'
  },
  {
    collection: 'ai_usage_logs',
    key: { provider: 1, model: 1, createdAt: -1 },
    options: { name: 'idx_ai_usage_logs_provider_model', background: true },
    priority: 'HIGH',
    description: 'Provider/model usage analytics'
  },
  {
    collection: 'ai_usage_logs',
    key: { createdAt: 1 },
    options: {
      name: 'idx_ai_usage_logs_ttl',
      background: true,
      expireAfterSeconds: 7776000 // 90 days
    },
    priority: 'HIGH',
    description: 'TTL index for usage log cleanup'
  },

  // user_usage_quota - Rate limiting
  {
    collection: 'user_usage_quota',
    key: { userId: 1 },
    options: { name: 'idx_user_usage_quota_userId', unique: true, background: true },
    priority: 'HIGH',
    description: 'User quota lookup'
  },
  {
    collection: 'user_usage_quota',
    key: { periodEnd: 1 },
    options: { name: 'idx_user_usage_quota_periodEnd', background: true },
    priority: 'HIGH',
    description: 'Quota period cleanup'
  },
  {
    collection: 'user_usage_quota',
    key: { isBlocked: 1 },
    options: { name: 'idx_user_usage_quota_isBlocked', background: true, sparse: true },
    priority: 'HIGH',
    description: 'Blocked user queries'
  },

  // blocked_content - Security
  {
    collection: 'blocked_content',
    key: { contentHash: 1 },
    options: { name: 'idx_blocked_content_hash', unique: true, background: true },
    priority: 'HIGH',
    description: 'Fast malicious content detection'
  },
  {
    collection: 'blocked_content',
    key: { userId: 1, createdAt: -1 },
    options: { name: 'idx_blocked_content_userId', background: true },
    priority: 'HIGH',
    description: 'User abuse tracking'
  },
  {
    collection: 'blocked_content',
    key: { reason: 1, createdAt: -1 },
    options: { name: 'idx_blocked_content_reason', background: true },
    priority: 'HIGH',
    description: 'Block reason analytics'
  },

  // ========================================
  // MEDIUM PRIORITY - Feature Performance
  // ========================================

  // ai_models - Model registry
  {
    collection: 'ai_models',
    key: { provider: 1, status: 1 },
    options: { name: 'idx_ai_models_provider_status', background: true },
    priority: 'MEDIUM',
    description: 'Active models by provider'
  },
  {
    collection: 'ai_models',
    key: { isAllowed: 1, recommended: 1 },
    options: { name: 'idx_ai_models_allowed_recommended', background: true },
    priority: 'MEDIUM',
    description: 'Recommended model filtering'
  },
  {
    collection: 'ai_models',
    key: { slug: 1 },
    options: { name: 'idx_ai_models_slug', unique: true, background: true },
    priority: 'MEDIUM',
    description: 'SEO-friendly model lookup'
  },
  {
    collection: 'ai_models',
    key: { tags: 1 },
    options: { name: 'idx_ai_models_tags', background: true },
    priority: 'MEDIUM',
    description: 'Model tag filtering'
  },

  // ai_tools - Tool registry
  {
    collection: 'ai_tools',
    key: { slug: 1 },
    options: { name: 'idx_ai_tools_slug', unique: true, background: true },
    priority: 'MEDIUM',
    description: 'Tool URL lookup'
  },
  {
    collection: 'ai_tools',
    key: { category: 1, isActive: 1 },
    options: { name: 'idx_ai_tools_category_active', background: true },
    priority: 'MEDIUM',
    description: 'Active tools by category'
  },
  {
    collection: 'ai_tools',
    key: { tags: 1 },
    options: { name: 'idx_ai_tools_tags', background: true },
    priority: 'MEDIUM',
    description: 'Tool tag filtering'
  },

  // workflows - Workflow queries
  {
    collection: 'workflows',
    key: { category: 1, slug: 1 },
    options: { name: 'idx_workflows_category_slug', unique: true, background: true },
    priority: 'MEDIUM',
    description: 'Unique workflow lookup'
  },
  {
    collection: 'workflows',
    key: { status: 1 },
    options: { name: 'idx_workflows_status', background: true },
    priority: 'MEDIUM',
    description: 'Workflow status filtering'
  },
  {
    collection: 'workflows',
    key: { audience: 1 },
    options: { name: 'idx_workflows_audience', background: true },
    priority: 'MEDIUM',
    description: 'Audience-targeted workflows'
  },
  {
    collection: 'workflows',
    key: { title: 'text', problemStatement: 'text' },
    options: {
      name: 'idx_workflows_text_search',
      background: true,
      weights: { title: 10, problemStatement: 5 }
    },
    priority: 'MEDIUM',
    description: 'Workflow text search'
  },

  // patterns - Design pattern queries
  {
    collection: 'patterns',
    key: { slug: 1 },
    options: { name: 'idx_patterns_slug', unique: true, background: true },
    priority: 'MEDIUM',
    description: 'Pattern URL lookup'
  },
  {
    collection: 'patterns',
    key: { category: 1 },
    options: { name: 'idx_patterns_category', background: true },
    priority: 'MEDIUM',
    description: 'Pattern category filtering'
  },
  {
    collection: 'patterns',
    key: { isPublished: 1 },
    options: { name: 'idx_patterns_isPublished', background: true },
    priority: 'MEDIUM',
    description: 'Published patterns only'
  },

  // learning_content - Content management
  {
    collection: 'learning_content',
    key: { createdAt: -1 },
    options: { name: 'idx_learning_content_createdAt', background: true },
    priority: 'MEDIUM',
    description: 'Recent content sorting'
  },
  {
    collection: 'learning_content',
    key: { type: 1 },
    options: { name: 'idx_learning_content_type', background: true },
    priority: 'MEDIUM',
    description: 'Content type filtering'
  },
  {
    collection: 'learning_content',
    key: { isPublished: 1 },
    options: { name: 'idx_learning_content_isPublished', background: true },
    priority: 'MEDIUM',
    description: 'Published content filtering'
  },

  // organizations - Enhanced org queries
  {
    collection: 'organizations',
    key: { status: 1 },
    options: { name: 'idx_organizations_status', background: true },
    priority: 'MEDIUM',
    description: 'Organization status filtering'
  },
  {
    collection: 'organizations',
    key: { plan: 1, status: 1 },
    options: { name: 'idx_organizations_plan_status', background: true },
    priority: 'MEDIUM',
    description: 'Plan-based organization queries'
  },
  {
    collection: 'organizations',
    key: { 'sso.enabled': 1 },
    options: { name: 'idx_organizations_sso_enabled', background: true, sparse: true },
    priority: 'MEDIUM',
    description: 'SSO-enabled organizations'
  },

  // prompts - Enhanced compound indexes
  {
    collection: 'prompts',
    key: { active: 1, category: 1, role: 1 },
    options: { name: 'idx_prompts_active_category_role', background: true },
    priority: 'MEDIUM',
    description: 'Common filter combination'
  },
  {
    collection: 'prompts',
    key: { isPublic: 1, active: 1, isFeatured: 1, createdAt: -1 },
    options: { name: 'idx_prompts_public_active_featured', background: true },
    priority: 'MEDIUM',
    description: 'Homepage featured prompts'
  },
  {
    collection: 'prompts',
    key: { pattern: 1, active: 1, isPublic: 1 },
    options: { name: 'idx_prompts_pattern_active_public', background: true },
    priority: 'MEDIUM',
    description: 'Pattern-based prompt filtering'
  },
  {
    collection: 'prompts',
    key: { isPublic: 1, active: 1, 'stats.views': -1 },
    options: { name: 'idx_prompts_popular', background: true },
    priority: 'MEDIUM',
    description: 'Popular prompts sorting'
  },
  {
    collection: 'prompts',
    key: { isPublic: 1, active: 1, 'stats.averageRating': -1 },
    options: { name: 'idx_prompts_top_rated', background: true },
    priority: 'MEDIUM',
    description: 'Top-rated prompts sorting'
  },
];

async function createAllIndexes(options: {
  dryRun?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
} = {}) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('   Please set MONGODB_URI in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('engify');

    // Filter by priority if specified
    let indexesToCreate = INDEXES;
    if (options.priority) {
      indexesToCreate = INDEXES.filter(i => i.priority === options.priority);
      console.log(`🎯 Filtering to ${options.priority} priority indexes only\n`);
    }

    // Group indexes by priority
    const highPriority = indexesToCreate.filter(i => i.priority === 'HIGH');
    const mediumPriority = indexesToCreate.filter(i => i.priority === 'MEDIUM');
    const lowPriority = indexesToCreate.filter(i => i.priority === 'LOW');

    console.log(`📊 Total indexes to create: ${indexesToCreate.length}`);
    console.log(`   HIGH: ${highPriority.length}, MEDIUM: ${mediumPriority.length}, LOW: ${lowPriority.length}`);

    if (options.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No indexes will be created\n');
      await previewIndexes(highPriority, 'HIGH PRIORITY');
      await previewIndexes(mediumPriority, 'MEDIUM PRIORITY');
      await previewIndexes(lowPriority, 'LOW PRIORITY');
      return;
    }

    // Create indexes by priority
    await createIndexBatch(db, highPriority, 'HIGH PRIORITY');
    await createIndexBatch(db, mediumPriority, 'MEDIUM PRIORITY');
    await createIndexBatch(db, lowPriority, 'LOW PRIORITY');

    console.log('\n✅ All indexes created successfully!');

    // Print summary
    await printIndexSummary(db);

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

async function createIndexBatch(db: any, indexes: IndexSpec[], label: string) {
  if (indexes.length === 0) return;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label} (${indexes.length} indexes)`);
  console.log('='.repeat(60));

  let created = 0;
  let exists = 0;
  let failed = 0;

  for (const indexSpec of indexes) {
    try {
      const collection = db.collection(indexSpec.collection);
      await collection.createIndex(indexSpec.key, indexSpec.options);
      console.log(`✅ ${indexSpec.collection}.${indexSpec.options.name}`);
      console.log(`   ${indexSpec.description}`);
      created++;
    } catch (error: any) {
      if (error.code === 85 || error.code === 86) {
        console.log(`ℹ️  ${indexSpec.collection}.${indexSpec.options.name} (already exists)`);
        exists++;
      } else {
        console.error(`❌ ${indexSpec.collection}.${indexSpec.options.name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n📈 Batch Results: ${created} created, ${exists} existing, ${failed} failed`);
}

async function previewIndexes(indexes: IndexSpec[], label: string) {
  if (indexes.length === 0) return;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label} (${indexes.length} indexes)`);
  console.log('='.repeat(60));

  for (const indexSpec of indexes) {
    console.log(`\n📋 ${indexSpec.collection}.${indexSpec.options.name}`);
    console.log(`   Description: ${indexSpec.description}`);
    console.log(`   Key: ${JSON.stringify(indexSpec.key)}`);
    console.log(`   Options: ${JSON.stringify(indexSpec.options, null, 2).split('\n').join('\n   ')}`);
  }
}

async function printIndexSummary(db: any) {
  console.log('\n' + '='.repeat(60));
  console.log('INDEX SUMMARY BY COLLECTION');
  console.log('='.repeat(60));

  const collections = [...new Set(INDEXES.map(i => i.collection))].sort();

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    try {
      const indexes = await collection.listIndexes().toArray();
      console.log(`\n📁 ${collectionName} (${indexes.length} indexes):`);
      indexes.forEach((idx: any) => {
        const keyStr = JSON.stringify(idx.key);
        const unique = idx.unique ? ' [UNIQUE]' : '';
        const ttl = idx.expireAfterSeconds ? ` [TTL: ${idx.expireAfterSeconds}s]` : '';
        console.log(`   - ${idx.name}: ${keyStr}${unique}${ttl}`);
      });
    } catch (error) {
      console.log(`   Collection does not exist yet`);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: {
  dryRun?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
} = {};

args.forEach(arg => {
  if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg.startsWith('--priority=')) {
    const priority = arg.split('=')[1].toUpperCase();
    if (['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      options.priority = priority as 'HIGH' | 'MEDIUM' | 'LOW';
    } else {
      console.error(`❌ Invalid priority: ${priority}. Use HIGH, MEDIUM, or LOW`);
      process.exit(1);
    }
  }
});

// Display usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: pnpm exec tsx scripts/db/create-all-indexes.ts [OPTIONS]

Options:
  --dry-run              Preview indexes without creating them
  --priority=LEVEL       Create only HIGH, MEDIUM, or LOW priority indexes
  --help, -h             Show this help message

Examples:
  pnpm exec tsx scripts/db/create-all-indexes.ts
  pnpm exec tsx scripts/db/create-all-indexes.ts --dry-run
  pnpm exec tsx scripts/db/create-all-indexes.ts --priority=HIGH
  `);
  process.exit(0);
}

// Run the script
createAllIndexes(options).catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
