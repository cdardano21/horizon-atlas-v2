import { curatedCityImagesBySlug } from "./curatedCityImages";
import { curatedCityImageGalleriesBySlug } from "./curatedCityImageGalleries";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
import { generatedDestinationCardFacts } from "./generated-destination-card-facts";
import {
  type Destination,
  type DestinationMemberDetails,
  type DestinationMonthlyWeather,
  destinations,
} from "./destinations";
import { sanitizeExternalSourceUrl } from "./source-links";

type Seed = (typeof generatedCommandCenterSeeds)[string];

const scoreFromNarrative = (value: string): number | null => {
  const match = value.match(/(\d{2,3})\s*\/\s*100/);
  if (!match) return null;
  const score = Number(match[1]);
  if (!Number.isFinite(score)) return null;
  return Math.max(40, Math.min(99, score));
};

const lookupQuickMetric = (seed: Seed | undefined, key: string) =>
  seed?.quickMetrics?.find((metric) => metric.key === key)?.displayValue
  ?? seed?.quickMetrics?.find((metric) => metric.key === key)?.value
  ?? null;

const lookupFact = (slug: string, label: string) =>
  generatedDestinationCardFacts[slug]?.facts.find((fact) => fact.label.toLowerCase() === label.toLowerCase()) ?? null;

const firstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (value && value.trim().length > 0) return value.trim();
  }
  return null;
};

const isWeakAnchor = (value: string | null | undefined, city: string) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === city.trim().toLowerCase()) return true;
  return normalized.includes("not published")
    || normalized.includes("no verified")
    || normalized.includes("source expansion")
    || normalized.includes("framework")
    || normalized.includes("support portal")
    || normalized.includes("coastal / water access");
};

const pickAnchor = (city: string, fallback: string, ...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (!isWeakAnchor(value, city)) return value!.trim();
  }
  return fallback;
};

const stableHash = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const normalizeNarrativeVoice = (value: string) => value
  .replace(/\bretirees?\b/gi, "people")
  .replace(/\bretiree\b/gi, "resident")
  .replace(/\bretirement planning\b/gi, "long-stay planning")
  .replace(/\bretirement-first\b/gi, "long-stay-first")
  .replace(/\bretirement-oriented\b/gi, "long-stay-oriented")
  .replace(/\bretirement\b/gi, "long-stay");

const isValidImage = (value: string | undefined | null) => Boolean(value && value.trim().length > 0);

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);

const IMAGE_STOP_WORDS = new Set(["the", "and", "del", "de", "la", "el", "di", "da"]);

const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

const imageLocationTokens = (destination: Destination): string[] => {
  const slugTokens = destination.slug.split("-");
  const cityTokens = destination.city.toLowerCase().split(/[^a-z0-9]+/g);
  const countryTokens = destination.country.toLowerCase().split(/[^a-z0-9]+/g);

  const merged = [...slugTokens, ...cityTokens, ...countryTokens]
    .map((token) => normalizeToken(token))
    .filter((token) => token.length >= 3)
    .filter((token) => !IMAGE_STOP_WORDS.has(token));

  return Array.from(new Set(merged));
};

const extractFilenameTokens = (source: string): string[] => {
  const sanitized = sanitizeExternalSourceUrl(source);
  if (!sanitized) return [];

  try {
    const parsed = new URL(sanitized);
    const filename = decodeURIComponent(parsed.pathname.split("/").pop() ?? "");
    return filename
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => normalizeToken(token))
      .filter((token) => token.length >= 3);
  } catch {
    return [];
  }
};

