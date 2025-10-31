/**
 * DetailedRatingModal Component Tests
 * Tests user interactions, form submission, API calls, error states
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DetailedRatingModal } from '@/components/feedback/DetailedRatingModal';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/lib/icons', () => ({
  Icons: {
    star: ({ className }: { className?: string }) => <span data-testid="star-icon" className={className}>⭐</span>,
    check: ({ className }: { className?: string }) => <span data-testid="check-icon" className={className}>✓</span>,
    x: ({ className }: { className?: string }) => <span data-testid="x-icon" className={className}>✗</span>,
    chevronRight: ({ className }: { className?: string }) => <span data-testid="chevron-icon" className={className}>→</span>,
    send: ({ className }: { className?: string }) => <span data-testid="send-icon" className={className}>📤</span>,
    loader: ({ className }: { className?: string }) => <span data-testid="loader-icon" className={className}>⏳</span>,
  },
}));

vi.mock('@/components/ErrorBoundary', () => ({
  FeedbackErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children, onOpenChange }: { open: boolean; children: React.ReactNode; onOpenChange: () => void }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('DetailedRatingModal', () => {
  const mockToast = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    } as any);
    
    // Mock successful API response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Thank you for your feedback' }),
    } as Response);
  });

  it('renders modal when open', () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText(/rate this prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/overall rating/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DetailedRatingModal
        open={false}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('requires rating before submission', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    expect(submitButton).toBeDisabled();
    
    fireEvent.click(submitButton);
    
    // Should show error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Please select a rating',
        })
      );
    });
  });

  it('allows rating selection', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Find star icons (they're wrapped in buttons)
    const starIcons = screen.getAllByTestId('star-icon');
    
    // Click 5th star (rating 5)
    if (starIcons.length >= 5) {
      const starButton = starIcons[4].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
      
      // Should show "Excellent!" text
      await waitFor(() => {
        expect(screen.getByText(/excellent/i)).toBeInTheDocument();
      });
    }
  });

  it('submits rating successfully', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Select rating (click first star)
    const starIcons = screen.getAllByTestId('star-icon');
    if (starIcons.length >= 1) {
      const starButton = starIcons[0].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
    }
    
    // Submit
    const submitButton = screen.getByText(/submit rating/i).closest('button');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton!);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/feedback/rating',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"promptId":"test-prompt-123"'),
        })
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '✅ Rating submitted!',
      })
    );
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('includes rating in submission', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Select rating 5
    const starIcons = screen.getAllByTestId('star-icon');
    if (starIcons.length >= 5) {
      const starButton = starIcons[4].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
    }
    
    const submitButton = screen.getByText(/submit rating/i).closest('button');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton!);
    
    await waitFor(() => {
      const callBody = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]?.body as string);
      expect(callBody.rating).toBeGreaterThan(0);
    });
  });

  it('includes optional comment in submission', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Select rating
    const starIcons = screen.getAllByTestId('star-icon');
    if (starIcons.length >= 1) {
      const starButton = starIcons[0].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
    }
    
    // Add comment
    const commentField = screen.getByPlaceholderText(/what worked well/i);
    fireEvent.change(commentField, { target: { value: 'Great prompt!' } });
    
    // Submit
    const submitButton = screen.getByText(/submit rating/i).closest('button');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton!);
    
    await waitFor(() => {
      const callBody = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]?.body as string);
      expect(callBody.comment).toBe('Great prompt!');
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed to submit rating' }),
    } as Response);
    
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Select rating
    const starIcons = screen.getAllByTestId('star-icon');
    if (starIcons.length >= 1) {
      const starButton = starIcons[0].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
    }
    
    // Submit
    const submitButton = screen.getByText(/submit rating/i).closest('button');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton!);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
    
    // Should not close modal on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting', async () => {
    // Mock slow API response
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      } as Response), 100))
    );
    
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    // Select rating
    const starIcons = screen.getAllByTestId('star-icon');
    if (starIcons.length >= 1) {
      const starButton = starIcons[0].closest('button');
      expect(starButton).toBeInTheDocument();
      fireEvent.click(starButton!);
    }
    
    const submitButton = screen.getByText(/submit rating/i).closest('button');
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton!);
    
    // Should show "Submitting..." and be disabled
    await waitFor(() => {
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('allows canceling without submission', () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    const cancelButton = screen.getByText(/cancel/i).closest('button');
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton!);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows character count for comment', async () => {
    render(
      <DetailedRatingModal
        open={true}
        onClose={mockOnClose}
        promptId="test-prompt-123"
        promptTitle="Test Prompt"
      />
    );
    
    const commentField = screen.getByPlaceholderText(/what worked well/i);
    fireEvent.change(commentField, { target: { value: 'Test comment' } });
    
    await waitFor(() => {
      expect(screen.getByText(/\/500 characters/i)).toBeInTheDocument();
    });
  });
});

