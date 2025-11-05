import { Metadata } from 'next';
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
import { RoleSelector } from '@/components/roles/RoleSelector';
import Link from 'next/link';
import { getMongoDb } from '@/lib/db/mongodb';
import { getDbRoleFromSlug, getRoleInfo } from '@/lib/utils/role-mapping';
import { APP_URL } from '@/lib/constants';

interface RoleLandingPageProps {
  slug: string;
  dbRole: string;
}

async function getPromptsByRole(role: string) {
  try {
    const db = await getMongoDb();
    const collection = db.collection('prompts');

    const prompts = await collection
      .find({
        role: role.toLowerCase(),
        isPublic: true,
      })
      .sort({ isFeatured: -1, views: -1, qualityScore: -1 })
      .limit(100)
      .toArray();

    return prompts.map((p) => ({
      id: p.id || p._id?.toString() || '',
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || p.stats?.averageRating || 0,
      ratingCount: p.ratingCount || p.stats?.totalRatings || 0,
      qualityScore: p.qualityScore || 0,
    }));
  } catch (error) {
    console.error('Error fetching prompts by role:', error);
    return [];
  }
}

async function getPatternsByRole(role: string) {
  try {
    const db = await getMongoDb();
    const prompts = await db.collection('prompts').find({ role, isPublic: true }).toArray();
    const patternIds = [...new Set(prompts.map((p) => p.pattern).filter(Boolean))];
    
    if (patternIds.length === 0) return [];
    
    const patterns = await db.collection('patterns')
      .find({ id: { $in: patternIds } })
      .toArray();
    
    return patterns.map((p) => ({
      id: p.id || p._id?.toString() || '',
      name: p.name || p.title,
      description: p.description,
      category: p.category,
    }));
  } catch (error) {
    console.error('Error fetching patterns by role:', error);
    return [];
  }
}

