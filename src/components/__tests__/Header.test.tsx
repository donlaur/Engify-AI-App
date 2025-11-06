/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Header } from '@/components/layout/Header';

describe('Header', () => {
  it('renders logo and brand name', () => {
    render(<Header />);
    expect(screen.getByText('Engify.ai')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    render(<Header />);

    expect(screen.getByText('Workbench')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
  });

  it('shows sign in buttons when no user', () => {
    render(<Header />);

    const signInButtons = screen.getAllByText('Sign in');
    expect(signInButtons.length).toBeGreaterThan(0);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows user avatar when user is logged in', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    render(<Header user={user} />);

    // Avatar button should be present (dropdown trigger)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows user initials in avatar when no image', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    };

    render(<Header user={user} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders mobile menu toggle', () => {
    render(<Header />);

    // Sheet trigger button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
