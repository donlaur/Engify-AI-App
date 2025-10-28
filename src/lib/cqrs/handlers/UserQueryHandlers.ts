/**
 * User Query Handlers
 *
 * Handlers for user read operations in the CQRS pattern.
 * These handlers execute queries to retrieve user information.
 */

import {
  IQueryHandler,
  IQueryResult,
  IQueryValidator,
  IQueryValidationResult,
  IValidationError,
} from '../types';
import {
  GetUserByIdQuery,
  GetUserByEmailQuery,
  GetAllUsersQuery,
  GetUsersByRoleQuery,
  GetUsersByPlanQuery,
  GetUsersByOrganizationQuery,
  SearchUsersQuery,
  GetUserStatisticsQuery,
  GetUserCountQuery,
} from '../queries/UserQueries';
import { UserService } from '../../services/UserService';
import type { User } from '@/lib/db/schema';

/**
 * Get User By ID Query Handler
 */
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery, User>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUserByIdQuery): Promise<IQueryResult<User>> {
    try {
      const user = await this.userService.getUserById(query.userId);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: query.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get User By Email Query Handler
 */
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery, User>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUserByEmailQuery): Promise<IQueryResult<User>> {
    try {
      const user = await this.userService.findUserByEmail(query.email);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: query.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get user by email',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get All Users Query Handler
 */
export class GetAllUsersQueryHandler
  implements IQueryHandler<GetAllUsersQuery, User[]>
{
  constructor(private userService: UserService) {}

  async handle(query: GetAllUsersQuery): Promise<IQueryResult<User[]>> {
    try {
      const users = await this.userService.getAllUsers();

      return {
        success: true,
        data: users,
        totalCount: users.length,
        page: query.page || 1,
        pageSize: query.pageSize || users.length,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get all users',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get Users By Role Query Handler
 */
export class GetUsersByRoleQueryHandler
  implements IQueryHandler<GetUsersByRoleQuery, User[]>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUsersByRoleQuery): Promise<IQueryResult<User[]>> {
    try {
      const users = await this.userService.getUsersByRole(query.role);

      return {
        success: true,
        data: users,
        totalCount: users.length,
        page: query.page || 1,
        pageSize: query.pageSize || users.length,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get users by role',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get Users By Plan Query Handler
 */
export class GetUsersByPlanQueryHandler
  implements IQueryHandler<GetUsersByPlanQuery, User[]>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUsersByPlanQuery): Promise<IQueryResult<User[]>> {
    try {
      const users = await this.userService.getUsersByPlan(query.plan);

      return {
        success: true,
        data: users,
        totalCount: users.length,
        page: query.page || 1,
        pageSize: query.pageSize || users.length,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get users by plan',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get Users By Organization Query Handler
 */
export class GetUsersByOrganizationQueryHandler
  implements IQueryHandler<GetUsersByOrganizationQuery, User[]>
{
  constructor(private userService: UserService) {}

  async handle(
    query: GetUsersByOrganizationQuery
  ): Promise<IQueryResult<User[]>> {
    try {
      const users = await this.userService.getUsersByOrganization(
        query.organizationId
      );

      return {
        success: true,
        data: users,
        totalCount: users.length,
        page: query.page || 1,
        pageSize: query.pageSize || users.length,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get users by organization',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Search Users Query Handler
 */
export class SearchUsersQueryHandler
  implements IQueryHandler<SearchUsersQuery, User[]>
{
  constructor(private userService: UserService) {}

  async handle(query: SearchUsersQuery): Promise<IQueryResult<User[]>> {
    try {
      // For now, we'll use getAllUsers and filter client-side
      // In a real implementation, this would use a search service
      const allUsers = await this.userService.getAllUsers();

      let filteredUsers = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(query.searchTerm.toLowerCase())
      );

      // Apply additional filters
      if (query.filters?.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === query.filters.role
        );
      }
      if (query.filters?.plan) {
        filteredUsers = filteredUsers.filter(
          (user) => user.plan === query.filters.plan
        );
      }
      if (query.filters?.organizationId) {
        filteredUsers = filteredUsers.filter(
          (user) => user.organizationId === query.filters.organizationId
        );
      }

      return {
        success: true,
        data: filteredUsers,
        totalCount: filteredUsers.length,
        page: query.page || 1,
        pageSize: query.pageSize || filteredUsers.length,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to search users',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get User Statistics Query Handler
 */
export class GetUserStatisticsQueryHandler
  implements IQueryHandler<GetUserStatisticsQuery, unknown>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUserStatisticsQuery): Promise<IQueryResult<unknown>> {
    try {
      const stats = await this.userService.getUserStats();

      return {
        success: true,
        data: stats,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get user statistics',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get User Count Query Handler
 */
export class GetUserCountQueryHandler
  implements IQueryHandler<GetUserCountQuery, number>
{
  constructor(private userService: UserService) {}

  async handle(query: GetUserCountQuery): Promise<IQueryResult<number>> {
    try {
      const count = await this.userService.getUserCount();

      return {
        success: true,
        data: count,
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get user count',
        correlationId: query.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Get User By ID Query Validator
 */
export class GetUserByIdQueryValidator
  implements IQueryValidator<GetUserByIdQuery>
{
  async validate(query: GetUserByIdQuery): Promise<IQueryValidationResult> {
    const errors: IValidationError[] = [];

    if (!query.userId || query.userId.trim().length === 0) {
      errors.push({
        field: 'userId',
        message: 'User ID is required',
        code: 'REQUIRED_USER_ID',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
