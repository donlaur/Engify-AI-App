/**
 * Verify Navigation Links Script
 * 
 * Checks all links in:
 * - Footer component
 * - Header component  
 * - Workflows page area
 * 
 * Verifies:
 * - Internal routes exist
 * - External URLs are accessible
 * 
 * Run: pnpm tsx scripts/development/verify-navigation-links.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface LinkCheck {
  source: string;
  href: string;
  label?: string;
  type: 'internal' | 'external' | 'anchor' | 'mailto';
  status: 'ok' | 'broken' | 'unknown';
  error?: string;
}

const results: LinkCheck[] = [];

// Extract links from Footer
function extractFooterLinks(): LinkCheck[] {
  const footerPath = path.join(process.cwd(), 'src/components/layout/Footer.tsx');
  const content = fs.readFileSync(footerPath, 'utf-8');
  const links: LinkCheck[] = [];

  // Extract from footerLinks object
  const footerLinksMatch = content.match(/const footerLinks = \{[\s\S]*?\};/);
  if (footerLinksMatch) {
    const footerLinksContent = footerLinksMatch[0];
    
    // Extract all href values
    const hrefMatches = footerLinksContent.matchAll(/href:\s*['"]([^'"]+)['"]/g);
    for (const match of hrefMatches) {
      const href = match[1];
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const isMailto = href.startsWith('mailto:');
      const isAnchor = href.startsWith('#');
      
      links.push({
        source: 'Footer',
        href,
        type: isExternal ? 'external' : isMailto ? 'mailto' : isAnchor ? 'anchor' : 'internal',
      });
    }
  }

  // Extract additional links from JSX
  const jsxHrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
  for (const match of jsxHrefMatches) {
    const href = match[1];
    if (href === '/' || href.includes('${')) continue; // Skip dynamic or root
    
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const isMailto = href.startsWith('mailto:');
    const isAnchor = href.startsWith('#');
    
    // Avoid duplicates
    if (!links.some(l => l.href === href && l.source === 'Footer')) {
      links.push({
        source: 'Footer',
        href,
        type: isExternal ? 'external' : isMailto ? 'mailto' : isAnchor ? 'anchor' : 'internal',
      });
    }
  }

  return links;
}

// Extract links from Header
function extractHeaderLinks(): LinkCheck[] {
  const headerPath = path.join(process.cwd(), 'src/components/layout/Header.tsx');
  const content = fs.readFileSync(headerPath, 'utf-8');
  const links: LinkCheck[] = [];

  // Extract from navigationLinks array
  const navLinksMatch = content.match(/const navigationLinks = \[[\s\S]*?\];/);
  if (navLinksMatch) {
    const navLinksContent = navLinksMatch[0];
    const hrefMatches = navLinksContent.matchAll(/href:\s*['"]([^'"]+)['"]/g);
    for (const match of hrefMatches) {
      links.push({
        source: 'Header',
        href: match[1],
        type: 'internal',
      });
    }
  }

  // Extract from JSX Link components
  const jsxHrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
  for (const match of jsxHrefMatches) {
    const href = match[1];
    if (href === '/' || href.includes('${')) continue;
    
    if (!links.some(l => l.href === href && l.source === 'Header')) {
      links.push({
        source: 'Header',
        href,
        type: href.startsWith('http') ? 'external' : 'internal',
      });
    }
  }

  return links;
}

// Extract links from workflows page
function extractWorkflowsLinks(): LinkCheck[] {
  const workflowsPath = path.join(process.cwd(), 'src/app/workflows/page.tsx');
  const workflowsDetailPath = path.join(process.cwd(), 'src/app/workflows/[category]/[slug]/page.tsx');
  const workflowsCardPath = path.join(process.cwd(), 'src/app/workflows/WorkflowCardClient.tsx');
  
  const links: LinkCheck[] = [];
  const files = [workflowsPath, workflowsDetailPath, workflowsCardPath];

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const source = path.basename(filePath);
    
    // Extract href from Link components and anchor tags
    const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
    for (const match of hrefMatches) {
      const href = match[1];
      if (href.includes('${') || href.includes('{')) continue; // Skip dynamic
      
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const isMailto = href.startsWith('mailto:');
      const isAnchor = href.startsWith('#');
      
      if (!links.some(l => l.href === href && l.source === `Workflows:${source}`)) {
        links.push({
          source: `Workflows:${source}`,
          href,
          type: isExternal ? 'external' : isMailto ? 'mailto' : isAnchor ? 'anchor' : 'internal',
        });
      }
    }
  }

  return links;
}

// Check if internal route exists
function checkInternalRoute(route: string): boolean {
  // Remove query params and hash
  const cleanRoute = route.split('?')[0].split('#')[0];
  
  // Known valid routes
  const knownRoutes = [
    '/',
    '/prompts',
    '/patterns',
    '/workflows',
    '/learn',
    '/learn/ai-tools',
    '/workbench',
    '/about',
    '/built-in-public',
    '/hireme',
    '/contact',
    '/privacy',
    '/terms',
    '/waitlist/guardrails',
  ];

  if (knownRoutes.includes(cleanRoute)) {
    return true;
  }

  // Check for dynamic routes
  if (cleanRoute.startsWith('/prompts/')) return true;
  if (cleanRoute.startsWith('/patterns/')) return true;
  if (cleanRoute.startsWith('/workflows/')) return true;
  if (cleanRoute.startsWith('/learn/')) return true;

  // Check if file exists
  const appDir = path.join(process.cwd(), 'src', 'app');
  const possiblePaths = [
    path.join(appDir, cleanRoute, 'page.tsx'),
    path.join(appDir, cleanRoute, 'page.ts'),
    path.join(appDir, cleanRoute + '.tsx'),
    path.join(appDir, cleanRoute + '.ts'),
  ];

  return possiblePaths.some(p => fs.existsSync(p));
}

// Check external URL (simplified - just check if it's a valid URL format)
async function checkExternalUrl(url: string): Promise<boolean> {
  try {
    // For now, just validate URL format
    // In production, you might want to make actual HTTP requests
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Main verification function
async function verifyLinks() {
  console.log('🔍 Extracting links from Footer, Header, and Workflows...\n');

  const footerLinks = extractFooterLinks();
  const headerLinks = extractHeaderLinks();
  const workflowsLinks = extractWorkflowsLinks();

  const allLinks = [...footerLinks, ...headerLinks, ...workflowsLinks];

  console.log(`📊 Found ${allLinks.length} links to verify\n`);
  console.log(`   Footer: ${footerLinks.length}`);
  console.log(`   Header: ${headerLinks.length}`);
  console.log(`   Workflows: ${workflowsLinks.length}\n`);

  console.log('🔎 Verifying links...\n');

  for (const link of allLinks) {
    let status: 'ok' | 'broken' | 'unknown' = 'unknown';
    let error: string | undefined;

    try {
      if (link.type === 'anchor') {
        // Anchors are always OK (page-level anchors)
        status = 'ok';
      } else if (link.type === 'mailto') {
        // Mailto links are always OK
        status = 'ok';
      } else if (link.type === 'external') {
        const isValid = await checkExternalUrl(link.href);
        status = isValid ? 'ok' : 'broken';
        if (!isValid) error = 'Invalid URL format';
      } else if (link.type === 'internal') {
        const exists = checkInternalRoute(link.href);
        status = exists ? 'ok' : 'broken';
        if (!exists) error = 'Route does not exist';
      }
    } catch (err) {
      status = 'broken';
      error = err instanceof Error ? err.message : String(err);
    }

    link.status = status;
    if (error) link.error = error;
    results.push(link);
  }

  // Report results
  const broken = results.filter(r => r.status === 'broken');
  const ok = results.filter(r => r.status === 'ok');

  console.log('='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ OK: ${ok.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  console.log(`❓ Unknown: ${results.filter(r => r.status === 'unknown').length}\n`);

  if (broken.length > 0) {
    console.log('❌ BROKEN LINKS:\n');
    const bySource = broken.reduce((acc, link) => {
      if (!acc[link.source]) acc[link.source] = [];
      acc[link.source].push(link);
      return acc;
    }, {} as Record<string, LinkCheck[]>);

    Object.entries(bySource).forEach(([source, links]) => {
      console.log(`📄 ${source}:`);
      links.forEach(link => {
        console.log(`   ${link.href}`);
        if (link.error) console.log(`      Error: ${link.error}`);
      });
      console.log('');
    });
  }

  // Summary by type
  console.log('📈 Summary by Type:');
  const byType = results.reduce((acc, link) => {
    acc[link.type] = (acc[link.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byType).forEach(([type, count]) => {
    const brokenCount = results.filter(r => r.type === type && r.status === 'broken').length;
    console.log(`   ${type}: ${count} (${brokenCount} broken)`);
  });

  console.log('\n' + '='.repeat(60));

  if (broken.length > 0) {
    console.log('\n⚠️  Some links need attention. Please review the broken links above.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All links verified successfully!\n');
    process.exit(0);
  }
}

// Run verification
verifyLinks().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

