/**
 * Event Bus Implementation
 *
 * Handles event publishing and subscription for Event Sourcing.
 * Provides decoupled communication between aggregates and projections.
 */

import { IEventBus, IEventHandler, IEvent } from '../types';

/**
 * Event Bus Implementation
 */
export class EventBus implements IEventBus {
  private handlers: Map<string, IEventHandler[]> = new Map();
  private publishedEvents: IEvent[] = [];

  /**
   * Publish a single event
   */
  async publish(event: IEvent): Promise<void> {
    try {
      // Store published event for debugging/testing
      this.publishedEvents.push(event);

      // Get handlers for this event type
      const eventHandlers = this.handlers.get(event.eventType) || [];

      // Execute all handlers
      const handlerPromises = eventHandlers.map((handler) =>
        this.executeHandler(handler, event)
      );

      await Promise.allSettled(handlerPromises);
    } catch (error) {
      console.error(`Failed to publish event ${event.eventType}:`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events
   */
  async publishMany(events: IEvent[]): Promise<void> {
    const publishPromises = events.map((event) => this.publish(event));
    await Promise.allSettled(publishPromises);
  }

  /**
   * Subscribe to an event type
   */
  subscribe<TEvent extends IEvent>(
    eventType: string,
    handler: IEventHandler<TEvent>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.push(handler as IEventHandler);
    }
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(eventType: string, handler: IEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Execute a handler with error handling
   */
  private async executeHandler(
    handler: IEventHandler,
    event: IEvent
  ): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      console.error(
        `Handler ${handler.constructor.name} failed for event ${event.eventType}:`,
        error
      );
      // Don't re-throw to prevent one handler failure from affecting others
    }
  }

  /**
   * Get all published events (for testing)
   */
  getPublishedEvents(): IEvent[] {
    return [...this.publishedEvents];
  }

  /**
   * Clear published events (for testing)
   */
  clearPublishedEvents(): void {
    this.publishedEvents = [];
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }

  /**
   * Get all subscribed event types
   */
  getSubscribedEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Singleton Event Bus Instance
 */
export const eventBus = new EventBus();
