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

export default function ForPMsPage() {
  return (
    <MainLayout>
      <RoleSelector />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Icons.target className="mr-2 h-3 w-3" />
              For Product Managers
            </Badge>
            <h1 className="mb-4 text-5xl font-bold">AI for PMs</h1>
            <p className="mb-8 text-xl text-gray-600">
              Accelerate product decisions with AI-powered insights
            </p>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Prompt
          </h2>

          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                Product Roadmap Analyzer
              </CardTitle>
              <CardDescription>
                Validate and prioritize your product roadmap with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <p className="text-gray-700">
                  Analyze this product roadmap and provide strategic
                  recommendations:
                </p>
                <p className="mt-2 text-gray-700">
                  **Roadmap:** [paste your roadmap]
                </p>
                <p className="mt-2 text-gray-700">
                  Evaluate:
                  <br />
                  1. Feature prioritization (impact vs effort)
                  <br />
                  2. Market timing and competitive positioning
                  <br />
                  3. Resource allocation and dependencies
                  <br />
                  4. Risk assessment and mitigation strategies
                  <br />
                  5. Success metrics and KPIs
                </p>
                <p className="mt-2 text-gray-700">
                  Provide actionable recommendations for Q1-Q4 planning.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Icons.copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/prompts">
                    <Icons.search className="mr-2 h-4 w-4" />
                    More PM Prompts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
