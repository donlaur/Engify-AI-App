# Replicate Integration (Provider + Assets)

## Env

Add to `.env.local` and Vercel:

```bash
REPLICATE_API_TOKEN=your_token
```

## Provider (LLM scaffold)

- Adapter: `src/lib/ai/v2/adapters/ReplicateAdapter.ts`
- Factory: `AIProviderFactory` registers `replicate-flash`
- Usage (server):

```ts
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
const provider = AIProviderFactory.create('replicate-flash');
const res = await provider.execute({ prompt: 'Summarize: ...' });
```

Note: Current adapter is a scaffold for quick wiring. Swap to SDK calls when model IDs/versions are finalized.

## Image assets (future)

- Goal: cover/icon generation for prompts/modules
- Plan:
  - Add a dedicated utility for image models (inputs: prompt, size) and allowlist models
  - Store URLs under `prompt_templates.assets` (e.g., `coverUrl`, `iconUrl`)
  - Add admin action to regenerate assets

## Safety & Cost

- Rate-limit and cache by input hash
- Keep allowlist of models only
- Log latency/cost per call
