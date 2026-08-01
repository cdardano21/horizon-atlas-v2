export type SourceOnlyNarrative = {
  description: string;
  overview: string;
  climate: string;
  lifestyle: string;
  transportation: string;
};

export const sourceOnlyDestinationNarratives: Partial<Record<string, SourceOnlyNarrative>> = {
  "cavtat-croatia": {
    description: "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
    overview: "Cavtat works best when the long-stay case is built around a compact waterfront base, easy walks, and a simple routine that feels local rather than resort-like.",
    climate: "The Adriatic climate keeps summer warm and bright while the shoulder seasons stay long enough for outdoor living, swimming, and evening walks without much fuss.",
    lifestyle: "A good week here usually means harbor breakfasts, a swim, a slow promenade stroll, a coffee, and dinner within a short radius of home.",
    transportation: "Mobility is strongest when your base keeps the harbor, daily services, cafés, and the Dubrovnik connection within a compact and manageable loop.",
  },
  "hiroshima-japan": {
    description: "Hiroshima is a calm, practical city where river paths, tram corridors, and neighborhood services make the everyday routine feel grounded rather than overproduced.",
    overview: "Hiroshima suits people who want a quieter urban base with dependable transit, green space, and enough daily structure to support a long-stay life without constant stimulation.",
    climate: "The climate is humid in summer but manageable with planning, while spring and autumn often feel especially good for long-stay comfort and outdoor time.",
    lifestyle: "A good week here usually includes riverside walks, neighborhood cafés, practical errands, and evenings that stay calm rather than overpacked.",
    transportation: "Mobility is strongest when the home base keeps tram lines, rail access, clinics, and everyday services inside a simple and reliable circuit.",
  },
  "kobe-japan": {
    description: "Kobe is a harbor city where hillside neighborhoods, excellent food, and a very usable waterfront make daily life feel more textured than a standard port town.",
    overview: "Kobe works best for people who want a real city with strong food culture, good regional access, and a calmer, more human scale than Tokyo or Osaka.",
    climate: "The sea makes the climate easier to live with than many inland Japanese cities, though humidity and seasonal shifts still shape long-stay comfort.",
    lifestyle: "A great week here often means waterfront walks, neighborhood dining, a food-focused evening, and easy access to the wider Kansai region.",
    transportation: "Mobility is strongest when the home base connects rail, harbor access, daily errands, and the wider region without forcing constant car use.",
  },
  "porto-portugal": {
    description: "Porto is a river city of tiled facades, market streets, and long lunches, where the Douro, the old center, and the Atlantic-facing edge all shape the same easy day.",
    overview: "Porto works best for people who want a real urban life with texture, good food, and a human scale, provided the home base keeps hills, transit, and daily errands manageable.",
    climate: "The Atlantic climate keeps the city comfortable in ways that matter: warm summers without becoming punishing, mild winters, and enough sea influence to make outdoor life feel normal for much of the year.",
    lifestyle: "A good week here usually mixes a market stop, a riverside walk, a café pause, and dinner somewhere that feels established rather than staged.",
    transportation: "Mobility is strongest when the home base makes the metro, train, river crossings, and everyday errands feel connected rather than constantly uphill or overplanned.",
  },
  "nice-france": {
    description: "Nice feels most persuasive when the sea, the promenade, and the old-city streets all seem to belong to the same easy Mediterranean day.",
    overview: "Nice suits people who want a polished coastal life with strong weather, good social energy, and a daily rhythm that feels more graceful than hectic.",
    climate: "The climate is one of Nice's great advantages: bright winters, warm shoulder seasons, and enough sea breeze to make outdoor life feel practical for much of the year.",
    lifestyle: "A satisfying week here often combines a promenade walk, local markets, café time, and evenings that feel leisurely rather than overprogrammed.",
    transportation: "Nice is easiest to enjoy when your home base keeps the waterfront, the center, and airport access connected without constant car dependence.",
  },
  "rome-italy": {
    description: "Rome is a city where the pleasures are both grand and intimate, and the everyday life can feel rich even when it is ordinary.",
    overview: "Rome suits people who want a capital city with depth, texture, and a huge range of ways to structure daily life without giving up a strong local atmosphere.",
    climate: "The climate is one of Rome's defining features: long warm seasons, strong sun, and a summer intensity that makes building quality and shade more important than many newcomers expect.",
    lifestyle: "A good week often includes a neighborhood coffee, a market stop, a piazza pause, and an evening meal that feels local rather than theatrical.",
    transportation: "Rome is easiest to live with when your home base keeps transit, clinics, and neighborhood errands inside a manageable loop.",
  },
  "monopoli-italy": {
    description: "Monopoli feels most persuasive when the old harbor, the whitewashed lanes, and the sea-facing promenade all seem to belong to the same easy day.",
    overview: "Monopoli suits people who want small-city pleasures with real coastal atmosphere, walkability, and a slower rhythm that still allows easy access to larger regional centers.",
    climate: "The climate is one of Monopoli's clearest advantages, with warm Mediterranean light and a pace that makes outdoor life feel practical for much of the year.",
    lifestyle: "A good week here usually unfolds around the waterfront, the old town, local seafood, and the kind of unhurried rituals that make a place feel lived in rather than merely scenic.",
    transportation: "Monopoli is easiest to love when your home base keeps the harbor, the center, and regional road access connected without requiring constant driving.",
  },
  "cascais-portugal": {
    description: "Cascais feels most persuasive when the Atlantic light, the marina, and the old town all seem to belong to the same easy day.",
    overview: "Cascais suits people who want a polished coastal base with real human scale, a walkable seafront, and access to Lisbon without surrendering the pleasures of a smaller place.",
    climate: "The Atlantic climate gives Cascais a mild, breathable rhythm that makes the shoulder seasons especially attractive.",
    lifestyle: "A good week here often revolves around the promenade, the marina, the beach, and the small-town pleasures of cafés and seafood lunches that still feel local rather than curated.",
    transportation: "Cascais is easiest to enjoy when you treat transport as part of the lifestyle choice, with beach, shops, and appointments all kept close without requiring a car every day.",
  },
  "tivat-montenegro": {
    description: "Tivat works best when the marina, the Bay of Kotor, and the bridge views all settle into one easy waterfront day.",
    overview: "Tivat suits people who want a compact coastal base with calm public life, simple daily routines, and enough marina energy to feel active without becoming hectic.",
    climate: "The Adriatic climate makes the shoulder seasons especially appealing, with long bright days, sea air, and comfortable evenings for outdoor living.",
    lifestyle: "A good week here usually means harbor breakfasts, a swim, a marina stroll, and evenings that stay quiet rather than over-programmed.",
    transportation: "Mobility is strongest when your base keeps the marina, local services, and the Bay of Kotor connection close enough to enjoy without constant driving.",
  },
  "braga-portugal": {
    description: "Braga feels most convincing when the historic center, the riverfront, and the everyday routines of the city all seem to belong to the same lived-in day.",
    overview: "Braga suits people who want a smaller city with cultural depth, manageable everyday life, and enough urban convenience to make a long-stay base feel practical rather than sleepy.",
    climate: "The climate is generally mild enough to support a comfortable pace for much of the year, with seasons that feel easier to live with than many larger regional cities.",
    lifestyle: "A good week here usually includes old-city walks, market stops, café time, and evenings that feel calm, social, and repeatable.",
    transportation: "Braga is easiest to enjoy when the home base keeps the center, local services, and broader regional connections within a simple daily loop.",
  },
};

export const getSourceOnlyNarrative = (slug: string) => sourceOnlyDestinationNarratives[slug] ?? null;
