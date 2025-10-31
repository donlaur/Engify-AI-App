import { createHash } from 'node:crypto';
import {
  getQualityConfig,
  passesQuality,
  countWords,
} from '@/lib/content/quality';

export interface RawContentRecord {
  title?: string | null;
  description?: string | null;
  text?: string;
  url?: string;
  source?: string;
  hash?: string;
  lang?: string;
  readingMinutes?: number;
}

export interface StoredContentRecord {
  organizationId: unknown | null;
  title: string | null;
  description: string | null;
  text: string;
  canonicalUrl: string | null;
  source: string | null;
  hash: string;
  lang: string | null;
  readingMinutes: number | null;
  quality: {
    hasTitle: boolean;
    hasDescription: boolean;
    minWordsMet: boolean;
    checks: string[];
  };
  reviewStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function buildStoredContent(
  input: RawContentRecord,
  now: Date = new Date()
): StoredContentRecord | null {
  const text = typeof input.text === 'string' ? input.text : '';
  if (text.trim().length === 0) return null;

  const url = typeof input.url === 'string' ? input.url : null;
  const source = typeof input.source === 'string' ? input.source : null;
  const hash =
    typeof input.hash === 'string' && input.hash.length > 0
      ? input.hash
      : sha256(`${url ?? ''}\n${text}`);
  const lang = typeof input.lang === 'string' ? input.lang : null;
  const minutes =
    typeof input.readingMinutes === 'number' ? input.readingMinutes : null;
  const title = typeof input.title === 'string' ? input.title : null;
  const description =
    typeof input.description === 'string' ? input.description : null;

  const cfg = getQualityConfig();
  const gate = passesQuality(text, lang, source, cfg);
  const quality = {
    hasTitle: Boolean(title && title.trim().length > 0),
    hasDescription: Boolean(description && description.trim().length > 0),
    minWordsMet: countWords(text) >= cfg.minWords,
    checks: gate.ok ? [] : gate.reasons,
  };

  return {
    organizationId: null,
    title,
    description,
    text,
    canonicalUrl: url,
    source,
    hash,
    lang,
    readingMinutes: minutes,
    quality,
    reviewStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}
