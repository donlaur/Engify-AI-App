import { Metadata } from 'next';
import Link from 'next/link';
import { AI_ENABLED_AGILE_CONTENT } from '@/lib/data/ai-sdlc-content';
import { ArrowRight, CheckCircle2, Calendar, Users, Target, BarChart3, MessageSquare } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'AI-Enabled Agile: How to Run Agile Software Development with AI | Engify',
  description: 'Complete guide to AI in Agile software development. Learn how Agile works with AI for sprint planning, standups, retros, and backlog grooming. AI-augmented Agile with PBVR cycles and guardrails.',
  keywords: 'AI-enabled Agile, AI in Agile software development, AI-augmented Agile, how Agile works with AI, AI sprint planning, AI scrum, AI ceremonies, AI backlog grooming, AI retrospectives',
  openGraph: {
    title: 'AI-Enabled Agile: How to Run Agile Software Development with AI',
    description: 'Structured, governed AI participation in Agile ceremonies. PBVR cycles, guardrails, and realistic time estimation for Agile teams.',
    type: 'website',
  },
};

const ceremonyIcons: Record<string, React.ElementType> = {
  'sprint-planning': Calendar,
  'backlog-grooming': Target,
  'daily-standup': MessageSquare,
  'sprint-review': BarChart3,
  'retrospective': Users,
};

export default function AIEnabledAgilePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Part of AI-Enabled Software Development Lifecycle</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Enabled Agile: How to Run Agile Software Development with AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Agile practice modernized for AI-augmented development. Structured, governed AI participation in your sprint rituals with PBVR cycles and guardrails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={AI_ENABLED_AGILE_CONTENT.hero.cta.primary.href}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {AI_ENABLED_AGILE_CONTENT.hero.cta.primary.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={AI_ENABLED_AGILE_CONTENT.hero.cta.secondary.href}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              {AI_ENABLED_AGILE_CONTENT.hero.cta.secondary.text}
            </Link>
          </div>
        </div>
      </section>

      {/* What AI-Enabled Agile Is */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">What is AI in Agile Software Development?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            AI-enabled Agile is Agile practice modernized for environments where AI is a real participant in the development process. It's how Agile works with AI in real engineering teams.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            It's not new jargon.
          </p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
            It's simply: How does a real Agile team use AI responsibly and effectively, every day, without hallucinations or chaos?
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">The Core Insight</h3>
            <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                Agile wasn't designed for AI
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                AI without structure creates chaos
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                AI-Enabled Agile sits in the middle—structured, governed AI participation in your sprint rituals
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI in Each Ceremony */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How to Use AI in Agile Ceremonies</h2>
            <div className="space-y-8">
              {AI_ENABLED_AGILE_CONTENT.ceremonies.map((ceremony) => {
                const Icon = ceremonyIcons[ceremony.id] || Calendar;
                return (
                  <div key={ceremony.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{ceremony.name}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{ceremony.description}</p>
                      </div>
                    </div>

                    <div className="ml-16">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Practices:</h4>
                      <ul className="space-y-2 mb-6">
                        {ceremony.practices.map((practice, index) => (
                          <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="text-green-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                            {practice}
                          </li>
                        ))}
                      </ul>

                      {(ceremony.relatedPrompts.length > 0 || ceremony.relatedWorkflows.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {ceremony.relatedPrompts.map((slug) => (
                            <Link
                              key={slug}
                              href={`/prompts/${slug}`}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              View Pattern →
                            </Link>
                          ))}
                          {ceremony.relatedWorkflows.map((slug) => (
                            <Link
                              key={slug}
                              href={`/workflows/${slug}`}
                              className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              View Workflow →
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How AI Changes Sprint Rhythm */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">How AI-Augmented Agile Changes Sprint Velocity</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Traditional Sprint</h3>
              <p className="text-gray-600 dark:text-gray-400">Predictable but slow</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">AI Sprint (Unstructured)</h3>
              <p className="text-gray-600 dark:text-gray-400">High velocity but chaotic</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-lg border-2 border-green-300 dark:border-green-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">AI-Enabled Agile Brings:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Faster iteration',
                'Smaller PBVR cycles',
                'Clearer documentation',
                'Grounded estimates (not 10-20x inflated)',
                'Reduced meeting load',
                'Async-first communication',
                'Guardrails to prevent "AI-induced tech debt"'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="text-green-600 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ceremony Cheat Sheet */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Ceremony Cheat Sheet</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Planning', flow: 'Clarify → Decompose → Estimate → Prioritize → PBVR → Commit' },
                { title: 'Grooming', flow: 'Clean → Merge → Rewrite → Score → Tag → Ready-for-PBVR' },
                { title: 'Standup', flow: 'AI → async summary → cross-team alignment → memory update' },
                { title: 'Review', flow: 'Demo script → change summary → acceptance → next PBVR seeds' },
                { title: 'Retro', flow: 'Patterns → failures → experiments → guardrail updates' }
              ].map((ceremony, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                  <h3 className="text-xl font-bold mb-3">{ceremony.title}</h3>
                  <p className="text-white/90 font-mono text-sm">{ceremony.flow}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Who AI-Enabled Agile Is For</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Scrum Masters',
              'Product Managers',
              'Engineering Managers',
              'Tech Leads',
              'IC Engineers',
              'Startup Founders'
            ].map((audience, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{audience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Content */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Related Content</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'AI-SDLC 2.0', desc: 'The broader lifecycle', href: '/ai-sdlc' },
                { title: 'WSJF Prioritization', desc: 'Economic scoring', href: '/prompts/wsjf-prioritization-agile' },
                { title: 'PBVR Workflow', desc: 'Core cycle', href: '/pbvr' },
                { title: 'Time Estimation Reality Check', desc: '5-10% rule', href: '/pain-points/ai-time-estimation-inaccuracy' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
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
            {AI_ENABLED_AGILE_CONTENT.faqs.map((faq, index) => (
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
            Ready to Adopt AI-Enabled Agile?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start with patterns and workflows designed for AI-augmented Agile teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/patterns?tag=agile"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              View Agile Patterns
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/ai-sdlc"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Learn AI-SDLC 2.0
            </Link>
          </div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
}
