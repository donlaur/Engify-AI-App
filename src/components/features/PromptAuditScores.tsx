/**
 * Prompt Audit Scores Component
 * Displays quality scores in a positive, SEO-focused manner
 * Designed for public-facing prompt pages
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface AuditScores {
  auditVersion?: number;
  auditDate?: string;
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

  useEffect(() => {
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
      }
    };

    fetchAuditScores();
  }, [promptId]);

  if (isLoading) {
    return null; // Don't show loading state on public pages
  }

  if (!auditScores) {
    return null; // Don't show empty state on public pages
  }

  return (
    <section className="mt-12">
      <Separator />
      
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Quality Assessment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comprehensive evaluation across multiple quality dimensions
          </p>
        </div>

        {/* Quality Score - Positive Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Quality Score
              <Badge 
                variant={auditScores.overallScore >= 8 ? 'default' : auditScores.overallScore >= 6 ? 'secondary' : 'outline'}
                className="text-lg"
              >
                {auditScores.overallScore.toFixed(1)}/10
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive quality assessment across 8 categories
              {auditScores.auditVersion && (
                <span className="ml-2 text-xs text-muted-foreground">
                  • Version {auditScores.auditVersion}
                  {auditScores.auditDate && (
                    <span> • {new Date(auditScores.auditDate).toLocaleDateString()}</span>
                  )}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={auditScores.overallScore * 10} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Category Scores - Neutral Display */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Dimensions</CardTitle>
            <CardDescription>
              Breakdown of quality assessment across key areas
            </CardDescription>
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
                      <span className="font-bold text-foreground">
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={score * 10} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
