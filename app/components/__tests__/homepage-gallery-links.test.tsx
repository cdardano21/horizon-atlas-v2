import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomepageGallery from '../HomepageGallery';

describe('HomepageGallery', () => {
  it('links each featured destination card to its destination guide', () => {
    render(<HomepageGallery />);

    expect(screen.getByRole('link', { name: /valencia skyline at sunset, spain/i })).toHaveAttribute('href', '/destinations/valencia-spain');
    expect(screen.getByRole('link', { name: /rovinj old town, croatia/i })).toHaveAttribute('href', '/destinations/rovinj-croatia');
    expect(screen.getByRole('link', { name: /tivat bay, montenegro/i })).toHaveAttribute('href', '/destinations/tivat-montenegro');
    expect(screen.getByRole('link', { name: /lake bled mountain panorama, slovenia/i })).toHaveAttribute('href', '/destinations/lake-bled-slovenia');
  });
});
