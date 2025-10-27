'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Prompt } from '@/lib/schemas/prompt';
import { useState } from 'react';

interface PromptDetailModalProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptDetailModal({ prompt, isOpen, onClose }: PromptDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to user profile
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
              <p className="mt-2 text-gray-600">{prompt.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            >
              <Icons.star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{prompt.category}</Badge>
          {prompt.role && <Badge variant="outline">{prompt.role}</Badge>}
          {prompt.pattern && (
            <Badge className="bg-purple-100 text-purple-800">
              <Icons.brain className="mr-1 h-3 w-3" />
              {prompt.pattern}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Icons.view className="h-4 w-4" />
            <span>{prompt.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.star className="h-4 w-4" />
            <span>{prompt.rating?.toFixed(1) || 0} ({prompt.ratingCount || 0} ratings)</span>
          </div>
        </div>

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
          
          <div className="rounded-lg bg-gray-50 p-6 font-mono text-sm whitespace-pre-wrap">
            {prompt.content}
          </div>
        </div>

        {/* Pattern Explanation */}
        {prompt.pattern && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">
              <Icons.brain className="inline mr-2 h-4 w-4" />
              About the {prompt.pattern} Pattern
            </h4>
            <p className="text-sm text-purple-800">
              {getPatternDescription(prompt.pattern)}
            </p>
          </div>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Tags</h4>
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
        <div className="flex gap-3 pt-4 border-t">
          <Button className="flex-1" onClick={handleCopy}>
            <Icons.copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </Button>
          <Button variant="outline" className="flex-1">
            <Icons.sparkles className="mr-2 h-4 w-4" />
            Make it Mine
            <Badge variant="secondary" className="ml-2">Pro</Badge>
          </Button>
        </div>

        {/* Make it Mine Explanation */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-1">
            <Icons.info className="inline mr-1 h-4 w-4" />
            What is "Make it Mine"?
          </p>
          <p className="text-blue-800">
            Customize this prompt for your specific use case. Our AI will adapt the prompt to your context, 
            add your company's terminology, and optimize it for your workflow. Save customized versions to your profile.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getPatternDescription(pattern: string): string {
  const descriptions: Record<string, string> = {
    'persona': 'Assigns a specific role or expertise to the AI, improving response quality and relevance.',
    'template': 'Provides a structured format with placeholders for easy customization and consistent results.',
    'chain-of-thought': 'Breaks down complex problems into step-by-step reasoning for better accuracy.',
    'few-shot': 'Includes examples to guide the AI toward the desired output format and style.',
    'audience-persona': 'Tailors responses for specific audiences by defining their knowledge level and needs.',
  };
  return descriptions[pattern] || 'A proven prompt engineering pattern for better AI responses.';
}
