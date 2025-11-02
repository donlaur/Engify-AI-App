/**
 * Client Component for Prompt Page Actions
 * Handles copy and share functionality with browser APIs
 */
'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  content: string;
}

export function CopyButton({ content }: CopyButtonProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Icons.copy className="mr-2 h-4 w-4" />
      Copy
    </Button>
  );
}

interface ShareButtonProps {
  title: string;
  description: string;
}

export function ShareButton({ title, description }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Prompt link copied to clipboard',
        });
      }
    } catch (error) {
      // User cancelled share or error occurred - don't show error toast
      console.error('Share failed:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Icons.share className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
