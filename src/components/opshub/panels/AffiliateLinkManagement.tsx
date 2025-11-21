'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AffiliateLink {
  _id?: string;
  tool: string;
  baseUrl: string;
  referralUrl?: string;
  affiliateCode?: string;
  commission?: string;
  status: 'active' | 'pending' | 'requested';
  notes?: string;
  clickCount?: number;
  uniqueClicks?: number;
  conversionCount?: number;
  lastClickAt?: Date;
  clicksToday?: number;
  clicksThisWeek?: number;
  clicksThisMonth?: number;
}

interface AffiliateStats {
  totalClicks: number;
  uniqueClicks: number;
  clicksByTool: Record<string, number>;
  clicksBySource: Record<string, number>;
  recentClicks: any[];
  conversionRate?: number;
  estimatedRevenue?: number;
}

interface PartnershipOutreach {
  _id?: string;
  company: string;
  priority: 'high' | 'medium' | 'low';
  contact: string;
  rating?: number;
  traffic?: string;
  status: 'pending' | 'contacted' | 'responded' | 'partnership';
  notes?: string;
}

export function AffiliateLinkManagement() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [outreach, setOutreach] = useState<PartnershipOutreach[]>([]);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/admin/affiliate-links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        setOutreach(data.outreach || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLink = async () => {
    if (!editingLink) return;

    try {
      const response = await fetch('/api/admin/affiliate-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'link',
          data: editingLink,
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingLink(null);
        fetchAffiliateData();
      }
    } catch (error) {
      console.error('Failed to save affiliate link:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'requested':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Icons.refresh className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats Section */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <Icons.target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueClicks.toLocaleString()} unique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Icons.trendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.conversionRate || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
              <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.estimatedRevenue || 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <Icons.link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {links.filter((l) => l.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {links.length} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Affiliate Links Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Affiliate Links</CardTitle>
              <CardDescription>
                Manage affiliate and referral links for monetization
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingLink({
                  tool: '',
                  baseUrl: '',
                  status: 'requested',
                  clickCount: 0,
                  conversionCount: 0,
                });
                setIsDialogOpen(true);
              }}
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link._id}
                className="flex items-start justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{link.tool}</h4>
                    <Badge className={getStatusColor(link.status)}>
                      {link.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {link.referralUrl || link.baseUrl}
                  </p>
                  {link.commission && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Commission: {link.commission}
                    </p>
                  )}
                  {link.clickCount !== undefined && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Total: {link.clickCount.toLocaleString()}</span>
                        <span>Unique: {link.uniqueClicks?.toLocaleString() || 0}</span>
                        <span>Conversions: {link.conversionCount || 0}</span>
                      </div>
                      {(link.clicksToday || link.clicksThisWeek || link.clicksThisMonth) && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Today: {link.clicksToday || 0}</span>
                          <span>Week: {link.clicksThisWeek || 0}</span>
                          <span>Month: {link.clicksThisMonth || 0}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {link.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {link.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingLink(link);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partnership Outreach Section */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Outreach</CardTitle>
          <CardDescription>
            Track outreach to potential partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outreach.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.company}</h4>
                    <Badge variant="outline">{item.priority}</Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.contact}
                  </p>
                  {item.rating && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rating: {item.rating} ⭐
                    </p>
                  )}
                  {item.traffic && (
                    <p className="text-xs text-muted-foreground">
                      {item.traffic}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Affiliate Link</DialogTitle>
            <DialogDescription>Update affiliate link details</DialogDescription>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tool Name</label>
                <Input
                  value={editingLink.tool}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, tool: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Base URL</label>
                <Input
                  value={editingLink.baseUrl}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, baseUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Referral URL</label>
                <Input
                  value={editingLink.referralUrl || ''}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      referralUrl: e.target.value,
                    })
                  }
                  placeholder="Optional referral URL"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Affiliate Code</label>
                <Input
                  value={editingLink.affiliateCode || ''}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      affiliateCode: e.target.value,
                    })
                  }
                  placeholder="Optional affiliate code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Commission</label>
                  <Input
                    value={editingLink.commission || ''}
                    onChange={(e) =>
                      setEditingLink({
                        ...editingLink,
                        commission: e.target.value,
                      })
                    }
                    placeholder="e.g., 20%"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editingLink.status}
                    onValueChange={(
                      value: 'active' | 'pending' | 'requested'
                    ) => setEditingLink({ ...editingLink, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editingLink.notes || ''}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLink}>
              <Icons.check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
