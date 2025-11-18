/**
 * AI Summary: Generates and persists cover/icon assets for prompts with safe fallbacks.
 */

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/client';
import {
  Collections,
  DEFAULT_PROMPT_MEDIA,
  PromptMedia,
} from '@/lib/db/schema';
import { executeWithProviderHarness } from '@/lib/ai/v2/utils/provider-harness';
import { logger } from '@/lib/logging/logger';
import Replicate from 'replicate';

const IMAGE_FEATURE_ENABLED =
  (process.env.IMAGE_GENERATION_ENABLED ?? 'true').toLowerCase() !== 'false';

const DEFAULT_ICON_BASE = 'https://api.dicebear.com/7.x/shapes/svg?seed=';
const DEFAULT_COVER_BASE =
  'https://images.placeholders.dev/?width=1200&height=630&pattern=brickwall&text=';

const FALLBACK_PALETTE = ['#0f172a', '#1d4ed8', '#38bdf8'];

function buildPaletteFromTitle(title: string): string[] {
  if (!title) return FALLBACK_PALETTE;
  const hash = Array.from(title).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  const primary = `#${((hash * 2654435761) & 0xffffff).toString(16).padStart(6, '0')}`;
  const secondary = `#${(((hash << 7) ^ 0xa5a5a5) & 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
  const accent = `#${(((hash << 13) ^ 0x5a5a5a) & 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
  return [primary, secondary, accent];
}

function buildPlaceholderMedia(
  title: string,
  description?: string | null
): PromptMedia {
  const encodedTitle = encodeURIComponent(title || 'Engify Prompt');
  const encodedDesc = encodeURIComponent((description ?? title).slice(0, 60));
  const coverImageUrl = `${DEFAULT_COVER_BASE}${encodedTitle}%20%E2%80%94%20${encodedDesc}`;
  const iconUrl = `${DEFAULT_ICON_BASE}${encodedTitle}`;

  return {
    ...DEFAULT_PROMPT_MEDIA,
    coverImageUrl,
    coverAlt: `${title} cover art`,
    iconUrl,
    iconAlt: `${title} icon`,
    palette: buildPaletteFromTitle(title),
    generatedAt: new Date(),
    source: 'placeholder',
  };
}

function extractUrl(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'url' in first) {
      const candidate = (first as Record<string, unknown>).url;
      if (typeof candidate === 'string') return candidate;
    }
  }
  if (
    typeof output === 'object' &&
    'url' in (output as Record<string, unknown>)
  ) {
    const candidate = (output as Record<string, unknown>).url;
    if (typeof candidate === 'string') return candidate;
  }
  return null;
}

interface PromptMediaInput {
  promptId: string;
  title: string;
  description?: string | null;
}

export class ImageAssetService {
  static async generatePromptMedia(
    input: Omit<PromptMediaInput, 'promptId'>
  ): Promise<PromptMedia> {
    const { title, description } = input;

    if (!IMAGE_FEATURE_ENABLED) {
      return buildPlaceholderMedia(title, description);
    }

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return buildPlaceholderMedia(title, description);
    }

    try {
      // Using static import
      const replicate = new Replicate({ auth: token });
      const modelId = process.env.REPLICATE_IMAGE_MODEL || 'stability-ai/sdxl';
      const promptText = `${title} — ${description ?? 'professional SaaS illustration'} | flat design, vector, vibrant gradients, enterprise software`;

      const { value, latencyMs } = await executeWithProviderHarness(
        () =>
          replicate.run(modelId as `${string}/${string}`, {
            input: {
              prompt: promptText,
              size: '1024x1024',
            },
          }) as Promise<unknown>,
        {
          provider: 'replicate',
          model: modelId,
          operation: 'image-generation',
        }
      );

      const coverImageUrl = extractUrl(value);
      if (!coverImageUrl) {
        logger.warn('image.generate.placeholder_fallback', {
          reason: 'no_url_from_replicate',
          model: modelId,
          latencyMs,
        });
        return buildPlaceholderMedia(title, description);
      }

      const media: PromptMedia = {
        ...DEFAULT_PROMPT_MEDIA,
        coverImageUrl,
        coverAlt: `${title} cover art`,
        iconUrl: `${DEFAULT_ICON_BASE}${encodeURIComponent(title)}`,
        iconAlt: `${title} icon`,
        palette: buildPaletteFromTitle(title),
        generatedAt: new Date(),
        source: 'replicate',
        metadata: {
          provider: 'replicate',
          model: modelId,
          latencyMs,
        },
      };

      return media;
    } catch (error) {
      logger.error('image.generate.error', {
        error: error instanceof Error ? error.message : String(error),
      });
      return buildPlaceholderMedia(title, description);
    }
  }

  static async persistPromptMedia(
    promptId: string,
    media: PromptMedia
  ): Promise<void> {
    const db = await getDb();
    const collection = db.collection(Collections.PROMPT_TEMPLATES as string);

    await collection.updateOne(
      { _id: new ObjectId(promptId) },
      {
        $set: {
          media,
          updatedAt: new Date(),
        },
      }
    );
  }

  static async generateAndPersistPromptMedia(
    input: PromptMediaInput
  ): Promise<PromptMedia> {
    const media = await this.generatePromptMedia({
      title: input.title,
      description: input.description,
    });
    await this.persistPromptMedia(input.promptId, media);
    return media;
  }
}