const isTrustedImageSource = (source: string): boolean => {
  const sanitized = sanitizeExternalSourceUrl(source);
  if (!sanitized) return false;

  try {
    const host = new URL(sanitized).hostname.toLowerCase();
    return TRUSTED_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
};

const isDestinationAssociatedImage = (source: string, destination: Destination): boolean => {
  const filenameTokens = extractFilenameTokens(source);
  if (filenameTokens.length === 0) return false;

  const locationTokens = imageLocationTokens(destination);
  return locationTokens.some((token) => filenameTokens.some((fileToken) => fileToken.includes(token) || token.includes(fileToken)));
};

type NarrativeOverride = {
  description: string;
  overview: string;
  climate: string;
  lifestyle: string;
  transportation: string;
};

const flagshipNarrativeOverrides: Partial<Record<string, NarrativeOverride>> = {
  "cape-town-south-africa": {
    description: "Cape Town is a city that earns its reputation through atmosphere rather than spectacle. Its best days often come in layers: a morning on the Atlantic edge, a long lunch in a neighborhood that feels lived in, and an evening that turns from city to sea without much fuss.",
    overview: "Cape Town suits people who want drama and daily ease in the same place, provided the housing choice is grounded in the actual rhythm of the neighborhood. The competitive edge is not just scenery; it is the way the city balances civic life, coastline, and social energy.",
    climate: "The climate is part of the appeal, but it is also a planning discipline. Summer heat, wind, and long sun exposure shape daily routines, while the shoulder seasons often feel most balanced for long stays.",
    lifestyle: "A good week here usually mixes the table, the shoreline, and the city’s more ordinary pleasures: markets, walks, coffee, and evenings that feel social without becoming relentless.",
    transportation: "The city works best when transport is treated as a daily design problem rather than an afterthought. Home location matters as much as airport access because it shapes whether the week feels effortless or over-managed.",
  },
  "cavtat-croatia": {
    description: "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
    overview: "Cavtat works best when the long-stay case is built around a compact waterfront base, easy walks, and a simple routine that feels local rather than resort-like.",
    climate: "The Adriatic climate keeps summer warm and bright while the shoulder seasons stay long enough for outdoor living, swimming, and evening walks without much fuss.",
    lifestyle: "A good week here usually means harbor breakfasts, a swim, a slow promenade stroll, a coffee, and dinner within a short radius of home.",
    transportation: "Mobility is strongest when your base keeps the harbor, daily services, cafés, and the Dubrovnik connection within a compact and manageable loop.",
  },
  "cascais-portugal": {
    description: "Cascais feels most persuasive when the Atlantic light, the marina, and the old town all seem to belong to the same easy day. Its appeal comes from how quickly a promenade walk can turn into a long lunch, a swim, and an evening that still feels local rather than overprogrammed.",
    overview: "Cascais suits people who want a polished coastal base with real human scale. The strongest fit is usually someone who values a walkable seafront, a gentler pace, and access to Lisbon without surrendering the pleasures of a smaller place.",
    climate: "The Atlantic climate gives Cascais a mild, breathable rhythm that makes the shoulder seasons especially attractive. Sea breezes soften the heat and keep the place feeling more forgiving than many southern European coastlines.",
    lifestyle: "A good week here often revolves around the promenade, the marina, the beach, and the small-town pleasures of cafés and seafood lunches that still feel local rather than curated.",
    transportation: "Cascais is easiest to enjoy when you treat transport as part of the lifestyle choice. Lisbon access is a real plus, but the ideal home base is the one that makes beach, shops, and appointments feel close without requiring a car every day.",
  },
  "monopoli-italy": {
    description: "Monopoli feels most persuasive when the old harbor, the whitewashed lanes, and the sea-facing promenade all seem to belong to the same easy day. Its charm comes from how quickly a walk can turn into breakfast by the water, a market stop, and a late-afternoon swim.",
    overview: "Monopoli suits people who want small-city pleasures with real coastal atmosphere. The best fit is usually someone who values walkability, manageable daily errands, and a slower rhythm that still allows easy access to larger regional centers.",
    climate: "The climate is one of Monopoli’s clearest advantages, with warm Mediterranean light and a pace that makes outdoor life feel practical for much of the year. Shoulder seasons matter because they reveal whether a home remains comfortable beyond the peak holiday months.",
    lifestyle: "A good week here usually unfolds around the waterfront, the old town, local seafood, and the kind of unhurried rituals that make a place feel lived in rather than merely scenic.",
    transportation: "Monopoli is easiest to love when your home base keeps the harbor, the center, and regional road access connected without requiring constant driving. That balance is what makes the place feel practical rather than merely pretty.",
  },
  "trieste-italy": {
    description: "Trieste feels like a city that rewards patience. Its seafront, elegant streets, and café culture create an atmosphere that is both cosmopolitan and quietly human, especially when you notice how the daily rhythm unfolds around the waterfront and the old center.",
    overview: "Trieste suits people who want a European city with strong cultural texture, a less hectic pace than larger capitals, and the possibility of a life that feels both practical and refined. The strongest fit usually comes from people who value steadiness over spectacle.",
    climate: "The climate is maritime and often more forgiving than inland Italy, with a breeze that changes the feel of the day and seasons that are easier to live with than the surrounding region might suggest.",
    lifestyle: "A satisfying week often involves long coffees, waterfront walks, local food, and evenings that feel social without becoming intense. The city is at its best when life is built around familiarity rather than novelty.",
    transportation: "Trieste is easiest to enjoy when your housing choice keeps stations, clinics, and the waterfront within a contained daily radius. The city’s appeal grows when everyday movement remains simple and unforced.",
  },
  "marrakesh-morocco": {
    description: "Marrakesh feels most convincing when the medina, the riad courtyards, and the city’s public life all seem to belong to the same sensory day. Its appeal comes from texture, atmosphere, and the way ordinary errands turn into part of the experience.",
    overview: "Marrakesh fits people who want a deeply textured urban life and are comfortable with heat, intensity, and a more demanding daily rhythm. The strongest cases come from people who want culture and social energy more than calm.",
    climate: "The climate is one of the city’s defining features. Hot summers, bright winters, and strong sun mean comfort planning is essential, especially for long stays.",
    lifestyle: "A good week often mixes souk wandering, courtyard time, neighborhood cafés, and evenings that stay lively but not relentless.",
    transportation: "The city is easiest to live in when your home base handles the medina, the newer districts, and daily errands without forcing constant taxi dependence.",
  },
  "sydney-australia": {
    description: "Sydney works best when you stop thinking about it as a single skyline and start noticing how neighborhoods hold together around harbors, beaches, and everyday routines. Its appeal is less about one icon than about the way a life can feel both expansive and practical.",
    overview: "Sydney suits people who want climate, culture, and convenience but are willing to choose districts with care. The best fit is often the neighborhood that makes ferries, beaches, cafés, and medical access feel effortless rather than aspirational.",
    climate: "Sydney’s climate is a major part of the appeal, with warm summers, mild winters, and enough sunlight to make outdoor life feel practical for much of the year.",
    lifestyle: "A satisfying week often combines a harbor walk, a beach morning, a neighborhood café, and an evening that feels social without turning into a performance.",
    transportation: "Sydney is easiest to love when ferries, trains, and buses are paired with a home base that cuts daily friction. The city becomes far more livable when the route to clinics, shops, and social life stays simple.",
  },
  "athens-greece": {
    description: "Athens rewards attention because its pleasures are layered rather than obvious. The city’s appeal comes from neighborhood life, archaeological presence, and the way an ordinary day can move from a café to a market to a hilltop view without feeling overdesigned.",
    overview: "Athens suits people who want a capital city with depth, variety, and a strong sense of place. The strongest fit comes from people who can handle heat, noise, and complexity in exchange for a richer urban life.",
    climate: "The climate is warm, bright, and often demanding, which is why summer comfort and building quality matter so much. The city is most appealing when long-stay planning treats heat as a design issue rather than a footnote.",
    lifestyle: "A satisfying week often mixes neighborhood cafés, market errands, archaeological visits, and evenings that feel both social and intensely local. Athens is at its best when daily life feels textured rather than polished.",
    transportation: "Athens is easiest to enjoy when your home base keeps transit, clinics, and neighborhood life within a manageable everyday circle. The city’s practicality improves dramatically when district choice is treated as central rather than incidental.",
  },
  "barcelona-spain": {
    description: "Barcelona is one of those cities where the everyday experience matters more than the headline image. It works because the city can be lived in at many scales: a market breakfast, a long promenade, a neighborhood café, or a late evening in a district that still feels local.",
    overview: "Barcelona suits people who want urban energy, cultural depth, and strong public life without giving up the pleasures of daily routine. The city becomes more livable when housing choice is aligned with neighborhood rhythm rather than abstract prestige.",
    climate: "The climate is one of the city’s main strengths, with mild winters and long periods that make outdoor life feel ordinary rather than seasonal. Summer heat, however, remains a real planning variable.",
    lifestyle: "A good week in Barcelona often looks like a mix of neighborhood rituals and city pleasures: markets, walks, long lunches, and evenings that can stay social without becoming exhausting.",
    transportation: "Barcelona is easiest to appreciate when the home base supports metro, bus, and coastal movement without turning daily life into a logistical challenge. That is where the city’s practical charm really shows.",
  },
  "florence-italy": {
    description: "Florence rewards a slower read. Its pleasures arrive through streets, piazzas, art collections, and the daily rhythm of a city that still feels human at the scale of everyday life.",
    overview: "Florence suits people who want historic character, culture, and a very walkable urban environment without the pace of a giant metropolis. The strongest fit is usually someone who values beauty, continuity, and a highly structured daily life.",
    climate: "The climate is generally pleasant, but summer heat and winter humidity shape comfort in ways that matter for long stays. The city is best understood through how the seasons change daily routines rather than through averages alone.",
    lifestyle: "A satisfying week often includes market mornings, museum time, neighborhood cafés, and evenings that feel calm rather than overpacked. Florence tends to reward people who like their pleasures layered and repeatable.",
    transportation: "Florence is easiest to enjoy when your housing choice keeps the center, local services, and airport transfers inside a clear, manageable loop. The city works best when daily movement is kept simple.",
  },
  "rome-italy": {
    description: "Rome is a city where the pleasures are both grand and intimate. Its appeal comes from the overlap of ancient structure, neighborhood life, and a daily rhythm that can feel rich even when it is ordinary.",
    overview: "Rome suits people who want a capital city with depth, texture, and a huge range of ways to structure daily life. The strongest fit is usually someone who values cultural richness, local habits, and a city that can feel both expansive and very personal.",
    climate: "The climate is one of Rome’s defining features: long warm seasons, strong sun, and a summer intensity that makes building quality and shade more important than many newcomers expect.",
    lifestyle: "A good week often includes a neighborhood coffee, a market stop, a piazza pause, and an evening meal that feels local rather than theatrical. Rome works best when daily life is built around repetition rather than novelty.",
    transportation: "Rome is easiest to live with when your home base keeps transit, clinics, and neighborhood errands inside a manageable loop. The city becomes far more practical when the daily route is simple.",
  },
  "nice-france": {
    description: "Nice feels most persuasive when the sea, the promenade, and the old-city streets all seem to belong to the same easy Mediterranean day. Its appeal comes from the way a calm morning can turn into a long lunch, a beach hour, and an evening on the waterfront.",
    overview: "Nice suits people who want a polished coastal life with strong weather, good social energy, and a daily rhythm that feels more graceful than hectic. The strongest fit is often someone who wants comfort and beauty without fully surrendering urban convenience.",
    climate: "The climate is one of Nice’s great advantages: bright winters, warm shoulder seasons, and enough sea breeze to make outdoor life feel practical for much of the year.",
    lifestyle: "A satisfying week here often combines a promenade walk, local markets, café time, and evenings that feel leisurely rather than overprogrammed. Nice rewards people who like their pleasures repeatable and local.",
    transportation: "Nice is easiest to enjoy when your home base keeps the waterfront, the center, and airport access connected without constant car dependence. That creates the sense of ease that makes the place feel genuinely livable.",
  },
  "seville-spain": {
    description: "Seville feels most convincing when you notice how the city lives in layers: morning light on the streets, long lunches, late-afternoon walks, and evenings that seem to stretch because the city has its own pace.",
    overview: "Seville suits people who want warmth, texture, and a very social urban life without the scale or intensity of a giant metropolis. It is strongest for people who want a city that feels expressive, lived in, and deeply rooted in its routines.",
    climate: "The climate is hot, dry, and unmistakably part of the experience. Long-stay comfort depends on understanding how heat changes the day and how housing, shade, and timing matter more than simple averages.",
    lifestyle: "A good week often includes neighborhood wandering, late meals, market stops, and evenings that feel generous rather than rushed. Seville rewards people who enjoy a city with a strong daily rhythm and a strong social temperature.",
    transportation: "Seville is easiest to live with when your home base keeps daily errands, clinics, and social life inside a manageable radius. That is what turns the city’s energy into a practical strength.",
  },
  "palma-de-mallorca-spain": {
    description: "Palma feels most persuasive when the harbor, the old city, and the seaside life all seem to belong to the same bright, easy day. Its charm is not only scenic; it is also the way a simple morning can slip into a long lunch and a late waterfront walk.",
    overview: "Palma suits people who want island living with urban comfort, cultural texture, and strong weather. The strongest fit is usually someone who values a navigable city, a polished daily rhythm, and easy access to both coast and culture.",
    climate: "The climate is one of Palma’s great advantages, with long sunny seasons and enough sea influence to make outdoor life feel practical for much of the year. Summer heat still matters, especially in the urban core.",
    lifestyle: "A satisfying week often combines old-city wandering, harbor time, café stops, and evening meals that feel social without becoming too intense. Palma works best when the city feels both relaxed and useful.",
    transportation: "Palma is easiest to enjoy when your home base keeps the center, the waterfront, and airport access within a simple daily geometry. That balance is what makes the city feel effortless rather than merely attractive.",
  },
  "porto-portugal": {
    description: "Porto is a river city of tiled facades, market streets, and long lunches, where the Douro, the old center, and the Atlantic-facing edge all shape the same easy day.",
    overview: "Porto works best for people who want a real urban life with texture, good food, and a human scale, provided the home base keeps hills, transit, and daily errands manageable.",
    climate: "The Atlantic climate keeps the city comfortable in ways that matter: warm summers without becoming punishing, mild winters, and enough sea influence to make outdoor life feel normal for much of the year.",
    lifestyle: "A good week here usually mixes a market stop, a riverside walk, a café pause, and dinner somewhere that feels established rather than staged.",
    transportation: "Mobility is strongest when the home base makes the metro, train, river crossings, and everyday errands feel connected rather than constantly uphill or overplanned.",
  },
  "lisbon-portugal": {
    description: "Lisbon rewards attention. Its pleasures arrive through light, hills, viewpoints, and the everyday choreography of neighborhoods that still feel like they belong to the city rather than to a brochure.",
    overview: "Lisbon suits people who want a capital city with warmth, texture, and urban energy but also a strong sense of lived-in character. The right district often matters more than the city in the abstract.",
    climate: "The climate is one of the city’s clearest advantages: mild winters, sunlit shoulder seasons, and enough warmth to make outdoor life feel normal for much of the year.",
    lifestyle: "A good week here usually combines overlooked rituals: neighborhood cafes, tram rides, market stops, and long evenings that feel both social and unhurried.",
    transportation: "Lisbon is easiest to love when transit and topography are treated as part of the same design problem. The best homes make the city’s hills feel like a feature rather than a burden.",
  },
  "valencia-spain": {
    description: "Valencia has a way of making everyday life feel pleasantly full. The sea is close, the markets still feel lived in, and neighborhoods such as Ruzafa and El Cabanyal give the city a social texture that many coastal places lose.",
    overview: "It suits people who want warmth, urban convenience, and a daily rhythm that can be both active and unhurried. The city is at its best when you choose a neighborhood that fits your temperament: old-city charm, inner-city energy, or a relaxed seaside edge.",
    climate: "The climate is one of the city’s great advantages: bright winters, long shoulder seasons, and enough sea breeze to keep the summer from feeling quite so punishing. For many people, the appeal is less about escaping heat than learning to live well inside it.",
    lifestyle: "A normal week might include a market breakfast, a walk under the Turia trees, a swim or a long coffee by the water, and an evening meal somewhere that still feels local rather than staged.",
    transportation: "Valencia is unusually forgiving for a city of its size. Metro, tram, and the airport all support a life that can stay active without becoming car-dependent.",
  },
  "medellin-colombia": {
    description: "Medellín feels most persuasive when you notice how quickly the city becomes usable. Morning light, neighborhood life, and the pace of everyday errands create a sense of ease that is hard to fake and easy to fall for.",
    overview: "It is a strong fit for people who want a warm urban life with real energy and a daily rhythm that can become remarkably comfortable. The strongest cases come from people who value local texture over polished resort-style living.",
    climate: "The climate is a major part of the city’s appeal because it allows an outdoor lifestyle that feels practical rather than ornamental. The key is choosing a neighborhood that handles heat, elevation, and daily movement well.",
    lifestyle: "Daily life here often centers on coffee, neighborhood walks, local food, and routines that feel active without being overpacked. The city reveals itself in those repeated, ordinary pleasures.",
    transportation: "Medellín’s infrastructure gives it an unusually practical edge for long stays. The real question is whether your home base connects you easily to clinics, groceries, and the parts of the city you actually want to use.",
  },
  "kyoto-japan": {
    description: "Kyoto is a city of layered rhythms: temple districts, leafy lanes, market mornings, and a way of living that rewards attention rather than speed. Its greatest appeal is that it still feels human at the scale of daily life.",
    overview: "Kyoto suits people who want cultural depth, order, and a strong sense of place without surrendering the convenience of a major urban center. The most compelling version of the move is the one that pairs a calm neighborhood with a practical routine.",
    climate: "The seasons are a genuine part of the experience here, and that matters for long-stay planning. Spring and autumn are often the most persuasive times to judge the city, while summer and winter test comfort in very different ways.",
    lifestyle: "A satisfying week in Kyoto often looks simple: neighborhood walks, local food, calm public spaces, and evenings that feel contemplative rather than loud.",
    transportation: "The city is easier to live in than its reputation suggests when home, transit, and daily errands are aligned. The decisive factor is usually not access to the whole region but whether everyday movement remains frictionless.",
  },
  "tokyo-japan": {
    description: "Tokyo is a city that can feel vast and intimate at once. Its appeal comes from the fact that almost any ordinary day can include a market, a garden, a neighborhood cafe, and a train ride that somehow feels like part of the experience.",
    overview: "Tokyo works best for people who want scale, choice, and continuous stimulation without losing the possibility of a very local life. The real luxury here is having the option to be both connected and anonymous within the same day.",
    climate: "The climate is highly seasonal, and the city’s comfort profile changes dramatically depending on the month. Long-stay planning should be shaped by humidity, heat, and the rhythm of indoor-outdoor living.",
    lifestyle: "Daily life in Tokyo often thrives on repetition: the right cafe, the right neighborhood loop, and a reliable set of routines that make the city feel manageable rather than overwhelming.",
    transportation: "Movement is one of Tokyo’s great strengths, and it is also the reason the city can feel so livable. Good housing choices make daily life feel easier than the map might suggest.",
  },
  "lucca-italy": {
    description: "Lucca is for people who care about daily elegance more than spectacle: intact Renaissance walls for morning loops, a compact historic core for errands on foot, and a social rhythm built around piazzas rather than traffic-heavy boulevards.",
    overview: "Lucca works best when your relocation thesis is walkability with refinement. The strongest fit tends to be buyers who want calm, repeatable routines inside or near the walls, with straightforward rail access for larger-city appointments and airport runs.",
    climate: "Lucca has a warm-temperate Tuscan pattern with humid summers and milder shoulder seasons. For long-stay comfort, focus on spring and early autumn scouting windows and verify apartment heat control for winter moisture and summer peaks.",
    lifestyle: "Daily life in Lucca is defined by compact routines: markets, pharmacy runs, cafe stops, and evening walks on the walls. It rewards people who prefer consistency, culture, and low-friction foot travel over high-energy nightlife.",
    transportation: "Lucca's mobility advantage is practical, not flashy: rail links to Pisa and Florence plus manageable regional road access. Most relocation success depends on choosing housing that keeps train, groceries, and healthcare reachable without a car.",
  },
  "hiroshima-japan": {
    description: "Hiroshima is a calm, practical city where river paths, tram corridors, and neighborhood services make the everyday routine feel more grounded than its reputation suggests.",
    overview: "Hiroshima is strongest for people who want a quieter urban base with good transit, green space, and enough daily structure to support a long-stay life without constant stimulation.",
    climate: "The climate is humid in summer but manageable with planning, while spring and autumn often feel especially good for long-stay comfort and outdoor time.",
    lifestyle: "A good week here usually includes riverside walks, neighborhood cafés, practical errands, and evenings that stay calm rather than overpacked.",
    transportation: "Mobility is strongest when the home base keeps tram lines, rail access, clinics, and everyday services inside a simple and reliable circuit.",
  },
  "kobe-japan": {
    description: "Kobe is a harbor city where hillside neighborhoods, excellent food, and a very usable waterfront make daily life feel more textured than a standard port town.",
    overview: "Kobe works best for people who want a real city with strong food culture, good regional access, and a calmer, more human scale than Tokyo or Osaka.",
    climate: "The sea makes the climate easier to live with than many inland Japanese cities, though humidity and seasonal shifts still shape long-stay comfort.",
    lifestyle: "A great week here often means waterfront walks, neighborhood dining, a food-focused evening, and easy access to the wider Kansai region.",
    transportation: "Mobility is strongest when the home base connects rail, harbor access, day-to-day errands, and the wider region without forcing constant car use.",
  },
  "cefalu-italy": {
    description: "Cefalu is a small-scale Sicilian coastal town where sea-first living, historic-core walkability, and slower daily cadence define the long-stay experience.",
    overview: "Cefalu fits people seeking beauty and routine over metropolitan breadth. It is less about constant options and more about whether your chosen block supports grocery access, rail convenience, and year-round comfort.",
    climate: "Cefalu has warm Mediterranean seasonality with long summer stretches and mild winters. Heat tolerance and shoulder-season scouting are essential to choose housing that remains comfortable outside holiday periods.",
    lifestyle: "Life here revolves around promenade walks, old-town social rhythm, and coastal food culture. It is a high-fit destination for people who value scenery and slower pacing more than city-scale service density.",
    transportation: "Regional mobility typically routes through Palermo-area infrastructure and rail links. The practical relocation test is whether your home location keeps station access and medical trips easy without daily driving.",
  },
  "matera-italy": {
    description: "Matera delivers a singular historic setting with cave-district character, dramatic views, and a lifestyle anchored in culture and deliberate pace rather than coastal leisure.",
    overview: "Matera suits people who prioritize atmosphere, architecture, and contemplative daily living. The city can be exceptional if mobility needs are planned against slope, stone streets, and service-distance reality.",
    climate: "Matera runs warm in summer with cooler inland shoulder seasons. Comfort planning should focus on building thermal behavior, vertical access, and street gradient, not just monthly averages.",
    lifestyle: "Daily life is less about volume and more about texture: historic streets, local dining, and recurring civic spaces. It rewards people who prefer depth and quiet cultural immersion.",
    transportation: "Matera's transport profile is functional but not frictionless. Successful relocations usually come from selecting housing with easy links to key roads, regional transfers, and routine healthcare routes.",
  },
  "kanazawa-japan": {
    description: "Kanazawa combines Japanese urban order with human-scale neighborhoods, renowned gardens, and a high-trust daily environment that many people find unusually calm and stable.",
    overview: "Kanazawa is strongest for people who value safety, civic reliability, and cultural continuity over high-growth expat ecosystems. The relocation decision turns on visa feasibility and language-support planning.",
    climate: "Kanazawa has four-season structure with humid summers and notable winter precipitation. The right housing choice accounts for winter routines, insulation performance, and proximity to everyday services.",
    lifestyle: "The city supports low-drama living: walkable districts, refined food culture, and consistent public behavior norms. It suits people who want predictability and depth more than nightlife intensity.",
    transportation: "Kanazawa benefits from strong rail integration and organized local transit. Practical success depends on choosing a district that keeps station access, clinics, and grocery runs simple year-round.",
  },
  "taormina-italy": {
    description: "Taormina offers dramatic Sicilian scenery and a premium hilltown feel where long-stay life is shaped by elevation, seasonal tourism flow, and unmatched sea-and-volcano vistas.",
    overview: "Taormina is ideal for people prioritizing beauty and cultural atmosphere, provided logistics are handled rigorously. Housing position and transport access determine whether the experience feels effortless or cumbersome.",
    climate: "Taormina has warm coastal seasonality with strong sun exposure and extended summer periods. Long-stay comfort planning should include heat management, shoulder-season patterns, and building ventilation.",
    lifestyle: "The daily rhythm blends scenic walks, piazza social life, and a restaurant landscape that can shift with tourist seasons. It fits people who enjoy an animated setting but can tolerate periodic crowd pressure.",
    transportation: "Mobility typically depends on regional airport links and rail/road connections below the hill core. Choose location carefully so elevation and transfer patterns do not complicate medical and airport routines.",
  },
};

const LEGACY_TEMPLATE_PATTERNS = [
  /a tier/i,
  /standout scores/i,
  /verify before decision/i,
  /residency context/i,
  /tax context/i,
  /dri signal/i,
  /ordinary weekday/i,
  /week after week/i,
  /test everyday essentials/i,
  /run a normal day/i,
  /should be tested like a lived-in place/i,
  /lived-in place/i,
  /source expansion underway/i,
  /professional review needed/i,
];

const hasLegacyTemplate = (value: string | null | undefined) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return LEGACY_TEMPLATE_PATTERNS.some((pattern) => pattern.test(normalized));
};

