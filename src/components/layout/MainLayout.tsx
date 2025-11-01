/**
 * MainLayout Component
 *
 * Main application layout with:
 * - Header (with dynamic auth state via HeaderClient)
 * - Main content area
 * - Footer
 */

import { ReactNode } from 'react';
import { HeaderClient } from './HeaderClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/features/ChatWidget';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderClient />
      <main className="flex-1">{children}</main>
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      <ChatWidget />
    </div>
  );
}
