/**
 * AI Summary: Fails CI when sensitive API routes lack RBAC guards.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function collectRouteFiles(baseDir: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (stats.isFile() && entry === 'route.ts') {
        results.push(fullPath);
      }
    }
  }

  walk(baseDir);
  return results;
}

function fileHasGuard(filePath: string): boolean {
  const content = readFileSync(filePath, 'utf8');
  return (
    content.includes('RBACPresets') ||
    content.includes('withRBAC') ||
    content.includes('requireSuperAdmin') ||
    content.includes('requireOrg')
  );
}

const projectRoot = process.cwd();
const adminRoutes = collectRouteFiles(join(projectRoot, 'src/app/api/admin'));
const v2Routes = collectRouteFiles(join(projectRoot, 'src/app/api/v2'));

const violations: string[] = [];

for (const file of [...adminRoutes, ...v2Routes]) {
  if (!fileHasGuard(file)) {
    violations.push(file.replace(projectRoot, ''));
  }
}

if (violations.length > 0) {
  console.error('❌ Route guard policy failed. RBAC guard missing in:');
  for (const route of violations) {
    console.error(` - ${route}`);
  }
  console.error(
    '\nEnsure RBACPresets or withRBAC is applied to admin/v2 routes.'
  );
  process.exit(1);
}

console.log('✅ Route guard policy check passed.');
