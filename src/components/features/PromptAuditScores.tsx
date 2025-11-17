/**
 * Prompt Audit Scores Component
 * Displays quality scores in a user-focused manner
 * Only shows metrics relevant to end users (hides admin/internal metrics)
 * Quality Breakdown is collapsible (hidden by default, especially when scores are low)
 * 
 * NOTE: Security scores are hidden from public view because:
 * - Most prompts are NOT security-focused but aren't insecure
 * - Default scores of 5-6 are normal but alarm enterprise clients
 * - Security is still audited internally (kept in ADMIN_METRICS)
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/lib/icons';

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
  // securityCompliance removed - scores are misleading for non-security prompts
  // Most prompts are NOT security-focused but aren't insecure, leading to confusing low scores
  // Kept in audits internally but hidden from public view
};

// Internal/admin metrics (hidden from public view)
// securityCompliance: Hidden because low scores (5-6) are normal for non-security prompts but alarm enterprise clients
const ADMIN_METRICS = ['seoEnrichment', 'accessibility', 'performance', 'securityCompliance'];

// Weights must match audit script calculation (scripts/content/audit-prompts-patterns.ts)
// These are the actual weights used to calculate overallScore
const categoryWeights: Record<keyof AuditScores['categoryScores'], number> = {
  completeness: 0.30,              // #1 Priority: Has major things for each area
  engineeringUsefulness: 0.25,     // #2 Priority: Works, solid, gives decent first result
  seoEnrichment: 0.20,             // #3 Priority: Good SEO
  caseStudyQuality: 0.10,          // #4 Priority: Shows good value (via case studies)
  enterpriseReadiness: 0.05,        // Reduced weight
  securityCompliance: 0.05,         // Reduced weight
  accessibility: 0.03,             // Reduced weight
  performance: 0.02,                // Reduced weight
};

// Calculate expected overall score from visible categories only
// Note: Actual overallScore may include baseScoreBonus from audit script
function calculateExpectedScore(categoryScores: AuditScores['categoryScores'], visibleOnly: boolean = false): number {
  if (visibleOnly) {
    // Only calculate from visible categories
    const visibleKeys = Object.keys(USER_FOCUSED_CATEGORIES) as Array<keyof AuditScores['categoryScores']>;
    let weightedSum = 0;
    let totalWeight = 0;
    
    visibleKeys.forEach(key => {
      const weight = categoryWeights[key];
      const score = categoryScores[key];
      weightedSum += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  // Calculate from all categories (matches audit script)
  return Object.entries(categoryScores).reduce((sum, [key, score]) => {
    return sum + (score * categoryWeights[key as keyof AuditScores['categoryScores']]);
  }, 0);
}

export function PromptAuditScores({ 
  promptId,
}: PromptAuditScoresProps) {
  const [auditScores, setAuditScores] = useState<AuditScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  useEffect(() => {
    const fetchAuditScores = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/audit`);
        if (response.ok) {
          const data = await response.json();
          if (data.hasAudit && data.auditResult) {
            setAuditScores(data.auditResult);
            // Auto-expand if score is high (>= 7), otherwise collapsed by default
            setIsBreakdownExpanded(data.auditResult.overallScore >= 7);
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

        {/* Quality Score - Clickable to expand breakdown */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  Quality Score
                  <Badge 
                    variant={auditScores.overallScore >= 8 ? 'default' : auditScores.overallScore >= 6 ? 'secondary' : 'outline'}
                    className="text-lg"
                  >
                    {auditScores.overallScore.toFixed(1)}/10
                  </Badge>
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {auditScores.auditVersion && (
                  <span className="text-xs text-muted-foreground">
                    Version {auditScores.auditVersion}
                    {auditScores.auditDate && (
                      <span> • {new Date(auditScores.auditDate).toLocaleDateString()}</span>
                    )}
                  </span>
                )}
                <Icons.chevronDown className={`h-4 w-4 transition-transform ${isBreakdownExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <CardDescription>
              How well this prompt performs across key quality areas
              {!isBreakdownExpanded && (
                <span className="ml-2 text-xs text-muted-foreground">
                  • Click to view breakdown
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

        {/* Category Scores - Collapsible Breakdown */}
        {isBreakdownExpanded && (
          <Card>
            <CardHeader>
              <CardTitle>Quality Breakdown</CardTitle>
              <CardDescription>
                What makes this prompt high quality and useful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show explanation if there's a significant discrepancy */}
              {(() => {
                const expectedScore = calculateExpectedScore(auditScores.categoryScores, true);
                const scoreDiff = Math.abs(auditScores.overallScore - expectedScore);
                if (scoreDiff > 0.5) {
                  return (
                    <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">About the Overall Score</p>
                      <p>
                        The overall score includes all quality factors (including SEO and other technical metrics) 
                        plus additional bonuses for well-structured prompts. The breakdown below shows the visible 
                        categories which contribute to the overall assessment.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              
              {Object.entries(auditScores.categoryScores)
                .filter(([key]) => !ADMIN_METRICS.includes(key)) // Hide admin metrics
                .map(([key, score]) => {
                  const categoryKey = key as keyof typeof USER_FOCUSED_CATEGORIES;
                  const category = USER_FOCUSED_CATEGORIES[categoryKey];
                  if (!category) return null;

                  const _weight = categoryWeights[key as keyof AuditScores['categoryScores']];
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
        )}
      </div>
    </section>
  );
}
