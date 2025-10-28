/**
 * CQRS Registration and Setup
 *
 * Registers all command and query handlers with the CQRS bus.
 * This centralizes the configuration of the CQRS pattern.
 */

import { cqrsBus } from '../bus';
import { UserService } from '../../services/UserService';

// Command Handlers
import {
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
  UpdateUserLastLoginCommandHandler,
  ChangeUserPlanCommandHandler,
  AssignUserToOrganizationCommandHandler,
  RemoveUserFromOrganizationCommandHandler,
  CreateUserCommandValidator,
} from './UserCommandHandlers';

// Query Handlers
import {
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  GetAllUsersQueryHandler,
  GetUsersByRoleQueryHandler,
  GetUsersByPlanQueryHandler,
  GetUsersByOrganizationQueryHandler,
  SearchUsersQueryHandler,
  GetUserStatisticsQueryHandler,
  GetUserCountQueryHandler,
  GetUserByIdQueryValidator,
} from './UserQueryHandlers';

/**
 * CQRS Registration Service
 */
export class CQRSRegistrationService {
  constructor(private userService: UserService) {}

  /**
   * Register all command handlers
   */
  registerCommandHandlers(): void {
    // User Command Handlers
    cqrsBus.registerCommandHandler(
      'CreateUser',
      new CreateUserCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'UpdateUser',
      new UpdateUserCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'DeleteUser',
      new DeleteUserCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'UpdateUserLastLogin',
      new UpdateUserLastLoginCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'ChangeUserPlan',
      new ChangeUserPlanCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'AssignUserToOrganization',
      new AssignUserToOrganizationCommandHandler(this.userService)
    );
    cqrsBus.registerCommandHandler(
      'RemoveUserFromOrganization',
      new RemoveUserFromOrganizationCommandHandler(this.userService)
    );
  }

  /**
   * Register all query handlers
   */
  registerQueryHandlers(): void {
    // User Query Handlers
    cqrsBus.registerQueryHandler(
      'GetUserById',
      new GetUserByIdQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUserByEmail',
      new GetUserByEmailQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetAllUsers',
      new GetAllUsersQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUsersByRole',
      new GetUsersByRoleQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUsersByPlan',
      new GetUsersByPlanQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUsersByOrganization',
      new GetUsersByOrganizationQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'SearchUsers',
      new SearchUsersQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUserStatistics',
      new GetUserStatisticsQueryHandler(this.userService)
    );
    cqrsBus.registerQueryHandler(
      'GetUserCount',
      new GetUserCountQueryHandler(this.userService)
    );
  }

  /**
   * Register all validators
   */
  registerValidators(): void {
    // User Command Validators
    cqrsBus.registerCommandValidator(
      'CreateUser',
      new CreateUserCommandValidator()
    );

    // User Query Validators
    cqrsBus.registerQueryValidator(
      'GetUserById',
      new GetUserByIdQueryValidator()
    );
  }

  /**
   * Register all handlers and validators
   */
  registerAll(): void {
    this.registerCommandHandlers();
    this.registerQueryHandlers();
    this.registerValidators();
  }
}

/**
 * Initialize CQRS with dependency injection
 */
export function initializeCQRS(userService: UserService): void {
  const registrationService = new CQRSRegistrationService(userService);
  registrationService.registerAll();

  // CQRS pattern initialized successfully
}
