/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Example Component Test
 *
 * Demonstrates TDD approach for component testing
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';

// Simple example component for testing
function ExampleButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
}

describe('ExampleButton', () => {
  it('renders children correctly', () => {
    render(<ExampleButton onClick={() => {}}>Click me</ExampleButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(
      <ExampleButton onClick={handleClick}>Click me</ExampleButton>
    );

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('has correct className', () => {
    render(<ExampleButton onClick={() => {}}>Click me</ExampleButton>);
    expect(screen.getByText('Click me')).toHaveClass('btn');
  });
});
