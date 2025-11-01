'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { ToolSelector } from '@/components/workbench/ToolSelector';
import { TokenCounter } from '@/components/workbench/TokenCounter';
import { PromptOptimizer } from '@/components/workbench/PromptOptimizer';
import { OKRWorkbench } from '@/components/workbench/OKRWorkbench';
import { RetrospectiveDiagnostician } from '@/components/workbench/RetrospectiveDiagnostician';
import { TechDebtStrategist } from '@/components/workbench/TechDebtStrategist';
import { ComingSoonTool } from '@/components/workbench/ComingSoonTool';
import { WorkbenchToolId, getWorkbenchTool, WORKBENCH_TOOLS } from '@/types/workbench';

export default function WorkbenchPage() {
  const [selectedTool, setSelectedTool] =
    useState<WorkbenchToolId>('token-counter');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderTool = () => {
    const tool = getWorkbenchTool(selectedTool);

    if (tool.comingSoon) {
      return <ComingSoonTool tool={tool} />;
    }

    switch (selectedTool) {
      case 'token-counter':
        return <TokenCounter text="" />;
      case 'prompt-optimizer':
        return <PromptOptimizer />;
      case 'okr-workbench':
        return <OKRWorkbench />;
      case 'retrospective-diagnostician':
        return <RetrospectiveDiagnostician />;
      case 'tech-debt-strategist':
        return <TechDebtStrategist />;
      default:
        return <ComingSoonTool tool={tool} />;
    }
  };

  if (!mounted) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Icons.spinner className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading workbench...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">AI Workbench</h1>
          <p className="text-muted-foreground">
            Interactive tools for prompt engineering, team management, and
            strategic planning
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Some tools are in active development and may be partially functional
          </p>
        </div>

        {/* Tool Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.wrench className="h-5 w-5" />
              Select Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ToolSelector
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </CardContent>
        </Card>

        {/* Tool Content */}
        <div className="space-y-6">{renderTool()}</div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icons.checkCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Available Tools</p>
                  <p className="text-sm text-muted-foreground">
                    {Object.values(WORKBENCH_TOOLS).filter((t) => !t.comingSoon).length} ready to use
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icons.clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">In Development</p>
                  <p className="text-sm text-muted-foreground">
                    {Object.values(WORKBENCH_TOOLS).filter((t) => t.comingSoon).length} coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icons.sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Total Tools</p>
                  <p className="text-sm text-muted-foreground">
                    {Object.values(WORKBENCH_TOOLS).length} tools available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icons.copy className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Copy-Paste Ready</p>
                  <p className="text-sm text-muted-foreground">
                    Prompt templates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
