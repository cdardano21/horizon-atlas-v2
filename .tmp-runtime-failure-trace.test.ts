import { describe, it } from 'vitest';
import { getDestinationContent } from './app/lib/destination-content';

describe('runtime failure trace', () => {
  it('captures the exact fetch failure for spearfish', async () => {
    try {
      await getDestinationContent('spearfish-south-dakota-united-states');
    } catch (error) {
      console.error('ERROR_OBJECT', error);
      console.error('STACK', error instanceof Error ? error.stack : String(error));
      if (error instanceof Error && 'cause' in error) {
        console.error('CAUSE', (error as Error & { cause?: unknown }).cause);
      }
    }
  });
});
