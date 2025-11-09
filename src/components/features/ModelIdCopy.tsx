'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface ModelIdCopyProps {
  id: string;
  label?: string;
}

export function ModelIdCopy({ id, label = 'Model ID' }: ModelIdCopyProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs sm:text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <code className="font-mono text-foreground">{id}</code>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-primary"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
      >
        <Icons.copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
