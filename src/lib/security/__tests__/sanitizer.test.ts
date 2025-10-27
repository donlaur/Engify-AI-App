/**
 * Input Sanitization Tests
 * 
 * Tests XSS prevention and sanitization utilities
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizePrompt,
  sanitizeRichContent,
  sanitizeObject,
  escapeHtml,
  containsScriptTag,
  sanitizeUrl,
} from '../sanitizer';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const input = '<script>alert("XSS")</script>Hello';
    const result = sanitizeHtml(input, 'strict');
    expect(result).toBe('Hello');
    expect(result).not.toContain('<script>');
  });

  it('removes inline event handlers', () => {
    const input = '<div onclick="alert(\'XSS\')">Click me</div>';
    const result = sanitizeHtml(input, 'strict');
    expect(result).not.toContain('onclick');
    expect(result).toBe('Click me');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const result = sanitizeHtml(input, 'strict');
    expect(result).not.toContain('javascript:');
  });

  it('allows safe HTML in basic mode', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const result = sanitizeHtml(input, 'basic');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  it('removes dangerous tags in basic mode', () => {
    const input = '<script>alert("XSS")</script><p>Safe</p>';
    const result = sanitizeHtml(input, 'basic');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Safe');
  });

  it('allows links in rich mode', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input, 'rich');
    expect(result).toContain('<a href="https://example.com"');
  });

  it('blocks javascript URLs in rich mode', () => {
    const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const result = sanitizeHtml(input, 'rich');
    expect(result).not.toContain('javascript:');
  });
});

describe('sanitizeText', () => {
  it('removes all HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('handles empty strings', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('handles non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeText(null as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeText(undefined as any)).toBe('');
  });
});

describe('sanitizePrompt', () => {
  it('allows basic formatting', () => {
    const input = 'Write a <strong>function</strong> that does X';
    const result = sanitizePrompt(input);
    expect(result).toContain('<strong>');
  });

  it('removes script tags from prompts', () => {
    const input = 'Write code <script>alert("XSS")</script> here';
    const result = sanitizePrompt(input);
    expect(result).not.toContain('<script>');
  });
});

describe('sanitizeRichContent', () => {
  it('allows rich formatting', () => {
    const input = '<h1>Title</h1><p>Content with <a href="https://example.com">link</a></p>';
    const result = sanitizeRichContent(input);
    expect(result).toContain('<h1>');
    expect(result).toContain('<a href');
  });

  it('removes dangerous content', () => {
    const input = '<h1>Title</h1><script>alert("XSS")</script>';
    const result = sanitizeRichContent(input);
    expect(result).not.toContain('<script>');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes string values in object', () => {
    const input = {
      title: '<script>alert("XSS")</script>Hello',
      description: '<p>Safe content</p>',
      count: 42,
    };
    const result = sanitizeObject(input, 'strict');
    expect(result.title).toBe('Hello');
    expect(result.description).toBe('Safe content');
    expect(result.count).toBe(42);
  });

  it('sanitizes nested objects', () => {
    const input = {
      user: {
        name: '<script>alert("XSS")</script>John',
        bio: '<p>Developer</p>',
      },
    };
    const result = sanitizeObject(input, 'strict');
    expect(result.user.name).toBe('John');
    expect(result.user.bio).toBe('Developer');
  });

  it('sanitizes arrays of strings', () => {
    const input = {
      tags: ['<script>alert("XSS")</script>tag1', 'tag2'],
    };
    const result = sanitizeObject(input, 'strict');
    expect(result.tags).toHaveLength(2);
    expect(result.tags[0]).toBe('tag1');
    expect(result.tags[1]).toBe('tag2');
  });
});

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    const input = '<script>alert("XSS")</script>';
    const result = escapeHtml(input);
    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('escapes ampersands', () => {
    const input = 'Tom & Jerry';
    const result = escapeHtml(input);
    expect(result).toBe('Tom &amp; Jerry');
  });

  it('escapes quotes', () => {
    const input = `He said "Hello" and 'Goodbye'`;
    const result = escapeHtml(input);
    expect(result).toContain('&quot;');
    expect(result).toContain('&#039;');
  });
});

describe('containsScriptTag', () => {
  it('detects script tags', () => {
    expect(containsScriptTag('<script>alert("XSS")</script>')).toBe(true);
    expect(containsScriptTag('<SCRIPT>alert("XSS")</SCRIPT>')).toBe(true);
  });

  it('detects inline event handlers', () => {
    expect(containsScriptTag('<div onclick="alert(\'XSS\')">Click</div>')).toBe(true);
    expect(containsScriptTag('<img onerror="alert(\'XSS\')" />')).toBe(true);
  });

  it('detects javascript: URLs', () => {
    expect(containsScriptTag('<a href="javascript:alert(\'XSS\')">Link</a>')).toBe(true);
  });

  it('returns false for safe content', () => {
    expect(containsScriptTag('<p>Safe content</p>')).toBe(false);
    expect(containsScriptTag('Just plain text')).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    const url = 'https://example.com/path';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('allows http URLs', () => {
    const url = 'http://example.com/path';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('allows mailto URLs', () => {
    const url = 'mailto:user@example.com';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('blocks javascript URLs', () => {
    const url = 'javascript:alert("XSS")';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('blocks data URLs', () => {
    const url = 'data:text/html,<script>alert("XSS")</script>';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('blocks vbscript URLs', () => {
    const url = 'vbscript:msgbox("XSS")';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('blocks file URLs', () => {
    const url = 'file:///etc/passwd';
    expect(sanitizeUrl(url)).toBe('');
  });

  it('handles empty input', () => {
    expect(sanitizeUrl('')).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeUrl(null as any)).toBe('');
  });
});
