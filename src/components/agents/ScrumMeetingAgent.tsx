'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface MeetingResult {
  meeting_id: string | null;
  summary: {
    action_items: Array<{ title: string; assignee: string }>;
    blockers: string[];
    next_sprint_goals: string[];
  };
  conversation: {
    scrum_master: string;
    pm: string;
    po: string;
    engineer: string;
  };
  turn_count: number;
}

export function ScrumMeetingAgent() {
  const [agenda, setAgenda] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const addTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const runMeeting = async () => {
    if (!agenda.trim()) {
      setError('Please enter an agenda');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/agents/scrum-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agenda: agenda.trim(), 
          topics: topics.filter(Boolean) 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run meeting');
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: 'Meeting Complete!',
        description: `Completed ${data.turn_count} turns with 4 agents`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Meeting Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scrum Meeting Multi-Agent</CardTitle>
          <p className="text-sm text-muted-foreground">
            Run a simulated scrum meeting with 4 AI agents (Scrum Master, PM, PO, Engineer)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Meeting Agenda</label>
            <Textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Enter sprint planning agenda..."
              rows={6}
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Topics (Optional)</label>
            <div className="flex gap-2 mb-2">
              <Textarea
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addTopic();
                  }
                }}
                placeholder="Add a topic..."
                rows={2}
                disabled={isRunning}
                className="flex-1"
              />
              <Button onClick={addTopic} disabled={isRunning || !currentTopic.trim()}>
                Add
              </Button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                  >
                    <span>{topic}</span>
                    <button
                      onClick={() => removeTopic(i)}
                      disabled={isRunning}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove topic"
                    >
                      <Icons.x className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={runMeeting}
            disabled={isRunning || !agenda.trim()}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Running meeting... (up to 5 minutes)
              </>
            ) : (
              <>
                <Icons.play className="mr-2 h-4 w-4" />
                Start Scrum Meeting
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
              <CardTitle>Meeting Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Completed {result.turn_count} turns across 4 agents
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Action Items</h4>
                {result.summary.action_items.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {result.summary.action_items.map((item, i) => (
                      <li key={i}>
                        <strong>{item.title}</strong> - {item.assignee}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No action items identified</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockers</h4>
                {result.summary.blockers.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {result.summary.blockers.map((blocker, i) => (
                      <li key={i}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No blockers identified</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Next Sprint Goals</h4>
                {result.summary.next_sprint_goals.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {result.summary.next_sprint_goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No sprint goals identified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Scrum Master</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.conversation.scrum_master || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Product Manager</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.conversation.pm || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Product Owner</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.conversation.po || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Engineer</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.conversation.engineer || 'No notes'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

