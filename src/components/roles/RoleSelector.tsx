/**
 * Role Selector Component
 * Navigate between different role-specific pages
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

// Ordered by content volume: Engineers (most) → Managers → Directors → others → Designers (0 prompts)
const roles = [
  {
    id: 'engineers',
    label: 'Engineers',
    icon: Icons.code,
    href: '/for-engineers',
  },
  {
    id: 'managers',
    label: 'Managers',
    icon: Icons.users,
    href: '/for-managers',
  },
  {
    id: 'directors',
    label: 'Directors',
    icon: Icons.briefcase,
    href: '/for-directors',
  },
  {
    id: 'architects',
    label: 'Architects',
    icon: Icons.layers,
    href: '/for-architects',
  },
  {
    id: 'devops-sre',
    label: 'DevOps/SRE',
    icon: Icons.server,
    href: '/for-devops-sre',
  },
  {
    id: 'pms',
    label: 'Product Managers',
    icon: Icons.target,
    href: '/for-pms',
  },
  {
    id: 'product-owners',
    label: 'Product Owners',
    icon: Icons.folder,
    href: '/for-product-owners',
  },
  { id: 'qa', label: 'QA Engineers', icon: Icons.check, href: '/for-qa' },
  {
    id: 'scrum-masters',
    label: 'Scrum Masters',
    icon: Icons.calendar,
    href: '/for-scrum-masters',
  },
  {
    id: 'designers',
    label: 'Designers',
    icon: Icons.palette,
    href: '/for-designers',
  },
];

export function RoleSelector() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto py-4">
          <span className="whitespace-nowrap text-sm font-medium text-gray-700">
            View for:
          </span>
          <div className="flex gap-2">
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = pathname === role.href;

              return (
                <Link key={role.id} href={role.href}>
                  <Badge
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer whitespace-nowrap transition-all hover:scale-105',
                      isActive
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {role.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
