/**
 * User Queries
 *
 * Queries for user read operations in the CQRS pattern.
 * Queries represent requests for information without side effects.
 */

import { IQuery } from '../types';

/**
 * Get User By ID Query
 */
export interface GetUserByIdQuery extends IQuery {
  readonly type: 'GetUserById';
  readonly userId: string;
}

/**
 * Get User By Email Query
 */
export interface GetUserByEmailQuery extends IQuery {
  readonly type: 'GetUserByEmail';
  readonly email: string;
}

/**
 * Get All Users Query
 */
export interface GetAllUsersQuery extends IQuery {
  readonly type: 'GetAllUsers';
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Get Users By Role Query
 */
export interface GetUsersByRoleQuery extends IQuery {
  readonly type: 'GetUsersByRole';
  readonly role: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Get Users By Plan Query
 */
export interface GetUsersByPlanQuery extends IQuery {
  readonly type: 'GetUsersByPlan';
  readonly plan: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Get Users By Organization Query
 */
export interface GetUsersByOrganizationQuery extends IQuery {
  readonly type: 'GetUsersByOrganization';
  readonly organizationId: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Search Users Query
 */
export interface SearchUsersQuery extends IQuery {
  readonly type: 'SearchUsers';
  readonly searchTerm: string;
  readonly filters?: {
    role?: string;
    plan?: string;
    organizationId?: string;
  };
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Get User Statistics Query
 */
export interface GetUserStatisticsQuery extends IQuery {
  readonly type: 'GetUserStatistics';
}

/**
 * Get User Count Query
 */
export interface GetUserCountQuery extends IQuery {
  readonly type: 'GetUserCount';
  readonly filters?: {
    role?: string;
    plan?: string;
    organizationId?: string;
  };
}

/**
 * Query factory functions
 */
export const UserQueries = {
  getById: (
    data: Omit<GetUserByIdQuery, 'type' | 'timestamp'>
  ): GetUserByIdQuery => ({
    type: 'GetUserById',
    timestamp: new Date(),
    ...data,
  }),

  getByEmail: (
    data: Omit<GetUserByEmailQuery, 'type' | 'timestamp'>
  ): GetUserByEmailQuery => ({
    type: 'GetUserByEmail',
    timestamp: new Date(),
    ...data,
  }),

  getAll: (
    data: Omit<GetAllUsersQuery, 'type' | 'timestamp'> = {}
  ): GetAllUsersQuery => ({
    type: 'GetAllUsers',
    timestamp: new Date(),
    ...data,
  }),

  getByRole: (
    data: Omit<GetUsersByRoleQuery, 'type' | 'timestamp'>
  ): GetUsersByRoleQuery => ({
    type: 'GetUsersByRole',
    timestamp: new Date(),
    ...data,
  }),

  getByPlan: (
    data: Omit<GetUsersByPlanQuery, 'type' | 'timestamp'>
  ): GetUsersByPlanQuery => ({
    type: 'GetUsersByPlan',
    timestamp: new Date(),
    ...data,
  }),

  getByOrganization: (
    data: Omit<GetUsersByOrganizationQuery, 'type' | 'timestamp'>
  ): GetUsersByOrganizationQuery => ({
    type: 'GetUsersByOrganization',
    timestamp: new Date(),
    ...data,
  }),

  search: (
    data: Omit<SearchUsersQuery, 'type' | 'timestamp'>
  ): SearchUsersQuery => ({
    type: 'SearchUsers',
    timestamp: new Date(),
    ...data,
  }),

  getStatistics: (
    data: Omit<GetUserStatisticsQuery, 'type' | 'timestamp'> = {}
  ): GetUserStatisticsQuery => ({
    type: 'GetUserStatistics',
    timestamp: new Date(),
    ...data,
  }),

  getCount: (
    data: Omit<GetUserCountQuery, 'type' | 'timestamp'> = {}
  ): GetUserCountQuery => ({
    type: 'GetUserCount',
    timestamp: new Date(),
    ...data,
  }),
};