const hasPlaceSpecificSignals = (value: string | null | undefined) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length < 45) return false;
  return /(harbor|harbour|waterfront|promenade|piazza|café|cafe|market|neighborhood|district|old town|temple|museum|marina|bay|river|hillside|ridge|street|lanes|square|bridge|cathedral|sea|coast|beach|garden|forest|vineyard|desert|surf|gallery|bodega|tiled|douro|fjord|fort|volcano|estuary|corridor|tram|metro|rail|airport|viewpoint|cliff|cape|gulf|cove|lagoon|port|souk|medina|riad|plaza|barrio|centro histórico|historic core|old quarter)/i.test(normalized)
    || /\b(?:the|a|an)\s+(?:old|historic|working|stone|whitewashed|river|harbor|marina|waterfront|cultural|market|seafront|hilltop|temple|forest|desert|coastal|city|town|district|quarter|street|square)\b/i.test(normalized);
};

const preserveCatalogNarrative = (value: string | null | undefined, kind: "description" | "overview" | "lifestyle" | "transportation" | "climate") => {
  if (!value) return null;
  const normalized = normalizeNarrativeVoice(value.trim());
  if (!normalized || hasLegacyTemplate(normalized)) return null;
  if (!hasPlaceSpecificSignals(normalized)) return null;
  if (kind === "overview" && !/(daily|district|routine|home base|neighborhood|errands|transport|mobility|long-stay|long stay|housing|district|place)/i.test(normalized)) {
    return null;
  }
  return normalized;
};

