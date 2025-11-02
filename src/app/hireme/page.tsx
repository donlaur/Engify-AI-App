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
    { name: 'Full-Stack Development', icon: Icons.code, level: 'Expert' },
    { name: 'Next.js + React', icon: Icons.zap, level: 'Expert' },
    { name: 'AI/ML Integration', icon: Icons.sparkles, level: 'Advanced' },
    { name: 'Cloud Architecture (AWS)', icon: Icons.cloud, level: 'Advanced' },
    { name: 'MongoDB + PostgreSQL', icon: Icons.database, level: 'Expert' },
    { name: 'TypeScript', icon: Icons.code, level: 'Expert' },
  ];

  const achievements = [
    {
      title: 'Engify.ai',
      description:
        'Built entire platform from scratch in 7 days using AI-augmented development',
      metrics: [
        '76+ prompts',
        '23 patterns',
        'Full auth system',
        'Redis caching',
      ],
    },
    {
      title: 'Enterprise Architecture',
      description:
        'Designed and implemented scalable, secure systems following best practices',
      metrics: ['RBAC', 'Audit logging', 'Rate limiting', 'Multi-tenant ready'],
    },
    {
      title: 'AI-Powered Development',
      description:
        'Expert in using Claude, GPT-4, and modern AI tools to accelerate delivery',
      metrics: [
        '5x faster development',
        'Production quality',
        'Enterprise standards',
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
              Full-Stack Engineer · AI Specialist · Cloud Architect
              <br />
              Building production-ready systems at startup speed
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="default"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <a
                  href="/hireme/Donnie-Laur_Manager-Software-Engineering_AI-Enabled.pdf"
                  download
                >
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
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
        <h2 className="mb-8 text-center text-3xl font-bold">Core Skills</h2>
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

      {/* Built in Public */}
      <section className="container py-16">
        <Card className="border-2 border-purple-200">
          <CardContent className="space-y-4 py-8 text-center">
            <Icons.github className="mx-auto h-12 w-12 text-purple-600" />
            <h3 className="text-2xl font-bold">Building in Public</h3>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              This entire platform (Engify.ai) was built in 7 days using
              AI-augmented development. See the code, follow the commits, learn
              how modern teams ship fast.
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
              Looking for a full-stack engineer who can ship fast, build right,
              and leverage AI tools? Let&apos;s talk.
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
