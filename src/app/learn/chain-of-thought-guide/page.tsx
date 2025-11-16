/**
 * Chain-of-Thought Prompting: Complete Guide with Examples
 * 
 * Cluster Article - Supporting Pillar Page
 * Target: "chain of thought prompting tutorial" (200+ searches/mo)
 * Links back to: /learn/prompt-engineering-masterclass
 * 
 * Content: 1,500-2,000 words deep-dive on Chain-of-Thought pattern
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Chain-of-Thought Prompting: Complete Guide with Examples | Engify.ai',
  description:
    'Master Chain-of-Thought prompting with this comprehensive guide. Learn how to break down complex problems, get step-by-step reasoning from AI models, and see real-world examples for code generation and problem-solving.',
  keywords: [
    'chain of thought prompting',
    'chain of thought tutorial',
    'CoT prompting',
    'step-by-step reasoning',
    'AI reasoning patterns',
    'prompt engineering techniques',
    'chain of thought examples',
    'prompt engineering for developers',
  ],
  openGraph: {
    title: 'Chain-of-Thought Prompting: Complete Guide with Examples',
    description:
      'Learn how to use Chain-of-Thought prompting to get step-by-step reasoning from AI models. Real examples and best practices.',
    type: 'article',
    siteName: 'Engify.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chain-of-Thought Prompting: Complete Guide',
    description:
      'Master Chain-of-Thought prompting with examples and best practices.',
    creator: '@engifyai',
  },
};

export default function ChainOfThoughtGuidePage() {
  return (
    <MainLayout>
      {/* Breadcrumbs */}
      <nav className="border-b bg-slate-50 dark:bg-slate-900">
        <div className="container flex items-center gap-2 py-3 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
          <Link
            href="/learn"
            className="text-muted-foreground hover:text-foreground"
          >
            Learn
          </Link>
          <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Chain-of-Thought Prompting</span>
        </div>
      </nav>

      <article className="container max-w-4xl py-12">
        {/* Header */}
        <header className="mb-12 space-y-6 border-b pb-8">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm font-medium">
              Pattern Deep Dive
            </Badge>
            <Badge variant="outline" className="text-sm">
              Intermediate
            </Badge>
            <Badge variant="outline" className="text-sm">
              ~2,000 words
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Chain-of-Thought Prompting: Complete Guide with Examples
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn how to use Chain-of-Thought (CoT) prompting to get
            step-by-step reasoning from AI models. This comprehensive guide covers
            the fundamentals, advanced techniques, and real-world examples for
            developers and engineers.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Part of the</span>
            <Link
              href="/learn/prompt-engineering-masterclass"
              className="text-primary hover:underline font-medium"
            >
              Prompt Engineering Masterclass
            </Link>
            <span>•</span>
            <span>15 min read</span>
          </div>
        </header>

        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead">
              Chain-of-Thought (CoT) prompting is one of the most powerful
              techniques in prompt engineering. By asking AI models to show their
              work—reasoning through problems step-by-step—you get more accurate,
              transparent, and reliable results.
            </p>
            <p>
              This guide will teach you everything you need to know about
              Chain-of-Thought prompting: what it is, why it works, when to use
              it, and how to implement it effectively in your own prompts.
            </p>
          </div>
        </section>

        {/* What is Chain-of-Thought */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            What is Chain-of-Thought Prompting?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Chain-of-Thought prompting asks the AI to reason through a problem
              step-by-step, showing its intermediate reasoning steps before
              arriving at a final answer. Instead of jumping directly to a
              conclusion, the model "thinks out loud" through the problem-solving
              process.
            </p>
            <p>
              The technique was popularized by research showing that explicitly
              asking models to show their reasoning significantly improves
              performance on complex reasoning tasks—especially mathematical
              problems, logical puzzles, and multi-step processes.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Why Chain-of-Thought Works
            </h3>
            <p>
              Modern language models are trained on vast amounts of text that
              includes examples of human reasoning. When you explicitly ask for
              step-by-step reasoning, you're activating these learned patterns:
            </p>
            <ul>
              <li>
                <strong>Pattern Matching:</strong> The model recognizes the
                format of "step-by-step reasoning" from its training data
              </li>
              <li>
                <strong>Error Reduction:</strong> Breaking problems into steps
                allows the model to catch errors at each stage
              </li>
              <li>
                <strong>Transparency:</strong> You can see where the model might
                go wrong and refine your prompt accordingly
              </li>
              <li>
                <strong>Confidence:</strong> Models show higher confidence when
                reasoning through problems methodically
              </li>
            </ul>
          </div>
        </section>

        {/* Before and After Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Before and After: Seeing the Difference
          </h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Let's see how Chain-of-Thought transforms prompt results:
          </p>

          <div className="space-y-6 mb-8">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  ❌ Without Chain-of-Thought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded">
                  <code>{`Design a REST API endpoint for user authentication`}</code>
                </pre>
                <p className="mt-4 text-sm text-muted-foreground">
                  Result: Generic, incomplete code without error handling or
                  security considerations
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  ✅ With Chain-of-Thought
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                  <code>{`Design a REST API endpoint for user authentication.

Think through this step by step:

1. First, consider the authentication flow:
   - What credentials do we need? (email/password, OAuth, etc.)
   - What security measures are required? (encryption, rate limiting, etc.)
   - What response format should we use?

2. Then, design the request/response structure:
   - HTTP method and path
   - Request body schema
   - Success and error response formats

3. Finally, implement security best practices:
   - Password hashing
   - JWT token generation
   - Input validation
   - Error handling

Now write the complete implementation.`}</code>
                </pre>
                <p className="mt-4 text-sm text-muted-foreground">
                  Result: Comprehensive, production-ready code with proper
                  security and error handling
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* When to Use Chain-of-Thought */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            When to Use Chain-of-Thought Prompting
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Chain-of-Thought is most effective for:
            </p>
            <ul>
              <li>
                <strong>Complex Problem Solving:</strong> Multi-step problems
                that require logical reasoning
              </li>
              <li>
                <strong>Code Generation:</strong> Writing complex functions or
                systems that need careful planning
              </li>
              <li>
                <strong>Architecture Decisions:</strong> Designing systems with
                multiple trade-offs to consider
              </li>
              <li>
                <strong>Debugging:</strong> Tracing through problems to find root
                causes
              </li>
              <li>
                <strong>Algorithm Design:</strong> Creating algorithms that need
                step-by-step logic
              </li>
            </ul>
            <p>
              It's less effective for simple, single-step tasks where the
              overhead isn't worth it. For those, use simpler patterns like
              Zero-Shot or Template.
            </p>
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Real-World Examples for Developers
          </h2>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Example 1: Code Review</CardTitle>
                <CardDescription>
                  Using Chain-of-Thought to get detailed code reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Review this code step by step:

[Code snippet here]

For each step, consider:
1. Code quality and style
2. Potential bugs or edge cases
3. Performance implications
4. Security concerns
5. Best practices

Provide your analysis step by step, then summarize recommendations.`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 2: Database Query Optimization</CardTitle>
                <CardDescription>
                  Optimizing queries with step-by-step reasoning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Optimize this database query step by step:

SELECT * FROM users WHERE email = ? AND status = 'active'

Think through:
1. What indexes exist or should exist?
2. What's the query execution plan?
3. Are there any bottlenecks?
4. Can we reduce the result set?
5. What's the optimal indexing strategy?

Provide your optimization step by step.`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 3: System Architecture</CardTitle>
                <CardDescription>
                  Designing systems with Chain-of-Thought reasoning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Design a microservices architecture for an e-commerce platform.

Reason through this step by step:

1. Identify core domains and bounded contexts
2. Determine service boundaries
3. Design inter-service communication
4. Plan data consistency strategies
5. Consider scalability and fault tolerance
6. Design deployment and monitoring

For each step, explain your reasoning and trade-offs.`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Advanced Techniques */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Advanced Chain-of-Thought Techniques
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Combining with Other Patterns
            </h3>
            <p>
              Chain-of-Thought works exceptionally well when combined with other
              patterns:
            </p>
            <ul>
              <li>
                <strong>Persona + Chain-of-Thought:</strong> Have an expert
                reason through problems. "As a senior architect, think through
                this step by step..."
              </li>
              <li>
                <strong>Few-Shot + Chain-of-Thought:</strong> Provide examples
                of step-by-step reasoning to guide the model's format
              </li>
              <li>
                <strong>Chain-of-Thought + Self-Consistency:</strong> Generate
                multiple reasoning paths and compare them
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Explicit Step Numbering
            </h3>
            <p>
              For complex problems, explicitly number the steps you want the
              model to follow:
            </p>
            <pre className="bg-muted p-4 rounded text-sm">
              <code>{`Solve this problem:

Step 1: [What to do first]
Step 2: [What to do next]
Step 3: [Final step]

Think through each step before proceeding.`}</code>
            </pre>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Iterative Refinement
            </h3>
            <p>
              Use Chain-of-Thought in multiple rounds—first to generate a
              solution, then to refine it:
            </p>
            <ul>
              <li>
                Round 1: Generate initial solution with reasoning
              </li>
              <li>
                Round 2: Review the reasoning and identify improvements
              </li>
              <li>
                Round 3: Implement the refined solution
              </li>
            </ul>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Best Practices and Common Mistakes
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mt-8 mb-4">
              ✅ Best Practices
            </h3>
            <ul>
              <li>
                <strong>Be Specific:</strong> Tell the model exactly what steps
                to follow
              </li>
              <li>
                <strong>Provide Context:</strong> Give background information
                needed for each step
              </li>
              <li>
                <strong>Use Examples:</strong> Show the model what good
                step-by-step reasoning looks like
              </li>
              <li>
                <strong>Verify Steps:</strong> Ask the model to verify each step
                before proceeding
              </li>
              <li>
                <strong>Set Expectations:</strong> Specify the format you want
                for the reasoning
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              ❌ Common Mistakes
            </h3>
            <ul>
              <li>
                <strong>Too Vague:</strong> "Think about this" doesn't give
                enough guidance
              </li>
              <li>
                <strong>Overcomplicating:</strong> Using Chain-of-Thought for
                simple tasks adds unnecessary overhead
              </li>
              <li>
                <strong>Ignoring Results:</strong> Not reviewing the reasoning
                steps for errors
              </li>
              <li>
                <strong>Missing Context:</strong> Not providing enough
                background information
              </li>
            </ul>
          </div>
        </section>

        {/* CTA to Masterclass */}
        <section className="mb-12 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8">
          <h2 className="mb-4 text-2xl font-bold">
            Want to Master More Prompt Patterns?
          </h2>
          <p className="mb-6 text-muted-foreground">
            This guide is part of our comprehensive{' '}
            <Link
              href="/learn/prompt-engineering-masterclass"
              className="text-primary hover:underline font-medium"
            >
              Prompt Engineering Masterclass
            </Link>
            . Learn 14 more proven patterns, advanced techniques, and how to
            integrate prompt engineering into your entire software development
            lifecycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/learn/prompt-engineering-masterclass">
                View Full Masterclass
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/patterns/chain-of-thought">
                Explore Chain-of-Thought Pattern
              </Link>
            </Button>
          </div>
        </section>

        {/* Related Resources */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Related Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href="/patterns/chain-of-thought"
                    className="hover:text-primary"
                  >
                    Chain-of-Thought Pattern Details
                  </Link>
                </CardTitle>
                <CardDescription>
                  Deep dive into the Chain-of-Thought pattern with examples and
                  use cases
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href="/learn/prompt-engineering-masterclass"
                    className="hover:text-primary"
                  >
                    Prompt Engineering Masterclass
                  </Link>
                </CardTitle>
                <CardDescription>
                  Complete guide to all 15 prompt engineering patterns
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/patterns" className="hover:text-primary">
                    Browse All Patterns
                  </Link>
                </CardTitle>
                <CardDescription>
                  Explore all 15 proven prompt engineering patterns
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/prompts" className="hover:text-primary">
                    Prompt Library
                  </Link>
                </CardTitle>
                <CardDescription>
                  Browse 100+ expert prompts using Chain-of-Thought and other
                  patterns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </article>
    </MainLayout>
  );
}

