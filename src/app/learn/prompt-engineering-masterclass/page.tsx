/**
 * Prompt Engineering Masterclass - Pillar Page
 *
 * Target: "prompt engineering training" (1,500+ searches/mo)
 * Audience: Practitioners (Senior Engineers, Tech Leads)
 * Content: 8,000-10,000 words comprehensive guide
 *
 * SEO Strategy:
 * - Establish authority on prompt engineering
 * - Link to all pattern pages
 * - Include Course and FAQ schema
 * - Target long-tail keywords
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { generateCourseSchema } from '@/lib/seo/metadata';
import { APP_URL } from '@/lib/constants';
import { getServerStats } from '@/lib/server-stats';
import { FAQSection } from '@/components/features/FAQSection';
import { CrossContentLinks } from '@/components/features/CrossContentLinks';
import { PILLAR_FAQS } from '@/lib/data/pillar-faqs';
import { loadPatternsFromJson } from '@/lib/patterns/load-patterns-from-json';

// Generate metadata dynamically (must be exported, not in component)
export async function generateMetadata(): Promise<Metadata> {
  // This can't be async in metadata export, so we'll use a default
  // The actual page will fetch stats server-side
  return {
    title:
      'Prompt Engineering Masterclass: Complete Guide for Developers | Engify.ai',
    description:
      'Master prompt engineering with this comprehensive guide. Learn proven patterns, advanced techniques, and practical examples. From beginner to expert - the definitive resource for engineering teams.',
    keywords: [
      'prompt engineering training',
      'prompt engineering course',
      'prompt engineering tutorial',
      'AI prompt engineering',
      'prompt patterns',
      'chain of thought prompting',
      'few-shot learning',
      'prompt engineering for developers',
      'advanced prompt engineering',
      'prompt engineering techniques',
    ],
    openGraph: {
      title: 'Prompt Engineering Masterclass: Complete Guide for Developers',
      description:
        'The definitive guide to prompt engineering. Master proven patterns, advanced techniques, and practical examples for engineering teams.',
      type: 'article',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Prompt Engineering Masterclass: Complete Guide',
      description:
        'Master prompt engineering with proven patterns and advanced techniques.',
      creator: '@engifyai',
    },
  };
}
// Pattern names to link to (will be matched to actual patterns from DB)
const PATTERN_NAMES = [
  'Chain of Thought',
  'Few-Shot Learning',
  'Zero-Shot',
  'Persona Pattern',
  'Self-Consistency',
  'Tree of Thoughts',
  'Chain of Verification',
  'ReAct (Reasoning + Acting)',
  'Automatic Few-Shot',
  'Meta-Prompting',
  'Socratic Method',
  'Constitutional AI',
  'Retrieval-Augmented Generation (RAG)',
  'Reflection Pattern',
  'KERNEL Framework',
];

// FAQ data is now imported from pillar-faqs.ts

export default async function PromptEngineeringMasterclassPage() {
  // Fetch stats (skip MongoDB at build time to avoid timeouts)
  const stats = await getServerStats(true); // skipMongoDB = true
  const patternCount = stats.patterns?.total || stats.stats?.patterns || 18;
  const promptCount = stats.prompts?.total || stats.stats?.prompts || 300;

  // Load patterns from static JSON (fast, no MongoDB at build time)
  const allPatterns = await loadPatternsFromJson();
  const patternLinks = PATTERN_NAMES.map((name) => {
    const pattern = allPatterns.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (pattern) {
      return {
        id: pattern.id,
        name: pattern.name,
        category: pattern.category || 'Other',
      };
    }
    return null;
  }).filter((p): p is { id: string; name: string; category: string } => p !== null);

  // Generate Course schema
  const courseSchema = generateCourseSchema(
    {
      key: 'prompt-engineering-masterclass',
      title: 'Prompt Engineering Masterclass',
      description: `The definitive guide to prompt engineering for developers. Master ${patternCount} proven patterns, advanced techniques, and practical examples.`,
      benefits: [
        `Master ${patternCount} proven prompt patterns`,
        'Learn advanced techniques',
        'Understand practical applications',
        'Apply to real-world scenarios',
      ],
    },
    `${APP_URL}/learn/prompt-engineering-masterclass`
  );

  return (
    <>
      {/* Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
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
            <span className="font-medium">Prompt Engineering Masterclass</span>
          </div>
        </nav>

        <article className="container max-w-4xl py-12">
          {/* Header */}
          <header className="mb-12 space-y-6 border-b pb-8">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm font-medium">
                Masterclass
              </Badge>
              <Badge variant="outline" className="text-sm">
                Advanced
              </Badge>
              <Badge variant="outline" className="text-sm">
                8,000+ words
              </Badge>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Prompt Engineering Masterclass: The Complete Guide for Developers
            </h1>
            <p className="text-xl text-muted-foreground">
              Master the art and science of prompt engineering. This
              comprehensive guide covers everything from foundational concepts
              to advanced techniques, helping you become an expert in crafting
              effective prompts for AI models.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By Engify.ai Team</span>
              <span>•</span>
              <span>Updated November 2025</span>
              <span>•</span>
              <span>45 min read</span>
            </div>
          </header>

          {/* Table of Contents */}
          <nav className="mb-12 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Table of Contents</h2>
            <ul className="space-y-2 text-base">
              <li>
                <a
                  href="#introduction"
                  className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
                >
                  1. Introduction: What is Prompt Engineering?
                </a>
              </li>
              <li>
                <a href="#foundations" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  2. Foundational Concepts
                </a>
              </li>
              <li>
                <a href="#patterns" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  3. Proven Patterns
                </a>
              </li>
              <li>
                <a href="#advanced" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  4. Advanced Techniques
                </a>
              </li>
              <li>
                <a href="#examples" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  5. Practical Examples and Use Cases
                </a>
              </li>
              <li>
                <a href="#sdlc" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  6. Integration with Software Development Lifecycle
                </a>
              </li>
              <li>
                <a
                  href="#best-practices"
                  className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
                >
                  7. Best Practices and Common Mistakes
                </a>
              </li>
              <li>
                <a href="#faq" className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                  8. Frequently Asked Questions
                </a>
              </li>
            </ul>
          </nav>

          {/* Introduction */}
          <section id="introduction" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">
              1. Introduction: What is Prompt Engineering?
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead">
                Prompt engineering is the discipline of crafting effective
                inputs (prompts) to guide AI models toward desired outputs.
                It&apos;s part art, part science, and entirely essential for
                anyone working with modern AI systems.
              </p>
              <p>
                Think of prompt engineering as the difference between asking a
                colleague &quot;write some code&quot; versus &quot;write a
                TypeScript function that validates email addresses using regex,
                handles edge cases, and returns a boolean.&quot; The specificity
                and structure of your request dramatically impacts the quality
                of the response.
              </p>
              <p>
                In the context of software development, prompt engineering
                enables developers to:
              </p>
              <ul>
                <li>
                  Generate more accurate and production-ready code from AI
                  assistants
                </li>
                <li>
                  Reduce iteration cycles and debugging time significantly
                </li>
                <li>
                  Leverage AI for complex reasoning tasks like architecture
                  decisions
                </li>
                <li>
                  Create consistent, maintainable prompts for team-wide use
                </li>
                <li>
                  Integrate AI into every phase of the software development
                  lifecycle
                </li>
              </ul>
              <p>
                This masterclass will take you from understanding the
                fundamentals to mastering advanced techniques used by top
                engineering teams worldwide.
              </p>
            </div>
          </section>

          {/* Foundational Concepts */}
          <section id="foundations" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">
              2. Foundational Concepts
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                How AI Models Process Prompts
              </h3>
              <p>
                Understanding how AI models interpret prompts is crucial for
                effective prompt engineering. Modern language models like GPT-4,
                Claude, and Gemini are transformer-based neural networks trained
                on vast amounts of text data.
              </p>
              <p>When you submit a prompt, the model:</p>
              <ol>
                <li>
                  <strong>Tokenizes</strong> your input into smaller pieces
                  (tokens)
                </li>
                <li>
                  <strong>Embeds</strong> tokens into numerical representations
                </li>
                <li>
                  <strong>Processes</strong> through multiple transformer layers
                </li>
                <li>
                  <strong>Generates</strong> output tokens based on learned
                  patterns
                </li>
              </ol>
              <p>
                The model doesn&apos;t &quot;understand&quot; your prompt in the
                human sense—it predicts the most likely continuation based on
                patterns seen during training. This is why structure, clarity,
                and examples matter so much.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Core Principles of Effective Prompts
              </h3>
              <p>Every effective prompt follows these core principles:</p>
              <ul>
                <li>
                  <strong>Clarity:</strong> Be specific about what you want.
                  Ambiguity leads to unpredictable results.
                </li>
                <li>
                  <strong>Context:</strong> Provide relevant background
                  information. The model needs context to make informed
                  decisions.
                </li>
                <li>
                  <strong>Constraints:</strong> Specify boundaries, formats, and
                  limitations. This prevents the model from going off-track.
                </li>
                <li>
                  <strong>Examples:</strong> Show, don&apos;t just tell.
                  Examples help the model understand your exact requirements.
                </li>
                <li>
                  <strong>Iteration:</strong> Refine prompts based on results.
                  The first prompt is rarely the best one.
                </li>
              </ul>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Token Efficiency and Cost Optimization
              </h3>
              <p>
                Every token counts—both in terms of cost and processing time. A
                well-engineered prompt achieves maximum results with minimum
                tokens. The KERNEL framework, which we&apos;ll cover later,
                achieves 58% token reduction while maintaining 94% success
                rates.
              </p>
              <p>Key strategies for token efficiency:</p>
              <ul>
                <li>Remove redundant instructions</li>
                <li>Use abbreviations for repeated concepts</li>
                <li>Structure prompts hierarchically</li>
                <li>Leverage few-shot examples strategically</li>
              </ul>
            </div>
          </section>

          {/* Proven Patterns */}
          <section id="patterns" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">3. Proven Patterns</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              These {patternCount} patterns are battle-tested techniques used by
              top engineering teams. Each pattern solves specific problems and
              can be combined for even more powerful results.
            </p>

            <div className="mb-12 grid gap-6 md:grid-cols-2">
              {patternLinks.map((pattern) => (
                <Card
                  key={pattern.id}
                  className="transition-colors hover:border-primary"
                >
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/patterns/${encodeURIComponent(pattern.id)}`}
                          className="hover:text-primary"
                        >
                          {pattern.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {pattern.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      Learn how to apply the {pattern.name.toLowerCase()}{' '}
                      pattern in your prompts. Click to see detailed examples
                      and use cases.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patterns/${encodeURIComponent(pattern.id)}`}>
                        Learn More
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Pattern Categories
              </h3>
              <p>Patterns are organized into four categories:</p>
              <ul>
                <li>
                  <strong>Foundational:</strong> Basic patterns every developer
                  should know (Persona, Few-Shot, Zero-Shot)
                </li>
                <li>
                  <strong>Cognitive:</strong> Patterns that enhance reasoning
                  (Chain of Thought, Tree of Thoughts, Socratic Method)
                </li>
                <li>
                  <strong>Structural:</strong> Patterns for organizing prompts
                  (Template, Visual Separators, Recipe)
                </li>
                <li>
                  <strong>Iterative:</strong> Patterns that improve through
                  repetition (Self-Consistency, Reflection, ReAct)
                </li>
              </ul>
              <p>
                Explore each pattern in detail by clicking the cards above. Each
                pattern page includes examples, use cases, and best practices
                specific to that technique.
              </p>
            </div>
          </section>

          {/* Advanced Techniques */}
          <section id="advanced" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">4. Advanced Techniques</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Combining Multiple Patterns
              </h3>
              <p>
                The real power of prompt engineering comes from combining
                patterns. For example, you can combine:
              </p>
              <ul>
                <li>
                  <strong>Persona + Chain of Thought:</strong> Have an expert
                  reason through a problem step-by-step
                </li>
                <li>
                  <strong>Few-Shot + Template:</strong> Provide examples in a
                  structured format
                </li>
                <li>
                  <strong>RAG + Reflection:</strong> Use external knowledge and
                  refine responses iteratively
                </li>
              </ul>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Model-Specific Optimizations
              </h3>
              <p>Different AI models have different strengths:</p>
              <ul>
                <li>
                  <strong>GPT-4:</strong> Excellent at Chain of Thought
                  reasoning, code generation, and creative tasks
                </li>
                <li>
                  <strong>Claude:</strong> Strong at long-form content,
                  analysis, and constitutional AI patterns
                </li>
                <li>
                  <strong>Gemini:</strong> Good at multimodal tasks and
                  information retrieval
                </li>
              </ul>
              <p>
                Optimize your prompts based on which model you&apos;re using.
                Test different patterns to find what works best for each model.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                The KERNEL Framework
              </h3>
              <p>
                The KERNEL framework is our proprietary approach to
                enterprise-grade prompt engineering. It stands for:
              </p>
              <ul>
                <li>
                  <strong>K</strong>nowledge: Provide relevant context
                </li>
                <li>
                  <strong>E</strong>xamples: Show what you want
                </li>
                <li>
                  <strong>R</strong>ole: Assign a persona
                </li>
                <li>
                  <strong>N</strong>ext: Specify the next steps
                </li>
                <li>
                  <strong>E</strong>valuate: Include evaluation criteria
                </li>
                <li>
                  <strong>L</strong>earn: Enable iterative improvement
                </li>
              </ul>
              <p>
                This framework achieves 94% success rates and 58% token
                reduction. Learn more about{' '}
                <Link href="/kernel" className="text-primary hover:underline">
                  the KERNEL framework
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Practical Examples */}
          <section id="examples" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">
              5. Practical Examples and Use Cases
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Before and After: Code Generation Example
              </h3>
              <p>Let&apos;s see how prompt engineering transforms results:</p>

              <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                  ❌ Weak Prompt
                </h4>
                <pre className="text-sm text-foreground">
                  <code>Write a function to validate emails</code>
                </pre>
                <p className="mt-2 text-sm text-foreground/80">
                  Result: Generic, unreliable code with no error handling
                </p>
              </div>

              <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                  ✅ Strong Prompt (Using Persona + Few-Shot + Template)
                </h4>
                <pre className="whitespace-pre-wrap text-sm text-foreground">
                  <code>{`You are a senior TypeScript engineer.

Write a function that validates email addresses.

Requirements:
- Use regex for validation
- Handle edge cases (null, undefined, empty strings)
- Return boolean
- Include TypeScript types
- Add JSDoc comments

Example:
Input: "user@example.com"
Output: true

Input: "invalid-email"
Output: false`}</code>
                </pre>
                <p className="mt-2 text-sm text-foreground/80">
                  Result: Production-ready code with proper error handling and
                  types
                </p>
              </div>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Real-World Use Cases
              </h3>
              <ul>
                <li>
                  <strong>Code Review:</strong> Use Persona + Chain of Thought
                  to get detailed code reviews from a senior architect
                  perspective
                </li>
                <li>
                  <strong>Documentation:</strong> Use Template + Few-Shot to
                  generate consistent API documentation
                </li>
                <li>
                  <strong>Debugging:</strong> Use Chain of Thought to walk
                  through error analysis step-by-step
                </li>
                <li>
                  <strong>Architecture:</strong> Use RAG + Persona to design
                  systems based on best practices from your knowledge base
                </li>
              </ul>
            </div>
          </section>

          {/* SDLC Integration */}
          <section id="sdlc" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">
              6. Integration with Software Development Lifecycle
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Prompt engineering isn&apos;t just for code generation—it can
                enhance every phase of software development:
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Planning & Requirements
              </h3>
              <p>
                Use prompts to generate user stories, acceptance criteria, and
                technical specifications. The Persona pattern helps ensure
                requirements are written from the right perspective.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Design & Architecture
              </h3>
              <p>
                Leverage Chain of Thought + RAG to design systems based on
                architectural patterns and best practices. The AI can reason
                through trade-offs and suggest optimal solutions.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">Development</h3>
              <p>
                This is where prompt engineering shines. Use Few-Shot + Template
                to generate consistent, production-ready code. Combine with
                Persona to get code in your team&apos;s style.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">Testing</h3>
              <p>
                Generate test cases, test data, and even test implementations
                using prompt engineering. Few-Shot examples ensure tests follow
                your testing patterns.
              </p>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Deployment & Operations
              </h3>
              <p>
                Create deployment scripts, monitoring configurations, and
                runbooks using structured prompts. Consistency is key in
                operations.
              </p>
            </div>
          </section>

          {/* Best Practices */}
          <section id="best-practices" className="mb-16 scroll-mt-20">
            <h2 className="mb-6 text-3xl font-bold">
              7. Best Practices and Common Mistakes
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Best Practices
              </h3>
              <ul>
                <li>
                  <strong>Start simple, then iterate:</strong> Begin with basic
                  prompts and refine based on results
                </li>
                <li>
                  <strong>Test across models:</strong> Different models respond
                  differently to the same prompt
                </li>
                <li>
                  <strong>Version your prompts:</strong> Track changes and
                  measure improvements
                </li>
                <li>
                  <strong>Use prompt libraries:</strong> Build a repository of
                  proven prompts for your team
                </li>
                <li>
                  <strong>Document patterns:</strong> Explain why you chose
                  specific patterns so others can learn
                </li>
              </ul>

              <h3 className="mb-4 mt-8 text-2xl font-semibold">
                Common Mistakes to Avoid
              </h3>
              <ul>
                <li>
                  <strong>Vague instructions:</strong> &quot;Write good
                  code&quot; is useless. Be specific.
                </li>
                <li>
                  <strong>Ignoring context:</strong> Models need context to make
                  good decisions. Provide it.
                </li>
                <li>
                  <strong>Over-prompting:</strong> Too many constraints can
                  confuse the model. Find the balance.
                </li>
                <li>
                  <strong>Not iterating:</strong> The first prompt is rarely the
                  best. Refine based on results.
                </li>
                <li>
                  <strong>Forgetting error handling:</strong> Always specify how
                  to handle edge cases and errors.
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-16 scroll-mt-20">
            <FAQSection
              faqs={PILLAR_FAQS}
              title="8. Frequently Asked Questions"
              description="Common questions about prompt engineering, patterns, and best practices."
              currentUrl={`${APP_URL}/learn/prompt-engineering-masterclass`}
            />
          </section>

          {/* Related Content - Hub-and-Spoke Links */}
          <section className="mb-16 scroll-mt-20">
            <CrossContentLinks
              tags={['prompt-engineering', 'ai-patterns', 'prompt-patterns']}
              category="intermediate"
              excludeId="prompt-engineering-masterclass"
            />
          </section>

          {/* CTA Section */}
          <section className="mb-16 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Master Prompt Engineering?
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Access our full library of {promptCount}+ expert prompts, interactive
              workbenches, and team training tools.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/prompts">
                  Browse Prompt Library
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/workbench">Try Interactive Workbench</Link>
              </Button>
            </div>
          </section>
        </article>
      </MainLayout>
    </>
  );
}
