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
import { EngifyLogo } from '@/components/branding/EngifyLogo';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { href: '/prompts', label: 'Prompts' },
    { href: '/patterns', label: 'Patterns' },
    { href: '/workflows', label: 'Workflows' },
    { href: '/learn/ai-tools', label: 'Tools' },
    { href: '/learn', label: 'Learn' },
    { href: '/workbench', label: 'Workbench' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/built-in-public', label: 'Built in Public' },
    { href: '/contact', label: 'Contact' },
    {
      href: 'https://www.linkedin.com/company/109804095',
      label: 'LinkedIn',
      external: true,
    },
  ],
  resources: [
    { href: '/learn', label: 'Documentation' },
    { href: '/patterns', label: 'Pattern Reference' },
    { href: '/prompts', label: 'Prompt Playbook' },
  ],
  social: [
    {
      href: 'https://github.com/donlaur/Engify-AI-App',
      label: 'GitHub',
      external: true,
    },
    {
      href: 'https://linkedin.com/in/donlaur',
      label: 'LinkedIn',
      external: true,
    },
    {
      href: '/hireme',
      label: 'Hire Me',
      external: false,
    },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-2" aria-label="Engify.ai home">
              <EngifyLogo className="text-xl" />
            </Link>
            <p className="mb-4 max-w-xs text-sm text-muted-foreground sm:mb-0">
              Operationalize AI guardrails with Engify workflows, automation, and
              institutional memory.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Product</h3>
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
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h3>
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

          {/* Social & Legal Links */}
          <div>
            <h3 className="mb-4 font-semibold">Social</h3>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <h3 className="mb-4 mt-6 font-semibold">Legal</h3>
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

        {/* Bottom Bar - Copyright Only */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Engify.ai. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built by{' '}
            <Link href="/hireme" className="underline hover:text-foreground">
              Donnie Laur
            </Link>
            {' · '}
            <a
              href="mailto:donlaur@engify.ai"
              className="underline hover:text-foreground"
            >
              donlaur@engify.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
