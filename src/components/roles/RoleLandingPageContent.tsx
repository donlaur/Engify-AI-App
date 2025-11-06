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
import { ScrollButton } from '@/components/roles/ScrollButton';
import Link from 'next/link';
import {
  promptRepository,
  patternRepository,
} from '@/lib/db/repositories/ContentService';
import { getRoleInfo } from '@/lib/utils/role-mapping';
import { APP_URL } from '@/lib/constants';
import { ROLE_CONTENT } from '@/lib/data/role-content';
import { fetchPlatformStats } from '@/lib/stats/fetch-platform-stats';
import { FAQSection } from '@/components/features/FAQSection';
import { getRoleFAQs } from '@/lib/data/role-faqs';
import { generateCollectionPageSchema } from '@/lib/seo/metadata';

interface RoleLandingPageProps {
  slug: string;
  dbRole: string;
}

async function getPromptsByRole(role: string) {
  try {
    // Use repository for public prompts by role
    const prompts = await promptRepository.getByRole(role.toLowerCase());

    // Sort and limit in TypeScript (repository returns all matching prompts)
    const sortedPrompts = prompts
      .sort((a, b) => {
        // Sort by featured first, then views, then quality score
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        if ((b.views || 0) !== (a.views || 0)) {
          return (b.views || 0) - (a.views || 0);
        }
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      })
      .slice(0, 100);

    return sortedPrompts.map((p) => ({
      id: p.id || '',
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags || [],
      isFeatured: p.isFeatured || false,
      views: p.views || 0,
      rating: p.rating || 0,
      ratingCount: p.ratingCount || 0,
      qualityScore: p.qualityScore || 0,
    }));
  } catch (error) {
    console.error('Error fetching prompts by role:', error);
    return [];
  }
}

async function getUseCasesFromPrompts(role: string): Promise<string[]> {
  try {
    // Use repository and filter in TypeScript
    const prompts = await promptRepository.getByRole(role.toLowerCase());

    const useCases = new Set<string>();
    prompts.forEach((p) => {
      if (p.useCases && Array.isArray(p.useCases) && p.useCases.length > 0) {
        p.useCases.forEach((uc) => useCases.add(uc));
      }
    });

    return Array.from(useCases).slice(0, 10);
  } catch (error) {
    console.error('Error fetching use cases from prompts:', error);
    return [];
  }
}

async function getRealLifeExamplesFromPrompts(role: string): Promise<string[]> {
  try {
    // Use repository and filter in TypeScript
    const prompts = await promptRepository.getByRole(role.toLowerCase());

    const examples: string[] = [];
    prompts.forEach((p) => {
      if (p.caseStudies && Array.isArray(p.caseStudies)) {
        p.caseStudies.forEach((cs) => {
          if (typeof cs === 'object' && cs !== null) {
            if (
              'outcome' in cs &&
              'metrics' in cs &&
              cs.outcome &&
              cs.metrics
            ) {
              examples.push(`${cs.outcome} ${cs.metrics}`);
            } else if (
              'scenario' in cs &&
              'outcome' in cs &&
              cs.scenario &&
              cs.outcome
            ) {
              examples.push(`${cs.scenario}: ${cs.outcome}`);
            }
          }
        });
      }
    });

    return examples.slice(0, 8);
  } catch (error) {
    console.error('Error fetching real-life examples from prompts:', error);
    return [];
  }
}

async function getDailyTasksFromTags(role: string): Promise<string[]> {
  try {
    // Use repository and filter in TypeScript
    const prompts = await promptRepository.getByRole(role.toLowerCase());

    // Extract task-related tags (common daily task keywords)
    const taskKeywords = new Set<string>();
    const taskPatterns = [
      'planning',
      'review',
      'meeting',
      'documentation',
      'analysis',
      'communication',
      'report',
      'delegation',
      'onboarding',
      'interview',
    ];

    prompts.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          const tagLower = tag.toLowerCase();
          if (taskPatterns.some((pattern) => tagLower.includes(pattern))) {
            taskKeywords.add(tag);
          }
        });
      }
      // Also extract from titles
      if (p.title) {
        const titleLower = p.title.toLowerCase();
        taskPatterns.forEach((pattern) => {
          if (titleLower.includes(pattern)) {
            taskKeywords.add(p.title.substring(0, 60)); // Use title as task hint
          }
        });
      }
    });

    return Array.from(taskKeywords).slice(0, 8);
  } catch (error) {
    console.error('Error fetching daily tasks from tags:', error);
    return [];
  }
}

