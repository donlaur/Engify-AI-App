/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/test/utils';
import { PromptCard } from '@/components/features/PromptCard';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('PromptCard', () => {
  beforeEach(() => {
    mockClipboard.writeText.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    id: '1',
    title: 'Test Prompt',
    description: 'A test prompt description',
    content: 'This is the prompt content',
    category: 'testing' as const, // Use lowercase to match PromptCategorySchema
    tags: [],
    views: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
    active: true,
    isPremium: false,
    requiresAuth: false,
  };

  it('renders prompt information', () => {
    render(<PromptCard {...defaultProps} />);

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test prompt description')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument(); // Category badge
  });

  it('displays role badge when provided', () => {
    render(<PromptCard {...defaultProps} role="engineer" />); // Use lowercase to match UserRoleSchema
    expect(screen.getByText('engineer')).toBeInTheDocument();
  });

  // NOTE: View count and rating display removed from PromptCard (Issue #20 - fake data removal)
  // These will be re-added when real tracking is implemented

  it('renders action buttons (heart, share, copy)', () => {
    render(<PromptCard {...defaultProps} />);

    // Should have multiple action buttons (heart, share, copy)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2); // At least 3 icon buttons + "View Details"
  });

  it('renders View Details button', () => {
    render(<PromptCard {...defaultProps} />);

    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('calls onView when View Details is clicked', async () => {
    const handleView = vi.fn();
    const { user } = render(
      <PromptCard {...defaultProps} onView={handleView} />
    );

    const viewButton = screen.getByText('View Details');
    await user.click(viewButton);
    expect(handleView).toHaveBeenCalledOnce();
  });
});
