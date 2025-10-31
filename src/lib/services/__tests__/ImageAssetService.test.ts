import { describe, it, expect, beforeEach, vi } from 'vitest';

const updateOneMock = vi.fn();

vi.mock('@/lib/db/client', () => ({
  getDb: vi.fn(async () => ({
    collection: vi.fn(() => ({
      updateOne: updateOneMock,
    })),
  })),
}));

vi.mock('@/lib/ai/v2/utils/provider-harness', () => ({
  executeWithProviderHarness: vi.fn(async (task: () => Promise<unknown>) => ({
    value: await task(),
    latencyMs: 123,
    attempts: 1,
  })),
}));

const mockRun = vi.fn();
class MockReplicate {
  run = mockRun;
}

vi.mock('replicate', () => ({
  default: MockReplicate,
}));

const { executeWithProviderHarness } = await import(
  '@/lib/ai/v2/utils/provider-harness'
);

const { ImageAssetService } = await import('../ImageAssetService');

const originalEnv = { ...process.env };

describe('ImageAssetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateOneMock.mockResolvedValue({ modifiedCount: 1 });
    Object.assign(process.env, originalEnv);
  });

  it('returns placeholder media when feature disabled', async () => {
    process.env.IMAGE_GENERATION_ENABLED = 'false';

    const media = await ImageAssetService.generateAndPersistPromptMedia({
      promptId: '655f5f8a9772238ea0a5f301',
      title: 'Test Prompt',
      description: 'Helpful description',
    });

    expect(media.coverImageUrl).toContain('images.placeholders.dev');
    expect(media.source).toBe('placeholder');
    expect(updateOneMock).toHaveBeenCalled();
  });

  it('invokes replicate when token available', async () => {
    process.env.REPLICATE_API_TOKEN = 'token';
    process.env.REPLICATE_IMAGE_MODEL = 'custom/image-model';
    mockRun.mockResolvedValueOnce([{ url: 'https://example.com/cover.png' }]);

    const media = await ImageAssetService.generateAndPersistPromptMedia({
      promptId: '655f5f8a9772238ea0a5f301',
      title: 'Visionary Prompt',
      description: 'Generate a forward-looking cover',
    });

    expect(mockRun).toHaveBeenCalled();
    expect(media.coverImageUrl).toBe('https://example.com/cover.png');
    expect(media.source).toBe('replicate');
    expect(executeWithProviderHarness).toHaveBeenCalled();
    expect(updateOneMock).toHaveBeenCalled();
  });
});
