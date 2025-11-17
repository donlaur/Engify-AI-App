const processedMessages = new Set<string>();
const MAX_PROCESSED_CACHE = 1000;

export function hasProcessedMessage(messageId: string | null): boolean {
  if (!messageId) {
    return false;
  }
  if (processedMessages.has(messageId)) {
    return true;
  }
  processedMessages.add(messageId);
  if (processedMessages.size > MAX_PROCESSED_CACHE) {
    const first = processedMessages.values().next().value;
    if (first) {
      processedMessages.delete(first);
    }
  }
  return false;
}

export function resetTwilioWebhookState(): void {
  processedMessages.clear();
}

