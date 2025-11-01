/**
 * Footer Component
 *
 * Site footer with:
 * - Company info
 * - Navigation links
 * - Social links
 * - Legal links
 */

import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { href: '/demo', label: 'AI Workbench' },
    { href: '/patterns', label: 'Patterns' },
    { href: '/prompts', label: 'Library' },
    { href: '/pricing', label: 'Pricing' },
  ],
  company: [
    { href: '/built-in-public', label: 'About' },
    { href: '/built-in-public', label: 'Built in Public' },
    { href: '/contact', label: 'Contact' },
  ],
  resources: [
    { href: '/learn', label: 'Documentation' },
    { href: '/patterns', label: 'Patterns' },
    { href: '/prompts', label: 'Prompt Library' },
    { href: '/api-docs', label: 'API Reference' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: 'https://github.com/donlaur/Engify-AI-App', label: 'GitHub', external: true },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center space-x-2">
              <Icons.sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Engify.ai</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Master prompt engineering with AI-powered learning and
              gamification.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-sm text-muted-foreground">
            {currentYear} Engify.ai. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <a
              href="mailto:donlaur@engify.ai"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="https://github.com/donlaur/Engify-AI-App"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
            <Link
              href="https://linkedin.com/in/donlaur"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
