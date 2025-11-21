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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { getAllContentTypes } from '@/lib/content/content-types';
import { GenerationProgressModal } from './GenerationProgressModal';
import { ContentPreview } from './ContentPreview';

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

/**
 * ContentGeneratorPanel Component
 * 
 * Admin panel for generating content using AI. Supports both single-agent
 * and multi-agent generation workflows with various content types.
 * 
 * @component
 * @pattern ADMIN_PANEL, AI_GENERATION_INTERFACE
 * @principle DRY - Centralizes content generation logic
 * 
 * @features
 * - Single-agent and multi-agent generation modes
 * - Multiple content type support (tutorial, article, etc.)
 * - Topic input and processing
 * - Generation progress tracking
 * - Job management and monitoring
 * 
 * @example
 * ```tsx
 * <ContentGeneratorPanel />
 * ```
 * 
 * @usage
 * Used in OpsHub admin center for AI-powered content generation.
 * Provides interface for generating various types of content.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage patterns
 */
export function ContentGeneratorPanel() {
  const { toast } = useToast();
  const [generatorType, setGeneratorType] = useState<'single-agent' | 'multi-agent'>('single-agent');
  const [contentType, setContentType] = useState('tutorial');
  const [topicsInput, setTopicsInput] = useState('');
  const [category, setCategory] = useState('Tutorial');
  const [targetWordCount, setTargetWordCount] = useState('800');
  const [keywords, setKeywords] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  
  // AI Q&A state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [askingAI, setAskingAI] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  
  // Queue state
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'all' | 'queued' | 'generating' | 'completed' | 'failed'>('queued');
  
  // Review state
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'published'>('pending');
  
  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressJobId, setProgressJobId] = useState<string | null>(null);
  
  const contentTypes = getAllContentTypes();
  const selectedContentType = contentTypes.find(t => t.id === contentType);

  // Load available AI models
  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetch('/api/admin/content/strategy-qa');
        const data = await response.json();
        if (data.success) {
          setAvailableModels(data.models);
          setSelectedModel(data.models[0]?.id || '');
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    }
    loadModels();
  }, []);

  // Load queue
  const loadQueue = async () => {
    setLoadingQueue(true);
    try {
      const statusParam = queueFilter === 'all' ? '' : `?status=${queueFilter}`;
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/content/queue${statusParam}`),
        fetch('/api/admin/content/queue?stats=true'),
      ]);
      
      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();
      
      if (itemsData.success) {
        setQueueItems(itemsData.items);
      }
      if (statsData.success) {
        setQueueStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [queueFilter]);

  // Load generated content for review
  const loadReviewContent = async () => {
    setLoadingReview(true);
    try {
      const statusParam = reviewFilter === 'all' ? '' : `?status=${reviewFilter}`;
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/content/generated${statusParam}`),
        fetch('/api/admin/content/generated?stats=true'),
      ]);
      
      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();
      
      if (itemsData.success) {
        setGeneratedContent(itemsData.items);
      }
      if (statsData.success) {
        setReviewStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading review content:', error);
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    loadReviewContent();
  }, [reviewFilter]);

  // Handle content review actions
  const handleReview = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`/api/admin/content/generated?id=${id}&action=review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: `Content ${action}d`,
          description: `Content has been ${action}d successfully`,
        });
        loadReviewContent();
        setSelectedContent(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} content`,
        variant: 'destructive',
      });
    }
  };

  // Handle content update
  const handleUpdateContent = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/content/generated?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Content updated',
          description: 'Changes saved successfully',
        });
        loadReviewContent();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive',
      });
    }
  };

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

  const handleAskAI = async () => {
    try {
      setAskingAI(true);
      const response = await fetch('/api/admin/content/strategy-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion,
          modelId: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiAnswer(data);
        
        // Auto-fill form with recommendations
        if (data.recommendedContentType) {
          setContentType(data.recommendedContentType);
        }
        if (data.suggestedKeywords) {
          setKeywords(data.suggestedKeywords.join(', '));
        }
        if (data.estimatedCost) {
          // Update UI to show estimated cost
        }
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI answer',
        variant: 'destructive',
      });
    } finally {
      setAskingAI(false);
    }
  };

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
        
        // Open progress modal
        setProgressJobId(data.jobId);
        setShowProgressModal(true);

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

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue">Queue ({queueStats?.total || 0})</TabsTrigger>
          <TabsTrigger value="review">Review ({reviewStats?.byStatus?.pending || 0})</TabsTrigger>
          <TabsTrigger value="strategy">Content Strategy</TabsTrigger>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="status">Job Status</TabsTrigger>
        </TabsList>

        {/* Queue Tab */}
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Queue</CardTitle>
                  <CardDescription>
                    {queueStats?.total || 0} items ready to generate
                  </CardDescription>
                </div>
                <Button onClick={loadQueue} disabled={loadingQueue}>
                  {loadingQueue ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.refresh className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              {queueStats && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-2xl font-bold">{queueStats.byStatus?.queued || 0}</div>
                    <div className="text-xs text-muted-foreground">Queued</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-2xl font-bold">{queueStats.byStatus?.generating || 0}</div>
                    <div className="text-xs text-muted-foreground">Generating</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-2xl font-bold text-green-600">{queueStats.byStatus?.completed || 0}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-2xl font-bold text-red-600">{queueStats.byStatus?.failed || 0}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Label>Filter:</Label>
                <Select value={queueFilter} onValueChange={(v: any) => setQueueFilter(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="queued">Queued Only</SelectItem>
                    <SelectItem value="generating">Generating</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Queue Items */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {loadingQueue ? (
                  <div className="flex items-center justify-center py-8">
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                  </div>
                ) : queueItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Icons.inbox className="h-12 w-12 mb-2 opacity-20" />
                    <p>No items in queue</p>
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">{item.contentType}</Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{item.targetWordCount} words</span>
                          <span>•</span>
                          <span>{item.keywords?.length || 0} keywords</span>
                          {item.batch && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{item.batch}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.status === 'completed'
                              ? 'default'
                              : item.status === 'failed'
                                ? 'destructive'
                                : item.status === 'generating'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {item.status}
                        </Badge>
                        {item.status === 'queued' && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/admin/content/generate/single', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    queueItemId: item.id,
                                    title: item.title,
                                    contentType: item.contentType,
                                    targetWordCount: item.targetWordCount,
                                    keywords: item.keywords,
                                  }),
                                });
                                
                                const data = await response.json();
                                if (data.success) {
                                  toast({
                                    title: 'Generation started',
                                    description: item.title,
                                  });
                                  setProgressJobId(data.jobId);
                                  setShowProgressModal(true);
                                  loadQueue();
                                } else {
                                  toast({
                                    title: 'Error',
                                    description: data.error,
                                    variant: 'destructive',
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to start generation',
                                  variant: 'destructive',
                                });
                              }
                            }}
                            disabled={item.status === 'generating'}
                          >
                            <Icons.sparkles className="mr-2 h-4 w-4" />
                            Generate
                          </Button>
                        )}
                        {item.status === 'generating' && (
                          <Button size="sm" disabled>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </Button>
                        )}
                        {item.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                // Reset status to queued
                                await fetch('/api/admin/content/queue', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: item.id,
                                    status: 'queued',
                                  }),
                                });

                                // Start generation
                                const response = await fetch('/api/admin/content/generate/single', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    queueItemId: item.id,
                                    title: item.title,
                                    contentType: item.contentType,
                                    targetWordCount: item.targetWordCount,
                                    keywords: item.keywords,
                                  }),
                                });
                                
                                const data = await response.json();
                                if (data.success) {
                                  toast({
                                    title: 'Retry started',
                                    description: item.title,
                                  });
                                  setProgressJobId(data.jobId);
                                  setShowProgressModal(true);
                                  loadQueue();
                                } else {
                                  toast({
                                    title: 'Error',
                                    description: data.error,
                                    variant: 'destructive',
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to retry generation',
                                  variant: 'destructive',
                                });
                              }
                            }}
                          >
                            <Icons.refresh className="mr-2 h-4 w-4" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review">
          {selectedContent ? (
            // Content Editor View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedContent.title}</CardTitle>
                    <CardDescription>
                      {selectedContent.wordCount} words • {selectedContent.contentType}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedContent(null)}>
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>Content (Markdown)</Label>
                  <Textarea
                    value={editingContent || selectedContent.content}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={selectedContent.title}
                      onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={selectedContent.slug || ''}
                      onChange={(e) => setSelectedContent({...selectedContent, slug: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedContent.description || ''}
                    onChange={(e) => setSelectedContent({...selectedContent, description: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleUpdateContent(selectedContent.id, {
                        title: selectedContent.title,
                        content: editingContent || selectedContent.content,
                        description: selectedContent.description,
                        slug: selectedContent.slug,
                      });
                    }}
                  >
                    <Icons.save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  {selectedContent.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => handleReview(selectedContent.id, 'approve')}
                      >
                        <Icons.checkCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const notes = prompt('Rejection reason:');
                          if (notes) {
                            handleReview(selectedContent.id, 'reject', notes);
                          }
                        }}
                      >
                        <Icons.cancel className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedContent.status === 'approved' && (
                    <Button
                      variant="default"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/admin/content/generated?id=${selectedContent.id}&action=review`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'publish' }),
                          });

                          const data = await response.json();
                          if (data.success) {
                            toast({
                              title: 'Content Published',
                              description: `Available at ${data.url}`,
                            });
                            loadReviewContent();
                            setSelectedContent(null);
                          }
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to publish content',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <Icons.globe className="mr-2 h-4 w-4" />
                      Publish to Site
                    </Button>
                  )}
                  {selectedContent.status === 'published' && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedContent.publishedUrl, '_blank')}
                    >
                      <Icons.externalLink className="mr-2 h-4 w-4" />
                      View Published
                    </Button>
                  )}
                </div>

                {/* Preview */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 max-h-[600px] overflow-y-auto">
                    <ContentPreview content={editingContent || selectedContent.content} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Content List View
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Review Generated Content</CardTitle>
                    <CardDescription>
                      {reviewStats?.total || 0} items awaiting review
                    </CardDescription>
                  </div>
                  <Button onClick={loadReviewContent} disabled={loadingReview}>
                    {loadingReview ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.refresh className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                {reviewStats && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold">{reviewStats.byStatus?.pending || 0}</div>
                      <div className="text-xs text-muted-foreground">Pending Review</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold text-green-600">{reviewStats.byStatus?.approved || 0}</div>
                      <div className="text-xs text-muted-foreground">Approved</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold text-blue-600">{reviewStats.byStatus?.published || 0}</div>
                      <div className="text-xs text-muted-foreground">Published</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-2xl font-bold text-red-600">{reviewStats.byStatus?.rejected || 0}</div>
                      <div className="text-xs text-muted-foreground">Rejected</div>
                    </div>
                  </div>
                )}

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Label>Filter:</Label>
                  <Select value={reviewFilter} onValueChange={(v: any) => setReviewFilter(v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {loadingReview ? (
                    <div className="flex items-center justify-center py-8">
                      <Icons.spinner className="h-8 w-8 animate-spin" />
                    </div>
                  ) : generatedContent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Icons.inbox className="h-12 w-12 mb-2 opacity-20" />
                      <p>No content to review</p>
                    </div>
                  ) : (
                    generatedContent.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setSelectedContent(item);
                            setEditingContent(item.content);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <Badge variant="outline">{item.contentType}</Badge>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{item.wordCount} words</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.costUSD && (
                              <>
                                <span>•</span>
                                <span>${item.costUSD.toFixed(3)}</span>
                              </>
                            )}
                          </div>
                          {/* Show URL for approved/published content */}
                          {(item.status === 'approved' || item.status === 'published') && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">
                                /blog/{item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                              </span>
                              {item.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 px-2 text-xs"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const response = await fetch(`/api/admin/content/generated?id=${item.id}&action=review`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ action: 'publish' }),
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        toast({
                                          title: 'Published',
                                          description: `Live at ${data.url}`,
                                        });
                                        loadReviewContent();
                                      }
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to publish',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                >
                                  <Icons.globe className="h-3 w-3 mr-1" />
                                  Publish Now
                                </Button>
                              )}
                              {item.status === 'published' && item.publishedUrl && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(item.publishedUrl, '_blank');
                                  }}
                                >
                                  <Icons.externalLink className="h-3 w-3 mr-1" />
                                  View Live
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end min-w-[100px]">
                          <Badge
                            variant={
                              item.status === 'published'
                                ? 'default'
                                : item.status === 'approved'
                                  ? 'secondary'
                                  : item.status === 'rejected'
                                    ? 'destructive'
                                    : 'outline'
                            }
                            className="w-full justify-center"
                          >
                            {item.status}
                          </Badge>
                          {/* Quick action for pending items */}
                          {item.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs w-full"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/admin/content/generated?id=${item.id}&action=review`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'approve' }),
                                  });

                                  const data = await response.json();
                                  if (data.success) {
                                    toast({
                                      title: 'Approved',
                                      description: 'Content ready to publish',
                                    });
                                    loadReviewContent();
                                  }
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to approve',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <Icons.checkCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Strategy Tab */}
        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Strategy Assistant</CardTitle>
              <CardDescription>
                Ask AI about content strategy before generating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Selector */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Input */}
              <div className="space-y-2">
                <Label>Ask AI</Label>
                <Textarea
                  placeholder="What content type should I use for 'AI in Agile'?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleAskAI} disabled={askingAI || !aiQuestion}>
                {askingAI ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Asking AI...
                  </>
                ) : (
                  <>
                    <Icons.sparkles className="mr-2 h-4 w-4" />
                    Ask AI
                  </>
                )}
              </Button>

              {/* AI Answer */}
              {aiAnswer && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2">AI Recommendation:</h4>
                  <p className="text-sm mb-4">{aiAnswer.answer}</p>
                  
                  {aiAnswer.recommendedContentType && (
                    <div className="space-y-2 text-sm">
                      <div><strong>Content Type:</strong> {aiAnswer.recommendedContentType}</div>
                      {aiAnswer.suggestedKeywords && (
                        <div><strong>Keywords:</strong> {aiAnswer.suggestedKeywords.join(', ')}</div>
                      )}
                      {aiAnswer.estimatedCost && (
                        <div><strong>Estimated Cost:</strong> ${aiAnswer.estimatedCost}</div>
                      )}
                      {aiAnswer.estimatedTime && (
                        <div><strong>Estimated Time:</strong> {aiAnswer.estimatedTime} min</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate">
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
            {/* Content Type */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContentType && (
                <p className="text-xs text-muted-foreground">
                  ~{selectedContentType.targetWordCount} words, ${selectedContentType.estimatedCost}, {selectedContentType.estimatedTime} min
                </p>
              )}
            </div>

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
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status">
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
        </TabsContent>
      </Tabs>
      
      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        jobId={progressJobId}
        onComplete={() => {
          // Refresh both queue and review lists when generation completes
          loadQueue();
          loadReviewContent();
        }}
      />
    </div>
  );
}
