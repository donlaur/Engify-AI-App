import { type AuditSeverity } from '@/lib/logging/audit';

export type SendGridEventStatus = {
  type: string;
  occurredAt: Date;
  status: 'success' | 'warning' | 'error';
  eventId?: string | null;
  reason?: string | null;
  severity?: AuditSeverity;
};

let lastEvent: SendGridEventStatus | null = null;
let lastError: SendGridEventStatus | null = null;

export function recordSendGridEvent(event: SendGridEventStatus): void {
  lastEvent = event;
  if (event.status === 'error') {
    lastError = event;
  }
}

export function getSendGridEventStatus(): {
  lastEvent: SendGridEventStatus | null;
  lastError: SendGridEventStatus | null;
} {
  return {
    lastEvent,
    lastError,
  };
}

export function resetSendGridEventStatus(): void {
  lastEvent = null;
  lastError = null;
}
