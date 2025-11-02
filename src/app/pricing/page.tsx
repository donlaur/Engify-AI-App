import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

/**
 * Beta Access Page
 * Simple page explaining free beta access and looking for engineering team partners
 */
export default function PricingPage() {
  return (
    <MainLayout>
      <div className="container py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge
            variant="secondary"
            className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Icons.sparkles className="mr-2 h-3 w-3" />
            Beta Access
          </Badge>
          <h1 className="mb-4 text-5xl font-bold">
            Free Beta Access for Engineering Teams
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Engify.ai is currently in beta. We&apos;re looking for engineering
            departments to partner with as we build the future of AI-powered
            engineering workflows.
          </p>
        </div>

        {/* Main Card */}
        <div className="mx-auto mb-16 max-w-4xl">
          <Card className="border-2 border-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Icons.sparkles className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl">
                Everything Free During Beta
              </CardTitle>
              <CardDescription className="text-lg">
                Full access to all features while we build together
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Features Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">130+ Expert Prompts</p>
                    <p className="text-sm text-muted-foreground">
                      Battle-tested prompts for engineering teams
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">Proven Patterns</p>
                    <p className="text-sm text-muted-foreground">
                      Learn frameworks that work in production
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">AI Workbench</p>
                    <p className="text-sm text-muted-foreground">
                      Interactive tools for prompt engineering
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">Learning Resources</p>
                    <p className="text-sm text-muted-foreground">
                      Guides for teams adopting AI workflows
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">Built in Public</p>
                    <p className="text-sm text-muted-foreground">
                      Watch development happen in real-time
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icons.check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="font-semibold">Direct Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Help shape the product direction
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/prompts">
                    <Icons.sparkles className="mr-2 h-4 w-4" />
                    Browse Prompt Library
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href="/signup">Request Beta Access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What We're Looking For */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Ideal Beta Partners
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Icons.users className="mb-2 h-8 w-8 text-purple-600" />
                <CardTitle className="text-xl">Engineering Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Teams of 5-50 engineers looking to adopt AI workflows and
                  improve productivity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.target className="mb-2 h-8 w-8 text-purple-600" />
                <CardTitle className="text-xl">Early Adopters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organizations already using AI tools (Copilot, ChatGPT,
                  Claude) who want better workflows
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icons.messageSquare className="mb-2 h-8 w-8 text-purple-600" />
                <CardTitle className="text-xl">Active Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Teams willing to share feedback and help us understand what
                  engineering leaders need
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mx-auto max-w-2xl text-center">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="py-12">
              <Icons.mail className="mx-auto mb-4 h-12 w-12 text-purple-600" />
              <h3 className="mb-2 text-2xl font-bold">
                Want to Partner with Us?
              </h3>
              <p className="mb-6 text-muted-foreground">
                Reach out to discuss how Engify.ai can help your engineering
                team adopt AI workflows effectively.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="default" size="lg" asChild>
                  <a href="mailto:donlaur@engify.ai">
                    <Icons.mail className="mr-2 h-4 w-4" />
                    Email Me
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/built-in-public">
                    <Icons.github className="mr-2 h-4 w-4" />
                    See How It&apos;s Built
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
