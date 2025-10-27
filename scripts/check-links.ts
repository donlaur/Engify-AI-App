/**
 * Link Checker Script
 * Scans all pages for broken internal links
 */

import * as fs from 'fs';
import * as path from 'path';

interface LinkIssue {
  file: string;
  link: string;
  lineNumber: number;
  issue: string;
}

const issues: LinkIssue[] = [];
const validRoutes = new Set<string>();

// Define all valid routes in the app
const knownRoutes = [
  '/',
  '/demo',
  '/demo/rca',
  '/library',
  '/patterns',
  '/learn',
  '/pricing',
  '/login',
  '/signup',
  '/forgot-password',
  '/dashboard',
  '/settings',
  '/onboarding',
  '/workbench',
  '/built-in-public',
  '/for-c-level',
  '/for-directors',
  '/for-managers',
  '/for-engineers',
  '/for-pms',
  '/for-designers',
  '/for-qa',
  '/privacy',
  '/terms',
  '/contact',
  '/about',
  '/offline',
];

// Add known routes
knownRoutes.forEach((route) => validRoutes.add(route));

// Check if a route exists
function routeExists(route: string): boolean {
  // External links are OK
  if (
    route.startsWith('http://') ||
    route.startsWith('https://') ||
    route.startsWith('mailto:')
  ) {
    return true;
  }

  // Anchors are OK
  if (route.startsWith('#')) {
    return true;
  }

  // Remove query params and hash
  const cleanRoute = route.split('?')[0].split('#')[0];

  // Check if it's a known route
  if (validRoutes.has(cleanRoute)) {
    return true;
  }

  // Check if it's a dynamic route pattern
  if (cleanRoute.startsWith('/library/')) return true;
  if (cleanRoute.startsWith('/blog/')) return true;

  // Check if the file exists
  const appDir = path.join(process.cwd(), 'src', 'app');
  const possiblePaths = [
    path.join(appDir, cleanRoute, 'page.tsx'),
    path.join(appDir, cleanRoute, 'page.ts'),
    path.join(appDir, cleanRoute + '.tsx'),
    path.join(appDir, cleanRoute + '.ts'),
  ];

  return possiblePaths.some((p) => fs.existsSync(p));
}

// Extract links from file content
function extractLinks(content: string, filePath: string) {
  const lines = content.split('\n');

  // Patterns to match
  const patterns = [
    /href=["']([^"']+)["']/g, // href="..."
    /to=["']([^"']+)["']/g, // to="..." (for React Router)
    /<Link[^>]+href=["']([^"']+)["']/g, // Next.js Link
  ];

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const link = match[1];

        // Skip certain patterns
        if (
          link.includes('${') ||
          link.includes('{') ||
          link === '/' ||
          link === ''
        ) {
          continue;
        }

        if (!routeExists(link)) {
          issues.push({
            file: filePath,
            link,
            lineNumber: index + 1,
            issue: 'Route does not exist',
          });
        }
      }
    });
  });
}

// Scan directory recursively
function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (
        !['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)
      ) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Only check .tsx, .ts, .jsx, .js files
      if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(process.cwd(), fullPath);
        extractLinks(content, relativePath);
      }
    }
  }
}

// Main execution
console.log('🔍 Scanning for broken links...\n');

const srcDir = path.join(process.cwd(), 'src');
scanDirectory(srcDir);

if (issues.length === 0) {
  console.log('✅ No broken links found!\n');
} else {
  console.log(`❌ Found ${issues.length} potential issues:\n`);

  // Group by file
  const byFile = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    },
    {} as Record<string, LinkIssue[]>
  );

  Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file}`);
    fileIssues.forEach((issue) => {
      console.log(
        `   Line ${issue.lineNumber}: "${issue.link}" - ${issue.issue}`
      );
    });
    console.log('');
  });

  process.exit(1);
}
