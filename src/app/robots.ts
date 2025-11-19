import { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/settings/',
        '/workbench/',
        '/opshub/',
        '/admin/',
        '/manager/',
        '/_next/', // Block Next.js build assets (CSS, JS, fonts, etc.)
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    // RSS feed is auto-discovered via HTML <link> tag in layout
  };
}