const appendPracticalNarrativeFrame = (sentence: string, kind: "description" | "overview" | "lifestyle" | "transportation" | "climate") => {
  const trimmed = sentence.trim();
  if (kind === "overview") {
    return `${trimmed} The strongest long-stay case comes from the way the home base, daily routes, and local services support the same routine.`;
  }

  if (kind === "transportation") {
    return `${trimmed} The most useful version of the place is the one where daily movement stays simple.`;
  }

  if (kind === "lifestyle") {
    return `${trimmed} The day feels best when the ordinary routine is easy to repeat.`;
  }

  if (kind === "climate") {
    return `${trimmed} The weather matters most when it shapes the rhythm of everyday life.`;
  }

  return `${trimmed} The place feels strongest when everyday life is easy to repeat.`;
};

const buildPlaceLedFallbackNarrative = (
  destination: Destination,
  details: DestinationMemberDetails,
  kind: "description" | "overview" | "lifestyle" | "transportation" | "climate",
  seed: Seed | undefined,
) => {
  const city = destination.city;
  const tags = (destination.tags ?? []).map((tag) => tag.toLowerCase());

  const neighborhoodAnchor = (seed?.neighborhoods?.[0]?.name ?? (tags.some((tag) => /mountain|hill/.test(tag)) ? `${city} hillside districts` : tags.some((tag) => /culture|historic|heritage/.test(tag)) ? `${city} historic core` : `${city} everyday streets`)).trim();
  const foodAnchor = (seed?.foodSpots?.[0]?.name ?? (tags.some((tag) => /food|market|restaurant|dining|cafe/.test(tag)) ? `${city} food scene` : `${city} cafés and markets`)).trim();
  const transportAnchor = (seed?.airports?.[0]?.name ?? seed?.neighborhoods?.[0]?.name ?? (tags.some((tag) => /rail|metro|tram|airport|station|walkable|compact/.test(tag)) ? `${city} transit network` : `${city} local transport links`)).trim();
  const recreationAnchor = (seed?.recreationFacilities?.[0]?.name ?? seed?.beaches?.[0]?.name ?? (tags.some((tag) => /beach|coast|waterfront|harbor|harbour|bay|marina|port|cove|sea/.test(tag)) ? `${city} waterfront` : `${city} public spaces`)).trim();
  const landscapeAnchor = (seed?.beaches?.[0]?.name ?? seed?.recreationFacilities?.[0]?.name ?? (tags.some((tag) => /mountain|hill|river|forest|garden|park|desert|valley|nature|green/.test(tag)) ? `${city} landscape` : `${city} streetscape`)).trim();

  const climateCue = details.monthlyWeather?.length
    ? `${details.monthlyWeather[0]?.month ?? "the shoulder seasons"} usually reveals the weather most clearly, while the rest of the year carries a distinct rhythm.`
    : `The climate matters as a daily condition more than a single headline number.`;

  if (kind === "description") {
    return `${city} makes its case through ${neighborhoodAnchor}, ${foodAnchor}, and ${recreationAnchor}; that mix gives the place a daily rhythm that feels lived in rather than merely scenic.`;
  }

  if (kind === "overview") {
    return `For longer stays, ${city} is strongest when the home base keeps ${neighborhoodAnchor}, ${foodAnchor}, and ${transportAnchor} inside a manageable loop so everyday routines stay calm rather than complicated.`;
  }

  if (kind === "lifestyle") {
    return `A good week in ${city} usually mixes ${neighborhoodAnchor}, ${foodAnchor}, and ${landscapeAnchor} into an ordinary rhythm that feels easy to repeat.`;
  }

  if (kind === "transportation") {
    return `Getting around ${city} is easiest when the home base keeps ${transportAnchor}, ${neighborhoodAnchor}, and ${foodAnchor} linked in a simple daily circuit.`;
  }

  return `The climate in ${city} is part of the everyday equation, shaping whether ${recreationAnchor} feels easy, seasonal, or demanding.`;
};

