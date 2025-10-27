import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Engify.ai - AI Prompt Engineering Platform',
    short_name: 'Engify',
    description:
      'From AI Fear to AI Fluency. Learn prompt engineering with 67+ expert prompts and 15 proven patterns.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
