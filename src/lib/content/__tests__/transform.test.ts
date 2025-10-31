import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildStoredContent } from '@/lib/content/transform';
import type { RawContentRecord } from '@/lib/content/transform';

const ORIGINAL_ENV = { ...process.env };

describe('buildStoredContent', () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      CONTENT_MIN_WORDS: '10',
      CONTENT_ALLOWED_LANGS: 'en',
      CONTENT_ALLOWED_SOURCES: 'example.com,engify.ai',
    };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns null when text is missing', () => {
    const record: RawContentRecord = { title: 'Missing text' };
    expect(buildStoredContent(record)).toBeNull();
  });

  it('computes hash when not provided and marks reviewStatus pending', () => {
    const record: RawContentRecord = {
      title: 'Sample',
      text: 'This is a valid piece of content with enough words to pass.',
      url: 'https://example.com/article',
      source: 'example.com',
      lang: 'en',
    };

    const stored = buildStoredContent(record);
    expect(stored).not.toBeNull();
    expect(stored?.hash).toHaveLength(64);
    expect(stored?.reviewStatus).toBe('pending');
    expect(stored?.quality.checks).toHaveLength(0);
    expect(stored?.metadata).toEqual({});
  });

  it('preserves metadata when provided', () => {
    const record: RawContentRecord = {
      text: 'This is a valid piece of content with enough words to pass metadata test.',
      metadata: { topic: 'metadata-check', author: 'agent' },
    };

    const stored = buildStoredContent(record);
    expect(stored).not.toBeNull();
    expect(stored?.metadata).toEqual({ topic: 'metadata-check', author: 'agent' });
  });

  it('flags content that fails language whitelist', () => {
    const record: RawContentRecord = {
      text: 'This content has sufficient words to pass the minimum threshold.',
      source: 'example.com',
      lang: 'fr',
    };

    const stored = buildStoredContent(record);
    expect(stored).not.toBeNull();
    expect(stored?.quality.checks).toContain('lang_not_allowed');
  });

  it('flags content that fails minimum word count', () => {
    const record: RawContentRecord = {
      text: 'Too short',
      source: 'example.com',
      lang: 'en',
    };

    const stored = buildStoredContent(record);
    expect(stored).not.toBeNull();
    expect(stored?.quality.minWordsMet).toBe(false);
    expect(stored?.quality.checks).toContain('min_words');
  });

  it('flags content from disallowed source when whitelist present', () => {
    const record: RawContentRecord = {
      text: 'This text is long enough to pass the word count requirement easily.',
      source: 'unknown.com',
      lang: 'en',
    };

    const stored = buildStoredContent(record);
    expect(stored).not.toBeNull();
    expect(stored?.quality.checks).toContain('source_not_allowed');
  });
});
