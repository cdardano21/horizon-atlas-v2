import { describe, it } from 'vitest';
import { getDestinationContent } from './app/lib/destination-content';

describe('fetch trace', () => {
  it('logs the exact supabase fetch URL and error', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      console.log('FETCH_URL', url);
      try {
        return await originalFetch(input, init);
      } catch (error) {
        console.error('FETCH_ERROR', error);
        console.error('FETCH_STACK', error instanceof Error ? error.stack : String(error));
        throw error;
      }
    }) as typeof fetch;

    try {
      const result = await getDestinationContent('spearfish-south-dakota-united-states');
      console.log('RESULT_SOURCE', result?.source);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
