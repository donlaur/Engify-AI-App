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

// ISR: Regenerate every hour, don't generate at build time
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';

export default function ForCLevelPage() {
  const executiveChallenges = [
    {
      title: 'AI Adoption is Slow Across Teams',
      description:
        'Engineering teams resist AI tools, productivity gains unrealized',
      solution: 'Structured learning paths with measurable ROI tracking',
      promptId: 'cg-001',
      impact: '40% faster adoption',
    },
    {
      title: 'No Clear AI Strategy',
      description:
        'Teams using AI inconsistently, no governance or best practices',
      solution: 'Enterprise-wide prompt patterns and compliance framework',
      promptId: 'cg-012',
      impact: '3x consistency',
    },
    {
      title: 'Competitive Pressure to Ship Faster',
      description:
        'Market demands faster delivery, current velocity insufficient',
      solution: 'AI-augmented development workflows proven to 2x velocity',
      promptId: 'cg-005',
      impact: '2x delivery speed',
    },
    {
      title: 'Talent Retention & Upskilling',
      description:
        'Engineers want AI skills, risk losing talent to AI-forward companies',
      solution: 'Gamified learning system with certifications and achievements',
      promptId: 'cg-008',
      impact: '60% engagement',
    },
  ];

  return (
    <MainLayout>
      <RoleSelector />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.briefcase className="mr-2 h-3 w-3" />
              For C-Level Executives
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Transform Your Organization.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Lead the AI Revolution.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Strategic AI adoption framework for engineering organizations.
              Measurable ROI, enterprise governance, competitive advantage.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link href="/signup">
                  Start Enterprise Trial
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/pricing">View Enterprise Plans</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-12 w-full fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* ROI Metrics */}
      <section className="container py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Measurable Business Impact
            </h2>
            <p className="text-xl text-gray-600">
              Real results from engineering organizations using AI-augmented
              development
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-purple-600">2x</div>
                <div className="mt-2 text-sm text-gray-600">
                  Delivery Velocity
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-purple-600">40%</div>
                <div className="mt-2 text-sm text-gray-600">
                  Faster Adoption
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-purple-600">60%</div>
                <div className="mt-2 text-sm text-gray-600">
                  Team Engagement
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-purple-600">3x</div>
                <div className="mt-2 text-sm text-gray-600">Consistency</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Executive Challenges */}
      <section className="container bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Strategic Challenges, Solved
            </h2>
            <p className="text-xl text-gray-600">
              Address the AI adoption challenges keeping you up at night
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {executiveChallenges.map((item, i) => (
              <Card
                key={i}
                className="group border-2 transition-all duration-300 hover:border-purple-200 hover:shadow-2xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        <Icons.trendingUp className="mr-2 inline h-5 w-5 text-purple-600" />
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-purple-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-purple-900">
                      <Icons.target className="mr-2 inline h-4 w-4" />
                      Strategic Solution:
                    </p>
                    <p className="text-sm text-purple-800">{item.solution}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Impact: {item.impact}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/library/${item.promptId}`}>
                        View Framework
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Enterprise-Grade Platform
            </h2>
            <p className="text-xl text-gray-600">
              Built for scale, security, and governance
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Icons.shield className="mb-4 h-12 w-12 text-purple-600" />
                <CardTitle>Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• SOC 2 Type II compliant</li>
                  <li>• SSO/SAML integration</li>
                  <li>• Role-based access control</li>
                  <li>• Audit logs & monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.users className="mb-4 h-12 w-12 text-purple-600" />
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Unlimited team members</li>
                  <li>• Usage analytics & insights</li>
                  <li>• Custom learning paths</li>
                  <li>• Team leaderboards</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.settings className="mb-4 h-12 w-12 text-purple-600" />
                <CardTitle>Enterprise Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dedicated success manager</li>
                  <li>• 24/7 priority support</li>
                  <li>• Custom integrations</li>
                  <li>• Quarterly business reviews</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="mx-auto max-w-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="space-y-6 py-12 text-center">
            <Icons.briefcase className="mx-auto h-16 w-16 text-purple-600" />
            <h2 className="text-4xl font-bold">
              Ready to Lead the AI Revolution?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Join forward-thinking engineering organizations transforming their
              teams with AI.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                asChild
              >
                <Link href="/signup">
                  Start Enterprise Trial
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
