/**
 * Prompt Enrichment Display Component
 * Displays all enrichment fields: case studies, best time to use, recommended models, etc.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Separator } from '@/components/ui/separator';

interface CaseStudy {
  title: string;
  scenario?: string;
  challenge?: string;
  context?: string;
  solution?: string;
  process?: string;
  outcome?: string;
  keyLearning?: string;
  metrics?: string;
}

interface RecommendedModel {
  model: string;
  provider?: string;
  reason?: string;
  useCase?: string;
}

interface Example {
  title?: string;
  input?: string;
  output?: string;
  expectedOutput?: string;
  description?: string;
}

interface PromptEnrichmentProps {
  caseStudies?: CaseStudy[];
  bestTimeToUse?: string[] | string;
  recommendedModel?: RecommendedModel[];
  useCases?: string[];
  examples?: Example[];
  bestPractices?: string[];
  whenNotToUse?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | number;
  estimatedTime?: string | number;
}

export function PromptEnrichment({
  caseStudies,
  bestTimeToUse,
  recommendedModel,
  useCases,
  examples,
  bestPractices,
  whenNotToUse,
  difficulty,
  estimatedTime,
}: PromptEnrichmentProps) {
  const hasAnyEnrichment = 
    (caseStudies && caseStudies.length > 0) ||
    bestTimeToUse ||
    (recommendedModel && recommendedModel.length > 0) ||
    (useCases && useCases.length > 0) ||
    (examples && examples.length > 0) ||
    (bestPractices && bestPractices.length > 0) ||
    (whenNotToUse && whenNotToUse.length > 0) ||
    difficulty ||
    estimatedTime;

  if (!hasAnyEnrichment) {
    return null;
  }

  const bestTimeArray = Array.isArray(bestTimeToUse) 
    ? bestTimeToUse 
    : bestTimeToUse 
      ? [bestTimeToUse] 
      : [];

  return (
    <div className="mt-12 space-y-8">
      <Separator />
      
      {/* Difficulty & Time */}
      {(difficulty || estimatedTime) && (
        <div className="flex flex-wrap gap-4">
          {difficulty && (
            <Badge variant="outline" className="text-sm">
              <Icons.star className="mr-1 h-3 w-3" />
              {typeof difficulty === 'string'
                ? `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)} Level`
                : `Level ${difficulty}`
              }
            </Badge>
          )}
          {estimatedTime && (
            <Badge variant="outline" className="text-sm">
              <Icons.clock className="mr-1 h-3 w-3" />
              {typeof estimatedTime === 'number' ? `${estimatedTime} min` : estimatedTime}
            </Badge>
          )}
        </div>
      )}

      {/* Best Time to Use */}
      {bestTimeArray.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.clock className="h-6 w-6" />
            Best Time to Use
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {bestTimeArray.map((time, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recommended Models */}
      {recommendedModel && recommendedModel.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.brain className="h-6 w-6" />
            Recommended AI Models
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedModel.map((model, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {model.model}
                    {model.provider && (
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {model.reason && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {model.reason}
                    </p>
                  )}
                  {model.useCase && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Best for:</span> {model.useCase}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.fileText className="h-6 w-6" />
            Use Cases
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-2 md:grid-cols-2">
                {useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Case Studies */}
      {caseStudies && caseStudies.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.book className="h-6 w-6" />
            Case Studies
          </h2>
          <div className="space-y-6">
            {caseStudies.map((study, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{study.title}</CardTitle>
                  {study.scenario && <CardDescription>{study.scenario}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {study.challenge && (
                    <div>
                      <h4 className="mb-2 font-semibold">Challenge:</h4>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>
                  )}
                  {study.process && (
                    <div>
                      <h4 className="mb-2 font-semibold">Process:</h4>
                      <p className="text-sm text-muted-foreground">{study.process}</p>
                    </div>
                  )}
                  {study.outcome && (
                    <div>
                      <h4 className="mb-2 font-semibold">Outcome:</h4>
                      <p className="text-sm text-muted-foreground">{study.outcome}</p>
                    </div>
                  )}
                  {study.keyLearning && (
                    <>
                      <Separator />
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs font-medium mb-1">Key Learning:</p>
                        <p className="text-sm">{study.keyLearning}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Examples */}
      {examples && examples.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.lightbulb className="h-6 w-6" />
            Examples
          </h2>
          <div className="space-y-6">
            {examples.map((example, i) => (
              <Card key={i}>
                <CardHeader>
                  {example.title && <CardTitle>{example.title}</CardTitle>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {example.input && (
                    <div>
                      <h4 className="mb-2 font-semibold">Input:</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                        {example.input}
                      </div>
                    </div>
                  )}
                  {example.expectedOutput && (
                    <div>
                      <h4 className="mb-2 font-semibold">Expected Output:</h4>
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                        {example.expectedOutput}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Best Practices */}
      {bestPractices && bestPractices.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.checkCircle className="h-6 w-6" />
            Best Practices
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {bestPractices.map((practice, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icons.check className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* When Not to Use */}
      {whenNotToUse && whenNotToUse.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.alertTriangle className="h-6 w-6" />
            When Not to Use
          </h2>
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50">
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {whenNotToUse.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icons.x className="mt-1 h-4 w-4 shrink-0 text-yellow-600" />
                    <span className="text-muted-foreground">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}


