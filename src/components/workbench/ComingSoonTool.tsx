'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { WorkbenchTool } from '@/types/workbench';

interface ComingSoonToolProps {
  tool: WorkbenchTool;
}

export function ComingSoonTool({ tool }: ComingSoonToolProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/20 p-3">
              <Icons.sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{tool.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                Coming Soon
              </Badge>
            </div>
          </div>
          <CardDescription className="text-base">{tool.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tool.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Icons.check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            {tool.requiresBackend ? (
              <>
                <Icons.server className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Backend Integration Required</p>
                  <p className="text-sm text-muted-foreground">
                    This tool requires database and Python services to be connected.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Icons.check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">No Backend Required</p>
                  <p className="text-sm text-muted-foreground">
                    This tool runs entirely in your browser.
                  </p>
                </div>
              </>
            )}
          </div>

          {tool.requiresBackend && (
            <div className="flex items-start gap-3">
              <Icons.key className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">API Keys Needed</p>
                <p className="text-sm text-muted-foreground">
                  OpenAI, Anthropic, or Google API keys required for AI execution.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <p className="font-semibold mb-2">Want this feature sooner?</p>
              <p className="text-sm text-muted-foreground">
                This tool is planned for the next phase of development. Stay tuned!
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <a href="https://github.com/engify/engify-ai" target="_blank" rel="noopener noreferrer">
                  <Icons.github className="mr-2 h-4 w-4" />
                  Star on GitHub
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/contact">
                  <Icons.mail className="mr-2 h-4 w-4" />
                  Request Feature
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Development Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Planning</span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Design</span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend API</span>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                In Progress
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frontend UI</span>
              <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
                Pending
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Testing</span>
              <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
                Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
