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

const roles = [
  { id: 'directors', label: 'Directors', icon: Icons.briefcase, href: '/for-directors' },
  { id: 'managers', label: 'Managers', icon: Icons.users, href: '/for-managers' },
  { id: 'engineers', label: 'Engineers', icon: Icons.code, href: '/for-engineers' },
  { id: 'designers', label: 'Designers', icon: Icons.palette, href: '/for-designers' },
  { id: 'pms', label: 'Product Managers', icon: Icons.target, href: '/for-pms' },
  { id: 'qa', label: 'QA Engineers', icon: Icons.checkCircle, href: '/for-qa' },
];

export function RoleSelector() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto py-4">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">View for:</span>
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
                      isActive && 'bg-gradient-to-r from-purple-600 to-pink-600'
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