async function getPatternsByRole(role: string) {
  try {
    // Use repository to get prompts by role
    const prompts = await promptRepository.getByRole(role);
    const patternIds = [
      ...new Set(prompts.map((p) => p.pattern).filter(Boolean)),
    ];

    if (patternIds.length === 0) return [];

    // Use pattern repository to get patterns by IDs
    const allPatterns = await patternRepository.getAll();
    const patterns = allPatterns.filter((p) => patternIds.includes(p.id));

    return patterns.map((p) => ({
      id: p.id || '',
      name: p.name,
      description: p.description || '',
      category: p.category,
    }));
  } catch (error) {
    console.error('Error fetching patterns by role:', error);
    return [];
  }
}

export async function generateRoleMetadata({
  slug,
  dbRole,
}: RoleLandingPageProps): Promise<Metadata> {
  const roleInfo = getRoleInfo(dbRole);
  const prompts = await getPromptsByRole(dbRole);
  const patterns = await getPatternsByRole(dbRole);
  const roleContent = ROLE_CONTENT[dbRole] || null;

  // Enhanced SEO-friendly title and description
  const roleTitle = roleContent?.coreRole.title || roleInfo.title;
  const roleDescription =
    roleContent?.coreRole.description || roleInfo.description;

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
    keywords.push(...roleContent.aiPromptPatterns.map((p) => p.toLowerCase()));
    keywords.push(
      ...roleContent.commonProblems.map((p) => p.title.toLowerCase())
    );
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

export async function RoleLandingPageContent({
  slug,
  dbRole,
}: RoleLandingPageProps) {
  const roleInfo = getRoleInfo(dbRole);
  const prompts = await getPromptsByRole(dbRole);
  const patterns = await getPatternsByRole(dbRole);

  // Get dynamic content from DB
  const [dbUseCases, dbRealLifeExamples, dbDailyTasks] = await Promise.all([
    getUseCasesFromPrompts(dbRole),
    getRealLifeExamplesFromPrompts(dbRole),
    getDailyTasksFromTags(dbRole),
  ]);

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

  const featuredPrompts = prompts
    .filter((p) => p.isFeatured || p.qualityScore >= 8.0)
    .slice(0, 8);
  const topPrompts = prompts.slice(0, 8);
  const displayPrompts =
    featuredPrompts.length > 0 ? featuredPrompts : topPrompts;

  // Generate CollectionPage schema for SEO
  const collectionUrl = `${APP_URL}/for-${slug}`;
  const collectionItems = [
    ...prompts.slice(0, 20).map((p) => ({
      name: p.title,
      url: `${APP_URL}/prompts/${p.slug || p.id}`,
      description: p.description,
    })),
    ...patterns.slice(0, 10).map((p) => ({
      name: p.name,
      url: `${APP_URL}/patterns/${p.id}`,
      description: p.description,
    })),
  ];
  const collectionSchema = generateCollectionPageSchema(
    `AI Prompts and Patterns for ${roleInfo.title}`,
    `A curated collection of ${promptCount} AI prompts and ${patternCount} prompt engineering patterns designed specifically for ${roleInfo.title.toLowerCase()}.`,
    promptCount + patternCount,
    collectionItems,
    collectionUrl
  );

  // Get role content from comprehensive data (SEO fallback)
  const roleContent = ROLE_CONTENT[dbRole] || null;

  // Debug: Log role content lookup
  if (
    !roleContent &&
    ['engineering-director', 'product-director', 'cto'].includes(dbRole)
  ) {
    console.warn(`[RoleLandingPage] Missing roleContent for dbRole: ${dbRole}`);
    console.warn(
      `[RoleLandingPage] Available keys:`,
      Object.keys(ROLE_CONTENT)
    );
  }

  // Hybrid approach: Use DB data when available, fallback to hardcoded for SEO
  const useCases =
    dbUseCases.length > 0 ? dbUseCases : roleContent?.useCases || [];
  const realLifeExamples =
    dbRealLifeExamples.length > 0
      ? dbRealLifeExamples
      : roleContent?.realLifeExamples || [];
  const dailyTasks =
    dbDailyTasks.length > 0 ? dbDailyTasks : roleContent?.dailyTasks || [];
  const aiPromptPatterns =
    patterns.length > 0
      ? patterns
          .map((p) => p.name)
          .filter((name): name is string => Boolean(name))
      : roleContent?.aiPromptPatterns || [];

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
    <>
      {/* CollectionPage Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
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
                {roleInfo.title === 'Product Managers' &&
                  'Build Better Products.'}
                {roleInfo.title === 'QA Engineers' && 'Test Smarter.'}
                {roleInfo.title === 'Software Architects' &&
                  'Design Better Systems.'}
                {roleInfo.title === 'DevOps & SRE' && 'Deploy with Confidence.'}
                {roleInfo.title === 'Scrum Masters' &&
                  'Facilitate Better Sprints.'}
                {roleInfo.title === 'Product Owners' && 'Prioritize Smarter.'}
                {roleInfo.title === 'Directors & C-Level' &&
                  'Make Strategic Decisions.'}
                {roleInfo.title === 'Designers' && 'Design Beautifully.'}
                {roleInfo.title === 'Engineering Directors' &&
                  'Lead Engineering Organizations.'}
                {roleInfo.title === 'Product Directors' &&
                  'Drive Product Strategy.'}
                {roleInfo.title === 'VP of Engineering' &&
                  'Scale Engineering at Scale.'}
                {roleInfo.title === 'VP of Product' && 'Scale Product Vision.'}
                {roleInfo.title === 'CTO' && 'Set Technical Strategy.'}
                {![
                  'Engineers',
                  'Engineering Managers',
                  'Product Managers',
                  'QA Engineers',
                  'Software Architects',
                  'DevOps & SRE',
                  'Scrum Masters',
                  'Product Owners',
                  'Directors & C-Level',
                  'Designers',
                  'Engineering Directors',
                  'Product Directors',
                  'VP of Engineering',
                  'VP of Product',
                  'CTO',
                ].includes(roleInfo.title ?? '') && 'Level Up Your Skills.'}
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
                  {roleInfo.title === 'Directors & C-Level' &&
                    'Ship Innovation.'}
                  {roleInfo.title === 'Designers' && 'Ship Delight.'}
                  {roleInfo.title === 'Engineering Directors' &&
                    'Ship Excellence.'}
                  {roleInfo.title === 'Product Directors' && 'Ship Impact.'}
                  {roleInfo.title === 'VP of Engineering' && 'Ship Scale.'}
                  {roleInfo.title === 'VP of Product' && 'Ship Strategy.'}
                  {roleInfo.title === 'CTO' && 'Ship Vision.'}
                  {![
                    'Engineers',
                    'Engineering Managers',
                    'Product Managers',
                    'QA Engineers',
                    'Software Architects',
                    'DevOps & SRE',
                    'Scrum Masters',
                    'Product Owners',
                    'Directors & C-Level',
                    'Designers',
                    'Engineering Directors',
                    'Product Directors',
                    'VP of Engineering',
                    'VP of Product',
                    'CTO',
                  ].includes(roleInfo.title ?? '') && 'Ship Success.'}
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-xl text-gray-300">
                {roleInfo.description}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <ScrollButton
                  targetId="featured-prompts"
                  label={`${promptCount} Prompts`}
                  className="cursor-pointer rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/20 hover:shadow-lg"
                />
                {patternCount > 0 && (
                  <ScrollButton
                    targetId="patterns-section"
                    label={`${patternCount} Patterns`}
                    className="cursor-pointer rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/20 hover:shadow-lg"
                  />
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

        {/* Role Overview & AI Benefits - Combined Section */}
        {roleContent && (
          <section className="container bg-white dark:bg-gray-900 py-10">
            <div className="mx-auto max-w-5xl">
              {/* What the Role Does - Compact */}
              <div className="mb-8">
                <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  What Does a {roleContent.coreRole.title} Do?
                </h2>
                <p className="mb-4 text-base text-gray-700 dark:text-gray-300">
                  {roleContent.coreRole.description}
                </p>

                <div className="grid gap-2 md:grid-cols-2">
                  {roleContent.coreRole.keyResponsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Icons.checkCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How AI Helps - Compact */}
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Icons.zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                      {roleContent.howAIHelps.headline}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                    {roleContent.howAIHelps.explanation}
                  </p>

                  <div className="grid gap-2 md:grid-cols-2">
                    {roleContent.howAIHelps.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Icons.lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-950/50 p-3">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Example:</strong> {roleContent.howAIHelps.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Common Problems & Solutions - Compact */}
        {roleContent && roleContent.commonProblems.length > 0 && (
          <section className="container bg-white dark:bg-gray-900 py-10">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Common Problems & AI Solutions
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  How AI prompt engineering solves real challenges
                </p>
              </div>

              <div className="space-y-4">
                {roleContent.commonProblems.map((problem, idx) => (
                  <Card
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="mb-1 text-lg text-gray-900 dark:text-gray-100">
                            {problem.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
                            {problem.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-3">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Solution:</strong> {problem.aiSolution}
                        </p>
                      </div>
                      {problem.example && (
                        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 p-3">
                          <p className="text-sm text-green-800 dark:text-green-100">
                            <strong>Example:</strong> {problem.example}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Daily Tasks & Use Cases - Combined */}
        {(dailyTasks.length > 0 || useCases.length > 0) && (
          <section className="container bg-gray-50 dark:bg-gray-900 py-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Key Activities
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  What {roleInfo.title.toLowerCase()} do and how AI helps
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dailyTasks.map((task, idx) => (
                  <Card
                    key={`task-${idx}`}
                    className="border-l-2 border-gray-200 dark:border-gray-700 border-l-blue-600 dark:border-l-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-semibold text-blue-600 dark:text-blue-300">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{task}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {useCases.map((useCase, idx) => (
                  <Card
                    key={`usecase-${idx}`}
                    className="border-l-2 border-gray-200 dark:border-gray-700 border-l-green-600 dark:border-l-green-500 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-2">
                        <Icons.checkCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-gray-800 dark:text-gray-200">{useCase}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Real-Life Examples & Patterns - Combined */}
        {(realLifeExamples.length > 0 || aiPromptPatterns.length > 0) && (
          <section className="container bg-gray-50 dark:bg-gray-900 py-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Success Stories & Patterns
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  How professionals use AI and patterns that work
                </p>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {realLifeExamples.map((example, idx) => (
                  <Card
                    key={`example-${idx}`}
                    className="border-l-2 border-gray-200 dark:border-gray-700 border-l-purple-600 dark:border-l-purple-500 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-xs font-bold text-purple-600 dark:text-purple-300">
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                          {example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {aiPromptPatterns.map((pattern, idx) => (
                  <Card
                    key={`pattern-${idx}`}
                    className="border-l-2 border-gray-200 dark:border-gray-700 border-l-yellow-500 dark:border-l-yellow-500 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Icons.zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {pattern}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Prompts */}
        {displayPrompts.length > 0 && (
          <section
            id="featured-prompts"
            className="container scroll-mt-20 bg-white dark:bg-gray-900 py-10"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Featured Prompts
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Top prompts for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {displayPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="group border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                          {prompt.title}
                        </CardTitle>
                        {prompt.isFeatured && (
                          <Badge
                            variant="default"
                            className="shrink-0 bg-purple-600"
                          >
                            <Icons.star className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-400">
                        {prompt.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="border-gray-300 bg-gray-100 text-gray-700"
                        >
                          {prompt.category}
                        </Badge>
                        {prompt.pattern && (
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                          >
                            <Icons.zap className="mr-1 h-3 w-3" />
                            {prompt.pattern}
                          </Badge>
                        )}
                        {prompt.qualityScore >= 8.0 && (
                          <Badge
                            variant="default"
                            className="bg-green-600 text-white"
                          >
                            {prompt.qualityScore.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={`/prompts/${prompt.slug ?? prompt.id}`}>
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
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                    asChild
                  >
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
          <section
            id="patterns-section"
            className="container scroll-mt-20 bg-gray-50 dark:bg-gray-900 py-10"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Recommended Patterns
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Patterns most useful for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patterns.map((pattern) => (
                  <Card
                    key={pattern.id}
                    className="group border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Icons.zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {pattern.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {pattern.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                        asChild
                      >
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
                  We&apos;re working on creating prompts for{' '}
                  {roleInfo.title.toLowerCase()}. Check back soon!
                </p>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white"
                  asChild
                >
                  <Link href="/prompts">Browse All Prompts</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* FAQ Section */}
        <section className="container bg-white dark:bg-gray-900 py-10">
          <div className="mx-auto max-w-4xl">
            <FAQSection
              faqs={getRoleFAQs(dbRole)}
              title={`Frequently Asked Questions for ${roleInfo.title}`}
              description={`Common questions about how ${roleInfo.title.toLowerCase()} use AI prompts and patterns to improve their work.`}
              currentUrl={`${APP_URL}/for-${slug}`}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="container bg-white dark:bg-gray-900 py-10">
          <Card className="mx-auto max-w-3xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 shadow-lg">
            <CardContent className="space-y-4 py-8 text-center">
              <IconComponent className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Ready to Level Up?
              </h2>
              <p className="mx-auto max-w-2xl text-base text-gray-700 dark:text-gray-300">
                Join {roleInfo.title.toLowerCase()} using AI to work smarter and
                ship faster.
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
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                  asChild
                >
                  <Link href={`/prompts/role/${dbRole}`}>
                    Browse All Prompts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </MainLayout>
    </>
  );
}
