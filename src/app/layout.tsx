import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
