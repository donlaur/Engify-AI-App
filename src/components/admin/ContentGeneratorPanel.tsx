'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  topic: string;
  category: string;
  targetWordCount?: number;
  keywords?: string[];
}

interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    percentComplete: number;
  };
  timing: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    durationMs: number;
    estimatedTimeRemainingMs: number;
  };
  results: Array<{
    topic: string;
    status: 'pending' | 'completed' | 'failed';
    contentId?: string;
    error?: string;
    wordCount?: number;
    costUSD?: number;
  }>;
}

export function ContentGeneratorPanel() {
  const { toast } = useToast();
  const [generatorType, setGeneratorType] = useState<'single-agent' | 'multi-agent'>('single-agent');
  const [topicsInput, setTopicsInput] = useState('');
  const [category, setCategory] = useState('Tutorial');
  const [targetWordCount, setTargetWordCount] = useState('800');
  const [keywords, setKeywords] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  // Poll for job status
  useEffect(() => {
    if (currentJobId && jobStatus?.status === 'processing') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/admin/content/generation-status/${currentJobId}`);
          const data = await response.json();

          if (data.success) {
            setJobStatus(data.job);

            // Stop polling if job is complete
            if (data.job.status !== 'processing') {
              clearInterval(interval);

              toast({
                title: 'Job Complete',
                description: `Generated ${data.job.progress.completed} of ${data.job.progress.total} articles`,
                variant: data.job.status === 'completed' ? 'default' : 'destructive',
              });
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [currentJobId, jobStatus?.status, toast]);

  const handleSubmitBatch = async () => {
    try {
      setIsSubmitting(true);

      // Parse topics (one per line)
      const topicLines = topicsInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (topicLines.length === 0) {
        toast({
          title: 'Error',
          description: 'Please enter at least one topic',
          variant: 'destructive',
        });
        return;
      }

      if (topicLines.length > 50) {
        toast({
          title: 'Error',
          description: 'Maximum 50 topics per batch',
          variant: 'destructive',
        });
        return;
      }

      // Build topics array
      const topics: Topic[] = topicLines.map((line) => ({
        topic: line,
        category,
        targetWordCount: parseInt(targetWordCount) || undefined,
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
      }));

      // Submit batch job
      const response = await fetch('/api/admin/content/generate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatorType,
          topics,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentJobId(data.jobId);
        setJobStatus({
          jobId: data.jobId,
          status: 'queued',
          progress: {
            total: topics.length,
            completed: 0,
            failed: 0,
            pending: topics.length,
            percentComplete: 0,
          },
          timing: {
            createdAt: new Date().toISOString(),
            durationMs: 0,
            estimatedTimeRemainingMs: 0,
          },
          results: [],
        });

        toast({
          title: 'Job Submitted',
          description: `Batch job started with ${topics.length} topics`,
        });

        // Clear form
        setTopicsInput('');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit batch job',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit batch job',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      case 'partial':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Content Generator</h2>
        <p className="text-sm text-muted-foreground">
          Generate high-quality content using AI agents
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Content Generation</CardTitle>
            <CardDescription>
              Generate multiple articles in a single batch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generator Type */}
            <div className="space-y-2">
              <Label>Generator Type</Label>
              <Select
                value={generatorType}
                onValueChange={(value: 'single-agent' | 'multi-agent') =>
                  setGeneratorType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-agent">
                    Single Agent (Fast, Budget-Friendly)
                  </SelectItem>
                  <SelectItem value="multi-agent">
                    Multi-Agent (High Quality, SEO-Optimized)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {generatorType === 'single-agent'
                  ? 'Best for drafts and simple content (~$0.01/article)'
                  : 'Best for production articles (~$0.05/article)'}
              </p>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <Label>Topics (one per line, max 50)</Label>
              <Textarea
                placeholder="How to use Cursor AI&#10;React Server Components Tutorial&#10;Next.js 15 New Features"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                rows={6}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Case Study">Case Study</SelectItem>
                  <SelectItem value="Best Practices">Best Practices</SelectItem>
                  <SelectItem value="Comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Word Count */}
            <div className="space-y-2">
              <Label>Target Word Count</Label>
              <Input
                type="number"
                placeholder="800"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(e.target.value)}
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Input
                placeholder="ai, cursor, development"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSubmitBatch}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icons.zap className="mr-2 h-4 w-4" />
                  Generate Batch
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Job Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Job Status</CardTitle>
            <CardDescription>
              {jobStatus ? `Job ID: ${jobStatus.jobId}` : 'No active job'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobStatus ? (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusColor(jobStatus.status)}>
                    {jobStatus.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {jobStatus.progress.completed + jobStatus.progress.failed}/
                      {jobStatus.progress.total}
                    </span>
                  </div>
                  <Progress value={jobStatus.progress.percentComplete} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{jobStatus.progress.percentComplete}% complete</span>
                    {jobStatus.timing.estimatedTimeRemainingMs > 0 && (
                      <span>
                        ~{formatDuration(jobStatus.timing.estimatedTimeRemainingMs)}{' '}
                        remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {jobStatus.progress.completed}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {jobStatus.progress.pending}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {jobStatus.progress.failed}
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>

                {/* Duration */}
                {jobStatus.timing.durationMs > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration</span>
                    <span className="font-medium">
                      {formatDuration(jobStatus.timing.durationMs)}
                    </span>
                  </div>
                )}

                {/* Results */}
                {jobStatus.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Results</h4>
                    <div className="max-h-[300px] space-y-2 overflow-y-auto">
                      {jobStatus.results.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded border p-2 text-sm"
                        >
                          <span className="truncate flex-1">{result.topic}</span>
                          <Badge
                            variant={
                              result.status === 'completed'
                                ? 'default'
                                : result.status === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Icons.fileText className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-2 text-sm">No active generation job</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
