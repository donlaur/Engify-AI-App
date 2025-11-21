/**
 * Tests for FeedManagementPanel component
 * OpsHub panel for managing RSS/Atom/API feeds
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FeedManagementPanel } from '@/components/opshub/panels/FeedManagementPanel';

describe('FeedManagementPanel', () => {
  it('should render without crashing', () => {
    const { container } = render(<FeedManagementPanel />);
    expect(container).toBeDefined();
  });
});

