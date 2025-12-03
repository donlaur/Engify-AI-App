import { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const metadata: Metadata = {
  title: 'Hire Donnie Laur - Engineering Leader & MCP Server Architect | Engify.ai',
  description:
    'Recruit Donnie Laur as your next engineering manager, director, or VP. Built production MCP server with 9 unified tools for AI code quality. Experienced scaling teams (14 direct reports), 95% on-time delivery, and 35% eNPS improvement.',
  keywords: [
    'Donnie Laur',
    'engineering director',
    'engineering manager',
    'MCP server',
    'Model Context Protocol',
    'head of engineering',
    'VP of engineering',
    'AI platform leadership',
    'Claude Code',
    'AI code quality',
    'engineering director hire',
    'engineering leadership recruitment',
    'SaaS engineering leader',
    'platform engineering director',
  ],
  authors: [{ name: 'Donnie Laur', url: `${APP_URL}/authors/donnie-laur` }],
  openGraph: {
    title: 'Hire Donnie Laur - Engineering Leader & MCP Server Architect',
    description:
      'Built production MCP server with 9 unified tools. Experienced scaling teams (14 direct reports), 95% on-time delivery, and 35% eNPS improvement.',
    type: 'website',
    url: `${APP_URL}/hireme`,
    siteName: 'Engify.ai',
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Add OG image if available
        width: 1200,
        height: 630,
        alt: 'Hire Donnie Laur - Engineering Director for AI Platforms',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hire Donnie Laur - Engineering Leader & MCP Server Architect',
    description:
      'Built production MCP server with 9 unified tools. Experienced scaling teams, 95% on-time delivery, 35% eNPS improvement.',
    creator: '@engifyai', // Update with actual Twitter handle if available
  },
  alternates: {
    canonical: `${APP_URL}/hireme`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const RESUME_PATH =
  '/hireme/files/Donnie-Laur-Eng-Leader.pdf';

const LEADERSHIP_PILLARS = [
  {
    icon: Icons.server,
    title: 'MCP Server Architecture',
    description:
      'Built production MCP server with 9 unified tools for code assessment, pattern coaching, and persistent memory—deployed on AWS with Docker, PostgreSQL, Redis, and Qdrant.',
  },
  {
    icon: Icons.users,
    title: 'Team Leadership (14 Reports)',
    description:
      'Led distributed teams achieving 95% on-time delivery, 35% eNPS improvement (6.2→8.4), and 50% faster onboarding through structured processes.',
  },
  {
    icon: Icons.shield,
    title: 'AI Code Quality',
    description:
      'Schema-aware guardrails validating AI-generated code against Drizzle/Prisma schemas, catching hallucinated database fields before runtime errors.',
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
                What is the Engify MCP Server?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Production MCP (Model Context Protocol) server for Claude Code and Cursor with 9 unified tools: code assessment, pattern coaching, persistent memory, schema validation, and more.
              </p>
              <p>
                • Full-stack deployment: AWS EC2, Docker Compose, PostgreSQL, Redis, Qdrant vector database, nginx reverse proxy with SSL. Memory classification (Episodic, Semantic, Procedural) enables cross-session learning.
              </p>
              <p>
                • Adaptive guardrails auto-adjust strictness based on git branch (prototype→production). 50+ curated patterns for TypeScript, Python, React, APIs with feedback loop discovering new patterns from team corrections.
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