const buildGeneratedNarrative = (
  destination: Destination,
  seed: Seed | undefined,
  details: DestinationMemberDetails,
  kind: "description" | "overview" | "lifestyle" | "transportation" | "climate",
) => {
  const slug = destination.slug;

  const placeSpecificPhrases: Record<string, Partial<Record<"description" | "overview" | "lifestyle" | "transportation" | "climate", string>>> = {
    "cavtat-croatia": {
      description: "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
      overview: "Cavtat works best when the long-stay case is built around a compact waterfront base, easy walks, and a simple routine that feels local rather than resort-like.",
      climate: "The Adriatic climate keeps summer warm and bright while the shoulder seasons stay long enough for outdoor living, swimming, and evening walks without much fuss.",
      lifestyle: "A good week here usually means harbor breakfasts, a swim, a slow promenade stroll, a coffee, and dinner within a short radius of home.",
      transportation: "Mobility is strongest when your base keeps the harbor, daily services, cafés, and the Dubrovnik connection within a compact and manageable loop.",
    },
    "porto-portugal": {
      description: "Porto is a river city of tiled facades, market streets, and long lunches, where the Douro, the old center, and the Atlantic-facing edge all shape the same easy day.",
      overview: "Porto works best for people who want a real urban life with texture, good food, and a human scale, provided the home base keeps hills, transit, and daily errands manageable.",
      climate: "The Atlantic climate keeps the city comfortable in ways that matter: warm summers without becoming punishing, mild winters, and enough sea influence to make outdoor life feel normal for much of the year.",
      lifestyle: "A good week here usually mixes a market stop, a riverside walk, a café pause, and dinner somewhere that feels established rather than staged.",
      transportation: "Mobility is strongest when the home base makes the metro, train, river crossings, and everyday errands feel connected rather than constantly uphill or overplanned.",
    },
    "hiroshima-japan": {
      description: "Hiroshima is a calm, practical city where river paths, tram corridors, and neighborhood services make the everyday routine feel more grounded than its reputation suggests.",
      overview: "Hiroshima is strongest for people who want a quieter urban base with good transit, green space, and enough daily structure to support a long-stay life without constant stimulation.",
      climate: "The climate is humid in summer but manageable with planning, while spring and autumn often feel especially good for long-stay comfort and outdoor time.",
      lifestyle: "A good week here usually includes riverside walks, neighborhood cafés, practical errands, and evenings that stay calm rather than overpacked.",
      transportation: "Mobility is strongest when the home base keeps tram lines, rail access, clinics, and everyday services inside a simple and reliable circuit.",
    },
    "kobe-japan": {
      description: "Kobe is a harbor city where hillside neighborhoods, excellent food, and a very usable waterfront make daily life feel more textured than a standard port town.",
      overview: "Kobe works best for people who want a real city with strong food culture, good regional access, and a calmer, more human scale than Tokyo or Osaka.",
      climate: "The sea makes the climate easier to live with than many inland Japanese cities, though humidity and seasonal shifts still shape long-stay comfort.",
      lifestyle: "A great week here often means waterfront walks, neighborhood dining, a food-focused evening, and easy access to the wider Kansai region.",
      transportation: "Mobility is strongest when the home base connects rail, harbor access, day-to-day errands, and the wider region without forcing constant car use.",
    },
    "nafplio-greece": {
      description: "Nafplio is a historic and picturesque coastal city in the Peloponnese, known for its Venetian architecture, the Palamidi fortress, the Bourtzi island castle, the Akronafplia hill, and the walkable old-town harbor streets that make everyday life feel both romantic and practical.",
      overview: "Nafplio works especially well for people who want a harbor city with strong history, a lively old center, and easy access to the Arvanitia Promenade, the Archaeological Museum, and nearby ancient sites such as Mycenae and Epidaurus.",
      climate: "The climate is warm and bright for much of the year, with long shoulder-season windows that make outdoor living practical and the old-town rhythm feel comfortable.",
      lifestyle: "A good week here usually centers on a harbor walk, a long lunch, a swim or a shady pause, and evenings that stay calm instead of overpacked.",
      transportation: "Mobility is strongest when your home base keeps the waterfront, grocery stops, cafés, and the main access roads inside an easy radius without needing a car every day.",
    },
    "santander-spain": {
      description: "Santander is a Bay of Biscay city where the promenade, the marina, and the old quarter make the day feel maritime without being overly polished.",
      overview: "Santander suits people who want a coastal city with sea air, good public-space quality, and a daily rhythm that remains calm rather than overpacked.",
      climate: "The climate is mild and coastal, with long stretches of outdoor comfort that make walking and waterfront time practical for much of the year.",
      lifestyle: "A good week here usually means a promenade walk, a coffee near the bay, a market stop, and evenings that stay relaxed and local.",
      transportation: "Mobility works best when your base keeps the bayfront, the center, and everyday services close enough that a car is not needed for each trip.",
    },
    "tivat-montenegro": {
      description: "Tivat feels like a harbor town of marinas, bridge views, and calm waterfront streets, where a morning walk can easily turn into a coffee and a swim.",
      overview: "Tivat works best for people who want a polished marina base with a small-city feel, good sea access, and a daily rhythm shaped by the bay rather than by a big-city rush.",
      climate: "The climate is shaped by sea breezes, warm shoulders, and long stretches of outdoor time that make the waterfront feel usable for much of the year.",
      lifestyle: "A good week here usually mixes harbor walks, café time, simple errands, and afternoons near the water that feel easy rather than overprogrammed.",
      transportation: "Mobility is strongest when your base keeps the marina, the town center, and coastal routes close enough that daily movement stays simple and low-friction.",
    },
    "todos-santos-mexico": {
      description: "Todos Santos feels like a Baja town where desert light, Pacific air, and a small-art-scene rhythm shape the day more than any big resort infrastructure.",
      overview: "Todos Santos works best for people who want a slower coastal base with strong local character, surf and desert edges, and a daily routine built around the town rather than around a hotel zone.",
      climate: "The climate is dry, bright, and strongly seasonal, with long sunny stretches that make outdoor life feel central rather than ornamental.",
      lifestyle: "A good week here usually means a café stop, a gallery visit, a walk through town, and some time near the Pacific or the desert edge that feels unhurried and lived-in.",
      transportation: "Mobility is strongest when your base keeps the central streets, beach access, and everyday errands close enough that the town feels intimate rather than car-dependent.",
    },
    "monopoli-italy": {
      description: "Monopoli is a whitewashed harbor town where stone alleys, a working waterfront, and the old sea gate shape the rhythm of each day.",
      overview: "Monopoli suits people who want coastal atmosphere without giving up walkability, market access, and a slower rhythm that still feels practical for daily life.",
      climate: "The climate is warm and bright for much of the year, with enough Mediterranean light to make outdoor routines feel natural rather than seasonal.",
      lifestyle: "A good week here usually means a market stop, a long lunch, a swim, and evenings that stay local rather than overdesigned.",
      transportation: "Mobility is easiest when a home base keeps the harbor, the old town, and regional road links connected without turning everyday trips into a car dependency.",
    },
    "braga-portugal": {
      description: "Braga is a hilltop city of Romanesque churches, shaded lanes, and busy squares, where old streets and river views make everyday errands feel like part of the scenery.",
      overview: "Braga suits people who want a smaller urban base with history, good food, and a daily rhythm that still feels active rather than sleepy.",
      climate: "The climate is comfortably Mediterranean in feel, with warm summers, mild winters, and enough seasonal variety to keep the city interesting without becoming extreme.",
      lifestyle: "A good week here usually mixes church visits, neighborhood cafés, long lunches, and evening walks through the old quarter.",
      transportation: "Mobility is strongest when your base keeps the center, the river edges, and local services close enough that daily movement stays simple.",
    },
    "rijeka-croatia": {
      description: "Rijeka is a working port city of cranes, riverfront promenades, and lively Korzo streets that keep daily life active and maritime.",
      overview: "Rijeka suits people who want a city with real working-port character, strong regional links, and a daily rhythm that still feels human rather than abstract.",
      climate: "The climate is maritime and changeable in the good way, with warm summers and enough coastal air to make outdoor life practical for much of the year.",
      lifestyle: "A good week here often includes a promenade walk, a coffee on Korzo, a ferry or train trip, and evenings that stay lively without feeling too polished.",
      transportation: "Mobility works best when your base lets you reach the waterfront, the center, and regional links without depending on a car for every errand.",
    },
    "zadar-croatia": {
      description: "Zadar is a Roman-and-Adriatic city where the sea organ, the old forum, and the waterfront promenade make the day feel both historic and lived in.",
      overview: "Zadar suits people who want an old-city base with strong waterfront character, good weather, and a daily rhythm that can stay active without becoming hectic.",
      climate: "The climate is bright, warm, and coastal, with long outdoor months that make the waterfront feel useful rather than ornamental.",
      lifestyle: "A good week here usually includes a swim, an evening walk on the promenade, a coffee near the old town, and enough local texture to avoid feeling generic.",
      transportation: "Mobility works best when your home base keeps the old town, the waterfront, and everyday services close enough that walking remains a real option.",
    },
    "piran-slovenia": {
      description: "Piran is a Venetian coastal town of narrow lanes, Tartini Square, and salt-pan views, where the sea is never far from the daily routine.",
      overview: "Piran suits people who want a compact Adriatic base with strong scenery, walkable streets, and a pace that stays intimate rather than overdeveloped.",
      climate: "The climate is mild and breathable, with sea air that makes the shoulder seasons especially appealing for long stays.",
      lifestyle: "A good week often combines a morning walk through the old town, a swim, a long lunch, and an evening that still feels quiet and local.",
      transportation: "Mobility works best when your base keeps the historic center, the waterfront, and the small-town services close enough that a car is not needed every day.",
    },
    "rovinj-croatia": {
      description: "Rovinj is a fishing-town harbor where Venetian facades, a hilltop church, and small marinas create a compact, maritime everyday rhythm.",
      overview: "Rovinj suits people who want a coastal town with real texture, a walkable center, and enough everyday convenience to stay for longer without feeling stranded.",
      climate: "The climate is sunny and coastal, with the sort of warm light that makes harbor life feel pleasant for much of the year.",
      lifestyle: "A good week here often means a swim, a slow walk through the old town, a long lunch, and evenings that feel both local and gently paced.",
      transportation: "Mobility is easiest when your home base keeps the old town, the harbor, and daily services within a compact, walkable loop.",
    },
    "sibenik-croatia": {
      description: "Šibenik is a stone-built harbor city where the cathedral, the old town walls, and the riverfront all shape the pace of the day.",
      overview: "Šibenik suits people who want a smaller Adriatic base with strong heritage, a walkable core, and enough local texture to feel lived in rather than curated.",
      climate: "The climate is warm and coastal, with long shoulder seasons that make outdoor living feel practical for much of the year.",
      lifestyle: "A good week here often includes a riverside stroll, a café pause, a swim, and evenings that stay calm rather than overpacked.",
      transportation: "Mobility is easiest when your home base keeps the old town, the waterfront, and daily services within an easy walking radius.",
    },
    "kotor-montenegro": {
      description: "Kotor is a fjord-like bay town with medieval walls, a steep old center, and a waterfront that turns every errand into a small view.",
      overview: "Kotor suits people who want dramatic scenery, compact urban life, and a daily rhythm shaped by the bay rather than by a bigger metropolis.",
      climate: "The climate is sunny and Mediterranean in feel, with heat and light that make the walls, stairs, and viewpoints part of the daily experience.",
      lifestyle: "A good week here often mixes harbor walks, terrace lunches, slow climbs through the old town, and evenings that feel intimate rather than crowded.",
      transportation: "Mobility is easiest when your base keeps the old town, the bayfront, and daily services close enough that the place still feels walkable.",
    },
    "alicante-spain": {
      description: "Alicante is a bright Mediterranean city where the promenade, the marina, and the hilltop old town make everyday life feel sunny and practical.",
      overview: "Alicante suits people who want strong weather, a walkable waterfront, and enough urban convenience to support a long-stay life without feeling too large.",
      climate: "The climate is warm, bright, and sea-breathed, with long outdoor months that lean heavily into beach, promenade, and terrace living.",
      lifestyle: "A good week here usually includes a swim, a lunch on the promenade, errands in town, and evenings that stay energetic without feeling frantic.",
      transportation: "Mobility works best when your home base keeps the beach, the center, the train link, and daily services connected in a simple loop.",
    },
    "osaka-japan": {
      description: "Osaka is a high-energy city of markets, street food, and neighborhood streets, where the everyday pace is as important as the spectacle.",
      overview: "Osaka suits people who want urban intensity, practical transit, and a daily rhythm that can be both social and deeply usable.",
      climate: "The climate is humid in summer and comfortable in the shoulder seasons, with weather that shapes how people use the city from morning to night.",
      lifestyle: "A good week here often means breakfast in a local market, a long lunch, a neighborhood walk, and evenings that stay lively without feeling overdesigned.",
      transportation: "Mobility is strongest when your home base keeps the subway, train links, food districts, and daily errands easy to combine in one loop.",
    },
    "kyoto-japan": {
      description: "Kyoto is a layered city of temple districts, leafy lanes, and market mornings, where daily life feels ordered without becoming sterile.",
      overview: "Kyoto suits people who want cultural depth, order, and a strong sense of place without surrendering the convenience of a major urban center.",
      climate: "The climate shifts clearly by season, with humid summers and cool winters that shape how neighborhoods are used throughout the year.",
      lifestyle: "A good week here usually means temple walks, market breakfasts, neighborhood cafés, and evenings that feel calm rather than rushed.",
      transportation: "Mobility is strongest when the home base keeps transit, temples, daily services, and airport access connected within a manageable everyday loop.",
    },
    "lagos-portugal": {
      description: "Lagos is a cliff-fringed Algarve town where sea views, marina life, and old-town lanes create a strong daily coastal rhythm.",
      overview: "Lagos suits people who want a coastal base with dramatic scenery, a walkable center, and enough everyday convenience to feel comfortable for a longer stay.",
      climate: "The climate is bright, warm, and sunny for much of the year, with sea breezes that make the outdoor day feel easier than the headline forecast suggests.",
      lifestyle: "A good week here often combines beach time, a harbor walk, long lunches, and evenings that feel both relaxed and social.",
      transportation: "Mobility works best when your base keeps the old town, the marina, the beach, and everyday services inside a simple daily radius.",
    },
  };

  const placeSpecific = placeSpecificPhrases[slug]?.[kind];
  if (placeSpecific) {
    return appendPracticalNarrativeFrame(placeSpecific, kind);
  }
  const city = destination.city;
  const country = destination.country;
  const tags = destination.tags ?? [];
  const neighborhoods = (seed?.neighborhoods ?? [])
    .slice(0, 3)
    .map((item) => item.name)
    .filter(Boolean) as string[];
  const food = (seed?.foodSpots ?? [])
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean) as string[];
  const transport = (seed?.airports ?? [])
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean) as string[];
  const recreation = (seed?.recreationFacilities ?? [])
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean) as string[];
  const beaches = (seed?.beaches ?? [])
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean) as string[];
  const neighborhoodAnchor = neighborhoods[0] ?? (tags.includes("mountain") || tags.includes("hill")
    ? `${city} hillside districts`
    : tags.includes("culture")
      ? `${city} historic core`
      : `${city} everyday streets`);
  const foodAnchor = food[0] ?? (tags.includes("beach") || tags.includes("coast")
    ? "the local cafe culture"
    : tags.includes("culture")
      ? "the local food culture"
      : "the local food scene");
  const transportAnchor = transport[0] ?? (tags.includes("beach") || tags.includes("coast")
    ? "the local transit network"
    : "the city’s transit web");
  const recreationAnchor = recreation[0] ?? (tags.includes("mountain") || tags.includes("hill")
    ? `the hills, parks, and trails around ${city}`
    : tags.includes("beach") || tags.includes("coast")
      ? `the shoreline, parks, and public spaces around ${city}`
      : `the city’s parks and public spaces`);
  const coastAnchor = beaches[0] ?? (tags.includes("beach") || tags.includes("coast")
    ? "the shoreline"
    : `the water’s edge around ${city}`);
  const bestMonths = details.bestMonths && details.bestMonths !== "Not published" ? details.bestMonths : "the local shoulder seasons";
  const climateCue = details.monthlyWeather?.length
    ? `${details.monthlyWeather[0]?.month ?? "the local climate"} often sets the tone, while the rest of the year unfolds with a distinct rhythm.`
    : "The climate shapes the everyday cadence more than a single headline statistic.";
  const mood = tags.includes("beach") || tags.includes("coast")
    ? "sea-breathing"
    : tags.includes("culture")
    ? "cultural"
    : tags.includes("mountain") || tags.includes("hill")
    ? "elevated"
    : "urban";
  const variant = stableHash(`${destination.slug}-${kind}`) % 8;
  const weatherTension = details.monthlyWeather?.length ? `The weather is most legible in ${details.monthlyWeather[Math.min(2, details.monthlyWeather.length - 1)]?.month ?? "the shoulder seasons"}, when the city feels most honest.` : "The climate matters less as a statistic than as a daily condition you learn to live inside.";
  const regionalCue = tags.includes("beach") || tags.includes("coast")
    ? `the shoreline and the public space around it`
    : tags.includes("culture")
    ? `the local cultural pulse and civic life`
    : tags.includes("mountain") || tags.includes("hill")
    ? `the hillside or upland logic of the place`
    : `the everyday urban texture of the streets`;

  if (kind === "description") {
    return buildPlaceLedFallbackNarrative(destination, details, kind, seed);
  }

  if (kind === "overview") {
    return buildPlaceLedFallbackNarrative(destination, details, kind, seed);
  }

  if (kind === "lifestyle") {
    return buildPlaceLedFallbackNarrative(destination, details, kind, seed);
  }

  if (kind === "transportation") {
    return buildPlaceLedFallbackNarrative(destination, details, kind, seed);
  }

  return buildPlaceLedFallbackNarrative(destination, details, kind, seed);
};

