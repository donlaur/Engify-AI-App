/**
 * User Command Handlers
 *
 * Handlers for user write operations in the CQRS pattern.
 * These handlers execute the business logic for user commands.
 */

import {
  ICommandHandler,
  ICommandResult,
  ICommandValidator,
  ICommandValidationResult,
  IValidationError,
} from '../types';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  UpdateUserLastLoginCommand,
  ChangeUserPlanCommand,
  AssignUserToOrganizationCommand,
  RemoveUserFromOrganizationCommand,
} from '../commands/UserCommands';
import { UserService } from '../../services/UserService';
import type { User } from '@/lib/db/schema';

/**
 * Create User Command Handler
 */
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, User>
{
  constructor(private userService: UserService) {}

  async handle(command: CreateUserCommand): Promise<ICommandResult<User>> {
    try {
      const user = await this.userService.createUser({
        email: command.email,
        name: command.name,
        role: command.role || 'user',
        plan: command.plan || 'free',
        organizationId: command.organizationId,
      });

      return {
        success: true,
        data: user,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Update User Command Handler
 */
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand, User>
{
  constructor(private userService: UserService) {}

  async handle(command: UpdateUserCommand): Promise<ICommandResult<User>> {
    try {
      const user = await this.userService.updateUser(command.userId, {
        name: command.name,
        role: command.role,
        plan: command.plan,
        organizationId: command.organizationId,
        preferences: command.preferences,
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: command.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Delete User Command Handler
 */
export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand, boolean>
{
  constructor(private userService: UserService) {}

  async handle(command: DeleteUserCommand): Promise<ICommandResult<boolean>> {
    try {
      const deleted = await this.userService.deleteUser(command.userId);

      return {
        success: true,
        data: deleted,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Update User Last Login Command Handler
 */
export class UpdateUserLastLoginCommandHandler
  implements ICommandHandler<UpdateUserLastLoginCommand, void>
{
  constructor(private userService: UserService) {}

  async handle(
    command: UpdateUserLastLoginCommand
  ): Promise<ICommandResult<void>> {
    try {
      await this.userService.updateLastLogin(command.userId);

      return {
        success: true,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update last login',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Change User Plan Command Handler
 */
export class ChangeUserPlanCommandHandler
  implements ICommandHandler<ChangeUserPlanCommand, User>
{
  constructor(private userService: UserService) {}

  async handle(command: ChangeUserPlanCommand): Promise<ICommandResult<User>> {
    try {
      const user = await this.userService.updateUser(command.userId, {
        plan: command.plan,
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: command.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to change user plan',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Assign User to Organization Command Handler
 */
export class AssignUserToOrganizationCommandHandler
  implements ICommandHandler<AssignUserToOrganizationCommand, User>
{
  constructor(private userService: UserService) {}

  async handle(
    command: AssignUserToOrganizationCommand
  ): Promise<ICommandResult<User>> {
    try {
      const user = await this.userService.updateUser(command.userId, {
        organizationId: command.organizationId,
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: command.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to assign user to organization',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Remove User from Organization Command Handler
 */
export class RemoveUserFromOrganizationCommandHandler
  implements ICommandHandler<RemoveUserFromOrganizationCommand, User>
{
  constructor(private userService: UserService) {}

  async handle(
    command: RemoveUserFromOrganizationCommand
  ): Promise<ICommandResult<User>> {
    try {
      const user = await this.userService.updateUser(command.userId, {
        organizationId: undefined, // Use undefined instead of null to match UpdateUserData
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          correlationId: command.correlationId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: user,
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove user from organization',
        correlationId: command.correlationId,
        timestamp: new Date(),
      };
    }
  }
}

/**
 * Create User Command Validator
 */
export class CreateUserCommandValidator
  implements ICommandValidator<CreateUserCommand>
{
  async validate(
    command: CreateUserCommand
  ): Promise<ICommandValidationResult> {
    const errors: IValidationError[] = [];

    if (!command.email || !command.email.includes('@')) {
      errors.push({
        field: 'email',
        message: 'Valid email address is required',
        code: 'INVALID_EMAIL',
      });
    }

    if (!command.name || command.name.trim().length < 1) {
      errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_NAME',
      });
    }

    if (command.name && command.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'Name must be less than 100 characters',
        code: 'NAME_TOO_LONG',
      });
    }

    if (
      command.role &&
      !['user', 'admin', 'moderator'].includes(command.role)
    ) {
      errors.push({
        field: 'role',
        message: 'Invalid role specified',
        code: 'INVALID_ROLE',
      });
    }

    if (
      command.plan &&
      !['free', 'basic', 'pro', 'enterprise'].includes(command.plan)
    ) {
      errors.push({
        field: 'plan',
        message: 'Invalid plan specified',
        code: 'INVALID_PLAN',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
