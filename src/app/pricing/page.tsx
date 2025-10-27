'use client';

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

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Engify',
      features: [
        { text: '67 static prompt templates', included: true },
        { text: '1 custom prompt per week', included: true },
        { text: 'Browse all 15 patterns', included: true },
        { text: '10 workbench executions/day', included: true },
        { text: 'Community support', included: true },
        { text: 'AI-powered optimization', included: false },
        { text: 'Unlimited customization', included: false },
        { text: 'Save custom prompts', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For professionals who want unlimited access',
      features: [
        { text: 'Everything in Free, plus:', included: true, bold: true },
        { text: 'Unlimited custom prompts', included: true },
        { text: 'AI-powered optimization', included: true },
        { text: 'Role-based personalization', included: true },
        { text: 'Pattern mixing & combinations', included: true },
        { text: 'Save unlimited custom prompts', included: true },
        { text: 'Unlimited workbench executions', included: true },
        { text: 'Version history', included: true },
        { text: 'Email support', included: true },
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '$99',
      period: 'per month',
      description: 'For teams that want to collaborate',
      features: [
        { text: 'Everything in Pro, plus:', included: true, bold: true },
        { text: '5 team members included', included: true },
        { text: 'Shared prompt library', included: true },
        { text: 'Team templates', included: true },
        { text: 'Usage analytics', included: true },
        { text: 'Admin dashboard', included: true },
        { text: 'Priority support', included: true },
        { text: 'Onboarding session', included: true },
        { text: 'Custom integrations', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <MainLayout>
      <div className="container py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="mb-4 text-5xl font-bold">Choose Your Plan</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Start free, upgrade when you&apos;re ready. All plans include access
            to our prompt library.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mb-16 grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'scale-105 border-primary shadow-lg'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-8 pt-8 text-center">
                <CardTitle className="mb-2 text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="ml-2 text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Icons.check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <Icons.cancel className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.bold ? 'font-semibold' : ''
                        } ${!feature.included ? 'text-muted-foreground' : ''}`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => {
                    if (plan.name === 'Free') {
                      window.location.href = '/library';
                    } else if (plan.name === 'Team') {
                      window.location.href = 'mailto:sales@engify.ai';
                    } else {
                      // Redirect to signup
                      window.location.href = '/signup';
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I switch plans anytime?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes take effect immediately, and we&apos;ll prorate any
                  charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What&apos;s the difference between static and custom prompts?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Static prompts are pre-written templates you can copy and use.
                  Custom prompts are personalized for your specific role,
                  experience level, and problem using AI optimization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! We offer a 14-day money-back guarantee. If you&apos;re
                  not satisfied with Pro, we&apos;ll refund your payment, no
                  questions asked.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How does the free trial work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Free users get 1 custom prompt per week to try the
                  personalization feature. Pro users get unlimited
                  customizations. No credit card required for free tier.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, Amex) and
                  process payments securely through Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5">
            <CardContent className="py-12">
              <Icons.sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-2xl font-bold">Still have questions?</h3>
              <p className="mb-6 text-muted-foreground">
                Our team is here to help. Get in touch and we&apos;ll respond
                within 24 hours.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="default"
                  onClick={() =>
                    (window.location.href = 'mailto:support@engify.ai')
                  }
                >
                  <Icons.inbox className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/library')}
                >
                  Browse Prompts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
