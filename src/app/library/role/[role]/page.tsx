import { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';
import RolePageClient from './role-page-client';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

const ROLE_INFO: Record<string, { title: string; description: string }> = {
  'c-level': {
    title: 'C-Level Executives',
    description: 'Strategic prompts for CTOs, VPs, and executives making high-level technology and organizational decisions.',
  },
  'engineering-manager': {
    title: 'Engineering Managers',
    description: 'Leadership prompts for engineering managers focusing on team management, technical strategy, and process improvement.',
  },
  'engineer': {
    title: 'Engineers',
    description: 'Technical prompts for engineers at all levels - code generation, debugging, architecture, and best practices.',
  },
  'product-manager': {
    title: 'Product Managers',
    description: 'Product strategy, roadmap planning, and feature definition prompts for product managers.',
  },
  'designer': {
    title: 'Designers',
    description: 'Design prompts for UI/UX designers, design systems, user research, and creative workflows.',
  },
  'qa': {
    title: 'QA Engineers',
    description: 'Testing, quality assurance, test automation, and quality strategy prompts for QA engineers.',
  },
  'architect': {
    title: 'Software Architects',
    description: 'System design, architecture decisions, and technical strategy prompts for software architects.',
  },
  'devops-sre': {
    title: 'DevOps & SRE',
    description: 'Infrastructure, deployment, monitoring, and reliability prompts for DevOps and Site Reliability Engineers.',
  },
  'scrum-master': {
    title: 'Scrum Masters',
    description: 'Agile facilitation, sprint planning, and process improvement prompts for Scrum Masters.',
  },
  'product-owner': {
    title: 'Product Owners',
    description: 'Backlog management, user story creation, and product definition prompts for Product Owners.',
  },
};

export async function generateMetadata({ params }: { params: { role: string } }): Promise<Metadata> {
  const role = decodeURIComponent(params.role);
  const roleInfo = ROLE_INFO[role] || {
    title: role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Explore prompt engineering prompts for ${role} professionals.`,
  };

  // Get prompts for this role
  const allPrompts = getSeedPromptsWithTimestamps();
  const rolePrompts = allPrompts.filter((p) => p.role === role);

  const title = `${roleInfo.title} Prompts - Prompt Engineering Library | Engify.ai`;
  const description = `${roleInfo.description} Browse ${rolePrompts.length} prompt${rolePrompts.length !== 1 ? 's' : ''} designed for ${roleInfo.title.toLowerCase()}.`;
  const url = `${APP_URL}/library/role/${encodeURIComponent(role)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'prompt engineering',
      'AI prompts',
      roleInfo.title.toLowerCase(),
      'prompt library',
      'AI tools',
      'prompt templates',
      'role-based prompts',
    ],
  };
}

export default async function RolePage({ params }: { params: { role: string } }) {
  const role = decodeURIComponent(params.role);
  const roleInfo = ROLE_INFO[role] || {
    title: role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Explore prompts for ${role} professionals.`,
  };

  // Get prompts for this role
  const allPrompts = getSeedPromptsWithTimestamps();
  const rolePrompts = allPrompts.filter((p) => p.role === role);

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${roleInfo.title} Prompts`,
    description: roleInfo.description,
    url: `${APP_URL}/library/role/${encodeURIComponent(role)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: rolePrompts.length,
      itemListElement: rolePrompts.slice(0, 10).map((prompt, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: prompt.title,
          description: prompt.description,
          url: `${APP_URL}/library/${prompt.id}`,
        },
      })),
    },
    about: {
      '@type': 'Thing',
      name: roleInfo.title,
      description: `Prompts designed for ${roleInfo.title.toLowerCase()}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RolePageClient role={role} roleInfo={roleInfo} rolePrompts={rolePrompts} />
    </>
  );
}

