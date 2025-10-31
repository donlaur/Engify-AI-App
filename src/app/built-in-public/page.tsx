'use client';

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
import Link from 'next/link';

export default function BuiltInPublicPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 animate-glow bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />

        <div className="container relative py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 border-white/20 bg-white/10 text-white"
            >
              <Icons.github className="mr-2 h-3 w-3" />
              Built in Public
            </Badge>

            <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white sm:text-6xl">
              From Idea to Production
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                In One Evening
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              1,357 commits. 85K+ lines of TypeScript. 620 passing tests.
              This is what AI-augmented engineering looks like when done right.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100"
                asChild
              >
                <Link
                  href="https://github.com/donlaur/Engify-AI-App"
                  target="_blank"
                >
                  <Icons.github className="mr-2 h-4 w-4" />
                  View Source Code
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/90 text-purple-900 hover:bg-white"
                asChild
              >
                <Link href="/signup">Try It Free</Link>
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

          {/* The Journey */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">The Development Journey</h2>
            <p className="text-xl text-gray-600">
              From prototype to production-ready SaaS
            </p>
            <div className="mt-6 rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
              <p className="text-sm font-medium text-purple-900">
                Built by <span className="font-bold">Donnie Laur</span> - Engineering Leader & AI/SaaS Architect
              </p>
              <p className="mt-2 text-sm text-purple-800">
                Available for <span className="font-semibold">Engineering Manager</span>, <span className="font-semibold">Director of Engineering</span> roles, 
                or consulting on <span className="font-semibold">AI integration into developer workflows</span>
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href="https://linkedin.com/in/donlaur" target="_blank">
                    <Icons.linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="mailto:donlaur@engify.ai">
                    <Icons.mail className="mr-2 h-4 w-4" />
                    donlaur@engify.ai
                  </Link>
                </Button>
                <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/hireme/Donnie-Laur_Manager-Software-Engineering_AI-Enabled.pdf" target="_blank">
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    View Resume
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Hour 1 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white">
                  0
                </div>
                <div>
                  <CardTitle>The Spark: Google AI Studio</CardTitle>
                  <CardDescription>
                    ~30 minutes • Concept validation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Started with Google&apos;s brand new AI Studio (vibe coder) to
                validate the concept before writing any code.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="mb-2 font-semibold text-green-900">
                    ✓ What Worked
                  </p>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Fast validation (no code yet)</li>
                    <li>• Brainstormed features</li>
                    <li>• Generated initial prompts</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-2 font-semibold text-blue-900">
                    💡 Key Insight
                  </p>
                  <p className="text-sm text-blue-800">
                    AI tools perfect for ideation. Validate before building.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hour 2 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white">
                  1
                </div>
                <div>
                  <CardTitle>Foundation</CardTitle>
                  <CardDescription>
                    Hour 1 • Get something running FAST
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Moved to Cursor + Claude. Focus: Ship in minutes, not hours.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  <span>Next.js 15.5.4 (stable, not bleeding edge)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  <span>TypeScript strict mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  <span>
                    67+ prompts in TypeScript files (not DB - intentional!)
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="mb-2 font-semibold text-yellow-900">
                  ⚡ Why TypeScript Files, Not Database?
                </p>
                <p className="text-sm text-yellow-800">
                  Speed over perfection. TS files: 5 min to add 10 prompts.
                  Database: 2 hours for schema + migrations. Ship fast, migrate
                  later if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hour 3 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white">
                  2
                </div>
                <div>
                  <CardTitle>Real Authentication</CardTitle>
                  <CardDescription>
                    Hour 2 • Production-quality, not toy login
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Can&apos;t demo AI features without protecting API keys. This
                had to be production-ready.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">MongoDB Atlas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">NextAuth v5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Bcrypt (12 rounds)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">JWT sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">User profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Onboarding flow</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hour 4 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white">
                  3
                </div>
                <div>
                  <CardTitle>Modern UI</CardTitle>
                  <CardDescription>
                    Hour 3 • Modern, professional design
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                45 minutes for UI that looks like a funded startup.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.palette className="h-5 w-5 text-purple-600" />
                  <span>Dark gradient hero sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.palette className="h-5 w-5 text-purple-600" />
                  <span>Animated glow effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.palette className="h-5 w-5 text-purple-600" />
                  <span>Role-based navigation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hour 5 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white">
                  4
                </div>
                <div>
                  <CardTitle>AI Integration</CardTitle>
                  <CardDescription>
                    Hour 4 • Real APIs, not mocks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                OpenAI + Google AI integration with tracking and analytics.
              </p>
              <div className="overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-sm text-white">
                <div className="text-green-400">
                  {'// Real API call, not a mock'}
                </div>
                <div className="text-blue-400">const</div> response ={' '}
                <div className="text-blue-400">await</div> fetch(
                <div className="text-yellow-400">
                  &apos;/api/v2/ai/execute&apos;
                </div>
                );
              </div>
            </CardContent>
          </Card>

          {/* Testing Strategy */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.alertTriangle className="h-6 w-6 text-orange-600" />
                Why No Tests Yet? (A Teaching Moment)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Notice there are minimal tests in this repo. This is{' '}
                <span className="font-semibold">intentional</span>, not lazy.
                Here&apos;s why:
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-orange-500 bg-white p-4">
                  <p className="mb-2 font-semibold text-orange-900">
                    ❌ Don&apos;t Test First When:
                  </p>
                  <ul className="ml-4 space-y-1 text-sm text-orange-800">
                    <li>• APIs are still changing daily</li>
                    <li>• User feedback hasn&apos;t validated features</li>
                    <li>• You&apos;re in rapid prototyping mode</li>
                    <li>• The code might be thrown away tomorrow</li>
                  </ul>
                </div>
                <div className="rounded-lg border-l-4 border-green-500 bg-white p-4">
                  <p className="mb-2 font-semibold text-green-900">
                    ✅ Add Tests When:
                  </p>
                  <ul className="ml-4 space-y-1 text-sm text-green-800">
                    <li>• APIs stabilize (we&apos;re almost there)</li>
                    <li>• Users validate the features</li>
                    <li>• You move from prototype → product</li>
                    <li>• Bugs start appearing in production</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="mb-2 font-semibold text-blue-900">
                  💡 The Real Lesson:
                </p>
                <p className="text-sm text-blue-800">
                  Writing tests for code you&apos;ll delete is waste. Ship fast,
                  validate with users, THEN add tests when patterns emerge. This
                  is how modern teams move fast without breaking things.
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-2 font-semibold text-green-900">
                  ✅ UPDATE: Testing Journey Complete
                </p>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Day 1-2:</span> Ship features, validate concept (500+ commits)
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Day 3-4:</span> Added 620 unit tests, RBAC, Repository Pattern
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Day 5:</span> Production hardening - observability, security, incident playbooks
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Now:</span> Enterprise-ready SaaS with cost controls & compliance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The REAL Philosophy */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.zap className="h-6 w-6 text-red-600" />
                The Evolution: Rapid → Refined → Production
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold text-red-900">
                1,357 total commits. Not sloppy - strategic. Small, atomic, revertable.
                Each commit ships working code.
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-red-500 bg-white p-4">
                  <p className="mb-2 font-semibold text-red-900">
                    🔥 This is NOT &quot;vibe coding&quot;
                  </p>
                  <p className="text-sm text-red-800">
                    This is: Try → Ship → Learn → Iterate. If something
                    doesn&apos;t work? Delete it and rebuild. Modern development
                    is about velocity AND quality, not one or the other.
                  </p>
                </div>
                <div className="rounded-lg border-l-4 border-orange-500 bg-white p-4">
                  <p className="mb-2 font-semibold text-orange-900">
                    ⚡ Why so many commits?
                  </p>
                  <ul className="ml-4 space-y-1 text-sm text-orange-800">
                    <li>• Each commit is functional and deployable</li>
                    <li>• Small commits = easy to revert if wrong</li>
                    <li>• Commit often = never lose work</li>
                    <li>• Shows thinking process, not just final result</li>
                  </ul>
                </div>
                <div className="rounded-lg border-l-4 border-green-500 bg-white p-4">
                  <p className="mb-2 font-semibold text-green-900">
                    ✅ The Point:
                  </p>
                  <p className="text-sm text-green-800">
                    This is rapid prototyping at its finest: build fast,
                    validate fast, pivot fast. If it works, keep it. If not,
                    delete and start over. No ego, just results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Philosophy */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.lightbulb className="h-6 w-6 text-blue-600" />
                The Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-blue-900">
                    1. AI-Augmented, Not AI-Generated
                  </p>
                  <p className="text-sm text-blue-800">
                    AI suggests, human decides. AI writes boilerplate, human
                    writes logic.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    2. Ship Fast, Iterate Faster
                  </p>
                  <p className="text-sm text-blue-800">
                    TypeScript files → Database (when needed). Mock → Real APIs
                    (when validated).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    3. Production Quality from Day One
                  </p>
                  <p className="text-sm text-blue-800">
                    Real auth, real APIs, real error handling. No shortcuts on
                    fundamentals.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    4. Progressive Enhancement
                  </p>
                  <p className="text-sm text-blue-800">
                    Start simple, add complexity as needed. Pre-commit hooks
                    added when patterns emerged.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tools & Models Evolution */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.settings className="h-6 w-6 text-purple-600" />
                Tools & Models Evolution
              </CardTitle>
              <CardDescription>
                What I actually used, hour by hour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">
                      Google AI Studio (Vibe Coder)
                    </p>
                    <p className="text-sm text-blue-800">
                      Initial concept validation - brand new tool, perfect for
                      ideation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">
                      Windsurf + Claude Sonnet 3.5
                    </p>
                    <p className="text-sm text-purple-800">
                      Today&apos;s main development - 350+ commits with this
                      combo
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-pink-50 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-600 text-sm font-bold text-white">
                    ?
                  </div>
                  <div>
                    <p className="font-semibold text-pink-900">
                      Tomorrow: Maybe Cursor?
                    </p>
                    <p className="text-sm text-pink-800">
                      Not locked in - use whatever works best for the task
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="mb-2 font-semibold text-yellow-900">
                  💡 The Point:
                </p>
                <p className="text-sm text-yellow-800">
                  I&apos;m not married to any tool. Google AI Studio for
                  ideation, Windsurf for today, Cursor tomorrow if it&apos;s
                  better. Use the right tool for the job, not the trendy one.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-600">
                    AI Models Used
                  </p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Claude Sonnet 3.5 (primary)</li>
                    <li>• Google Gemini (testing)</li>
                    <li>• GPT-4 (validation)</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-600">
                    Development Tools
                  </p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Windsurf (today)</li>
                    <li>• Google AI Studio (ideation)</li>
                    <li>• Cursor (maybe tomorrow)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-purple-600">1,357</div>
                <div className="text-sm text-gray-600">Total Commits</div>
                <div className="mt-1 text-xs text-gray-500">
                  Atomic, tested, documented
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-green-600">620</div>
                <div className="text-sm text-gray-600">Unit Tests</div>
                <div className="mt-1 text-xs text-gray-500">
                  100% passing
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600">85K+</div>
                <div className="text-sm text-gray-600">Lines of Code</div>
                <div className="mt-1 text-xs text-gray-500">
                  TypeScript strict mode
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold text-orange-600">115</div>
                <div className="text-sm text-gray-600">Documentation Pages</div>
                <div className="mt-1 text-xs text-gray-500">
                  ADRs, playbooks, guides
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Evolution: Days 1-5 */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icons.trendingUp className="h-6 w-6 text-blue-600" />
                From Prototype to Production SaaS (Days 1-5)
              </CardTitle>
              <CardDescription>
                Rapid iteration → Business patterns → Production hardening
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4">
                  <p className="mb-2 font-bold text-purple-900">Day 1-2: MVP Sprint (Rapid Prototyping)</p>
                  <p className="mb-2 text-sm text-purple-800">500+ commits | TypeScript-first | Real auth & AI from day 1</p>
                  <p className="text-xs text-gray-600">
                    Philosophy: Validate concept fast. TypeScript files for prompts (5min) vs database schema (2hr). 
                    Ship working features, refactor when patterns emerge.
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4">
                  <p className="mb-2 font-bold text-blue-900">Day 3-4: Business Patterns (Scaling Foundation)</p>
                  <p className="mb-2 text-sm text-blue-800">Repository Pattern | AI Provider Factory | Enterprise RBAC</p>
                  <p className="text-xs text-gray-600">
                    Added structure: 91 repository tests, 5-provider abstraction, 6-role RBAC with 13 permissions, 
                    OpsHub admin dashboard. Multi-tenant architecture emerged.
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-green-500 bg-white p-4">
                  <p className="mb-2 font-bold text-green-900">Day 5: Production Hardening (Enterprise Ready)</p>
                  <p className="mb-2 text-sm text-green-800">620 tests | Observability | Security | Cost controls</p>
                  <p className="text-xs text-gray-600">
                    Bulletproofed for customers: Budget enforcement ($0.75-$2.50 per tool), RED metrics (p50/p95/p99), 
                    PII redaction (GDPR/SOC2), rate limiting, replay protection, 3 incident playbooks, 4 ADRs.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <p className="mb-2 font-semibold text-green-900">
                  🎯 The Progression Pattern
                </p>
                <p className="text-sm text-green-800">
                  <span className="font-bold">Week 1</span>: Ship fast, validate concept, get real usage data
                  <br/>
                  <span className="font-bold">Week 2</span>: Add patterns when APIs stabilize, structured testing
                  <br/>
                  <span className="font-bold">Week 3</span>: Production-harden with security, observability, ops maturity
                  <br/>
                  <br/>
                  This isn&apos;t &quot;move fast and break things&quot; - it&apos;s 
                  <span className="font-bold"> move fast, then make it bulletproof</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="space-y-6 py-12 text-center">
              <h3 className="text-3xl font-bold">Interested in This Approach?</h3>
              <p className="mx-auto max-w-2xl text-lg text-gray-700">
                <strong>Donnie Laur</strong> - Available for <strong>Engineering Manager</strong>, 
                <strong> Director of Engineering</strong> roles, or consulting on 
                <strong> AI integration into developer workflows</strong>.
              </p>
              <p className="mx-auto max-w-2xl text-base text-gray-600">
                Every commit documented. Every architectural decision explained with ADRs.
                Production-ready code with 620 tests and operational runbooks.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  asChild
                >
                  <Link
                    href="/hireme/Donnie-Laur_Manager-Software-Engineering_AI-Enabled.pdf"
                    target="_blank"
                  >
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    View Resume
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="https://linkedin.com/in/donlaur" target="_blank">
                    <Icons.linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="mailto:donlaur@engify.ai">
                    <Icons.mail className="mr-2 h-4 w-4" />
                    donlaur@engify.ai
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://github.com/donlaur/Engify-AI-App"
                    target="_blank"
                  >
                    <Icons.github className="mr-2 h-4 w-4" />
                    View Source
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-purple-700 font-medium">
                Or try the live B2B SaaS platform free at <Link href="/signup" className="underline hover:text-purple-900">engify.ai/signup</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
