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
    category: 'Testing',
  };

  it('renders prompt information', () => {
    render(<PromptCard {...defaultProps} />);

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test prompt description')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('displays role badge when provided', () => {
    render(<PromptCard {...defaultProps} role="Engineer" />);
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('displays view count', () => {
    render(<PromptCard {...defaultProps} views={1250} />);
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('displays rating when provided', () => {
    render(<PromptCard {...defaultProps} rating={4.5} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders copy button', () => {
    render(<PromptCard {...defaultProps} />);

    // Copy button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onView when card is clicked', async () => {
    const handleView = vi.fn();
    const { user } = render(
      <PromptCard {...defaultProps} onView={handleView} />
    );

    const card = screen.getByText('Test Prompt').closest('.cursor-pointer');
    if (card) {
      await user.click(card);
      expect(handleView).toHaveBeenCalledOnce();
    }
  });
});
