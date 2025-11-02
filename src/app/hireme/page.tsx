import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

/**
 * Hire Me Page
 * Showcases Donnie Laur's work, skills, and availability
 */
export default function HireMePage() {
  const skills = [
    { name: 'Engineering Leadership', icon: Icons.users, level: 'Expert' },
    {
      name: 'AI Transformation & Training',
      icon: Icons.sparkles,
      level: 'Expert',
    },
    { name: 'Full-Stack Development', icon: Icons.code, level: 'Expert' },
    { name: 'Team Building & Coaching', icon: Icons.target, level: 'Expert' },
    {
      name: 'Modern Tech Stack (Next.js, TypeScript)',
      icon: Icons.zap,
      level: 'Expert',
    },
    {
      name: 'Process & Workflow Design',
      icon: Icons.checkCircle,
      level: 'Expert',
    },
  ];

  const achievements = [
    {
      title: 'AI Enablement & Team Training',
      description:
        'Led engineering teams through early-stage AI adoption, running workshops and implementing copilots (ChatGPT, Claude, Cursor, Windsurf) to boost productivity, code quality, and developer satisfaction',
      metrics: [
        'AI copilot adoption',
        'Custom GPT development',
        'Hands-on workshops',
        'Workflow integration',
      ],
    },
    {
      title: 'Hands-On Engineering Leadership',
      description:
        'Built Engify.ai from scratch in 7 days using Git Worktrees, parallel AI agents, and systematic daily planning. Each day had focused goals (Day 5: Infrastructure, Day 6: Content Quality, Day 7: QA/Polish) with ADRs, test coverage, and red-hat reviews documented in real-time',
      metrics: [
        '7-day build (Nov 2025)',
        'Multi-agent workflow',
        'Git worktree strategy',
        '12+ ADRs documented',
      ],
    },
    {
      title: 'Modern Tech Stack Expertise',
      description:
        'Expert in Next.js, TypeScript, React, Node.js, MongoDB, and AWS. Built enterprise-grade systems with RBAC, audit logging, multi-tenant architecture, and comprehensive testing',
      metrics: [
        'Next.js 15 + TypeScript',
        'Enterprise architecture',
        'Security & compliance',
        'Scalable systems',
      ],
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 py-24">
        <div className="absolute inset-0 -z-10 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/10 text-white"
            >
              <Icons.briefcase className="mr-2 h-3 w-3" />
              Open to Opportunities
            </Badge>

            <h1 className="text-5xl font-bold text-white sm:text-6xl">
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent">
                Donnie Laur
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-200">
              Engineering Manager · AI Enablement Coach · Hands-On Technical
              Leader
              <br />
              Building teams that leverage AI to ship production-ready systems
              at startup speed
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="default"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link
                  href="/hireme/Donnie-Laur_Manager-Software-Engineering_AI-Enabled.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download Resume
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link
                  href="https://linkedin.com/in/donlaur"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.linkedin className="mr-2 h-4 w-4" />
                  LinkedIn Profile
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <a href="mailto:donlaur@engify.ai">
                  <Icons.mail className="mr-2 h-4 w-4" />
                  Contact Me
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Leadership Competencies
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <Card key={skill.name} className="border-2">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {skill.level}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Work */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Recent Achievements
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement) => (
              <Card key={achievement.title}>
                <CardHeader>
                  <CardTitle>{achievement.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {achievement.metrics.map((metric) => (
                      <Badge key={metric} variant="secondary">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process & Methodology */}
      <section className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Development Process & Methodology
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.gitBranch className="h-5 w-5 text-purple-600" />
                Git Worktree Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Used separate worktrees for parallel development, enabling
                multiple AI agents to work simultaneously without merge
                conflicts:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Main worktree: Core feature development</li>
                <li>DRY improvements: Refactoring branch</li>
                <li>QA/Polish: Day 7 quality improvements</li>
                <li>Atomic commits with instant push strategy</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.sparkles className="h-5 w-5 text-purple-600" />
                Multi-Model AI Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Leveraged different AI models for specialized tasks throughout
                the build:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Claude Sonnet 4.5: Core development & architecture</li>
                <li>GPT-4: Code review & optimization</li>
                <li>Multiple agents in parallel worktrees</li>
                <li>Red-hat reviews for quality assurance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.fileText className="h-5 w-5 text-purple-600" />
                Daily Planning & ADRs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Each day had focused goals with comprehensive documentation:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Day 5:</strong> Infrastructure (AWS, messaging, RAG)
                </li>
                <li>
                  <strong>Day 6:</strong> Content Quality (MongoDB migration)
                </li>
                <li>
                  <strong>Day 7:</strong> QA & Polish (trust signals, UI/UX)
                </li>
                <li>12+ ADRs documenting architectural decisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.checkCircle className="h-5 w-5 text-purple-600" />
                Quality Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Enterprise-grade quality checks and documentation from day one:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Pre-commit hooks (enterprise compliance, security)</li>
                <li>Pattern audits & systematic bug fixing</li>
                <li>Red-hat reviews for trust/security issues</li>
                <li>85% test coverage with real integration tests</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Built in Public */}
      <section className="container pb-16">
        <Card className="border-2 border-purple-200">
          <CardContent className="space-y-4 py-8 text-center">
            <Icons.github className="mx-auto h-12 w-12 text-purple-600" />
            <h3 className="text-2xl font-bold">
              Building in Public - Full Transparency
            </h3>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Every commit, every decision, every challenge documented. See the
              complete 7-day journey from idea to production, including all
              planning docs, ADRs, and lessons learned. This isn&apos;t a portfolio
              piece—it&apos;s a real business built with enterprise standards.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button variant="default" asChild>
                <Link href="/built-in-public">
                  <Icons.code className="mr-2 h-4 w-4" />
                  See How It&apos;s Built
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href="https://github.com/donlaur/Engify-AI-App"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.github className="mr-2 h-4 w-4" />
                  View Source Code
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="space-y-6 py-12 text-center">
            <h2 className="text-3xl font-bold">
              Let&apos;s Build Something Amazing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Looking for a hands-on Engineering Manager who can build teams,
              teach AI workflows, and ship production-ready systems? Let&apos;s
              talk.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <a href="mailto:donlaur@engify.ai">
                  <Icons.mail className="mr-2 h-5 w-5" />
                  Email Me
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link
                  href="https://linkedin.com/in/donlaur"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.linkedin className="mr-2 h-5 w-5" />
                  Connect on LinkedIn
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
