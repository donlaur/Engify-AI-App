'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  email: string;
  name: string;
  role?: string;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @interface UserManagementProps
 */
interface UserManagementProps {
  initialUsers?: User[];
}

/**
 * UserManagement Component
 * 
 * A reusable component for managing users with filtering and basic CRUD operations.
 * Provides a simpler interface than UserManagementPanel for use in other contexts.
 * 
 * @component
 * @pattern REUSABLE_COMPONENT
 * @principle DRY - Provides reusable user management functionality
 * 
 * @features
 * - User listing with filtering
 * - Filter by role and plan
 * - Basic user management operations
 * - Initial data support for SSR
 * 
 * @param initialUsers - Optional array of initial user data (for SSR)
 * 
 * @example
 * ```tsx
 * <UserManagement initialUsers={users} />
 * ```
 * 
 * @usage
 * Used in contexts where a simpler user management interface is needed.
 * For full admin functionality, use UserManagementPanel instead.
 * 
 * @see UserManagementPanel for full-featured admin panel
 * 
 * @function UserManagement
 */
export function UserManagement({ initialUsers = [] }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v2/users?';
      if (roleFilter !== 'all') {
        url += `role=${roleFilter}&`;
      }
      if (planFilter !== 'all') {
        url += `plan=${planFilter}&`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v2/users?stats=true');
      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, planFilter]);

  useEffect(() => {
    if (showStats) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStats]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v2/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        throw new Error('Failed to update user role');
      }
      await fetchUsers();
      if (showStats) {
        await fetchStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </Button>
      </div>

      {showStats && stats && (
        <div className="grid grid-cols-4 gap-4 rounded-lg border bg-slate-50 p-4">
          <div>
            <div className="text-sm text-slate-600">Total Users</div>
            <div className="text-2xl font-bold">{(stats as any).total || 0}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">By Role</div>
            <div className="text-xs text-slate-500">
              Admin: {(stats as any).byRole?.admin || 0} | User:{' '}
              {(stats as any).byRole?.user || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600">By Plan</div>
            <div className="text-xs text-slate-500">
              Free: {(stats as any).byPlan?.free || 0} | Pro: {(stats as any).byPlan?.pro || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Active</div>
            <div className="text-2xl font-bold">{(stats as any).active || 0}</div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            Filter by Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="org_admin">Org Admin</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            Filter by Plan
          </label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
            <option value="enterprise_starter">Enterprise Starter</option>
            <option value="enterprise_pro">Enterprise Pro</option>
            <option value="enterprise_premium">Enterprise Premium</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="py-8 text-center text-slate-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-slate-500">No users found.</div>
      ) : (
        <div className="divide-y rounded-lg border bg-white">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="mt-1 text-sm text-slate-600">{user.email}</div>
                <div className="mt-1 flex gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {user.role || 'user'}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {user.plan || 'free'}
                  </span>
                  {user.createdAt && (
                    <span className="text-xs text-slate-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={loading}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="org_admin">Org Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
