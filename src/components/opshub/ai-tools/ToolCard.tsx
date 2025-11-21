import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import type { AITool } from '@/lib/db/schemas/ai-tool';

interface ToolDisplay extends AITool {
  _id?: string;
}

interface ToolCardProps {
  tool: ToolDisplay;
  onEdit: (tool: ToolDisplay) => void;
  onToggleStatus: (tool: ToolDisplay) => void;
  categoryLabels: Record<string, string>;
}

/**
 * Individual tool card component
 */
export function ToolCard({ tool, onEdit, onToggleStatus, categoryLabels }: ToolCardProps) {
  return (
    <Card key={tool.id} className={tool.status === 'deprecated' ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            {tool.tagline && <CardDescription className="mt-1">{tool.tagline}</CardDescription>}
            <div className="mt-1 font-mono text-xs text-muted-foreground">{tool.slug}</div>
          </div>
          {tool.status === 'deprecated' || tool.status === 'sunset' ? (
            <Badge variant="destructive">Deprecated</Badge>
          ) : (
            <Badge variant="default">Active</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Category */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">{categoryLabels[tool.category] || tool.category}</Badge>
          {tool.pricing?.free && <Badge variant="secondary">Free</Badge>}
          {tool.pricing?.paid?.monthly && (
            <Badge variant="default">${tool.pricing.paid.monthly}/mo</Badge>
          )}
        </div>

        {/* Rating */}
        {tool.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{tool.rating.toFixed(1)}</span>
            {tool.reviewCount > 0 && (
              <span className="text-muted-foreground">({tool.reviewCount} reviews)</span>
            )}
          </div>
        )}

        {/* Description */}
        {tool.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
        )}

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tool.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onEdit(tool)} className="flex-1">
            <Icons.edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onToggleStatus(tool)}>
            {tool.status === 'active' ? (
              <Icons.archive className="h-3 w-3" />
            ) : (
              <Icons.check className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

