/**
 * PromptCard Component
 *
 * Display prompt information with:
 * - Title and description
 * - Category badge
 * - Copy button
 * - View count
 * - Rating
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/use-favorites';
import { PromptDetailModal } from './PromptDetailModal';
import { getPromptSlug } from '@/lib/utils/slug';
import type { Prompt } from '@/lib/schemas/prompt';
import {
  categoryLabels,
  roleLabels,
  type UserRole,
} from '@/lib/schemas/prompt';
import { trackPromptEvent } from '@/lib/utils/ga-events';

interface PromptCardProps extends Omit<Prompt, 'createdAt' | 'updatedAt' | 'currentRevision'> {
  onView?: () => void;
  updatedAt?: Date;
  lastRevisedAt?: Date;
  currentRevision?: number;
}

export function PromptCard(props: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const {
    id,
    title,
    description,
    content,
    category,
    role,
    slug,
    onView,
    updatedAt,
    lastRevisedAt,
    currentRevision,
  } = props;
  const promptSlug = getPromptSlug({ title, slug });

  // Determine if prompt was recently updated (within last 30 days)
  // Only show badge if there's an actual update date and it's recent
  const lastUpdateDate = updatedAt || lastRevisedAt;
  const isRecentlyUpdated = lastUpdateDate
    ? Date.now() - new Date(lastUpdateDate).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      // Track copy event
      trackPromptEvent('copy', id, {
        prompt_title: title,
        prompt_category: category,
        prompt_pattern: slug,
      });

      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} - Engify.ai Prompt`,
      text: description,
      url: `${window.location.origin}/prompts/${promptSlug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link Copied',
          description: 'Prompt link copied to clipboard',
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Share failed:', error);
    }
  };

  const handleView = () => {
    setShowModal(true);

    // Track view event
    trackPromptEvent('view', id, {
      prompt_title: title,
      prompt_category: category,
      prompt_pattern: slug,
    });

    if (onView) {
      onView();
    }
  };

  return (
    <>
      <Card className="group relative flex h-full flex-col rounded-xl transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
        <CardHeader className="flex-1 pb-4">
          <div className="flex items-start justify-between">
            <Link
              href={`/prompts/${promptSlug}`}
              className="flex-1 space-y-1 pr-2 transition-colors hover:text-primary"
              onClick={(e) => {
                // Allow modal to open on middle-click or ctrl-click, but default to page navigation
                if (e.metaKey || e.ctrlKey) return;
                // Track view for analytics
                if (onView) {
                  onView();
                }
              }}
            >
              <CardTitle className="break-words text-base leading-tight transition-colors group-hover:text-white dark:group-hover:text-white sm:text-lg">
                {title.replace(/\.md$/i, '')}
              </CardTitle>
              <CardDescription className="line-clamp-3 min-h-[3.5rem] leading-relaxed">
                {description || 'No description available.'}
              </CardDescription>
            </Link>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const wasFavorite = isFavorite(id);
                  toggleFavorite(id);

                  // Track favorite event
                  trackPromptEvent(
                    wasFavorite ? 'unfavorite' : 'favorite',
                    id,
                    {
                      prompt_title: title,
                      prompt_category: category,
                      prompt_pattern: slug,
                    }
                  );

                  toast({
                    title: wasFavorite
                      ? 'Removed from favorites'
                      : 'Added to favorites',
                    description: wasFavorite
                      ? 'Prompt removed from your favorites'
                      : 'Prompt saved to your favorites',
                  });
                }}
                className="shrink-0"
                aria-label={
                  isFavorite(id) ? 'Remove from favorites' : 'Add to favorites'
                }
                title={
                  isFavorite(id) ? 'Remove from favorites' : 'Add to favorites'
                }
              >
                {isFavorite(id) ? (
                  <Icons.heart className="h-4 w-4 fill-red-600 text-red-600" />
                ) : (
                  <Icons.heart className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="shrink-0"
                aria-label="Share prompt"
                title="Share prompt"
              >
                <Icons.share className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="shrink-0"
                aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Icons.check className="h-4 w-4 text-green-600" />
                ) : (
                  <Icons.copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end space-y-3 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {categoryLabels[category] || category}
            </Badge>
            {role && (
              <Badge variant="outline">
                {roleLabels[role as UserRole] || role}
              </Badge>
            )}
            {isRecentlyUpdated && (
              <Badge
                variant="outline"
                className="border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                title="Recently updated"
              >
                <Icons.sparkles className="h-3 w-3" />
              </Badge>
            )}
            {currentRevision && currentRevision > 1 && (
              <Badge variant="outline" className="text-xs">
                v{currentRevision}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-shrink-0 items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Quick View
            <Icons.arrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Link href={`/prompts/${promptSlug}`}>
              View Page
              <Icons.externalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <PromptDetailModal
        prompt={props as Prompt}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
