/**
 * Header Component
 *
 * Main navigation header with:
 * - Logo and branding
 * - Desktop navigation links
 * - Mobile menu toggle
 * - User profile dropdown
 * - Responsive design
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

const navigationLinks = [
  { href: '/patterns', label: 'Patterns' },
  { href: '/prompts', label: 'Library' },
  { href: '/learn', label: 'Learn' },
  { href: '/workbench', label: 'Workbench' },
];

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Icons.sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Engify.ai</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
            title="Home"
          >
            <Icons.home className="h-4 w-4" />
          </Link>
          <Link
            href="/prompts"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
          >
            Prompt Playbooks
          </Link>
          <Link
            href="/patterns"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
          >
            Patterns
          </Link>
          <Link
            href="/learn"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
          >
            Learn
          </Link>
          {process.env.NEXT_PUBLIC_SHOW_PLAYGROUND === 'true' && (
            <Link
              href="/pattern-playground"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
            >
              Playground
            </Link>
          )}
          <Link
            href="/workbench"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary dark:text-foreground/80"
          >
            Workbench
          </Link>
          {/* Removed RAG Chat (mock) and Contact (email not ready) from header */}
          <Link
            href="/ai-workflow"
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
          >
            <Icons.sparkles className="h-3 w-3" />
            AI Workflow
          </Link>
          <Link
            href="/built-in-public"
            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200"
          >
            <Icons.github className="h-3 w-3" />
            Built in Public
          </Link>
          {process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === 'true' && (
            <Link
              href="/opshub"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              title="Admin"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || 'User'}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex md:items-center md:space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {mobileMenuOpen ? (
                  <Icons.close className="h-6 w-6" />
                ) : (
                  <Icons.menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="mt-8 flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <div className="mt-4 border-t pt-4">
                      <Button variant="outline" className="mb-2 w-full" asChild>
                        <Link href="/api/auth/signin">Sign in</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/pattern-playground">
                          Pattern Playground
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
