import { Metadata } from 'next';
import { getDbRoleFromSlug } from '@/lib/utils/role-mapping';
import { RoleLandingPageContent, generateRoleMetadata } from '@/components/roles/RoleLandingPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'designers';
  const dbRole = getDbRoleFromSlug(slug);
  return await generateRoleMetadata({ slug, dbRole });
}

export default async function ForDesignersPage() {
  const slug = 'designers';
  const dbRole = getDbRoleFromSlug(slug);
  return <RoleLandingPageContent slug={slug} dbRole={dbRole} />;
}