import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Validate environment variables at startup (Red Hat Review - Critical Fix #1)
import '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Engify.ai - AI Prompt Engineering Education Platform',
  description:
    'Transform your team into AI power users with 67+ expert prompts, 15 proven patterns, and gamified learning. Start free!',
  keywords: [
    'AI prompt engineering',
    'prompt templates',
    'AI education',
    'prompt patterns',
    'ChatGPT prompts',
    'AI learning platform',
    'prompt library',
    'engineering prompts',
    'Claude',
    'Gemini',
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
    title: 'Engify.ai - Master AI Prompt Engineering',
    description:
      'Transform engineers into AI power users. 67+ expert prompts, 15 battle-tested patterns, gamified learning. Free forever.',
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
    title: 'Engify.ai - Master AI Prompt Engineering',
    description:
      'Transform engineers into AI power users. 67+ expert prompts, 15 battle-tested patterns. Free forever.',
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
    icon: '/icon-192.png',
    apple: '/apple-icon-180.png',
    shortcut: '/favicon.ico',
  },
  category: 'education',
  classification: 'Education, AI, Prompt Engineering',
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
