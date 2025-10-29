/**
 * User Event Handlers
 *
 * Handles user domain events for Event Sourcing.
 * These handlers update read models and trigger side effects.
 */

import { IEventHandler, IEvent } from '../types';
import {
  UserEvent,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserLastLoginUpdatedEvent,
  UserPlanChangedEvent,
  UserAssignedToOrganizationEvent,
} from '../UserEvents';

/**
 * User Audit Trail Handler
 *
 * Records all user events for audit purposes.
 */
export class UserAuditTrailHandler implements IEventHandler<IEvent> {
  readonly eventType = 'UserEvent';

  async handle(event: IEvent): Promise<void> {
    // Type guard to ensure it's a UserEvent
    if (!('data' in event) || !('eventType' in event)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`[AUDIT] User Event: ${event.eventType}`, {
      aggregateId: event.aggregateId,
      version: event.version,
      timestamp: event.timestamp,
      correlationId: event.correlationId,
    });

    // In a real implementation, this would write to an audit log
    // For now, we'll just log the event
  }
}

/**
 * User Statistics Handler
 *
 * Updates user statistics based on events.
 */
export class UserStatisticsHandler implements IEventHandler<IEvent> {
  readonly eventType = 'UserEvent';
  private statistics = {
    totalUsers: 0,
    usersByPlan: new Map<string, number>(),
    usersByRole: new Map<string, number>(),
    activeUsers: 0,
  };

  async handle(event: IEvent): Promise<void> {
    // Type guard: ensure it's a UserEvent
    if (!('eventType' in event) || !event.eventType.startsWith('User')) {
      return;
    }

    const userEvent = event as unknown as UserEvent;
    switch (userEvent.eventType) {
      case 'UserCreated':
        await this.handleUserCreated(userEvent as UserCreatedEvent);
        break;
      case 'UserUpdated':
        await this.handleUserUpdated(userEvent as UserUpdatedEvent);
        break;
      case 'UserDeleted':
        await this.handleUserDeleted(userEvent as UserDeletedEvent);
        break;
      case 'UserLastLoginUpdated':
        await this.handleUserLastLoginUpdated(
          userEvent as UserLastLoginUpdatedEvent
        );
        break;
      case 'UserPlanChanged':
        await this.handleUserPlanChanged(userEvent as UserPlanChangedEvent);
        break;
    }
  }

  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    this.statistics.totalUsers++;

    const plan = event.data.plan;
    const role = event.data.role;

    this.statistics.usersByPlan.set(
      plan,
      (this.statistics.usersByPlan.get(plan) || 0) + 1
    );
    this.statistics.usersByRole.set(
      role,
      (this.statistics.usersByRole.get(role) || 0) + 1
    );
  }

  private async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    // Handle role changes
    if (event.data.changes.role) {
      // This would require getting the old role from the aggregate
      // For now, we'll skip this complex update
    }

    // Handle plan changes
    if (event.data.changes.plan) {
      // This would require getting the old plan from the aggregate
      // For now, we'll skip this complex update
    }
  }

  private async handleUserDeleted(_event: UserDeletedEvent): Promise<void> {
    this.statistics.totalUsers--;
    // Note: We'd need to get the user's plan and role to update statistics
    // This demonstrates the complexity of maintaining statistics from events
  }

  private async handleUserLastLoginUpdated(
    event: UserLastLoginUpdatedEvent
  ): Promise<void> {
    // Update active users count based on recent login
    const daysSinceLogin =
      (Date.now() - event.data.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin <= 30) {
      this.statistics.activeUsers++;
    }
  }

  private async handleUserPlanChanged(
    event: UserPlanChangedEvent
  ): Promise<void> {
    const oldPlan = event.data.oldPlan;
    const newPlan = event.data.newPlan;

    this.statistics.usersByPlan.set(
      oldPlan,
      (this.statistics.usersByPlan.get(oldPlan) || 0) - 1
    );
    this.statistics.usersByPlan.set(
      newPlan,
      (this.statistics.usersByPlan.get(newPlan) || 0) + 1
    );
  }

  getStatistics() {
    return {
      totalUsers: this.statistics.totalUsers,
      usersByPlan: Object.fromEntries(this.statistics.usersByPlan),
      usersByRole: Object.fromEntries(this.statistics.usersByRole),
      activeUsers: this.statistics.activeUsers,
    };
  }
}

