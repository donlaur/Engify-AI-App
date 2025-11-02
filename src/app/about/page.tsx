import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getStats } from '@/lib/stats-cache';

export default async function AboutPage() {
  const data = await getStats();
  return (
    <MainLayout>
      <div className="container py-16">
        {/* Hero */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Icons.sparkles className="mr-2 h-3 w-3" />
            About Engify.ai
          </Badge>
          <h1 className="mb-4 text-4xl font-bold">
            Empowering Teams to Master AI
          </h1>
          <p className="mb-4 text-xl text-muted-foreground">
            We believe every developer should have the skills to leverage AI
            effectively. Engify.ai makes prompt engineering accessible through
            expert-curated content and hands-on learning.
          </p>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="mb-2 text-lg font-semibold">
                <span className="text-primary">Engify.ai</span> = Engineer +
                Amplify + <span className="text-primary">AI</span>
              </p>
              <p className="text-muted-foreground">
                We amplify engineers <strong>using AI</strong>. When you engify
                your workflow, you&apos;re not just using AI—you&apos;re
                mastering it, engineering better prompts, and multiplying your
                impact through artificial intelligence.
              </p>
              <p className="mt-2 text-sm italic text-muted-foreground">
                The <strong>.ai</strong> isn&apos;t just a domain—it&apos;s our
                mission: amplifying engineers with AI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Transform AI fear into AI fluency. We&apos;re building the
                world&apos;s most comprehensive prompt engineering education
                platform, making it easy for teams to adopt AI confidently and
                effectively.
              </p>
              <p className="text-muted-foreground">
                Through curated prompts, proven patterns, and gamified learning,
                we help developers at all levels—from junior engineers to
                CTOs—master the art and science of communicating with AI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mx-auto mb-16 max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">
                  {data.stats.prompts}+
                </div>
                <p className="text-sm text-muted-foreground">Expert Prompts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">15</div>
                <p className="text-sm text-muted-foreground">Proven Patterns</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">
                  Free Early Access
                </div>
                <p className="text-sm text-muted-foreground">Launch Special</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Icons.sparkles className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Education First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We prioritize teaching over selling. Every feature is designed
                  to help you learn and grow your AI skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600">
                  Engify.ai offers a <strong>freemium SaaS model</strong> with
                  free early access for individuals and paid plans for teams and
                  enterprises. We believe prompt engineering skills should be
                  accessible while building a sustainable business.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.shield className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Quality Over Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every prompt is expert-curated and battle-tested. We focus on
                  what works, not what&apos;s trendy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.zap className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Practical & Actionable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No fluff, no theory-only content. Everything is designed for
                  immediate application in real work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Built with ❤️</h2>
          <p className="mb-8 text-muted-foreground">
            Engify.ai is built by a team of engineers who believe in the
            transformative power of AI when used correctly.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/engify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icons.code className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/engify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icons.share className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
