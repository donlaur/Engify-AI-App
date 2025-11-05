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
import { ROLE_CONTENT } from '@/lib/data/role-content';
import { fetchPlatformStats } from '@/lib/stats/fetch-platform-stats';

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
  const roleContent = ROLE_CONTENT[dbRole] || null;

  // Enhanced SEO-friendly title and description
  const roleTitle = roleContent?.coreRole.title || roleInfo.title;
  const roleDescription = roleContent?.coreRole.description || roleInfo.description;
  
  const title = `${roleTitle} - AI Prompts, Patterns & Solutions | Engify.ai`;
  const description = roleContent 
    ? `${roleContent.howAIHelps.explanation.substring(0, 150)}... Browse ${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} and ${patterns.length} pattern${patterns.length !== 1 ? 's' : ''} designed for ${roleTitle.toLowerCase()}. Learn how AI prompt engineering transforms ${roleTitle.toLowerCase()} workflows.`
    : `${roleDescription} Browse ${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} and ${patterns.length} pattern${patterns.length !== 1 ? 's' : ''} designed for ${roleInfo.title.toLowerCase()}.`;
  const url = `${APP_URL}/for-${slug}`;

  // Enhanced keywords with role-specific terms
  const keywords = [
    'prompt engineering',
    'AI prompts',
    roleTitle.toLowerCase(),
    'prompt library',
    'AI tools',
    'prompt templates',
    'role-based prompts',
    'AI for ' + roleTitle.toLowerCase(),
    'prompt patterns',
  ];

  if (roleContent) {
    keywords.push(...roleContent.aiPromptPatterns.map(p => p.toLowerCase()));
    keywords.push(...roleContent.commonProblems.map(p => p.title.toLowerCase()));
  }

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
    keywords,
  };
}

