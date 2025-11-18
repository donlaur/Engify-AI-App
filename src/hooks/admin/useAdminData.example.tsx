/**
 * Example usage of useAdminData hook
 * This file demonstrates how to use the reusable admin data management hook
 */

import { useAdminData, AdminDataItem } from './useAdminData';

// Example 1: Using with Workflows
interface Workflow extends AdminDataItem {
  name: string;
  status: string;
  createdAt: string;
}

export function WorkflowManagementExample() {
  const {
    data: workflows,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    nextPage,
    prevPage,
    goToPage,
    setFilters,
    clearFilters,
    refresh,
    hasNext,
    hasPrev,
  } = useAdminData<Workflow>({
    endpoint: '/api/admin/workflows',
    pageSize: 100,
    dataKey: 'workflows',
  });

  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Workflows ({totalCount})</h2>

      {/* Filters */}
      <div>
        <select onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={clearFilters}>Clear Filters</button>
        <button onClick={refresh}>Refresh</button>
      </div>

      {/* Data Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr key={workflow._id}>
              <td>{workflow.name}</td>
              <td>{workflow.status}</td>
              <td>{new Date(workflow.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button onClick={prevPage} disabled={!hasPrev}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={!hasNext}>
          Next
        </button>
      </div>
    </div>
  );
}

// Example 2: Using with Prompts
interface Prompt extends AdminDataItem {
  title: string;
  category: string;
  active: boolean;
  source: string;
}

export function PromptManagementExample() {
  const {
    data: prompts,
    loading,
    error,
    currentPage,
    totalPages,
    setFilters,
    setSearchTerm,
    searchTerm,
    filters,
    nextPage,
    prevPage,
  } = useAdminData<Prompt>({
    endpoint: '/api/admin/prompts',
    pageSize: 50,
    initialFilters: { active: 'all' },
    dataKey: 'prompts',
  });

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search prompts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filters */}
      <select
        value={filters.active as string}
        onChange={(e) => setFilters({ active: e.target.value })}
      >
        <option value="all">All</option>
        <option value="true">Active Only</option>
        <option value="false">Inactive Only</option>
      </select>

      <select onChange={(e) => setFilters({ source: e.target.value })}>
        <option value="all">All Sources</option>
        <option value="seed">Seed</option>
        <option value="ai-generated">AI Generated</option>
        <option value="user-submitted">User Submitted</option>
      </select>

      {/* Results */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          {prompts.map((prompt) => (
            <div key={prompt._id}>
              <h3>{prompt.title}</h3>
              <p>Category: {prompt.category}</p>
              <p>Status: {prompt.active ? 'Active' : 'Inactive'}</p>
            </div>
          ))}

          <div>
            <button onClick={prevPage}>Prev</button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button onClick={nextPage}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

// Example 3: Advanced usage with custom data type
interface User extends AdminDataItem {
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export function UserManagementExample() {
  const adminData = useAdminData<User>({
    endpoint: '/api/admin/users',
    pageSize: 25,
    initialFilters: { role: 'all', isActive: true },
    dataKey: 'users',
    autoFetch: true, // Automatically fetch on mount
  });

  // Destructure only what you need
  const { data: users, loading, goToPage } = adminData;

  return (
    <div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {users.map((user) => (
            <div key={user._id}>
              <p>{user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          ))}

          {/* Jump to specific page */}
          <button onClick={() => goToPage(1)}>First Page</button>
          <button onClick={() => goToPage(5)}>Go to Page 5</button>
        </>
      )}
    </div>
  );
}
