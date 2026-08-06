import { describe, expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../Hero';
import FeaturedDestinations from '../FeaturedDestinations';
import HowItWorks from '../HowItWorks';
import LaunchBanner from '../LaunchBanner';

describe('homepage messaging', () => {
  it('uses lifestyle-first messaging in the hero', () => {
    render(<Hero />);
    expect(screen.getByText(/DestinationFinderAI helps you discover, compare, and confidently choose places/i)).toBeInTheDocument();
  });

  it('uses grounded language for featured destinations', async () => {
    const content = await FeaturedDestinations();
    render(content);
    expect(screen.getByText(/Start with the places that already feel aligned/i)).toBeInTheDocument();
  });

  it('describes the process in practical terms', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/You move from ideas to a shortlist you can actually test/i)).toBeInTheDocument();
  });

  it('frames launch messaging around practical search guidance', () => {
    render(<LaunchBanner />);
    expect(screen.getByText(/Search the catalog with a practical shortlist in mind/i)).toBeInTheDocument();
  });
});