export async function RoleLandingPageContent({ slug, dbRole }: RoleLandingPageProps) {
  const roleInfo = getRoleInfo(dbRole);
  const prompts = await getPromptsByRole(dbRole);
  const patterns = await getPatternsByRole(dbRole);
  
  // Get dynamic counts from stats API (not hardcoded)
  let promptCount = prompts.length;
  let patternCount = patterns.length;
  try {
    const stats = await fetchPlatformStats();
    // Use stats for more accurate counts (includes cache)
    promptCount = stats.prompts?.byRole?.[dbRole] || prompts.length;
    // Count unique patterns for this role
    patternCount = patterns.length;
  } catch (error) {
    // Fallback to direct counts if stats fail
    console.warn('Failed to fetch stats, using direct counts:', error);
  }
  
  const featuredPrompts = prompts.filter((p) => p.isFeatured || p.qualityScore >= 8.0).slice(0, 8);
  const topPrompts = prompts.slice(0, 8);
  const displayPrompts = featuredPrompts.length > 0 ? featuredPrompts : topPrompts;

  // Get role content from comprehensive data
  const roleContent = ROLE_CONTENT[dbRole] || null;

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
                {promptCount} Prompts
              </Badge>
              {patternCount > 0 && (
                <Badge variant="secondary" className="border-white/20 bg-white/10 text-white px-4 py-2">
                  {patternCount} Patterns
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

      {/* What the Role Does */}
      {roleContent && (
        <section className="container py-20 bg-white">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">What Does a {roleContent.coreRole.title} Do?</h2>
              <p className="text-xl text-gray-600">
                Understanding the role and its impact
              </p>
            </div>
            
            <Card className="mb-8 border-gray-200 bg-white shadow-sm">
              <CardContent className="pt-6">
                <p className="mb-6 text-lg leading-relaxed text-gray-800">
                  {roleContent.coreRole.description}
                </p>
                
                <div className="mt-6">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">Key Responsibilities:</h3>
                  <ul className="space-y-3">
                    {roleContent.coreRole.keyResponsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Icons.checkCircle className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                        <span className="text-gray-800">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How AI Helps */}
      {roleContent && (
        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <Icons.zap className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h2 className="mb-4 text-4xl font-bold">{roleContent.howAIHelps.headline}</h2>
                <p className="text-xl text-gray-600">
                  How AI prompt engineering transforms this role
                </p>
              </div>

              <Card className="mb-8 border-2 border-blue-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">When You Say "Act as a {roleContent.coreRole.title}"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed text-gray-800">
                    {roleContent.howAIHelps.explanation}
                  </p>

                  <div className="rounded-lg bg-gray-50 p-6 border border-gray-200">
                    <h4 className="mb-3 font-semibold text-gray-900">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {roleContent.howAIHelps.keyBenefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Icons.lightbulb className="mt-1 h-5 w-5 shrink-0 text-yellow-500" />
                          <span className="text-gray-800">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-6 border border-blue-200">
                    <h4 className="mb-2 font-semibold text-blue-900">Real Example:</h4>
                    <p className="text-blue-800 italic">{roleContent.howAIHelps.example}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Daily Tasks */}
      {roleContent && roleContent.dailyTasks.length > 0 && (
        <section className="container py-20 bg-white">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Icons.target className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Daily Tasks</h2>
              <p className="text-xl text-gray-600">
                What {roleContent.coreRole.title.toLowerCase()} do every day
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {roleContent.dailyTasks.map((task, idx) => (
                <Card key={idx} className="border-l-4 border-l-blue-600 bg-white shadow-sm border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        {idx + 1}
                      </span>
                      <p className="text-gray-800">{task}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Common Problems & Solutions */}
      {roleContent && roleContent.commonProblems.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <Icons.users className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h2 className="mb-4 text-4xl font-bold text-gray-900">Common Problems & AI Solutions</h2>
                <p className="text-xl text-gray-600">
                  How AI prompt engineering solves real challenges
                </p>
              </div>

              <div className="space-y-8">
                {roleContent.commonProblems.map((problem, idx) => (
                  <Card key={idx} className="border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="mb-2 text-xl text-gray-900">{problem.title}</CardTitle>
                          <CardDescription className="text-base text-gray-700">
                            {problem.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="shrink-0 bg-gray-100 text-gray-700 border-gray-300">
                          Problem #{idx + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                        <h4 className="mb-2 font-semibold text-blue-900">AI Solution:</h4>
                        <p className="text-blue-800">{problem.aiSolution}</p>
                      </div>

                      {problem.solutionSteps && problem.solutionSteps.length > 0 && (
                        <div>
                          <h4 className="mb-3 font-semibold text-gray-900">Solution Steps:</h4>
                          <ol className="space-y-2">
                            {problem.solutionSteps.map((step, stepIdx) => (
                              <li key={stepIdx} className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                                  {stepIdx + 1}
                                </span>
                                <span className="text-gray-800">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {problem.example && (
                        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                          <h4 className="mb-2 font-semibold text-green-900">Example:</h4>
                          <p className="text-green-800 italic">{problem.example}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Use Cases */}
      {roleContent && roleContent.useCases.length > 0 && (
        <section className="container py-20 bg-white">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Icons.code className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Use Cases</h2>
              <p className="text-xl text-gray-600">
                Real-world applications of AI for {roleContent.coreRole.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {roleContent.useCases.map((useCase, idx) => (
                <Card key={idx} className="group hover:shadow-lg transition-shadow bg-white border-gray-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Icons.checkCircle className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                      <p className="text-gray-800">{useCase}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Real-Life Examples */}
      {roleContent && roleContent.realLifeExamples.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <Icons.lightbulb className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                <h2 className="mb-4 text-4xl font-bold text-gray-900">Real-Life Examples</h2>
                <p className="text-xl text-gray-600">
                  How professionals are using AI to improve their work
                </p>
              </div>

              <div className="space-y-6">
                {roleContent.realLifeExamples.map((example, idx) => (
                  <Card key={idx} className="border-l-4 border-l-purple-600 bg-white shadow-sm border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                          {idx + 1}
                        </div>
                        <p className="text-lg text-gray-800">{example}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI Prompt Patterns */}
      {roleContent && roleContent.aiPromptPatterns.length > 0 && (
        <section className="container py-20 bg-white">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Icons.zap className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
              <h2 className="mb-4 text-4xl font-bold text-gray-900">AI Prompt Patterns</h2>
              <p className="text-xl text-gray-600">
                Specialized prompt patterns for {roleContent.coreRole.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roleContent.aiPromptPatterns.map((pattern, idx) => (
                <Card key={idx} className="border-2 border-yellow-200 hover:border-yellow-400 transition-colors bg-white shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icons.zap className="h-5 w-5 text-yellow-600" />
                      <p className="font-semibold text-gray-900">{pattern}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/patterns">
                  Explore All Patterns
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Prompts */}
      {displayPrompts.length > 0 && (
        <section className="container py-20 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Featured Prompts</h2>
              <p className="text-xl text-gray-600">
                Top prompts for {roleInfo.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {displayPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="group border-2 border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg bg-white shadow-sm"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 text-gray-900">
                        {prompt.title}
                      </CardTitle>
                      {prompt.isFeatured && (
                        <Badge variant="default" className="shrink-0 bg-purple-600">
                          <Icons.star className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 text-gray-600">
                      {prompt.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">{prompt.category}</Badge>
                      {prompt.pattern && (
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          <Icons.zap className="mr-1 h-3 w-3" />
                          {prompt.pattern}
                        </Badge>
                      )}
                      {prompt.qualityScore >= 8.0 && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          {prompt.qualityScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                      <Link href={`/prompts/${prompt.slug || prompt.id}`}>
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
                    View All {promptCount} Prompts
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
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Recommended Patterns</h2>
              <p className="text-xl text-gray-600">
                Patterns most useful for {roleInfo.title.toLowerCase()}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern) => (
                <Card
                  key={pattern.id}
                  className="group border-2 border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg bg-white shadow-sm"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Icons.zap className="h-5 w-5 text-blue-600" />
                      {pattern.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
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
      <section className="container py-20 bg-white">
        <Card className="mx-auto max-w-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
          <CardContent className="space-y-6 py-12 text-center">
            <IconComponent className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900">Ready to Level Up?</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-700">
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
