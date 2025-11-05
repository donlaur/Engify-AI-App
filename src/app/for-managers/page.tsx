import { Metadata } from 'next';
import { getDbRoleFromSlug } from '@/lib/utils/role-mapping';
import { RoleLandingPageContent, generateRoleMetadata } from '@/components/roles/RoleLandingPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'managers';
  const dbRole = getDbRoleFromSlug(slug);
  return await generateRoleMetadata({ slug, dbRole });
}

export default async function ForManagersPage() {
  const slug = 'managers';
  const dbRole = getDbRoleFromSlug(slug);
  return <RoleLandingPageContent slug={slug} dbRole={dbRole} />;
}