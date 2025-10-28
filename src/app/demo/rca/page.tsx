'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RCAData {
  incidentTitle: string;
  dateTime: string;
  severity: string;
  impactedServices: string;
  detectionMethod: string;
  timeline: string;
  rootCause: string;
  contributingFactors: string;
  resolution: string;
  preventionSteps: string;
}

const SEVERITY_LEVELS = [
  'SEV-1 (Critical)',
  'SEV-2 (High)',
  'SEV-3 (Medium)',
  'SEV-4 (Low)',
];

export default function RCABuilderPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RCAData>({
    incidentTitle: '',
    dateTime: '',
    severity: '',
    impactedServices: '',
    detectionMethod: '',
    timeline: '',
    rootCause: '',
    contributingFactors: '',
    resolution: '',
    preventionSteps: '',
  });
  const [generatedReport, setGeneratedReport] = useState('');

  const updateData = (field: keyof RCAData, value: string) => {
    setData({ ...data, [field]: value });
  };

  const generateReport = () => {
    const report = `# Incident Postmortem: ${data.incidentTitle}

## Executive Summary
**Date/Time:** ${data.dateTime}
**Severity:** ${data.severity}
**Impacted Services:** ${data.impactedServices}
**Detection Method:** ${data.detectionMethod}

## Timeline of Events
${data.timeline}

## Root Cause Analysis
### Primary Root Cause
${data.rootCause}

### Contributing Factors
${data.contributingFactors}

## Resolution
${data.resolution}

## Action Items & Prevention
${data.preventionSteps}

## Lessons Learned
- Document what went well during incident response
- Identify gaps in monitoring/alerting
- Update runbooks based on this incident
- Schedule follow-up review in 30 days

---
*Generated with Engify.ai RCA Builder*`;

    setGeneratedReport(report);
    setStep(6);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
  };

  const totalSteps = 5;

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Icons.document className="mr-2 h-3 w-3" />
            Interactive Builder
          </Badge>
          <h1 className="mb-2 text-4xl font-bold">RCA / Postmortem Builder</h1>
          <p className="text-xl text-muted-foreground">
            Step-by-step guide to create comprehensive incident reports
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Step {Math.min(step, totalSteps)} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((Math.min(step, totalSteps) / totalSteps) * 100)}%
              Complete
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{
                width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step 1: Incident Overview */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Incident Overview</CardTitle>
              <CardDescription>
                Provide basic information about the incident
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Database Connection Pool Exhaustion"
                  value={data.incidentTitle}
                  onChange={(e) => updateData('incidentTitle', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="datetime">Date & Time *</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={data.dateTime}
                  onChange={(e) => updateData('dateTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity Level *</Label>
                <select
                  id="severity"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={data.severity}
                  onChange={(e) => updateData('severity', e.target.value)}
                >
                  <option value="">Select severity...</option>
                  {SEVERITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="services">Impacted Services *</Label>
                <Input
                  id="services"
                  placeholder="e.g., API Gateway, User Authentication"
                  value={data.impactedServices}
                  onChange={(e) =>
                    updateData('impactedServices', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="detection">How Was This Detected? *</Label>
                <Input
                  id="detection"
                  placeholder="e.g., PagerDuty alert, Customer report, Monitoring dashboard"
                  value={data.detectionMethod}
                  onChange={(e) =>
                    updateData('detectionMethod', e.target.value)
                  }
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={
                  !data.incidentTitle || !data.dateTime || !data.severity
                }
                className="w-full"
              >
                Next: Timeline
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Timeline */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Timeline of Events</CardTitle>
              <CardDescription>
                Document what happened and when (use bullet points)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timeline">Event Timeline *</Label>
                <Textarea
                  id="timeline"
                  placeholder="Example:
- 14:23 UTC - First alert triggered for high error rate
- 14:25 UTC - On-call engineer paged
- 14:30 UTC - Investigation began, identified DB connection issues
- 14:45 UTC - Temporary fix applied (increased connection pool)
- 15:00 UTC - Service fully restored"
                  value={data.timeline}
                  onChange={(e) => updateData('timeline', e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!data.timeline}
                  className="flex-1"
                >
                  Next: Root Cause
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Root Cause */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Root Cause Analysis</CardTitle>
              <CardDescription>
                Identify the primary cause and contributing factors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rootcause">Primary Root Cause *</Label>
                <Textarea
                  id="rootcause"
                  placeholder="What was the fundamental reason this incident occurred? Use the 5 Whys technique if helpful."
                  value={data.rootCause}
                  onChange={(e) => updateData('rootCause', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="contributing">Contributing Factors</Label>
                <Textarea
                  id="contributing"
                  placeholder="What other factors made this worse or allowed it to happen? (e.g., lack of monitoring, missing alerts, unclear runbooks)"
                  value={data.contributingFactors}
                  onChange={(e) =>
                    updateData('contributingFactors', e.target.value)
                  }
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!data.rootCause}
                  className="flex-1"
                >
                  Next: Resolution
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Resolution */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Resolution Steps</CardTitle>
              <CardDescription>How was the incident resolved?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resolution">Resolution Actions *</Label>
                <Textarea
                  id="resolution"
                  placeholder="Describe the steps taken to resolve the incident and restore service."
                  value={data.resolution}
                  onChange={(e) => updateData('resolution', e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  disabled={!data.resolution}
                  className="flex-1"
                >
                  Next: Prevention
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Prevention */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Prevention & Action Items</CardTitle>
              <CardDescription>
                What will you do to prevent this from happening again?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prevention">
                  Action Items & Prevention Steps *
                </Label>
                <Textarea
                  id="prevention"
                  placeholder="List specific, actionable items with owners and deadlines. Example:
- Add monitoring for connection pool utilization (Owner: SRE, Due: 2 weeks)
- Update runbook with troubleshooting steps (Owner: Eng Lead, Due: 1 week)
- Implement auto-scaling for connection pools (Owner: Platform, Due: 1 month)"
                  value={data.preventionSteps}
                  onChange={(e) =>
                    updateData('preventionSteps', e.target.value)
                  }
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(4)}
                  className="flex-1"
                >
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={generateReport}
                  disabled={!data.preventionSteps}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Generate Report
                  <Icons.sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Generated Report */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Postmortem Report</CardTitle>
              <CardDescription>
                Copy this report to your documentation system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {generatedReport}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} className="flex-1">
                  <Icons.copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <Icons.refresh className="mr-2 h-4 w-4" />
                  Start New RCA
                </Button>
              </div>

              {/* Upgrade CTA */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="py-6">
                  <h3 className="mb-2 font-semibold text-purple-900">
                    <Icons.sparkles className="mr-2 inline h-4 w-4" />
                    Want AI-Powered Insights?
                  </h3>
                  <p className="mb-4 text-sm text-purple-800">
                    Sign up to get AI-generated recommendations, similar
                    incident analysis, and automated action item tracking.
                  </p>
                  <Button asChild>
                    <Link href="/signup">
                      Sign Up Free
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        {step < 6 && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm text-blue-900">
                <Icons.info className="mr-2 inline h-4 w-4" />
                Tips for Great Postmortems
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <ul className="space-y-1">
                <li>• Be specific and factual - avoid blame</li>
                <li>• Focus on systems and processes, not individuals</li>
                <li>• Include timestamps for all major events</li>
                <li>
                  • Make action items SMART (Specific, Measurable, Achievable,
                  Relevant, Time-bound)
                </li>
                <li>• Share learnings with the broader team</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
