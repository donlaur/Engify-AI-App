export interface Message<T = unknown> {
  id: string;
  payload: T;
}

export class InMemoryMessageQueue<T = unknown> {
  private queue: Array<Message<T>> = [];
  private handlers: Array<(m: Message<T>) => Promise<void> | void> = [];
  private paused = false;

  async enqueue(message: Message<T>): Promise<void> {
    this.queue.push(message);
    if (!this.paused) {
      for (const h of this.handlers) {
        if (typeof h === 'function') {
          await h(message);
        }
      }
    }
  }

  async dequeue(): Promise<Message<T> | undefined> {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }

  // Methods expected by tests
  async publish(message: Message<T>): Promise<void> {
    await this.enqueue(message);
  }

  async publishBatch(messages: Array<Message<T>>): Promise<void> {
    for (const m of messages) await this.publish(m);
  }

  async subscribe(
    handler:
      | ((m: Message<T>) => Promise<void> | void)
      | {
          handle?: (m: Message<T>) => Promise<void> | void;
          onMessage?: (m: Message<T>) => Promise<void> | void;
        }
  ): Promise<void> {
    if (typeof handler === 'function') {
      this.handlers.push(handler);
    } else if (handler && typeof handler === 'object') {
      const fn = handler.handle || handler.onMessage;
      if (fn) this.handlers.push(fn.bind(handler));
    }
  }

  async getQueueStats(): Promise<{
    totalMessages: number;
    pendingMessages: number;
    completedMessages: number;
    failedMessages: number;
    deadLetterMessages: number;
  }> {
    return {
      totalMessages: this.queue.length,
      pendingMessages: this.queue.length,
      completedMessages: 0,
      failedMessages: 0,
      deadLetterMessages: 0,
    };
  }

  async purge(): Promise<void> {
    this.queue = [];
  }

  async pause(): Promise<void> {
    this.paused = true;
  }

  async resume(): Promise<void> {
    this.paused = false;
  }

  async getMessage(id: string): Promise<Message<T> | null> {
    return this.queue.find((m) => m.id === id) || null;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const idx = this.queue.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.queue.splice(idx, 1);
    return true;
  }

  async retryMessage(id: string): Promise<void> {
    const msg = await this.getMessage(id);
    if (msg) {
      (msg as unknown as { retryCount?: number; status?: string }).retryCount =
        ((msg as unknown as { retryCount?: number }).retryCount || 0) + 1;
      (msg as unknown as { retryCount?: number; status?: string }).status =
        'pending';
      await this.publish(msg);
    }
  }

  async destroy(): Promise<void> {
    this.queue = [];
    this.handlers = [];
    this.paused = false;
  }
}