/**
 * User Notification Handler
 *
 * Sends notifications based on user events.
 */
export class UserNotificationHandler implements IEventHandler<IEvent> {
  readonly eventType = 'UserEvent';

  async handle(event: IEvent): Promise<void> {
    // Type guard: ensure it's a UserEvent
    if (!('eventType' in event) || !event.eventType.startsWith('User')) {
      return;
    }

    const userEvent = event as unknown as UserEvent;
    switch (userEvent.eventType) {
      case 'UserCreated':
        await this.handleUserCreated(userEvent as UserCreatedEvent);
        break;
      case 'UserPlanChanged':
        await this.handleUserPlanChanged(userEvent as UserPlanChangedEvent);
        break;
      case 'UserAssignedToOrganization':
        await this.handleUserAssignedToOrganization(
          userEvent as UserAssignedToOrganizationEvent
        );
        break;
    }
  }

  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[NOTIFICATION] Welcome email sent to ${event.data.email}`);
    // In a real implementation, this would send a welcome email
  }

  private async handleUserPlanChanged(
    event: UserPlanChangedEvent
  ): Promise<void> {
    // Access IEvent properties via type assertion since UserEvent interfaces extend IEvent
    const baseEvent = event as IEvent;
    // eslint-disable-next-line no-console
    console.log(
      `[NOTIFICATION] Plan change notification sent to user ${baseEvent.aggregateId}`,
      `Plan: ${event.data.oldPlan} → ${event.data.newPlan}`
    );
    // In a real implementation, this would send a plan change notification
  }

  private async handleUserAssignedToOrganization(
    event: UserAssignedToOrganizationEvent
  ): Promise<void> {
    // Access IEvent properties via type assertion since UserEvent interfaces extend IEvent
    const baseEvent = event as IEvent;
    // eslint-disable-next-line no-console
    console.log(
      `[NOTIFICATION] Organization assignment notification sent to user ${baseEvent.aggregateId}`,
      `Organization: ${event.data.organizationId}`
    );
    // In a real implementation, this would notify the user and organization
  }
}

/**
 * User Integration Handler
 *
 * Handles external system integrations based on user events.
 */
export class UserIntegrationHandler implements IEventHandler<IEvent> {
  readonly eventType = 'UserEvent';

  async handle(event: IEvent): Promise<void> {
    // Type guard: ensure it's a UserEvent
    if (!('eventType' in event) || !event.eventType.startsWith('User')) {
      return;
    }

    const userEvent = event as unknown as UserEvent;
    switch (userEvent.eventType) {
      case 'UserCreated':
        await this.handleUserCreated(userEvent as UserCreatedEvent);
        break;
      case 'UserPlanChanged':
        await this.handleUserPlanChanged(userEvent as UserPlanChangedEvent);
        break;
      case 'UserDeleted':
        await this.handleUserDeleted(userEvent as UserDeletedEvent);
        break;
    }
  }

  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // Access IEvent properties via type assertion since UserEvent interfaces extend IEvent
    const baseEvent = event as IEvent;
    // eslint-disable-next-line no-console
    console.log(
      `[INTEGRATION] Creating Stripe customer for user ${baseEvent.aggregateId}`
    );
    // In a real implementation, this would create a Stripe customer
  }

  private async handleUserPlanChanged(
    event: UserPlanChangedEvent
  ): Promise<void> {
    // Access IEvent properties via type assertion since UserEvent interfaces extend IEvent
    const baseEvent = event as IEvent;
    // eslint-disable-next-line no-console
    console.log(
      `[INTEGRATION] Updating Stripe subscription for user ${baseEvent.aggregateId}`
    );
    // In a real implementation, this would update the Stripe subscription
  }

  private async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    // Access IEvent properties via type assertion since UserEvent interfaces extend IEvent
    const baseEvent = event as IEvent;
    // eslint-disable-next-line no-console
    console.log(
      `[INTEGRATION] Cancelling Stripe subscription for user ${baseEvent.aggregateId}`
    );
    // In a real implementation, this would cancel the Stripe subscription
  }
}
