/**
 * User Domain Events
 *
 * Defines all events related to user operations in the Event Sourcing pattern.
 * These events represent state changes in the user aggregate.
 */

import type { IEvent } from './types';

/**
 * User Created Event
 */
export interface UserCreatedEvent extends IEvent {
  readonly eventType: 'UserCreated';
  readonly data: {
    readonly userId: string;
    readonly email: string;
    readonly name: string;
    readonly role: string;
    readonly plan: string;
    readonly organizationId?: string;
  };
}

/**
 * User Updated Event
 */
export interface UserUpdatedEvent extends IEvent {
  readonly eventType: 'UserUpdated';
  readonly data: {
    readonly userId: string;
    readonly changes: {
      readonly name?: string;
      readonly role?: string;
      readonly plan?: string;
      readonly organizationId?: string;
    };
  };
}

/**
 * User Deleted Event
 */
export interface UserDeletedEvent extends IEvent {
  readonly eventType: 'UserDeleted';
  readonly data: {
    readonly userId: string;
    readonly deletedAt: Date;
  };
}

/**
 * User Last Login Updated Event
 */
export interface UserLastLoginUpdatedEvent extends IEvent {
  readonly eventType: 'UserLastLoginUpdated';
  readonly data: {
    readonly userId: string;
    readonly lastLoginAt: Date;
  };
}

/**
 * User Plan Changed Event
 */
export interface UserPlanChangedEvent extends IEvent {
  readonly eventType: 'UserPlanChanged';
  readonly data: {
    readonly userId: string;
    readonly oldPlan: string;
    readonly newPlan: string;
    readonly changedAt: Date;
  };
}

/**
 * User Assigned to Organization Event
 */
export interface UserAssignedToOrganizationEvent extends IEvent {
  readonly eventType: 'UserAssignedToOrganization';
  readonly data: {
    readonly userId: string;
    readonly organizationId: string;
    readonly assignedAt: Date;
  };
}

/**
 * User Removed from Organization Event
 */
export interface UserRemovedFromOrganizationEvent extends IEvent {
  readonly eventType: 'UserRemovedFromOrganization';
  readonly data: {
    readonly userId: string;
    readonly organizationId: string;
    readonly removedAt: Date;
  };
}

/**
 * User Email Verified Event
 */
export interface UserEmailVerifiedEvent extends IEvent {
  readonly eventType: 'UserEmailVerified';
  readonly data: {
    readonly userId: string;
    readonly verifiedAt: Date;
  };
}

/**
 * User Password Changed Event
 */
export interface UserPasswordChangedEvent extends IEvent {
  readonly eventType: 'UserPasswordChanged';
  readonly data: {
    readonly userId: string;
    readonly changedAt: Date;
  };
}

/**
 * Union type for all user events
 */
export type UserEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserLastLoginUpdatedEvent
  | UserPlanChangedEvent
  | UserAssignedToOrganizationEvent
  | UserRemovedFromOrganizationEvent
  | UserEmailVerifiedEvent
  | UserPasswordChangedEvent;

/**
 * Event Factory Functions
 */
export const UserEvents = {
  created: (
    data: Omit<
      UserCreatedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserCreatedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserCreated',
      aggregateType: 'User',
    }) as Omit<
      UserCreatedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  updated: (
    data: Omit<
      UserUpdatedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserUpdatedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserUpdated',
      aggregateType: 'User',
    }) as Omit<
      UserUpdatedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  deleted: (
    data: Omit<
      UserDeletedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserDeletedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserDeleted',
      aggregateType: 'User',
    }) as Omit<
      UserDeletedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  lastLoginUpdated: (
    data: Omit<
      UserLastLoginUpdatedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserLastLoginUpdatedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserLastLoginUpdated',
      aggregateType: 'User',
    }) as Omit<
      UserLastLoginUpdatedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  planChanged: (
    data: Omit<
      UserPlanChangedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserPlanChangedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserPlanChanged',
      aggregateType: 'User',
    }) as Omit<
      UserPlanChangedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  assignedToOrganization: (
    data: Omit<
      UserAssignedToOrganizationEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserAssignedToOrganizationEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserAssignedToOrganization',
      aggregateType: 'User',
    }) as Omit<
      UserAssignedToOrganizationEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  removedFromOrganization: (
    data: Omit<
      UserRemovedFromOrganizationEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserRemovedFromOrganizationEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserRemovedFromOrganization',
      aggregateType: 'User',
    }) as Omit<
      UserRemovedFromOrganizationEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  emailVerified: (
    data: Omit<
      UserEmailVerifiedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserEmailVerifiedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserEmailVerified',
      aggregateType: 'User',
    }) as Omit<
      UserEmailVerifiedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,

  passwordChanged: (
    data: Omit<
      UserPasswordChangedEvent,
      | 'eventType'
      | 'eventId'
      | 'aggregateId'
      | 'aggregateType'
      | 'version'
      | 'timestamp'
    >
  ): Omit<
    UserPasswordChangedEvent,
    'eventId' | 'aggregateId' | 'version' | 'timestamp'
  > =>
    ({
      ...data,
      eventType: 'UserPasswordChanged',
      aggregateType: 'User',
    }) as Omit<
      UserPasswordChangedEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,
};
