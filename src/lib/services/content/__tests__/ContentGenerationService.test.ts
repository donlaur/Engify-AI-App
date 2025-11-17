/**
 * Content Generation Service Tests
 *
 * Demonstrates testing of SOLID-based architecture
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentGenerationService } from '../ContentGenerationService';
import { ContentGeneratorFactory } from '@/lib/factories/ContentGeneratorFactory';
import { IContentGenerator } from '../interfaces/IContentGenerator';

// Mock the factory
vi.mock('@/lib/factories/ContentGeneratorFactory');

describe('ContentGenerationService', () => {
  const mockOrganizationId = 'test-org-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should create draft service with single-agent generator', () => {
      const service = ContentGenerationService.createDraftService(mockOrganizationId);

      expect(service).toBeInstanceOf(ContentGenerationService);
      expect(ContentGeneratorFactory.createGenerator).toHaveBeenCalledWith(
        'single-agent',
        { organizationId: mockOrganizationId }
      );
    });

    it('should create production service with multi-agent generator', () => {
      const service = ContentGenerationService.createProductionService(mockOrganizationId);

      expect(service).toBeInstanceOf(ContentGenerationService);
      expect(ContentGeneratorFactory.createGenerator).toHaveBeenCalledWith(
        'multi-agent',
        { organizationId: mockOrganizationId }
      );
    });
  });

  describe('Content Generation', () => {
    it('should generate content using the underlying generator', async () => {
      const mockGenerator: IContentGenerator = {
        generate: vi.fn().mockResolvedValue({
          content: 'Generated content',
          metadata: {
            wordCount: 100,
            tokensUsed: 400,
            costUSD: 0.01,
            model: 'gpt-4o',
            provider: 'openai',
            generatedAt: new Date(),
            qualityScore: 8,
          },
        }),
        validate: vi.fn(),
        getName: vi.fn().mockReturnValue('MockGenerator'),
      };

      vi.mocked(ContentGeneratorFactory.createGenerator).mockReturnValue(mockGenerator);

      const service = new ContentGenerationService(mockOrganizationId, 'single-agent');

      const result = await service.generate({
        topic: 'Test Topic',
        category: 'Tutorial',
        targetWordCount: 800,
      });

      expect(result.content).toBe('Generated content');
      expect(result.metadata.wordCount).toBe(100);
      expect(mockGenerator.generate).toHaveBeenCalledWith({
        topic: 'Test Topic',
        category: 'Tutorial',
        targetWordCount: 800,
      });
    });

    it('should throw error if generator fails', async () => {
      const mockGenerator: IContentGenerator = {
        generate: vi.fn().mockRejectedValue(new Error('Generation failed')),
        validate: vi.fn(),
        getName: vi.fn().mockReturnValue('MockGenerator'),
      };

      vi.mocked(ContentGeneratorFactory.createGenerator).mockReturnValue(mockGenerator);

      const service = new ContentGenerationService(mockOrganizationId, 'single-agent');

      await expect(
        service.generate({
          topic: 'Test Topic',
          category: 'Tutorial',
        })
      ).rejects.toThrow('Generation failed');
    });
  });

  describe('Quick Draft Workflow', () => {
    it('should use single-agent generator for quick drafts', async () => {
      const mockGenerator: IContentGenerator = {
        generate: vi.fn().mockResolvedValue({
          content: 'Quick draft content',
          metadata: {
            wordCount: 500,
            tokensUsed: 2000,
            costUSD: 0.005,
            model: 'gpt-4o-mini',
            provider: 'openai',
            generatedAt: new Date(),
            qualityScore: 6,
          },
        }),
        validate: vi.fn(),
        getName: vi.fn().mockReturnValue('SingleAgent'),
      };

      vi.mocked(ContentGeneratorFactory.createGenerator).mockReturnValue(mockGenerator);

      const service = new ContentGenerationService(mockOrganizationId, 'multi-agent');

      const result = await service.quickDraft({
        topic: 'Quick Article',
        category: 'Tutorial',
      });

      expect(result.content).toBe('Quick draft content');
      expect(ContentGeneratorFactory.createGenerator).toHaveBeenCalledWith(
        'single-agent',
        { organizationId: mockOrganizationId }
      );
    });
  });
});

describe('ContentGeneratorFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Generator Recommendations', () => {
    it('should recommend single-agent for drafts', () => {
      const type = ContentGeneratorFactory.getRecommendedGenerator({
        wordCount: 800,
        quality: 'draft',
        budget: 'low',
      });

      expect(type).toBe('single-agent');
    });

    it('should recommend single-agent for low budget', () => {
      const type = ContentGeneratorFactory.getRecommendedGenerator({
        wordCount: 1500,
        quality: 'production',
        budget: 'low',
      });

      expect(type).toBe('single-agent');
    });

    it('should recommend single-agent for short content', () => {
      const type = ContentGeneratorFactory.getRecommendedGenerator({
        wordCount: 300,
        quality: 'production',
        budget: 'high',
      });

      expect(type).toBe('single-agent');
    });

    it('should recommend multi-agent for production quality', () => {
      const type = ContentGeneratorFactory.getRecommendedGenerator({
        wordCount: 1500,
        quality: 'production',
        budget: 'medium',
      });

      expect(type).toBe('multi-agent');
    });

    it('should recommend multi-agent for long content', () => {
      const type = ContentGeneratorFactory.getRecommendedGenerator({
        wordCount: 2500,
        quality: 'production',
        budget: 'high',
      });

      expect(type).toBe('multi-agent');
    });
  });

  describe('Available Generators', () => {
    it('should return list of available generators', () => {
      const generators = ContentGeneratorFactory.getAvailableGenerators();

      expect(generators).toContain('single-agent');
      expect(generators).toContain('multi-agent');
      expect(generators).toHaveLength(2);
    });

    it('should return list of available reviewers', () => {
      const reviewers = ContentGeneratorFactory.getAvailableReviewers();

      expect(reviewers).toContain('multi-agent');
      expect(reviewers).toHaveLength(1);
    });

    it('should return list of available publishers', () => {
      const publishers = ContentGeneratorFactory.getAvailablePublishers();

      expect(publishers).toContain('multi-agent');
      expect(publishers).toHaveLength(1);
    });
  });
});
