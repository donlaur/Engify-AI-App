/**
 * MainLayout Component
 *
 * Main application layout with:
 * - Header
 * - Sidebar (optional)
 * - Main content area
 * - Footer
 */

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function MainLayout({
  children,
  showSidebar = false,
  user,
}: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        {showSidebar && <Sidebar className="hidden lg:block" />}
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}
