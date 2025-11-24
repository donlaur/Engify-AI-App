/**
 * WSJF (Weighted Shortest Job First) Landing Page
 *
 * SEO-optimized pillar page targeting high-impression keywords:
 * - wsjf formula, wsjf example, wsjf calculation, wsjf agile, agile wsjf
 * - wsjf prioritization, wsjf in agile, scaled agile wsjf
 *
 * Created: 2025-11-24
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, BookOpen, Target, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { WSJFCalculator } from '@/components/features/WSJFCalculator';

export const metadata: Metadata = {
  title: 'WSJF Calculator & Formula: Weighted Shortest Job First Prioritization Guide',
  description: 'Learn WSJF (Weighted Shortest Job First) with our free calculator. Complete guide with formula, examples, and SAFe implementation. Prioritize your backlog by economic value.',
  keywords: [
    'wsjf',
    'wsjf formula',
    'wsjf calculator',
    'wsjf example',
    'wsjf calculation',
    'wsjf agile',
    'agile wsjf',
    'wsjf prioritization',
    'wsjf in agile',
    'scaled agile wsjf',
    'weighted shortest job first',
    'safe wsjf',
    'wsjf scoring',
    'cost of delay',
    'job size',
    'backlog prioritization',
  ].join(', '),
  openGraph: {
    title: 'WSJF Calculator & Formula Guide | Weighted Shortest Job First',
    description: 'Free WSJF calculator with step-by-step formula guide. Learn how to prioritize your backlog using Weighted Shortest Job First from SAFe.',
    type: 'website',
    url: 'https://www.engify.ai/wsjf',
  },
  alternates: {
    canonical: 'https://www.engify.ai/wsjf',
  },
};

const WSJF_EXAMPLES = [
  {
    name: 'Payment Integration',
    userValue: 8,
    timeCriticality: 9,
    riskReduction: 7,
    jobSize: 5,
    costOfDelay: 24,
    wsjf: 4.8,
  },
  {
    name: 'Dashboard Redesign',
    userValue: 6,
    timeCriticality: 3,
    riskReduction: 2,
    jobSize: 8,
    costOfDelay: 11,
    wsjf: 1.38,
  },
  {
    name: 'Security Patch',
    userValue: 5,
    timeCriticality: 10,
    riskReduction: 10,
    jobSize: 2,
    costOfDelay: 25,
    wsjf: 12.5,
  },
];

export default function WSJFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">SAFe Prioritization Framework</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WSJF: Weighted Shortest Job First
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            The economic prioritization framework used by SAFe teams. Calculate Cost of Delay ÷ Job Size to prioritize by value, not gut feeling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#calculator"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Try the Calculator
            </a>
            <a
              href="#formula"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn the Formula
            </a>
          </div>
        </div>
      </section>

      {/* What is WSJF */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">What is WSJF?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            <strong>WSJF (Weighted Shortest Job First)</strong> is a prioritization model used in SAFe (Scaled Agile Framework) to sequence work based on economic value. It answers: <em>&quot;What should we work on next to maximize value delivery?&quot;</em>
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Unlike story points or simple priority labels, WSJF uses a formula that considers both the <strong>cost of delay</strong> (what happens if we wait) and <strong>job size</strong> (how long it takes). This creates an objective, defensible prioritization.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Why WSJF Matters</h3>
            <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                <span><strong>Economic-based:</strong> Prioritize by value delivered, not opinion</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                <span><strong>Considers urgency:</strong> Time-critical items get weighted appropriately</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                <span><strong>Favors small batches:</strong> Smaller jobs with high value rank higher</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="text-blue-600 mr-3 h-6 w-6 flex-shrink-0 mt-0.5" />
                <span><strong>Reduces bias:</strong> Formula-based decisions reduce HiPPO effect</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Formula */}
      <section id="formula" className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">The WSJF Formula</h2>

            {/* Main Formula */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg mb-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-blue-100 dark:bg-blue-900/30 px-8 py-6 rounded-lg">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-blue-900 dark:text-blue-100">
                    WSJF = Cost of Delay ÷ Job Size
                  </p>
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">Where Cost of Delay is:</p>
                <div className="inline-block bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-lg mt-2">
                  <p className="text-xl font-mono text-gray-900 dark:text-gray-100">
                    CoD = User Value + Time Criticality + Risk Reduction
                  </p>
                </div>
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">User/Business Value</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">How much value does this deliver to users or the business?</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Scale: 1-10 (relative to other items)</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Time Criticality</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">How does value decay over time? Is there a deadline?</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Scale: 1-10 (10 = urgent deadline)</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Risk Reduction / Opportunity</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Does this reduce risk or enable future opportunities?</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Scale: 1-10 (security patches score high)</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Job Size</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">How long will this take? Smaller = higher WSJF score.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Scale: 1-10 (or T-shirt sizes: S=2, M=5, L=8)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">WSJF Calculator</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
            Enter your scores to calculate WSJF. Use relative scoring (1-10) compared to other backlog items.
          </p>
          <WSJFCalculator />
        </div>
      </section>

      {/* Examples */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">WSJF Example: Backlog Prioritization</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
              See how WSJF changes prioritization. Notice how the Security Patch (small + urgent) ranks highest.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">Feature</th>
                    <th className="px-4 py-3 text-center">User Value</th>
                    <th className="px-4 py-3 text-center">Time Critical</th>
                    <th className="px-4 py-3 text-center">Risk Reduction</th>
                    <th className="px-4 py-3 text-center">Cost of Delay</th>
                    <th className="px-4 py-3 text-center">Job Size</th>
                    <th className="px-4 py-3 text-center font-bold">WSJF Score</th>
                  </tr>
                </thead>
                <tbody>
                  {WSJF_EXAMPLES.sort((a, b) => b.wsjf - a.wsjf).map((example, index) => (
                    <tr key={example.name} className={`border-b dark:border-gray-700 ${index === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {example.name}
                        {index === 0 && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Do First</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{example.userValue}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{example.timeCriticality}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{example.riskReduction}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-gray-100">{example.costOfDelay}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{example.jobSize}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">{example.wsjf.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Key Insight</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The <strong>Security Patch</strong> ranks highest despite having lower user value than Payment Integration. Why? It&apos;s <em>small</em> (job size = 2) and <em>urgent</em> (time criticality = 10). WSJF rewards quick wins that reduce risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Time Estimation Warning */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-lg border-2 border-orange-300 dark:border-orange-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              ⚠️ AI Time Estimation Reality Check
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              If you&apos;re using AI to estimate job sizes, be careful: <strong>AI estimates are often 10-20× too high</strong>.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Focused engineering time is typically <strong>5-10% of naive AI estimates</strong>. A task AI says takes &quot;3 days&quot; often takes 4-6 hours of actual focused work.
            </p>
            <Link
              href="/ai-enabled-agile"
              className="inline-flex items-center text-orange-700 dark:text-orange-400 font-semibold hover:underline"
            >
              Learn about AI-Enabled Agile estimation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related Content */}
      <section className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Related Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'AI-Enabled Agile', desc: 'Use AI in sprints and ceremonies', href: '/ai-enabled-agile' },
                { title: 'AI-SDLC 2.0', desc: 'Full lifecycle framework', href: '/ai-sdlc' },
                { title: 'PBVR Workflow', desc: 'Plan-Build-Verify-Release cycles', href: '/pbvr' },
                { title: 'Prompt Engineering', desc: 'Master AI prompting', href: '/learn/prompt-engineering-masterclass' },
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

      {/* FAQ Section - SEO Rich Snippets */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">WSJF FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What does WSJF stand for?',
                a: 'WSJF stands for Weighted Shortest Job First. It\'s a prioritization technique from the Scaled Agile Framework (SAFe) that helps teams decide what to work on next based on economic value.',
              },
              {
                q: 'How do I calculate WSJF?',
                a: 'WSJF = Cost of Delay ÷ Job Size. Cost of Delay is the sum of User Value + Time Criticality + Risk Reduction/Opportunity Enablement. Use relative scoring (1-10) for each factor.',
              },
              {
                q: 'What is Cost of Delay in WSJF?',
                a: 'Cost of Delay (CoD) represents the economic impact of not delivering a feature. It combines three factors: User/Business Value (how much value it delivers), Time Criticality (urgency and deadline pressure), and Risk Reduction (security, compliance, or opportunity enablement).',
              },
              {
                q: 'Is WSJF better than story points?',
                a: 'WSJF and story points serve different purposes. Story points estimate effort; WSJF prioritizes by economic value. Many teams use both: story points for sprint capacity planning, WSJF for backlog prioritization.',
              },
              {
                q: 'How does WSJF work with Agile sprints?',
                a: 'WSJF is typically used during PI Planning and backlog refinement to sequence features. Items with higher WSJF scores are scheduled first. During sprints, teams can still use story points for capacity planning.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Prioritize Smarter?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Explore our AI-enabled Agile patterns and workflows for better prioritization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-enabled-agile"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              AI-Enabled Agile Guide
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/prompts?category=agile"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Browse Agile Prompts
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What does WSJF stand for?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'WSJF stands for Weighted Shortest Job First. It\'s a prioritization technique from the Scaled Agile Framework (SAFe) that helps teams decide what to work on next based on economic value.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I calculate WSJF?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'WSJF = Cost of Delay ÷ Job Size. Cost of Delay is the sum of User Value + Time Criticality + Risk Reduction/Opportunity Enablement. Use relative scoring (1-10) for each factor.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is Cost of Delay in WSJF?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Cost of Delay (CoD) represents the economic impact of not delivering a feature. It combines three factors: User/Business Value (how much value it delivers), Time Criticality (urgency and deadline pressure), and Risk Reduction (security, compliance, or opportunity enablement).',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
