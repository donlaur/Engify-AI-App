'use client';

/**
 * OpsHub Tabs Component
 * 
 * Main navigation component for the OpsHub admin center. Provides a tabbed interface
 * for accessing all admin panels organized by category (Overview, Content, Management, System).
 * 
 * @pattern OPSHUB_NAVIGATION
 * @features
 * - Category-based tab filtering
 * - Dynamic tab rendering with state preservation
 * - Responsive design with mobile-friendly tab labels
 * - Error boundary protection for all tab content
 * 
 * @architecture
 * - Uses tabConfig.tsx for centralized tab configuration (DRY principle)
 * - Component registry pattern for dynamic rendering without state loss
 * - Shared AdminErrorBoundary for consistent error handling
 * 
 * @usage
 * This component is the main entry point for OpsHub admin panels. It should be
 * wrapped in a page that enforces authentication via requireOpsHubAuth().
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for architectural patterns
 */

import { useState, useEffect } from 'react';
import { clientLogger } from '@/lib/logging/client-logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { AdminErrorBoundary } from '@/components/opshub/panels/shared/AdminErrorBoundary';
import { TAB_CONFIGS, TAB_CATEGORIES, ALL_TABS } from './tabConfig';

// Tab components - imported dynamically to reduce bundle size
import { DashboardOverviewPanel } from './DashboardOverviewPanel';
import { ContentManagementCMS } from './ContentManagementCMS';
import { ContentGeneratorPanel } from './ContentGeneratorPanel';
import { PromptManagementPanel } from './PromptManagementPanel';
import { PatternManagementPanel } from './PatternManagementPanel';
import { WorkflowManagementPanel } from './WorkflowManagementPanel';
import { RecommendationManagementPanel } from './RecommendationManagementPanel';
import { PainPointManagementPanel } from './PainPointManagementPanel';
import { UserManagementPanel } from './UserManagementPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { DeadLetterQueuePanel } from './DeadLetterQueuePanel';
import { FeedManagementPanel } from './FeedManagementPanel';
import { NewsItemsPanel } from './NewsItemsPanel';

/**
 * Tab component registry - maps tab IDs to their React components
 * 
 * This registry allows dynamic tab rendering while maintaining component identity
 * across renders. Components are stored as references, not factories, to preserve
 * React's reconciliation and state management.
 * 
 * @pattern COMPONENT_REGISTRY
 * @usage Used by OpsHubTabs to render tab content dynamically
 * @note Components are not recreated on each render, preserving internal state
 */
const TAB_COMPONENT_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardOverviewPanel,
  content: ContentManagementCMS,
  generator: ContentGeneratorPanel,
  prompts: PromptManagementPanel,
  patterns: PatternManagementPanel,
  workflows: WorkflowManagementPanel,
  recommendations: RecommendationManagementPanel,
  painpoints: PainPointManagementPanel,
  users: UserManagementPanel,
  queue: DeadLetterQueuePanel,
  settings: SystemSettingsPanel,
  feeds: FeedManagementPanel,
  news: NewsItemsPanel,
};

/**
 * Get the React component for a tab by ID
 * 
 * Returns the component class/function itself, not an instance. This allows
 * React to properly manage component lifecycle and preserve state across renders.
 * 
 * @param tabId - The ID of the tab (e.g., 'dashboard', 'content')
 * @returns The React component for the tab, or a fallback component if not found
 * 
 * @example
 * ```tsx
 * const TabComponent = getTabComponent('dashboard');
 * return <TabComponent />; // React will handle instance management
 * ```
 */
function getTabComponent(tabId: string): React.ComponentType {
  return TAB_COMPONENT_MAP[tabId] || (() => <div>Tab not found</div>);
}

/**
 * Main OpsHub Tabs Component
 * 
 * Manages tab navigation state and renders the tabbed interface for all admin panels.
 * Implements category filtering and automatic tab switching when filters change.
 * 
 * @returns JSX.Element - The complete OpsHub admin center UI
 * 
 * @function OpsHubTabs
 */
export function OpsHubTabs() {
  // Current active tab ID (e.g., 'dashboard', 'content', 'workflows')
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Selected category filter ('all', 'overview', 'content', 'management', 'system')
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  /**
   * Calculate which tabs should be visible based on category filter
   * 
   * When 'all' is selected, all tabs are visible. Otherwise, only tabs
   * belonging to the selected category are shown.
   */
  const visibleTabs = selectedCategory === 'all' 
    ? ALL_TABS 
    : (TAB_CATEGORIES[selectedCategory as keyof typeof TAB_CATEGORIES]?.tabs || ALL_TABS);
  
  /**
   * Auto-switch to first visible tab when category filter changes
   * 
   * This prevents the UI from showing an inactive tab that's been filtered out.
   * For example, if user is on 'dashboard' tab and filters to 'content' category,
   * we automatically switch to the first content tab.
   */
  useEffect(() => {
    if (!visibleTabs.includes(activeTab) && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0]);
    }
  }, [selectedCategory, visibleTabs, activeTab]);

  return (
    <AdminErrorBoundary onError={(err) => clientLogger.componentError('OpsHubTabs', err)}>
      <div className="space-y-4">
      {/* 
        Header Section
        Displays the main title and description for the OpsHub admin center.
        Uses compact styling to prevent overflow on smaller screens.
      */}
      <div className="relative z-10 bg-background pb-2">
        <div className="max-w-full">
          <h1 className="text-2xl font-bold">OpsHub Admin Center</h1>
          <p className="text-xs text-muted-foreground">
            Comprehensive admin dashboard for managing all aspects of your platform
          </p>
        </div>
      </div>

      {/* 
        Category Filter Dropdown
        Allows users to filter tabs by category (Overview, Content, Management, System).
        When a category is selected, only tabs in that category are shown.
        Selecting 'all' shows all tabs regardless of category.
      */}
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(TAB_CATEGORIES).map(([key, cat]) => (
              <SelectItem key={key} value={key}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 
        Tab Navigation
        Horizontal scrollable list of tab triggers. Each tab shows an icon and label.
        Labels are hidden on small screens (sm breakpoint) to save space.
        Only tabs matching the selected category filter are displayed.
      */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="inline-flex min-w-full gap-1 bg-slate-700/50">
            {TAB_CONFIGS
              .filter(tab => visibleTabs.includes(tab.id))
              .map(tab => {
                // Dynamically get the icon component from Icons registry
                const IconComponent = Icons[tab.icon];
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200 hover:text-white"
                  >
                    <IconComponent className="h-4 w-4" />
                    {/* Hide label on mobile, show on sm+ screens */}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
          </TabsList>
        </div>

        {/* Tab Content - Map each tab to its component */}
        {/* 
          Note: We render all tab content but only the active tab is visible.
          This preserves component state when switching between tabs.
          React's reconciliation ensures components maintain their identity.
        */}
        {TAB_CONFIGS.map(tab => {
          const TabComponent = getTabComponent(tab.id);
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <TabComponent />
            </TabsContent>
          );
        })}
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
