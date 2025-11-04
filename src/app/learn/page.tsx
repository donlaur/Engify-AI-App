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
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {pathwayCount}
              </div>
              <p className="text-xs text-muted-foreground">Learning Pathways</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {totalSteps}
              </div>
              <p className="text-xs text-muted-foreground">Total Steps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{learningResources.length}</div>
              <p className="text-xs text-muted-foreground">Learning Articles</p>
            </CardContent>
          </Card>
        </div>

        {/* Pathways */}
        <div className="space-y-8">
          {verifiedPathways.map((pathway) => (
            <Card key={pathway.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2 text-2xl">
                      {pathway.title}
                    </CardTitle>
                    <CardDescription className="text-base">
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
                          <Card className="flex-1">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="mb-2 text-lg">
                                    {step.title}
                                  </CardTitle>
                                  <CardDescription>
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
