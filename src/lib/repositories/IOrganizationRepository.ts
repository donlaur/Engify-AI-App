/**
 * Organization Repository Interface
 */

import { Organization } from '@/types/auth';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  update(id: string, data: Partial<Organization>): Promise<Organization | null>;
  delete(id: string): Promise<boolean>;
}
