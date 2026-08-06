import { getDestinationContent } from './app/lib/destination-content';

(async () => {
  const slug = 'spearfish-south-dakota-united-states';
  try {
    const result = await getDestinationContent(slug);
    console.log('RESULT', JSON.stringify({ source: result?.source, destination: result?.destination }, null, 2));
  } catch (error) {
    console.error('CAUGHT', error);
    console.error((error as Error).stack);
  }
})();
