import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

/**
 * Redirect /library/[id] URLs to /prompts/[id]
 * These are legacy URLs that should redirect to the new route structure
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Return minimal metadata since we're redirecting
  return {
    title: 'Redirecting... | Engify.ai',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LibraryRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  // Permanent redirect (301) to /prompts/[id] for SEO
  permanentRedirect(`/prompts/${encodeURIComponent(params.id)}`);
}

