import { Metadata } from 'next';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Engify Guardrail Beta Waitlist',
  description:
    'Apply for Engify\'s guardrail automation beta and partner with our team to productionize AI workflow guardrails.',
};

export default function GuardrailWaitlistPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Partner with Engify on Guardrail Automation</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We\'re onboarding a limited cohort of engineering teams to co-build Engify\'s automated guardrail engine.
            Share a few details about your current guardrail challenges and we\'ll reach out within 24 hours.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <section className="space-y-8">
            <div className="rounded-lg border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Who we\'re looking for</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li>• Teams already enforcing manual guardrails and ready to automate.</li>
                <li>• Engineering leaders accountable for AI quality, compliance, or reliability.</li>
                <li>• Builders shipping MCP agents, copilots, or automated workflows.</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">What\'s included</h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li>• Direct access to Engify\'s guardrail automation playbooks.</li>
                <li>• Guided rollout plan tailored to your stack and SDLC cadence.</li>
                <li>• Early access to the memory + guardrail enforcement MCP server.</li>
              </ul>
            </div>

            <div className="rounded-lg border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Prefer email?</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Send your guardrail context directly to{' '}
                <a className="text-primary hover:underline" href="mailto:donlaur@engify.ai?subject=Guardrail%20beta%20waitlist">
                  donlaur@engify.ai
                </a>{' '}
                and include which systems you need to protect.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <a href="mailto:donlaur@engify.ai?subject=Guardrail%20beta%20waitlist">
                  Email Engify
                </a>
              </Button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Apply to the cohort</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Tell us about your current guardrail coverage, incident history, and the workflows you\'d like to automate.
            </p>
            <ContactForm />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
