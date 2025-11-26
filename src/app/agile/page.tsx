/**
 * Agile Hub Landing Page
 * 
 * Comprehensive hub for all agile-related content:
 * - WSJF prioritization (top search term)
 * - Scrum, Kanban, SAFe frameworks
 * - Agile prompts, patterns, articles, workflows
 * - Links to specialized pages (/wsjf, /ai-enabled-agile, etc.)
 * 
 * SEO-optimized for: agile, wsjf agile, agile wsjf, scrum, sprint planning, etc.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import { loadPatternsFromJson } from '@/lib/patterns/load-patterns-from-json';
import { getAllLearningResources } from '@/lib/learning/mongodb-learning';
import { ArrowRight, Calculator, BookOpen, Target, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agile Hub: WSJF, Scrum, Sprint Planning & AI-Enabled Agile | Engify.ai',
  description: 'Complete Agile resource hub: WSJF prioritization calculator, Scrum guides, sprint planning prompts, AI-enabled Agile practices, and more. Everything you need for modern Agile development.',
  keywords: [
    'agile',
    'wsjf agile',
    'agile wsjf',
    'wsjf',
    'wsjf prioritization',
    'scrum',
    'sprint planning',
    'agile retrospective',
    'kanban',
    'safe',
    'scaled agile',
    'ai-enabled agile',
    'agile prompts',
    'agile patterns',
  ].join(', '),
  openGraph: {
    title: 'Agile Hub: WSJF, Scrum & AI-Enabled Agile | Engify.ai',
    description: 'Complete Agile resource hub with WSJF calculator, Scrum guides, and AI-enabled Agile practices.',
    type: 'website',
    url: 'https://www.engify.ai/agile',
  },
  alternates: {
    canonical: 'https://www.engify.ai/agile',
  },
};

// Agile-related keywords to filter content
const AGILE_KEYWORDS = [
  'agile',
  'wsjf',
  'scrum',
  'sprint',
  'retrospective',
  'kanban',
  'safe',
  'backlog',
  'standup',
  'ceremony',
  'story point',
  'velocity',
  'epic',
  'user story',
  'sprint planning',
  'sprint review',
  'product owner',
  'scrum master',
];

function matchesAgileKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AGILE_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

export default async function AgileHubPage() {
  // Load all content from JSON (fast, no MongoDB)
  const [allPrompts, allPatterns, allArticles] = await Promise.all([
    loadPromptsFromJson().catch(() => []),
    loadPatternsFromJson().catch(() => []),
    getAllLearningResources().catch(() => []),
  ]);

  // Filter agile-related content
  const agilePrompts = allPrompts.filter(p => 
    matchesAgileKeywords(p.title) ||
    matchesAgileKeywords(p.description) ||
    matchesAgileKeywords(p.content) ||
    p.tags?.some(tag => matchesAgileKeywords(tag)) ||
    p.category === 'general' && matchesAgileKeywords(p.title)
  );

  const agilePatterns = allPatterns.filter(p =>
    matchesAgileKeywords(p.name) ||
    matchesAgileKeywords(p.description) ||
    p.tags?.some(tag => matchesAgileKeywords(tag))
  );

  const agileArticles = allArticles.filter(a =>
    matchesAgileKeywords(a.title) ||
    matchesAgileKeywords(a.description) ||
    a.tags?.some(tag => matchesAgileKeywords(tag)) ||
    a.category === 'guide' && matchesAgileKeywords(a.title)
  );

  // Find WSJF-specific content (top search term)
  const wsjfPrompts = agilePrompts.filter(p =>
    p.title.toLowerCase().includes('wsjf') ||
    p.description.toLowerCase().includes('wsjf') ||
    p.slug?.includes('wsjf')
  );

  const scrumPrompts = agilePrompts.filter(p =>
    p.title.toLowerCase().includes('scrum') ||
    p.description.toLowerCase().includes('scrum') ||
    p.role === 'scrum-master'
  );

  const sprintPrompts = agilePrompts.filter(p =>
    matchesAgileKeywords(p.title + ' ' + p.description) &&
    (p.title.toLowerCase().includes('sprint') || p.description.toLowerCase().includes('sprint'))
  );

  return (
    <MainLayout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Agile Hub
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need for Modern Agile Development
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            WSJF prioritization, Scrum guides, sprint planning prompts, AI-enabled Agile practices, 
            and more. Your complete resource hub for Agile software development.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/wsjf">
                <Calculator className="mr-2 h-5 w-5" />
                WSJF Calculator
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/ai-enabled-agile">
                <TrendingUp className="mr-2 h-5 w-5" />
                AI-Enabled Agile
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/for-scrum-masters">
                <Users className="mr-2 h-5 w-5" />
                For Scrum Masters
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{agilePrompts.length}</div>
              <div className="text-sm text-muted-foreground">Agile Prompts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{agilePatterns.length}</div>
              <div className="text-sm text-muted-foreground">Agile Patterns</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{agileArticles.length}</div>
              <div className="text-sm text-muted-foreground">Agile Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{wsjfPrompts.length}</div>
              <div className="text-sm text-muted-foreground">WSJF Resources</div>
            </CardContent>
          </Card>
        </div>

        {/* WSJF Section (Top Search Term) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">WSJF Prioritization</h2>
              <p className="text-muted-foreground">
                Weighted Shortest Job First - Economic prioritization for your backlog
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/wsjf">
                View Calculator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wsjfPrompts.slice(0, 6).map((prompt) => (
              <Card key={prompt.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{prompt.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/prompts/${prompt.slug || prompt.id}`}>
                      View Prompt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scrum Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Scrum Resources</h2>
              <p className="text-muted-foreground">
                Sprint planning, standups, retrospectives, and more
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/for-scrum-masters">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scrumPrompts.slice(0, 6).map((prompt) => (
              <Card key={prompt.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{prompt.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/prompts/${prompt.slug || prompt.id}`}>
                      View Prompt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sprint Planning Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Sprint Planning & Execution</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprintPrompts.slice(0, 6).map((prompt) => (
              <Card key={prompt.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{prompt.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/prompts/${prompt.slug || prompt.id}`}>
                      View Prompt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Agile Patterns */}
        {agilePatterns.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Agile Patterns</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agilePatterns.slice(0, 6).map((pattern) => (
                <Card key={pattern.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{pattern.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {pattern.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/patterns/${pattern.slug || pattern.id}`}>
                        View Pattern
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Agile Articles */}
        {agileArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Agile Articles & Guides</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agileArticles.slice(0, 6).map((article) => (
                <Card key={article.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/learn/${article.seo?.slug || article.id}`}>
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Related Pages */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Explore More</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  WSJF Calculator
                </CardTitle>
                <CardDescription>
                  Free WSJF calculator with formula guide and examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/wsjf">
                    Open Calculator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI-Enabled Agile
                </CardTitle>
                <CardDescription>
                  How to run Agile with AI: PBVR cycles, guardrails, and realistic estimation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/ai-enabled-agile">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  For Scrum Masters
                </CardTitle>
                <CardDescription>
                  Prompts, patterns, and workflows specifically for Scrum Masters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/for-scrum-masters">
                    View Resources
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Agile Practice?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Explore our complete library of Agile prompts, patterns, and workflows. 
            All free during beta.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/prompts">
                Browse All Prompts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/patterns">
                View Patterns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