export async function generateRoleMetadata({ slug, dbRole }: RoleLandingPageProps): Promise<Metadata> {
  const roleInfo = getRoleInfo(dbRole);
  const prompts = await getPromptsByRole(dbRole);
  const patterns = await getPatternsByRole(dbRole);

  const title = `${roleInfo.title} Prompts & Patterns - AI Prompt Engineering | Engify.ai`;
  const description = `${roleInfo.description} Browse ${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} and ${patterns.length} pattern${patterns.length !== 1 ? 's' : ''} designed for ${roleInfo.title.toLowerCase()}.`;
  const url = `${APP_URL}/for-${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'prompt engineering',
      'AI prompts',
      roleInfo.title.toLowerCase(),
      'prompt library',
      'AI tools',
      'prompt templates',
      'role-based prompts',
    ],
  };
}

export async function RoleLandingPageContent({ slug, dbRole }: RoleLandingPageProps) {
  const roleInfo = getRoleInfo(dbRole);
  const prompts = await getPromptsByRole(dbRole);
  const patterns = await getPatternsByRole(dbRole);
  
  const featuredPrompts = prompts.filter((p) => p.isFeatured || p.qualityScore >= 8.0).slice(0, 8);
  const topPrompts = prompts.slice(0, 8);
  const displayPrompts = featuredPrompts.length > 0 ? featuredPrompts : topPrompts;

  // Get icon component - map icon names to Icons object keys
  const iconMap: Record<string, keyof typeof Icons> = {
    code: 'code',
    users: 'users',
    target: 'target',
    check: 'check',
    layers: 'layers',
    server: 'server',
    calendar: 'calendar',
    folder: 'folder',
    briefcase: 'briefcase',
    palette: 'palette',
  };
  const iconKey = iconMap[roleInfo.icon] || 'code';
  const IconComponent = Icons[iconKey] || Icons.code;

  return (
    <MainLayout>
      <RoleSelector />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <IconComponent className="mr-2 h-3 w-3" />
              For {roleInfo.title}
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              {roleInfo.title === 'Engineers' && 'Code Faster.'}
              {roleInfo.title === 'Engineering Managers' && 'Lead Faster.'}
              {roleInfo.title === 'Product Managers' && 'Build Better Products.'}
              {roleInfo.title === 'QA Engineers' && 'Test Smarter.'}
              {roleInfo.title === 'Software Architects' && 'Design Better Systems.'}
              {roleInfo.title === 'DevOps & SRE' && 'Deploy with Confidence.'}
              {roleInfo.title === 'Scrum Masters' && 'Facilitate Better Sprints.'}
              {roleInfo.title === 'Product Owners' && 'Prioritize Smarter.'}
              {roleInfo.title === 'Directors & C-Level' && 'Make Strategic Decisions.'}
              {roleInfo.title === 'Designers' && 'Design Beautifully.'}
              {!['Engineers', 'Engineering Managers', 'Product Managers', 'QA Engineers', 'Software Architects', 'DevOps & SRE', 'Scrum Masters', 'Product Owners', 'Directors & C-Level', 'Designers'].includes(roleInfo.title) && 'Level Up Your Skills.'}
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {roleInfo.title === 'Engineers' && 'Ship Better.'}
                {roleInfo.title === 'Engineering Managers' && 'Ship Smarter.'}
                {roleInfo.title === 'Product Managers' && 'Ship Faster.'}
                {roleInfo.title === 'QA Engineers' && 'Ship Quality.'}
                {roleInfo.title === 'Software Architects' && 'Ship Scalable.'}
                {roleInfo.title === 'DevOps & SRE' && 'Ship Reliable.'}
                {roleInfo.title === 'Scrum Masters' && 'Ship Agile.'}
                {roleInfo.title === 'Product Owners' && 'Ship Value.'}
                {roleInfo.title === 'Directors & C-Level' && 'Ship Innovation.'}
                {roleInfo.title === 'Designers' && 'Ship Delight.'}
                {!['Engineers', 'Engineering Managers', 'Product Managers', 'QA Engineers', 'Software Architects', 'DevOps & SRE', 'Scrum Masters', 'Product Owners', 'Directors & C-Level', 'Designers'].includes(roleInfo.title) && 'Ship Success.'}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              {roleInfo.description}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Badge variant="secondary" className="border-white/20 bg-white/10 text-white px-4 py-2">
                {prompts.length} Prompts
              </Badge>
              {patterns.length > 0 && (
                <Badge variant="secondary" className="border-white/20 bg-white/10 text-white px-4 py-2">
                  {patterns.length} Patterns
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Prompts */}
      {displayPrompts.length > 0 && (
        <section className="container py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Featured Prompts</h2>
              <p className="text-xl text-gray-600">
                Top prompts for {roleInfo.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {displayPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="group border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-2xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {prompt.title}
                      </CardTitle>
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
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{prompt.category}</Badge>
                      {prompt.pattern && (
                        <Badge variant="outline">
                          <Icons.zap className="mr-1 h-3 w-3" />
                          {prompt.pattern}
                        </Badge>
                      )}
                      {prompt.qualityScore >= 8.0 && (
                        <Badge variant="default" className="bg-green-600">
                          {prompt.qualityScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/prompts/${prompt.id}`}>
                        View Prompt
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {prompts.length > 8 && (
              <div className="mt-8 text-center">
                <Button size="lg" variant="outline" asChild>
                  <Link href={`/prompts/role/${dbRole}`}>
                    View All {prompts.length} Prompts
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <section className="container py-20 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Recommended Patterns</h2>
              <p className="text-xl text-gray-600">
                Patterns most useful for {roleInfo.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern) => (
                <Card
                  key={pattern.id}
                  className="group border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-2xl"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icons.zap className="h-5 w-5 text-blue-600" />
                      {pattern.name}
                    </CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/patterns/${pattern.id}`}>
                        Learn More
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {displayPrompts.length === 0 && (
        <section className="container py-20">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icons.inbox className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-2xl font-bold">No Prompts Yet</h3>
              <p className="mb-6 text-center text-muted-foreground">
                We're working on creating prompts for {roleInfo.title.toLowerCase()}. Check back soon!
              </p>
              <Button asChild>
                <Link href="/prompts">Browse All Prompts</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="space-y-6 py-12 text-center">
            <IconComponent className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="text-4xl font-bold">Ready to Level Up?</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Join {roleInfo.title.toLowerCase()} using AI to work smarter and ship faster.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                asChild
              >
                <Link href="/signup">
                  Start Free
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/prompts/role/${dbRole}`}>Browse All Prompts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
