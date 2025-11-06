/**
 * Learn Page - Server Component
 * Fetches learning resources and pathways from MongoDB
 * Displays guided learning paths and articles
 */

import Link from 'next/link';
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
import { getAllLearningResources } from '@/lib/learning/mongodb-learning';
import { learningResourceRepository } from '@/lib/db/repositories/ContentService';
import { learningPathways } from '@/data/learning-pathways'; // Still hardcoded for now

export default async function LearnPage() {
  // Fetch learning resources from MongoDB
  const learningResources = await getAllLearningResources();
  
  // Verify articles exist in DB for pathway links
  const verifyArticleExists = async (slug: string): Promise<boolean> => {
    try {
      const article = await learningResourceRepository.getBySlug(slug);
      return article !== null;
    } catch {
      return false;
    }
  };

  // Check which pathway articles exist
  const verifiedPathways = await Promise.all(
    learningPathways.map(async (pathway) => {
      const verifiedSteps = await Promise.all(
        pathway.steps.map(async (step) => {
          if (step.type === 'article') {
            const exists = await verifyArticleExists(step.targetId);
            return { ...step, exists };
          }
          return { ...step, exists: true };
        })
      );
      return { ...pathway, steps: verifiedSteps };
    })
  );

  const pathwayCount = learningPathways.length;

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'article':
        return Icons.file;
      case 'playbook':
        return Icons.library;
      case 'workbench':
        return Icons.zap;
      case 'external_link':
        return Icons.link;
      default:
        return Icons.check;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'playbook':
        return 'bg-purple-100 text-purple-800';
      case 'workbench':
        return 'bg-green-100 text-green-800';
      case 'external_link':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSteps = learningPathways.reduce((acc, p) => acc + p.steps.length, 0);

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Guided Learning Paths</h1>
          <p className="text-xl text-muted-foreground">
            Structured pathways to master AI and prompt engineering
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="surface-frosted">
            <CardContent className="pt-6">
              <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
                {pathwayCount}
              </div>
              <p className="text-tertiary dark:text-tertiary text-xs">Learning Pathways</p>
            </CardContent>
          </Card>
          <Card className="surface-frosted">
            <CardContent className="pt-6">
              <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
                {totalSteps}
              </div>
              <p className="text-tertiary dark:text-tertiary text-xs">Total Steps</p>
            </CardContent>
          </Card>
          <Card className="surface-frosted">
            <CardContent className="pt-6">
              <div className="text-primary-light dark:text-primary-light text-2xl font-bold">
                {learningResources.length}
              </div>
              <p className="text-tertiary dark:text-tertiary text-xs">Learning Articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Resources */}
        <div className="mb-12 space-y-6">
          <h2 className="text-3xl font-bold">Featured Resources</h2>
          
          {/* AI Tools & Models */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.code className="h-6 w-6 text-blue-600" />
                  AI Development Tools
                </CardTitle>
                <CardDescription>
                  Compare 253+ AI-powered IDEs, code assistants, and development tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Find the best AI tool for your workflow with detailed comparisons of Cursor, GitHub Copilot, Windsurf, and more.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/learn/ai-tools">
                      <Icons.arrowRight className="mr-2 h-4 w-4" />
                      Explore AI Tools
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.sparkles className="h-6 w-6 text-purple-600" />
                  AI Models Comparison
                </CardTitle>
                <CardDescription>
                  Compare 253+ AI models from OpenAI, Anthropic, Google, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Find the perfect AI model for your use case with pricing, capabilities, and EOL tracking.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/learn/ai-models">
                      <Icons.arrowRight className="mr-2 h-4 w-4" />
                      Compare AI Models
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pillar Articles */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">Comprehensive Guides</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-blue-100 text-blue-800">Pillar Article</Badge>
                  <CardTitle className="text-lg">AI Upskilling Program for Engineering Teams</CardTitle>
                  <CardDescription>
                    Build a high-ROI AI upskilling program that transforms your engineering team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/learn/ai-upskilling-program-for-engineering-teams">
                      Read Guide
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-purple-100 text-purple-800">Pillar Article</Badge>
                  <CardTitle className="text-lg">Building an AI-First Engineering Organization</CardTitle>
                  <CardDescription>
                    Transform your engineering culture to embrace AI-first development practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/learn/building-an-ai-first-engineering-organization">
                      Read Guide
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-green-100 text-green-800">Pillar Article</Badge>
                  <CardTitle className="text-lg">Ultimate Guide to AI-Assisted Software Development</CardTitle>
                  <CardDescription>
                    Master AI-assisted development with tools, workflows, and best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/learn/ultimate-guide-to-ai-assisted-software-development">
                      Read Guide
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl">
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-orange-100 text-orange-800">Pillar Article</Badge>
                  <CardTitle className="text-lg">Context Engineering vs Prompt Engineering</CardTitle>
                  <CardDescription>
                    Learn the key differences and when to use each approach for better AI results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/learn/context-engineering-vs-prompt-engineering">
                      Read Guide
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Pathways */}
        <div className="space-y-8">
          {verifiedPathways.map((pathway) => (
            <Card key={pathway.id} className="group relative overflow-hidden rounded-xl border border-border/50 bg-card surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10 dark:surface-frosted dark:hover:surface-frosted-hover">
              <CardHeader className="bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2 text-2xl text-primary-light dark:text-primary-light">
                      {pathway.title}
                    </CardTitle>
                    <CardDescription className="text-base text-secondary-light dark:text-secondary-light">
                      {pathway.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {pathway.steps.length} Steps
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pathway.steps.map((step: typeof pathway.steps[0] & { exists?: boolean }, index) => {
                    const Icon = getStepIcon(step.type);
                    const isLast = index === pathway.steps.length - 1;

                    return (
                      <div key={step.id} className="relative">
                        {/* Connector Line */}
                        {!isLast && (
                          <div className="absolute bottom-0 left-6 top-12 w-0.5 bg-border" />
                        )}

                        {/* Step Card */}
                        <div className="flex gap-4">
                          {/* Step Number */}
                          <div className="relative flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                              {step.id}
                            </div>
                          </div>

                          {/* Step Content */}
                          <Card className="flex-1 group relative rounded-xl border border-border/50 bg-card surface-frosted surface-frosted-hover transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10 dark:surface-frosted dark:hover:surface-frosted-hover">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="mb-2 text-lg text-primary-light dark:text-primary-light">
                                    {step.title}
                                  </CardTitle>
                                  <CardDescription className="text-secondary-light dark:text-secondary-light">
                                    {step.description}
                                  </CardDescription>
                                </div>
                                <Badge className={getStepColor(step.type)}>
                                  <Icon className="mr-1 h-3 w-3" />
                                  {step.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {step.type === 'external_link' ? (
                                <Button variant="outline" asChild>
                                  <a href={step.targetId} target="_blank" rel="noopener noreferrer">
                                    <Icon className="mr-2 h-4 w-4" />
                                    {step.actionText}
                                  </a>
                                </Button>
                              ) : (
                                step.exists ? (
                                  <Button variant="outline" asChild>
                                    <Link href={
                                      step.type === 'workbench' ? '/demo' :
                                      step.type === 'article' ? `/learn/${step.targetId}` :
                                      `/prompts/${step.targetId}`
                                    }>
                                      <Icon className="mr-2 h-4 w-4" />
                                      {step.actionText}
                                    </Link>
                                  </Button>
                                ) : (
                                  <Button variant="outline" disabled>
                                    <Icon className="mr-2 h-4 w-4" />
                                    {step.actionText} (Coming Soon)
                                  </Button>
                                )
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Icons.trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-2xl font-bold">
              Ready to start learning?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Pick a pathway above and begin your journey to AI mastery
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/patterns">
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                  View All Patterns
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/prompts">
                  <Icons.library className="mr-2 h-4 w-4" />
                  Browse Prompts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
