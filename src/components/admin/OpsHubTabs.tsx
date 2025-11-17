'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/lib/icons';

// Tab components (we'll create these)
import { ContentManagementCMS } from './ContentManagementCMS';
import { PromptManagementPanel } from './PromptManagementPanel';
import { PatternManagementPanel } from './PatternManagementPanel';
import { UserManagementPanel } from './UserManagementPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { DeadLetterQueuePanel } from './DeadLetterQueuePanel';

export function OpsHubTabs() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OpsHub</h1>
          <p className="text-sm text-muted-foreground">
            Manage content, prompts, patterns, and system settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Icons.fileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Icons.zap className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Icons.brain className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Icons.users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Icons.alertCircle className="h-4 w-4" />
            DLQ
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Icons.settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <ContentManagementCMS />
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
