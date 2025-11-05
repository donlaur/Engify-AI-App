import { Metadata } from 'next';
import { getDbRoleFromSlug } from '@/lib/utils/role-mapping';
import { RoleLandingPageContent, generateRoleMetadata } from '@/components/roles/RoleLandingPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'devops-sre';
  const dbRole = getDbRoleFromSlug(slug);
  return await generateRoleMetadata({ slug, dbRole });
}

export default async function ForDevOpsSREPage() {
  const slug = 'devops-sre';
  const dbRole = getDbRoleFromSlug(slug);
  return <RoleLandingPageContent slug={slug} dbRole={dbRole} />;
}
