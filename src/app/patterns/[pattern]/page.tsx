'use client';

import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

// Pattern descriptions and metadata
const PATTERN_INFO: Record<string, { title: string; description: string; icon: string; benefits: string[] }> = {
  'chain-of-thought': {
    title: 'Chain of Thought',
    description: 'Break down complex problems into step-by-step reasoning processes. This pattern helps AI models show their work and arrive at more accurate conclusions.',
    icon: 'link',
    benefits: [
      'Improved reasoning accuracy',
      'Transparent problem-solving',
      'Better handling of complex logic',
      'Easier to debug and refine',
    ],
  },
  'few-shot': {
    title: 'Few-Shot Learning',
    description: 'Provide examples to guide the AI\'s response format and style. This pattern uses 2-5 examples to teach the model what you want.',
    icon: 'book',
    benefits: [
      'Consistent output format',
      'Faster training without fine-tuning',
      'Clear expectations set',
      'Adaptable to various tasks',
    ],
  },
  'zero-shot': {
    title: 'Zero-Shot',
    description: 'Direct instructions without examples. Ideal for simple tasks or when you want maximum creativity.',
    icon: 'zap',
    benefits: [
      'Quick to write',
      'Maximum flexibility',
      'No example bias',
      'Works for novel tasks',
    ],
  },
  'persona': {
    title: 'Persona Pattern',
    description: 'Assign a specific role or expertise to the AI (e.g., "You are a senior software architect"). This shapes the tone, depth, and perspective of responses.',
    icon: 'user',
    benefits: [
      'Domain-specific expertise',
      'Consistent tone and style',
      'Better context awareness',
      'Role-appropriate advice',
    ],
  },
  'craft': {
    title: 'CRAFT Pattern',
    description: 'Context, Role, Action, Format, Target - A structured approach to prompt engineering that ensures comprehensive instructions.',
    icon: 'wrench',
    benefits: [
      'Complete prompt coverage',
      'Reduced ambiguity',
      'Predictable outputs',
      'Easy to template',
    ],
  },
  'kernel': {
    title: 'KERNEL Framework',
    description: 'Knowledge, Expectations, Role, Nuance, Examples, Limits - A comprehensive framework for enterprise-grade prompts.',
    icon: 'layers',
    benefits: [
      'Enterprise-ready structure',
      'Guardrails built-in',
      'Scalable and reusable',
      'Quality assured',
    ],
  },
};

export default function PatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pattern = params.pattern as string;

  // Get all prompts using this pattern
  const allPrompts = getSeedPromptsWithTimestamps();
  const patternPrompts = allPrompts.filter((p) => p.pattern === pattern);
  
  const patternInfo = PATTERN_INFO[pattern] || {
    title: pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Explore prompts using the ${pattern} pattern.`,
    icon: 'zap',
    benefits: ['Effective prompt pattern', 'Proven results', 'Easy to implement'],
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/patterns')} className="mb-6">
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          All Patterns
        </Button>

        {/* Pattern Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              {Icons[patternInfo.icon as keyof typeof Icons] && 
                (() => {
                  const Icon = Icons[patternInfo.icon as keyof typeof Icons];
                  return <Icon className="h-8 w-8 text-primary" />;
                })()
              }
            </div>
            <div>
              <h1 className="text-4xl font-bold">{patternInfo.title}</h1>
              <p className="text-muted-foreground">
                {patternPrompts.length} prompt{patternPrompts.length !== 1 ? 's' : ''} using this pattern
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {patternInfo.description}
          </p>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Benefits</CardTitle>
            <CardDescription>Why use this pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {patternInfo.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Icons.check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Prompts Using This Pattern */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Prompts Using {patternInfo.title}
          </h2>
          
          {patternPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No prompts found for this pattern yet.</p>
                <Button className="mt-4" onClick={() => router.push('/library')}>
                  Browse All Prompts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {patternPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => router.push(`/library/${prompt.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
                      {prompt.isFeatured && (
                        <Badge variant="default" className="shrink-0">
                          <Icons.star className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{prompt.category}</Badge>
                      {prompt.role && <Badge variant="outline">{prompt.role}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

