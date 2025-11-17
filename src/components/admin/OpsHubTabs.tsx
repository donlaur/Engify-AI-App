'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/lib/icons';

// Tab components
import { DashboardOverviewPanel } from './DashboardOverviewPanel';
import { ContentManagementCMS } from './ContentManagementCMS';
import { ContentGeneratorPanel } from './ContentGeneratorPanel';
import { PromptManagementPanel } from './PromptManagementPanel';
import { PatternManagementPanel } from './PatternManagementPanel';
import { UserManagementPanel } from './UserManagementPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { DeadLetterQueuePanel } from './DeadLetterQueuePanel';

export function OpsHubTabs() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OpsHub Admin Center</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive admin dashboard for managing all aspects of your platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Icons.barChart className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Icons.fileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Icons.zap className="h-4 w-4" />
            <span className="hidden sm:inline">Generator</span>
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Icons.code className="h-4 w-4" />
            <span className="hidden sm:inline">Prompts</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Icons.brain className="h-4 w-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Icons.users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Icons.alertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">DLQ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Icons.settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}
