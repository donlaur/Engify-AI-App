import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Validate environment variables at startup (Red Hat Review - Critical Fix #1)
import '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Engify.ai - AI Adoption Education Platform',
  description:
    'Learn prompt engineering and AI best practices through curated templates and learning pathways',
  keywords: [
    'AI',
    'prompt engineering',
    'learning',
    'education',
    'ChatGPT',
    'Claude',
    'Gemini',
  ],
  applicationName: 'Engify.ai',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Engify.ai',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-icon-180.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
