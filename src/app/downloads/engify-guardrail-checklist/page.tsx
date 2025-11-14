import { Metadata } from 'next';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Engify Guardrail Quality Checklist',
  description:
    'Review Engify\'s guardrail quality checklist and request a tailored copy for your engineering organization.',
};

const CHECKLIST_ITEMS = [
  'Pre-commit guardrail enforcement is enabled for every repository.',
  'Secrets scanning, SAST, and dependency audits run on every merge request.',
  'Incident reviews capture owner, blast radius, and follow-up guardrail updates.',
  'Prompt / pattern experiments log expected behaviours and regression checkpoints.',
  'Release notes summarize guardrail gaps, mitigations, and next audit window.',
];

export default function GuardrailChecklistDownloadPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Engify Guardrail Quality Checklist</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Use this checklist to validate AI guardrail coverage before every large release. For a
            customized version mapped to your SDLC tools, reach out and we\'ll tailor the steps for your team.
          </p>
        </header>

        <section className="mx-auto max-w-4xl space-y-8 rounded-lg border bg-card p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Core review points</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              {CHECKLIST_ITEMS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-background p-6">
            <h3 className="text-xl font-semibold">Need the full PDF?</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Email us with your stack details and we\'ll send the printable PDF plus companion rollout plan.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <Button asChild>
                <a href="mailto:donlaur@engify.ai?subject=Guardrail%20quality%20checklist">
                  Request the PDF
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/contact">Chat with Engify</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
