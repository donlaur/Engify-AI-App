'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface HubContentEditorProps {
  tool: Partial<AITool>;
  onChange: (hubContent: NonNullable<AITool['hubContent']>) => void;
}

export function HubContentEditor({ tool, onChange }: HubContentEditorProps) {
  const [hubContent, setHubContent] = useState<NonNullable<AITool['hubContent']>>(
    tool.hubContent || {
      relatedPrompts: [],
      relatedPatterns: [],
      problems: [],
      articles: [],
      gettingStarted: [],
      officialResources: [],
      communityResources: [],
    }
  );

  const updateHubContent = (updates: Partial<NonNullable<AITool['hubContent']>>) => {
    const updated = { ...hubContent, ...updates };
    setHubContent(updated);
    onChange(updated);
  };

  // Problems Section
  const addProblem = () => {
    const newProblem = {
      id: crypto.randomUUID(),
      title: '',
      issue: '',
      impact: '',
      engifySolution: '',
      order: (hubContent.problems?.length || 0) + 1,
    };
    updateHubContent({
      problems: [...(hubContent.problems || []), newProblem],
    });
  };

  const updateProblem = (index: number, field: string, value: string) => {
    const problems = [...(hubContent.problems || [])];
    problems[index] = { ...problems[index], [field]: value };
    updateHubContent({ problems });
  };

  const removeProblem = (index: number) => {
    const problems = [...(hubContent.problems || [])];
    problems.splice(index, 1);
    updateHubContent({ problems });
  };

  // Resources Section
  const addResource = (type: 'official' | 'community') => {
    const key = type === 'official' ? 'officialResources' : 'communityResources';
    const newResource = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      description: '',
      order: (hubContent[key]?.length || 0) + 1,
    };
    updateHubContent({
      [key]: [...(hubContent[key] || []), newResource],
    });
  };

  const updateResource = (
    type: 'official' | 'community',
    index: number,
    field: string,
    value: string
  ) => {
    const key = type === 'official' ? 'officialResources' : 'communityResources';
    const resources = [...(hubContent[key] || [])];
    resources[index] = { ...resources[index], [field]: value };
    updateHubContent({ [key]: resources });
  };

  const removeResource = (type: 'official' | 'community', index: number) => {
    const key = type === 'official' ? 'officialResources' : 'communityResources';
    const resources = [...(hubContent[key] || [])];
    resources.splice(index, 1);
    updateHubContent({ [key]: resources });
  };

  // Getting Started Section
  const addGettingStartedStep = () => {
    const newStep = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      order: (hubContent.gettingStarted?.length || 0) + 1,
    };
    updateHubContent({
      gettingStarted: [...(hubContent.gettingStarted || []), newStep],
    });
  };

  const updateGettingStartedStep = (index: number, field: string, value: string) => {
    const steps = [...(hubContent.gettingStarted || [])];
    steps[index] = { ...steps[index], [field]: value };
    updateHubContent({ gettingStarted: steps });
  };

  const removeGettingStartedStep = (index: number) => {
    const steps = [...(hubContent.gettingStarted || [])];
    steps.splice(index, 1);
    updateHubContent({ gettingStarted: steps });
  };

  // Articles Section
  const addArticle = () => {
    const newArticle = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      slug: '',
      status: 'coming_soon' as const,
      order: (hubContent.articles?.length || 0) + 1,
    };
    updateHubContent({
      articles: [...(hubContent.articles || []), newArticle],
    });
  };

  const updateArticle = (index: number, field: string, value: string) => {
    const articles = [...(hubContent.articles || [])];
    articles[index] = { ...articles[index], [field]: value };
    updateHubContent({ articles });
  };

  const removeArticle = (index: number) => {
    const articles = [...(hubContent.articles || [])];
    articles.splice(index, 1);
    updateHubContent({ articles });
  };

  return (
    <div className="space-y-6">
      {/* Problems & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Problems & Solutions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Common problems users face with this tool and how Engify solves them
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubContent.problems?.map((problem, idx) => (
              <Card key={problem.id} className="border-dashed">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <Label>Problem Title</Label>
                      <Input
                        placeholder="e.g., No Guardrails"
                        value={problem.title}
                        onChange={(e) => updateProblem(idx, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Issue Description</Label>
                      <Textarea
                        placeholder="What's the problem?"
                        value={problem.issue}
                        onChange={(e) => updateProblem(idx, 'issue', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Impact</Label>
                      <Textarea
                        placeholder="What's the impact on users?"
                        value={problem.impact}
                        onChange={(e) => updateProblem(idx, 'impact', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Engify Solution</Label>
                      <Textarea
                        placeholder="How does Engify solve this?"
                        value={problem.engifySolution}
                        onChange={(e) => updateProblem(idx, 'engifySolution', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProblem(idx)}
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Remove Problem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addProblem} variant="outline">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Problem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Community Resources</CardTitle>
          <p className="text-sm text-muted-foreground">
            External links to official docs, community sites, and helpful resources
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Official Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Official Resources</h4>
              <div className="space-y-3">
                {hubContent.officialResources?.map((resource, idx) => (
                  <Card key={resource.id} className="border-dashed">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Title (e.g., Official Documentation)"
                          value={resource.title}
                          onChange={(e) =>
                            updateResource('official', idx, 'title', e.target.value)
                          }
                        />
                        <Input
                          placeholder="URL"
                          value={resource.url}
                          onChange={(e) =>
                            updateResource('official', idx, 'url', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={resource.description || ''}
                          onChange={(e) =>
                            updateResource('official', idx, 'description', e.target.value)
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeResource('official', idx)}
                        >
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={() => addResource('official')} variant="outline" size="sm">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Official Resource
                </Button>
              </div>
            </div>

            {/* Community Resources */}
            <div>
              <h4 className="mb-3 font-semibold">Community Resources</h4>
              <div className="space-y-3">
                {hubContent.communityResources?.map((resource, idx) => (
                  <Card key={resource.id} className="border-dashed">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Title (e.g., Reddit Community)"
                          value={resource.title}
                          onChange={(e) =>
                            updateResource('community', idx, 'title', e.target.value)
                          }
                        />
                        <Input
                          placeholder="URL"
                          value={resource.url}
                          onChange={(e) =>
                            updateResource('community', idx, 'url', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={resource.description || ''}
                          onChange={(e) =>
                            updateResource('community', idx, 'description', e.target.value)
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeResource('community', idx)}
                        >
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={() => addResource('community')} variant="outline" size="sm">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Community Resource
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
          <p className="text-sm text-muted-foreground">
            Step-by-step guide for new users
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubContent.gettingStarted?.map((step, idx) => (
              <Card key={step.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Step Title (e.g., Download & Install)"
                      value={step.title}
                      onChange={(e) => updateGettingStartedStep(idx, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Step Description"
                      value={step.description}
                      onChange={(e) =>
                        updateGettingStartedStep(idx, 'description', e.target.value)
                      }
                      rows={2}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeGettingStartedStep(idx)}
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Remove Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addGettingStartedStep} variant="outline">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>

            <div className="mt-4">
              <Label>Pro Tip (optional)</Label>
              <Textarea
                placeholder="Add a helpful pro tip for users..."
                value={hubContent.gettingStartedProTip || ''}
                onChange={(e) => updateHubContent({ gettingStartedProTip: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Related Articles</CardTitle>
          <p className="text-sm text-muted-foreground">
            In-depth guides and articles (can be placeholders for &quot;Coming Soon&quot;)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubContent.articles?.map((article, idx) => (
              <Card key={article.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Article Title"
                      value={article.title}
                      onChange={(e) => updateArticle(idx, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Article Description"
                      value={article.description}
                      onChange={(e) => updateArticle(idx, 'description', e.target.value)}
                      rows={2}
                    />
                    <Input
                      placeholder="Slug (when published, e.g., cursor-vs-windsurf)"
                      value={article.slug || ''}
                      onChange={(e) => updateArticle(idx, 'slug', e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArticle(idx)}
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Remove Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addArticle} variant="outline">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
