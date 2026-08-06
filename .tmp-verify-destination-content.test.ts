import { describe, it } from 'vitest';
import { getDestinationContent } from './app/lib/destination-content';

describe('destination content verification', () => {
  it('returns a supabase-backed destination for spearfish', async () => {
    const result = await getDestinationContent('spearfish-south-dakota-united-states');
    console.log(JSON.stringify({
      source: result?.source,
      slug: result?.destination.slug,
      city: result?.destination.city,
      country: result?.destination.country,
      description: result?.destination.description,
      overview: result?.destination.overview,
      climate: result?.destination.climate,
      lifestyle: result?.destination.lifestyle,
      transportation: result?.destination.transportation,
    }, null, 2));
  });
});
