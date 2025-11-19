/**
 * Tests for AIToolUpdates component
 * Component that displays AI tool/model updates
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AIToolUpdates } from '@/components/features/AIToolUpdates';

describe('AIToolUpdates', () => {
  it('should render without crashing', () => {
    const { container } = render(<AIToolUpdates />);
    expect(container).toBeDefined();
  });

  it('should render with toolId prop', () => {
    const { container } = render(<AIToolUpdates toolId="cursor" />);
    expect(container).toBeDefined();
  });

  it('should render with modelId prop', () => {
    const { container } = render(<AIToolUpdates modelId="gpt-4" />);
    expect(container).toBeDefined();
  });
});

