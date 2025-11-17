'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

interface PainPoint {
  id: string;
  title: string;
  description: string;
  recommendation: {
    title: string;
    description: string;
  };
  guardrails: string[];
  workflowLink: string;
}

const painPointsData: Record<string, PainPoint[]> = {
  engineers: [
    {
      id: 'almost-correct-code',
      title: 'Almost Correct Code',
      description:
        'AI generates code that looks 95% right but has missing edge cases, security holes, and performance issues that only break under load.',
      recommendation: {
        title: 'Always Validate AI Suggestions Before Merging',
        description:
          'Treat all AI-generated code as untrusted until validated through manual review, tests, and verification workflows.',
      },
      guardrails: [
        'Prevent Missing Edge Case Testing',
        'Prevent Insufficient Test Coverage',
        'Prevent Missing Security Tests',
      ],
      workflowLink: '/workflows/code-quality/tdd-with-ai-pair',
    },
    {
      id: 'hallucinated-capabilities',
      title: 'AI Hallucinations',
      description:
        'AI confidently invents non-existent API endpoints, deprecated methods, or phantom features that seem plausible but are fundamentally broken.',
      recommendation: {
        title: 'Ground AI with Current Schema and API Specs',
        description:
          'Feed exact database schemas and OpenAPI specs into context to stop AI from guessing. Convert hallucinations into context-aware code.',
      },
      guardrails: [
        'Prevent Data Type Mismatch in API Integration',
        'Prevent Breaking API Changes',
        'Prevent Missing Request Validation',
      ],
      workflowLink: '/workflows/ai-behavior/stop-schema-guessing',
    },
    {
      id: 'schema-drift',
      title: 'Schema Drift',
      description:
        'AI-generated migration scripts hallucinate schema details or miss implicit dependencies, causing silent data corruption in production.',
      recommendation: {
        title: 'Use TDD with AI Pair Programming',
        description:
          'Define test contracts first. Make AI write code that passes comprehensive test suites covering edge cases and failure modes.',
      },
      guardrails: [
        'Prevent Data Corruption in AI-Generated Migrations',
        'Prevent Type Coercion Errors in Batch Processing',
        'Prevent Silent Data Truncation',
      ],
      workflowLink: '/workflows/ai-behavior/stop-schema-guessing',
    },
  ],
  managers: [
    {
      id: 'oversized-prs',
      title: 'Oversized PRs',
      description:
        'Large, unreviewable pull requests slip past AI-assisted teams, introducing unseen regressions and slowing releases.',
      recommendation: {
        title: 'Enforce Small PRs for AI-Generated Code',
        description:
          'Maintain strict PR size limits (≤250 lines) for all code, especially AI-generated, to make reviews effective and catch issues early.',
      },
      guardrails: [
        'Prevent Oversized PRs from AI Code Generation',
        'Prevent Code Review Burnout',
        'Prevent Merge Conflicts',
      ],
      workflowLink: '/workflows/code-quality/keep-prs-under-control',
    },
    {
      id: 'trust-deficit',
      title: 'Trust Deficit',
      description:
        'Teams create "no-fly zones" for AI, avoiding critical code paths due to lack of confidence scoring and transparent verification.',
      recommendation: {
        title: 'Implement Trust-But-Verify Workflows',
        description:
          'Annotate AI suggestions with confidence scores and risk analysis. Focus review attention only where truly needed.',
      },
      guardrails: [
        'Prevent Missing Code Review Checkpoints',
        'Prevent Bypassed Quality Gates',
        'Prevent Unstructured Validation',
      ],
      workflowLink: '/workflows/process/trust-but-verify-triage',
    },
    {
      id: 'insecure-code',
      title: 'Insecure Code',
      description:
        'AI generates insecure patterns: hardcoded secrets, SQL injection vulnerabilities, and missing authentication checks.',
      recommendation: {
        title: 'Use Security Guardrails Workflow',
        description:
          'Implement automated security scanning (SAST, secret detection, dependency checks) before any AI code reaches production.',
      },
      guardrails: [
        'Prevent Hardcoded Secrets in Generated Code',
        'Prevent SQL Injection Vulnerability',
        'Prevent Insecure Direct Object Reference (IDOR)',
      ],
      workflowLink: '/workflows/security/security-guardrails',
    },
  ],
  directors: [
    {
      id: 'insecure-code',
      title: 'Insecure Code at Scale',
      description:
        'Without org-wide governance, AI tools generate security vulnerabilities faster than teams can review them.',
      recommendation: {
        title: 'Establish AI Governance Before Scaling',
        description:
          'Create AI governance policies, guardrails, and workflows before scaling AI usage to prevent chaos, security risks, and technical debt.',
      },
      guardrails: [
        'Prevent Hardcoded Secrets in Generated Code',
        'Prevent SQL Injection Vulnerability',
        'Prevent Missing Rate Limiting',
      ],
      workflowLink: '/workflows/governance/ai-governance-scorecard',
    },
    {
      id: 'schema-drift',
      title: 'Schema Drift',
      description:
        'AI-generated database changes cause data corruption incidents that are expensive to debug and recover from.',
      recommendation: {
        title: 'Implement Release Readiness Runbook',
        description:
          'Enforce automated quality gates: SAST, dependency scanning, performance analysis, and custom AI guardrails before merge.',
      },
      guardrails: [
        'Prevent Data Corruption in AI-Generated Migrations',
        'Prevent Race Conditions in Concurrent Updates',
        'Prevent Orphaned Records from Cascading Delete',
      ],
      workflowLink: '/workflows/process/release-readiness-runbook',
    },
    {
      id: 'guardrail-evasion',
      title: 'Guardrail Evasion',
      description:
        'Teams bypass quality gates and automated checks under pressure, creating technical debt and compliance risks.',
      recommendation: {
        title: 'Use Identity-First Privilege Design',
        description:
          'Prevent overprivileged AI agents and enforce principle of least privilege across all automation and AI workflows.',
      },
      guardrails: [
        'Prevent Bypassed Quality Gates',
        'Prevent Human-in-Loop Bypass',
        'Prevent Excessive Gate Bypasses',
      ],
      workflowLink: '/workflows/security/identity-first-privilege-design',
    },
  ],
  product: [
    {
      id: 'missing-context',
      title: 'Missing Context',
      description:
        'AI lacks institutional memory. Teams lose context about past decisions, incidents, and why certain patterns exist.',
      recommendation: {
        title: 'Build Institutional Memory System',
        description:
          'Capture every incident, checklist decision, and regression warning—then surface it when teams need it.',
      },
      guardrails: [
        'Prevent Context Forgetting',
        'Prevent Repeated Incidents',
        'Prevent Missing Documentation',
      ],
      workflowLink: '/workflows/memory/memory-and-trend-logging',
    },
    {
      id: 'plan-derailment',
      title: 'Plan Derailment',
      description:
        'AI agents go off-plan, implementing features outside of scope or ignoring requirements, wasting development cycles.',
      recommendation: {
        title: 'Use Task Decomposition Prompt Flow',
        description:
          'Break complex tasks into atomic, verifiable steps with clear acceptance criteria before AI generates code.',
      },
      guardrails: [
        'Prevent Scope Creep in AI Tasks',
        'Prevent Missing Requirements Validation',
        'Prevent Unstructured Task Execution',
      ],
      workflowLink: '/workflows/process/task-decomposition-prompt-flow',
    },
    {
      id: 'vibe-coding',
      title: 'Vibe Coding',
      description:
        'Teams ship code based on "feel" rather than requirements, leading to technical debt and misaligned features.',
      recommendation: {
        title: 'Implement Daily Merge Discipline',
        description:
          'Establish clear merge criteria and daily integration patterns to prevent long-lived branches and integration nightmares.',
      },
      guardrails: [
        'Prevent Merge Conflicts',
        'Prevent Long-Lived Feature Branches',
        'Prevent Integration Debt',
      ],
      workflowLink: '/workflows/process/daily-merge-discipline',
    },
  ],
};

