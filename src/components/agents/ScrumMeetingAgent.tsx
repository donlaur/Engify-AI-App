'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { trackMultiAgentEvent, trackErrorEvent } from '@/lib/utils/ga-events';

interface WorkbenchResult {
  session_id: string | null;
  summary: {
    recommendations: Array<{ title?: string; description?: string }>;
    implementation_plan: string[];
    risks_and_mitigations: string[];
  };
  conversation: {
    director: string;
    manager: string;
    tech_lead: string;
    architect: string;
  };
  turn_count: number;
}

export function ScrumMeetingAgent() {
  const [situation, setSituation] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<WorkbenchResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startTimeRef = useRef<number | null>(null);

  const runWorkbench = async () => {
    if (!situation.trim()) {
      setError('Please describe the situation or problem');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);
    startTimeRef.current = Date.now();
    
    // Track workflow start
    trackMultiAgentEvent('started', {
      situation_length: situation.length,
      context_length: context.length,
    });
    
    try {
      const response = await fetch('/api/agents/scrum-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          situation: situation.trim(),
          context: context.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run engineering leadership discussion');
      }

      const data = await response.json();
      setResult(data);
      
      // Track successful completion
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      trackMultiAgentEvent('completed', {
        situation_length: situation.length,
        context_length: context.length,
        turn_count: data.turn_count,
        duration_ms: duration,
      });
      
      toast({
        title: 'Analysis Complete!',
        description: `Got perspectives from 4 engineering leadership roles. Review recommendations below.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Track error
      const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      trackMultiAgentEvent('failed', {
        situation_length: situation.length,
        context_length: context.length,
        error: errorMessage,
        duration_ms: duration,
      });
      
      trackErrorEvent('multi_agent_workflow_failed', {
        error_message: errorMessage,
        page: '/workbench/multi-agent',
        component: 'ScrumMeetingAgent',
      });
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
      startTimeRef.current = null;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Engineering Leadership Prep Tool</CardTitle>
          <p className="text-sm text-muted-foreground">
            Prepare for engineering leadership meetings, ARB reviews, or engineering+product 
            discussions. Get multi-perspective analysis on problems before your meeting. 
            Input a situation, get comprehensive perspectives from Director of Engineering, 
            Engineering Manager, Tech Lead, and Architect — complete with actionable recommendations 
            and risk analysis.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Situation or Problem <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Example: We need to integrate AI coding assistants into our SDLC. Our team uses React/TypeScript, we have 25 engineers, and we're concerned about code quality and developer experience..."
              rows={6}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe the situation, problem, or challenge you're facing. This will be analyzed 
              from multiple engineering leadership perspectives.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Example: We're a Series B startup, our current code review process takes 2-3 days, and we're evaluating GitHub Copilot vs Cursor..."
              rows={4}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add any relevant context about your team, company, constraints, or current state.
            </p>
          </div>

          <Button
            onClick={runWorkbench}
            disabled={isRunning || !situation.trim()}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Analyzing from multiple perspectives... (up to 5 minutes)
              </>
            ) : (
              <>
                <Icons.play className="mr-2 h-4 w-4" />
                Get Multi-Perspective Analysis
              </>
            )}
          </Button>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Perspective Analysis Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Completed {result.turn_count} turns across 4 engineering leadership roles. 
                Use these perspectives to prepare for your meeting or ARB review.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                {result.summary.recommendations.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {result.summary.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm">
                        {rec.title && <strong>{rec.title}: </strong>}
                        {rec.description || JSON.stringify(rec)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No explicit recommendations extracted</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Implementation Plan</h4>
                {result.summary.implementation_plan.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {result.summary.implementation_plan.map((step, i) => (
                      <li key={i} className="text-sm">{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-sm">No implementation plan extracted</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risks & Mitigations</h4>
                {result.summary.risks_and_mitigations.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {result.summary.risks_and_mitigations.map((risk, i) => (
                      <li key={i} className="text-sm">{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No risks identified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engineering Leadership Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Director of Engineering</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                  {result.conversation.director || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Engineering Manager</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                  {result.conversation.manager || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tech Lead</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                  {result.conversation.tech_lead || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Architect</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                  {result.conversation.architect || 'No notes'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
