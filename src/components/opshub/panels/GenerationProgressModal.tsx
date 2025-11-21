'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clientLogger } from '@/lib/logging/client-logger';

/**
 * @interface GenerationStep
 */
interface GenerationStep {
  agent: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  output?: string;
  error?: string;
}

interface GenerationProgress {
  jobId: string;
  topic: string;
  contentType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  currentAgent?: string;
  steps: GenerationStep[];
  progress: number;
  wordCount?: number;
  costUSD?: number;
  generatedContent?: string;
}

/**
 * @interface GenerationProgressModalProps
 */
interface GenerationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
}

/**
 * GenerationProgressModal Component
 * 
 * A modal component for displaying AI content generation progress.
 * Shows real-time progress updates, logs, and completion status.
 * 
 * @component
 * @pattern MODAL_COMPONENT, PROGRESS_TRACKER
 * @principle DRY - Centralizes generation progress display
 * 
 * @features
 * - Real-time progress updates
 * - Generation logs display
 * - Progress percentage and status
 * - Completion callback support
 * - Auto-refresh polling
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback function when modal is closed
 * @param jobId - ID of the generation job to track
 * @param onComplete - Optional callback when generation completes
 * 
 * @example
 * ```tsx
 * <GenerationProgressModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   jobId={currentJobId}
 *   onComplete={() => {
 *     // Handle completion
 *     refreshContent();
 *   }}
 * />
 * ```
 * 
 * @usage
 * Used in ContentGeneratorPanel for tracking generation progress.
 * Provides real-time feedback during content generation.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 * 
 * @function GenerationProgressModal
 */
export function GenerationProgressModal({ isOpen, onClose, jobId, onComplete }: GenerationProgressModalProps & { onComplete?: () => void }) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!jobId || !isOpen) return;

    // Reset logs when job changes
    setLogs([]);

    // Poll for progress updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/content/generation-progress/${jobId}`);
        const data = await response.json();
        
        if (data.success) {
          setProgress(data.progress);
          
          // Replace logs (don't append to prevent duplicates)
          if (data.logs) {
            setLogs(data.logs);
          }
          
          // Stop polling if completed or failed
          if (data.progress.status === 'completed' || data.progress.status === 'failed') {
            clearInterval(interval);
            // Notify parent to refresh review list
            if (onComplete) {
              onComplete();
            }
          }
        }
      } catch (error) {
        clientLogger.apiError('/api/admin/content/generation/status', error, {
          component: 'GenerationProgressModal',
          action: 'fetchProgress',
          jobId,
        });
      }
    }, 2000); // Poll every 2 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [jobId, isOpen, onComplete]);

  if (!progress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Initializing Generation...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'researcher': return Icons.search;
      case 'outliner': return Icons.fileText;
      case 'writer': return Icons.edit;
      case 'editor': return Icons.checkCircle;
      case 'seo': return Icons.trendingUp;
      default: return Icons.sparkles;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.sparkles className="h-5 w-5" />
            Generating: {progress.topic}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{progress.contentType}</Badge>
            {progress.wordCount && <span>{progress.wordCount} words</span>}
            {progress.costUSD && <span>• ${progress.costUSD.toFixed(4)}</span>}
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(progress.progress)}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </div>

          {/* Agent Pipeline */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Agent Pipeline</h3>
            <div className="grid grid-cols-5 gap-2">
              {progress.steps.map((step, index) => {
                const AgentIcon = getAgentIcon(step.agent);
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                      step.status === 'active' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
                      step.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                      step.status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                      'border-muted'
                    }`}
                  >
                    <AgentIcon className={`h-6 w-6 ${getStatusColor(step.status)}`} />
                    <span className="text-xs font-medium capitalize">{step.agent}</span>
                    {step.status === 'active' && (
                      <Icons.spinner className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {step.status === 'completed' && (
                      <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    )}
                    {step.status === 'failed' && (
                      <Icons.cancel className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Logs */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <h3 className="text-sm font-medium mb-2">Live Generation Log</h3>
            <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/30 min-h-[200px]">
              <div className="space-y-1 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">Waiting for logs...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      <span className="text-blue-600">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Generated Content Preview */}
          {progress.generatedContent && (
            <div className="space-y-2 flex-shrink-0">
              <h3 className="text-sm font-medium">Content Preview</h3>
              <ScrollArea className="h-32 border rounded-lg p-3 bg-muted/30">
                <div className="prose prose-sm max-w-none">
                  {progress.generatedContent.substring(0, 500)}...
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Status Message */}
          <div className="flex items-center gap-2 text-sm">
            {progress.status === 'processing' && (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-600">
                  {progress.currentAgent ? `${progress.currentAgent} is working...` : 'Processing...'}
                </span>
              </>
            )}
            {progress.status === 'completed' && (
              <>
                <Icons.checkCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Generation complete! Check Review tab.</span>
              </>
            )}
            {progress.status === 'failed' && (
              <>
                <Icons.cancel className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Generation failed. Check logs for details.</span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
