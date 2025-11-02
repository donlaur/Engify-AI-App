import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

/**
 * AI-Augmented Workflow Page
 * Showcases the systematic process, guardrails, and "Process as a Product" approach
 */
export default function AIWorkflowPage() {
  const principles = [
    {
      title: 'Process as a Product',
      icon: Icons.target,
      description: 'Workflows, guardrails, and documentation are first-class products',
      examples: [
        '12 ADRs documenting every architectural decision',
        '3 pre-commit hooks blocking bad commits',
        '115+ documentation pages',
        'Daily planning docs (DAY_5_PLAN.md, DAY_6_CONTENT_HARDENING.md)',
      ],
    },
    {
      title: 'Parallel Development',
      icon: Icons.gitBranch,
      description: 'Git worktrees enable multiple AI agents working simultaneously',
      examples: [
        '3 worktrees running in parallel (main, DRY, QA)',
        'Zero merge conflicts despite multiple agents',
        'Atomic commits with instant push strategy',
        'Independent testing per worktree',
      ],
    },
    {
      title: 'Multi-Model Strategy',
      icon: Icons.sparkles,
      description: 'Different AI models for different tasks',
      examples: [
        'Claude Sonnet 4.5: Core development & architecture',
        'GPT-4: Code review & optimization',
        'Gemini: Research & strategic analysis',
        'Model-specific strengths leveraged systematically',
      ],
    },
    {
      title: 'Quality Guardrails',
      icon: Icons.shield,
      description: 'Automated checks prevent regressions',
      examples: [
        'Enterprise compliance checker (pre-commit)',
        'Mock data detection patterns',
        'Schema validation enforcement',
        'Red-hat reviews for security/trust',
      ],
    },
  ];

  const workflow = [
    {
      phase: 'Planning',
      icon: Icons.fileText,
      color: 'from-blue-500 to-cyan-500',
      activities: [
        'Create detailed plan docs (DAY_X_PLAN.md)',
        'Break into phases with clear acceptance criteria',
        'Document exit criteria for each phase',
        'Link to relevant ADRs and documentation',
      ],
      artifacts: [
        'DAY_5_PLAN.md (Infrastructure)',
        'DAY_6_CONTENT_HARDENING.md (Quality)',
        'DAY_7_QA_FRONTEND_IMPROVEMENTS.md (Polish)',
      ],
    },
    {
      phase: 'Development',
      icon: Icons.code,
      color: 'from-purple-500 to-pink-500',
      activities: [
        'Multiple worktrees for parallel work',
        'AI agents in separate branches',
        'Atomic commits with conventional format',
        'Real-time documentation updates',
      ],
      artifacts: [
        'feat: add feature (with tests)',
        'fix: resolve bug (with root cause)',
        'refactor: DRY improvements',
        'docs: update ADR-XXX',
      ],
    },
    {
      phase: 'Red Hat Review',
      icon: Icons.search,
      color: 'from-orange-500 to-red-500',
      activities: [
        'Devil\'s advocate perspective',
        'Security/trust issue identification',
        'Pattern audit for systematic bugs',
        'Enterprise compliance verification',
      ],
      artifacts: [
        'RED_HAT_TRUST_AUDIT.md',
        'PATTERN_AUDIT_DAY7.md',
        'ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md',
      ],
    },
    {
      phase: 'Quality Gates',
      icon: Icons.checkCircle,
      color: 'from-green-500 to-emerald-500',
      activities: [
        'Pre-commit hooks run automatically',
        'Mock data detection',
        'Enterprise compliance checks',
        'Test coverage verification',
      ],
      artifacts: [
        'check-enterprise-compliance.js',
        'validate-schema.js',
        'security-check.js',
      ],
    },
  ];

  const guardrails = [
    {
      name: 'Enterprise Compliance Checker',
      file: 'check-enterprise-compliance.js',
      checks: [
        'New API routes have rate limiting',
        'User input has XSS sanitization',
        'Client components have error boundaries',
        'API routes have tests',
        'Schemas include organizationId',
        'Significant events have audit logging',
        'No hardcoded AI model names',
        'No mock data fallbacks (|| 76, || 23)',
      ],
      severity: 'Blocks commits on CRITICAL/HIGH issues',
    },
    {
      name: 'Mock Data Detection',
      file: 'Pattern-based analysis',
      checks: [
        'Fallback values like || 100 for stats',
        'Fake engagement metrics (views: 500)',
        'TODO comments about mock data',
        'Context-aware (allows dates, configs)',
      ],
      severity: 'Prevents fake metrics in production',
    },
    {
      name: 'Schema Validation',
      file: 'validate-schema.js',
      checks: [
        'Database schema matches TypeScript types',
        'No hardcoded field names',
        'Proper type usage in queries',
        'No unsafe array access',
      ],
      severity: 'Prevents schema drift',
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-24">
        <div className="absolute inset-0 -z-10 animate-glow bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/10 text-white"
            >
              <Icons.sparkles className="mr-2 h-3 w-3" />
              AI-Augmented Engineering
            </Badge>

            <h1 className="text-5xl font-bold text-white sm:text-6xl">
              Process as a Product
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                AI Workflow & Guardrails
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-200">
              How to build production software with AI agents: systematic
              process, automated guardrails, and continuous quality verification
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link href="https://github.com/donlaur/Engify-AI-App" target="_blank">
                  <Icons.github className="mr-2 h-4 w-4" />
                  View Source Code
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/built-in-public">
                  <Icons.code className="mr-2 h-4 w-4" />
                  See How It's Built
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Core Principles</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Four pillars of AI-augmented development
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{principle.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {principle.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {principle.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Icons.check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">The Workflow</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Four phases from planning to production
            </p>
          </div>

          <div className="space-y-6">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.phase} className="border-2">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shrink-0`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Phase {index + 1}</Badge>
                          <CardTitle className="text-2xl">
                            {step.phase}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-semibold">Activities</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {step.activities.map((activity, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Icons.arrowRight className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-3 font-semibold">Artifacts</h4>
                        <ul className="space-y-2">
                          {step.artifacts.map((artifact, i) => (
                            <li
                              key={i}
                              className="rounded-md bg-muted p-2 font-mono text-xs"
                            >
                              {artifact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Automated Guardrails */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Automated Guardrails</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Pre-commit hooks that enforce enterprise standards
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {guardrails.map((guardrail) => (
            <Card key={guardrail.name} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icons.shield className="h-5 w-5 text-purple-600" />
                  {guardrail.name}
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  {guardrail.file}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Checks
                  </p>
                  <ul className="space-y-1.5">
                    {guardrail.checks.map((check, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Icons.check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                        <span className="text-muted-foreground">{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                  <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                    {guardrail.severity}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Real Examples */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Real-World Examples</h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              How these practices caught real issues
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <Icons.alertCircle className="h-5 w-5" />
                  Issue Caught: Mock Data Fallbacks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Problem:</strong> Homepage had fake metrics visible in
                  public repo: <code className="rounded bg-red-100 px-1 dark:bg-red-900">|| 76</code> and{' '}
                  <code className="rounded bg-red-100 px-1 dark:bg-red-900">|| 23</code>
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Detection:</strong> Pre-commit hook flagged pattern{' '}
                  <code className="rounded bg-red-100 px-1 dark:bg-red-900">/\|\|\s*\d{'{2,}'}/g</code>
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Fix:</strong> Replaced with professional empty states:
                  "Growing Daily" instead of fake numbers
                </p>
                <Badge variant="destructive">HIGH SEVERITY</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <Icons.checkCircle className="h-5 w-5" />
                  Pattern Audit Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Discovery:</strong> Found pattern of broken{' '}
                  <code className="rounded bg-green-100 px-1 dark:bg-green-900">/library</code> links
                  across 11 files
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Systematic Fix:</strong> Replaced all instances with{' '}
                  <code className="rounded bg-green-100 px-1 dark:bg-green-900">/prompts</code> in one commit
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Prevention:</strong> Added to PATTERN_AUDIT_DAY7.md for
                  future reference
                </p>
                <Badge variant="outline" className="border-green-600 text-green-700">
                  SYSTEMATIC APPROACH
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Documentation Culture</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Every decision documented, every pattern cataloged
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-purple-600">12</div>
              <div className="mt-2 text-sm text-muted-foreground">
                ADRs (Architectural Decision Records)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-blue-600">115+</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Documentation Pages
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-pink-600">653</div>
              <div className="mt-2 text-sm text-muted-foreground">
                AI Summary Headers
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-green-600">7</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Daily Plan Documents
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-2 border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.fileText className="h-5 w-5 text-purple-600" />
                Documentation Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    Planning
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                    <li>• DAY_5_PLAN.md</li>
                    <li>• DAY_6_CONTENT_HARDENING.md</li>
                    <li>• DAY_7_QA_FRONTEND_IMPROVEMENTS.md</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    Architecture
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                    <li>• ADR-001: AI Provider Interface</li>
                    <li>• ADR-009: Pattern-Based Bug Fixing</li>
                    <li>• ADR-008: OpsHub Simplification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    Quality
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                    <li>• RED_HAT_TRUST_AUDIT.md</li>
                    <li>• PATTERN_AUDIT_DAY7.md</li>
                    <li>• ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="space-y-6 py-12 text-center">
            <h2 className="text-3xl font-bold">
              Want to Build Like This?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              This workflow is how we built Engify.ai in 7 days. Every technique,
              every guardrail, every pattern is documented and available.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/built-in-public">
                  <Icons.code className="mr-2 h-5 w-5" />
                  See the Build Process
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/hireme">
                  <Icons.briefcase className="mr-2 h-5 w-5" />
                  Hire Me to Implement This
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}


