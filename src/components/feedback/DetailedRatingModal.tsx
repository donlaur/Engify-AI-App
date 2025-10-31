/**
 * Detailed Rating Modal Component (Tier 2)
 * 1-5 star rating with optional dimension scores and feedback
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { FeedbackErrorBoundary } from '@/components/ErrorBoundary';

interface DetailedRatingModalProps {
  open: boolean;
  onClose: () => void;
  promptId: string;
  promptTitle: string;
}

export function DetailedRatingModal({
  open,
  onClose,
  promptId,
  promptTitle,
}: DetailedRatingModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [showDimensions, setShowDimensions] = useState(false);
  
  // Dimension ratings
  const [clarity, setClarity] = useState<number>(0);
  const [usefulness, setUsefulness] = useState<number>(0);
  const [completeness, setCompleteness] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  
  // Usage context
  const [aiModel, setAiModel] = useState<string>('');
  const [achievedGoal, setAchievedGoal] = useState<boolean | null>(null);
  
  // Feedback
  const [comment, setComment] = useState('');
  const [suggestedImprovements, setSuggestedImprovements] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        description: 'Choose 1-5 stars',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          rating,
          dimensions: showDimensions ? { clarity, usefulness, completeness, accuracy } : undefined,
          usageContext: {
            aiModel: aiModel || undefined,
            achievedGoal: achievedGoal ?? undefined,
          },
          comment: comment || undefined,
          suggestedImprovements: suggestedImprovements.length > 0 ? suggestedImprovements : undefined,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit rating');
      
      toast({
        title: '✅ Rating submitted!',
        description: 'Thank you for helping us improve our prompts.',
      });
      
      onClose();
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, onHover }: { 
    value: number; 
    onChange: (v: number) => void;
    onHover?: (v: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onHover?.(0)}
          className="transition-transform hover:scale-110"
        >
          <Icons.star
            className={`h-8 w-8 ${
              star <= (hoverRating || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const SmallStarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Icons.star
            className={`h-5 w-5 ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const toggleImprovement = (improvement: string) => {
    setSuggestedImprovements(prev =>
      prev.includes(improvement)
        ? prev.filter(i => i !== improvement)
        : [...prev, improvement]
    );
  };

  return (
    <FeedbackErrorBoundary>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate This Prompt</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve our library and recommend better prompts to others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Overall Rating *
            </Label>
            <div className="flex items-center gap-4">
              <StarRating 
                value={rating} 
                onChange={setRating}
                onHover={setHoverRating}
              />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '👍 Good'}
                  {rating === 3 && '✓ Okay'}
                  {rating === 2 && '⚠️ Needs work'}
                  {rating === 1 && '❌ Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Quick Context */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Usage Context (Optional)</Label>
            
            <div>
              <Label htmlFor="aiModel" className="text-sm text-muted-foreground">
                Which AI model did you use?
              </Label>
              <input
                id="aiModel"
                type="text"
                placeholder="e.g., GPT-4, Claude 3.5, Gemini"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Did this prompt help you achieve your goal?
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={achievedGoal === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAchievedGoal(true)}
                >
                  <Icons.check className="mr-2 h-4 w-4" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={achievedGoal === false ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setAchievedGoal(false)}
                >
                  <Icons.x className="mr-2 h-4 w-4" />
                  No
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Dimensions (Optional) */}
          <div>
            <button
              type="button"
              onClick={() => setShowDimensions(!showDimensions)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icons.chevronRight className={cn('h-4 w-4 transition-transform', showDimensions && 'rotate-90')} />
              Rate specific dimensions (optional)
            </button>
            
            {showDimensions && (
              <div className="mt-4 space-y-4 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Clarity (easy to understand?)</Label>
                  <SmallStarRating value={clarity} onChange={setClarity} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Usefulness (solved your problem?)</Label>
                  <SmallStarRating value={usefulness} onChange={setUsefulness} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Completeness (all info included?)</Label>
                  <SmallStarRating value={completeness} onChange={setCompleteness} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Accuracy (correct output?)</Label>
                  <SmallStarRating value={accuracy} onChange={setAccuracy} />
                </div>
              </div>
            )}
          </div>

          {/* Suggested Improvements */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              How could we improve this prompt? (Select all that apply)
            </Label>
            <div className="space-y-2">
              {[
                { id: 'add-examples', label: 'Add more examples' },
                { id: 'simplify-language', label: 'Simplify language' },
                { id: 'more-context', label: 'Provide more context' },
                { id: 'better-structure', label: 'Better structure/organization' },
                { id: 'add-edge-cases', label: 'Cover edge cases' },
                { id: 'reduce-verbosity', label: 'Make it more concise' },
              ].map((improvement) => (
                <div key={improvement.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={improvement.id}
                    checked={suggestedImprovements.includes(improvement.id)}
                    onCheckedChange={() => toggleImprovement(improvement.id)}
                  />
                  <label
                    htmlFor={improvement.id}
                    className="text-sm cursor-pointer"
                  >
                    {improvement.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm text-muted-foreground">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="What worked well? What could be better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="mt-1 min-h-[100px]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Icons.send className="mr-2 h-4 w-4" />
                Submit Rating
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </FeedbackErrorBoundary>
  );
}

