import { Metadata } from 'next';
import Link from 'next/link';
import { AI_SDLC_CONTENT } from '@/lib/data/ai-sdlc-content';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI-Enabled Software Development Lifecycle (AI-SDLC) | Engify',
  description: 'Complete guide to AI-enabled software development lifecycle. Learn how to run SDLC with AI using PBVR cycles, guardrails, memory, and realistic time estimation. AI-augmented development for engineering teams.',
  keywords: 'AI-enabled software development lifecycle, AI-SDLC, AI-enabled SDLC, AI-augmented software development, AI in SDLC, software development lifecycle with AI, PBVR, AI guardrails, AI memory layer',
  openGraph: {
    title: 'AI-Enabled Software Development Lifecycle (AI-SDLC)',
    description: 'Structured, governed, memory-driven workflow for AI-enabled software development. PBVR cycles, guardrails, and realistic time estimation.',
    type: 'website',
  },
};

export default function AISDLCPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Enabled Software Development Lifecycle (AI-SDLC)
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            The structured, governed, memory-driven workflow for AI-enabled software development. Not "AI writes code"—AI-augmented engineering with human oversight.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={AI_SDLC_CONTENT.hero.cta.primary.href}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {AI_SDLC_CONTENT.hero.cta.primary.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={AI_SDLC_CONTENT.hero.cta.secondary.href}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              {AI_SDLC_CONTENT.hero.cta.secondary.text}
            </Link>
          </div>
        </div>
      </section>

      {/* What AI-SDLC Is */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">What is AI-Enabled SDLC?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            The AI-enabled software development lifecycle (AI-SDLC) is the modernization of software development for an era where AI works alongside engineers—not as a magic black box, but as part of a governed, memory-driven, pattern-first workflow.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
              <h3 className="text-xl font-bold mb-4 text-red-900 dark:text-red-100">Traditional SDLC assumes:</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Linear phases
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Human-only decision making
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Static documentation
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Predictable estimation
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  Siloed process steps
                </li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
              <h3 className="text-xl font-bold mb-4 text-green-900 dark:text-green-100">AI-SDLC assumes:</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Continuous AI assistance
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Persistent memory and context
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Structured prompt patterns
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Team-wide workflows
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Governance and guardrails
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Estimation sanity checks
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  Repeatability and auditability
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              AI-SDLC is NOT "AI writes code." It is structured AI-assisted engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Why Traditional SDLC Breaks */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Traditional Software Development Lifecycle Breaks with AI</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'AI outputs are inconsistent without patterns',
                'Estimates are wildly inaccurate without grounding (10-20x too high)',
                'Prompts leak context without a memory layer',
                'AI-generated code introduces hidden regressions ("AI slop")',
                'Agile ceremonies don\'t account for AI as a participant',
                'Teams have no method to govern how AI interacts with code, requirements, or architecture'
              ].map((issue, index) => (
                <div key={index} className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                  <AlertTriangle className="text-yellow-500 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{issue}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
              The old model assumes a world that no longer exists.
            </p>
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Core Components of AI-Enabled Software Development Lifecycle</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_SDLC_CONTENT.components.map((component, index) => (
              <Link
                key={component.id}
                href={component.href}
                className="group bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{component.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{component.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How to Run SDLC with AI: A Real Project Example</h2>
            <div className="space-y-6">
              {[
                { title: 'Initialization', desc: 'Memory loads → backlog refined → PBVR tasks created' },
                { title: 'Execution', desc: 'Developers run PBVR cycles with guardrails enabled' },
                { title: 'Verification', desc: 'AI-augmented testing + code scanning + regression checks' },
                { title: 'Continuous Improvement', desc: 'Retros → memory updates → guardrails updated → pattern tuning' }
              ].map((step, index) => (
                <div key={index} className="flex items-start bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
              This is a living lifecycle, not a document.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Who Uses AI-Enabled Software Development Lifecycle?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Engineering Managers',
              'Tech Leads',
              'IC Engineers',
              'Product Managers',
              'Founders Shipping Fast',
              'Teams Using AI (But Drowning in Chaos)'
            ].map((audience, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{audience}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xl font-semibold text-gray-900 dark:text-gray-100">
            This is the operating system for AI-enabled software development.
          </p>
        </div>
      </section>

      {/* Related Frameworks */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Related Frameworks</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'AI-Enabled Agile', desc: 'How to run Agile with AI', href: '/ai-enabled-agile' },
                { title: 'PBVR Workflow', desc: 'Core micro-cycle', href: '/pbvr' },
                { title: 'Patterns Library', desc: '18 reusable patterns', href: '/patterns' },
                { title: 'Guardrails', desc: '70+ safety rules', href: '/guardrails' }
              ].map((framework) => (
                <Link
                  key={framework.href}
                  href={framework.href}
                  className="group bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{framework.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{framework.desc}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {AI_SDLC_CONTENT.faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Adopt AI-Enabled Software Development?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Explore patterns, workflows, and guardrails for AI-augmented engineering teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/patterns"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Explore Patterns
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-enabled-agile"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Learn AI-Enabled Agile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
