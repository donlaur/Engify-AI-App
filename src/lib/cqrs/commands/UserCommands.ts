/**
 * User Commands
 *
 * Commands for user write operations in the CQRS pattern.
 * Commands represent intentions to change the system state.
 */

import { ICommand } from '../types';

/**
 * Create User Command
 */
export interface CreateUserCommand extends ICommand {
  readonly type: 'CreateUser';
  readonly email: string;
  readonly name: string;
  readonly role?: string;
  readonly plan?: string;
  readonly organizationId?: string;
}

/**
 * Update User Command
 */
export interface UpdateUserCommand extends ICommand {
  readonly type: 'UpdateUser';
  readonly userId: string;
  readonly name?: string;
  readonly role?: string;
  readonly plan?: string;
  readonly organizationId?: string;
  readonly preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weeklyReports?: boolean;
  };
}

/**
 * Delete User Command
 */
export interface DeleteUserCommand extends ICommand {
  readonly type: 'DeleteUser';
  readonly userId: string;
}

/**
 * Update User Last Login Command
 */
export interface UpdateUserLastLoginCommand extends ICommand {
  readonly type: 'UpdateUserLastLogin';
  readonly userId: string;
}

/**
 * Change User Plan Command
 */
export interface ChangeUserPlanCommand extends ICommand {
  readonly type: 'ChangeUserPlan';
  readonly userId: string;
  readonly plan: 'free' | 'basic' | 'pro' | 'enterprise';
}

/**
 * Assign User to Organization Command
 */
export interface AssignUserToOrganizationCommand extends ICommand {
  readonly type: 'AssignUserToOrganization';
  readonly userId: string;
  readonly organizationId: string;
}

/**
 * Remove User from Organization Command
 */
export interface RemoveUserFromOrganizationCommand extends ICommand {
  readonly type: 'RemoveUserFromOrganization';
  readonly userId: string;
}

/**
 * Command factory functions
 */
export const UserCommands = {
  createUser: (
    data: Omit<CreateUserCommand, 'type' | 'timestamp'>
  ): CreateUserCommand => ({
    type: 'CreateUser',
    timestamp: new Date(),
    ...data,
  }),

  updateUser: (
    data: Omit<UpdateUserCommand, 'type' | 'timestamp'>
  ): UpdateUserCommand => ({
    type: 'UpdateUser',
    timestamp: new Date(),
    ...data,
  }),

  deleteUser: (
    data: Omit<DeleteUserCommand, 'type' | 'timestamp'>
  ): DeleteUserCommand => ({
    type: 'DeleteUser',
    timestamp: new Date(),
    ...data,
  }),

  updateLastLogin: (
    data: Omit<UpdateUserLastLoginCommand, 'type' | 'timestamp'>
  ): UpdateUserLastLoginCommand => ({
    type: 'UpdateUserLastLogin',
    timestamp: new Date(),
    ...data,
  }),

  changePlan: (
    data: Omit<ChangeUserPlanCommand, 'type' | 'timestamp'>
  ): ChangeUserPlanCommand => ({
    type: 'ChangeUserPlan',
    timestamp: new Date(),
    ...data,
  }),

  assignToOrganization: (
    data: Omit<AssignUserToOrganizationCommand, 'type' | 'timestamp'>
  ): AssignUserToOrganizationCommand => ({
    type: 'AssignUserToOrganization',
    timestamp: new Date(),
    ...data,
  }),

  removeFromOrganization: (
    data: Omit<RemoveUserFromOrganizationCommand, 'type' | 'timestamp'>
  ): RemoveUserFromOrganizationCommand => ({
    type: 'RemoveUserFromOrganization',
    timestamp: new Date(),
    ...data,
  }),
};
