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

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/use-favorites';
import { MakeItMineButton } from './MakeItMineButton';
import { PromptDetailModal } from './PromptDetailModal';
import { QualityBadge } from '@/components/prompt/QualityBadge';
import type { Prompt } from '@/lib/schemas/prompt';

interface PromptCardProps extends Omit<Prompt, 'createdAt' | 'updatedAt'> {
  onView?: () => void;
}

export function PromptCard(props: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const { id, title, description, content, category, role, views = 0, rating = 0, onView } = props;

  // Fetch quality score
  useEffect(() => {
    async function fetchQualityScore() {
      try {
        const response = await fetch(`/api/prompts/quality-scores?promptIds=${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.scores && data.scores[id]) {
            setQualityScore(data.scores[id].averageScore);
          }
        }
      } catch (err) {
        // Silently fail - quality scores are optional
      }
    }
    fetchQualityScore();
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
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

  const handleView = () => {
    setShowModal(true);
    if (onView) {
      onView();
    }
  };

  return (
    <>
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={handleView}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(id);
                toast({
                  title: isFavorite(id)
                    ? 'Removed from favorites'
                    : 'Added to favorites',
                  description: isFavorite(id)
                    ? 'Prompt removed from your favorites'
                    : 'Prompt saved to your favorites',
                });
              }}
              className="shrink-0"
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
                handleCopy();
              }}
              className="shrink-0"
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
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary">{category}</Badge>
          {role && <Badge variant="outline">{role}</Badge>}
          {qualityScore !== null && (
            <QualityBadge score={qualityScore} size="sm" />
          )}
        </div>
        <MakeItMineButton
          promptId={id}
          promptTitle={title}
          variant="outline"
          size="sm"
          className="w-full"
        />
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onView}>
              <Icons.arrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Icons.view className="h-4 w-4" />
            <span>{views.toLocaleString()}</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center space-x-1">
              <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
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
