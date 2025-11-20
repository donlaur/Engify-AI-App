'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { AdminErrorBoundary } from '@/components/admin/shared/AdminErrorBoundary';

// Tab components
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

// Tab categories for organization
const TAB_CATEGORIES = {
  overview: {
    label: 'Overview',
    tabs: ['dashboard'],
  },
  content: {
    label: 'Content',
    tabs: ['content', 'generator', 'prompts', 'patterns'],
  },
  management: {
    label: 'Management',
    tabs: ['workflows', 'recommendations', 'painpoints', 'users'],
  },
  system: {
    label: 'System',
    tabs: ['feeds', 'news', 'queue', 'settings'],
  },
};

const ALL_TABS = Object.values(TAB_CATEGORIES).flatMap(cat => cat.tabs);

export function OpsHubTabs() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tabs by category
  const visibleTabs = selectedCategory === 'all' 
    ? ALL_TABS 
    : (TAB_CATEGORIES[selectedCategory as keyof typeof TAB_CATEGORIES]?.tabs || ALL_TABS);
  
  // If active tab is not in visible tabs, switch to first visible tab
  useEffect(() => {
    if (!visibleTabs.includes(activeTab) && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0]);
    }
  }, [selectedCategory, visibleTabs, activeTab]);

  return (
    <AdminErrorBoundary onError={(err) => console.error('OpsHub tabs error:', err)}>
      <div className="space-y-4">
      {/* Header - Compact to prevent overflow */}
      <div className="relative z-10 bg-background pb-2">
        <div className="max-w-full">
          <h1 className="text-2xl font-bold">OpsHub Admin Center</h1>
          <p className="text-xs text-muted-foreground">
            Comprehensive admin dashboard for managing all aspects of your platform
          </p>
        </div>
      </div>

      {/* Category Filter */}
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

      {/* Tabs - Scrollable horizontal */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="inline-flex min-w-full gap-1">
          {visibleTabs.includes('dashboard') && (
            <TabsTrigger value="dashboard" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.barChart className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('content') && (
            <TabsTrigger value="content" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.fileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('generator') && (
            <TabsTrigger value="generator" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.zap className="h-4 w-4" />
              <span className="hidden sm:inline">Generator</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('prompts') && (
            <TabsTrigger value="prompts" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.code className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('patterns') && (
            <TabsTrigger value="patterns" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.brain className="h-4 w-4" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('workflows') && (
            <TabsTrigger value="workflows" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.gitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('recommendations') && (
            <TabsTrigger value="recommendations" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Recommendations</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('painpoints') && (
            <TabsTrigger value="painpoints" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.alertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Pain Points</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('users') && (
            <TabsTrigger value="users" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('queue') && (
            <TabsTrigger value="queue" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.alertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">DLQ</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('settings') && (
            <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('feeds') && (
            <TabsTrigger value="feeds" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Feeds</span>
            </TabsTrigger>
          )}
          {visibleTabs.includes('news') && (
            <TabsTrigger value="news" className="flex items-center gap-2 whitespace-nowrap">
              <Icons.newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
          )}
        </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <DashboardOverviewPanel />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <ContentManagementCMS />
        </TabsContent>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <ContentGeneratorPanel />
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <PromptManagementPanel />
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <PatternManagementPanel />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <WorkflowManagementPanel />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationManagementPanel />
        </TabsContent>

        {/* Pain Points Tab */}
        <TabsContent value="painpoints" className="space-y-4">
          <PainPointManagementPanel />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <UserManagementPanel />
        </TabsContent>

        {/* Dead Letter Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <DeadLetterQueuePanel />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <SystemSettingsPanel />
        </TabsContent>

        {/* Feeds Tab */}
        <TabsContent value="feeds" className="space-y-4">
          <FeedManagementPanel />
        </TabsContent>

        {/* News Items Tab */}
        <TabsContent value="news" className="space-y-4">
          <NewsItemsPanel />
        </TabsContent>
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
