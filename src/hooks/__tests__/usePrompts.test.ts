/**
 * Tests for usePrompts hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrompts, usePrompt, usePaginatedPrompts } from '../usePrompts';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher, config) => {
    // Simple mock implementation
    return {
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    };
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('usePrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array initially', () => {
    const { result } = renderHook(() => usePrompts());
    
    expect(result.current.prompts).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('should accept filter parameters', () => {
    const { result } = renderHook(() => 
      usePrompts({ 
        category: 'code-generation',
        limit: 10 
      })
    );
    
    expect(result.current.prompts).toEqual([]);
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(() => usePrompts());
    
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('usePrompt', () => {
  it('should return undefined initially', () => {
    const { result } = renderHook(() => usePrompt('test-id'));
    
    expect(result.current.prompt).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch if id is empty', () => {
    const { result } = renderHook(() => usePrompt(''));
    
    expect(result.current.prompt).toBeUndefined();
  });
});

describe('usePaginatedPrompts', () => {
  it('should start at page 1', () => {
    const { result } = renderHook(() => usePaginatedPrompts());
    
    expect(result.current.page).toBe(1);
  });

  it('should provide pagination functions', () => {
    const { result } = renderHook(() => usePaginatedPrompts());
    
    expect(typeof result.current.nextPage).toBe('function');
    expect(typeof result.current.prevPage).toBe('function');
    expect(typeof result.current.goToPage).toBe('function');
  });

  it('should provide filter functions', () => {
    const { result } = renderHook(() => usePaginatedPrompts());
    
    expect(typeof result.current.updateFilters).toBe('function');
    expect(typeof result.current.clearFilters).toBe('function');
  });

  it('should have pagination state', () => {
    const { result } = renderHook(() => usePaginatedPrompts());
    
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });
});

