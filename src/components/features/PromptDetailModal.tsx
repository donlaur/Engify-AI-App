'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import {
  Prompt,
  categoryLabels,
  roleLabels,
  type UserRole,
} from '@/lib/schemas/prompt';
import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from '@/hooks/use-toast';

interface PromptDetailModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
}: PromptDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites',
        variant: 'default',
      });
      return;
    }

    await toggleFavorite(prompt.id);
    toast({
      title: isFavorite(prompt.id)
        ? 'Removed from favorites'
        : 'Added to favorites',
      description: isFavorite(prompt.id)
        ? 'Prompt removed from your favorites'
        : 'Prompt saved to your favorites',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="pr-8">
            <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
            <p className="mt-2 text-muted-foreground">{prompt.description}</p>
          </div>
        </DialogHeader>

        {/* Favorite Button - separate from close button, consistent heart icon */}
        <div className="absolute right-14 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            aria-label={
              isFavorite(prompt.id)
                ? 'Remove from favorites'
                : 'Add to favorites'
            }
            title={
              isFavorite(prompt.id)
                ? 'Remove from favorites'
                : 'Add to favorites'
            }
          >
            {isFavorite(prompt.id) ? (
              <Icons.heart className="h-5 w-5 fill-red-600 text-red-600" />
            ) : (
              <Icons.heart className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {categoryLabels[prompt.category] || prompt.category}
          </Badge>
          {prompt.role && (
            <Badge variant="outline">
              {roleLabels[prompt.role as UserRole] || prompt.role}
            </Badge>
          )}
          {prompt.pattern && (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              <Icons.brain className="mr-1 h-3 w-3" />
              {prompt.pattern}
            </Badge>
          )}
        </div>

        {/* Stats - removed fake views/ratings */}

        {/* Prompt Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prompt</h3>
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? (
                <>
                  <Icons.check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Icons.copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>

          <div className="whitespace-pre-wrap rounded-lg border bg-slate-900 p-6 font-mono text-sm text-slate-100 dark:bg-slate-950 dark:text-slate-50">
            {prompt.content}
          </div>
        </div>

        {/* Pattern Explanation */}
        {prompt.pattern && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/50">
            <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
              <Icons.brain className="mr-2 inline h-4 w-4" />
              About the {prompt.pattern} Pattern
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              {getPatternDescription(prompt.pattern)}
            </p>
          </div>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t pt-4">
          <Button className="flex-1" onClick={handleCopy}>
            <Icons.copy className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    persona:
      'Assigns a specific role or expertise to the AI, improving response quality and relevance.',
    template:
      'Provides a structured format with placeholders for easy customization and consistent results.',
    'chain-of-thought':
      'Breaks down complex problems into step-by-step reasoning for better accuracy.',
    'few-shot':
      'Includes examples to guide the AI toward the desired output format and style.',
    'audience-persona':
      'Tailors responses for specific audiences by defining their knowledge level and needs.',
  };
  return (
    descriptions[pattern] ||
    'A proven prompt engineering pattern for better AI responses.'
  );
}
