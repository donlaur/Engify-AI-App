/**
 * User Aggregate
 *
 * Implements Event Sourcing for the User aggregate.
 * The aggregate is reconstructed from events and generates new events for state changes.
 */

import { IEvent } from './types';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserLastLoginUpdatedEvent,
  UserPlanChangedEvent,
  UserAssignedToOrganizationEvent,
  UserRemovedFromOrganizationEvent,
  UserEmailVerifiedEvent,
  UserPasswordChangedEvent,
  UserEvents,
} from './UserEvents';

/**
 * User Aggregate State
 */
export interface UserState {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly plan: string;
  readonly organizationId?: string;
  readonly emailVerified: boolean;
  readonly lastLoginAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
  readonly version: number;
}

/**
 * User Aggregate
 */
export class UserAggregate {
  private state: UserState;
  private uncommittedEvents: IEvent[] = [];

  constructor(events: IEvent[] = []) {
    this.state = this.buildStateFromEvents(events);
  }

  /**
   * Build state from events
   */
  private buildStateFromEvents(events: IEvent[]): UserState {
    let state: Partial<Omit<UserState, 'version'>> & { version?: number } = {
      version: -1,
    };

    for (const event of events) {
      state = this.applyEvent(state, event);
      state.version = event.version;
    }

    // If no events, return empty state
    if (!state.id) {
      return {
        id: '',
        email: '',
        name: '',
        role: '',
        plan: '',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: -1,
      };
    }

    return state as UserState;
  }

  /**
   * Apply an event to the state
   */
  private applyEvent(
    state: Partial<Omit<UserState, 'version'>> & { version?: number },
    event: IEvent
  ): Partial<Omit<UserState, 'version'>> & { version?: number } {
    switch (event.eventType) {
      case 'UserCreated':
        return this.applyUserCreated(
          state,
          event as unknown as UserCreatedEvent
        );
      case 'UserUpdated':
        return this.applyUserUpdated(
          state,
          event as unknown as UserUpdatedEvent
        );
      case 'UserDeleted':
        return this.applyUserDeleted(
          state,
          event as unknown as UserDeletedEvent
        );
      case 'UserLastLoginUpdated':
        return this.applyUserLastLoginUpdated(
          state,
          event as unknown as UserLastLoginUpdatedEvent
        );
      case 'UserPlanChanged':
        return this.applyUserPlanChanged(
          state,
          event as unknown as UserPlanChangedEvent
        );
      case 'UserAssignedToOrganization':
        return this.applyUserAssignedToOrganization(
          state,
          event as unknown as UserAssignedToOrganizationEvent
        );
      case 'UserRemovedFromOrganization':
        return this.applyUserRemovedFromOrganization(
          state,
          event as unknown as UserRemovedFromOrganizationEvent
        );
      case 'UserEmailVerified':
        return this.applyUserEmailVerified(
          state,
          event as unknown as UserEmailVerifiedEvent
        );
      case 'UserPasswordChanged':
        return this.applyUserPasswordChanged(
          state,
          event as unknown as UserPasswordChangedEvent
        );
      default:
        return state;
    }
  }

