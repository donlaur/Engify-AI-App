/**
 * Make it Mine Button
 *
 * Freemium CTA button that shows upgrade modal for free users
 * and enables customization for Pro users
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface MakeItMineButtonProps {
  promptId: string;
  promptTitle: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function MakeItMineButton({
  promptId,
  promptTitle: _promptTitle,
  variant = 'default',
  size = 'default',
  className,
}: MakeItMineButtonProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Mock user - will be replaced with real auth
  const isPro = false; // Free user
  const freeCustomizationsUsed = 0; // Track weekly free customizations
  const freeCustomizationsLimit = 1; // 1 free per week

  const handleClick = () => {
    if (isPro) {
      // Pro user - open customization interface
      window.location.href = `/workbench?prompt=${promptId}`;
    } else {
      // Free user - check if they have free customizations left
      if (freeCustomizationsUsed < freeCustomizationsLimit) {
        // Use free customization
        window.location.href = `/workbench?prompt=${promptId}&trial=true`;
      } else {
        // Show upgrade modal
        setShowUpgradeModal(true);
      }
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={className}
      >
        <Icons.sparkles className="mr-2 h-4 w-4" />
        Make it Mine
        {!isPro && (
          <Badge variant="secondary" className="ml-2 text-xs">
            Pro
          </Badge>
        )}
      </Button>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5 text-primary" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              Unlock unlimited prompt customization and more!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Free vs Pro Comparison */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Free Plan</span>
                <span className="text-2xl font-bold">$0</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  67 static prompts
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />1 custom
                  prompt/week
                </li>
                <li className="flex items-center gap-2">
                  <Icons.cancel className="h-4 w-4 text-gray-400" />
                  No AI optimization
                </li>
              </ul>
            </div>

            <div className="space-y-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pro Plan</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">$19</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  <strong>Unlimited</strong> custom prompts
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  AI-powered optimization
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  Role-based personalization
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  Pattern mixing & advanced features
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-600" />
                  Save custom prompts
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => {
                  // TODO: Navigate to pricing/checkout
                  window.location.href = '/pricing';
                }}
                size="lg"
                className="w-full"
              >
                <Icons.zap className="mr-2 h-4 w-4" />
                Upgrade to Pro - $19/mo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full"
              >
                Maybe Later
              </Button>
            </div>

            {/* Value Prop */}
            <p className="text-center text-xs text-muted-foreground">
              💎 Save 10+ hours/week with personalized prompts
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
