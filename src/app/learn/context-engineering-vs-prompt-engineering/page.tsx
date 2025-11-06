import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Context Engineering vs Prompt Engineering | Engify.ai',
  description:
    'Learn the key differences between context engineering and prompt engineering, when to use each approach, and how they work together to improve AI output quality.',
  keywords: [
    'context engineering',
    'prompt engineering',
    'RAG',
    'AI fundamentals',
    'context management',
    'prompt patterns',
  ],
};

export default function ContextEngineeringPage() {
  return (
    <MainLayout>
      <article className="container py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Badge className="mb-4 bg-orange-100 text-orange-800">
              Pillar Article
            </Badge>
            <h1 className="mb-4 text-5xl font-bold">
              Context Engineering vs Prompt Engineering: What&apos;s the
              Difference?
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn the key differences between context engineering and prompt
              engineering, when to use each approach, and how they work together
              to improve AI output quality.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead">
              If you&apos;ve been working with AI models, you&apos;ve likely
              encountered two terms that seem similar but are actually quite
              different: <strong>context engineering</strong> and{' '}
              <strong>prompt engineering</strong>. Understanding the distinction
              between these two approaches is crucial for getting the best
              results from AI systems.
            </p>

            <h2>The Core Difference</h2>
            <Card className="my-6 border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
              <CardContent className="p-6">
                <p className="mb-2 text-lg font-semibold text-purple-900 dark:text-purple-100">
                  <strong>Context Engineering</strong> = <strong>WHAT</strong>{' '}
                  information you provide to the AI
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  <strong>Prompt Engineering</strong> = <strong>HOW</strong> you
                  structure your request to the AI
                </p>
              </CardContent>
            </Card>

            <p>Think of it this way:</p>
            <ul>
              <li>
                <strong>Context</strong> is the data, information, and
                background you give the AI
              </li>
              <li>
                <strong>Prompt Engineering</strong> is the techniques and
                structure you use to ask questions
              </li>
            </ul>

            <p>
              Both are essential, but they solve different problems and work
              best when used together.
            </p>

            <h2>What is Context Engineering?</h2>
            <p>
              Context engineering focuses on <strong>providing the right information</strong> to the AI model. This includes:
            </p>

            <h3>Types of Context</h3>

            <h4>1. System Context</h4>
            <ul>
              <li>Instructions about the AI&apos;s role and behavior</li>
              <li>
                Example: &quot;You are a senior software engineer reviewing
                code&quot;
              </li>
              <li>Sets the AI&apos;s persona and expertise level</li>
            </ul>

            <h4>2. User Context</h4>
            <ul>
              <li>
                Information about the user, their situation, or constraints
              </li>
              <li>
                Example: &quot;The user is a junior developer working on a React
                application&quot;
              </li>
              <li>Helps tailor responses to the user&apos;s needs</li>
            </ul>

            <h4>3. Domain Context</h4>
            <ul>
              <li>Specific knowledge about the domain or problem space</li>
              <li>
                Example: &quot;This codebase uses TypeScript, React, and
                MongoDB&quot;
              </li>
              <li>Provides relevant background information</li>
            </ul>

            <h4>4. Retrieved Context (RAG)</h4>
            <ul>
              <li>Documents, code, or data retrieved from external sources</li>
              <li>
                Example: Including relevant documentation or code snippets
              </li>
              <li>Ensures responses are grounded in real data</li>
            </ul>

            <h2>What is Prompt Engineering?</h2>
            <p>
              Prompt engineering focuses on <strong>how you structure your request</strong> to get the best results. This includes:
            </p>

            <h3>Key Techniques</h3>

            <h4>Chain of Thought</h4>
            <p>
              Ask the AI to think step-by-step before providing an answer. This
              improves reasoning and reduces errors.
            </p>

            <h4>Few-Shot Learning</h4>
            <p>
              Provide examples of the desired output format to guide the
              AI&apos;s responses.
            </p>

            <h4>Role Assignment</h4>
            <p>
              Assign a specific role or persona to the AI to shape its
              perspective and expertise.
            </p>

            <h4>Constraints and Guidelines</h4>
            <p>
              Specify output format, length, tone, and other requirements to
              control the response.
            </p>

            <h2>When to Use Each Approach</h2>

            <Card className="my-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-bold">
                  Use Context Engineering When:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <span>
                      You need the AI to reference specific documents or data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <span>
                      You want responses grounded in your knowledge base
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <span>
                      You need to provide domain-specific information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <span>You want to reduce hallucinations</span>
                  </li>
                </ul>

                <h3 className="mb-4 mt-6 text-xl font-bold">
                  Use Prompt Engineering When:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <span>You need to improve reasoning quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <span>You want consistent output formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <span>You need to control tone and style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                    <span>You want to guide the AI&apos;s approach</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <h2>Best Practices: Using Both Together</h2>
            <p>
              The most effective AI applications combine both context
              engineering and prompt engineering:
            </p>

            <ol>
              <li>
                <strong>Start with Context</strong>: Provide relevant
                information through RAG or system context
              </li>
              <li>
                <strong>Structure Your Prompt</strong>: Use proven patterns like
                Chain of Thought or Few-Shot
              </li>
              <li>
                <strong>Iterate and Refine</strong>: Test different combinations
                to find what works best
              </li>
              <li>
                <strong>Monitor Quality</strong>: Track accuracy and relevance
                of responses
              </li>
            </ol>

            <h2>Real-World Example</h2>
            <Card className="my-6 border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-blue-900 dark:text-blue-100">
                  Code Review Assistant
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                      Context Engineering:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>Include the code to be reviewed</li>
                      <li>Add relevant coding standards</li>
                      <li>Provide project documentation</li>
                      <li>Include similar code examples</li>
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                      Prompt Engineering:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>Use Chain of Thought for thorough analysis</li>
                      <li>Specify output format (issues, suggestions, praise)</li>
                      <li>Set tone (constructive, educational)</li>
                      <li>Define severity levels for issues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2>Conclusion</h2>
            <p>
              Context engineering and prompt engineering are complementary
              approaches that work best together. Context engineering ensures
              the AI has the right information, while prompt engineering ensures
              it processes that information effectively. Master both to build
              powerful, accurate AI applications.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 border-t pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="mb-2 text-xl font-bold">
                  Ready to Learn More?
                </h3>
                <p className="text-muted-foreground">
                  Explore our other comprehensive guides and resources
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href="/learn">
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Back to Learn
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/prompts">
                    Browse Prompts
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
