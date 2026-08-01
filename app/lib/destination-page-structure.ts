export type RelocationSection = {
  title: string;
  body: string;
};

export type RelocationFrame = {
  heroLabel: string;
  heroBody: string;
  sections: RelocationSection[];
};

const RELOCATION_FRAMES: Record<string, RelocationFrame> = {
  cavtat: {
    heroLabel: "Daily reality",
    heroBody:
      "The town works when your routine stays compact: harbor walks, grocery runs, a swim, and a short connection to Dubrovnik when you need more energy.",
    sections: [
      {
        title: "Who it fits",
        body: "Best for people who want a compact coastal base with low-friction daily life and the option to stay social without needing a big city.",
      },
      {
        title: "Who may struggle",
        body: "Less ideal for people who expect more restaurant variety, more resident services, or a larger urban menu once the novelty fades.",
      },
      {
        title: "After three months",
        body: "Many residents appreciate the simplicity more than the scenery once the first excitement passes. The tradeoff is that the town rarely broadens your options much.",
      },
      {
        title: "Main tradeoff",
        body: "You gain calm and ease, but you give up the breadth of a larger city and the flexibility of a more self-sufficient base.",
      },
      {
        title: "Neighborhoods",
        body: "A home near the harbor or the center makes daily life feel effortless. A home farther out can make the town feel more isolated than the postcard suggests.",
      },
      {
        title: "Practical fit",
        body: "Test the errand loop, uphill walking comfort, and the transfer to Dubrovnik or the airport before you commit to a long stay.",
      },
    ],
  },
  hiroshima: {
    heroLabel: "Daily reality",
    heroBody:
      "The city feels strongest when you treat it as a well-run urban base rather than a dramatic destination: tram lines, riverside space, neighborhood routines, and enough cultural life to stay engaged.",
    sections: [
      {
        title: "Who it fits",
        body: "Best for people who want a calm, well-ordered Japanese city with strong infrastructure and real daily usefulness.",
      },
      {
        title: "Who may struggle",
        body: "Less ideal for people who need constant nightlife, a large foreigner scene, or a heavily stimulated urban rhythm.",
      },
      {
        title: "After three months",
        body: "The appeal becomes more practical than romantic. The city works because it is repeatable, manageable, and easy to navigate without turning everyday life into a project.",
      },
      {
        title: "Main tradeoff",
        body: "You get calmer streets and stronger everyday usability, but you give up some of the variety and intensity of Tokyo or Osaka.",
      },
      {
        title: "Neighborhoods",
        body: "Central access zones around Hondori and Kamiyacho are strong first scouting points, but quieter residential pockets deserve a close look too.",
      },
      {
        title: "Practical fit",
        body: "Test tram and rail movement, hospital access, humid-season comfort, and the real effort of a Miyajima day trip from your target district.",
      },
    ],
  },
  kobe: {
    heroLabel: "Daily reality",
    heroBody:
      "Kobe feels best when you use it as a real city with a strong harbor edge and enough urban texture to keep everyday life interesting.",
    sections: [
      {
        title: "Who it fits",
        body: "Best for people who want a polished port city with strong access to broader Kansai life and enough social energy to stay engaged.",
      },
      {
        title: "Who may struggle",
        body: "Less ideal for people who want low-key neighborhoods, very quiet mornings, or a retirement life with limited urban variety.",
      },
      {
        title: "After three months",
        body: "The city remains appealing because it feels social and useful rather than sleepy. The right district makes that difference more than the city name alone.",
      },
      {
        title: "Main tradeoff",
        body: "You gain accessibility and urban texture, but you give up some of the calm and smaller-scale routine that other coastal places offer.",
      },
      {
        title: "Neighborhoods",
        body: "Choose a base that keeps trains, groceries, and daily errands within easy reach; the wrong district can make the city feel effortful.",
      },
      {
        title: "Practical fit",
        body: "Test the harbor-to-hills geometry, the commute to Osaka or Kyoto, and whether your chosen block feels like a place you would actually enjoy living in.",
      },
    ],
  },
};

export function getDestinationRelocationFrame(city: string | null | undefined): RelocationFrame | null {
  if (!city) return null;
  const key = city.trim().toLowerCase();
  return RELOCATION_FRAMES[key] ?? null;
}
