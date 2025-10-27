import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-16">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Icons.sparkles className="mr-2 h-3 w-3" />
            About Engify.ai
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Empowering Teams to Master AI
          </h1>
          <p className="text-xl text-muted-foreground">
            We believe every developer should have the skills to leverage AI effectively. 
            Engify.ai makes prompt engineering accessible through expert-curated content 
            and hands-on learning.
          </p>
        </div>

        {/* Mission */}
        <div className="mx-auto max-w-4xl mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Transform AI fear into AI fluency. We&apos;re building the world&apos;s most comprehensive 
                prompt engineering education platform, making it easy for teams to adopt AI 
                confidently and effectively.
              </p>
              <p className="text-muted-foreground">
                Through curated prompts, proven patterns, and gamified learning, we help developers 
                at all levels—from junior engineers to CTOs—master the art and science of 
                communicating with AI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mx-auto max-w-5xl mb-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">67+</div>
                <p className="text-sm text-muted-foreground">Expert Prompts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">15</div>
                <p className="text-sm text-muted-foreground">Proven Patterns</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Free Forever</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mx-auto max-w-4xl mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Icons.sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Education First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We prioritize teaching over selling. Every feature is designed to help you 
                  learn and grow your AI skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built by developers, for developers. We listen to our community and evolve 
                  based on real needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quality Over Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every prompt is expert-curated and battle-tested. We focus on what works, 
                  not what's trendy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Practical & Actionable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No fluff, no theory-only content. Everything is designed for immediate 
                  application in real work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Built with ❤️</h2>
          <p className="text-muted-foreground mb-8">
            Engify.ai is built by a team of engineers who believe in the transformative 
            power of AI when used correctly. 
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/engify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icons.code className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/engify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icons.share className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
