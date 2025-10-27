/**
 * Sidebar Component
 *
 * Desktop sidebar navigation with:
 * - Main navigation links
 * - User progress/stats
 * - Quick actions
 * - Collapsible sections
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  className?: string;
}

const mainNavigation = [
  { href: '/dashboard', label: 'Dashboard', icon: Icons.home },
  {
    href: '/workbench',
    label: 'AI Workbench',
    icon: Icons.sparkles,
    badge: 'New',
  },
  { href: '/patterns', label: 'Patterns', icon: Icons.book },
  { href: '/library', label: 'Library', icon: Icons.library },
];

const secondaryNavigation = [
  { href: '/progress', label: 'Progress', icon: Icons.trendingUp },
  { href: '/achievements', label: 'Achievements', icon: Icons.trophy },
  { href: '/settings', label: 'Settings', icon: Icons.settings },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 border-r bg-background pb-12', className)}>
      <div className="space-y-4 py-4">
        {/* Main Navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Secondary Navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Your Progress
          </h2>
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* User Stats */}
        <div className="px-3 py-2">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 text-sm font-semibold">Your Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">XP</span>
                <span className="font-medium">1,250 / 2,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patterns</span>
                <span className="font-medium">8 / 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
