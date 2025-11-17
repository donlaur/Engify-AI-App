/**
 * Prompt Context Explanation Component
 * Provides educational content explaining what the prompt concept is and why it's useful
 * Designed for SEO and user education
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

interface PromptContextExplanationProps {
  title: string;
  category: string;
  description?: string;
  whatIs?: string; // From database
  whyUse?: string[]; // From database
}

/**
 * Get contextual explanation based on prompt title and category
 * This provides SEO-friendly educational content
 */
function getContextExplanation(title: string, category: string): {
  whatIs: string;
  whyUse: string[];
} | null {
  const titleLower = title.toLowerCase();
  
  // Code Review specific
  if (titleLower.includes('code review') || titleLower.includes('review code')) {
    return {
      whatIs: 'A code review is a systematic examination of source code intended to identify bugs, improve code quality, ensure adherence to coding standards, and share knowledge among team members. It\'s a collaborative process where developers review each other\'s code before it\'s merged into the main codebase. Code reviews help catch errors early, maintain consistency, and improve overall software quality.',
      whyUse: [
        'Catch bugs and security vulnerabilities before they reach production',
        'Improve code quality and maintainability through peer feedback',
        'Ensure code follows team standards and best practices',
        'Share knowledge and spread expertise across the development team',
        'Reduce technical debt by identifying code smells early',
        'Learn from other developers\' approaches and solutions',
        'Document code decisions and reasoning through review comments',
        'Build confidence in code changes before deployment'
      ]
    };
  }
  
  // Unit Test specific
  if (titleLower.includes('unit test') || titleLower.includes('test generator')) {
    return {
      whatIs: 'Unit testing is a software testing method where individual units or components of code are tested in isolation to verify they work correctly. A unit test validates a specific function, method, or class behaves as expected. Unit tests are automated, fast, and provide immediate feedback during development.',
      whyUse: [
        'Catch bugs immediately when code changes',
        'Document expected behavior of code',
        'Enable safe refactoring with confidence',
        'Improve code design by making it more testable',
        'Reduce debugging time by catching issues early',
        'Serve as living documentation for how code should work',
        'Enable continuous integration and deployment',
        'Increase team confidence in code changes'
      ]
    };
  }
  
  // Architecture Decision Record (ADR)
  if (titleLower.includes('architecture') || titleLower.includes('adr') || titleLower.includes('decision record')) {
    return {
      whatIs: 'An Architecture Decision Record (ADR) is a document that captures important architectural decisions made along with their context and consequences. ADRs help teams understand why certain technical choices were made, document trade-offs, and provide historical context for future decision-making.',
      whyUse: [
        'Document the reasoning behind important technical decisions',
        'Help new team members understand existing architecture',
        'Avoid repeating discussions about decisions already made',
        'Track architectural evolution over time',
        'Make informed decisions based on past experiences',
        'Improve team communication and alignment',
        'Enable better long-term planning and maintenance',
        'Create a knowledge base for future reference'
      ]
    };
  }
  
  // API Documentation
  if (titleLower.includes('api') && (titleLower.includes('doc') || titleLower.includes('documentation'))) {
    return {
      whatIs: 'API documentation is a technical reference that describes how to use an API, including endpoints, parameters, request/response formats, authentication methods, and code examples. Good API documentation helps developers integrate with your API quickly and correctly.',
      whyUse: [
        'Reduce integration time for API consumers',
        'Improve developer experience and adoption',
        'Reduce support requests and confusion',
        'Provide clear examples and use cases',
        'Document authentication and security requirements',
        'Enable automated testing and validation',
        'Create a single source of truth for API usage',
        'Improve API discoverability and usability'
      ]
    };
  }
  
  // Generic fallback based on category
  if (category === 'code-generation') {
    return {
      whatIs: 'Code generation involves creating source code automatically using templates, patterns, or AI assistance. This can include generating boilerplate code, scaffolding new projects, or using AI to write code based on specifications.',
      whyUse: [
        'Speed up development by automating repetitive tasks',
        'Reduce human error in boilerplate code',
        'Ensure consistency across codebases',
        'Focus on business logic instead of setup code',
        'Accelerate prototyping and experimentation',
        'Maintain coding standards automatically',
        'Reduce cognitive load on developers',
        'Enable faster time-to-market'
      ]
    };
  }
  
  return null;
}

export function PromptContextExplanation({
  title,
  category,
  whatIs: dbWhatIs,
  whyUse: dbWhyUse,
}: PromptContextExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use database fields if available, otherwise fallback to hardcoded logic
  let context: { whatIs: string; whyUse: string[] } | null = null;
  
  if (dbWhatIs && dbWhyUse && dbWhyUse.length > 0) {
    // Use database content
    context = {
      whatIs: dbWhatIs,
      whyUse: dbWhyUse,
    };
  } else {
    // Fallback to hardcoded logic
    context = getContextExplanation(title, category);
  }
  
  if (!context) {
    return null; // Don't show if no context available
  }

  // Show first 4 items by default, rest when expanded
  const visibleCount = 4;
  const visibleReasons = context.whyUse.slice(0, visibleCount);
  const hiddenReasons = context.whyUse.slice(visibleCount);
  const hasMore = hiddenReasons.length > 0;

  return (
    <div className="mt-8 space-y-6">
      <Separator />
      
      {/* What is [Concept] Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <Icons.book className="h-6 w-6 text-blue-600" />
          What is {title}?
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              {context.whatIs}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Why Use [Concept] Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <Icons.checkCircle className="h-6 w-6 text-green-600" />
          Why Would Someone Use {title}?
        </h2>
        <Card>
          <CardContent className="pt-6">
            {/* Summary paragraph for SEO and context - dynamically generated from content */}
            {context.whyUse.length > 0 && (
              <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                {title} provides practical benefits for engineering teams, including improved efficiency, 
                better code quality, and streamlined workflows. The key advantages include:
              </p>
            )}
            
            {/* Responsive grid: 2 columns on md+, 1 column on mobile */}
            {/* Show first 4 items (even number) */}
            {context.whyUse.length > 0 && (
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-base leading-relaxed">{reason}</span>
                  </li>
                ))}
                
                {/* Show remaining items when expanded */}
                {isExpanded && hiddenReasons.map((reason, i) => (
                  <li key={visibleCount + i} className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-base leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Show More / Show Less button */}
            {hasMore && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full md:w-auto"
                >
                  {isExpanded ? (
                    <>
                      Show Less
                      <Icons.chevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show {hiddenReasons.length} More Benefit{hiddenReasons.length > 1 ? 's' : ''}
                      <Icons.chevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

