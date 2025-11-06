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

export function WorkbenchPageClient() {
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
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">AI Workbench</h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Interactive prompt engineering tools you can run live. Test prompts, optimize outputs, 
            and build workflows—all powered by AI models you control.
          </p>
        </div>

        {/* What is the Workbench Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
          <h2 className="mb-4 text-2xl font-bold">What is the AI Workbench?</h2>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-base leading-relaxed">
              The AI Workbench is your interactive playground for prompt engineering. Unlike our prompt library 
              (where you copy prompts to use elsewhere), the workbench lets you <strong className="text-foreground">run prompts live</strong> and 
              see results instantly.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">🎯 Interactive Prompt Execution</h3>
                <p className="text-sm">
                  Run prompts directly in your browser. Input your data, customize parameters, and get AI-generated 
                  results immediately. No need to copy-paste into ChatGPT or Claude—it all happens here.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">🔧 Engineering Tools</h3>
                <p className="text-sm">
                  Specialized tools for engineering workflows: OKR planning, retrospective analysis, tech debt 
                  strategizing, prompt optimization, and token cost estimation. Each tool is a complete, 
                  production-ready prompt workflow.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">⚡ Live AI Execution</h3>
                <p className="text-sm">
                  Currently, tools use our API keys for demonstration. Future versions will support your own 
                  API keys for full control and privacy. All execution happens server-side with proper 
                  security and rate limiting.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">📚 Learn by Doing</h3>
                <p className="text-sm">
                  See how prompts work in practice. Experiment with different inputs, observe outputs, 
                  and learn prompt engineering patterns through hands-on experience. Perfect for teams 
                  learning AI adoption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status Section */}
        <div className="mb-8 rounded-lg border bg-muted/30 p-6 md:p-8">
          <h2 className="mb-4 text-2xl font-bold">Current Status & Roadmap</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">✅ Available Now</h3>
              <p className="text-sm text-muted-foreground">
                Several tools are fully functional and ready to use: Token Counter, Prompt Optimizer, 
                OKR Workbench, Retrospective Diagnostician, and Tech Debt Strategist. These run live 
                AI models and provide immediate results.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🚧 In Development</h3>
              <p className="text-sm text-muted-foreground">
                Multi-Model Comparison and Knowledge Navigator (RAG) are being built. These require 
                additional infrastructure (potentially EC2 for compute-intensive operations) and will 
                enable side-by-side model testing and document-based AI queries.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">🔮 Future Vision</h3>
              <p className="text-sm text-muted-foreground">
                The workbench will evolve into a full interactive prompt engineering platform: multi-step 
                workflows, prompt chaining, output refinement, and eventually user-provided API keys 
                for complete control. Think of it as "Jupyter Notebooks for prompt engineering."
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 md:p-8">
          <h2 className="mb-4 text-2xl font-bold">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="mb-2 font-semibold">Select a Tool</h3>
              <p className="text-sm text-muted-foreground">
                Choose from available workbench tools based on your need—optimization, planning, analysis, or estimation.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="mb-2 font-semibold">Input Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Fill in the interactive form fields with your specific context, requirements, or data. 
                Each tool guides you through what's needed.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="mb-2 font-semibold">Get Live Results</h3>
              <p className="text-sm text-muted-foreground">
                The tool executes your prompt using AI models and returns results instantly. Review, 
                iterate, and refine—all in one place.
              </p>
            </div>
          </div>
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
