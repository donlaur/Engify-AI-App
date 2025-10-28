/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { EmptyState } from '@/components/features/EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items found"
        description="Try adjusting your filters"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders action button when provided', async () => {
    const handleClick = vi.fn();
    const { user } = render(
      <EmptyState
        icon={Inbox}
        title="No items"
        description="Get started"
        action={{
          label: 'Add Item',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders children when provided', () => {
    render(
      <EmptyState icon={Inbox} title="No items" description="Get started">
        <div>Custom content</div>
      </EmptyState>
    );

    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(
      <EmptyState icon={Inbox} title="No items" description="Get started" />
    );

    // Check for SVG element (Lucide icons render as SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