  private applyUserCreated(
    state: Partial<Omit<UserState, 'version'>> & { version?: number },
    event: UserCreatedEvent
  ): Partial<Omit<UserState, 'version'>> & { version?: number } {
    return {
      ...state,
      id: event.data.userId,
      email: event.data.email,
      name: event.data.name,
      role: event.data.role,
      plan: event.data.plan,
      organizationId: event.data.organizationId,
      emailVerified: false,
      createdAt: (event as unknown as IEvent).timestamp,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserUpdated(
    state: Partial<UserState>,
    event: UserUpdatedEvent
  ): Partial<UserState> {
    return {
      ...state,
      ...event.data.changes,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserDeleted(
    state: Partial<UserState>,
    event: UserDeletedEvent
  ): Partial<UserState> {
    return {
      ...state,
      deletedAt: event.data.deletedAt,
    };
  }

  private applyUserLastLoginUpdated(
    state: Partial<UserState>,
    event: UserLastLoginUpdatedEvent
  ): Partial<UserState> {
    return {
      ...state,
      lastLoginAt: event.data.lastLoginAt,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserPlanChanged(
    state: Partial<UserState>,
    event: UserPlanChangedEvent
  ): Partial<UserState> {
    return {
      ...state,
      plan: event.data.newPlan,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserAssignedToOrganization(
    state: Partial<UserState>,
    event: UserAssignedToOrganizationEvent
  ): Partial<UserState> {
    return {
      ...state,
      organizationId: event.data.organizationId,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserRemovedFromOrganization(
    state: Partial<UserState>,
    event: UserRemovedFromOrganizationEvent
  ): Partial<UserState> {
    return {
      ...state,
      organizationId: undefined,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserEmailVerified(
    state: Partial<UserState>,
    event: UserEmailVerifiedEvent
  ): Partial<UserState> {
    return {
      ...state,
      emailVerified: true,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  private applyUserPasswordChanged(
    state: Partial<UserState>,
    event: UserPasswordChangedEvent
  ): Partial<UserState> {
    return {
      ...state,
      updatedAt: (event as unknown as IEvent).timestamp,
    };
  }

  /**
   * Create a new user
   */
  createUser(
    userId: string,
    email: string,
    name: string,
    role: string = 'user',
    plan: string = 'free',
    organizationId?: string,
    correlationId?: string
  ): void {
    if (this.state.id) {
      throw new Error('User already exists');
    }

    const event = this.createEvent(
      UserEvents.created({
        data: {
          userId,
          email,
          name,
          role,
          plan,
          organizationId,
        },
        correlationId,
      }) as unknown as Omit<
        IEvent,
        'eventId' | 'aggregateId' | 'version' | 'timestamp'
      >,
      userId
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Update user
   */
  updateUser(
    changes: {
      name?: string;
      role?: string;
      plan?: string;
      organizationId?: string;
    },
    correlationId?: string
  ): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    const event = this.createEvent(
      UserEvents.updated({
        data: {
          userId: this.state.id,
          changes,
        },
        correlationId,
      }) as unknown as Omit<
        IEvent,
        'eventId' | 'aggregateId' | 'version' | 'timestamp'
      >,
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Delete user
   */
  deleteUser(correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('User already deleted');
    }

    const event = this.createEvent(
      UserEvents.deleted({
        data: {
          userId: this.state.id,
          deletedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Update last login
   */
  updateLastLogin(correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    const event = this.createEvent(
      UserEvents.lastLoginUpdated({
        data: {
          userId: this.state.id,
          lastLoginAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Change user plan
   */
  changePlan(newPlan: string, correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    if (this.state.plan === newPlan) {
      return; // No change needed
    }

    const event = this.createEvent(
      UserEvents.planChanged({
        data: {
          userId: this.state.id,
          oldPlan: this.state.plan,
          newPlan,
          changedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Assign user to organization
   */
  assignToOrganization(organizationId: string, correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    if (this.state.organizationId === organizationId) {
      return; // Already assigned
    }

    const event = this.createEvent(
      UserEvents.assignedToOrganization({
        data: {
          userId: this.state.id,
          organizationId,
          assignedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Remove user from organization
   */
  removeFromOrganization(correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    if (!this.state.organizationId) {
      return; // Not assigned to any organization
    }

    const event = this.createEvent(
      UserEvents.removedFromOrganization({
        data: {
          userId: this.state.id,
          organizationId: this.state.organizationId,
          removedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Verify user email
   */
  verifyEmail(correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    if (this.state.emailVerified) {
      return; // Already verified
    }

    const event = this.createEvent(
      UserEvents.emailVerified({
        data: {
          userId: this.state.id,
          verifiedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Change user password
   */
  changePassword(correlationId?: string): void {
    if (!this.state.id) {
      throw new Error('User does not exist');
    }

    if (this.state.deletedAt) {
      throw new Error('Cannot update deleted user');
    }

    const event = this.createEvent(
      UserEvents.passwordChanged({
        data: {
          userId: this.state.id,
          changedAt: new Date(),
        },
        correlationId,
      }),
      this.state.id
    );

    this.uncommittedEvents.push(event);
    this.state = {
      ...this.applyEvent(this.state, event),
      version: event.version,
    } as UserState;
  }

  /**
   * Create an event with proper metadata
   */
  private createEvent(
    eventData: Omit<
      IEvent,
      'eventId' | 'aggregateId' | 'version' | 'timestamp'
    >,
    aggregateId: string
  ): IEvent {
    return {
      ...eventData,
      eventId: this.generateEventId(),
      aggregateId,
      version: this.state.version + 1,
      timestamp: new Date(),
    };
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current state
   */
  getState(): UserState {
    return { ...this.state };
  }

  /**
   * Get uncommitted events
   */
  getUncommittedEvents(): IEvent[] {
    return [...this.uncommittedEvents];
  }

  /**
   * Mark events as committed
   */
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  /**
   * Get aggregate ID
   */
  getId(): string {
    return this.state.id;
  }

  /**
   * Get current version
   */
  getVersion(): number {
    return this.state.version;
  }
}
