/**
 * Prompt Trust & Social Proof Component
 * Displays trust indicators, verification badges, and premium-ready features
 * SEO-focused design for public prompt pages
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/lib/icons';

interface PromptTrustProps {
  views?: number;
  rating?: number;
  verified?: boolean;
  premium?: boolean;
  updatedAt?: Date | string;
  auditScore?: number;
}

export function PromptTrust({
  views,
  rating,
  verified = false,
  premium = false,
  updatedAt,
  auditScore,
}: PromptTrustProps) {
  const hasStats = views !== undefined || rating !== undefined || auditScore !== undefined;

  if (!hasStats && !verified && !premium && !updatedAt) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {/* Verified Badge */}
      {verified && (
        <Badge variant="default" className="gap-1">
          <Icons.checkCircle className="h-3 w-3" />
          Verified
        </Badge>
      )}

      {/* Premium Badge */}
      {premium && (
        <Badge variant="default" className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600">
          <Icons.star className="h-3 w-3" />
          Premium
        </Badge>
      )}

      {/* Quality Score Badge */}
      {auditScore !== undefined && auditScore >= 7 && (
        <Badge variant="secondary" className="gap-1">
          <Icons.checkCircle className="h-3 w-3" />
          High Quality
        </Badge>
      )}

      {/* Views */}
      {views !== undefined && views > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icons.eye className="h-4 w-4" />
          <span>{views.toLocaleString()} views</span>
        </div>
      )}

      {/* Rating */}
      {rating !== undefined && rating > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      )}

      {/* Last Updated */}
      {updatedAt && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icons.clock className="h-4 w-4" />
          <span>Updated {new Date(updatedAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Prompt SEO Features Component
 * Displays SEO-rich content sections for better search visibility
 */

interface PromptSEOFeaturesProps {
  useCases?: string[];
  bestPractices?: string[];
  examples?: Array<{ title: string; input: string; expectedOutput: string }>;
}

export function PromptSEOFeatures({
  useCases,
  bestPractices,
  examples,
}: PromptSEOFeaturesProps) {
  const hasContent = (useCases && useCases.length > 0) || 
                    (bestPractices && bestPractices.length > 0) ||
                    (examples && examples.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="mt-12 space-y-8">
      <Separator />

      {/* Use Cases - SEO Rich Section */}
      {useCases && useCases.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.checkCircle className="h-6 w-6 text-green-600" />
            When to Use This Prompt
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {useCases.map((useCase, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icons.check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-base leading-relaxed">{useCase}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Best Practices - SEO Rich Section */}
      {bestPractices && bestPractices.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.star className="h-6 w-6 text-blue-600" />
            Best Practices
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {bestPractices.map((practice, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icons.checkCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <span className="text-base leading-relaxed">{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Examples - SEO Rich Section */}
      {examples && examples.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Icons.lightbulb className="h-6 w-6 text-yellow-600" />
            Example Usage
          </h2>
          <div className="space-y-6">
            {examples.map((example, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">{example.title}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">Input:</h4>
                      <div className="rounded-lg bg-slate-100 p-4 font-mono text-sm dark:bg-slate-800">
                        {example.input}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">Expected Output:</h4>
                      <div className="rounded-lg bg-green-50 p-4 font-mono text-sm dark:bg-green-950/20">
                        {example.expectedOutput}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Prompt Premium CTA Component
 * Subtle premium upgrade prompt for free prompts
 */

interface PromptPremiumCTAProps {
  isPremium?: boolean;
  promptTitle: string;
}

export function PromptPremiumCTA({ isPremium, promptTitle: _promptTitle }: PromptPremiumCTAProps) {
  if (isPremium) {
    return null; // Don't show CTA for premium prompts
  }

  return (
    <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/50 dark:to-pink-950/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
            <Icons.star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold">Unlock Premium Features</h3>
            <p className="text-sm text-muted-foreground">
              Get access to enhanced versions, advanced examples, and premium support for this prompt.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

