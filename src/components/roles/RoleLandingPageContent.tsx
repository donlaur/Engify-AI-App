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
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import { loadPatternsFromJson } from '@/lib/patterns/load-patterns-from-json';
import { getRoleInfo } from '@/lib/utils/role-mapping';
import { APP_URL } from '@/lib/constants';
import { ROLE_CONTENT } from '@/lib/data/role-content';
import { fetchPlatformStats } from '@/lib/stats/fetch-platform-stats';
import { FAQSection } from '@/components/features/FAQSection';
import { getRoleFAQs } from '@/lib/data/role-faqs';
import { generateCollectionPageSchema } from '@/lib/seo/metadata';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import { loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import { loadRecommendationsFromJson } from '@/lib/workflows/load-recommendations-from-json';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import type { PainPoint } from '@/lib/workflows/pain-point-schema';
import type { Recommendation } from '@/lib/workflows/recommendation-schema';

interface RoleLandingPageProps {
  slug: string;
  dbRole: string;
}

async function getPromptsByRole(role: string) {
  try {
    // Load from static JSON (fast, no MongoDB at build time)
    const allPrompts = await loadPromptsFromJson();
    const prompts = allPrompts.filter(
      (p) => p.role?.toLowerCase() === role.toLowerCase() && p.isPublic
    );

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
        // qualityScore is an object with 'overall' property
        const aScore = typeof a.qualityScore === 'object' ? a.qualityScore?.overall || 0 : 0;
        const bScore = typeof b.qualityScore === 'object' ? b.qualityScore?.overall || 0 : 0;
        return bScore - aScore;
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
      qualityScore: typeof p.qualityScore === 'object' ? p.qualityScore?.overall || 0 : 0,
    }));
  } catch (error) {
    console.error('Error fetching prompts by role:', error);
    return [];
  }
}

