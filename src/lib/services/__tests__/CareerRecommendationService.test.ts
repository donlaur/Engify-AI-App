/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CareerRecommendationService Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { CareerRecommendationService } from '../CareerRecommendationService';

vi.mock('../UserService', () => ({
  userService: {
    getUserById: vi.fn(),
  },
}));

vi.mock('../SkillTrackingService', () => ({
  skillTrackingService: {
    getUserSkills: vi.fn(),
  },
}));

describe('CareerRecommendationService', () => {
  let service: CareerRecommendationService;

  beforeEach(() => {
    service = new CareerRecommendationService();
  });

  it('should instantiate service', () => {
    expect(service).toBeDefined();
  });

  it('should return pattern for communication skill', () => {
    const patterns = service.getPatternForSkill('communication');
    expect(patterns).toContain('Persona');
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('should return default patterns for unknown skill', () => {
    const patterns = service.getPatternForSkill('unknown-skill');
    expect(patterns).toContain('Persona');
  });
});
