'use client';

export const dynamic = 'force-dynamic';

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

export default function KERNELPage() {
  const principles = [
    {
      letter: 'K',
      title: 'Keep it Simple',
      description: 'Each prompt should have one clear, singular goal.',
      icon: Icons.target,
      color: 'from-blue-600 to-cyan-600',
      bad: 'Analyze this code for bugs, suggest performance improvements, refactor it to use modern ES6 syntax, and write unit tests.',
      good: 'Analyze this code and identify any bugs or logical errors. For each bug found, explain the issue and its potential impact.',
      why: 'Multiple objectives create ambiguity. The AI must guess priorities, leading to inconsistent results.',
    },
    {
      letter: 'E',
      title: 'Easy to Verify',
      description:
        'Include clear, objective success criteria. Avoid subjective goals.',
      icon: Icons.check,
      color: 'from-green-600 to-emerald-600',
      bad: 'Make this API documentation more engaging and user-friendly.',
      good: 'Rewrite this API documentation to include: 1) A one-sentence summary, 2) Three code examples (cURL, JavaScript, Python), 3) A table of all error codes.',
      why: "If you can't verify the output is correct, you can't trust it in production.",
    },
    {
      letter: 'R',
      title: 'Reproducible',
      description:
        'Avoid temporal or vague references. Ensure consistent results over time.',
      icon: Icons.refresh,
      color: 'from-purple-600 to-pink-600',
      bad: 'Summarize the latest trends in cybersecurity.',
      good: 'Based on the OWASP Top 10 vulnerabilities published in 2023, summarize the three most critical threats to web applications.',
      why: 'Production systems need predictability. A prompt that works today but fails tomorrow is unreliable.',
    },
    {
      letter: 'N',
      title: 'Narrow Scope',
      description:
        'Break complex tasks into multiple, focused prompts. Each prompt does one thing well.',
      icon: Icons.focus,
      color: 'from-orange-600 to-red-600',
      bad: 'Design a complete CI/CD pipeline including build, test, security, deployment, monitoring, and rollback for GitHub Actions, GitLab CI, and Jenkins.',
      good: 'Prompt 1: Design the build and test stages for a Node.js microservice CI/CD pipeline.\n\nPrompt 2: Design the security scanning stage.\n\nPrompt 3: Design the deployment strategy for blue-green deployment.',
      why: 'Narrow prompts are easier to test, debug, and maintain. They reduce token usage and improve accuracy.',
    },
    {
      letter: 'E',
      title: 'Explicit Constraints',
      description:
        'Clearly state what the AI should NOT do. Define boundaries and limitations.',
      icon: Icons.shield,
      color: 'from-red-600 to-pink-600',
      bad: 'Write a Python script to scrape product data from a website.',
      good: 'Write a Python script to scrape product data.\n\nConstraints:\n- Use only requests and BeautifulSoup\n- Include 2-second delay between requests\n- Do not bypass authentication\n- Handle HTTP errors with try/except',
      why: 'Constraints prevent the AI from making assumptions or taking unwanted shortcuts. They ensure safe, compliant output.',
    },
    {
      letter: 'L',
      title: 'Logical Structure',
      description:
        'Organize the prompt with a consistent, logical format using clear sections.',
      icon: Icons.layers,
      color: 'from-indigo-600 to-blue-600',
      bad: 'I have a CSV file with sales data and I need to analyze it to find the top 5 products by revenue but only for Q4 2024...',
      good: '### Context\nI have a CSV file with sales data.\n\n### Data Structure\nColumns: product_id, product_name, sale_date, quantity, price\n\n### Task\nFind top 5 products by revenue for Q4 2024.\n\n### Output Format\nDataFrame with: product_name, total_revenue',
      why: 'Structure improves AI comprehension by 31%. It prevents the model from conflating context, instructions, and data.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.sparkles className="mr-2 h-3 w-3" />
              Quality Framework
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              The KERNEL Framework
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Six principles that transform prompts from creative experiments
              into reliable engineering assets.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">94%</div>
                    <div className="text-xs text-gray-300">Success Rate</div>
                  </div>
                  <div className="h-12 w-px bg-white/20" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">58%</div>
                    <div className="text-xs text-gray-300">Token Reduction</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* The 6 Principles */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">The Six Principles</h2>
          <p className="text-xl text-gray-600">
            Each letter represents a core principle for enterprise-grade prompts
          </p>
        </div>

        <div className="space-y-8">
          {principles.map((principle, index) => (
            <Card
              key={index}
              className="overflow-hidden border-2 transition-all hover:border-primary/50"
            >
              <CardHeader
                className={`bg-gradient-to-r ${principle.color} text-white`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <span className="text-3xl font-bold">
                      {principle.letter}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">
                      {principle.title}
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      {principle.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Why It Matters */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">
                    Why It Matters
                  </h4>
                  <p className="text-gray-600">{principle.why}</p>
                </div>

                {/* Examples */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icons.x className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-900">
                        Bad Example
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{principle.bad}</p>
                  </div>

                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icons.check className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-900">
                        Good Example
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-gray-700">
                      {principle.good}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Template */}
      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-4xl font-bold">
              The KERNEL Template
            </h2>
            <Card className="border-2">
              <CardContent className="space-y-4 p-8">
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-6 text-sm text-gray-100">
                  {`### Context
[Provide relevant background information]

### Task
[State the single, clear objective]

### Constraints
- [What the AI should NOT do]
- [Required libraries, formats, or standards]
- [Any limitations or boundaries]

### Input
[Describe the input data or information]

### Output Format
[Specify exactly what the output should look like]`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-4xl font-bold">The Impact</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-5xl font-bold text-primary">94%</div>
                <p className="text-sm text-gray-600">
                  First-try success rate (vs 72% for ad-hoc prompts)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-5xl font-bold text-primary">58%</div>
                <p className="text-sm text-gray-600">
                  Reduction in token usage
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-5xl font-bold text-primary">31%</div>
                <p className="text-sm text-gray-600">
                  Improvement in AI comprehension with logical structure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.sparkles className="mx-auto h-16 w-16 text-primary" />
            <h2 className="text-4xl font-bold">Ready to Apply KERNEL?</h2>
            <p className="text-xl text-gray-600">
              Browse our library of 100+ prompts built with the KERNEL framework
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                asChild
              >
                <Link href="/prompts">
                  Browse Prompts
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/patterns">View All Patterns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
