#!/usr/bin/env tsx

/*
  Content Scheduler
  - Rate-limited orchestration for RSS and Sitemap jobs
  - Records provenance logs to stdout (for piping/observability)

  Usage examples:
    pnpm tsx scripts/content/schedule.ts --feeds feeds.txt --sitemaps sitemaps.txt --delayMs 1500 --concurrency 2
*/

import { readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { spawn } from 'node:child_process';

interface Args {
  feeds: string[];
  sitemaps: string[];
  delayMs: number;
  concurrency: number;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const feedFile = get('--feeds');
  const sitemapFile = get('--sitemaps');
  return {
    feeds: feedFile
      ? readFileSync(feedFile, 'utf8').split(/\r?\n/).filter(Boolean)
      : [],
    sitemaps: sitemapFile
      ? readFileSync(sitemapFile, 'utf8').split(/\r?\n/).filter(Boolean)
      : [],
    delayMs: Number(get('--delayMs') ?? '1500'),
    concurrency: Number(get('--concurrency') ?? '2'),
  };
}

function run(
  cmd: string,
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env });
    child.on('close', (code) => resolve(code ?? 0));
  });
}

async function withRateLimit<T>(
  items: T[],
  fn: (item: T, idx: number) => Promise<void>,
  delayMs: number,
  concurrency: number
) {
  let i = 0;
  const workers: Promise<void>[] = [];
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
      await delay(delayMs);
    }
  }
  for (let k = 0; k < concurrency; k++) workers.push(worker());
  await Promise.all(workers);
}

async function main() {
  const args = parseArgs();
  const env = { ...process.env };

  // Process RSS feeds
  await withRateLimit(
    args.feeds,
    async (feed, idx) => {
      process.stdout.write(
        JSON.stringify({
          stage: 'rss',
          idx,
          feed,
          ts: new Date().toISOString(),
        }) + '\n'
      );
      await run('pnpm', ['run', 'content:rss', feed], env);
    },
    args.delayMs,
    args.concurrency
  );

  // Process sitemaps
  await withRateLimit(
    args.sitemaps,
    async (sitemap, idx) => {
      process.stdout.write(
        JSON.stringify({
          stage: 'sitemap',
          idx,
          sitemap,
          ts: new Date().toISOString(),
        }) + '\n'
      );
      await run('pnpm', ['run', 'content:sitemap', sitemap], env);
    },
    args.delayMs,
    args.concurrency
  );

  process.stdout.write(JSON.stringify({ done: true }) + '\n');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
