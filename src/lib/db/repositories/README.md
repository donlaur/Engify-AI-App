/**
 * Unified Content Repository System Documentation
 * 
 * Enterprise-compliant content retrieval system following DRY principles
 * 
 * Location: src/lib/db/repositories/
 * 
 * Architecture:
 * - BaseRepository: MongoDB connection & common operations
 * - Specific Repositories: PromptRepository, PatternRepository, LearningResourceRepository
 * - ContentService: Unified interface for all content types
 * 
 * Enterprise Compliance:
 * ✅ Single MongoDB connection (singleton pattern)
 * ✅ Proper error handling with logger
 * ✅ Follows BaseService pattern
 * ✅ Multi-tenant ready (organizationId support)
 * ✅ Type-safe with TypeScript
 * ✅ Separation of concerns (retrieval/processing/formatting)
 * 
 * Usage:
 * ```typescript
 * // Recommended: Use ContentService for unified API
 * import { contentService } from '@/lib/db/repositories/ContentService';
 * const prompts = await contentService.getAll('prompts');
 * 
 * // Or use specific repository for advanced queries
 * import { promptRepository } from '@/lib/db/repositories/ContentService';
 * const prompts = await promptRepository.getByCategory('engineering');
 * ```
 * 
 * Migration Guide:
 * - Old: getAllPrompts() from @/lib/prompts/mongodb-prompts
 * - New: contentService.getAll('prompts') or promptRepository.getAll()
 * 
 * See also:
 * - @/lib/services/BaseService.ts - Similar pattern for services
 * - @/lib/mongodb.ts - MongoDB connection singleton
 * - docs/development/ENTERPRISE_COMPLIANCE_GUARDRAILS.md - Compliance requirements
 */

