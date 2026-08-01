const collapseWhitespace = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizeText = (value) => collapseWhitespace(value).toLowerCase();

export const sanitizeExternalSummary = (value) => {
  const clean = collapseWhitespace(value || '').replace(/^"|"$/g, '').trim();
  if (!clean) return '';
  return clean.replace(/\s+/g, ' ').trim();
};

const pick = (items) => items.find(Boolean) || '';

const citySpecificFeatureBoosts = (city, country) => {
  const cityName = normalizeText(city);
  const countryName = normalizeText(country);
  const features = [];

  if (cityName === 'rome' && countryName === 'italy') {
    features.push('ancient ruins, piazzas, and neighborhood life');
  }
  if (cityName === 'cascais' && countryName === 'portugal') {
    features.push('an Atlantic seafront, marina, and old-town rhythm');
  }
  if (cityName === 'monopoli' && countryName === 'italy') {
    features.push('a whitewashed harbor and seafront promenade');
  }
  if (cityName === 'cavtat' && countryName === 'croatia') {
    features.push('a harbor promenade and Adriatic waterfront');
  }
  if (cityName === 'braga' && countryName === 'portugal') {
    features.push('churches, shaded lanes, and historic squares');
  }
  if (cityName === 'porto' && countryName === 'portugal') {
    features.push('riverfront streets, tiled facades, and market life');
  }

  return features;
};

const buildFeatureList = (text, tags = [], city = '', country = '') => {
  const lower = normalizeText(text);
  const tagLower = (tags || []).map((tag) => normalizeText(tag));
  const features = [];

  if (/fortress|castle|bourtzi|palamidi|akronafplia/i.test(lower) || tagLower.some((tag) => /fortress|castle/i.test(tag))) {
    features.push('fortress walls and hilltop landmarks');
  }
  if (/harbor|harbour|waterfront|coastal|beach|promenade|bay|port|sea|shore|gulf|cove/i.test(lower) || tagLower.some((tag) => /harbor|harbour|beach|waterfront|coastal|promenade|bay|adriatic|sea|port/i.test(tag))) {
    features.push('harborfront streets and waterfront life');
  }
  if (/market|food|restaurant|street food|café|cafe|culinary|dining|gastronomy/i.test(lower) || tagLower.some((tag) => /market|food|restaurant|culinary|dining|gastronomy/i.test(tag))) {
    features.push('market streets and local dining');
  }
  if (/baroque|church|cathedral|religious|bom jesus|heritage|monastery|san|santo/i.test(lower) || tagLower.some((tag) => /baroque|church|cathedral|religious|heritage/i.test(tag))) {
    features.push('churches, civic squares, and heritage lanes');
  }
  if (/museum|gallery|theater|monument|square|old town|district|neighborhood|historic center|piazza|architecture|historic|ancient|medieval/i.test(lower) || tagLower.some((tag) => /museum|gallery|monument|historic|old town|piazza|architecture/i.test(tag))) {
    features.push('historic streets and neighborhood life');
  }
  if (/airport|rail|metro|tram|station|bus|transport|walkable|compact/i.test(lower) || tagLower.some((tag) => /rail|metro|tram|airport|station|transport|walkable|compact/i.test(tag))) {
    features.push('practical transport links');
  }
  if (/park|garden|mountain|forest|river|desert|valley|nature|green|vineyard|hill|upland|coast/i.test(lower) || tagLower.some((tag) => /park|garden|forest|river|desert|mountain|green|nature|vineyard|hill|upland/i.test(tag))) {
    features.push('green space and outdoor access');
  }
  if (/romantic|elegant|lively|calm|peaceful|picturesque|charming|sunny|warm|bright|mild/i.test(lower)) {
    features.push('a strong sense of atmosphere');
  }

  features.push(...citySpecificFeatureBoosts(city, country));

  return Array.from(new Set(features));
};