async function getUseCasesFromPrompts(role: string): Promise<string[]> {
  try {
    // Load from static JSON
    const allPrompts = await loadPromptsFromJson();
    const prompts = allPrompts.filter(
      (p) => p.role?.toLowerCase() === role.toLowerCase()
    );

    const useCases = new Set<string>();
    prompts.forEach((p) => {
      if (p.useCases && Array.isArray(p.useCases) && p.useCases.length > 0) {
        p.useCases.forEach((uc: string) => useCases.add(uc));
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
    // Load from static JSON
    const allPrompts = await loadPromptsFromJson();
    const prompts = allPrompts.filter(
      (p) => p.role?.toLowerCase() === role.toLowerCase()
    );

    const examples: string[] = [];
    prompts.forEach((p) => {
      if (p.caseStudies && Array.isArray(p.caseStudies)) {
        p.caseStudies.forEach((cs: unknown) => {
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
    // Load from static JSON
    const allPrompts = await loadPromptsFromJson();
    const prompts = allPrompts.filter(
      (p) => p.role?.toLowerCase() === role.toLowerCase()
    );

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
        p.tags.forEach((tag: string) => {
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
    // Load from static JSON
    const allPrompts = await loadPromptsFromJson();
    const prompts = allPrompts.filter(
      (p) => p.role?.toLowerCase() === role.toLowerCase()
    );
    
    const patternNames = [
      ...new Set(prompts.map((p) => p.pattern).filter(Boolean)),
    ] as string[];

    if (patternNames.length === 0) return [];

    // Load patterns from static JSON
    const allPatterns = await loadPatternsFromJson();
    const patterns = allPatterns.filter((p) => 
      p.id && patternNames.includes(p.id)
    );

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

/**
 * Map DB role to workflow audience
 */
function getWorkflowAudienceFromDbRole(dbRole: string): string[] {
  const mapping: Record<string, string[]> = {
    'engineer': ['engineers'],
    'engineering-manager': ['engineering-managers'],
    'product-manager': ['product-managers'],
    'engineering-director': ['engineering-managers', 'executives'],
    'product-director': ['product-managers', 'executives'],
    'vp-engineering': ['executives', 'engineering-managers'],
    'vp-product': ['executives', 'product-managers'],
    'cto': ['executives', 'engineering-managers'],
    'director': ['executives'],
    'c-level': ['executives'],
    'qa': ['qa'],
    'architect': ['architects'],
    'devops-sre': ['platform'],
    'security': ['security'],
  };
  
  return mapping[dbRole] || ['engineers'];
}

async function getWorkflowsByRole(dbRole: string): Promise<Workflow[]> {
  try {
    const allWorkflows = await loadWorkflowsFromJson();
    const audiences = getWorkflowAudienceFromDbRole(dbRole);
    
    const workflows = allWorkflows.filter(
      (w) => w.status === 'published' && 
      w.audience.some((aud) => audiences.includes(aud))
    );
    
    return workflows.slice(0, 12); // Limit to top 12
  } catch (error) {
    console.error('Error fetching workflows by role:', error);
    return [];
  }
}

async function getPainPointsByRole(workflows: Workflow[]): Promise<PainPoint[]> {
  try {
    const allPainPoints = await loadPainPointsFromJson();
    const workflowIds = new Set(workflows.map((w) => `${w.category}/${w.slug}`));
    
    // Find pain points that are addressed by workflows for this role
    const relevantPainPoints = allPainPoints.filter((pp) => {
      if (pp.status !== 'published') return false;
      
      // Check if any related workflows match
      const hasRelatedWorkflow = pp.relatedWorkflows.some((wfId) => workflowIds.has(wfId));
      const hasSolutionWorkflow = pp.solutionWorkflows.some((sw) => workflowIds.has(sw.workflowId));
      
      return hasRelatedWorkflow || hasSolutionWorkflow;
    });
    
    return relevantPainPoints.slice(0, 8); // Limit to top 8
  } catch (error) {
    console.error('Error fetching pain points by role:', error);
    return [];
  }
}

async function getRecommendationsByRole(dbRole: string): Promise<Recommendation[]> {
  try {
    const allRecommendations = await loadRecommendationsFromJson();
    const audiences = getWorkflowAudienceFromDbRole(dbRole);
    
    const recommendations = allRecommendations.filter(
      (r) => r.status === 'published' && 
      r.audience.some((aud) => audiences.includes(aud))
    );
    
    return recommendations.slice(0, 8); // Limit to top 8
  } catch (error) {
    console.error('Error fetching recommendations by role:', error);
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
  const workflows = await getWorkflowsByRole(dbRole);
  const painPoints = await getPainPointsByRole(workflows);
  const recommendations = await getRecommendationsByRole(dbRole);

  // Get dynamic content from DB
  const [dbUseCases, dbRealLifeExamples, dbDailyTasks] = await Promise.all([
    getUseCasesFromPrompts(dbRole),
    getRealLifeExamplesFromPrompts(dbRole),
    getDailyTasksFromTags(dbRole),
  ]);

  // Get dynamic counts from stats API (not hardcoded)
  // Skip MongoDB during build time - use Redis cache or static fallback
  let promptCount = prompts.length;
  let patternCount = patterns.length;
  try {
    const stats = await fetchPlatformStats(true); // skipMongoDB = true for builds
    // Use stats for more accurate counts (includes cache)
    promptCount = stats.prompts?.byRole?.[dbRole] || prompts.length;
    // Count unique patterns for this role
    patternCount = patterns.length;
  } catch (error) {
    // Fallback to direct counts if stats fail
    console.warn('Failed to fetch stats, using direct counts:', error);
  }

  const featuredPrompts = prompts
    .filter((p) => {
      const score = typeof p.qualityScore === 'number' ? p.qualityScore : 0;
      return p.isFeatured || score >= 8.0;
    })
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

        {/* Hero - Modern Gradient Design */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-500 via-blue-600 via-purple-600 to-teal-500 dark:from-red-600 dark:via-blue-700 dark:via-purple-700 dark:to-teal-600">
          <div className="absolute inset-0 -z-10 bg-black/20" />

          <div className="container relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 text-center">
              <Badge
                variant="secondary"
                className="mb-4 border-white/30 bg-white/15 backdrop-blur-sm text-white shadow-lg"
              >
                <IconComponent className="mr-2 h-3.5 w-3.5" />
                For {roleInfo.title}
              </Badge>

              <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {(() => {
                  const knownRoles = [
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
                  ];
                  const title = roleInfo.title ?? '';
                  const isKnownRole = knownRoles.includes(title);
                  
                  if (title === 'Engineers') return 'Code Faster.';
                  if (title === 'Engineering Managers') return 'Lead Faster.';
                  if (title === 'Product Managers') return 'Build Better Products.';
                  if (title === 'QA Engineers') return 'Test Smarter.';
                  if (title === 'Software Architects') return 'Design Better Systems.';
                  if (title === 'DevOps & SRE') return 'Deploy with Confidence.';
                  if (title === 'Scrum Masters') return 'Facilitate Better Sprints.';
                  if (title === 'Product Owners') return 'Prioritize Smarter.';
                  if (title === 'Directors & C-Level') return 'Make Strategic Decisions.';
                  if (title === 'Designers') return 'Design Beautifully.';
                  if (title === 'Engineering Directors') return 'Lead Engineering Organizations.';
                  if (title === 'Product Directors') return 'Drive Product Strategy.';
                  if (title === 'VP of Engineering') return 'Scale Engineering at Scale.';
                  if (title === 'VP of Product') return 'Scale Product Vision.';
                  if (title === 'CTO') return 'Set Technical Strategy.';
                  if (!isKnownRole) return 'Level Up Your Skills.';
                  return '';
                })()}
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {(() => {
                    const knownRoles = [
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
                    ];
                    const title = roleInfo.title ?? '';
                    const isKnownRole = knownRoles.includes(title);
                    
                    if (title === 'Engineers') return 'Ship Better.';
                    if (title === 'Engineering Managers') return 'Ship Smarter.';
                    if (title === 'Product Managers') return 'Ship Faster.';
                    if (title === 'QA Engineers') return 'Ship Quality.';
                    if (title === 'Software Architects') return 'Ship Scalable.';
                    if (title === 'DevOps & SRE') return 'Ship Reliable.';
                    if (title === 'Scrum Masters') return 'Ship Agile.';
                    if (title === 'Product Owners') return 'Ship Value.';
                    if (title === 'Directors & C-Level') return 'Ship Innovation.';
                    if (title === 'Designers') return 'Ship Delight.';
                    if (title === 'Engineering Directors') return 'Ship Excellence.';
                    if (title === 'Product Directors') return 'Ship Impact.';
                    if (title === 'VP of Engineering') return 'Ship Scale.';
                    if (title === 'VP of Product') return 'Ship Strategy.';
                    if (title === 'CTO') return 'Ship Vision.';
                    if (!isKnownRole) return 'Ship Success.';
                    return '';
                  })()}
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed">
                {roleInfo.description}
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <ScrollButton
                  targetId="featured-prompts"
                  label={`${promptCount} Prompts`}
                  className="cursor-pointer rounded-lg border-2 border-white/30 bg-white/15 backdrop-blur-sm px-6 py-3 text-base font-semibold text-white transition-all hover:border-white/50 hover:bg-white/25 hover:shadow-xl"
                />
                {patternCount > 0 && (
                  <ScrollButton
                    targetId="patterns-section"
                    label={`${patternCount} Patterns`}
                    className="cursor-pointer rounded-lg border-2 border-white/30 bg-white/15 backdrop-blur-sm px-6 py-3 text-base font-semibold text-white transition-all hover:border-white/50 hover:bg-white/25 hover:shadow-xl"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white dark:fill-gray-900">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </section>

        {/* Role Overview & AI Benefits - Combined Section */}
        {roleContent && (
          <section className="container bg-white dark:bg-gray-900 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              {/* What the Role Does - Enhanced */}
              <div className="mb-10 md:mb-12">
                <h2 className="mb-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  What Does a {roleContent.coreRole.title} Do?
                </h2>
                <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {roleContent.coreRole.description}
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  {roleContent.coreRole.keyResponsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 transition-colors hover:border-blue-300 dark:hover:border-blue-600">
                      <Icons.checkCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="text-base text-gray-800 dark:text-gray-200">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How AI Helps - Enhanced */}
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2">
                      <Icons.zap className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100">
                      {roleContent.howAIHelps.headline}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                    {roleContent.howAIHelps.explanation}
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    {roleContent.howAIHelps.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800/50 p-3">
                        <Icons.lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-base text-gray-800 dark:text-gray-200">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-950/50 p-4 shadow-sm">
                    <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">
                      <strong className="font-semibold">Example:</strong> {roleContent.howAIHelps.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Common Problems & Solutions - Enhanced */}
        {roleContent && roleContent.commonProblems.length > 0 && (
          <section className="container bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Common Problems & AI Solutions
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  How AI prompt engineering solves real challenges
                </p>
              </div>

              <div className="space-y-6">
                {roleContent.commonProblems.map((problem, idx) => (
                  <Card
                    key={idx}
                    className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="mb-2 text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                            {problem.title}
                          </CardTitle>
                          <CardDescription className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            {problem.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 p-4 shadow-sm">
                        <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">
                          <strong className="font-semibold">Solution:</strong> {problem.aiSolution}
                        </p>
                      </div>
                      {problem.example && (
                        <div className="rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/50 p-4 shadow-sm">
                          <p className="text-base leading-relaxed text-green-800 dark:text-green-100">
                            <strong className="font-semibold">Example:</strong> {problem.example}
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
          <section className="container bg-white dark:bg-gray-900 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Key Activities
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  What {roleInfo.title.toLowerCase()} do and how AI helps
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dailyTasks.map((task, idx) => (
                  <Card
                    key={`task-${idx}`}
                    className="border-l-4 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg hover:border-blue-700 dark:hover:border-blue-400"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-600 dark:text-blue-300">
                          {idx + 1}
                        </span>
                        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{task}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {useCases.map((useCase, idx) => (
                  <Card
                    key={`usecase-${idx}`}
                    className="border-l-4 border-green-600 dark:border-green-500 bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg hover:border-green-700 dark:hover:border-green-400"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-3">
                        <Icons.checkCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{useCase}</p>
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
          <section className="container bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Success Stories & Patterns
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  How professionals use AI and patterns that work
                </p>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {realLifeExamples.map((example, idx) => (
                  <Card
                    key={`example-${idx}`}
                    className="border-l-4 border-purple-600 dark:border-purple-500 bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg hover:border-purple-700 dark:hover:border-purple-400"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-xs font-bold text-purple-600 dark:text-purple-300">
                          {idx + 1}
                        </span>
                        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                          {example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {aiPromptPatterns.map((pattern, idx) => (
                  <Card
                    key={`pattern-${idx}`}
                    className="border-l-4 border-yellow-500 dark:border-yellow-500 bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg hover:border-yellow-600 dark:hover:border-yellow-400"
                  >
                    <CardContent className="pb-4 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 p-1.5">
                          <Icons.zap className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
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
            className="container scroll-mt-20 bg-white dark:bg-gray-900 py-12 md:py-16"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Featured Prompts
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Top prompts for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {displayPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="group border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-y-1"
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
                        {typeof prompt.qualityScore === 'number' && prompt.qualityScore >= 8.0 && (
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
            className="container scroll-mt-20 bg-gray-50 dark:bg-gray-950 py-12 md:py-16"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Recommended Patterns
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Patterns most useful for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patterns.map((pattern) => (
                  <Card
                    key={pattern.id}
                    className="group border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-y-1"
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

        {/* Workflows Section */}
        {workflows.length > 0 && (
          <section className="container scroll-mt-20 bg-white dark:bg-gray-900 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Guardrail Workflows
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Industry-proven workflows for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                  <Card
                    key={`${workflow.category}/${workflow.slug}`}
                    className="group border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                          {workflow.title}
                        </CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          {workflow.category}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-400">
                        {workflow.problemStatement}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {workflow.audience.slice(0, 3).map((aud) => (
                          <Badge key={aud} variant="outline" className="text-xs">
                            {aud}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={`/workflows/${workflow.category}/${workflow.slug}`}>
                          View Workflow
                          <Icons.arrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {workflows.length >= 12 && (
                <div className="mt-8 text-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                    asChild
                  >
                    <Link href={`/workflows?audience=${getWorkflowAudienceFromDbRole(dbRole)[0] || 'engineers'}`}>
                      View All Workflows
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pain Points Section */}
        {painPoints.length > 0 && (
          <section className="container scroll-mt-20 bg-gray-50 dark:bg-gray-950 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Common Pain Points
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Issues {roleInfo.title.toLowerCase()} face and how to prevent them
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {painPoints.map((painPoint) => (
                  <Card
                    key={painPoint.id}
                    className="group border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:border-red-400 dark:hover:border-red-600 hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="mb-2 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                        Pain Point
                      </div>
                      <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                        {painPoint.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {painPoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-red-300 bg-white font-medium text-gray-900 hover:border-red-400 hover:bg-red-50 dark:bg-gray-800"
                        asChild
                      >
                        <Link href={`/workflows/pain-points/${painPoint.slug}`}>
                          Learn More
                          <Icons.arrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/workflows/pain-points">
                    View All Pain Points
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="container scroll-mt-20 bg-white dark:bg-gray-900 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Best Practices & Recommendations
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Actionable guidance for {roleInfo.title.toLowerCase()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {recommendations.map((recommendation) => (
                  <Card
                    key={recommendation.id}
                    className="group border-2 border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:border-green-400 dark:hover:border-green-600 hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="mb-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                        Recommendation
                      </div>
                      <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                        {recommendation.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                        {recommendation.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-green-300 bg-white font-medium text-gray-900 hover:border-green-400 hover:bg-green-50 dark:bg-gray-800"
                        asChild
                      >
                        <Link href={`/workflows/recommendations/${recommendation.slug}`}>
                          Learn More
                          <Icons.arrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-400 bg-white font-medium text-gray-900 hover:border-gray-500 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/workflows/recommendations">
                    View All Recommendations
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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

        {/* CTA - Enhanced */}
        <section className="container bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-purple-950/50 py-12 md:py-16">
          <Card className="mx-auto max-w-3xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 shadow-xl">
            <CardContent className="space-y-6 py-10 md:py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Ready to Level Up?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Join {roleInfo.title.toLowerCase()} using AI to work smarter and
                ship faster.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  asChild
                >
                  <Link href="/signup">
                    Start Free
                    <Icons.arrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-400 bg-white text-lg font-semibold text-gray-900 hover:border-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
                  asChild
                >
                  <Link href={`/prompts/role/${dbRole}`}>
                    Browse All Prompts
                    <Icons.arrowRight className="ml-2 h-5 w-5" />
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
