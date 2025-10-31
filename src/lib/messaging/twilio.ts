/**
 * AI Summary: Twilio webhook utilities including signature verification.
 */
import { createHmac } from 'node:crypto';

function buildBaseString(url: string, params: URLSearchParams): string {
  // Twilio docs: concatenate URL with sorted POST params (key=value)
  const pairs: string[] = [];
  Array.from(params.keys())
    .sort()
    .forEach((k) => pairs.push(k + params.get(k)));
  return url + pairs.join('');
}

export async function verifyTwilioSignature(
  requestUrl: string,
  rawBody: string | null,
  signature: string | null,
  authToken: string | null
): Promise<boolean> {
  if (!signature || !authToken) return false;
  // If content-type is application/x-www-form-urlencoded use params rule, else use raw body
  try {
    const base = requestUrl;
    if (rawBody && rawBody.length > 0) {
      // JSON payloads: sign as URL + raw body
      const digest = createHmac('sha1', authToken)
        .update(base + rawBody)
        .digest('base64');
      return digest === signature;
    }
    // Fallback: try URL-encoded
    const url = new URL(requestUrl);
    const baseString = buildBaseString(
      url.origin + url.pathname,
      url.searchParams
    );
    const digest = createHmac('sha1', authToken)
      .update(baseString)
      .digest('base64');
    return digest === signature;
  } catch {
    return false;
  }
}