const buildClimateCue = (text) => {
  const lower = normalizeText(text);
  if (/mediterranean/i.test(lower)) return 'Mediterranean, with warm summers and mild winters that keep outdoor life practical for much of the year';
  if (/tropical/i.test(lower)) return 'tropical, with humidity and heat that make home comfort and daily timing matter more than a headline forecast';
  if (/continental/i.test(lower)) return 'continental, with four-season shifts that shape how people plan their routines';
  if (/subtropical/i.test(lower)) return 'subtropical, with warm shoulders and enough sun to make outdoor living feel natural for much of the year';
  if (/humid/i.test(lower)) return 'humid, with weather that rewards shade, airflow, and well-timed outdoor hours';
  if (/mild|warm|cool|sunny|winter|summer|spring|autumn/i.test(lower)) {
    const firstCue = lower.match(/(mild|warm|cool|sunny|humid|dry|temperate|continental|mediterranean|subtropical|tropical)/i);
    return `${firstCue ? firstCue[1] : 'temperate'} weather that shapes the daily rhythm of the place`;
  }
  return 'a climate that matters less as a statistic than as part of the everyday rhythm';
};

const buildTransportCue = (text) => {
  const lower = normalizeText(text);
  if (/airport|rail|metro|tram|station|bus|transport/i.test(lower)) {
    return 'Getting around is easiest when the home base keeps the center, the transport links, and everyday services close enough that daily movement stays simple.';
  }
  if (/walkable|compact|old town|historic center/i.test(lower)) {
    return 'Getting around is easiest when the home base keeps the walkable center, daily services, and arrival points close enough that the place feels effortless to navigate.';
  }
  return 'Getting around is easiest when the home base keeps the everyday routes and practical errands close enough that the place feels calm rather than over-managed.';
};

const buildLifestyleCue = (text) => {
  const lower = normalizeText(text);
  const activities = [];

  if (/harbor|harbour|waterfront|beach|promenade|sea|coast/i.test(lower)) activities.push('waterfront walks and time near the shore');
  if (/market|food|restaurant|café|cafe|street food/i.test(lower)) activities.push('market mornings and long meals');
  if (/museum|cathedral|piazza|old town|historic|fortress|castle/i.test(lower)) activities.push('historic streets and cultural stops');
  if (/park|garden|mountain|forest|river|desert|nature/i.test(lower)) activities.push('outdoor time and scenic excursions');
  if (/café|cafe|coffee|coffeehouse/i.test(lower)) activities.push('coffee breaks and neighborhood time');

  if (activities.length === 0) return 'Daily life often settles into a pattern of familiar streets, practical errands, and the small rituals that give a place its texture.';
  return `Daily life often turns on ${activities.slice(0, 3).join(', ')}.`;
};

export function buildExternalNarrativeSet(city, country, summaryText, externalText, tags = []) {
  const summary = sanitizeExternalSummary(summaryText || '');
  const combinedText = collapseWhitespace([summary, externalText].filter(Boolean).join(' '));
  const features = buildFeatureList(combinedText, tags, city, country);
  const featureClause = features.slice(0, 3).join(', ');
  const description = featureClause
    ? `${city} is shaped by ${featureClause}, and the everyday rhythm is defined by the way residents use those spaces.`
    : `${city} is shaped by its streets, public life, and the everyday habits of the people who live there.`;

  const overview = featureClause
    ? `For longer stays, ${city} is strongest when the home base keeps those everyday anchors close enough that the day feels calm rather than over-managed.`
    : `For longer stays, ${city} is strongest when the home base keeps local services, daily routes, and the places people return to most often close at hand.`;

  const climate = `The climate is ${buildClimateCue(combinedText)}.`;
  const lifestyle = buildLifestyleCue(combinedText);
  const transportation = buildTransportCue(combinedText);

  return {
    description,
    overview,
    climate,
    lifestyle,
    transportation,
  };
}
