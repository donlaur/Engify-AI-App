export interface Message<T = unknown> {
  id: string;
  payload: T;
}

type Handler<T> = {
  handle?: (m: Message<T>) => Promise<void> | void;
  onMessage?: (m: Message<T>) => Promise<void> | void;
  canHandle?: (m: Message<T>) => boolean;
};

export class InMemoryMessageQueue<T = unknown> {
  private queue: Array<Message<T>> = [];
  private handlers: Array<
    Handler<T> | ((m: Message<T>) => Promise<void> | void)
  > = [];
  private paused = false;
  private completed = 0;
  private failed = 0;
  private deadLetter = 0;

  async enqueue(message: Message<T>): Promise<void> {
    this.queue.push(message);
    if (!this.paused) await this.processMessage(message);
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
    const priorityOf = (m: Message<T>) => {
      const p =
        (m as unknown as { payload: { priority?: string } }).payload
          ?.priority || 'normal';
      switch (p) {
        case 'critical':
          return 0;
        case 'high':
          return 1;
        case 'normal':
          return 2;
        case 'low':
          return 3;
        default:
          return 4;
      }
    };
    const sorted = messages
      .slice()
      .sort((a, b) => priorityOf(a) - priorityOf(b));
    for (const m of sorted) await this.publish(m);
  }

  async subscribe(
    handler: ((m: Message<T>) => Promise<void> | void) | Handler<T>
  ): Promise<void> {
    if (typeof handler === 'function') {
      this.handlers.push(handler);
    } else if (handler && typeof handler === 'object') {
      this.handlers.push(handler);
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
      pendingMessages: Math.max(
        this.queue.length - this.completed - this.failed,
        0
      ),
      completedMessages: this.completed,
      failedMessages: this.failed,
      deadLetterMessages: this.deadLetter,
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
    this.completed = 0;
    this.failed = 0;
    this.deadLetter = 0;
  }

  private async processMessage(message: Message<T>): Promise<void> {
    const handlers = this.handlers.slice();
    for (const h of handlers) {
      try {
        if (typeof h === 'function') {
          await h(message);
          this.completed += 1;
        } else {
          const can = h.canHandle ? h.canHandle(message) : true;
          const fn = h.handle || h.onMessage;
          if (can && fn) {
            await fn.call(h, message);
            this.completed += 1;
          }
        }
      } catch {
        this.failed += 1;
      }
    }
  }
}
