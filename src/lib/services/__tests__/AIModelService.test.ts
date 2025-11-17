/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AIModelService Tests
 */

import { describe, it, expect } from 'vitest';
import { AIModelService } from '../AIModelService';

describe('AIModelService', () => {
  let service: AIModelService;

  beforeEach(() => {
    service = new AIModelService();
  });

  it('should instantiate service', () => {
    expect(service).toBeDefined();
  });

  it('should find active models', async () => {
    const result = await service.findActive();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should find allowed models', async () => {
    const result = await service.findAllowed();
    expect(Array.isArray(result)).toBe(true);
  });
});
