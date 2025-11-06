/**
 * Role Mapping Utilities
 * Maps between URL slugs and database role values
 */

export const DB_ROLE_TO_SLUG: Record<string, string> = {
  'engineer': 'engineers',
  'engineering-manager': 'managers',
  'product-manager': 'pms',
  'qa': 'qa',
  'architect': 'architects',
  'devops-sre': 'devops-sre',
  'scrum-master': 'scrum-masters',
  'product-owner': 'product-owners',
  'director': 'directors',
  'designer': 'designers',
  'c-level': 'c-level',
  'engineering-director': 'engineering-directors',
  'product-director': 'product-directors',
  'vp-engineering': 'vp-engineering',
  'vp-product': 'vp-product',
  'cto': 'ctos',
};

export const SLUG_TO_DB_ROLE: Record<string, string> = {
  'engineers': 'engineer',
  'managers': 'engineering-manager',
  'pms': 'product-manager',
  'qa': 'qa',
  'architects': 'architect',
  'devops-sre': 'devops-sre',
  'scrum-masters': 'scrum-master',
  'product-owners': 'product-owner',
  'directors': 'director',
  'designers': 'designer',
  'c-level': 'c-level',
};

export const ROLE_INFO: Record<string, { title: string; description: string; icon: string }> = {
  'engineer': {
    title: 'Engineers',
    description: 'Technical prompts for engineers at all levels - code generation, debugging, architecture, and best practices.',
    icon: 'code',
  },
  'engineering-manager': {
    title: 'Engineering Managers',
    description: 'Leadership prompts for engineering managers focusing on team management, technical strategy, and process improvement.',
    icon: 'users',
  },
  'product-manager': {
    title: 'Product Managers',
    description: 'Product strategy, roadmap planning, and feature definition prompts for product managers.',
    icon: 'target',
  },
  'qa': {
    title: 'QA Engineers',
    description: 'Testing, quality assurance, test automation, and quality strategy prompts for QA engineers.',
    icon: 'check',
  },
  'architect': {
    title: 'Software Architects',
    description: 'System design, architecture decisions, and technical strategy prompts for software architects.',
    icon: 'layers',
  },
  'devops-sre': {
    title: 'DevOps & SRE',
    description: 'Infrastructure, deployment, monitoring, and reliability prompts for DevOps and Site Reliability Engineers.',
    icon: 'server',
  },
  'scrum-master': {
    title: 'Scrum Masters',
    description: 'Agile facilitation, sprint planning, and process improvement prompts for Scrum Masters.',
    icon: 'calendar',
  },
  'product-owner': {
    title: 'Product Owners',
    description: 'Backlog management, user story creation, and product definition prompts for Product Owners.',
    icon: 'folder',
  },
  'director': {
    title: 'Directors & C-Level',
    description: 'Strategic prompts for CTOs, VPs, and executives making high-level technology and organizational decisions.',
    icon: 'briefcase',
  },
  'designer': {
    title: 'Designers',
    description: 'Design prompts for UI/UX designers, design systems, user research, and creative workflows.',
    icon: 'palette',
  },
  'c-level': {
    title: 'C-Level Executives',
    description: 'Strategic prompts for CTOs, VPs, and executives making high-level technology and organizational decisions.',
    icon: 'briefcase',
  },
  'engineering-director': {
    title: 'Engineering Directors',
    description: 'Leadership prompts for Engineering Directors focusing on team management, technical strategy, skip-level 1-on-1s, and eNPS improvement.',
    icon: 'briefcase',
  },
  'product-director': {
    title: 'Product Directors',
    description: 'Leadership prompts for Product Directors focusing on product strategy, team management, customer impact, and product culture.',
    icon: 'target',
  },
  'vp-engineering': {
    title: 'VP of Engineering',
    description: 'Strategic prompts for VPs of Engineering focusing on scaling organizations, executive communication, and aligning engineering with business goals.',
    icon: 'briefcase',
  },
  'vp-product': {
    title: 'VP of Product',
    description: 'Strategic prompts for VPs of Product focusing on product vision, scaling product orgs, and aligning product strategy with business goals.',
    icon: 'target',
  },
  'cto': {
    title: 'CTO',
    description: 'Strategic prompts for CTOs focusing on technical strategy, architecture decisions, risk management, and executive leadership.',
    icon: 'briefcase',
  },
};

/**
 * Get static page URL for a database role
 */
export function getRolePageUrl(dbRole: string): string {
  const slug = DB_ROLE_TO_SLUG[dbRole] || dbRole;
  return `/for-${slug}`;
}

/**
 * Get database role from static page slug
 */
export function getDbRoleFromSlug(slug: string): string {
  return SLUG_TO_DB_ROLE[slug] || slug;
}

/**
 * Get role info for a database role
 */
export function getRoleInfo(dbRole: string) {
  return ROLE_INFO[dbRole] || {
    title: dbRole.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Explore prompts for ${dbRole} professionals.`,
    icon: 'code',
  };
}

