import { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Hire Donnie Laur - Engineering Director for AI Platforms | Engify.ai',
  description:
    'Recruit Donnie Laur as your next engineering manager, director, or VP to scale AI organizations, operationalize guardrails, and align product, platform, and compliance teams.',
  keywords: [
    'Donnie Laur',
    'engineering director',
    'engineering manager',
    'head of engineering',
    'AI platform leadership',
    'software engineering leadership',
    'vp of engineering',
  ],
};

const RESUME_PATH =
  '/hireme/files/Donnie-Laur-Eng-Leader.pdf';

const LEADERSHIP_PILLARS = [
  {
    icon: Icons.users,
    title: 'Org Architecture & Delivery',
    description:
      'Builds multi-team operating models, planning cadences, and KPI dashboards that keep product, platform, and data groups aligned across regions.',
  },
  {
    icon: Icons.shield,
    title: 'AI & Regulated Delivery',
    description:
      'Leads guardrail strategy end-to-end—delivering compliant AI systems in regulated environments like defense, aviation, and finance.',
  },
  {
    icon: Icons.flag,
    title: 'Leadership Development',
    description:
      'Hires and develops world-class engineering managers and tech leads while reinforcing culture, feedback loops, and career paths.',
  },
];

export default function HireMePage() {
  return (
    <MainLayout>
      <div className="container py-16">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            Hire Donnie Laur as Your Next Engineering Director
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            I build and scale AI-enabled engineering organizations—defining multi-year technical vision, instituting disciplined operations, and ensuring regulated launches meet reliability, security, and compliance standards.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="mailto:donlaur@engify.ai?subject=Hiring%20Donnie%20Laur%20-%20Engineering%20Director">
                <Icons.mail className="h-5 w-5" />
                Start the conversation
              </Link>
            </Button>
            <Link
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Icons.fileText className="h-4 w-4" />
              Download Donnie Laur&apos;s resume (PDF)
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-16 grid gap-6 md:grid-cols-3">
          {LEADERSHIP_PILLARS.map((item) => (
            <Card key={item.title} className="h-full border-primary/20">
              <CardHeader className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-left text-lg font-semibold">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-5xl grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border border-dashed border-primary/40">
            <CardHeader>
              <CardTitle className="text-2xl">
                What is Engify?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Engify.ai is a production B2B SaaS platform that transforms engineering teams into AI power users through structured learning, interactive workbenches, and automated quality guardrails.
              </p>
              <p>
                • Built with Next.js 15, TypeScript strict mode, MongoDB, and multi-provider AI integration. 85K+ lines of code, 620 tests, 261 documentation files, all built in public.
              </p>
              <p>
                • Demonstrates enterprise-grade engineering: RBAC security, audit logging, cost optimization, incident playbooks, ADRs, and systematic quality gates that prevent production issues.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icons.calendar className="h-5 w-5" />
                Executive scope & next steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Targeting VP of Engineering, Director of Engineering, and Head of Platform roles in AI-first or regulated industries.</p>
              <p>• Charter ownership: technical vision, org design, capacity planning, compliance alignment, and cross-functional delivery.</p>
              <p>• Email donlaur@engify.ai with the role scorecard, operating context, and timeline to begin an executive interview loop.</p>
            </CardContent>
          </Card>
        </section>
        <section className="mx-auto mt-16 max-w-5xl rounded-lg border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Executive responsibilities Donnie leads</h2>
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Technical Leadership &amp; Individual Contribution</h3>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>• Lead the technical vision and strategy for AI-first SaaS platforms spanning product, platform, and data domains.</li>
                <li>• Drive adoption of modern software engineering, architecture, DevOps, and guardrail practices across teams.</li>
                <li>• Evaluate emerging product-engineering trends and translate them into pragmatic investments for regulated industries.</li>
                <li>• Guide architecture reviews, integration choices, and scalability plans that keep systems secure and auditable.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Team Leadership &amp; People Management</h3>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>• Build, coach, and mentor distributed engineering organizations across the United States and Europe.</li>
                <li>• Recruit, onboard, and develop diverse leadership benches with clear performance systems and succession plans.</li>
                <li>• Design operating models, career paths, and feedback rituals that reinforce ownership, transparency, and growth.</li>
                <li>• Champion agile collaboration with product, go-to-market, and compliance partners.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Product Delivery</h3>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>• Oversee end-to-end delivery of scalable, reliable SaaS releases that exceed market expectations.</li>
                <li>• Align roadmaps with Product, QA, Operations, and Customer teams to prioritize initiatives and hit launch milestones.</li>
                <li>• Ensure uptime, performance, security, and regulatory compliance commitments are met or exceeded.</li>
                <li>• Balance near-term product bets with foundational platform investments and guardrail automation.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Process, Quality &amp; Continuous Improvement</h3>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>• Optimize workflows, tooling, and capacity planning to enhance velocity and predictability.</li>
                <li>• Instrument KPIs for engineering performance, stability, and technical debt to inform executive decisions.</li>
                <li>• Enforce rigorous code review, testing, documentation, and release management standards.</li>
                <li>• Lead incident response, retrospectives, and continuous-improvement programs that sustain operational excellence.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
