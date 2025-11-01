'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import Link from 'next/link';

export function EnterpriseSection() {
  const roles = [
    { icon: 'briefcase', title: 'C-Level', subtitle: 'CTO, VP Engineering', users: '15%' },
    { icon: 'users', title: 'Managers', subtitle: 'Engineering Managers', users: '20%' },
    { icon: 'award', title: 'Senior Engineers', subtitle: 'Tech Leads, Architects', users: '30%' },
    { icon: 'code', title: 'Engineers', subtitle: 'Software Developers', users: '25%' },
    { icon: 'target', title: 'Product & Design', subtitle: 'PMs, Designers, QA', users: '10%' },
  ];

  const useCases = [
    {
      title: 'Faster Onboarding',
      metric: '3 months',
      description: 'Reduce onboarding time by 50%',
      icon: 'rocket',
    },
    {
      title: 'Code Review Efficiency',
      metric: '-40%',
      description: 'Less time on code reviews',
      icon: 'checkCircle',
    },
    {
      title: 'Team Productivity',
      metric: '2 hrs/week',
      description: 'Saved per engineer',
      icon: 'trending',
    },
    {
      title: 'Documentation',
      metric: '85%',
      description: 'Coverage increase',
      icon: 'book',
    },
  ];

  const benefits = [
    {
      title: 'Standardization',
      description: '67 curated prompts, 15 patterns for your entire team',
      icon: 'layers',
    },
    {
      title: 'Empathy Mode',
      description: 'Engineers understand PMs, PMs understand engineers',
      icon: 'heart',
    },
    {
      title: 'ROI Tracking',
      description: 'Measure productivity gains and AI tool effectiveness',
      icon: 'barChart',
    },
    {
      title: 'Team Learning',
      description: 'Share prompts, learn patterns, grow together',
      icon: 'users',
    },
  ];

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent || Icons.sparkles;
  };

  return (
    <section className="container py-24 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-2">
          <Icons.briefcase className="mr-2 h-3 w-3" />
          For Teams & Enterprises
        </Badge>
        <h2 className="text-4xl font-bold tracking-tight">
          Transform Your Entire Engineering Team
        </h2>
        <p className="text-xl text-muted-foreground">
          From C-Level to junior engineers, Engify.ai standardizes AI usage across your
          organization. 50-100x ROI through better prompts, faster onboarding, and team empathy.
        </p>
      </div>

      {/* Roles Grid */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8">Built for Every Role</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {roles.map((role) => {
            const Icon = getIcon(role.icon);
            return (
              <Card key={role.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="text-xs">{role.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-xs">
                    {role.users} of users
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8">Proven Results</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {useCases.map((useCase) => {
            const Icon = getIcon(useCase.icon);
            return (
              <Card key={useCase.title} className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <p className="text-3xl font-bold mb-1">{useCase.metric}</p>
                  <p className="font-semibold mb-1">{useCase.title}</p>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8">Why Teams Choose Engify.ai</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit) => {
            const Icon = getIcon(benefit.icon);
            return (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ROI Calculator */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Calculate Your ROI</h3>
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">78x</span>
                  <span className="text-muted-foreground">average return on investment</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">100 engineers × 2 hrs/week saved</span>
                    <span className="font-semibold">$780K/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engify.ai cost</span>
                    <span className="font-semibold">$10K/year</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Net Benefit</span>
                    <span className="font-bold text-green-500">$770K/year</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-background/50 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">50% faster onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">40% less code review time</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">85% documentation coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">35% fewer production bugs</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Ready to Transform Your Team?</h3>
          <p className="text-muted-foreground">
            Start with a 2-week pilot. See results in days, not months.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">
              <Icons.mail className="mr-2 h-4 w-4" />
              Book a Demo
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/prompts">
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              Explore Prompts
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Join 500+ engineering teams using Engify.ai
        </p>
      </div>
    </section>
  );
}
