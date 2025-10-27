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

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

const navigationLinks = [
  { href: '/workbench', label: 'AI Workbench' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/library', label: 'Library' },
  { href: '/learn', label: 'Learn' },
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
            href="/patterns"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Patterns
          </Link>
          <Link
            href="/learn"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Learn
          </Link>
          {/* Pricing temporarily hidden */}
          {/* <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Pricing
          </Link> */}
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
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
                <Link href="/api/auth/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/api/auth/signin">Get Started</Link>
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
                        <Link href="/api/auth/signin">Get Started</Link>
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
