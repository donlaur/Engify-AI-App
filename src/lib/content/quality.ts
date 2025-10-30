export interface QualityConfig {
  minWords: number;
  allowedLangs: ReadonlyArray<string>;
  allowedSources: ReadonlyArray<string>;
}

export function getQualityConfig(): QualityConfig {
  const minWords = Number(process.env.CONTENT_MIN_WORDS ?? '120');
  const allowedLangs = (process.env.CONTENT_ALLOWED_LANGS ?? 'en')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const allowedSources = (process.env.CONTENT_ALLOWED_SOURCES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return { minWords, allowedLangs, allowedSources } as const;
}

export function countWords(text: string): number {
  const t = text.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

export function passesQuality(
  text: string,
  lang: string | null,
  source: string | null,
  cfg: QualityConfig
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const wc = countWords(text);
  if (wc < cfg.minWords) reasons.push('min_words');
  if (cfg.allowedLangs.length > 0 && lang && !cfg.allowedLangs.includes(lang)) {
    reasons.push('lang_not_allowed');
  }
  if (
    cfg.allowedSources.length > 0 &&
    source &&
    !cfg.allowedSources.includes(source)
  ) {
    reasons.push('source_not_allowed');
  }
  return { ok: reasons.length === 0, reasons };
}
