#!/usr/bin/env tsx
/**
 * Universal Article Publisher
 * 
 * Publishes markdown articles to the learning_resources collection.
 * 
 * Usage:
 *   tsx scripts/content/publish-article.ts <path-to-markdown>
 *   tsx scripts/content/publish-article.ts content/drafts/my-article.md
 *   tsx scripts/content/publish-article.ts content/drafts/my-article.md --featured
 *   tsx scripts/content/publish-article.ts content/drafts/my-article.md --update
 * 
 * Options:
 *   --featured    Mark as featured article
 *   --update      Update if exists (instead of skipping)
 *   --draft       Publish as draft (status: inactive)
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// Load environment variables
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

interface FrontmatterData {
  title: string;
  description: string;
  slug?: string;
  category?: string;
  keywords?: string[];
  author?: string;
  featured?: boolean;
  level?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseFrontmatter(content: string): {
  frontmatter: FrontmatterData;
  articleContent: string;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found. Articles must have YAML frontmatter.');
  }

  const frontmatterText = frontmatterMatch[1];
  const articleContent = frontmatterMatch[2];

  // Parse YAML-style frontmatter
  const frontmatter: FrontmatterData = {
    title: '',
    description: '',
  };

  // Extract title
  const titleMatch = frontmatterText.match(/title:\s*"([^"]+)"/);
  if (titleMatch) frontmatter.title = titleMatch[1];

  // Extract description
  const descMatch = frontmatterText.match(/description:\s*"([^"]+)"/);
  if (descMatch) frontmatter.description = descMatch[1];

  // Extract slug (optional)
  const slugMatch = frontmatterText.match(/slug:\s*"([^"]+)"/);
  if (slugMatch) frontmatter.slug = slugMatch[1];

  // Extract category (optional)
  const catMatch = frontmatterText.match(/category:\s*"([^"]+)"/);
  if (catMatch) frontmatter.category = catMatch[1];

  // Extract level (optional)
  const levelMatch = frontmatterText.match(/level:\s*"?([^"\n]+)"?/);
  if (levelMatch) {
    const level = levelMatch[1].trim();
    if (['beginner', 'intermediate', 'advanced'].includes(level)) {
      frontmatter.level = level as 'beginner' | 'intermediate' | 'advanced';
    }
  }

  // Extract keywords
  const keywordsMatch = frontmatterText.match(/keywords:\s*\[(.*?)\]/s);
  if (keywordsMatch) {
    frontmatter.keywords = keywordsMatch[1]
      .split(',')
      .map((k) => k.trim().replace(/"/g, ''))
      .filter(Boolean);
  }

  // Extract tags (alternative to keywords)
  const tagsMatch = frontmatterText.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    frontmatter.tags = tagsMatch[1]
      .split(',')
      .map((t) => t.trim().replace(/"/g, ''))
      .filter(Boolean);
  }

  // Extract author
  const authorMatch = frontmatterText.match(/author:\s*"([^"]+)"/);
  if (authorMatch) frontmatter.author = authorMatch[1];

  // Extract featured
  const featuredMatch = frontmatterText.match(/featured:\s*(true|false)/);
  if (featuredMatch) frontmatter.featured = featuredMatch[1] === 'true';

  return { frontmatter, articleContent };
}

function replacePlaceholderImages(content: string): string {
  // Replace local image paths with placeholder.co URLs
  return content.replace(
    /!\[([^\]]+)\]\(\/images\/([^)]+)\)/g,
    (match, alt, filename) => {
      const cleanAlt = alt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+');
      return `![${alt}](https://placehold.co/800x400/1e293b/e2e8f0?font=raleway&text=${cleanAlt})`;
    }
  );
}

async function publishArticle(
  filePath: string,
  options: {
    featured?: boolean;
    update?: boolean;
    draft?: boolean;
  }
) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Universal Article Publisher                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Read the article
  let content = fs.readFileSync(filePath, 'utf-8');
  console.log(`📄 Reading: ${path.basename(filePath)}`);

  // Replace placeholder images
  content = replacePlaceholderImages(content);

  // Parse frontmatter
  let frontmatter: FrontmatterData;
  let articleContent: string;
  try {
    const parsed = parseFrontmatter(content);
    frontmatter = parsed.frontmatter;
    articleContent = parsed.articleContent;
  } catch (error) {
    console.error('❌ Error parsing frontmatter:', error);
    process.exit(1);
  }

  if (!frontmatter.title) {
    console.error('❌ Title is required in frontmatter');
    process.exit(1);
  }

  const slug = frontmatter.slug || generateSlug(frontmatter.title);
  const tags = frontmatter.tags || frontmatter.keywords || [];
  const category = frontmatter.category || 'AI & Development';
  const level = frontmatter.level || 'intermediate';
  const author = frontmatter.author || 'Engify.ai Team';
  const featured = options.featured || frontmatter.featured || false;
  const status = options.draft ? 'inactive' : 'active';

  console.log(`📝 Title: ${frontmatter.title}`);
  console.log(`🔗 Slug: ${slug}`);
  console.log(`📊 Category: ${category}`);
  console.log(`🎯 Level: ${level}`);
  console.log(`✨ Featured: ${featured ? 'Yes' : 'No'}`);
  console.log(`📌 Status: ${status}`);
  console.log('');

  // Convert markdown to HTML
  const contentHtml = await marked(articleContent);

  // Calculate read time
  const wordCount = articleContent.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 250); // 250 words per minute

  console.log(`📊 Stats: ${wordCount} words, ${readTime} min read`);
  console.log('');

  // Create document
  const doc = {
    id: `article-${slug}`,
    title: frontmatter.title,
    description: frontmatter.description,
    content: articleContent,
    contentHtml,
    category,
    type: 'article',
    level,
    duration: `${readTime} min`,
    tags,
    featured,
    status,
    organizationId: null, // Public content
    seo: {
      metaTitle: `${frontmatter.title} | Engify.ai`,
      metaDescription: frontmatter.description,
      keywords: tags,
      slug,
      canonicalUrl: `https://engify.ai/learn/${slug}`,
      ogImage: `https://engify.ai/og/${slug}.png`,
    },
    source: 'Engify.ai',
    author,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: status === 'active' ? new Date() : undefined,
    views: 0,
    shares: 0,
  };

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    // Check if already exists
    const existing = await collection.findOne({ 'seo.slug': slug });
    
    if (existing) {
      if (options.update) {
        console.log('⚠️  Article exists, updating...');
        await collection.updateOne(
          { 'seo.slug': slug },
          {
            $set: {
              ...doc,
              createdAt: existing.createdAt, // Keep original creation date
              views: existing.views, // Keep view count
              shares: existing.shares, // Keep share count
            },
          }
        );
        console.log('✅ Article updated successfully!');
      } else {
        console.log('⏭️  Article already exists (use --update to overwrite)');
        console.log('');
        console.log(`🌐 Already live at: https://engify.ai/learn/${slug}`);
        await client.close();
        return;
      }
    } else {
      await collection.insertOne(doc);
      console.log('✅ Article published successfully!');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 ARTICLE PUBLISHED!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📄 Title: ${frontmatter.title}`);
    console.log(`📊 Stats: ${readTime} min read, ${wordCount} words`);
    console.log(`🏷️  Tags: ${tags.join(', ')}`);
    console.log(`📌 Status: ${status === 'active' ? 'LIVE' : 'DRAFT'}`);
    console.log('');
    console.log('🌐 URLs:');
    console.log(`   View: https://engify.ai/learn/${slug}`);
    console.log(`   API:  https://engify.ai/api/learning/${slug}`);
    console.log('');
    
    if (content.includes('placehold.co')) {
      console.log('📝 Note: Using placeholder images');
      console.log('   Add real images to public/images/ and re-run with --update');
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Universal Article Publisher');
    console.log('');
    console.log('Usage:');
    console.log('  tsx scripts/content/publish-article.ts <markdown-file> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --featured    Mark as featured article');
    console.log('  --update      Update if exists (instead of skipping)');
    console.log('  --draft       Publish as draft (status: inactive)');
    console.log('  --help, -h    Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/content/publish-article.ts content/drafts/my-article.md');
    console.log('  tsx scripts/content/publish-article.ts content/drafts/my-article.md --featured');
    console.log('  tsx scripts/content/publish-article.ts content/drafts/my-article.md --update');
    console.log('');
    console.log('Frontmatter Format (required):');
    console.log('  ---');
    console.log('  title: "Article Title"');
    console.log('  description: "Article description"');
    console.log('  slug: "custom-slug" (optional)');
    console.log('  category: "Category Name" (optional)');
    console.log('  keywords: ["tag1", "tag2"] (optional)');
    console.log('  author: "Author Name" (optional)');
    console.log('  featured: true (optional)');
    console.log('  level: "intermediate" (optional: beginner|intermediate|advanced)');
    console.log('  ---');
    process.exit(0);
  }

  const filePath = args[0];
  const options = {
    featured: args.includes('--featured'),
    update: args.includes('--update'),
    draft: args.includes('--draft'),
  };

  await publishArticle(filePath, options);
}

main();

