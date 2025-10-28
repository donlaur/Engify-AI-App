'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { WORKBENCH_TOOLS, WorkbenchToolId, WorkbenchTool } from '@/types/workbench';

interface ToolSelectorProps {
  selectedTool: WorkbenchToolId;
  onSelectTool: (toolId: WorkbenchToolId) => void;
}

export function ToolSelector({ selectedTool, onSelectTool }: ToolSelectorProps) {
  const tools = Object.values(WORKBENCH_TOOLS);

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Icons.tool className="h-5 w-5" />;
  };

  const getCategoryColor = (category: WorkbenchTool['category']) => {
    switch (category) {
      case 'analysis':
        return 'bg-blue-500/10 text-blue-500';
      case 'optimization':
        return 'bg-purple-500/10 text-purple-500';
      case 'testing':
        return 'bg-green-500/10 text-green-500';
      case 'execution':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Workbench Tools</h2>
        <p className="text-muted-foreground">
          Choose a tool to analyze, optimize, or test your prompts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTool === tool.id ? 'ring-2 ring-primary' : ''
            } ${tool.comingSoon ? 'opacity-60' : ''}`}
            onClick={() => !tool.comingSoon && onSelectTool(tool.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    {getIcon(tool.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                      {tool.comingSoon && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                      {!tool.requiresBackend && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {selectedTool === tool.id && (
                  <Icons.check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">{tool.description}</CardDescription>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Features:</p>
                <ul className="space-y-1">
                  {tool.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-primary mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                  {tool.features.length > 3 && (
                    <li className="text-xs text-muted-foreground italic">
                      +{tool.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
              {tool.comingSoon && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {tool.requiresBackend
                      ? '🔧 Requires backend integration'
                      : '🚀 Coming in next update'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{tools.length}</p>
              <p className="text-xs text-muted-foreground">Total Tools</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {tools.filter((t) => !t.comingSoon).length}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {tools.filter((t) => t.comingSoon).length}
              </p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">
                {tools.filter((t) => !t.requiresBackend).length}
              </p>
              <p className="text-xs text-muted-foreground">No Backend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
