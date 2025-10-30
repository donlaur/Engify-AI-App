#!/usr/bin/env tsx

/*
  Replicate provider smoke test (current adapter is a scaffold)
  Usage:
    npm run replicate:smoke -- "Summarize this text"
*/

import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

async function main(): Promise<void> {
  const prompt = process.argv.slice(2).join(' ') || 'Hello from Engify';
  const provider = AIProviderFactory.create('replicate-flash');
  const res = await provider.execute({
    prompt,
    temperature: 0.2,
    maxTokens: 128,
  });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(res, null, 2));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
