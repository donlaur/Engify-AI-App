'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { clientLogger } from '@/lib/logging/client-logger';

interface DLQMessage {
  message: {
    id: string;
    type: string;
    priority: string;
    payload: unknown;
    metadata: {
      source: string;
      version: string;
      tags?: string[];
    };
    createdAt: string;
    retryCount: number;
  };
  reason: string;
  failedAt: string;
  originalQueue: string;
}

interface DLQStats {
  totalMessages: number;
  oldestMessage: string | null;
  newestMessage: string | null;
}

/**
 * DeadLetterQueuePanel Component
 * 
 * Admin panel for managing dead letter queue (DLQ) messages. Provides
 * interface for viewing, filtering, and processing failed messages.
 * 
 * @component
 * @pattern ADMIN_PANEL, QUEUE_MANAGEMENT
 * @principle DRY - Uses shared components and utilities
 * 
 * @features
 * - DLQ message listing with pagination
 * - Queue statistics display
 * - Filter by queue name
 * - Message details and error information
 * - Retry and delete operations
 * - Message age and retry count tracking
 * 
 * @example
 * ```tsx
 * <DeadLetterQueuePanel />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for monitoring and managing failed messages.
 * Provides interface for DLQ troubleshooting and recovery.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function DeadLetterQueuePanel() {
  const [messages, setMessages] = useState<DLQMessage[]>([]);
  const [stats, setStats] = useState<DLQStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [queueName, setQueueName] = useState('default');
  const [selectedMessage, setSelectedMessage] = useState<DLQMessage | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDLQData();
  }, [queueName]);

  const loadDLQData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dlq?queue=${queueName}&limit=50`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data.messages);
        setStats(result.data.stats);
      } else {
        toast.error('Failed to load DLQ data');
      }
    } catch (error) {
      toast.error('Error loading DLQ data');
      clientLogger.apiError('/api/admin/dlq', error, {
        component: 'DeadLetterQueuePanel',
        action: 'loadDLQData',
      });
    } finally {
      setLoading(false);
    }
  };

  const replayMessage = async (messageId: string) => {
    try {
      const response = await fetch('/api/admin/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'replay',
          queueName,
          messageId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Message replayed successfully');
        loadDLQData();
      } else {
        toast.error(result.error || 'Failed to replay message');
      }
    } catch (error) {
      toast.error('Error replaying message');
      clientLogger.apiError('/api/admin/dlq/replay', error, {
        component: 'DeadLetterQueuePanel',
        action: 'replayMessage',
        messageId: messageId,
      });
    }
  };

  const replaySelected = async () => {
    if (selectedIds.size === 0) {
      toast.error('No messages selected');
      return;
    }

    try {
      const response = await fetch('/api/admin/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'replayBulk',
          queueName,
          messageIds: Array.from(selectedIds),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          `Replayed ${result.data.succeeded} messages, ${result.data.failed} failed`
        );
        setSelectedIds(new Set());
        loadDLQData();
      } else {
        toast.error(result.error || 'Failed to replay messages');
      }
    } catch (error) {
      toast.error('Error replaying messages');
      clientLogger.apiError('/api/admin/dlq/replay-batch', error, {
        component: 'DeadLetterQueuePanel',
        action: 'replayMessages',
        count: selectedMessages.length,
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          queueName,
          messageId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Message deleted successfully');
        loadDLQData();
      } else {
        toast.error(result.error || 'Failed to delete message');
      }
    } catch (error) {
      toast.error('Error deleting message');
      clientLogger.apiError('/api/admin/dlq/delete', error, {
        component: 'DeadLetterQueuePanel',
        action: 'deleteMessage',
        messageId: messageId,
      });
    }
  };

  const purgeDLQ = async () => {
    if (
      !confirm(
        'Are you sure you want to purge ALL messages from the DLQ? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/admin/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purge',
          queueName,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('DLQ purged successfully');
        loadDLQData();
      } else {
        toast.error(result.error || 'Failed to purge DLQ');
      }
    } catch (error) {
      toast.error('Error purging DLQ');
      clientLogger.apiError('/api/admin/dlq/purge', error, {
        component: 'DeadLetterQueuePanel',
        action: 'purgeDLQ',
      });
    }
  };

  const toggleSelection = (messageId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.message.id)));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dead Letter Queue</h2>
          <p className="text-sm text-muted-foreground">
            View and manage failed messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="queue-name" className="sr-only">
            Queue Name
          </Label>
          <Input
            id="queue-name"
            value={queueName}
            onChange={(e) => setQueueName(e.target.value)}
            placeholder="Queue name"
            className="w-40"
          />
          <Button onClick={loadDLQData} variant="outline" disabled={loading}>
            {loading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.refresh className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Icons.alertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oldest Message</CardTitle>
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.oldestMessage
                  ? formatDistanceToNow(new Date(stats.oldestMessage), {
                      addSuffix: true,
                    })
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newest Message</CardTitle>
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.newestMessage
                  ? formatDistanceToNow(new Date(stats.newestMessage), {
                      addSuffix: true,
                    })
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm font-medium">
              {selectedIds.size} message{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button onClick={replaySelected} size="sm">
                <Icons.play className="mr-2 h-4 w-4" />
                Replay Selected
              </Button>
              <Button
                onClick={() => setSelectedIds(new Set())}
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Failed Messages</CardTitle>
              <CardDescription>
                Messages that failed after maximum retries
              </CardDescription>
            </div>
            <Button
              onClick={purgeDLQ}
              variant="destructive"
              size="sm"
              disabled={messages.length === 0}
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Purge All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icons.checkCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages in dead letter queue
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === messages.length}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Message ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Failed At</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.message.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(msg.message.id)}
                        onChange={() => toggleSelection(msg.message.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {msg.message.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{msg.message.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(msg.message.priority)}>
                        {msg.message.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(msg.failedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>{msg.message.retryCount}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {msg.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedMessage(msg);
                            setShowDetails(true);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Icons.eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => replayMessage(msg.message.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Icons.play className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteMessage(msg.message.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Full details of the failed message
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label>Message ID</Label>
                <p className="font-mono text-sm">{selectedMessage.message.id}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm">{selectedMessage.message.type}</p>
              </div>
              <div>
                <Label>Priority</Label>
                <p className="text-sm">{selectedMessage.message.priority}</p>
              </div>
              <div>
                <Label>Failed At</Label>
                <p className="text-sm">
                  {new Date(selectedMessage.failedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Retry Count</Label>
                <p className="text-sm">{selectedMessage.message.retryCount}</p>
              </div>
              <div>
                <Label>Failure Reason</Label>
                <p className="text-sm">{selectedMessage.reason}</p>
              </div>
              <div>
                <Label>Original Queue</Label>
                <p className="text-sm">{selectedMessage.originalQueue}</p>
              </div>
              <div>
                <Label>Payload</Label>
                <pre className="mt-2 rounded-md bg-muted p-4 text-xs overflow-x-auto">
                  {JSON.stringify(selectedMessage.message.payload, null, 2)}
                </pre>
              </div>
              <div>
                <Label>Metadata</Label>
                <pre className="mt-2 rounded-md bg-muted p-4 text-xs overflow-x-auto">
                  {JSON.stringify(selectedMessage.message.metadata, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    replayMessage(selectedMessage.message.id);
                    setShowDetails(false);
                  }}
                  className="flex-1"
                >
                  <Icons.play className="mr-2 h-4 w-4" />
                  Replay Message
                </Button>
                <Button
                  onClick={() => {
                    deleteMessage(selectedMessage.message.id);
                    setShowDetails(false);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <Icons.trash className="mr-2 h-4 w-4" />
                  Delete Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
