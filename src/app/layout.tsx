import type { Metadata, Viewport } from 'next';
// Temporarily disabled Google Fonts due to network issues
// import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { Toaster } from '@/components/ui/toaster';

// Validate environment variables at startup (Red Hat Review - Critical Fix #1)
import '@/lib/env';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Engify.ai - AI Guardrail Platform for Engineering Teams',
  description:
    'Operationalize AI guardrails across code, security, and delivery. Ship faster without shipping regressions using Engify workflows, automation, and institutional memory.',
  keywords: [
    'AI guardrails',
    'engineering governance',
    'software delivery guardrails',
    'ai risk management',
    'guardrail automation',
    'compliance automation',
    'prompt governance',
    'engineering enablement',
    'mcp guardrails',
    'engify',
  ],
  applicationName: 'Engify.ai',
  authors: [{ name: 'Engify.ai Team' }],
  creator: 'Engify.ai',
  publisher: 'Engify.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://engify.ai',
    siteName: 'Engify.ai',
    title: 'Engify.ai - AI Guardrail Platform for Engineering Teams',
    description:
      'Operationalize AI guardrails with production-ready workflows, automation hooks, and institutional memory. Ship responsibly with Engify.',
    images: [
      {
        url: 'https://engify.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Engify.ai - AI Prompt Engineering Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engify.ai - AI Guardrail Platform for Engineering Teams',
    description:
      'Operationalize AI guardrails with Engify workflows, automation hooks, and institutional memory.',
    images: ['https://engify.ai/og-image.png'],
    creator: '@engifyai',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Engify.ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  category: 'education',
  classification: 'Education, AI, Prompt Engineering',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" type="application/rss+xml" title="Engify.ai RSS Feed" href="https://engify.ai/feed" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <GoogleAnalytics />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
