import { describe, it } from 'vitest';
import { getDestinationContent } from './app/lib/destination-content';

describe('supabase direct check', () => {
  it('captures the exact catalog query and raw response', async () => {
    const slug = 'spearfish-south-dakota-united-states';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (typeof url === 'string' && url.includes('/rest/v1/destinations_catalog')) {
        const response = await originalFetch(input, init);
        const text = await response.text();
        console.log('URL', url);
        console.log('BODY', text);
        return new Response(text, { status: response.status, statusText: response.statusText, headers: response.headers });
      }
      return originalFetch(input, init);
    };

    try {
      await getDestinationContent(slug);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
