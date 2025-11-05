/**
 * Prompt Audit Scores Component
 * Displays audit scores and agent reviews for a prompt
 * Fetches audit results from API
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface AuditScores {
  overallScore: number;
  categoryScores: {
    engineeringUsefulness: number;
    caseStudyQuality: number;
    completeness: number;
    seoEnrichment: number;
    enterpriseReadiness: number;
    securityCompliance: number;
    accessibility: number;
    performance: number;
  };
  agentReviews?: Record<string, string>;
}

interface PromptAuditScoresProps {
  promptId: string;
}

const categoryLabels: Record<keyof AuditScores['categoryScores'], string> = {
  engineeringUsefulness: 'Engineering Usefulness',
  caseStudyQuality: 'Case Study Quality',
  completeness: 'Completeness',
  seoEnrichment: 'SEO Enrichment',
  enterpriseReadiness: 'Enterprise Readiness',
  securityCompliance: 'Security & Compliance',
  accessibility: 'Accessibility',
  performance: 'Performance',
};

const categoryWeights: Record<keyof AuditScores['categoryScores'], number> = {
  engineeringUsefulness: 0.25,
  caseStudyQuality: 0.15,
  completeness: 0.15,
  seoEnrichment: 0.10,
  enterpriseReadiness: 0.15,
  securityCompliance: 0.10,
  accessibility: 0.05,
  performance: 0.05,
};

export function PromptAuditScores({ 
  promptId,
}: PromptAuditScoresProps) {
  const [auditScores, setAuditScores] = useState<AuditScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAuditScores = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/audit`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasAudit && data.auditResult) {
          setAuditScores(data.auditResult);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit scores:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditScores();
  }, [promptId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger audit via API
    await fetch(`/api/prompts/${promptId}/audit`, { method: 'POST' });
    await fetchAuditScores();
  };

  if (isLoading) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Loading audit scores...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!auditScores) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">No audit scores available</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? 'Running Audit...' : 'Run Audit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <section className="mt-12">
      <Separator />
      
      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 Quality Audit Scores</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <Icons.refresh className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Audit'}
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Overall Score
              <Badge 
                variant={auditScores.overallScore >= 8 ? 'default' : auditScores.overallScore >= 6 ? 'secondary' : 'destructive'}
                className="text-lg"
              >
                {auditScores.overallScore.toFixed(1)}/10
              </Badge>
            </CardTitle>
            <CardDescription>
              Multi-agent audit score across 8 categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={auditScores.overallScore * 10} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(auditScores.categoryScores).map(([key, score]) => {
              const categoryKey = key as keyof AuditScores['categoryScores'];
              const weight = categoryWeights[categoryKey];
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {categoryLabels[categoryKey]}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(weight * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${scoreColor(score)}`}>
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={score * 10} 
                    className={`h-2 ${scoreBgColor(score)}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Agent Reviews */}
        {auditScores.agentReviews && Object.keys(auditScores.agentReviews).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Agent Reviews</CardTitle>
              <CardDescription>
                Detailed feedback from {Object.keys(auditScores.agentReviews).length} specialized reviewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(auditScores.agentReviews).slice(0, 3).map(([agentName, review]) => {
                  const displayName = agentName
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                  const reviewText = typeof review === 'string' ? review : JSON.stringify(review, null, 2);
                  const isLong = reviewText.length > 500;
                  
                  return (
                    <div key={agentName} className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">{displayName}</h4>
                      <div className="rounded-lg bg-muted p-3">
                        <pre className="whitespace-pre-wrap text-xs">
                          {isLong ? reviewText.substring(0, 500) + '...' : reviewText}
                        </pre>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(auditScores.agentReviews).length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{Object.keys(auditScores.agentReviews).length - 3} more agent reviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

