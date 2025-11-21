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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface User {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [planFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (planFilter !== 'all') params.append('plan', planFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  const handlePreview = (user: User) => {
    setPreviewUser(user);
    setIsPreviewOpen(true);
  };

  const handleCreate = () => {
    setEditingUser({
      _id: '',
      email: '',
      name: '',
      role: 'user',
      plan: 'free',
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreating(true);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) =>
    searchTerm
      ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: users.length,
    free: users.filter((u) => u.plan === 'free').length,
    basic: users.filter((u) => u.plan === 'basic').length,
    pro: users.filter((u) => u.plan === 'pro').length,
    enterprise: users.filter((u) => u.plan === 'enterprise').length,
    verified: users.filter((u) => u.emailVerified).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Icons.plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Users</CardDescription>
            <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Free</CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-600">
              {stats.free}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Basic</CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {stats.basic}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Pro</CardDescription>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {stats.pro}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Enterprise</CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {stats.enterprise}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Verified</CardDescription>
            <CardTitle className="text-4xl font-bold text-emerald-600">
              {stats.verified}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} users
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-[250px] font-semibold">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Plan</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handlePreview(user)}
                            className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                          >
                            {user.email}
                          </button>
                        </TableCell>
                        <TableCell>{user.name || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.plan === 'enterprise'
                                ? 'default'
                                : user.plan === 'pro'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {user.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role || 'user'}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <Badge variant="default" className="bg-green-600">
                              <Icons.check className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                            >
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Icons.delete className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <Icons.left className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <Icons.arrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New User' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Add a new user account'
                : 'Update user account details'}
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  disabled={!isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingUser.name || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    value={editingUser.plan}
                    onValueChange={(value: User['plan']) =>
                      setEditingUser({ ...editingUser, plan: value })
                    }
                  >
                    <SelectTrigger id="plan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editingUser.role || 'user'}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isCreating && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailVerified" className="text-base">
                        Email Verified
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mark this account as verified
                      </p>
                    </div>
                    <Switch
                      id="emailVerified"
                      checked={editingUser.emailVerified || false}
                      onCheckedChange={(checked) =>
                        setEditingUser({
                          ...editingUser,
                          emailVerified: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="onboardingCompleted" className="text-base">
                        Onboarding Completed
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mark onboarding as complete
                      </p>
                    </div>
                    <Switch
                      id="onboardingCompleted"
                      checked={editingUser.onboardingCompleted || false}
                      onCheckedChange={(checked) =>
                        setEditingUser({
                          ...editingUser,
                          onboardingCompleted: checked,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
          {previewUser && (
            <>
              <SheetHeader>
                <SheetTitle>{previewUser.name || previewUser.email}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>{previewUser.plan}</Badge>
                    <Badge variant="outline">{previewUser.role || 'user'}</Badge>
                    {previewUser.emailVerified && (
                      <Badge variant="default" className="bg-green-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Contact</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Email:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewUser.email}
                      </dd>
                    </div>
                    {previewUser.name && (
                      <div>
                        <dt className="inline font-medium">Name:</dt>
                        <dd className="ml-2 inline text-muted-foreground">
                          {previewUser.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Account Details</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Plan:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewUser.plan}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Role:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewUser.role || 'user'}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Email Verified:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewUser.emailVerified ? 'Yes' : 'No'}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Onboarding:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {previewUser.onboardingCompleted ? 'Completed' : 'Not completed'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Timestamps</h4>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Created:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewUser.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Updated:</dt>
                      <dd className="ml-2 inline text-muted-foreground">
                        {new Date(previewUser.updatedAt).toLocaleString()}
                      </dd>
                    </div>
                    {previewUser.lastLoginAt && (
                      <div>
                        <dt className="inline font-medium">Last Login:</dt>
                        <dd className="ml-2 inline text-muted-foreground">
                          {new Date(previewUser.lastLoginAt).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleEdit(previewUser);
                    }}
                    className="flex-1"
                  >
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsPreviewOpen(false);
                      handleDelete(previewUser._id);
                    }}
                  >
                    <Icons.delete className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
