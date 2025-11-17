'use client';

/**
 * Prompt Customizer Component
 * Allows users to edit prompts before copying and save customized versions to their collection
 * Feature-flagged and requires premium entitlement (currently free for all logged-in users)
 */

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isFeatureEnabled } from '@/lib/features/flags';
import { hasPromptCustomizationEntitlement, canSaveToCollection } from '@/lib/entitlements/customization';
import { CopyButton } from '@/components/features/PromptActions';

interface PromptCustomizerProps {
  promptId: string;
  promptTitle: string;
  originalContent: string;
  onCopy?: (customizedContent: string) => void;
}

export function PromptCustomizer({ promptId, promptTitle, originalContent, onCopy }: PromptCustomizerProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(originalContent);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customizedName, setCustomizedName] = useState(`${promptTitle} (Customized)`);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Check feature flag
  const isFeatureEnabled_ = isFeatureEnabled('promptCustomization');
  
  // Check entitlement
  const userRole = session?.user ? (session.user as { role?: string }).role : null;
  const hasEntitlement = hasPromptCustomizationEntitlement(userRole || undefined);
  const canSave = canSaveToCollection(!!session?.user);

  // If feature is disabled, don't render
  if (!isFeatureEnabled_) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Prompt Template
              </CardTitle>
              <CardDescription>
                Copy the prompt template below
              </CardDescription>
            </div>
            <CopyButton content={originalContent} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950">
            <pre className="whitespace-pre-wrap">{originalContent}</pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user doesn't have entitlement, show upgrade message
  if (!hasEntitlement) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons.lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-xl">Premium Feature</CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Premium
            </Badge>
          </div>
          <CardDescription>
            Prompt customization is a premium feature. Sign in to access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/login">
                <Icons.user className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                <Icons.sparkles className="mr-2 h-4 w-4" />
                View Pricing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detect placeholder sections (lines starting with --- or containing [Your description here] or similar)
  const detectPlaceholders = (text: string): Array<{ start: number; end: number; text: string }> => {
    const placeholders: Array<{ start: number; end: number; text: string }> = [];
    const lines = text.split('\n');
    let offset = 0;

    lines.forEach((line, index) => {
      const lineStart = offset;
      const lineEnd = offset + line.length;

      // Detect placeholder patterns
      if (
        line.trim().startsWith('---') ||
        line.includes('[Your description here]') ||
        line.includes('[Your input here]') ||
        line.includes('[Your text here]') ||
        line.match(/\[.*here.*\]/i) ||
        line.trim().match(/^---\s*[A-Z\s]+---\s*$/)
      ) {
        placeholders.push({
          start: lineStart,
          end: lineEnd,
          text: line,
        });
      }

      offset = lineEnd + 1; // +1 for newline
    });

    return placeholders;
  };

  const placeholders = detectPlaceholders(content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (onCopy) {
        onCopy(content);
      }

      toast({
        title: 'Copied!',
        description: 'Customized prompt copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy prompt',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save customized prompts to your collection',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/prompts/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          originalPromptId: promptId,
          title: customizedName,
          content,
          originalContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast({
        title: 'Saved!',
        description: 'Customized prompt saved to your collection',
      });

      setShowSaveDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save to collection',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(originalContent);
    setIsEditing(false);
    toast({
      title: 'Reset',
      description: 'Prompt reset to original version',
    });
  };

  // Highlight placeholder lines in the display
  const renderContentWithHighlights = () => {
    if (!isEditing) {
      const lines = content.split('\n');
      return lines.map((line, index) => {
        const isPlaceholder = placeholders.some(
          (_p) => content.substring(0, content.indexOf(line)).split('\n').length - 1 === index
        );
        
        if (isPlaceholder) {
          return (
            <div
              key={index}
              className="bg-yellow-500/20 border-l-4 border-yellow-500 pl-2 py-1 my-1"
            >
              <code className="text-yellow-200">{line}</code>
            </div>
          );
        }
        return <div key={index}><code className="text-slate-100">{line}</code></div>;
      });
    }
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icons.edit className="h-5 w-5" />
                Prompt Template
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Edit the prompt below. Placeholder sections are highlighted. You can customize any part and save it to your collection.'
                  : 'Click &quot;Customize&quot; to edit this prompt and save your personalized version.'}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Icons.edit className="mr-2 h-4 w-4" />
                Customize
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-content">Edit Prompt Content</Label>
                <Textarea
                  id="prompt-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono text-sm min-h-[400px] bg-slate-900 text-slate-100 dark:bg-slate-950"
                  placeholder="Enter your customized prompt..."
                />
                {placeholders.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <Badge variant="outline" className="mr-2">
                      {placeholders.length} placeholder{placeholders.length !== 1 ? 's' : ''} detected
                    </Badge>
                    Update placeholder sections like <code className="bg-muted px-1 rounded">--- MY DESCRIPTION ---</code> or <code className="bg-muted px-1 rounded">[Your description here]</code>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Icons.check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Icons.copy className="mr-2 h-4 w-4" />
                      Copy Customized
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!canSave) {
                      toast({
                        title: 'Sign in required',
                        description: 'Please sign in to save customized prompts to your collection',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setShowSaveDialog(true);
                  }}
                  disabled={content === originalContent}
                >
                  <Icons.save className="mr-2 h-4 w-4" />
                  Save to Collection
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  Reset to Original
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950">
              <div className="space-y-1">{renderContentWithHighlights()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Collection</DialogTitle>
            <DialogDescription>
              Save this customized prompt to your collection. You can access it later from your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-name">Custom Name</Label>
              <Input
                id="custom-name"
                value={customizedName}
                onChange={(e) => setCustomizedName(e.target.value)}
                placeholder="My Customized Prompt"
              />
              <p className="text-xs text-muted-foreground">
                Give your customized prompt a name so you can find it easily.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !customizedName.trim()}>
              {isSaving ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.save className="mr-2 h-4 w-4" />
                  Save to Collection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

