import { Metadata } from 'next';
import { WorkbenchPageClient } from './workbench-client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const metadata: Metadata = {
  title: 'AI Workbench - Interactive Prompt Engineering Tools | Engify.ai',
  description:
    'Free interactive tools for prompt engineering, team management, and strategic planning. Token counter, prompt optimizer, OKR workbench, retrospective diagnostician, and tech debt strategist. Beta access during launch.',
  alternates: {
    canonical: `${APP_URL}/workbench`,
  },
  openGraph: {
    title: 'AI Workbench - Interactive Prompt Engineering Tools | Engify.ai',
    description:
      'Free interactive tools for prompt engineering, team management, and strategic planning. Token counter, prompt optimizer, OKR workbench, and more.',
    url: `${APP_URL}/workbench`,
    type: 'website',
    siteName: 'Engify.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Workbench - Interactive Prompt Engineering Tools',
    description:
      'Free interactive tools for prompt engineering, team management, and strategic planning.',
  },
  keywords: [
    'AI workbench',
    'prompt engineering tools',
    'token counter',
    'prompt optimizer',
    'OKR workbench',
    'team management tools',
    'AI productivity tools',
    'prompt engineering utilities',
    'retrospective diagnostician',
    'tech debt strategist',
  ],
};

export default function WorkbenchPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AI Workbench',
            description:
              'Interactive tools for prompt engineering, team management, and strategic planning',
            url: `${APP_URL}/workbench`,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'Token Counter',
              'Prompt Optimizer',
              'OKR Workbench',
              'Retrospective Diagnostician',
              'Tech Debt Strategist',
            ],
          }),
        }}
      />
      <WorkbenchPageClient />
    </>
  );
}