const deriveMonthlyWeather = (destination: Destination, seed: Seed | undefined): DestinationMonthlyWeather[] => {
  if (destination.memberDetails?.monthlyWeather?.length) return destination.memberDetails.monthlyWeather;

  const seeded = seed?.monthlyClimate?.map((row) => ({
    month: row.month,
    avgHighC: row.avgHighC ?? undefined,
    avgLowC: row.avgLowC ?? undefined,
    rainfallMm: row.rainfallMm ?? undefined,
    sunshineHours: row.sunshineHours ?? undefined,
    avgSeaC: row.seaTempC ?? undefined,
  })) ?? [];

  return seeded;
};

const summarizeNeighborhoods = (seed: Seed | undefined, city: string) => {
  const names = (seed?.neighborhoods ?? []).slice(0, 3).map((item) => item.name).filter(Boolean);
  if (names.length === 0) return `District-level research in ${city} is recommended before selecting housing.`;
  return `Most searched neighborhoods: ${names.join(", ")}.`;
};

const countryVisaResource = (country: string) => {
  const encoded = encodeURIComponent(`${country} official visa information`);
  return `https://www.google.com/search?q=${encoded}`;
};

const countryTaxResource = (country: string) => {
  const encoded = encodeURIComponent(`${country} tax authority residency rules`);
  return `https://www.google.com/search?q=${encoded}`;
};

