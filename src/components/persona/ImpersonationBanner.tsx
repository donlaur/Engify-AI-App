'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { Persona, ImpersonationMode, getPersonaDescription } from '@/types/persona';

interface ImpersonationBannerProps {
  actualPersona: Persona;
  currentPersona: Persona;
  impersonation: ImpersonationMode;
  onStopImpersonating: () => void;
  onSaveInsights?: (insights: string) => void;
}

export function ImpersonationBanner({
  actualPersona,
  currentPersona,
  impersonation,
  onStopImpersonating,
  onSaveInsights,
}: ImpersonationBannerProps) {
  if (!impersonation.isActive) return null;

  const getReasonColor = (reason: ImpersonationMode['reason']) => {
    switch (reason) {
      case 'empathy':
        return 'bg-purple-500/10 text-purple-500';
      case 'learning':
        return 'bg-blue-500/10 text-blue-500';
      case 'helping':
        return 'bg-green-500/10 text-green-500';
      case 'exploring':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getReasonIcon = (reason: ImpersonationMode['reason']) => {
    switch (reason) {
      case 'empathy':
        return <Icons.heart className="h-4 w-4" />;
      case 'learning':
        return <Icons.book className="h-4 w-4" />;
      case 'helping':
        return <Icons.users className="h-4 w-4" />;
      case 'exploring':
        return <Icons.compass className="h-4 w-4" />;
      default:
        return <Icons.user className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-2 border-primary bg-primary/5 sticky top-0 z-50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="rounded-full bg-primary/20 p-2">
              <Icons.users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">Impersonation Mode Active</p>
                <Badge variant="secondary" className={getReasonColor(impersonation.reason)}>
                  <span className="mr-1">{getReasonIcon(impersonation.reason)}</span>
                  {impersonation.reason}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="opacity-60">You:</span>{' '}
                <span className="font-medium">{getPersonaDescription(actualPersona)}</span>
                <span className="mx-2">→</span>
                <span className="opacity-60">Viewing as:</span>{' '}
                <span className="font-medium text-primary">
                  {getPersonaDescription(currentPersona)}
                </span>
              </div>
              {impersonation.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  "{impersonation.notes}"
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const insights = prompt('What did you learn from this perspective?');
                  if (insights) onSaveInsights(insights);
                }}
              >
                <Icons.lightbulb className="mr-2 h-4 w-4" />
                Save Insights
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onStopImpersonating}>
              <Icons.x className="mr-2 h-4 w-4" />
              Stop Impersonating
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
