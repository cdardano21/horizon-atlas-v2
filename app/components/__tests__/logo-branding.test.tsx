import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RouteFrame from '../RouteFrame';

describe('public route branding', () => {
  it('shows the DestinationFinderAI logo on public route layouts', () => {
    render(
      <RouteFrame
        eyebrow="Public page"
        title="A public route"
        description="This should expose the brand logo prominently."
      />,
    );

    expect(screen.getByAltText(/DestinationFinderAI/i)).toBeInTheDocument();
  });
});