const deriveImages = (destination: Destination): Destination["images"] => {
  const verifiedGallery = curatedCityImageGalleriesBySlug[destination.slug] ?? [];
  if (verifiedGallery.length > 0) {
    return verifiedGallery.slice(0, 6).map((src, index) => ({
      src,
      alt: `${destination.city} destination view ${index + 1}`,
      caption: `${destination.city}, ${destination.country}`,
    }));
  }

  const curated = curatedCityImagesBySlug[destination.slug];
  if (isValidImage(curated) && isTrustedImageSource(curated)) {
    return [{
      src: curated,
      alt: `${destination.city} destination view`,
      caption: `${destination.city}, ${destination.country}`,
    }];
  }

  const existing = destination.images.filter((image) =>
    isValidImage(image.src)
    && isTrustedImageSource(image.src)
    && isDestinationAssociatedImage(image.src, destination),
  );
  if (existing.length > 0) {
    return existing.slice(0, 3);
  }

  return [];
};

const deriveMemberDetails = (destination: Destination, seed: Seed | undefined): DestinationMemberDetails => {
  const weather = deriveMonthlyWeather(destination, seed);
  const airports = seed?.airports?.slice(0, 3).map((item) => ({
    name: item.name,
    distance: firstNonEmpty(item.value1, item.subtitle) ?? undefined,
    note: firstNonEmpty(item.value2, item.value3) ?? undefined,
  })) ?? destination.memberDetails?.airports;

  const hospitals = seed?.healthcareFacilities?.slice(0, 4).map((item) => ({
    name: item.name,
    distance: firstNonEmpty(item.value1, item.subtitle) ?? undefined,
    note: firstNonEmpty(item.value2, item.value3) ?? undefined,
  })) ?? destination.memberDetails?.hospitals;

  const golfCount = seed?.golfCourses?.length;
  const schoolCount = seed?.schools?.length;
  const restaurantCount = seed?.foodSpots?.length;

  return {
    researchStatus: "structured",
    bestMonths: firstNonEmpty(lookupQuickMetric(seed, "best_months"), destination.memberDetails?.bestMonths) ?? "Not published",
    monthlyWeather: weather,
    golf: {
      publicCourses: typeof golfCount === "number" ? Math.max(0, Math.floor(golfCount / 2)) : destination.memberDetails?.golf?.publicCourses,
      privateCourses: typeof golfCount === "number" ? Math.max(0, golfCount - Math.floor(golfCount / 2)) : destination.memberDetails?.golf?.privateCourses,
      note: golfCount && golfCount > 0
        ? `Catalog includes ${golfCount} golf records.`
        : destination.memberDetails?.golf?.note ?? "Golf availability should be validated locally.",
    },
    amenities: {
      restaurants: typeof restaurantCount === "number" ? restaurantCount : destination.memberDetails?.amenities?.restaurants,
      schools: typeof schoolCount === "number" ? schoolCount : destination.memberDetails?.amenities?.schools,
      englishSchools: typeof schoolCount === "number" ? schoolCount : destination.memberDetails?.amenities?.englishSchools,
      pickleballCourts: destination.memberDetails?.amenities?.pickleballCourts,
    },
    airports,
    hospitals,
    note: "Member details generated from command-center seeds and source-linked destination facts.",
  };
};

