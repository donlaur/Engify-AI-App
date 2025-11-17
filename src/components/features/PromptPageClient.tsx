/**
 * Client Component for Prompt Detail Page
 * Handles view tracking and interactive features
 */

'use client';

import { usePromptView } from '@/hooks/use-prompt-view';

interface PromptPageClientProps {
  promptId: string;
}

export function PromptPageClient({ promptId }: PromptPageClientProps) {
  // Track view when page loads
  usePromptView({ promptId, enabled: true });

  return null; // This component only handles side effects
}

// Also export as default for compatibility
export default PromptPageClient;
