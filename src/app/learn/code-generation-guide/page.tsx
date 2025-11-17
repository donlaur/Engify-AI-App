/**
 * Prompt Engineering for Code Generation: Best Practices
 * 
 * Cluster Article - Supporting Pillar Page
 * Target: "prompt engineering for code generation" (estimated 500+ searches/mo)
 * Links back to: /learn/prompt-engineering-masterclass
 * 
 * Content: 1,500-2,000 words on code generation best practices
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Prompt Engineering for Code Generation: Best Practices | Engify.ai',
  description:
    'Master prompt engineering for code generation. Learn best practices, patterns, and techniques to get production-ready code from AI assistants. Real examples for TypeScript, Python, and more.',
  keywords: [
    'prompt engineering for code generation',
    'AI code generation',
    'prompt engineering best practices',
    'code generation prompts',
    'AI coding assistant',
    'prompt engineering techniques',
    'code generation patterns',
  ],
  openGraph: {
    title: 'Prompt Engineering for Code Generation: Best Practices',
    description:
      'Learn best practices for generating production-ready code with AI assistants. Patterns, techniques, and real examples.',
    type: 'article',
    siteName: 'Engify.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Engineering for Code Generation: Best Practices',
    description:
      'Master prompt engineering for code generation with best practices and examples.',
    creator: '@engifyai',
  },
};

export default function CodeGenerationGuidePage() {
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
          <span className="font-medium">Code Generation Guide</span>
        </div>
      </nav>

      <article className="container max-w-4xl py-12">
        {/* Header */}
        <header className="mb-12 space-y-6 border-b pb-8">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm font-medium">
              Best Practices
            </Badge>
            <Badge variant="outline" className="text-sm">
              Intermediate
            </Badge>
            <Badge variant="outline" className="text-sm">
              ~1,800 words
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Prompt Engineering for Code Generation: Best Practices
          </h1>
          <p className="text-xl text-muted-foreground">
            Get production-ready code from AI assistants. This guide covers
            proven patterns, techniques, and best practices for generating high-quality
            code using prompt engineering.
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
            <span>12 min read</span>
          </div>
        </header>

        {/* Introduction */}
        <section className="mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead">
              Code generation is one of the most common use cases for AI
              assistants, but getting production-ready code requires more than
              just asking &quot;write me a function.&quot; Effective prompt engineering
              transforms basic code requests into reliable, maintainable,
              production-quality implementations.
            </p>
            <p>
              This guide covers the essential patterns and techniques for code
              generation, from simple functions to complex systems. You&apos;ll learn
              how to specify requirements, handle edge cases, and ensure code
              quality through effective prompting.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Core Principles for Code Generation
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mt-8 mb-4">
              1. Specify Language and Framework
            </h3>
            <p>
              Always specify the programming language, framework, and version:
            </p>
            <pre className="bg-muted p-4 rounded text-sm">
              <code>{`Write a function in TypeScript 5.0+ using React 18 hooks
that validates email addresses...`}</code>
            </pre>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              2. Define Input and Output Types
            </h3>
            <p>
              Explicitly specify function signatures, parameters, and return
              types:
            </p>
            <pre className="bg-muted p-4 rounded text-sm">
              <code>{`Create a function:
- Input: email: string
- Output: { valid: boolean; error?: string }
- TypeScript types required`}</code>
            </pre>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              3. Include Error Handling
            </h3>
            <p>
              Never assume the AI will add error handling. Explicitly request it:
            </p>
            <pre className="bg-muted p-4 rounded text-sm">
              <code>{`Include comprehensive error handling:
- Handle null/undefined inputs
- Validate input types
- Throw descriptive errors
- Return error objects for failures`}</code>
            </pre>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              4. Request Documentation
            </h3>
            <p>
              Ask for JSDoc comments, inline comments, and usage examples:
            </p>
            <pre className="bg-muted p-4 rounded text-sm">
              <code>{`Include:
- JSDoc comments with parameter descriptions
- Inline comments for complex logic
- Usage example
- Edge case documentation`}</code>
            </pre>
          </div>
        </section>

        {/* Pattern Combinations */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Effective Pattern Combinations for Code
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mt-8 mb-4">
              Persona + Chain-of-Thought + Few-Shot
            </h3>
            <p>
              Combine multiple patterns for best results:
            </p>
            <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap overflow-x-auto">
              <code>{`You are a senior TypeScript engineer with 10+ years of experience.

Write a function to validate email addresses.

Think through this step by step:
1. What regex pattern should we use?
2. What edge cases need handling?
3. What should the return type be?

Example of the style I want:
\`\`\`typescript
/**
 * Validates user input
 * @param input - The input to validate
 * @returns Validation result
 */
function validateInput(input: string): { valid: boolean; error?: string } {
  // Implementation
}
\`\`\`

Now write the email validation function following this pattern.`}</code>
            </pre>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Real-World Code Generation Examples
          </h2>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Example 1: API Endpoint</CardTitle>
                <CardDescription>
                  Generating a complete REST API endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Create a REST API endpoint for user authentication:

Requirements:
- Language: TypeScript with Express.js
- Endpoint: POST /api/auth/login
- Input: { email: string; password: string }
- Output: { token: string; user: User }
- Security: Hash passwords, use JWT tokens, rate limiting
- Error handling: 400 for invalid input, 401 for wrong credentials
- Validation: Use Zod schemas
- Testing: Include unit tests

Include:
- Route handler
- Input validation schema
- Error handling middleware
- TypeScript types
- JSDoc comments`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 2: React Component</CardTitle>
                <CardDescription>
                  Generating a React component with hooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Create a React component for a user profile card:

Tech Stack:
- React 18 with TypeScript
- Tailwind CSS for styling
- React Hook Form for form handling

Requirements:
- Display user avatar, name, email
- Editable fields with validation
- Loading and error states
- Responsive design
- Accessibility (ARIA labels)
- Dark mode support

Include:
- Component with proper TypeScript types
- Custom hooks if needed
- Form validation
- Error boundaries
- PropTypes/JSDoc`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Example 3: Database Query</CardTitle>
                <CardDescription>
                  Generating optimized database queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap overflow-x-auto">
                  <code>{`Write a database query function:

Database: PostgreSQL with Prisma ORM
Task: Get active users with their latest order

Requirements:
- Use Prisma query builder
- Include pagination (limit, offset)
- Filter by status = 'active'
- Join with orders table
- Order by latest order date
- Include error handling
- Return typed results

Optimize for:
- Performance (use indexes)
- Type safety
- Error handling`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold">
            Code Generation Best Practices
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold mt-8 mb-4">
              ✅ Do&apos;s
            </h3>
            <ul>
              <li>
                <strong>Be Specific:</strong> Specify exact requirements, not
                vague descriptions
              </li>
              <li>
                <strong>Provide Context:</strong> Give background about the
                codebase, patterns, and conventions
              </li>
              <li>
                <strong>Request Tests:</strong> Ask for unit tests, integration
                tests, or example usage
              </li>
              <li>
                <strong>Specify Patterns:</strong> Mention design patterns,
                architectural patterns, or coding standards
              </li>
              <li>
                <strong>Iterate:</strong> Refine prompts based on initial
                results
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mt-8 mb-4">
              ❌ Don&apos;ts
            </h3>
            <ul>
              <li>
                <strong>Don&apos;t Assume:</strong> Don&apos;t assume the AI knows your
                codebase structure or conventions
              </li>
              <li>
                <strong>Don&apos;t Skip Validation:</strong> Always request input
                validation and error handling
              </li>
              <li>
                <strong>Don&apos;t Ignore Security:</strong> Explicitly request
                security best practices
              </li>
              <li>
                <strong>Don&apos;t Skip Documentation:</strong> Ask for comments and
                documentation
              </li>
            </ul>
          </div>
        </section>

        {/* CTA to Masterclass */}
        <section className="mb-12 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8">
          <h2 className="mb-4 text-2xl font-bold">
            Master Prompt Engineering for All Use Cases
          </h2>
          <p className="mb-6 text-muted-foreground">
            This guide focuses on code generation, but prompt engineering
            applies to every aspect of software development. Learn all 15
            patterns in our{' '}
            <Link
              href="/learn/prompt-engineering-masterclass"
              className="text-primary hover:underline font-medium"
            >
              Prompt Engineering Masterclass
            </Link>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/learn/prompt-engineering-masterclass">
                View Full Masterclass
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/prompts">
                Browse Code Generation Prompts
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
                  <Link href="/prompts" className="hover:text-primary">
                    Code Generation Prompts
                  </Link>
                </CardTitle>
                <CardDescription>
                  Browse 100+ expert prompts for code generation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/patterns" className="hover:text-primary">
                    All Prompt Patterns
                  </Link>
                </CardTitle>
                <CardDescription>
                  Explore all 15 proven patterns used in code generation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/workbench" className="hover:text-primary">
                    Interactive Workbench
                  </Link>
                </CardTitle>
                <CardDescription>
                  Test your code generation prompts in real-time
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </article>
    </MainLayout>
  );
}

