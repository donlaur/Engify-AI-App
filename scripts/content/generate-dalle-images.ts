#!/usr/bin/env tsx
/**
 * Generate Article Images with DALL-E
 *
 * Creates professional images for articles using OpenAI DALL-E 3
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';
import https from 'https';

config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const images = [
  {
    filename: 'cursor-2-0-multi-agent-chaos.png',
    prompt:
      'A modern, minimalist technical illustration showing 5 AI robot agents (represented as geometric shapes with circuit patterns) working on a shared digital codebase. Show chaos with conflicting red arrows, tangled connection lines, and warning symbols. Use a professional tech color scheme: deep blues (#1e293b), purples (#7c3aed), and red (#ef4444) for conflicts. Clean, flat design style suitable for a technical blog. No text. Wide format 1792x1024.',
  },
  {
    filename: 'cursor-2-0-precommit-flow.png',
    prompt:
      'A clean flowchart diagram showing the pre-commit hook process. Start with "Code Commit" box, arrow to "Pre-commit Hook" diamond, branching to "Pass" (green checkmark) leading to "Success" and "Fail" (red X) leading to "Fix Errors" which loops back. Use modern flat design with colors: slate blue (#1e293b), green (#10b981), red (#ef4444). Professional, minimal, suitable for technical documentation. No text labels needed. Wide format 1792x1024.',
  },
  {
    filename: 'cursor-2-0-agent-division.png',
    prompt:
      'A technical diagram showing a codebase divided into 5 distinct colored sections like a pie chart or organizational chart. Each section labeled with icons: API (server icon), UI (monitor icon), Docs (document icon), Tests (checkmark icon), Scripts (terminal icon). Assign each section a different AI agent (represented as small geometric robots). Use professional tech colors: blues, purples, greens. Clean, modern, flat design. Wide format 1792x1024.',
  },
  {
    filename: 'cursor-2-0-terminal-setup.png',
    prompt:
      'A realistic terminal/command line interface screenshot showing code setup for Husky git hooks. Dark theme with syntax highlighting: green for success messages, blue for commands, white for code. Show "npx husky-init" command and pre-commit hook configuration. Professional developer tool aesthetic, clean typography. Wide format 1792x1024.',
  },
  {
    filename: 'cursor-2-0-cost-comparison.png',
    prompt:
      'A professional bar chart infographic comparing costs. Two large bars: left bar (red, tall) labeled "500 credits - Before Hooks", right bar (green, short) labeled "100 credits - After Hooks". Large "80% Saved" badge in green. Modern, clean design with professional typography. Use colors: red (#ef4444), green (#10b981), dark background (#1e293b). Minimal, data-focused style. Wide format 1792x1024.',
  },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

async function generateImages() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  DALL-E 3 Image Generator for Cursor 2.0 Article          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Generating ${images.length} images...`);
  console.log(
    `💰 Estimated cost: ~$${(images.length * 0.04).toFixed(2)} (DALL-E 3 standard quality)`
  );
  console.log('');

  const outputDir = path.join(process.cwd(), 'public/images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`🎨 [${i + 1}/${images.length}] Generating: ${image.filename}`);
    console.log(`   Prompt: ${image.prompt.substring(0, 100)}...`);

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: image.prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        console.error(`   ❌ No image URL returned`);
        continue;
      }

      const filepath = path.join(outputDir, image.filename);
      await downloadImage(imageUrl, filepath);

      console.log(`   ✅ Saved to: ${filepath}`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error:`, error);
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ IMAGE GENERATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📁 Images saved to: public/images/');
  console.log('');
  console.log('Next steps:');
  console.log('1. Review images in public/images/');
  console.log('2. Update article in MongoDB to use real image paths');
  console.log('3. Deploy to production');
  console.log('');
}

generateImages();
