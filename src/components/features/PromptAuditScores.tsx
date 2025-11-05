/**
 * Prompt Audit Scores Component
 * Displays quality scores in a user-focused manner
 * Only shows metrics relevant to end users (hides admin/internal metrics)
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

// User-focused category labels (only show metrics users care about)
const USER_FOCUSED_CATEGORIES: Record<string, { label: string; description: string }> = {
  engineeringUsefulness: {
    label: 'Ready to Use',
    description: 'How well this prompt works out of the box'
  },
  completeness: {
    label: 'Completeness',
    description: 'Includes all necessary information and examples'
  },
  caseStudyQuality: {
    label: 'Real-World Examples',
    description: 'Practical examples showing how to use this prompt'
  },
  enterpriseReadiness: {
    label: 'Enterprise Ready',
    description: 'Suitable for professional and team use'
  },
  securityCompliance: {
    label: 'Security & Privacy',
    description: 'Follows security best practices'
  },
};

// Internal/admin metrics (hidden from public view)
const ADMIN_METRICS = ['seoEnrichment', 'accessibility', 'performance'];

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
            How this prompt measures up on key quality indicators
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
              How well this prompt performs across key quality areas
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

        {/* Category Scores - User-Focused Display */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Breakdown</CardTitle>
            <CardDescription>
              What makes this prompt high quality and useful
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(auditScores.categoryScores)
              .filter(([key]) => !ADMIN_METRICS.includes(key)) // Hide admin metrics
              .map(([key, score]) => {
                const categoryKey = key as keyof typeof USER_FOCUSED_CATEGORIES;
                const category = USER_FOCUSED_CATEGORIES[categoryKey];
                if (!category) return null;
                
                const weight = categoryWeights[key as keyof AuditScores['categoryScores']];
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {category.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {category.description}
                        </span>
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
