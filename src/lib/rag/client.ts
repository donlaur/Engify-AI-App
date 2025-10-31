/**
 * AI Summary: Type-safe RAG client with Zod validation, timeouts, and retries.
 * Invariants: never logs secrets; returns Result-like object with ok/error.
 * Related: docs/rag/PYTHON_RAG_SERVICE.md, docs/planning/DAY_5_PLAN.md
 */

import { z } from 'zod';

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRIES = 1;

export const RagHealthSchema = z.object({ status: z.literal('ok') });
export type RagHealth = z.infer<typeof RagHealthSchema>;

export const RagSearchRequestSchema = z.object({ query: z.string().min(1) });
export type RagSearchRequest = z.infer<typeof RagSearchRequestSchema>;

export const RagSearchResultSchema = z.object({
  success: z.boolean(),
  results: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string().optional(),
        content: z.string(),
        score: z.number().optional(),
      })
    )
    .default([]),
});
export type RagSearchResult = z.infer<typeof RagSearchResultSchema>;

export interface RagClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
}

export class RagClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(options: RagClientOptions = {}) {
    this.baseUrl =
      options.baseUrl ?? process.env.RAG_API_URL ?? 'http://localhost:8000';
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? DEFAULT_RETRIES;
  }

  async health(): Promise<
    { ok: true; data: RagHealth } | { ok: false; error: string }
  > {
    return this.get('/health', RagHealthSchema);
  }

  async search(
    request: RagSearchRequest
  ): Promise<
    { ok: true; data: RagSearchResult } | { ok: false; error: string }
  > {
    const parsed = RagSearchRequestSchema.safeParse(request);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.message };
    }
    return this.post('/search', parsed.data, RagSearchResultSchema);
  }

  private async get<T>(path: string, schema: z.ZodSchema<T>) {
    return this.request('GET', path, undefined, schema);
  }

  private async post<T>(path: string, body: unknown, schema: z.ZodSchema<T>) {
    return this.request('POST', path, body, schema);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body: unknown,
    schema: z.ZodSchema<T>
  ): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${path}`;
    let attempt = 0;
    let lastError: unknown;
    while (attempt <= this.retries) {
      attempt += 1;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const text = await res.text();
        const data = text.length ? JSON.parse(text) : {};
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          return { ok: false, error: parsed.error.message };
        }
        return { ok: true, data: parsed.data };
      } catch (err) {
        lastError = err;
        if (attempt > this.retries) break;
        await new Promise((r) => setTimeout(r, attempt * 200));
      }
    }
    return {
      ok: false,
      error: String(lastError instanceof Error ? lastError.message : lastError),
    };
  }
}
