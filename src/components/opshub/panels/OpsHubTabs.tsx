'use client';
import { clientLogger } from '@/lib/logging/client-logger';

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
 * Get the component for a tab by ID
 */
function getTabComponent(tabId: string) {
  const componentMap: Record<string, () => JSX.Element> = {
    dashboard: () => <DashboardOverviewPanel />,
    content: () => <ContentManagementCMS />,
    generator: () => <ContentGeneratorPanel />,
    prompts: () => <PromptManagementPanel />,
    patterns: () => <PatternManagementPanel />,
    workflows: () => <WorkflowManagementPanel />,
    recommendations: () => <RecommendationManagementPanel />,
    painpoints: () => <PainPointManagementPanel />,
    users: () => <UserManagementPanel />,
    queue: () => <DeadLetterQueuePanel />,
    settings: () => <SystemSettingsPanel />,
    feeds: () => <FeedManagementPanel />,
    news: () => <NewsItemsPanel />,
  };
  return componentMap[tabId] || (() => <div>Tab not found</div>);
}

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
    <AdminErrorBoundary onError={(err) => clientLogger.componentError('OpsHubTabs', err)}>
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
          <TabsList className="inline-flex min-w-full gap-1 bg-slate-700/50">
            {TAB_CONFIGS
              .filter(tab => visibleTabs.includes(tab.id))
              .map(tab => {
                const IconComponent = Icons[tab.icon];
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-200 hover:text-white"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
          </TabsList>
        </div>

        {/* Tab Content - Map each tab to its component */}
        {TAB_CONFIGS.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {getTabComponent(tab.id)()}
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
