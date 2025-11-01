/**
 * Footer Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('should render footer with links', () => {
    render(<Footer />);

    expect(screen.getByText('Engify.ai')).toBeInTheDocument();
    expect(screen.getByText(/master prompt engineering/i)).toBeInTheDocument();
  });

  it('should render all navigation sections', () => {
    render(<Footer />);

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('should render copyright year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it('should render contact email link', () => {
    render(<Footer />);

    const contactLink = screen.getByText('Contact');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute('href', 'mailto:donlaur@engify.ai');
  });

  it('should render all product links', () => {
    render(<Footer />);

    expect(screen.getByText('AI Workbench')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('should render social links', () => {
    render(<Footer />);

    const githubLink = screen.getByText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/donlaur/Engify-AI-App');

    const linkedinLink = screen.getByText('LinkedIn');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.closest('a')).toHaveAttribute('href', 'https://linkedin.com/in/donlaur');
  });
});