interface PainPointJourneySliderProps {
  role?: 'engineers' | 'managers' | 'directors' | 'product';
}

export function PainPointJourneySlider({ role = 'engineers' }: PainPointJourneySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const painPoints = painPointsData[role];

  // Auto-rotate every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % painPoints.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [painPoints.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      {/* Pain Point Cards - All rendered for SEO */}
      <div className="relative overflow-hidden">
        {painPoints.map((painPoint, index) => (
          <div
            key={painPoint.id}
            className={`transition-all duration-500 ${
              index === currentIndex
                ? 'relative opacity-100'
                : 'absolute inset-0 opacity-0 pointer-events-none'
            }`}
          >
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:border-purple-800 dark:from-purple-900/20 dark:via-gray-900 dark:to-blue-900/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                      Pain Point
                    </div>
                    <CardTitle className="text-3xl">{painPoint.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Problem Description */}
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                  {painPoint.description}
                </p>

                {/* Recommendation */}
                <div className="space-y-3 rounded-lg border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                      Recommendation
                    </h3>
                  </div>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {painPoint.recommendation.title}
                  </p>
                  <p className="text-green-800 dark:text-green-200">
                    {painPoint.recommendation.description}
                  </p>
                </div>

                {/* Guardrails */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icons.shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold">Implement with Guardrails</h3>
                  </div>
                  <ul className="space-y-2">
                    {painPoint.guardrails.map((guardrail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Icons.arrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                        <span className="text-gray-700 dark:text-gray-300">{guardrail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    <Link href={painPoint.workflowLink}>
                      View Workflow
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {painPoints.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-purple-600' : 'w-2 bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