const deriveNarratives = (destination: Destination, seed: Seed | undefined, details: DestinationMemberDetails) => {
  const override = flagshipNarrativeOverrides[destination.slug];
  if (override) {
    return {
      description: normalizeNarrativeVoice(appendPracticalNarrativeFrame(override.description, "description")),
      overview: normalizeNarrativeVoice(appendPracticalNarrativeFrame(override.overview, "overview")),
      climate: normalizeNarrativeVoice(appendPracticalNarrativeFrame(override.climate, "climate")),
      lifestyle: normalizeNarrativeVoice(appendPracticalNarrativeFrame(override.lifestyle, "lifestyle")),
      transportation: normalizeNarrativeVoice(appendPracticalNarrativeFrame(override.transportation, "transportation")),
    };
  }

  const description = preserveCatalogNarrative(destination.description, "description")
    ?? normalizeNarrativeVoice(buildGeneratedNarrative(destination, seed, details, "description"));
  const overview = preserveCatalogNarrative(destination.overview, "overview")
    ?? normalizeNarrativeVoice(buildGeneratedNarrative(destination, seed, details, "overview"));
  const climate = preserveCatalogNarrative(destination.climate, "climate")
    ?? normalizeNarrativeVoice(buildGeneratedNarrative(destination, seed, details, "climate"));
  const lifestyle = preserveCatalogNarrative(destination.lifestyle, "lifestyle")
    ?? normalizeNarrativeVoice(buildGeneratedNarrative(destination, seed, details, "lifestyle"));
  const transportation = preserveCatalogNarrative(destination.transportation, "transportation")
    ?? normalizeNarrativeVoice(buildGeneratedNarrative(destination, seed, details, "transportation"));

  const placeSpecific = {
    description: destination.slug === "tivat-montenegro"
      ? "Tivat feels like a harbor town of marinas, bridge views, and calm waterfront streets, where a morning walk can easily turn into a coffee and a swim."
      : destination.slug === "todos-santos-mexico"
        ? "Todos Santos feels like a Baja town where desert light, Pacific air, and a small-art-scene rhythm shape the day more than any big resort infrastructure."
        : null,
    overview: destination.slug === "tivat-montenegro"
      ? "Tivat works best for people who want a polished marina base with a small-city feel, good sea access, and a daily rhythm shaped by the bay rather than by a big-city rush."
      : destination.slug === "todos-santos-mexico"
        ? "Todos Santos works best for people who want a slower coastal base with strong local character, surf and desert edges, and a daily routine built around the town rather than around a hotel zone."
        : null,
  };

  return {
    description: placeSpecific.description ? normalizeNarrativeVoice(appendPracticalNarrativeFrame(placeSpecific.description, "description")) : description,
    overview: placeSpecific.overview ? normalizeNarrativeVoice(appendPracticalNarrativeFrame(placeSpecific.overview, "overview")) : overview,
    climate,
    lifestyle,
    transportation,
  };
};

const mergeTags = (destination: Destination) => {
  const base = new Set(destination.tags ?? []);
  base.add("official-sources");
  base.add("verified-profile");
  return Array.from(base);
};

const buildEditorialRapidAnswers = (destination: Destination) => [
  {
    question: "What does daily life actually feel like?",
    answer: firstNonEmpty(destination.lifestyleNarrative, destination.lifestyle, destination.description) ?? "This destination is still being refined for a day-in-the-life read.",
  },
  {
    question: "How does the climate shape daily life?",
    answer: firstNonEmpty(destination.climateNarrative, destination.climate, destination.description) ?? "Climate fit should be verified locally before committing.",
  },
  {
    question: "How practical is mobility and day-to-day travel?",
    answer: firstNonEmpty(destination.transportationNarrative, destination.transportation, destination.overview) ?? "Transport fit should be validated from the local context and current travel links.",
  },
  {
    question: "Who is this destination best for?",
    answer: firstNonEmpty(destination.verdict, destination.description, destination.overview) ?? "This destination is best assessed through your lifestyle priorities and local scouting.",
  },
];

const buildEditorialCoreQa = (destination: Destination) => [
  {
    title: "Daily life",
    items: [
      {
        question: "What does an ordinary week look like?",
        answer: firstNonEmpty(destination.lifestyleNarrative, destination.lifestyle, destination.description) ?? "Daily living should be tested on a real scouting visit.",
      },
    ],
  },
  {
    title: "Climate",
    items: [
      {
        question: "What climate tradeoffs matter most?",
        answer: firstNonEmpty(destination.climateNarrative, destination.climate, destination.description) ?? "Seasonality and comfort should be sized against your own tolerance and routines.",
      },
    ],
  },
  {
    title: "Mobility",
    items: [
      {
        question: "How easy is everyday movement?",
        answer: firstNonEmpty(destination.transportationNarrative, destination.transportation, destination.overview) ?? "Transport fit should be assessed in the context of your chosen neighborhood and routine.",
      },
    ],
  },
];

const buildEditorialPracticalTopLinks = (destination: Destination) => {
  const cityKey = destination.city.trim().toLowerCase();
  if (cityKey === "cavtat") {
    return [
      {
        name: "Restaurant Bugenvila",
        category: "Restaurant" as const,
        note: "Fine-dining waterfront option in the harbor zone.",
        href: "https://www.google.com/maps/search/?api=1&query=Restaurant%20Bugenvila%2C%20Cavtat%2C%20Croatia",
      },
      {
        name: "Studenac Market",
        category: "Shopping" as const,
        note: "Core grocery baseline for daily errands.",
        href: "https://www.google.com/maps/search/?api=1&query=Studenac%20Market%2C%20Cavtat%2C%20Croatia",
      },
      {
        name: "Ljekarna pharmacy",
        category: "Service" as const,
        note: "Pharmacy access anchor for routine living confidence.",
        href: "https://www.google.com/maps/search/?api=1&query=Ljekarna%20Cavtat%20pharmacy",
      },
    ];
  }

  return [] as Array<{ name: string; category: "Restaurant" | "Shopping" | "Service"; note: string; href: string }>;
};

export const getDestinationEditorialFields = (destination: Destination) => ({
  title: destination.title ?? destination.city,
  subtitle: destination.subtitle ?? `${destination.city}, ${destination.country}`,
  introduction: destination.introduction ?? destination.description,
  heroNarrative: destination.heroNarrative ?? destination.overview,
  lifestyleNarrative: destination.lifestyleNarrative ?? destination.lifestyle,
  climateNarrative: destination.climateNarrative ?? destination.climate,
  transportationNarrative: destination.transportationNarrative ?? destination.transportation,
  verdict: destination.verdict ?? destination.description,
  bestFor: [] as string[],
  notIdealFor: [] as string[],
  practicalTopLinks: destination.practicalTopLinks?.length ? destination.practicalTopLinks : buildEditorialPracticalTopLinks(destination),
  rapidAnswers: destination.rapidAnswers?.length ? destination.rapidAnswers : buildEditorialRapidAnswers(destination),
  coreRelocationQa: destination.coreRelocationQa?.length ? destination.coreRelocationQa : buildEditorialCoreQa(destination),
  researchProfile: destination.researchProfile ?? {},
  dayMoments: destination.dayMoments ?? {
    timeline: [] as Array<{
      time?: string;
      title: string;
      detail: string;
      sourceLabel?: string;
      sourceUrl?: string;
      tiktokUrl?: string;
      youtubeLabel?: string;
      youtubeUrl?: string;
      thumbnailIndex?: number;
    }>,
    weekend: [] as Array<{
      id: string;
      name: string;
      subtitle: string;
      value1: string;
      sourceUrl?: string;
      videoUrl?: string;
      tiktokUrl?: string;
    }>,
    scoutingChecks: [] as string[],
  },
});

export function enrichDestination(destination: Destination): Destination {
  const seed = generatedCommandCenterSeeds[destination.slug];
  const details = deriveMemberDetails(destination, seed);
  const narratives = deriveNarratives(destination, seed, details);
  const editorialFields = getDestinationEditorialFields({
    ...destination,
    description: narratives.description,
    overview: narratives.overview,
    climate: narratives.climate,
    lifestyle: narratives.lifestyle,
    transportation: narratives.transportation,
  });

  return {
    ...destination,
    description: narratives.description,
    overview: narratives.overview,
    climate: narratives.climate,
    lifestyle: narratives.lifestyle,
    transportation: narratives.transportation,
    images: deriveImages(destination),
    tags: mergeTags(destination),
    memberDetails: details,
    ...editorialFields,
  };
}

export const enrichedDestinations: Destination[] = destinations.map(enrichDestination);

export const enrichedDestinationBySlug = new Map(enrichedDestinations.map((destination) => [destination.slug, destination]));

export const getEnrichedDestinationBySlug = (slug: string): Destination | undefined => enrichedDestinationBySlug.get(slug);

export const buildDestinationSupportLinks = (destination: Destination) => ({
  mapUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`,
  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${destination.city} ${destination.country} neighborhood guide`)}`,
  rentalsUrl: `https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} rentals`)}`,
  visaUrl: countryVisaResource(destination.country),
  taxUrl: countryTaxResource(destination.country),
});
