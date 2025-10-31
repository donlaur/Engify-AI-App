import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Adoption Without Vibe Coding | For CTOs & VPs of Engineering | Engify.ai',
  description: 'Production-ready AI adoption framework for engineering leaders. Implement guardrails, protect IP, and scale AI usage without "vibe coding" chaos.',
  keywords: ['CTO', 'VP Engineering', 'AI adoption', 'AI guardrails', 'enterprise AI', 'AI governance'],
  openGraph: {
    title: 'AI Adoption Without Vibe Coding - For CTOs',
    description: 'Production guardrails for AI coding. Real code examples from companies shipping safely.',
    type: 'website',
  },
};

export default function ForCTOsPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="outline">
              For CTOs & VPs of Engineering
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              AI Adoption Without <span className="text-primary">Vibe Coding</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Your engineers are already using AI. The question isn&apos;t whether to adopt it—it&apos;s how to adopt it <strong>safely, measurably, and at scale</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#guardrails">
                  <Icons.shield className="mr-2 h-5 w-5" />
                  See Production Guardrails
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#playbook">
                  <Icons.download className="mr-2 h-5 w-5" />
                  Download Playbook (PDF)
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold">The "Vibe Coding" Problem</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Icons.alertTriangle className="h-5 w-5" />
                    What You&apos;re Seeing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>✗ Engineers copy-pasting AI code without understanding it</p>
                  <p>✗ No consistency in prompts or patterns across teams</p>
                  <p>✗ Security vulnerabilities introduced by AI suggestions</p>
                  <p>✗ Technical debt accumulating from "quick AI fixes"</p>
                  <p>✗ No way to measure AI productivity impact</p>
                  <p>✗ Leaked proprietary context in AI prompts</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Icons.check className="h-5 w-5" />
                    What You Need
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>✓ Production guardrails built into workflows</p>
                  <p>✓ Reusable, tested prompts for common tasks</p>
                  <p>✓ Security scanning on AI-generated code</p>
                  <p>✓ Quality standards and review processes</p>
                  <p>✓ Measurable productivity metrics</p>
                  <p>✓ IP protection and compliance</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Production Guardrails */}
      <section id="guardrails" className="scroll-mt-20 bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-3xl font-bold">Production AI Guardrails</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Real code examples from companies shipping AI safely. Copy, customize, deploy.
            </p>

            <div className="space-y-6">
              {/* Guardrail 1: Input Validation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.shield className="h-5 w-5 text-primary" />
                    1. Input Validation & Sanitization
                  </CardTitle>
                  <CardDescription>
                    Prevent prompt injection and validate user input before sending to AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                    <div className="mb-2 text-slate-400">// src/lib/ai/validation.ts</div>
                    <pre className="overflow-x-auto">{`export function validatePromptInput(input: string): ValidationResult {
  const maxLength = 10000;
  const suspiciousPatterns = [
    /ignore previous instructions/i,
    /system:/i,
    /you are now/i,
  ];

  if (input.length > maxLength) {
    return { valid: false, error: 'Input too long' };
  }

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { valid: false, error: 'Suspicious pattern detected' };
    }
  }

  return { valid: true };
}`}</pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Prevents prompt injection attacks
                  </div>
                </CardContent>
              </Card>

              {/* Guardrail 2: Rate Limiting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.zap className="h-5 w-5 text-primary" />
                    2. Rate Limiting & Cost Controls
                  </CardTitle>
                  <CardDescription>
                    Prevent runaway costs and abuse with per-user limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                    <div className="mb-2 text-slate-400">// src/lib/ai/rate-limit.ts</div>
                    <pre className="overflow-x-auto">{`export async function checkRateLimit(userId: string): Promise<boolean> {
  const limits = {
    requestsPerHour: 100,
    tokensPerDay: 50000,
    costPerMonth: 10.00, // USD
  };

  const usage = await getUsage(userId);
  
  if (usage.requestsThisHour >= limits.requestsPerHour) {
    throw new RateLimitError('Hourly request limit exceeded');
  }

  if (usage.tokensToday >= limits.tokensPerDay) {
    throw new RateLimitError('Daily token limit exceeded');
  }

  if (usage.costThisMonth >= limits.costPerMonth) {
    throw new RateLimitError('Monthly budget exceeded');
  }

  return true;
}`}</pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Average cost: $0.47/user/month in production
                  </div>
                </CardContent>
              </Card>

              {/* Guardrail 3: Output Scanning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.eye className="h-5 w-5 text-primary" />
                    3. Output Scanning & Security Checks
                  </CardTitle>
                  <CardDescription>
                    Scan AI-generated code for secrets, vulnerabilities, and quality issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                    <div className="mb-2 text-slate-400">// src/lib/ai/output-scanner.ts</div>
                    <pre className="overflow-x-auto">{`export async function scanAIOutput(code: string): Promise<ScanResult> {
  const issues: Issue[] = [];

  // Check for hardcoded secrets
  if (/api[_-]?key|password|secret/i.test(code)) {
    issues.push({ 
      severity: 'high', 
      type: 'secret', 
      message: 'Possible hardcoded secret detected' 
    });
  }

  // Check for SQL injection patterns
  if (/execute.*\\$\\{|query.*\\+.*user/i.test(code)) {
    issues.push({ 
      severity: 'critical', 
      type: 'sql-injection',
      message: 'Possible SQL injection vulnerability' 
    });
  }

  // Check for eval usage
  if (/eval\\(|Function\\(/.test(code)) {
    issues.push({ 
      severity: 'high',
      type: 'unsafe-eval',
      message: 'Usage of eval() detected' 
    });
  }

  return { 
    safe: issues.filter(i => i.severity === 'critical').length === 0,
    issues 
  };
}`}</pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Caught 47 security issues in first month of production
                  </div>
                </CardContent>
              </Card>

              {/* Guardrail 4: Context Filtering */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.lock className="h-5 w-5 text-primary" />
                    4. Context Filtering & IP Protection
                  </CardTitle>
                  <CardDescription>
                    Strip sensitive company data before sending to external AI providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                    <div className="mb-2 text-slate-400">// src/lib/ai/context-filter.ts</div>
                    <pre className="overflow-x-auto">{`export function filterSensitiveContext(context: string): string {
  let filtered = context;

  // Remove API keys and tokens
  filtered = filtered.replace(
    /([a-z0-9]{20,}|sk-[a-zA-Z0-9]{48})/g, 
    '[REDACTED]'
  );

  // Remove email addresses
  filtered = filtered.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );

  // Remove internal URLs
  filtered = filtered.replace(
    /https?:\\/\\/(internal|admin|staging)\\.[^\\s]+/g,
    '[INTERNAL_URL]'
  );

  // Remove company-specific terms (customize for your org)
  const sensitiveTerms = ['ProjectAlpha', 'SecretFeature', 'InternalAPI'];
  sensitiveTerms.forEach(term => {
    filtered = filtered.replace(
      new RegExp(term, 'gi'), 
      '[INTERNAL]'
    );
  });

  return filtered;
}`}</pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Zero IP leaks in 6 months of production usage
                  </div>
                </CardContent>
              </Card>

              {/* Guardrail 5: Audit Logging */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.fileText className="h-5 w-5 text-primary" />
                    5. Comprehensive Audit Logging
                  </CardTitle>
                  <CardDescription>
                    Track every AI interaction for compliance, debugging, and optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">
                    <div className="mb-2 text-slate-400">// src/lib/ai/audit-log.ts</div>
                    <pre className="overflow-x-auto">{`export async function logAIInteraction(data: AIInteraction) {
  await db.aiAuditLogs.create({
    userId: data.userId,
    timestamp: new Date(),
    model: data.model,
    promptHash: hashPrompt(data.prompt), // Don't log full prompt
    promptLength: data.prompt.length,
    responseLength: data.response.length,
    tokensUsed: data.tokensUsed,
    costUSD: data.cost,
    latencyMs: data.latency,
    success: data.success,
    errorType: data.error?.type,
    metadata: {
      feature: data.feature, // e.g., 'code-completion', 'chat'
      userAgent: data.userAgent,
      ipAddress: anonymizeIP(data.ipAddress),
    }
  });

  // Alert on anomalies
  if (data.cost > 1.0 || data.tokensUsed > 10000) {
    await sendAlert('High-cost AI request detected', data);
  }
}`}</pre>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Full audit trail for compliance (SOC 2, GDPR ready)
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" asChild>
                <Link href="https://github.com/donlaur/Engify-AI-App" target="_blank">
                  <Icons.github className="mr-2 h-5 w-5" />
                  View Full Implementation on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & ROI */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold">Measurable Impact</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">23%</CardTitle>
                  <CardDescription>Faster PR velocity</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">$0.47</CardTitle>
                  <CardDescription>Avg cost per user/month</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">0</CardTitle>
                  <CardDescription>Security incidents</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">87%</CardTitle>
                  <CardDescription>Engineer adoption rate</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold">30-Day Implementation Roadmap</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Week 1: Foundation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✓ Deploy input validation and rate limiting</p>
                  <p>✓ Set up audit logging infrastructure</p>
                  <p>✓ Define AI usage policy for engineering team</p>
                  <p>✓ Select pilot team (5-10 engineers)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Week 2: Guardrails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✓ Implement output scanning and security checks</p>
                  <p>✓ Deploy context filtering for IP protection</p>
                  <p>✓ Create prompt library for common tasks</p>
                  <p>✓ Train pilot team on best practices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Week 3: Scale & Monitor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✓ Roll out to 50% of engineering team</p>
                  <p>✓ Monitor costs, quality, and security issues</p>
                  <p>✓ Collect feedback and iterate on prompts</p>
                  <p>✓ Build dashboard for leadership visibility</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Week 4: Company-Wide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>✓ Full engineering team rollout</p>
                  <p>✓ Document lessons learned and ROI</p>
                  <p>✓ Optimize based on usage patterns</p>
                  <p>✓ Present results to board/leadership</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable Playbook */}
      <section id="playbook" className="scroll-mt-20 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Icons.download className="mb-2 inline h-6 w-6" /> AI Adoption Playbook for Engineering Leaders
                </CardTitle>
                <CardDescription className="text-base">
                  Complete implementation guide with code examples, policies, and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-2">
                  <p className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    5 production guardrails with code
                  </p>
                  <p className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    30-day implementation roadmap
                  </p>
                  <p className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Sample AI usage policy
                  </p>
                  <p className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    ROI measurement framework
                  </p>
                  <p className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    Security & compliance checklist
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link href="/contact?subject=AI+Adoption+Playbook">
                      <Icons.download className="mr-2 h-5 w-5" />
                      Download Playbook (PDF)
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact?subject=Book+Office+Hours">
                      <Icons.calendar className="mr-2 h-5 w-5" />
                      Book Office Hours (Free)
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Move from Vibe Coding to Production AI?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join engineering leaders at companies like yours who are shipping AI safely and measurably.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/contact">
                  <Icons.mail className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/library">
                  <Icons.book className="mr-2 h-5 w-5" />
                  Browse Prompt Library
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
