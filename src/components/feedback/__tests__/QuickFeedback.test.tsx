/**
 * QuickFeedback Component Tests
 * Tests user interactions, API calls, error states
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickFeedback } from '@/components/feedback/QuickFeedback';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/lib/icons', () => ({
  Icons: {
    heart: ({ className }: { className?: string }) => <span data-testid="heart-icon" className={className}>❤️</span>,
    bookmark: ({ className }: { className?: string }) => <span data-testid="bookmark-icon" className={className}>🔖</span>,
    like: ({ className }: { className?: string }) => <span data-testid="like-icon" className={className}>👍</span>,
    dislike: ({ className }: { className?: string }) => <span data-testid="dislike-icon" className={className}>👎</span>,
  },
}));

vi.mock('@/components/ErrorBoundary', () => ({
  FeedbackErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock fetch
global.fetch = vi.fn();

// Mock document.queryCommandSupported (not available in jsdom)
Object.defineProperty(document, 'queryCommandSupported', {
  value: vi.fn(() => false),
  writable: true,
});

// Mock performance.now()
global.performance = {
  now: vi.fn(() => 1000),
} as unknown as Performance;

describe('QuickFeedback', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    } as any);
    
    // Mock successful API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Feedback recorded' }),
    } as Response);
  });

  it('renders like and save buttons', () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    // Find buttons by icon test IDs
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument();
  });

  it('renders helpful feedback section', () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    expect(screen.getByText(/was this helpful/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, helpful/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /not helpful/i })).toBeInTheDocument();
  });

  it('handles like button click', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    // Find button containing heart icon
    const heartIcon = screen.getByTestId('heart-icon');
    const likeButton = heartIcon.closest('button');
    expect(likeButton).toBeInTheDocument();
    fireEvent.click(likeButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/quick',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"action":"like"'),
        })
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Thanks! ❤️',
      })
    );
  });

  it('handles save button click', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const bookmarkIcon = screen.getByTestId('bookmark-icon');
    const saveButton = bookmarkIcon.closest('button');
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/quick',
        expect.objectContaining({
          body: expect.stringContaining('"action":"save"'),
        })
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Saved to your collection',
      })
    );
  });

  it('handles helpful feedback (yes)', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const helpfulButton = screen.getByText(/yes, helpful/i).closest('button');
    expect(helpfulButton).toBeInTheDocument();
    fireEvent.click(helpfulButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/quick',
        expect.objectContaining({
          body: expect.stringContaining('"action":"helpful"'),
        })
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Glad it helped! 👍',
      })
    );
  });

  it('handles not helpful feedback', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const notHelpfulButton = screen.getByText(/not helpful/i).closest('button');
    expect(notHelpfulButton).toBeInTheDocument();
    fireEvent.click(notHelpfulButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/quick',
        expect.objectContaining({
          body: expect.stringContaining('"action":"not-helpful"'),
        })
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Thanks for the feedback',
      })
    );
  });

  it('disables button after action', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    const likeButton = heartIcon.closest('button');
    expect(likeButton).toBeInTheDocument();
    fireEvent.click(likeButton!);
    
    await waitFor(() => {
      expect(likeButton).toBeDisabled();
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed to save feedback' }),
    } as Response);
    
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);
    
    // Should not show success toast on error
    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Thanks! ❤️',
        })
      );
    });
  });

  it('does not allow duplicate actions', async () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    const likeButton = heartIcon.closest('button');
    expect(likeButton).toBeInTheDocument();
    
    // First click
    fireEvent.click(likeButton!);
    await waitFor(() => {
      expect(likeButton).toBeDisabled();
    });
    
    // Second click should not trigger another API call
    const callCount = vi.mocked(global.fetch).mock.calls.length;
    fireEvent.click(likeButton!);
    
    // Wait a bit to ensure no additional calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(vi.mocked(global.fetch).mock.calls.length).toBe(callCount);
  });

  it('includes promptId in API request', async () => {
    render(<QuickFeedback promptId="test-prompt-456" />);
    
    const heartIcon = screen.getByTestId('heart-icon');
    const likeButton = heartIcon.closest('button');
    expect(likeButton).toBeInTheDocument();
    fireEvent.click(likeButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const callBody = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]?.body as string);
      expect(callBody.promptId).toBe('test-prompt-456');
    });
  });

  it('shows privacy notice', () => {
    render(<QuickFeedback promptId="test-prompt-123" />);
    
    expect(screen.getByText(/we collect feedback/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });
});

