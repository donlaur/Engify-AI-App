/**
 * Tab Configuration for OpsHub Admin Center
 * 
 * Centralized configuration for all admin panel tabs. This file follows the DRY principle
 * by defining tab metadata (ID, label, icon, category) in a single location, making it easy
 * for AI models and developers to understand and extend the admin interface.
 * 
 * @pattern CONFIGURATION_DRIVEN_UI
 * @principle Single Source of Truth - all tab definitions live here
 * @usage Imported by OpsHubTabs.tsx for dynamic tab rendering
 * 
 * @ai-readability
 * - Clear interface definitions with TypeScript types
 * - Descriptive property names (id, label, icon, category)
 * - Organized by logical categories for easy navigation
 * - Comments explain the purpose and usage patterns
 * 
 * @extensibility
 * To add a new admin panel tab:
 * 1. Add entry to TAB_CONFIGS array with id, label, icon, category
 * 2. Import the panel component in OpsHubTabs.tsx
 * 3. Add mapping in TAB_COMPONENT_MAP in OpsHubTabs.tsx
 * 4. The tab will automatically appear in the correct category
 */

import { Icons } from '@/lib/icons';

/**
 * Configuration for a single admin panel tab
 * 
 * @property id - Unique identifier for the tab (used in routing and state)
 * @property label - Human-readable label displayed in the tab trigger
 * @property icon - Icon name from Icons registry (must be a valid key)
 * @property category - Logical grouping for category filtering
 */
export interface TabConfig {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  category: 'overview' | 'content' | 'management' | 'system';
}

/**
 * Complete list of all admin panel tabs
 * 
 * This array defines every tab available in the OpsHub admin center.
 * Tabs are organized by category for logical grouping and filtering.
 * 
 * @note Order matters - tabs appear in this order within their category
 */
export const TAB_CONFIGS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'barChart', category: 'overview' },
  { id: 'content', label: 'Content', icon: 'fileText', category: 'content' },
  { id: 'generator', label: 'Generator', icon: 'zap', category: 'content' },
  { id: 'prompts', label: 'Prompts', icon: 'code', category: 'content' },
  { id: 'patterns', label: 'Patterns', icon: 'brain', category: 'content' },
  { id: 'workflows', label: 'Workflows', icon: 'gitBranch', category: 'management' },
  { id: 'recommendations', label: 'Recommendations', icon: 'lightbulb', category: 'management' },
  { id: 'painpoints', label: 'Pain Points', icon: 'alertTriangle', category: 'management' },
  { id: 'users', label: 'Users', icon: 'users', category: 'management' },
  { id: 'queue', label: 'DLQ', icon: 'alertCircle', category: 'system' },
  { id: 'settings', label: 'Settings', icon: 'settings', category: 'system' },
  { id: 'feeds', label: 'Feeds', icon: 'newspaper', category: 'system' },
  { id: 'news', label: 'News', icon: 'newspaper', category: 'system' },
];

/**
 * Tab categories for filtering and organization
 * 
 * Automatically generated from TAB_CONFIGS by grouping tabs by category.
 * Used by the category filter dropdown to show/hide tabs by category.
 * 
 * @structure Each category has:
 *   - label: Display name for the category filter
 *   - tabs: Array of tab IDs belonging to this category
 * 
 * @note This is computed from TAB_CONFIGS, so adding a tab to TAB_CONFIGS
 *       automatically includes it in the appropriate category.
 */
export const TAB_CATEGORIES = {
  overview: {
    label: 'Overview',
    tabs: TAB_CONFIGS.filter(t => t.category === 'overview').map(t => t.id),
  },
  content: {
    label: 'Content',
    tabs: TAB_CONFIGS.filter(t => t.category === 'content').map(t => t.id),
  },
  management: {
    label: 'Management',
    tabs: TAB_CONFIGS.filter(t => t.category === 'management').map(t => t.id),
  },
  system: {
    label: 'System',
    tabs: TAB_CONFIGS.filter(t => t.category === 'system').map(t => t.id),
  },
};

/**
 * Flat list of all tab IDs
 * 
 * Used when 'all' category is selected to show all tabs regardless of category.
 * Computed from TAB_CONFIGS for consistency.
 */
export const ALL_TABS = TAB_CONFIGS.map(t => t.id);

