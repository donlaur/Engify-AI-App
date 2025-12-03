/**
 * Access Requests Admin Page
 *
 * View and manage beta access requests
 */

'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

interface AccessRequest {
  _id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  useCase?: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  ref?: string;
  version?: string;
  source?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  spam: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'spam'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/access-requests');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Admin access required. Please sign in with an admin account.');
          return;
        }
        throw new Error('Failed to fetch requests');
      }
      const data = await res.json();
      setRequests(data.requests);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string, sendEmail = false) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/access-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, sendApprovalEmail: sendEmail }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchRequests();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/access-requests?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchRequests();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r =>
    filter === 'all' || r.status === filter
  );

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    spam: requests.filter(r => r.status === 'spam').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSpamLikely = (req: AccessRequest) => {
    // Simple spam detection
    const name = req.name.toLowerCase();
    const useCase = (req.useCase || '').toLowerCase();
    return (
      name.includes('http') ||
      name.includes('bit.ly') ||
      useCase.includes('http') ||
      useCase.includes('bit.ly') ||
      name.length > 50
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/opshub" className="hover:text-foreground">OpsHub</Link>
              <span>/</span>
              <span>Access Requests</span>
            </div>
            <h1 className="text-3xl font-bold">Beta Access Requests</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage beta access requests
            </p>
          </div>
          <Button onClick={fetchRequests} variant="outline" disabled={loading}>
            <Icons.refresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {(['all', 'pending', 'approved', 'rejected', 'spam'] as const).map(status => (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${filter === status ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => setFilter(status)}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{counts[status]}</div>
                <div className="text-sm text-muted-foreground capitalize">{status}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-500/10">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
              {error.includes('Admin') && (
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !error && (
          <Card>
            <CardContent className="p-8 text-center">
              <Icons.spinner className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading requests...</p>
            </CardContent>
          </Card>
        )}

        {/* Requests Table */}
        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' ? 'All Requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
                <span className="ml-2 text-muted-foreground font-normal">({filteredRequests.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No requests found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Company / Role</TableHead>
                      <TableHead>Use Case</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map(req => (
                      <TableRow
                        key={req._id}
                        className={`cursor-pointer hover:bg-muted/50 ${isSpamLikely(req) && req.status === 'pending' ? 'bg-red-500/5' : ''}`}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <TableCell>
                          <div className="font-medium">{req.name}</div>
                          <div className="text-sm text-muted-foreground">{req.email}</div>
                        </TableCell>
                        <TableCell>
                          <div>{req.company || '-'}</div>
                          <div className="text-sm text-muted-foreground">{req.role || '-'}</div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm truncate" title={req.useCase}>
                            {req.useCase || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[req.status]}>
                            {req.status}
                          </Badge>
                          {isSpamLikely(req) && req.status === 'pending' && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              Likely spam
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(req.requestedAt)}</div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {actionLoading === req._id ? (
                            <Icons.spinner className="h-4 w-4 animate-spin ml-auto" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Icons.moreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {req.status !== 'approved' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateStatus(req._id, 'approved', true)}
                                      className="text-green-400"
                                    >
                                      <Icons.check className="mr-2 h-4 w-4" />
                                      Approve & Send Email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateStatus(req._id, 'approved', false)}
                                    >
                                      <Icons.check className="mr-2 h-4 w-4" />
                                      Approve (No Email)
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {req.status !== 'rejected' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatus(req._id, 'rejected')}
                                    className="text-red-400"
                                  >
                                    <Icons.x className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                )}
                                {req.status !== 'spam' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatus(req._id, 'spam')}
                                  >
                                    <Icons.alertTriangle className="mr-2 h-4 w-4" />
                                    Mark as Spam
                                  </DropdownMenuItem>
                                )}
                                {req.status !== 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatus(req._id, 'pending')}
                                  >
                                    <Icons.clock className="mr-2 h-4 w-4" />
                                    Reset to Pending
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => deleteRequest(req._id)}
                                  className="text-red-400"
                                >
                                  <Icons.trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                Request Details
                {selectedRequest && (
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1">
                      <a href={`mailto:${selectedRequest.email}`} className="text-primary hover:underline">
                        {selectedRequest.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                    <p className="mt-1">{selectedRequest.company || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="mt-1">{selectedRequest.role || '-'}</p>
                  </div>
                </div>

                {/* Use Case */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Use Case</label>
                  <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted p-3">
                    {selectedRequest.useCase || 'No use case provided'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Request Info</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Requested: {formatDate(selectedRequest.requestedAt)}</div>
                    {selectedRequest.reviewedAt && (
                      <div>Reviewed: {formatDate(selectedRequest.reviewedAt)}</div>
                    )}
                    {selectedRequest.reviewedBy && (
                      <div>By: {selectedRequest.reviewedBy}</div>
                    )}
                    {selectedRequest.ipAddress && (
                      <div>IP: {selectedRequest.ipAddress}</div>
                    )}
                  </div>
                  {selectedRequest.userAgent && (
                    <p className="mt-2 text-xs text-muted-foreground truncate" title={selectedRequest.userAgent}>
                      UA: {selectedRequest.userAgent}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t pt-4">
                  {selectedRequest.status !== 'approved' && (
                    <Button
                      onClick={() => {
                        updateStatus(selectedRequest._id, 'approved', true);
                        setSelectedRequest(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icons.check className="mr-2 h-4 w-4" />
                      Approve & Send Email
                    </Button>
                  )}
                  {selectedRequest.status !== 'rejected' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateStatus(selectedRequest._id, 'rejected');
                        setSelectedRequest(null);
                      }}
                    >
                      <Icons.x className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  {selectedRequest.status !== 'spam' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateStatus(selectedRequest._id, 'spam');
                        setSelectedRequest(null);
                      }}
                    >
                      <Icons.alertTriangle className="mr-2 h-4 w-4" />
                      Spam
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
