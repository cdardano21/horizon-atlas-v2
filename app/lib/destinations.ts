export type Destination = {
  slug: string;
  city: string;
  country: string;
  emoji: string;
  match: number;
  description: string;
  overview: string;
  climate: string;
  lifestyle: string;
  transportation: string;
  images: { src: string; alt: string; caption: string }[];
  tags?: string[];
};

export const LAUNCH_CATALOG_SIZE = 500;

export const destinations: Destination[] = [
  {
    "slug": "vila-ad",
    "city": "Vila",
    "country": "AD",
    "emoji": "🌍",
    "match": 95.5,
    "description": "A destination known for nightlife, culture, healthcare and mild climate.",
    "overview": "Experience Vila's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vila%20skyline",
        "alt": "Vila skyline",
        "caption": "Vila cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vila%20street",
        "alt": "Vila street scene",
        "caption": "An atmospheric look at Vila's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vila%20lifestyle",
        "alt": "Vila lifestyle",
        "caption": "Daily life and culture in Vila."
      }
    ],
    "tags": [
      "nightlife",
      "culture",
      "healthcare",
      "outdoor recreation"
    ]
  },
  {
    "slug": "el-tarter-ad",
    "city": "El Tarter",
    "country": "AD",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for island, culture, nature and mild climate.",
    "overview": "Experience El Tarter's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?El%20Tarter%20skyline",
        "alt": "El Tarter skyline",
        "caption": "El Tarter cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?El%20Tarter%20street",
        "alt": "El Tarter street scene",
        "caption": "An atmospheric look at El Tarter's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?El%20Tarter%20lifestyle",
        "alt": "El Tarter lifestyle",
        "caption": "Daily life and culture in El Tarter."
      }
    ],
    "tags": [
      "island",
      "culture",
      "nature",
      "walkability"
    ]
  },
  {
    "slug": "sant-juli-de-l-ria-ad",
    "city": "Sant Julià de Lòria",
    "country": "AD",
    "emoji": "🌍",
    "match": 96.2,
    "description": "A destination known for mountains, walkability, digital nomad and mild climate.",
    "overview": "Experience Sant Julià de Lòria's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sant%20Juli%C3%A0%20de%20L%C3%B2ria%20skyline",
        "alt": "Sant Julià de Lòria skyline",
        "caption": "Sant Julià de Lòria cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sant%20Juli%C3%A0%20de%20L%C3%B2ria%20street",
        "alt": "Sant Julià de Lòria street scene",
        "caption": "An atmospheric look at Sant Julià de Lòria's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sant%20Juli%C3%A0%20de%20L%C3%B2ria%20lifestyle",
        "alt": "Sant Julià de Lòria lifestyle",
        "caption": "Daily life and culture in Sant Julià de Lòria."
      }
    ],
    "tags": [
      "mountains",
      "walkability",
      "digital nomad",
      "history"
    ]
  },
  {
    "slug": "santa-coloma-ad",
    "city": "Santa Coloma",
    "country": "AD",
    "emoji": "🌍",
    "match": 93.2,
    "description": "A destination known for retirement, nature, healthcare and mild climate.",
    "overview": "Experience Santa Coloma's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Santa%20Coloma%20skyline",
        "alt": "Santa Coloma skyline",
        "caption": "Santa Coloma cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Santa%20Coloma%20street",
        "alt": "Santa Coloma street scene",
        "caption": "An atmospheric look at Santa Coloma's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Santa%20Coloma%20lifestyle",
        "alt": "Santa Coloma lifestyle",
        "caption": "Daily life and culture in Santa Coloma."
      }
    ],
    "tags": [
      "retirement",
      "nature",
      "healthcare",
      "walkability"
    ]
  },
  {
    "slug": "pas-de-la-casa-ad",
    "city": "Pas de la Casa",
    "country": "AD",
    "emoji": "🌍",
    "match": 98.3,
    "description": "A destination known for lake, slow pace, golf and mild climate.",
    "overview": "Experience Pas de la Casa's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pas%20de%20la%20Casa%20skyline",
        "alt": "Pas de la Casa skyline",
        "caption": "Pas de la Casa cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%20de%20la%20Casa%20street",
        "alt": "Pas de la Casa street scene",
        "caption": "An atmospheric look at Pas de la Casa's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%20de%20la%20Casa%20lifestyle",
        "alt": "Pas de la Casa lifestyle",
        "caption": "Daily life and culture in Pas de la Casa."
      }
    ],
    "tags": [
      "lake",
      "slow pace",
      "golf",
      "budget"
    ]
  },
  {
    "slug": "ordino-ad",
    "city": "Ordino",
    "country": "AD",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for budget, startup, walkability and mild climate.",
    "overview": "Experience Ordino's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ordino%20skyline",
        "alt": "Ordino skyline",
        "caption": "Ordino cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ordino%20street",
        "alt": "Ordino street scene",
        "caption": "An atmospheric look at Ordino's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ordino%20lifestyle",
        "alt": "Ordino lifestyle",
        "caption": "Daily life and culture in Ordino."
      }
    ],
    "tags": [
      "budget",
      "startup",
      "walkability",
      "mountains"
    ]
  },
  {
    "slug": "les-escaldes-ad",
    "city": "les Escaldes",
    "country": "AD",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for outdoor recreation, culture, retirement and mild climate.",
    "overview": "Experience les Escaldes's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?les%20Escaldes%20skyline",
        "alt": "les Escaldes skyline",
        "caption": "les Escaldes cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?les%20Escaldes%20street",
        "alt": "les Escaldes street scene",
        "caption": "An atmospheric look at les Escaldes's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?les%20Escaldes%20lifestyle",
        "alt": "les Escaldes lifestyle",
        "caption": "Daily life and culture in les Escaldes."
      }
    ],
    "tags": [
      "outdoor recreation",
      "culture",
      "retirement",
      "wellness"
    ]
  },
  {
    "slug": "les-bons-ad",
    "city": "Les Bons",
    "country": "AD",
    "emoji": "🌍",
    "match": 93.2,
    "description": "A destination known for beach, mountains, island and mild climate.",
    "overview": "Experience Les Bons's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Les%20Bons%20skyline",
        "alt": "Les Bons skyline",
        "caption": "Les Bons cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Les%20Bons%20street",
        "alt": "Les Bons street scene",
        "caption": "An atmospheric look at Les Bons's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Les%20Bons%20lifestyle",
        "alt": "Les Bons lifestyle",
        "caption": "Daily life and culture in Les Bons."
      }
    ],
    "tags": [
      "beach",
      "mountains",
      "island",
      "food"
    ]
  },
  {
    "slug": "la-massana-ad",
    "city": "la Massana",
    "country": "AD",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for history, beach, expat-friendly and mild climate.",
    "overview": "Experience la Massana's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?la%20Massana%20skyline",
        "alt": "la Massana skyline",
        "caption": "la Massana cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?la%20Massana%20street",
        "alt": "la Massana street scene",
        "caption": "An atmospheric look at la Massana's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?la%20Massana%20lifestyle",
        "alt": "la Massana lifestyle",
        "caption": "Daily life and culture in la Massana."
      }
    ],
    "tags": [
      "history",
      "beach",
      "expat-friendly",
      "lake"
    ]
  },
  {
    "slug": "encamp-ad",
    "city": "Encamp",
    "country": "AD",
    "emoji": "🌍",
    "match": 92.7,
    "description": "A destination known for mountains, expat-friendly, beach and mild climate.",
    "overview": "Experience Encamp's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Encamp%20skyline",
        "alt": "Encamp skyline",
        "caption": "Encamp cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Encamp%20street",
        "alt": "Encamp street scene",
        "caption": "An atmospheric look at Encamp's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Encamp%20lifestyle",
        "alt": "Encamp lifestyle",
        "caption": "Daily life and culture in Encamp."
      }
    ],
    "tags": [
      "mountains",
      "expat-friendly",
      "beach",
      "climate"
    ]
  },
  {
    "slug": "canillo-ad",
    "city": "Canillo",
    "country": "AD",
    "emoji": "🌍",
    "match": 93.6,
    "description": "A destination known for nightlife, walkability, startup and mild climate.",
    "overview": "Experience Canillo's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Canillo%20skyline",
        "alt": "Canillo skyline",
        "caption": "Canillo cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Canillo%20street",
        "alt": "Canillo street scene",
        "caption": "An atmospheric look at Canillo's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Canillo%20lifestyle",
        "alt": "Canillo lifestyle",
        "caption": "Daily life and culture in Canillo."
      }
    ],
    "tags": [
      "nightlife",
      "walkability",
      "startup",
      "beach"
    ]
  },
  {
    "slug": "arinsal-ad",
    "city": "Arinsal",
    "country": "AD",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for history, retirement, expat-friendly and mild climate.",
    "overview": "Experience Arinsal's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Arinsal%20skyline",
        "alt": "Arinsal skyline",
        "caption": "Arinsal cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Arinsal%20street",
        "alt": "Arinsal street scene",
        "caption": "An atmospheric look at Arinsal's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Arinsal%20lifestyle",
        "alt": "Arinsal lifestyle",
        "caption": "Daily life and culture in Arinsal."
      }
    ],
    "tags": [
      "history",
      "retirement",
      "expat-friendly",
      "culture"
    ]
  },
  {
    "slug": "any-s-ad",
    "city": "Anyós",
    "country": "AD",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for digital nomad, beach, luxury and mild climate.",
    "overview": "Experience Anyós's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Any%C3%B3s%20skyline",
        "alt": "Anyós skyline",
        "caption": "Anyós cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Any%C3%B3s%20street",
        "alt": "Anyós street scene",
        "caption": "An atmospheric look at Anyós's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Any%C3%B3s%20lifestyle",
        "alt": "Anyós lifestyle",
        "caption": "Daily life and culture in Anyós."
      }
    ],
    "tags": [
      "digital nomad",
      "beach",
      "luxury",
      "nightlife"
    ]
  },
  {
    "slug": "andorra-la-vella-ad",
    "city": "Andorra la Vella",
    "country": "AD",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for climate, lake, walkability and mild climate.",
    "overview": "Experience Andorra la Vella's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Andorra%20la%20Vella%20skyline",
        "alt": "Andorra la Vella skyline",
        "caption": "Andorra la Vella cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Andorra%20la%20Vella%20street",
        "alt": "Andorra la Vella street scene",
        "caption": "An atmospheric look at Andorra la Vella's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Andorra%20la%20Vella%20lifestyle",
        "alt": "Andorra la Vella lifestyle",
        "caption": "Daily life and culture in Andorra la Vella."
      }
    ],
    "tags": [
      "climate",
      "lake",
      "walkability",
      "outdoor recreation"
    ]
  },
  {
    "slug": "aixirivall-ad",
    "city": "Aixirivall",
    "country": "AD",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for island, history, climate and mild climate.",
    "overview": "Experience Aixirivall's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Aixirivall%20skyline",
        "alt": "Aixirivall skyline",
        "caption": "Aixirivall cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aixirivall%20street",
        "alt": "Aixirivall street scene",
        "caption": "An atmospheric look at Aixirivall's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aixirivall%20lifestyle",
        "alt": "Aixirivall lifestyle",
        "caption": "Daily life and culture in Aixirivall."
      }
    ],
    "tags": [
      "island",
      "history",
      "climate",
      "culture"
    ]
  },
  {
    "slug": "war-s-n-ae",
    "city": "Warīsān",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.9,
    "description": "A destination known for startup, golf, budget and tropical warmth.",
    "overview": "Experience Warīsān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?War%C4%ABs%C4%81n%20skyline",
        "alt": "Warīsān skyline",
        "caption": "Warīsān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?War%C4%ABs%C4%81n%20street",
        "alt": "Warīsān street scene",
        "caption": "An atmospheric look at Warīsān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?War%C4%ABs%C4%81n%20lifestyle",
        "alt": "Warīsān lifestyle",
        "caption": "Daily life and culture in Warīsān."
      }
    ],
    "tags": [
      "startup",
      "golf",
      "budget",
      "coast"
    ]
  },
  {
    "slug": "umm-suqaym-ae",
    "city": "Umm Suqaym",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.2,
    "description": "A destination known for culture, lake, beach and tropical warmth.",
    "overview": "Experience Umm Suqaym's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Suqaym%20skyline",
        "alt": "Umm Suqaym skyline",
        "caption": "Umm Suqaym cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Suqaym%20street",
        "alt": "Umm Suqaym street scene",
        "caption": "An atmospheric look at Umm Suqaym's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Suqaym%20lifestyle",
        "alt": "Umm Suqaym lifestyle",
        "caption": "Daily life and culture in Umm Suqaym."
      }
    ],
    "tags": [
      "culture",
      "lake",
      "beach",
      "walkability"
    ]
  },
  {
    "slug": "umm-al-quwain-city-ae",
    "city": "Umm Al Quwain City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.6,
    "description": "A destination known for expat-friendly, luxury, walkability and tropical warmth.",
    "overview": "Experience Umm Al Quwain City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Quwain%20City%20skyline",
        "alt": "Umm Al Quwain City skyline",
        "caption": "Umm Al Quwain City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Quwain%20City%20street",
        "alt": "Umm Al Quwain City street scene",
        "caption": "An atmospheric look at Umm Al Quwain City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Quwain%20City%20lifestyle",
        "alt": "Umm Al Quwain City lifestyle",
        "caption": "Daily life and culture in Umm Al Quwain City."
      }
    ],
    "tags": [
      "expat-friendly",
      "luxury",
      "walkability",
      "climate"
    ]
  },
  {
    "slug": "ar-f-kalb-ae",
    "city": "Ţarīf Kalbā",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.7,
    "description": "A destination known for lake, family, budget and tropical warmth.",
    "overview": "Experience Ţarīf Kalbā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2ar%C4%ABf%20Kalb%C4%81%20skyline",
        "alt": "Ţarīf Kalbā skyline",
        "caption": "Ţarīf Kalbā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2ar%C4%ABf%20Kalb%C4%81%20street",
        "alt": "Ţarīf Kalbā street scene",
        "caption": "An atmospheric look at Ţarīf Kalbā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2ar%C4%ABf%20Kalb%C4%81%20lifestyle",
        "alt": "Ţarīf Kalbā lifestyle",
        "caption": "Daily life and culture in Ţarīf Kalbā."
      }
    ],
    "tags": [
      "lake",
      "family",
      "budget",
      "safety"
    ]
  },
  {
    "slug": "ar-r-shid-yah-ae",
    "city": "Ar Rāshidīyah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.6,
    "description": "A destination known for coast, history, slow pace and tropical warmth.",
    "overview": "Experience Ar Rāshidīyah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ar%20R%C4%81shid%C4%AByah%20skyline",
        "alt": "Ar Rāshidīyah skyline",
        "caption": "Ar Rāshidīyah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20R%C4%81shid%C4%AByah%20street",
        "alt": "Ar Rāshidīyah street scene",
        "caption": "An atmospheric look at Ar Rāshidīyah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20R%C4%81shid%C4%AByah%20lifestyle",
        "alt": "Ar Rāshidīyah lifestyle",
        "caption": "Daily life and culture in Ar Rāshidīyah."
      }
    ],
    "tags": [
      "coast",
      "history",
      "slow pace",
      "arts"
    ]
  },
  {
    "slug": "ras-al-khaimah-ae",
    "city": "Ras Al Khaimah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.6,
    "description": "A destination known for history, nature, island and tropical warmth.",
    "overview": "Experience Ras Al Khaimah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ras%20Al%20Khaimah%20skyline",
        "alt": "Ras Al Khaimah skyline",
        "caption": "Ras Al Khaimah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ras%20Al%20Khaimah%20street",
        "alt": "Ras Al Khaimah street scene",
        "caption": "An atmospheric look at Ras Al Khaimah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ras%20Al%20Khaimah%20lifestyle",
        "alt": "Ras Al Khaimah lifestyle",
        "caption": "Daily life and culture in Ras Al Khaimah."
      }
    ],
    "tags": [
      "history",
      "nature",
      "island",
      "budget"
    ]
  },
  {
    "slug": "muzayri-ae",
    "city": "Muzayri‘",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.1,
    "description": "A destination known for digital nomad, healthcare, slow pace and tropical warmth.",
    "overview": "Experience Muzayri‘'s sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Muzayri%E2%80%98%20skyline",
        "alt": "Muzayri‘ skyline",
        "caption": "Muzayri‘ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muzayri%E2%80%98%20street",
        "alt": "Muzayri‘ street scene",
        "caption": "An atmospheric look at Muzayri‘'s streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muzayri%E2%80%98%20lifestyle",
        "alt": "Muzayri‘ lifestyle",
        "caption": "Daily life and culture in Muzayri‘."
      }
    ],
    "tags": [
      "digital nomad",
      "healthcare",
      "slow pace",
      "retirement"
    ]
  },
  {
    "slug": "murba-ae",
    "city": "Murbaḩ",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99,
    "description": "A destination known for startup, eco, family and tropical warmth.",
    "overview": "Experience Murbaḩ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Murba%E1%B8%A9%20skyline",
        "alt": "Murbaḩ skyline",
        "caption": "Murbaḩ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Murba%E1%B8%A9%20street",
        "alt": "Murbaḩ street scene",
        "caption": "An atmospheric look at Murbaḩ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Murba%E1%B8%A9%20lifestyle",
        "alt": "Murbaḩ lifestyle",
        "caption": "Daily life and culture in Murbaḩ."
      }
    ],
    "tags": [
      "startup",
      "eco",
      "family",
      "walkability"
    ]
  },
  {
    "slug": "ma-f-ae",
    "city": "Maşfūţ",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for budget, climate, culture and tropical warmth.",
    "overview": "Experience Maşfūţ's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ma%C5%9Ff%C5%AB%C5%A3%20skyline",
        "alt": "Maşfūţ skyline",
        "caption": "Maşfūţ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ma%C5%9Ff%C5%AB%C5%A3%20street",
        "alt": "Maşfūţ street scene",
        "caption": "An atmospheric look at Maşfūţ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ma%C5%9Ff%C5%AB%C5%A3%20lifestyle",
        "alt": "Maşfūţ lifestyle",
        "caption": "Daily life and culture in Maşfūţ."
      }
    ],
    "tags": [
      "budget",
      "climate",
      "culture",
      "slow pace"
    ]
  },
  {
    "slug": "zayed-city-ae",
    "city": "Zayed City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.6,
    "description": "A destination known for coast, slow pace, island and tropical warmth.",
    "overview": "Experience Zayed City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zayed%20City%20skyline",
        "alt": "Zayed City skyline",
        "caption": "Zayed City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zayed%20City%20street",
        "alt": "Zayed City street scene",
        "caption": "An atmospheric look at Zayed City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zayed%20City%20lifestyle",
        "alt": "Zayed City lifestyle",
        "caption": "Daily life and culture in Zayed City."
      }
    ],
    "tags": [
      "coast",
      "slow pace",
      "island",
      "arts"
    ]
  },
  {
    "slug": "khawr-fakk-n-ae",
    "city": "Khawr Fakkān",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.9,
    "description": "A destination known for wellness, history, digital nomad and tropical warmth.",
    "overview": "Experience Khawr Fakkān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khawr%20Fakk%C4%81n%20skyline",
        "alt": "Khawr Fakkān skyline",
        "caption": "Khawr Fakkān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khawr%20Fakk%C4%81n%20street",
        "alt": "Khawr Fakkān street scene",
        "caption": "An atmospheric look at Khawr Fakkān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khawr%20Fakk%C4%81n%20lifestyle",
        "alt": "Khawr Fakkān lifestyle",
        "caption": "Daily life and culture in Khawr Fakkān."
      }
    ],
    "tags": [
      "wellness",
      "history",
      "digital nomad",
      "outdoor recreation"
    ]
  },
  {
    "slug": "kalb-ae",
    "city": "Kalbā",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.7,
    "description": "A destination known for arts, nature, startup and tropical warmth.",
    "overview": "Experience Kalbā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kalb%C4%81%20skyline",
        "alt": "Kalbā skyline",
        "caption": "Kalbā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalb%C4%81%20street",
        "alt": "Kalbā street scene",
        "caption": "An atmospheric look at Kalbā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalb%C4%81%20lifestyle",
        "alt": "Kalbā lifestyle",
        "caption": "Daily life and culture in Kalbā."
      }
    ],
    "tags": [
      "arts",
      "nature",
      "startup",
      "healthcare"
    ]
  },
  {
    "slug": "jumayr-ae",
    "city": "Jumayrā",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.5,
    "description": "A destination known for outdoor recreation, digital nomad, island and tropical warmth.",
    "overview": "Experience Jumayrā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jumayr%C4%81%20skyline",
        "alt": "Jumayrā skyline",
        "caption": "Jumayrā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jumayr%C4%81%20street",
        "alt": "Jumayrā street scene",
        "caption": "An atmospheric look at Jumayrā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jumayr%C4%81%20lifestyle",
        "alt": "Jumayrā lifestyle",
        "caption": "Daily life and culture in Jumayrā."
      }
    ],
    "tags": [
      "outdoor recreation",
      "digital nomad",
      "island",
      "nature"
    ]
  },
  {
    "slug": "al-jaz-rah-al-amr-ae",
    "city": "Al Jazīrah al Ḩamrā’",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92,
    "description": "A destination known for eco, retirement, climate and tropical warmth.",
    "overview": "Experience Al Jazīrah al Ḩamrā’'s balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jaz%C4%ABrah%20al%20%E1%B8%A8amr%C4%81%E2%80%99%20skyline",
        "alt": "Al Jazīrah al Ḩamrā’ skyline",
        "caption": "Al Jazīrah al Ḩamrā’ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jaz%C4%ABrah%20al%20%E1%B8%A8amr%C4%81%E2%80%99%20street",
        "alt": "Al Jazīrah al Ḩamrā’ street scene",
        "caption": "An atmospheric look at Al Jazīrah al Ḩamrā’'s streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jaz%C4%ABrah%20al%20%E1%B8%A8amr%C4%81%E2%80%99%20lifestyle",
        "alt": "Al Jazīrah al Ḩamrā’ lifestyle",
        "caption": "Daily life and culture in Al Jazīrah al Ḩamrā’."
      }
    ],
    "tags": [
      "eco",
      "retirement",
      "climate",
      "nightlife"
    ]
  },
  {
    "slug": "dubai-ae",
    "city": "Dubai",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.7,
    "description": "A destination known for safety, startup, slow pace and tropical warmth.",
    "overview": "Experience Dubai's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20skyline",
        "alt": "Dubai skyline",
        "caption": "Dubai cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20street",
        "alt": "Dubai street scene",
        "caption": "An atmospheric look at Dubai's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20lifestyle",
        "alt": "Dubai lifestyle",
        "caption": "Daily life and culture in Dubai."
      }
    ],
    "tags": [
      "safety",
      "startup",
      "slow pace",
      "wellness"
    ]
  },
  {
    "slug": "dibba-al-fujairah-ae",
    "city": "Dibba Al-Fujairah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.4,
    "description": "A destination known for retirement, island, arts and tropical warmth.",
    "overview": "Experience Dibba Al-Fujairah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Fujairah%20skyline",
        "alt": "Dibba Al-Fujairah skyline",
        "caption": "Dibba Al-Fujairah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Fujairah%20street",
        "alt": "Dibba Al-Fujairah street scene",
        "caption": "An atmospheric look at Dibba Al-Fujairah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Fujairah%20lifestyle",
        "alt": "Dibba Al-Fujairah lifestyle",
        "caption": "Daily life and culture in Dibba Al-Fujairah."
      }
    ],
    "tags": [
      "retirement",
      "island",
      "arts",
      "coast"
    ]
  },
  {
    "slug": "dibba-al-hisn-ae",
    "city": "Dibba Al-Hisn",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.7,
    "description": "A destination known for family, walkability, coast and tropical warmth.",
    "overview": "Experience Dibba Al-Hisn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Hisn%20skyline",
        "alt": "Dibba Al-Hisn skyline",
        "caption": "Dibba Al-Hisn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Hisn%20street",
        "alt": "Dibba Al-Hisn street scene",
        "caption": "An atmospheric look at Dibba Al-Hisn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dibba%20Al-Hisn%20lifestyle",
        "alt": "Dibba Al-Hisn lifestyle",
        "caption": "Daily life and culture in Dibba Al-Hisn."
      }
    ],
    "tags": [
      "family",
      "walkability",
      "coast",
      "wellness"
    ]
  },
  {
    "slug": "dayrah-ae",
    "city": "Dayrah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.4,
    "description": "A destination known for startup, nature, healthcare and tropical warmth.",
    "overview": "Experience Dayrah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dayrah%20skyline",
        "alt": "Dayrah skyline",
        "caption": "Dayrah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dayrah%20street",
        "alt": "Dayrah street scene",
        "caption": "An atmospheric look at Dayrah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dayrah%20lifestyle",
        "alt": "Dayrah lifestyle",
        "caption": "Daily life and culture in Dayrah."
      }
    ],
    "tags": [
      "startup",
      "nature",
      "healthcare",
      "mountains"
    ]
  },
  {
    "slug": "sharjah-ae",
    "city": "Sharjah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.8,
    "description": "A destination known for golf, nightlife, digital nomad and tropical warmth.",
    "overview": "Experience Sharjah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sharjah%20skyline",
        "alt": "Sharjah skyline",
        "caption": "Sharjah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sharjah%20street",
        "alt": "Sharjah street scene",
        "caption": "An atmospheric look at Sharjah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sharjah%20lifestyle",
        "alt": "Sharjah lifestyle",
        "caption": "Daily life and culture in Sharjah."
      }
    ],
    "tags": [
      "golf",
      "nightlife",
      "digital nomad",
      "retirement"
    ]
  },
  {
    "slug": "ash-sha-m-ae",
    "city": "Ash Sha‘m",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.6,
    "description": "A destination known for island, coast, history and tropical warmth.",
    "overview": "Experience Ash Sha‘m's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ash%20Sha%E2%80%98m%20skyline",
        "alt": "Ash Sha‘m skyline",
        "caption": "Ash Sha‘m cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ash%20Sha%E2%80%98m%20street",
        "alt": "Ash Sha‘m street scene",
        "caption": "An atmospheric look at Ash Sha‘m's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ash%20Sha%E2%80%98m%20lifestyle",
        "alt": "Ash Sha‘m lifestyle",
        "caption": "Daily life and culture in Ash Sha‘m."
      }
    ],
    "tags": [
      "island",
      "coast",
      "history",
      "beach"
    ]
  },
  {
    "slug": "ar-ruways-ae",
    "city": "Ar Ruways",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.5,
    "description": "A destination known for history, mountains, outdoor recreation and tropical warmth.",
    "overview": "Experience Ar Ruways's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Ruways%20skyline",
        "alt": "Ar Ruways skyline",
        "caption": "Ar Ruways cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Ruways%20street",
        "alt": "Ar Ruways street scene",
        "caption": "An atmospheric look at Ar Ruways's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Ruways%20lifestyle",
        "alt": "Ar Ruways lifestyle",
        "caption": "Daily life and culture in Ar Ruways."
      }
    ],
    "tags": [
      "history",
      "mountains",
      "outdoor recreation",
      "golf"
    ]
  },
  {
    "slug": "ar-rams-ae",
    "city": "Ar Rams",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.2,
    "description": "A destination known for coast, golf, walkability and tropical warmth.",
    "overview": "Experience Ar Rams's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rams%20skyline",
        "alt": "Ar Rams skyline",
        "caption": "Ar Rams cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rams%20street",
        "alt": "Ar Rams street scene",
        "caption": "An atmospheric look at Ar Rams's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rams%20lifestyle",
        "alt": "Ar Rams lifestyle",
        "caption": "Daily life and culture in Ar Rams."
      }
    ],
    "tags": [
      "coast",
      "golf",
      "walkability",
      "climate"
    ]
  },
  {
    "slug": "al-man-mah-ae",
    "city": "Al Manāmah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99,
    "description": "A destination known for safety, beach, lake and tropical warmth.",
    "overview": "Experience Al Manāmah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Man%C4%81mah%20skyline",
        "alt": "Al Manāmah skyline",
        "caption": "Al Manāmah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Man%C4%81mah%20street",
        "alt": "Al Manāmah street scene",
        "caption": "An atmospheric look at Al Manāmah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Man%C4%81mah%20lifestyle",
        "alt": "Al Manāmah lifestyle",
        "caption": "Daily life and culture in Al Manāmah."
      }
    ],
    "tags": [
      "safety",
      "beach",
      "lake",
      "slow pace"
    ]
  },
  {
    "slug": "al-amr-yah-ae",
    "city": "Al Ḩamrīyah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.6,
    "description": "A destination known for expat-friendly, eco, slow pace and tropical warmth.",
    "overview": "Experience Al Ḩamrīyah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8amr%C4%AByah%20skyline",
        "alt": "Al Ḩamrīyah skyline",
        "caption": "Al Ḩamrīyah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8amr%C4%AByah%20street",
        "alt": "Al Ḩamrīyah street scene",
        "caption": "An atmospheric look at Al Ḩamrīyah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8amr%C4%AByah%20lifestyle",
        "alt": "Al Ḩamrīyah lifestyle",
        "caption": "Daily life and culture in Al Ḩamrīyah."
      }
    ],
    "tags": [
      "expat-friendly",
      "eco",
      "slow pace",
      "golf"
    ]
  },
  {
    "slug": "att-ae",
    "city": "Ḩattā",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.5,
    "description": "A destination known for safety, island, mountains and tropical warmth.",
    "overview": "Experience Ḩattā's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8att%C4%81%20skyline",
        "alt": "Ḩattā skyline",
        "caption": "Ḩattā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8att%C4%81%20street",
        "alt": "Ḩattā street scene",
        "caption": "An atmospheric look at Ḩattā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8att%C4%81%20lifestyle",
        "alt": "Ḩattā lifestyle",
        "caption": "Daily life and culture in Ḩattā."
      }
    ],
    "tags": [
      "safety",
      "island",
      "mountains",
      "budget"
    ]
  },
  {
    "slug": "fujairah-ae",
    "city": "Fujairah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.6,
    "description": "A destination known for mountains, arts, retirement and tropical warmth.",
    "overview": "Experience Fujairah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Fujairah%20skyline",
        "alt": "Fujairah skyline",
        "caption": "Fujairah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fujairah%20street",
        "alt": "Fujairah street scene",
        "caption": "An atmospheric look at Fujairah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fujairah%20lifestyle",
        "alt": "Fujairah lifestyle",
        "caption": "Daily life and culture in Fujairah."
      }
    ],
    "tags": [
      "mountains",
      "arts",
      "retirement",
      "culture"
    ]
  },
  {
    "slug": "al-ain-city-ae",
    "city": "Al Ain City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.8,
    "description": "A destination known for food, wellness, luxury and tropical warmth.",
    "overview": "Experience Al Ain City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Ain%20City%20skyline",
        "alt": "Al Ain City skyline",
        "caption": "Al Ain City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Ain%20City%20street",
        "alt": "Al Ain City street scene",
        "caption": "An atmospheric look at Al Ain City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Ain%20City%20lifestyle",
        "alt": "Al Ain City lifestyle",
        "caption": "Daily life and culture in Al Ain City."
      }
    ],
    "tags": [
      "food",
      "wellness",
      "luxury",
      "eco"
    ]
  },
  {
    "slug": "ajman-ae",
    "city": "Ajman",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.8,
    "description": "A destination known for arts, climate, wellness and tropical warmth.",
    "overview": "Experience Ajman's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ajman%20skyline",
        "alt": "Ajman skyline",
        "caption": "Ajman cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ajman%20street",
        "alt": "Ajman street scene",
        "caption": "An atmospheric look at Ajman's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ajman%20lifestyle",
        "alt": "Ajman lifestyle",
        "caption": "Daily life and culture in Ajman."
      }
    ],
    "tags": [
      "arts",
      "climate",
      "wellness",
      "walkability"
    ]
  },
  {
    "slug": "adh-dhayd-ae",
    "city": "Adh Dhayd",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.3,
    "description": "A destination known for digital nomad, luxury, eco and tropical warmth.",
    "overview": "Experience Adh Dhayd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Adh%20Dhayd%20skyline",
        "alt": "Adh Dhayd skyline",
        "caption": "Adh Dhayd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Adh%20Dhayd%20street",
        "alt": "Adh Dhayd street scene",
        "caption": "An atmospheric look at Adh Dhayd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Adh%20Dhayd%20lifestyle",
        "alt": "Adh Dhayd lifestyle",
        "caption": "Daily life and culture in Adh Dhayd."
      }
    ],
    "tags": [
      "digital nomad",
      "luxury",
      "eco",
      "lake"
    ]
  },
  {
    "slug": "abu-dhabi-ae",
    "city": "Abu Dhabi",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.4,
    "description": "A destination known for digital nomad, coast, climate and tropical warmth.",
    "overview": "Experience Abu Dhabi's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Abu%20Dhabi%20skyline",
        "alt": "Abu Dhabi skyline",
        "caption": "Abu Dhabi cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Abu%20Dhabi%20street",
        "alt": "Abu Dhabi street scene",
        "caption": "An atmospheric look at Abu Dhabi's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Abu%20Dhabi%20lifestyle",
        "alt": "Abu Dhabi lifestyle",
        "caption": "Daily life and culture in Abu Dhabi."
      }
    ],
    "tags": [
      "digital nomad",
      "coast",
      "climate",
      "arts"
    ]
  },
  {
    "slug": "ab-hayl-ae",
    "city": "Abū Hayl",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.8,
    "description": "A destination known for arts, golf, retirement and tropical warmth.",
    "overview": "Experience Abū Hayl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20Hayl%20skyline",
        "alt": "Abū Hayl skyline",
        "caption": "Abū Hayl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20Hayl%20street",
        "alt": "Abū Hayl street scene",
        "caption": "An atmospheric look at Abū Hayl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20Hayl%20lifestyle",
        "alt": "Abū Hayl lifestyle",
        "caption": "Daily life and culture in Abū Hayl."
      }
    ],
    "tags": [
      "arts",
      "golf",
      "retirement",
      "healthcare"
    ]
  },
  {
    "slug": "as-sa-wah-ae",
    "city": "As Saţwah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.2,
    "description": "A destination known for retirement, food, nightlife and tropical warmth.",
    "overview": "Experience As Saţwah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20skyline",
        "alt": "As Saţwah skyline",
        "caption": "As Saţwah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20street",
        "alt": "As Saţwah street scene",
        "caption": "An atmospheric look at As Saţwah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20lifestyle",
        "alt": "As Saţwah lifestyle",
        "caption": "Daily life and culture in As Saţwah."
      }
    ],
    "tags": [
      "retirement",
      "food",
      "nightlife",
      "outdoor recreation"
    ]
  },
  {
    "slug": "margham-ae",
    "city": "Margham",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.1,
    "description": "A destination known for nightlife, slow pace, expat-friendly and tropical warmth.",
    "overview": "Experience Margham's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Margham%20skyline",
        "alt": "Margham skyline",
        "caption": "Margham cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Margham%20street",
        "alt": "Margham street scene",
        "caption": "An atmospheric look at Margham's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Margham%20lifestyle",
        "alt": "Margham lifestyle",
        "caption": "Daily life and culture in Margham."
      }
    ],
    "tags": [
      "nightlife",
      "slow pace",
      "expat-friendly",
      "history"
    ]
  },
  {
    "slug": "ab-m-s-ae",
    "city": "Abū Mūsá",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.1,
    "description": "A destination known for retirement, luxury, history and tropical warmth.",
    "overview": "Experience Abū Mūsá's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20M%C5%ABs%C3%A1%20skyline",
        "alt": "Abū Mūsá skyline",
        "caption": "Abū Mūsá cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20M%C5%ABs%C3%A1%20street",
        "alt": "Abū Mūsá street scene",
        "caption": "An atmospheric look at Abū Mūsá's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ab%C5%AB%20M%C5%ABs%C3%A1%20lifestyle",
        "alt": "Abū Mūsá lifestyle",
        "caption": "Daily life and culture in Abū Mūsá."
      }
    ],
    "tags": [
      "retirement",
      "luxury",
      "history",
      "food"
    ]
  },
  {
    "slug": "nadd-al-umr-ae",
    "city": "Nadd al Ḩumr",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96,
    "description": "A destination known for luxury, family, walkability and tropical warmth.",
    "overview": "Experience Nadd al Ḩumr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Nadd%20al%20%E1%B8%A8umr%20skyline",
        "alt": "Nadd al Ḩumr skyline",
        "caption": "Nadd al Ḩumr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nadd%20al%20%E1%B8%A8umr%20street",
        "alt": "Nadd al Ḩumr street scene",
        "caption": "An atmospheric look at Nadd al Ḩumr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nadd%20al%20%E1%B8%A8umr%20lifestyle",
        "alt": "Nadd al Ḩumr lifestyle",
        "caption": "Daily life and culture in Nadd al Ḩumr."
      }
    ],
    "tags": [
      "luxury",
      "family",
      "walkability",
      "beach"
    ]
  },
  {
    "slug": "al-lusayl-ae",
    "city": "Al Lusaylī",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.5,
    "description": "A destination known for expat-friendly, food, arts and tropical warmth.",
    "overview": "Experience Al Lusaylī's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Lusayl%C4%AB%20skyline",
        "alt": "Al Lusaylī skyline",
        "caption": "Al Lusaylī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Lusayl%C4%AB%20street",
        "alt": "Al Lusaylī street scene",
        "caption": "An atmospheric look at Al Lusaylī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Lusayl%C4%AB%20lifestyle",
        "alt": "Al Lusaylī lifestyle",
        "caption": "Daily life and culture in Al Lusaylī."
      }
    ],
    "tags": [
      "expat-friendly",
      "food",
      "arts",
      "nature"
    ]
  },
  {
    "slug": "suway-n-ae",
    "city": "Suwayḩān",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.4,
    "description": "A destination known for history, eco, slow pace and tropical warmth.",
    "overview": "Experience Suwayḩān's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Suway%E1%B8%A9%C4%81n%20skyline",
        "alt": "Suwayḩān skyline",
        "caption": "Suwayḩān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Suway%E1%B8%A9%C4%81n%20street",
        "alt": "Suwayḩān street scene",
        "caption": "An atmospheric look at Suwayḩān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Suway%E1%B8%A9%C4%81n%20lifestyle",
        "alt": "Suwayḩān lifestyle",
        "caption": "Daily life and culture in Suwayḩān."
      }
    ],
    "tags": [
      "history",
      "eco",
      "slow pace",
      "nature"
    ]
  },
  {
    "slug": "al-am-d-yah-ae",
    "city": "Al Ḩamīdīyah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.7,
    "description": "A destination known for budget, family, luxury and tropical warmth.",
    "overview": "Experience Al Ḩamīdīyah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8am%C4%ABd%C4%AByah%20skyline",
        "alt": "Al Ḩamīdīyah skyline",
        "caption": "Al Ḩamīdīyah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8am%C4%ABd%C4%AByah%20street",
        "alt": "Al Ḩamīdīyah street scene",
        "caption": "An atmospheric look at Al Ḩamīdīyah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20%E1%B8%A8am%C4%ABd%C4%AByah%20lifestyle",
        "alt": "Al Ḩamīdīyah lifestyle",
        "caption": "Daily life and culture in Al Ḩamīdīyah."
      }
    ],
    "tags": [
      "budget",
      "family",
      "luxury",
      "food"
    ]
  },
  {
    "slug": "al-waheda-ae",
    "city": "Al Waheda",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.7,
    "description": "A destination known for expat-friendly, budget, digital nomad and tropical warmth.",
    "overview": "Experience Al Waheda's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Waheda%20skyline",
        "alt": "Al Waheda skyline",
        "caption": "Al Waheda cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Waheda%20street",
        "alt": "Al Waheda street scene",
        "caption": "An atmospheric look at Al Waheda's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Waheda%20lifestyle",
        "alt": "Al Waheda lifestyle",
        "caption": "Daily life and culture in Al Waheda."
      }
    ],
    "tags": [
      "expat-friendly",
      "budget",
      "digital nomad",
      "outdoor recreation"
    ]
  },
  {
    "slug": "al-twar-first-ae",
    "city": "Al Twar First",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.9,
    "description": "A destination known for eco, luxury, golf and tropical warmth.",
    "overview": "Experience Al Twar First's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%20First%20skyline",
        "alt": "Al Twar First skyline",
        "caption": "Al Twar First cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%20First%20street",
        "alt": "Al Twar First street scene",
        "caption": "An atmospheric look at Al Twar First's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%20First%20lifestyle",
        "alt": "Al Twar First lifestyle",
        "caption": "Daily life and culture in Al Twar First."
      }
    ],
    "tags": [
      "eco",
      "luxury",
      "golf",
      "nature"
    ]
  },
  {
    "slug": "al-twar-second-ae",
    "city": "AL Twar Second",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.8,
    "description": "A destination known for family, arts, outdoor recreation and tropical warmth.",
    "overview": "Experience AL Twar Second's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?AL%20Twar%20Second%20skyline",
        "alt": "AL Twar Second skyline",
        "caption": "AL Twar Second cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?AL%20Twar%20Second%20street",
        "alt": "AL Twar Second street scene",
        "caption": "An atmospheric look at AL Twar Second's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?AL%20Twar%20Second%20lifestyle",
        "alt": "AL Twar Second lifestyle",
        "caption": "Daily life and culture in AL Twar Second."
      }
    ],
    "tags": [
      "family",
      "arts",
      "outdoor recreation",
      "golf"
    ]
  },
  {
    "slug": "al-qusais-second-ae",
    "city": "Al Qusais Second",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.6,
    "description": "A destination known for nature, lake, retirement and tropical warmth.",
    "overview": "Experience Al Qusais Second's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%20Second%20skyline",
        "alt": "Al Qusais Second skyline",
        "caption": "Al Qusais Second cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%20Second%20street",
        "alt": "Al Qusais Second street scene",
        "caption": "An atmospheric look at Al Qusais Second's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%20Second%20lifestyle",
        "alt": "Al Qusais Second lifestyle",
        "caption": "Daily life and culture in Al Qusais Second."
      }
    ],
    "tags": [
      "nature",
      "lake",
      "retirement",
      "slow pace"
    ]
  },
  {
    "slug": "al-karama-ae",
    "city": "Al Karama",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.3,
    "description": "A destination known for coast, budget, food and tropical warmth.",
    "overview": "Experience Al Karama's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Karama%20skyline",
        "alt": "Al Karama skyline",
        "caption": "Al Karama cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Karama%20street",
        "alt": "Al Karama street scene",
        "caption": "An atmospheric look at Al Karama's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Karama%20lifestyle",
        "alt": "Al Karama lifestyle",
        "caption": "Daily life and culture in Al Karama."
      }
    ],
    "tags": [
      "coast",
      "budget",
      "food",
      "nature"
    ]
  },
  {
    "slug": "al-hudaiba-ae",
    "city": "Al Hudaiba",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.1,
    "description": "A destination known for coast, history, golf and tropical warmth.",
    "overview": "Experience Al Hudaiba's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Hudaiba%20skyline",
        "alt": "Al Hudaiba skyline",
        "caption": "Al Hudaiba cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Hudaiba%20street",
        "alt": "Al Hudaiba street scene",
        "caption": "An atmospheric look at Al Hudaiba's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Hudaiba%20lifestyle",
        "alt": "Al Hudaiba lifestyle",
        "caption": "Daily life and culture in Al Hudaiba."
      }
    ],
    "tags": [
      "coast",
      "history",
      "golf",
      "island"
    ]
  },
  {
    "slug": "al-wasl-ae",
    "city": "Al Wasl",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.4,
    "description": "A destination known for eco, coast, wellness and tropical warmth.",
    "overview": "Experience Al Wasl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wasl%20skyline",
        "alt": "Al Wasl skyline",
        "caption": "Al Wasl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wasl%20street",
        "alt": "Al Wasl street scene",
        "caption": "An atmospheric look at Al Wasl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wasl%20lifestyle",
        "alt": "Al Wasl lifestyle",
        "caption": "Daily life and culture in Al Wasl."
      }
    ],
    "tags": [
      "eco",
      "coast",
      "wellness",
      "climate"
    ]
  },
  {
    "slug": "knowledge-village-ae",
    "city": "Knowledge Village",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for island, slow pace, arts and tropical warmth.",
    "overview": "Experience Knowledge Village's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Knowledge%20Village%20skyline",
        "alt": "Knowledge Village skyline",
        "caption": "Knowledge Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Knowledge%20Village%20street",
        "alt": "Knowledge Village street scene",
        "caption": "An atmospheric look at Knowledge Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Knowledge%20Village%20lifestyle",
        "alt": "Knowledge Village lifestyle",
        "caption": "Daily life and culture in Knowledge Village."
      }
    ],
    "tags": [
      "island",
      "slow pace",
      "arts",
      "safety"
    ]
  },
  {
    "slug": "the-palm-jumeirah-ae",
    "city": "The Palm Jumeirah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94,
    "description": "A destination known for safety, healthcare, digital nomad and tropical warmth.",
    "overview": "Experience The Palm Jumeirah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?The%20Palm%20Jumeirah%20skyline",
        "alt": "The Palm Jumeirah skyline",
        "caption": "The Palm Jumeirah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Palm%20Jumeirah%20street",
        "alt": "The Palm Jumeirah street scene",
        "caption": "An atmospheric look at The Palm Jumeirah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Palm%20Jumeirah%20lifestyle",
        "alt": "The Palm Jumeirah lifestyle",
        "caption": "Daily life and culture in The Palm Jumeirah."
      }
    ],
    "tags": [
      "safety",
      "healthcare",
      "digital nomad",
      "expat-friendly"
    ]
  },
  {
    "slug": "za-abeel-ae",
    "city": "Za'abeel",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.8,
    "description": "A destination known for eco, wellness, safety and tropical warmth.",
    "overview": "Experience Za'abeel's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Za'abeel%20skyline",
        "alt": "Za'abeel skyline",
        "caption": "Za'abeel cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Za'abeel%20street",
        "alt": "Za'abeel street scene",
        "caption": "An atmospheric look at Za'abeel's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Za'abeel%20lifestyle",
        "alt": "Za'abeel lifestyle",
        "caption": "Daily life and culture in Za'abeel."
      }
    ],
    "tags": [
      "eco",
      "wellness",
      "safety",
      "budget"
    ]
  },
  {
    "slug": "oud-metha-ae",
    "city": "Oud Metha",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.7,
    "description": "A destination known for startup, outdoor recreation, retirement and tropical warmth.",
    "overview": "Experience Oud Metha's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Oud%20Metha%20skyline",
        "alt": "Oud Metha skyline",
        "caption": "Oud Metha cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Oud%20Metha%20street",
        "alt": "Oud Metha street scene",
        "caption": "An atmospheric look at Oud Metha's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Oud%20Metha%20lifestyle",
        "alt": "Oud Metha lifestyle",
        "caption": "Daily life and culture in Oud Metha."
      }
    ],
    "tags": [
      "startup",
      "outdoor recreation",
      "retirement",
      "healthcare"
    ]
  },
  {
    "slug": "bur-dubai-ae",
    "city": "Bur Dubai",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.7,
    "description": "A destination known for healthcare, lake, history and tropical warmth.",
    "overview": "Experience Bur Dubai's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bur%20Dubai%20skyline",
        "alt": "Bur Dubai skyline",
        "caption": "Bur Dubai cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bur%20Dubai%20street",
        "alt": "Bur Dubai street scene",
        "caption": "An atmospheric look at Bur Dubai's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bur%20Dubai%20lifestyle",
        "alt": "Bur Dubai lifestyle",
        "caption": "Daily life and culture in Bur Dubai."
      }
    ],
    "tags": [
      "healthcare",
      "lake",
      "history",
      "budget"
    ]
  },
  {
    "slug": "khalifah-a-city-ae",
    "city": "Khalifah A City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.5,
    "description": "A destination known for lake, nightlife, healthcare and tropical warmth.",
    "overview": "Experience Khalifah A City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khalifah%20A%20City%20skyline",
        "alt": "Khalifah A City skyline",
        "caption": "Khalifah A City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khalifah%20A%20City%20street",
        "alt": "Khalifah A City street scene",
        "caption": "An atmospheric look at Khalifah A City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khalifah%20A%20City%20lifestyle",
        "alt": "Khalifah A City lifestyle",
        "caption": "Daily life and culture in Khalifah A City."
      }
    ],
    "tags": [
      "lake",
      "nightlife",
      "healthcare",
      "digital nomad"
    ]
  },
  {
    "slug": "shakhbout-city-ae",
    "city": "Shakhbout City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.7,
    "description": "A destination known for safety, arts, mountains and tropical warmth.",
    "overview": "Experience Shakhbout City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shakhbout%20City%20skyline",
        "alt": "Shakhbout City skyline",
        "caption": "Shakhbout City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shakhbout%20City%20street",
        "alt": "Shakhbout City street scene",
        "caption": "An atmospheric look at Shakhbout City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shakhbout%20City%20lifestyle",
        "alt": "Shakhbout City lifestyle",
        "caption": "Daily life and culture in Shakhbout City."
      }
    ],
    "tags": [
      "safety",
      "arts",
      "mountains",
      "expat-friendly"
    ]
  },
  {
    "slug": "mirdif-ae",
    "city": "Mirdif",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.8,
    "description": "A destination known for outdoor recreation, culture, lake and tropical warmth.",
    "overview": "Experience Mirdif's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mirdif%20skyline",
        "alt": "Mirdif skyline",
        "caption": "Mirdif cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mirdif%20street",
        "alt": "Mirdif street scene",
        "caption": "An atmospheric look at Mirdif's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mirdif%20lifestyle",
        "alt": "Mirdif lifestyle",
        "caption": "Daily life and culture in Mirdif."
      }
    ],
    "tags": [
      "outdoor recreation",
      "culture",
      "lake",
      "budget"
    ]
  },
  {
    "slug": "hawr-al-anz-ae",
    "city": "Hawr al ‘Anz",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.7,
    "description": "A destination known for digital nomad, climate, mountains and tropical warmth.",
    "overview": "Experience Hawr al ‘Anz's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Hawr%20al%20%E2%80%98Anz%20skyline",
        "alt": "Hawr al ‘Anz skyline",
        "caption": "Hawr al ‘Anz cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Hawr%20al%20%E2%80%98Anz%20street",
        "alt": "Hawr al ‘Anz street scene",
        "caption": "An atmospheric look at Hawr al ‘Anz's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Hawr%20al%20%E2%80%98Anz%20lifestyle",
        "alt": "Hawr al ‘Anz lifestyle",
        "caption": "Daily life and culture in Hawr al ‘Anz."
      }
    ],
    "tags": [
      "digital nomad",
      "climate",
      "mountains",
      "culture"
    ]
  },
  {
    "slug": "mankh-l-ae",
    "city": "Mankhūl",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for startup, beach, outdoor recreation and tropical warmth.",
    "overview": "Experience Mankhūl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mankh%C5%ABl%20skyline",
        "alt": "Mankhūl skyline",
        "caption": "Mankhūl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mankh%C5%ABl%20street",
        "alt": "Mankhūl street scene",
        "caption": "An atmospheric look at Mankhūl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mankh%C5%ABl%20lifestyle",
        "alt": "Mankhūl lifestyle",
        "caption": "Daily life and culture in Mankhūl."
      }
    ],
    "tags": [
      "startup",
      "beach",
      "outdoor recreation",
      "history"
    ]
  },
  {
    "slug": "b-r-sa-d-ae",
    "city": "Būr Sa‘īd",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.6,
    "description": "A destination known for lake, culture, safety and tropical warmth.",
    "overview": "Experience Būr Sa‘īd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABr%20Sa%E2%80%98%C4%ABd%20skyline",
        "alt": "Būr Sa‘īd skyline",
        "caption": "Būr Sa‘īd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABr%20Sa%E2%80%98%C4%ABd%20street",
        "alt": "Būr Sa‘īd street scene",
        "caption": "An atmospheric look at Būr Sa‘īd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABr%20Sa%E2%80%98%C4%ABd%20lifestyle",
        "alt": "Būr Sa‘īd lifestyle",
        "caption": "Daily life and culture in Būr Sa‘īd."
      }
    ],
    "tags": [
      "lake",
      "culture",
      "safety",
      "startup"
    ]
  },
  {
    "slug": "n-yf-ae",
    "city": "Nāyf",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for safety, history, wellness and tropical warmth.",
    "overview": "Experience Nāyf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yf%20skyline",
        "alt": "Nāyf skyline",
        "caption": "Nāyf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yf%20street",
        "alt": "Nāyf street scene",
        "caption": "An atmospheric look at Nāyf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yf%20lifestyle",
        "alt": "Nāyf lifestyle",
        "caption": "Daily life and culture in Nāyf."
      }
    ],
    "tags": [
      "safety",
      "history",
      "wellness",
      "climate"
    ]
  },
  {
    "slug": "al-murar-al-qad-m-ae",
    "city": "Al Murar al Qadīm",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.7,
    "description": "A destination known for arts, retirement, digital nomad and tropical warmth.",
    "overview": "Experience Al Murar al Qadīm's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Murar%20al%20Qad%C4%ABm%20skyline",
        "alt": "Al Murar al Qadīm skyline",
        "caption": "Al Murar al Qadīm cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Murar%20al%20Qad%C4%ABm%20street",
        "alt": "Al Murar al Qadīm street scene",
        "caption": "An atmospheric look at Al Murar al Qadīm's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Murar%20al%20Qad%C4%ABm%20lifestyle",
        "alt": "Al Murar al Qadīm lifestyle",
        "caption": "Daily life and culture in Al Murar al Qadīm."
      }
    ],
    "tags": [
      "arts",
      "retirement",
      "digital nomad",
      "lake"
    ]
  },
  {
    "slug": "ar-riqqah-ae",
    "city": "Ar Riqqah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.8,
    "description": "A destination known for lake, history, golf and tropical warmth.",
    "overview": "Experience Ar Riqqah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Riqqah%20skyline",
        "alt": "Ar Riqqah skyline",
        "caption": "Ar Riqqah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Riqqah%20street",
        "alt": "Ar Riqqah street scene",
        "caption": "An atmospheric look at Ar Riqqah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Riqqah%20lifestyle",
        "alt": "Ar Riqqah lifestyle",
        "caption": "Daily life and culture in Ar Riqqah."
      }
    ],
    "tags": [
      "lake",
      "history",
      "golf",
      "luxury"
    ]
  },
  {
    "slug": "al-warqaa-ae",
    "city": "Al Warqaa",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.5,
    "description": "A destination known for island, startup, expat-friendly and tropical warmth.",
    "overview": "Experience Al Warqaa's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Warqaa%20skyline",
        "alt": "Al Warqaa skyline",
        "caption": "Al Warqaa cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Warqaa%20street",
        "alt": "Al Warqaa street scene",
        "caption": "An atmospheric look at Al Warqaa's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Warqaa%20lifestyle",
        "alt": "Al Warqaa lifestyle",
        "caption": "Daily life and culture in Al Warqaa."
      }
    ],
    "tags": [
      "island",
      "startup",
      "expat-friendly",
      "mountains"
    ]
  },
  {
    "slug": "international-city-ae",
    "city": "International City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99.4,
    "description": "A destination known for nature, culture, eco and tropical warmth.",
    "overview": "Experience International City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?International%20City%20skyline",
        "alt": "International City skyline",
        "caption": "International City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?International%20City%20street",
        "alt": "International City street scene",
        "caption": "An atmospheric look at International City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?International%20City%20lifestyle",
        "alt": "International City lifestyle",
        "caption": "Daily life and culture in International City."
      }
    ],
    "tags": [
      "nature",
      "culture",
      "eco",
      "slow pace"
    ]
  },
  {
    "slug": "dubai-marina-ae",
    "city": "Dubai Marina",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99.5,
    "description": "A destination known for healthcare, outdoor recreation, retirement and tropical warmth.",
    "overview": "Experience Dubai Marina's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Marina%20skyline",
        "alt": "Dubai Marina skyline",
        "caption": "Dubai Marina cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Marina%20street",
        "alt": "Dubai Marina street scene",
        "caption": "An atmospheric look at Dubai Marina's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Marina%20lifestyle",
        "alt": "Dubai Marina lifestyle",
        "caption": "Daily life and culture in Dubai Marina."
      }
    ],
    "tags": [
      "healthcare",
      "outdoor recreation",
      "retirement",
      "eco"
    ]
  },
  {
    "slug": "dubai-sports-city-ae",
    "city": "Dubai Sports City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.4,
    "description": "A destination known for coast, safety, culture and tropical warmth.",
    "overview": "Experience Dubai Sports City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Sports%20City%20skyline",
        "alt": "Dubai Sports City skyline",
        "caption": "Dubai Sports City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Sports%20City%20street",
        "alt": "Dubai Sports City street scene",
        "caption": "An atmospheric look at Dubai Sports City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Sports%20City%20lifestyle",
        "alt": "Dubai Sports City lifestyle",
        "caption": "Daily life and culture in Dubai Sports City."
      }
    ],
    "tags": [
      "coast",
      "safety",
      "culture",
      "history"
    ]
  },
  {
    "slug": "dubai-internet-city-ae",
    "city": "Dubai Internet City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.1,
    "description": "A destination known for culture, climate, golf and tropical warmth.",
    "overview": "Experience Dubai Internet City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Internet%20City%20skyline",
        "alt": "Dubai Internet City skyline",
        "caption": "Dubai Internet City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Internet%20City%20street",
        "alt": "Dubai Internet City street scene",
        "caption": "An atmospheric look at Dubai Internet City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Internet%20City%20lifestyle",
        "alt": "Dubai Internet City lifestyle",
        "caption": "Daily life and culture in Dubai Internet City."
      }
    ],
    "tags": [
      "culture",
      "climate",
      "golf",
      "lake"
    ]
  },
  {
    "slug": "al-sufouh-ae",
    "city": "Al Sufouh",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96,
    "description": "A destination known for healthcare, startup, beach and tropical warmth.",
    "overview": "Experience Al Sufouh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sufouh%20skyline",
        "alt": "Al Sufouh skyline",
        "caption": "Al Sufouh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sufouh%20street",
        "alt": "Al Sufouh street scene",
        "caption": "An atmospheric look at Al Sufouh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sufouh%20lifestyle",
        "alt": "Al Sufouh lifestyle",
        "caption": "Daily life and culture in Al Sufouh."
      }
    ],
    "tags": [
      "healthcare",
      "startup",
      "beach",
      "digital nomad"
    ]
  },
  {
    "slug": "al-safa-ae",
    "city": "Al Safa",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.4,
    "description": "A destination known for luxury, slow pace, climate and tropical warmth.",
    "overview": "Experience Al Safa's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Safa%20skyline",
        "alt": "Al Safa skyline",
        "caption": "Al Safa cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Safa%20street",
        "alt": "Al Safa street scene",
        "caption": "An atmospheric look at Al Safa's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Safa%20lifestyle",
        "alt": "Al Safa lifestyle",
        "caption": "Daily life and culture in Al Safa."
      }
    ],
    "tags": [
      "luxury",
      "slow pace",
      "climate",
      "history"
    ]
  },
  {
    "slug": "ar-rumaylah-ae",
    "city": "Ar Rumaylah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.3,
    "description": "A destination known for history, expat-friendly, nature and tropical warmth.",
    "overview": "Experience Ar Rumaylah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rumaylah%20skyline",
        "alt": "Ar Rumaylah skyline",
        "caption": "Ar Rumaylah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rumaylah%20street",
        "alt": "Ar Rumaylah street scene",
        "caption": "An atmospheric look at Ar Rumaylah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ar%20Rumaylah%20lifestyle",
        "alt": "Ar Rumaylah lifestyle",
        "caption": "Daily life and culture in Ar Rumaylah."
      }
    ],
    "tags": [
      "history",
      "expat-friendly",
      "nature",
      "island"
    ]
  },
  {
    "slug": "mushayrif-ae",
    "city": "Mushayrif",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.1,
    "description": "A destination known for startup, golf, eco and tropical warmth.",
    "overview": "Experience Mushayrif's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mushayrif%20skyline",
        "alt": "Mushayrif skyline",
        "caption": "Mushayrif cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mushayrif%20street",
        "alt": "Mushayrif street scene",
        "caption": "An atmospheric look at Mushayrif's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mushayrif%20lifestyle",
        "alt": "Mushayrif lifestyle",
        "caption": "Daily life and culture in Mushayrif."
      }
    ],
    "tags": [
      "startup",
      "golf",
      "eco",
      "slow pace"
    ]
  },
  {
    "slug": "al-jurf-ae",
    "city": "Al Jurf",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92,
    "description": "A destination known for mountains, retirement, startup and tropical warmth.",
    "overview": "Experience Al Jurf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jurf%20skyline",
        "alt": "Al Jurf skyline",
        "caption": "Al Jurf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jurf%20street",
        "alt": "Al Jurf street scene",
        "caption": "An atmospheric look at Al Jurf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Jurf%20lifestyle",
        "alt": "Al Jurf lifestyle",
        "caption": "Daily life and culture in Al Jurf."
      }
    ],
    "tags": [
      "mountains",
      "retirement",
      "startup",
      "wellness"
    ]
  },
  {
    "slug": "al-majaz-ae",
    "city": "Al Majaz",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97,
    "description": "A destination known for coast, mountains, history and tropical warmth.",
    "overview": "Experience Al Majaz's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Majaz%20skyline",
        "alt": "Al Majaz skyline",
        "caption": "Al Majaz cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Majaz%20street",
        "alt": "Al Majaz street scene",
        "caption": "An atmospheric look at Al Majaz's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Majaz%20lifestyle",
        "alt": "Al Majaz lifestyle",
        "caption": "Daily life and culture in Al Majaz."
      }
    ],
    "tags": [
      "coast",
      "mountains",
      "history",
      "culture"
    ]
  },
  {
    "slug": "as-sa-wah-sharq-ae",
    "city": "As Saţwah Sharq",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.6,
    "description": "A destination known for lake, outdoor recreation, startup and tropical warmth.",
    "overview": "Experience As Saţwah Sharq's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20Sharq%20skyline",
        "alt": "As Saţwah Sharq skyline",
        "caption": "As Saţwah Sharq cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20Sharq%20street",
        "alt": "As Saţwah Sharq street scene",
        "caption": "An atmospheric look at As Saţwah Sharq's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?As%20Sa%C5%A3wah%20Sharq%20lifestyle",
        "alt": "As Saţwah Sharq lifestyle",
        "caption": "Daily life and culture in As Saţwah Sharq."
      }
    ],
    "tags": [
      "lake",
      "outdoor recreation",
      "startup",
      "luxury"
    ]
  },
  {
    "slug": "dubai-festival-city-ae",
    "city": "Dubai Festival City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.8,
    "description": "A destination known for wellness, lake, mountains and tropical warmth.",
    "overview": "Experience Dubai Festival City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Festival%20City%20skyline",
        "alt": "Dubai Festival City skyline",
        "caption": "Dubai Festival City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Festival%20City%20street",
        "alt": "Dubai Festival City street scene",
        "caption": "An atmospheric look at Dubai Festival City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Festival%20City%20lifestyle",
        "alt": "Dubai Festival City lifestyle",
        "caption": "Daily life and culture in Dubai Festival City."
      }
    ],
    "tags": [
      "wellness",
      "lake",
      "mountains",
      "nightlife"
    ]
  },
  {
    "slug": "dubai-international-financial-centre-ae",
    "city": "Dubai International Financial Centre",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.3,
    "description": "A destination known for family, food, expat-friendly and tropical warmth.",
    "overview": "Experience Dubai International Financial Centre's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20International%20Financial%20Centre%20skyline",
        "alt": "Dubai International Financial Centre skyline",
        "caption": "Dubai International Financial Centre cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20International%20Financial%20Centre%20street",
        "alt": "Dubai International Financial Centre street scene",
        "caption": "An atmospheric look at Dubai International Financial Centre's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20International%20Financial%20Centre%20lifestyle",
        "alt": "Dubai International Financial Centre lifestyle",
        "caption": "Daily life and culture in Dubai International Financial Centre."
      }
    ],
    "tags": [
      "family",
      "food",
      "expat-friendly",
      "safety"
    ]
  },
  {
    "slug": "downtown-dubai-ae",
    "city": "Downtown Dubai",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99.3,
    "description": "A destination known for outdoor recreation, startup, family and tropical warmth.",
    "overview": "Experience Downtown Dubai's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Downtown%20Dubai%20skyline",
        "alt": "Downtown Dubai skyline",
        "caption": "Downtown Dubai cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Downtown%20Dubai%20street",
        "alt": "Downtown Dubai street scene",
        "caption": "An atmospheric look at Downtown Dubai's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Downtown%20Dubai%20lifestyle",
        "alt": "Downtown Dubai lifestyle",
        "caption": "Daily life and culture in Downtown Dubai."
      }
    ],
    "tags": [
      "outdoor recreation",
      "startup",
      "family",
      "culture"
    ]
  },
  {
    "slug": "dubai-investments-park-ae",
    "city": "Dubai Investments Park",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.9,
    "description": "A destination known for wellness, healthcare, nature and tropical warmth.",
    "overview": "Experience Dubai Investments Park's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Investments%20Park%20skyline",
        "alt": "Dubai Investments Park skyline",
        "caption": "Dubai Investments Park cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Investments%20Park%20street",
        "alt": "Dubai Investments Park street scene",
        "caption": "An atmospheric look at Dubai Investments Park's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Investments%20Park%20lifestyle",
        "alt": "Dubai Investments Park lifestyle",
        "caption": "Daily life and culture in Dubai Investments Park."
      }
    ],
    "tags": [
      "wellness",
      "healthcare",
      "nature",
      "safety"
    ]
  },
  {
    "slug": "jebel-ali-ae",
    "city": "Jebel Ali",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.5,
    "description": "A destination known for startup, golf, slow pace and tropical warmth.",
    "overview": "Experience Jebel Ali's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jebel%20Ali%20skyline",
        "alt": "Jebel Ali skyline",
        "caption": "Jebel Ali cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jebel%20Ali%20street",
        "alt": "Jebel Ali street scene",
        "caption": "An atmospheric look at Jebel Ali's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jebel%20Ali%20lifestyle",
        "alt": "Jebel Ali lifestyle",
        "caption": "Daily life and culture in Jebel Ali."
      }
    ],
    "tags": [
      "startup",
      "golf",
      "slow pace",
      "family"
    ]
  },
  {
    "slug": "bani-yas-city-ae",
    "city": "Bani Yas City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for food, coast, arts and tropical warmth.",
    "overview": "Experience Bani Yas City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bani%20Yas%20City%20skyline",
        "alt": "Bani Yas City skyline",
        "caption": "Bani Yas City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bani%20Yas%20City%20street",
        "alt": "Bani Yas City street scene",
        "caption": "An atmospheric look at Bani Yas City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bani%20Yas%20City%20lifestyle",
        "alt": "Bani Yas City lifestyle",
        "caption": "Daily life and culture in Bani Yas City."
      }
    ],
    "tags": [
      "food",
      "coast",
      "arts",
      "slow pace"
    ]
  },
  {
    "slug": "musaffah-ae",
    "city": "Musaffah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94,
    "description": "A destination known for healthcare, wellness, nightlife and tropical warmth.",
    "overview": "Experience Musaffah's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Musaffah%20skyline",
        "alt": "Musaffah skyline",
        "caption": "Musaffah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Musaffah%20street",
        "alt": "Musaffah street scene",
        "caption": "An atmospheric look at Musaffah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Musaffah%20lifestyle",
        "alt": "Musaffah lifestyle",
        "caption": "Daily life and culture in Musaffah."
      }
    ],
    "tags": [
      "healthcare",
      "wellness",
      "nightlife",
      "slow pace"
    ]
  },
  {
    "slug": "al-shamkhah-city-ae",
    "city": "Al Shamkhah City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.5,
    "description": "A destination known for climate, lake, retirement and tropical warmth.",
    "overview": "Experience Al Shamkhah City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Shamkhah%20City%20skyline",
        "alt": "Al Shamkhah City skyline",
        "caption": "Al Shamkhah City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Shamkhah%20City%20street",
        "alt": "Al Shamkhah City street scene",
        "caption": "An atmospheric look at Al Shamkhah City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Shamkhah%20City%20lifestyle",
        "alt": "Al Shamkhah City lifestyle",
        "caption": "Daily life and culture in Al Shamkhah City."
      }
    ],
    "tags": [
      "climate",
      "lake",
      "retirement",
      "outdoor recreation"
    ]
  },
  {
    "slug": "reef-al-fujairah-city-ae",
    "city": "Reef Al Fujairah City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.1,
    "description": "A destination known for retirement, climate, outdoor recreation and tropical warmth.",
    "overview": "Experience Reef Al Fujairah City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Reef%20Al%20Fujairah%20City%20skyline",
        "alt": "Reef Al Fujairah City skyline",
        "caption": "Reef Al Fujairah City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Reef%20Al%20Fujairah%20City%20street",
        "alt": "Reef Al Fujairah City street scene",
        "caption": "An atmospheric look at Reef Al Fujairah City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Reef%20Al%20Fujairah%20City%20lifestyle",
        "alt": "Reef Al Fujairah City lifestyle",
        "caption": "Daily life and culture in Reef Al Fujairah City."
      }
    ],
    "tags": [
      "retirement",
      "climate",
      "outdoor recreation",
      "arts"
    ]
  },
  {
    "slug": "al-wiqan-ae",
    "city": "Al Wiqan",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.9,
    "description": "A destination known for coast, lake, expat-friendly and tropical warmth.",
    "overview": "Experience Al Wiqan's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wiqan%20skyline",
        "alt": "Al Wiqan skyline",
        "caption": "Al Wiqan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wiqan%20street",
        "alt": "Al Wiqan street scene",
        "caption": "An atmospheric look at Al Wiqan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Wiqan%20lifestyle",
        "alt": "Al Wiqan lifestyle",
        "caption": "Daily life and culture in Al Wiqan."
      }
    ],
    "tags": [
      "coast",
      "lake",
      "expat-friendly",
      "healthcare"
    ]
  },
  {
    "slug": "al-faqaa-ae",
    "city": "Al Faqaa",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97,
    "description": "A destination known for history, beach, nature and tropical warmth.",
    "overview": "Experience Al Faqaa's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Faqaa%20skyline",
        "alt": "Al Faqaa skyline",
        "caption": "Al Faqaa cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Faqaa%20street",
        "alt": "Al Faqaa street scene",
        "caption": "An atmospheric look at Al Faqaa's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Faqaa%20lifestyle",
        "alt": "Al Faqaa lifestyle",
        "caption": "Daily life and culture in Al Faqaa."
      }
    ],
    "tags": [
      "history",
      "beach",
      "nature",
      "walkability"
    ]
  },
  {
    "slug": "sha-biyyat-al-hiyar-ae",
    "city": "Sha'biyyat Al Hiyar",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 92.8,
    "description": "A destination known for lake, food, walkability and tropical warmth.",
    "overview": "Experience Sha'biyyat Al Hiyar's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Al%20Hiyar%20skyline",
        "alt": "Sha'biyyat Al Hiyar skyline",
        "caption": "Sha'biyyat Al Hiyar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Al%20Hiyar%20street",
        "alt": "Sha'biyyat Al Hiyar street scene",
        "caption": "An atmospheric look at Sha'biyyat Al Hiyar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Al%20Hiyar%20lifestyle",
        "alt": "Sha'biyyat Al Hiyar lifestyle",
        "caption": "Daily life and culture in Sha'biyyat Al Hiyar."
      }
    ],
    "tags": [
      "lake",
      "food",
      "walkability",
      "culture"
    ]
  },
  {
    "slug": "sha-biyyat-mil-hah-ae",
    "city": "Sha'biyyat Milе̄hah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.7,
    "description": "A destination known for lake, food, luxury and tropical warmth.",
    "overview": "Experience Sha'biyyat Milе̄hah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Mil%D0%B5%CC%84hah%20skyline",
        "alt": "Sha'biyyat Milе̄hah skyline",
        "caption": "Sha'biyyat Milе̄hah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Mil%D0%B5%CC%84hah%20street",
        "alt": "Sha'biyyat Milе̄hah street scene",
        "caption": "An atmospheric look at Sha'biyyat Milе̄hah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sha'biyyat%20Mil%D0%B5%CC%84hah%20lifestyle",
        "alt": "Sha'biyyat Milе̄hah lifestyle",
        "caption": "Daily life and culture in Sha'biyyat Milе̄hah."
      }
    ],
    "tags": [
      "lake",
      "food",
      "luxury",
      "history"
    ]
  },
  {
    "slug": "umm-al-sheif-ae",
    "city": "Umm Al Sheif",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.4,
    "description": "A destination known for slow pace, arts, safety and tropical warmth.",
    "overview": "Experience Umm Al Sheif's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Sheif%20skyline",
        "alt": "Umm Al Sheif skyline",
        "caption": "Umm Al Sheif cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Sheif%20street",
        "alt": "Umm Al Sheif street scene",
        "caption": "An atmospheric look at Umm Al Sheif's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Umm%20Al%20Sheif%20lifestyle",
        "alt": "Umm Al Sheif lifestyle",
        "caption": "Daily life and culture in Umm Al Sheif."
      }
    ],
    "tags": [
      "slow pace",
      "arts",
      "safety",
      "walkability"
    ]
  },
  {
    "slug": "al-bada-a-ae",
    "city": "Al Bada'a",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.1,
    "description": "A destination known for wellness, safety, lake and tropical warmth.",
    "overview": "Experience Al Bada'a's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Bada'a%20skyline",
        "alt": "Al Bada'a skyline",
        "caption": "Al Bada'a cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Bada'a%20street",
        "alt": "Al Bada'a street scene",
        "caption": "An atmospheric look at Al Bada'a's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Bada'a%20lifestyle",
        "alt": "Al Bada'a lifestyle",
        "caption": "Daily life and culture in Al Bada'a."
      }
    ],
    "tags": [
      "wellness",
      "safety",
      "lake",
      "nightlife"
    ]
  },
  {
    "slug": "al-muteena-ae",
    "city": "Al Muteena",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99,
    "description": "A destination known for budget, food, startup and tropical warmth.",
    "overview": "Experience Al Muteena's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Muteena%20skyline",
        "alt": "Al Muteena skyline",
        "caption": "Al Muteena cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Muteena%20street",
        "alt": "Al Muteena street scene",
        "caption": "An atmospheric look at Al Muteena's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Muteena%20lifestyle",
        "alt": "Al Muteena lifestyle",
        "caption": "Daily life and culture in Al Muteena."
      }
    ],
    "tags": [
      "budget",
      "food",
      "startup",
      "wellness"
    ]
  },
  {
    "slug": "al-mizhar-first-ae",
    "city": "Al Mizhar First",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.4,
    "description": "A destination known for nightlife, eco, lake and tropical warmth.",
    "overview": "Experience Al Mizhar First's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20First%20skyline",
        "alt": "Al Mizhar First skyline",
        "caption": "Al Mizhar First cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20First%20street",
        "alt": "Al Mizhar First street scene",
        "caption": "An atmospheric look at Al Mizhar First's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20First%20lifestyle",
        "alt": "Al Mizhar First lifestyle",
        "caption": "Daily life and culture in Al Mizhar First."
      }
    ],
    "tags": [
      "nightlife",
      "eco",
      "lake",
      "culture"
    ]
  },
  {
    "slug": "al-mizhar-second-ae",
    "city": "Al Mizhar Second",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.3,
    "description": "A destination known for food, golf, outdoor recreation and tropical warmth.",
    "overview": "Experience Al Mizhar Second's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20Second%20skyline",
        "alt": "Al Mizhar Second skyline",
        "caption": "Al Mizhar Second cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20Second%20street",
        "alt": "Al Mizhar Second street scene",
        "caption": "An atmospheric look at Al Mizhar Second's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Mizhar%20Second%20lifestyle",
        "alt": "Al Mizhar Second lifestyle",
        "caption": "Daily life and culture in Al Mizhar Second."
      }
    ],
    "tags": [
      "food",
      "golf",
      "outdoor recreation",
      "luxury"
    ]
  },
  {
    "slug": "dubai-silicon-oasis-ae",
    "city": "Dubai Silicon Oasis",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99,
    "description": "A destination known for startup, beach, luxury and tropical warmth.",
    "overview": "Experience Dubai Silicon Oasis's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Silicon%20Oasis%20skyline",
        "alt": "Dubai Silicon Oasis skyline",
        "caption": "Dubai Silicon Oasis cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Silicon%20Oasis%20street",
        "alt": "Dubai Silicon Oasis street scene",
        "caption": "An atmospheric look at Dubai Silicon Oasis's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Silicon%20Oasis%20lifestyle",
        "alt": "Dubai Silicon Oasis lifestyle",
        "caption": "Daily life and culture in Dubai Silicon Oasis."
      }
    ],
    "tags": [
      "startup",
      "beach",
      "luxury",
      "nightlife"
    ]
  },
  {
    "slug": "dubai-motor-city-ae",
    "city": "Dubai Motor City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.9,
    "description": "A destination known for budget, outdoor recreation, nature and tropical warmth.",
    "overview": "Experience Dubai Motor City's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Motor%20City%20skyline",
        "alt": "Dubai Motor City skyline",
        "caption": "Dubai Motor City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Motor%20City%20street",
        "alt": "Dubai Motor City street scene",
        "caption": "An atmospheric look at Dubai Motor City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dubai%20Motor%20City%20lifestyle",
        "alt": "Dubai Motor City lifestyle",
        "caption": "Daily life and culture in Dubai Motor City."
      }
    ],
    "tags": [
      "budget",
      "outdoor recreation",
      "nature",
      "retirement"
    ]
  },
  {
    "slug": "damac-hills-ae",
    "city": "DAMAC Hills",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.7,
    "description": "A destination known for food, wellness, golf and tropical warmth.",
    "overview": "Experience DAMAC Hills's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?DAMAC%20Hills%20skyline",
        "alt": "DAMAC Hills skyline",
        "caption": "DAMAC Hills cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?DAMAC%20Hills%20street",
        "alt": "DAMAC Hills street scene",
        "caption": "An atmospheric look at DAMAC Hills's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?DAMAC%20Hills%20lifestyle",
        "alt": "DAMAC Hills lifestyle",
        "caption": "Daily life and culture in DAMAC Hills."
      }
    ],
    "tags": [
      "food",
      "wellness",
      "golf",
      "arts"
    ]
  },
  {
    "slug": "al-furjan-ae",
    "city": "Al Furjan",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96,
    "description": "A destination known for mountains, lake, budget and tropical warmth.",
    "overview": "Experience Al Furjan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Furjan%20skyline",
        "alt": "Al Furjan skyline",
        "caption": "Al Furjan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Furjan%20street",
        "alt": "Al Furjan street scene",
        "caption": "An atmospheric look at Al Furjan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Furjan%20lifestyle",
        "alt": "Al Furjan lifestyle",
        "caption": "Daily life and culture in Al Furjan."
      }
    ],
    "tags": [
      "mountains",
      "lake",
      "budget",
      "culture"
    ]
  },
  {
    "slug": "business-bay-ae",
    "city": "Business Bay",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.6,
    "description": "A destination known for outdoor recreation, food, arts and tropical warmth.",
    "overview": "Experience Business Bay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Business%20Bay%20skyline",
        "alt": "Business Bay skyline",
        "caption": "Business Bay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Business%20Bay%20street",
        "alt": "Business Bay street scene",
        "caption": "An atmospheric look at Business Bay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Business%20Bay%20lifestyle",
        "alt": "Business Bay lifestyle",
        "caption": "Daily life and culture in Business Bay."
      }
    ],
    "tags": [
      "outdoor recreation",
      "food",
      "arts",
      "nightlife"
    ]
  },
  {
    "slug": "al-qusais-1-ae",
    "city": "Al Qusais 1",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.1,
    "description": "A destination known for island, nightlife, safety and tropical warmth.",
    "overview": "Experience Al Qusais 1's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%201%20skyline",
        "alt": "Al Qusais 1 skyline",
        "caption": "Al Qusais 1 cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%201%20street",
        "alt": "Al Qusais 1 street scene",
        "caption": "An atmospheric look at Al Qusais 1's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Qusais%201%20lifestyle",
        "alt": "Al Qusais 1 lifestyle",
        "caption": "Daily life and culture in Al Qusais 1."
      }
    ],
    "tags": [
      "island",
      "nightlife",
      "safety",
      "luxury"
    ]
  },
  {
    "slug": "al-twar-3-ae",
    "city": "Al Twar 3",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 98.5,
    "description": "A destination known for startup, retirement, expat-friendly and tropical warmth.",
    "overview": "Experience Al Twar 3's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%203%20skyline",
        "alt": "Al Twar 3 skyline",
        "caption": "Al Twar 3 cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%203%20street",
        "alt": "Al Twar 3 street scene",
        "caption": "An atmospheric look at Al Twar 3's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Twar%203%20lifestyle",
        "alt": "Al Twar 3 lifestyle",
        "caption": "Daily life and culture in Al Twar 3."
      }
    ],
    "tags": [
      "startup",
      "retirement",
      "expat-friendly",
      "eco"
    ]
  },
  {
    "slug": "al-khabaisi-ae",
    "city": "Al Khabaisi",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99.1,
    "description": "A destination known for luxury, digital nomad, eco and tropical warmth.",
    "overview": "Experience Al Khabaisi's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khabaisi%20skyline",
        "alt": "Al Khabaisi skyline",
        "caption": "Al Khabaisi cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khabaisi%20street",
        "alt": "Al Khabaisi street scene",
        "caption": "An atmospheric look at Al Khabaisi's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khabaisi%20lifestyle",
        "alt": "Al Khabaisi lifestyle",
        "caption": "Daily life and culture in Al Khabaisi."
      }
    ],
    "tags": [
      "luxury",
      "digital nomad",
      "eco",
      "startup"
    ]
  },
  {
    "slug": "al-khawaneej-1-ae",
    "city": "Al Khawaneej 1",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 94.6,
    "description": "A destination known for island, luxury, walkability and tropical warmth.",
    "overview": "Experience Al Khawaneej 1's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khawaneej%201%20skyline",
        "alt": "Al Khawaneej 1 skyline",
        "caption": "Al Khawaneej 1 cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khawaneej%201%20street",
        "alt": "Al Khawaneej 1 street scene",
        "caption": "An atmospheric look at Al Khawaneej 1's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Khawaneej%201%20lifestyle",
        "alt": "Al Khawaneej 1 lifestyle",
        "caption": "Daily life and culture in Al Khawaneej 1."
      }
    ],
    "tags": [
      "island",
      "luxury",
      "walkability",
      "family"
    ]
  },
  {
    "slug": "halwan-ae",
    "city": "Halwan",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 97.9,
    "description": "A destination known for retirement, eco, mountains and tropical warmth.",
    "overview": "Experience Halwan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Halwan%20skyline",
        "alt": "Halwan skyline",
        "caption": "Halwan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Halwan%20street",
        "alt": "Halwan street scene",
        "caption": "An atmospheric look at Halwan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Halwan%20lifestyle",
        "alt": "Halwan lifestyle",
        "caption": "Daily life and culture in Halwan."
      }
    ],
    "tags": [
      "retirement",
      "eco",
      "mountains",
      "wellness"
    ]
  },
  {
    "slug": "al-sajaah-ae",
    "city": "Al Sajaah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.6,
    "description": "A destination known for coast, digital nomad, golf and tropical warmth.",
    "overview": "Experience Al Sajaah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sajaah%20skyline",
        "alt": "Al Sajaah skyline",
        "caption": "Al Sajaah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sajaah%20street",
        "alt": "Al Sajaah street scene",
        "caption": "An atmospheric look at Al Sajaah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Sajaah%20lifestyle",
        "alt": "Al Sajaah lifestyle",
        "caption": "Daily life and culture in Al Sajaah."
      }
    ],
    "tags": [
      "coast",
      "digital nomad",
      "golf",
      "retirement"
    ]
  },
  {
    "slug": "lahbab-ae",
    "city": "Lahbab",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 95.6,
    "description": "A destination known for coast, history, beach and tropical warmth.",
    "overview": "Experience Lahbab's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Lahbab%20skyline",
        "alt": "Lahbab skyline",
        "caption": "Lahbab cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lahbab%20street",
        "alt": "Lahbab street scene",
        "caption": "An atmospheric look at Lahbab's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lahbab%20lifestyle",
        "alt": "Lahbab lifestyle",
        "caption": "Daily life and culture in Lahbab."
      }
    ],
    "tags": [
      "coast",
      "history",
      "beach",
      "culture"
    ]
  },
  {
    "slug": "al-madam-ae",
    "city": "Al Madam",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96,
    "description": "A destination known for climate, budget, retirement and tropical warmth.",
    "overview": "Experience Al Madam's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Madam%20skyline",
        "alt": "Al Madam skyline",
        "caption": "Al Madam cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Madam%20street",
        "alt": "Al Madam street scene",
        "caption": "An atmospheric look at Al Madam's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Madam%20lifestyle",
        "alt": "Al Madam lifestyle",
        "caption": "Daily life and culture in Al Madam."
      }
    ],
    "tags": [
      "climate",
      "budget",
      "retirement",
      "history"
    ]
  },
  {
    "slug": "al-raafah-ae",
    "city": "Al Raafah",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 96.8,
    "description": "A destination known for food, island, safety and tropical warmth.",
    "overview": "Experience Al Raafah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Al%20Raafah%20skyline",
        "alt": "Al Raafah skyline",
        "caption": "Al Raafah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Raafah%20street",
        "alt": "Al Raafah street scene",
        "caption": "An atmospheric look at Al Raafah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Al%20Raafah%20lifestyle",
        "alt": "Al Raafah lifestyle",
        "caption": "Daily life and culture in Al Raafah."
      }
    ],
    "tags": [
      "food",
      "island",
      "safety",
      "retirement"
    ]
  },
  {
    "slug": "mohammed-bin-zayed-city-ae",
    "city": "Mohammed Bin Zayed City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 99.3,
    "description": "A destination known for arts, climate, food and tropical warmth.",
    "overview": "Experience Mohammed Bin Zayed City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mohammed%20Bin%20Zayed%20City%20skyline",
        "alt": "Mohammed Bin Zayed City skyline",
        "caption": "Mohammed Bin Zayed City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mohammed%20Bin%20Zayed%20City%20street",
        "alt": "Mohammed Bin Zayed City street scene",
        "caption": "An atmospheric look at Mohammed Bin Zayed City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mohammed%20Bin%20Zayed%20City%20lifestyle",
        "alt": "Mohammed Bin Zayed City lifestyle",
        "caption": "Daily life and culture in Mohammed Bin Zayed City."
      }
    ],
    "tags": [
      "arts",
      "climate",
      "food",
      "eco"
    ]
  },
  {
    "slug": "masdar-city-ae",
    "city": "Masdar City",
    "country": "AE",
    "emoji": "🇦🇪",
    "match": 93.9,
    "description": "A destination known for culture, coast, arts and tropical warmth.",
    "overview": "Experience Masdar City's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy tropical warmth with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Masdar%20City%20skyline",
        "alt": "Masdar City skyline",
        "caption": "Masdar City cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Masdar%20City%20street",
        "alt": "Masdar City street scene",
        "caption": "An atmospheric look at Masdar City's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Masdar%20City%20lifestyle",
        "alt": "Masdar City lifestyle",
        "caption": "Daily life and culture in Masdar City."
      }
    ],
    "tags": [
      "culture",
      "coast",
      "arts",
      "retirement"
    ]
  },
  {
    "slug": "z-r-k-af",
    "city": "Zōr Kōṯ",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.3,
    "description": "A destination known for walkability, nature, history and mild climate.",
    "overview": "Experience Zōr Kōṯ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Z%C5%8Dr%20K%C5%8D%E1%B9%AF%20skyline",
        "alt": "Zōr Kōṯ skyline",
        "caption": "Zōr Kōṯ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C5%8Dr%20K%C5%8D%E1%B9%AF%20street",
        "alt": "Zōr Kōṯ street scene",
        "caption": "An atmospheric look at Zōr Kōṯ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C5%8Dr%20K%C5%8D%E1%B9%AF%20lifestyle",
        "alt": "Zōr Kōṯ lifestyle",
        "caption": "Daily life and culture in Zōr Kōṯ."
      }
    ],
    "tags": [
      "walkability",
      "nature",
      "history",
      "arts"
    ]
  },
  {
    "slug": "wul-sw-l-bihs-d-af",
    "city": "Wulêswālī Bihsūd",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for beach, history, walkability and mild climate.",
    "overview": "Experience Wulêswālī Bihsūd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Bihs%C5%ABd%20skyline",
        "alt": "Wulêswālī Bihsūd skyline",
        "caption": "Wulêswālī Bihsūd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Bihs%C5%ABd%20street",
        "alt": "Wulêswālī Bihsūd street scene",
        "caption": "An atmospheric look at Wulêswālī Bihsūd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Bihs%C5%ABd%20lifestyle",
        "alt": "Wulêswālī Bihsūd lifestyle",
        "caption": "Daily life and culture in Wulêswālī Bihsūd."
      }
    ],
    "tags": [
      "beach",
      "history",
      "walkability",
      "food"
    ]
  },
  {
    "slug": "kuhs-n-af",
    "city": "Kuhsān",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for walkability, slow pace, healthcare and mild climate.",
    "overview": "Experience Kuhsān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kuhs%C4%81n%20skyline",
        "alt": "Kuhsān skyline",
        "caption": "Kuhsān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kuhs%C4%81n%20street",
        "alt": "Kuhsān street scene",
        "caption": "An atmospheric look at Kuhsān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kuhs%C4%81n%20lifestyle",
        "alt": "Kuhsān lifestyle",
        "caption": "Daily life and culture in Kuhsān."
      }
    ],
    "tags": [
      "walkability",
      "slow pace",
      "healthcare",
      "eco"
    ]
  },
  {
    "slug": "l-sh-af",
    "city": "Lāsh",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for wellness, slow pace, lake and mild climate.",
    "overview": "Experience Lāsh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh%20skyline",
        "alt": "Lāsh skyline",
        "caption": "Lāsh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh%20street",
        "alt": "Lāsh street scene",
        "caption": "An atmospheric look at Lāsh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh%20lifestyle",
        "alt": "Lāsh lifestyle",
        "caption": "Daily life and culture in Lāsh."
      }
    ],
    "tags": [
      "wellness",
      "slow pace",
      "lake",
      "nightlife"
    ]
  },
  {
    "slug": "tukz-r-af",
    "city": "Tukzār",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for lake, nightlife, retirement and mild climate.",
    "overview": "Experience Tukzār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tukz%C4%81r%20skyline",
        "alt": "Tukzār skyline",
        "caption": "Tukzār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tukz%C4%81r%20street",
        "alt": "Tukzār street scene",
        "caption": "An atmospheric look at Tukzār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tukz%C4%81r%20lifestyle",
        "alt": "Tukzār lifestyle",
        "caption": "Daily life and culture in Tukzār."
      }
    ],
    "tags": [
      "lake",
      "nightlife",
      "retirement",
      "food"
    ]
  },
  {
    "slug": "bati-af",
    "city": "Bati",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for beach, family, climate and mild climate.",
    "overview": "Experience Bati's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bati%20skyline",
        "alt": "Bati skyline",
        "caption": "Bati cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bati%20street",
        "alt": "Bati street scene",
        "caption": "An atmospheric look at Bati's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bati%20lifestyle",
        "alt": "Bati lifestyle",
        "caption": "Daily life and culture in Bati."
      }
    ],
    "tags": [
      "beach",
      "family",
      "climate",
      "expat-friendly"
    ]
  },
  {
    "slug": "m-ray-af",
    "city": "Mīray",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for wellness, luxury, lake and mild climate.",
    "overview": "Experience Mīray's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABray%20skyline",
        "alt": "Mīray skyline",
        "caption": "Mīray cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABray%20street",
        "alt": "Mīray street scene",
        "caption": "An atmospheric look at Mīray's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABray%20lifestyle",
        "alt": "Mīray lifestyle",
        "caption": "Daily life and culture in Mīray."
      }
    ],
    "tags": [
      "wellness",
      "luxury",
      "lake",
      "mountains"
    ]
  },
  {
    "slug": "q-kupruk-af",
    "city": "Āq Kupruk",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for eco, climate, wellness and mild climate.",
    "overview": "Experience Āq Kupruk's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C4%80q%20Kupruk%20skyline",
        "alt": "Āq Kupruk skyline",
        "caption": "Āq Kupruk cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80q%20Kupruk%20street",
        "alt": "Āq Kupruk street scene",
        "caption": "An atmospheric look at Āq Kupruk's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80q%20Kupruk%20lifestyle",
        "alt": "Āq Kupruk lifestyle",
        "caption": "Daily life and culture in Āq Kupruk."
      }
    ],
    "tags": [
      "eco",
      "climate",
      "wellness",
      "slow pace"
    ]
  },
  {
    "slug": "zurmat-af",
    "city": "Zurmat",
    "country": "AF",
    "emoji": "🌍",
    "match": 92,
    "description": "A destination known for safety, history, nature and mild climate.",
    "overview": "Experience Zurmat's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zurmat%20skyline",
        "alt": "Zurmat skyline",
        "caption": "Zurmat cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zurmat%20street",
        "alt": "Zurmat street scene",
        "caption": "An atmospheric look at Zurmat's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zurmat%20lifestyle",
        "alt": "Zurmat lifestyle",
        "caption": "Daily life and culture in Zurmat."
      }
    ],
    "tags": [
      "safety",
      "history",
      "nature",
      "island"
    ]
  },
  {
    "slug": "zayb-k-af",
    "city": "Zaybāk",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for retirement, eco, arts and mild climate.",
    "overview": "Experience Zaybāk's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zayb%C4%81k%20skyline",
        "alt": "Zaybāk skyline",
        "caption": "Zaybāk cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zayb%C4%81k%20street",
        "alt": "Zaybāk street scene",
        "caption": "An atmospheric look at Zaybāk's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zayb%C4%81k%20lifestyle",
        "alt": "Zaybāk lifestyle",
        "caption": "Daily life and culture in Zaybāk."
      }
    ],
    "tags": [
      "retirement",
      "eco",
      "arts",
      "outdoor recreation"
    ]
  },
  {
    "slug": "z-rat-e-sh-h-maq-d-af",
    "city": "Zīārat-e Shāh Maqşūd",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.3,
    "description": "A destination known for nightlife, food, expat-friendly and mild climate.",
    "overview": "Experience Zīārat-e Shāh Maqşūd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%C4%81rat-e%20Sh%C4%81h%20Maq%C5%9F%C5%ABd%20skyline",
        "alt": "Zīārat-e Shāh Maqşūd skyline",
        "caption": "Zīārat-e Shāh Maqşūd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%C4%81rat-e%20Sh%C4%81h%20Maq%C5%9F%C5%ABd%20street",
        "alt": "Zīārat-e Shāh Maqşūd street scene",
        "caption": "An atmospheric look at Zīārat-e Shāh Maqşūd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%C4%81rat-e%20Sh%C4%81h%20Maq%C5%9F%C5%ABd%20lifestyle",
        "alt": "Zīārat-e Shāh Maqşūd lifestyle",
        "caption": "Daily life and culture in Zīārat-e Shāh Maqşūd."
      }
    ],
    "tags": [
      "nightlife",
      "food",
      "expat-friendly",
      "startup"
    ]
  },
  {
    "slug": "zindah-j-n-af",
    "city": "Zindah Jān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.7,
    "description": "A destination known for safety, budget, retirement and mild climate.",
    "overview": "Experience Zindah Jān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zindah%20J%C4%81n%20skyline",
        "alt": "Zindah Jān skyline",
        "caption": "Zindah Jān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zindah%20J%C4%81n%20street",
        "alt": "Zindah Jān street scene",
        "caption": "An atmospheric look at Zindah Jān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zindah%20J%C4%81n%20lifestyle",
        "alt": "Zindah Jān lifestyle",
        "caption": "Daily life and culture in Zindah Jān."
      }
    ],
    "tags": [
      "safety",
      "budget",
      "retirement",
      "climate"
    ]
  },
  {
    "slug": "zargh-n-shahr-af",
    "city": "Zarghūn Shahr",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.3,
    "description": "A destination known for expat-friendly, luxury, climate and mild climate.",
    "overview": "Experience Zarghūn Shahr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zargh%C5%ABn%20Shahr%20skyline",
        "alt": "Zarghūn Shahr skyline",
        "caption": "Zarghūn Shahr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zargh%C5%ABn%20Shahr%20street",
        "alt": "Zarghūn Shahr street scene",
        "caption": "An atmospheric look at Zarghūn Shahr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zargh%C5%ABn%20Shahr%20lifestyle",
        "alt": "Zarghūn Shahr lifestyle",
        "caption": "Daily life and culture in Zarghūn Shahr."
      }
    ],
    "tags": [
      "expat-friendly",
      "luxury",
      "climate",
      "coast"
    ]
  },
  {
    "slug": "za-ah-sharan-af",
    "city": "Zaṟah Sharan",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for culture, family, lake and mild climate.",
    "overview": "Experience Zaṟah Sharan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Za%E1%B9%9Fah%20Sharan%20skyline",
        "alt": "Zaṟah Sharan skyline",
        "caption": "Zaṟah Sharan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Za%E1%B9%9Fah%20Sharan%20street",
        "alt": "Zaṟah Sharan street scene",
        "caption": "An atmospheric look at Zaṟah Sharan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Za%E1%B9%9Fah%20Sharan%20lifestyle",
        "alt": "Zaṟah Sharan lifestyle",
        "caption": "Daily life and culture in Zaṟah Sharan."
      }
    ],
    "tags": [
      "culture",
      "family",
      "lake",
      "arts"
    ]
  },
  {
    "slug": "zaranj-af",
    "city": "Zaranj",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.7,
    "description": "A destination known for beach, history, eco and mild climate.",
    "overview": "Experience Zaranj's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zaranj%20skyline",
        "alt": "Zaranj skyline",
        "caption": "Zaranj cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zaranj%20street",
        "alt": "Zaranj street scene",
        "caption": "An atmospheric look at Zaranj's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zaranj%20lifestyle",
        "alt": "Zaranj lifestyle",
        "caption": "Daily life and culture in Zaranj."
      }
    ],
    "tags": [
      "beach",
      "history",
      "eco",
      "coast"
    ]
  },
  {
    "slug": "zamt-k-lay-af",
    "city": "Zamtō Kêlay",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for startup, safety, luxury and mild climate.",
    "overview": "Experience Zamtō Kêlay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zamt%C5%8D%20K%C3%AAlay%20skyline",
        "alt": "Zamtō Kêlay skyline",
        "caption": "Zamtō Kêlay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zamt%C5%8D%20K%C3%AAlay%20street",
        "alt": "Zamtō Kêlay street scene",
        "caption": "An atmospheric look at Zamtō Kêlay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zamt%C5%8D%20K%C3%AAlay%20lifestyle",
        "alt": "Zamtō Kêlay lifestyle",
        "caption": "Daily life and culture in Zamtō Kêlay."
      }
    ],
    "tags": [
      "startup",
      "safety",
      "luxury",
      "mountains"
    ]
  },
  {
    "slug": "yang-qal-ah-af",
    "city": "Yangī Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 95,
    "description": "A destination known for history, golf, outdoor recreation and mild climate.",
    "overview": "Experience Yangī Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Yang%C4%AB%20Qal%E2%80%98ah%20skyline",
        "alt": "Yangī Qal‘ah skyline",
        "caption": "Yangī Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Yang%C4%AB%20Qal%E2%80%98ah%20street",
        "alt": "Yangī Qal‘ah street scene",
        "caption": "An atmospheric look at Yangī Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Yang%C4%AB%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Yangī Qal‘ah lifestyle",
        "caption": "Daily life and culture in Yangī Qal‘ah."
      }
    ],
    "tags": [
      "history",
      "golf",
      "outdoor recreation",
      "expat-friendly"
    ]
  },
  {
    "slug": "b-z-r-e-yak-wlang-af",
    "city": "Bāzār-e Yakāwlang",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.6,
    "description": "A destination known for arts, retirement, mountains and mild climate.",
    "overview": "Experience Bāzār-e Yakāwlang's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Yak%C4%81wlang%20skyline",
        "alt": "Bāzār-e Yakāwlang skyline",
        "caption": "Bāzār-e Yakāwlang cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Yak%C4%81wlang%20street",
        "alt": "Bāzār-e Yakāwlang street scene",
        "caption": "An atmospheric look at Bāzār-e Yakāwlang's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Yak%C4%81wlang%20lifestyle",
        "alt": "Bāzār-e Yakāwlang lifestyle",
        "caption": "Daily life and culture in Bāzār-e Yakāwlang."
      }
    ],
    "tags": [
      "arts",
      "retirement",
      "mountains",
      "beach"
    ]
  },
  {
    "slug": "ya-y-kh-l-af",
    "city": "Yaḩyá Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.5,
    "description": "A destination known for beach, golf, retirement and mild climate.",
    "overview": "Experience Yaḩyá Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ya%E1%B8%A9y%C3%A1%20Kh%C4%93l%20skyline",
        "alt": "Yaḩyá Khēl skyline",
        "caption": "Yaḩyá Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ya%E1%B8%A9y%C3%A1%20Kh%C4%93l%20street",
        "alt": "Yaḩyá Khēl street scene",
        "caption": "An atmospheric look at Yaḩyá Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ya%E1%B8%A9y%C3%A1%20Kh%C4%93l%20lifestyle",
        "alt": "Yaḩyá Khēl lifestyle",
        "caption": "Daily life and culture in Yaḩyá Khēl."
      }
    ],
    "tags": [
      "beach",
      "golf",
      "retirement",
      "expat-friendly"
    ]
  },
  {
    "slug": "w-sh-r-af",
    "city": "Wāshēr",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.7,
    "description": "A destination known for climate, food, mountains and mild climate.",
    "overview": "Experience Wāshēr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?W%C4%81sh%C4%93r%20skyline",
        "alt": "Wāshēr skyline",
        "caption": "Wāshēr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?W%C4%81sh%C4%93r%20street",
        "alt": "Wāshēr street scene",
        "caption": "An atmospheric look at Wāshēr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?W%C4%81sh%C4%93r%20lifestyle",
        "alt": "Wāshēr lifestyle",
        "caption": "Daily life and culture in Wāshēr."
      }
    ],
    "tags": [
      "climate",
      "food",
      "mountains",
      "nature"
    ]
  },
  {
    "slug": "t-rmay-af",
    "city": "Tōrmay",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.6,
    "description": "A destination known for island, arts, mountains and mild climate.",
    "overview": "Experience Tōrmay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?T%C5%8Drmay%20skyline",
        "alt": "Tōrmay skyline",
        "caption": "Tōrmay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C5%8Drmay%20street",
        "alt": "Tōrmay street scene",
        "caption": "An atmospheric look at Tōrmay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C5%8Drmay%20lifestyle",
        "alt": "Tōrmay lifestyle",
        "caption": "Daily life and culture in Tōrmay."
      }
    ],
    "tags": [
      "island",
      "arts",
      "mountains",
      "walkability"
    ]
  },
  {
    "slug": "t-lak-af",
    "city": "Tūlak",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.9,
    "description": "A destination known for family, coast, digital nomad and mild climate.",
    "overview": "Experience Tūlak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?T%C5%ABlak%20skyline",
        "alt": "Tūlak skyline",
        "caption": "Tūlak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C5%ABlak%20street",
        "alt": "Tūlak street scene",
        "caption": "An atmospheric look at Tūlak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C5%ABlak%20lifestyle",
        "alt": "Tūlak lifestyle",
        "caption": "Daily life and culture in Tūlak."
      }
    ],
    "tags": [
      "family",
      "coast",
      "digital nomad",
      "healthcare"
    ]
  },
  {
    "slug": "t-t-n-af",
    "city": "Tītān",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for culture, walkability, family and mild climate.",
    "overview": "Experience Tītān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABt%C4%81n%20skyline",
        "alt": "Tītān skyline",
        "caption": "Tītān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABt%C4%81n%20street",
        "alt": "Tītān street scene",
        "caption": "An atmospheric look at Tītān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABt%C4%81n%20lifestyle",
        "alt": "Tītān lifestyle",
        "caption": "Daily life and culture in Tītān."
      }
    ],
    "tags": [
      "culture",
      "walkability",
      "family",
      "startup"
    ]
  },
  {
    "slug": "t-r-pul-af",
    "city": "Tīr Pul",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.4,
    "description": "A destination known for safety, walkability, arts and mild climate.",
    "overview": "Experience Tīr Pul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABr%20Pul%20skyline",
        "alt": "Tīr Pul skyline",
        "caption": "Tīr Pul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABr%20Pul%20street",
        "alt": "Tīr Pul street scene",
        "caption": "An atmospheric look at Tīr Pul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?T%C4%ABr%20Pul%20lifestyle",
        "alt": "Tīr Pul lifestyle",
        "caption": "Daily life and culture in Tīr Pul."
      }
    ],
    "tags": [
      "safety",
      "walkability",
      "arts",
      "healthcare"
    ]
  },
  {
    "slug": "taywarah-af",
    "city": "Taywarah",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for arts, nature, history and mild climate.",
    "overview": "Experience Taywarah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Taywarah%20skyline",
        "alt": "Taywarah skyline",
        "caption": "Taywarah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Taywarah%20street",
        "alt": "Taywarah street scene",
        "caption": "An atmospheric look at Taywarah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Taywarah%20lifestyle",
        "alt": "Taywarah lifestyle",
        "caption": "Daily life and culture in Taywarah."
      }
    ],
    "tags": [
      "arts",
      "nature",
      "history",
      "nightlife"
    ]
  },
  {
    "slug": "b-z-r-e-tashk-n-af",
    "city": "Bāzār-e Tashkān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.3,
    "description": "A destination known for digital nomad, arts, budget and mild climate.",
    "overview": "Experience Bāzār-e Tashkān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Tashk%C4%81n%20skyline",
        "alt": "Bāzār-e Tashkān skyline",
        "caption": "Bāzār-e Tashkān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Tashk%C4%81n%20street",
        "alt": "Bāzār-e Tashkān street scene",
        "caption": "An atmospheric look at Bāzār-e Tashkān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20Tashk%C4%81n%20lifestyle",
        "alt": "Bāzār-e Tashkān lifestyle",
        "caption": "Daily life and culture in Bāzār-e Tashkān."
      }
    ],
    "tags": [
      "digital nomad",
      "arts",
      "budget",
      "safety"
    ]
  },
  {
    "slug": "tarinkot-af",
    "city": "Tarinkot",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for beach, retirement, eco and mild climate.",
    "overview": "Experience Tarinkot's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tarinkot%20skyline",
        "alt": "Tarinkot skyline",
        "caption": "Tarinkot cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tarinkot%20street",
        "alt": "Tarinkot street scene",
        "caption": "An atmospheric look at Tarinkot's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tarinkot%20lifestyle",
        "alt": "Tarinkot lifestyle",
        "caption": "Daily life and culture in Tarinkot."
      }
    ],
    "tags": [
      "beach",
      "retirement",
      "eco",
      "culture"
    ]
  },
  {
    "slug": "taloqan-af",
    "city": "Taloqan",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for history, expat-friendly, family and mild climate.",
    "overview": "Experience Taloqan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Taloqan%20skyline",
        "alt": "Taloqan skyline",
        "caption": "Taloqan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Taloqan%20street",
        "alt": "Taloqan street scene",
        "caption": "An atmospheric look at Taloqan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Taloqan%20lifestyle",
        "alt": "Taloqan lifestyle",
        "caption": "Daily life and culture in Taloqan."
      }
    ],
    "tags": [
      "history",
      "expat-friendly",
      "family",
      "healthcare"
    ]
  },
  {
    "slug": "tag-w-b-y-af",
    "city": "Tagāw-Bāy",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for safety, golf, island and mild climate.",
    "overview": "Experience Tagāw-Bāy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81w-B%C4%81y%20skyline",
        "alt": "Tagāw-Bāy skyline",
        "caption": "Tagāw-Bāy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81w-B%C4%81y%20street",
        "alt": "Tagāw-Bāy street scene",
        "caption": "An atmospheric look at Tagāw-Bāy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81w-B%C4%81y%20lifestyle",
        "alt": "Tagāw-Bāy lifestyle",
        "caption": "Daily life and culture in Tagāw-Bāy."
      }
    ],
    "tags": [
      "safety",
      "golf",
      "island",
      "expat-friendly"
    ]
  },
  {
    "slug": "tag-b-af",
    "city": "Tagāb",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for startup, outdoor recreation, expat-friendly and mild climate.",
    "overview": "Experience Tagāb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81b%20skyline",
        "alt": "Tagāb skyline",
        "caption": "Tagāb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81b%20street",
        "alt": "Tagāb street scene",
        "caption": "An atmospheric look at Tagāb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tag%C4%81b%20lifestyle",
        "alt": "Tagāb lifestyle",
        "caption": "Daily life and culture in Tagāb."
      }
    ],
    "tags": [
      "startup",
      "outdoor recreation",
      "expat-friendly",
      "nature"
    ]
  },
  {
    "slug": "markaz-e-uk-mat-e-sul-n-e-bakw-h-af",
    "city": "Markaz-e Ḩukūmat-e Sulţān-e Bakwāh",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.5,
    "description": "A destination known for arts, nightlife, digital nomad and mild climate.",
    "overview": "Experience Markaz-e Ḩukūmat-e Sulţān-e Bakwāh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Sul%C5%A3%C4%81n-e%20Bakw%C4%81h%20skyline",
        "alt": "Markaz-e Ḩukūmat-e Sulţān-e Bakwāh skyline",
        "caption": "Markaz-e Ḩukūmat-e Sulţān-e Bakwāh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Sul%C5%A3%C4%81n-e%20Bakw%C4%81h%20street",
        "alt": "Markaz-e Ḩukūmat-e Sulţān-e Bakwāh street scene",
        "caption": "An atmospheric look at Markaz-e Ḩukūmat-e Sulţān-e Bakwāh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Sul%C5%A3%C4%81n-e%20Bakw%C4%81h%20lifestyle",
        "alt": "Markaz-e Ḩukūmat-e Sulţān-e Bakwāh lifestyle",
        "caption": "Daily life and culture in Markaz-e Ḩukūmat-e Sulţān-e Bakwāh."
      }
    ],
    "tags": [
      "arts",
      "nightlife",
      "digital nomad",
      "island"
    ]
  },
  {
    "slug": "sp-n-b-ldak-af",
    "city": "Spīn Bōldak",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.3,
    "description": "A destination known for climate, island, eco and mild climate.",
    "overview": "Experience Spīn Bōldak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%ABn%20B%C5%8Dldak%20skyline",
        "alt": "Spīn Bōldak skyline",
        "caption": "Spīn Bōldak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%ABn%20B%C5%8Dldak%20street",
        "alt": "Spīn Bōldak street scene",
        "caption": "An atmospheric look at Spīn Bōldak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%ABn%20B%C5%8Dldak%20lifestyle",
        "alt": "Spīn Bōldak lifestyle",
        "caption": "Daily life and culture in Spīn Bōldak."
      }
    ],
    "tags": [
      "climate",
      "island",
      "eco",
      "nightlife"
    ]
  },
  {
    "slug": "sp-rah-af",
    "city": "Spērah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for safety, history, coast and mild climate.",
    "overview": "Experience Spērah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%93rah%20skyline",
        "alt": "Spērah skyline",
        "caption": "Spērah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%93rah%20street",
        "alt": "Spērah street scene",
        "caption": "An atmospheric look at Spērah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sp%C4%93rah%20lifestyle",
        "alt": "Spērah lifestyle",
        "caption": "Daily life and culture in Spērah."
      }
    ],
    "tags": [
      "safety",
      "history",
      "coast",
      "beach"
    ]
  },
  {
    "slug": "s-zmah-qal-ah-af",
    "city": "Sōzmah Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.8,
    "description": "A destination known for beach, island, outdoor recreation and mild climate.",
    "overview": "Experience Sōzmah Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?S%C5%8Dzmah%20Qal%E2%80%98ah%20skyline",
        "alt": "Sōzmah Qal‘ah skyline",
        "caption": "Sōzmah Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%C5%8Dzmah%20Qal%E2%80%98ah%20street",
        "alt": "Sōzmah Qal‘ah street scene",
        "caption": "An atmospheric look at Sōzmah Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%C5%8Dzmah%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Sōzmah Qal‘ah lifestyle",
        "caption": "Daily life and culture in Sōzmah Qal‘ah."
      }
    ],
    "tags": [
      "beach",
      "island",
      "outdoor recreation",
      "nature"
    ]
  },
  {
    "slug": "siy-hgird-af",
    "city": "Siyāhgird",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for outdoor recreation, lake, walkability and mild climate.",
    "overview": "Experience Siyāhgird's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Siy%C4%81hgird%20skyline",
        "alt": "Siyāhgird skyline",
        "caption": "Siyāhgird cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Siy%C4%81hgird%20street",
        "alt": "Siyāhgird street scene",
        "caption": "An atmospheric look at Siyāhgird's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Siy%C4%81hgird%20lifestyle",
        "alt": "Siyāhgird lifestyle",
        "caption": "Daily life and culture in Siyāhgird."
      }
    ],
    "tags": [
      "outdoor recreation",
      "lake",
      "walkability",
      "arts"
    ]
  },
  {
    "slug": "s-h-wah-af",
    "city": "S̲h̲ēwah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.5,
    "description": "A destination known for family, eco, history and mild climate.",
    "overview": "Experience S̲h̲ēwah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?S%CC%B2h%CC%B2%C4%93wah%20skyline",
        "alt": "S̲h̲ēwah skyline",
        "caption": "S̲h̲ēwah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%CC%B2h%CC%B2%C4%93wah%20street",
        "alt": "S̲h̲ēwah street scene",
        "caption": "An atmospheric look at S̲h̲ēwah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%CC%B2h%CC%B2%C4%93wah%20lifestyle",
        "alt": "S̲h̲ēwah lifestyle",
        "caption": "Daily life and culture in S̲h̲ēwah."
      }
    ],
    "tags": [
      "family",
      "eco",
      "history",
      "slow pace"
    ]
  },
  {
    "slug": "sh-n-an-af",
    "city": "Shīnḏanḏ",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.7,
    "description": "A destination known for history, nightlife, family and mild climate.",
    "overview": "Experience Shīnḏanḏ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%ABn%E1%B8%8Fan%E1%B8%8F%20skyline",
        "alt": "Shīnḏanḏ skyline",
        "caption": "Shīnḏanḏ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%ABn%E1%B8%8Fan%E1%B8%8F%20street",
        "alt": "Shīnḏanḏ street scene",
        "caption": "An atmospheric look at Shīnḏanḏ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%ABn%E1%B8%8Fan%E1%B8%8F%20lifestyle",
        "alt": "Shīnḏanḏ lifestyle",
        "caption": "Daily life and culture in Shīnḏanḏ."
      }
    ],
    "tags": [
      "history",
      "nightlife",
      "family",
      "mountains"
    ]
  },
  {
    "slug": "shaykh-am-r-k-lay-af",
    "city": "Shaykh Amīr Kêlay",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for walkability, arts, luxury and mild climate.",
    "overview": "Experience Shaykh Amīr Kêlay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shaykh%20Am%C4%ABr%20K%C3%AAlay%20skyline",
        "alt": "Shaykh Amīr Kêlay skyline",
        "caption": "Shaykh Amīr Kêlay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shaykh%20Am%C4%ABr%20K%C3%AAlay%20street",
        "alt": "Shaykh Amīr Kêlay street scene",
        "caption": "An atmospheric look at Shaykh Amīr Kêlay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shaykh%20Am%C4%ABr%20K%C3%AAlay%20lifestyle",
        "alt": "Shaykh Amīr Kêlay lifestyle",
        "caption": "Daily life and culture in Shaykh Amīr Kêlay."
      }
    ],
    "tags": [
      "walkability",
      "arts",
      "luxury",
      "wellness"
    ]
  },
  {
    "slug": "q-shq-l-af",
    "city": "Qāshqāl",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for island, beach, budget and mild climate.",
    "overview": "Experience Qāshqāl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81shq%C4%81l%20skyline",
        "alt": "Qāshqāl skyline",
        "caption": "Qāshqāl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81shq%C4%81l%20street",
        "alt": "Qāshqāl street scene",
        "caption": "An atmospheric look at Qāshqāl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81shq%C4%81l%20lifestyle",
        "alt": "Qāshqāl lifestyle",
        "caption": "Daily life and culture in Qāshqāl."
      }
    ],
    "tags": [
      "island",
      "beach",
      "budget",
      "luxury"
    ]
  },
  {
    "slug": "shibirgh-n-af",
    "city": "Shibirghān",
    "country": "AF",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for nature, healthcare, arts and mild climate.",
    "overview": "Experience Shibirghān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shibirgh%C4%81n%20skyline",
        "alt": "Shibirghān skyline",
        "caption": "Shibirghān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shibirgh%C4%81n%20street",
        "alt": "Shibirghān street scene",
        "caption": "An atmospheric look at Shibirghān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shibirgh%C4%81n%20lifestyle",
        "alt": "Shibirghān lifestyle",
        "caption": "Daily life and culture in Shibirghān."
      }
    ],
    "tags": [
      "nature",
      "healthcare",
      "arts",
      "digital nomad"
    ]
  },
  {
    "slug": "shw-k-af",
    "city": "Shwāk",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for climate, outdoor recreation, retirement and mild climate.",
    "overview": "Experience Shwāk's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shw%C4%81k%20skyline",
        "alt": "Shwāk skyline",
        "caption": "Shwāk cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shw%C4%81k%20street",
        "alt": "Shwāk street scene",
        "caption": "An atmospheric look at Shwāk's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shw%C4%81k%20lifestyle",
        "alt": "Shwāk lifestyle",
        "caption": "Daily life and culture in Shwāk."
      }
    ],
    "tags": [
      "climate",
      "outdoor recreation",
      "retirement",
      "expat-friendly"
    ]
  },
  {
    "slug": "shahr-e-af-af",
    "city": "Shahr-e Şafā",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for nightlife, food, retirement and mild climate.",
    "overview": "Experience Shahr-e Şafā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shahr-e%20%C5%9Eaf%C4%81%20skyline",
        "alt": "Shahr-e Şafā skyline",
        "caption": "Shahr-e Şafā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahr-e%20%C5%9Eaf%C4%81%20street",
        "alt": "Shahr-e Şafā street scene",
        "caption": "An atmospheric look at Shahr-e Şafā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahr-e%20%C5%9Eaf%C4%81%20lifestyle",
        "alt": "Shahr-e Şafā lifestyle",
        "caption": "Daily life and culture in Shahr-e Şafā."
      }
    ],
    "tags": [
      "nightlife",
      "food",
      "retirement",
      "budget"
    ]
  },
  {
    "slug": "shahr-n-af",
    "city": "Shahrān",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for food, coast, outdoor recreation and mild climate.",
    "overview": "Experience Shahrān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shahr%C4%81n%20skyline",
        "alt": "Shahrān skyline",
        "caption": "Shahrān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahr%C4%81n%20street",
        "alt": "Shahrān street scene",
        "caption": "An atmospheric look at Shahrān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahr%C4%81n%20lifestyle",
        "alt": "Shahrān lifestyle",
        "caption": "Daily life and culture in Shahrān."
      }
    ],
    "tags": [
      "food",
      "coast",
      "outdoor recreation",
      "family"
    ]
  },
  {
    "slug": "shahrak-af",
    "city": "Shahrak",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.2,
    "description": "A destination known for nightlife, expat-friendly, climate and mild climate.",
    "overview": "Experience Shahrak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Shahrak%20skyline",
        "alt": "Shahrak skyline",
        "caption": "Shahrak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahrak%20street",
        "alt": "Shahrak street scene",
        "caption": "An atmospheric look at Shahrak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Shahrak%20lifestyle",
        "alt": "Shahrak lifestyle",
        "caption": "Daily life and culture in Shahrak."
      }
    ],
    "tags": [
      "nightlife",
      "expat-friendly",
      "climate",
      "lake"
    ]
  },
  {
    "slug": "al-qahd-r-sh-h-j-y-af",
    "city": "‘Alāqahdārī Shāh Jōy",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for digital nomad, safety, nightlife and mild climate.",
    "overview": "Experience ‘Alāqahdārī Shāh Jōy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sh%C4%81h%20J%C5%8Dy%20skyline",
        "alt": "‘Alāqahdārī Shāh Jōy skyline",
        "caption": "‘Alāqahdārī Shāh Jōy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sh%C4%81h%20J%C5%8Dy%20street",
        "alt": "‘Alāqahdārī Shāh Jōy street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Shāh Jōy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sh%C4%81h%20J%C5%8Dy%20lifestyle",
        "alt": "‘Alāqahdārī Shāh Jōy lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Shāh Jōy."
      }
    ],
    "tags": [
      "digital nomad",
      "safety",
      "nightlife",
      "nature"
    ]
  },
  {
    "slug": "wul-sw-l-sayyid-karam-af",
    "city": "Wulêswālī Sayyid Karam",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.2,
    "description": "A destination known for startup, lake, expat-friendly and mild climate.",
    "overview": "Experience Wulêswālī Sayyid Karam's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Sayyid%20Karam%20skyline",
        "alt": "Wulêswālī Sayyid Karam skyline",
        "caption": "Wulêswālī Sayyid Karam cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Sayyid%20Karam%20street",
        "alt": "Wulêswālī Sayyid Karam street scene",
        "caption": "An atmospheric look at Wulêswālī Sayyid Karam's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wul%C3%AAsw%C4%81l%C4%AB%20Sayyid%20Karam%20lifestyle",
        "alt": "Wulêswālī Sayyid Karam lifestyle",
        "caption": "Daily life and culture in Wulêswālī Sayyid Karam."
      }
    ],
    "tags": [
      "startup",
      "lake",
      "expat-friendly",
      "history"
    ]
  },
  {
    "slug": "markaz-e-sayyid-b-d-af",
    "city": "Markaz-e Sayyidābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for slow pace, walkability, island and mild climate.",
    "overview": "Experience Markaz-e Sayyidābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Sayyid%C4%81b%C4%81d%20skyline",
        "alt": "Markaz-e Sayyidābād skyline",
        "caption": "Markaz-e Sayyidābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Sayyid%C4%81b%C4%81d%20street",
        "alt": "Markaz-e Sayyidābād street scene",
        "caption": "An atmospheric look at Markaz-e Sayyidābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Sayyid%C4%81b%C4%81d%20lifestyle",
        "alt": "Markaz-e Sayyidābād lifestyle",
        "caption": "Daily life and culture in Markaz-e Sayyidābād."
      }
    ],
    "tags": [
      "slow pace",
      "walkability",
      "island",
      "arts"
    ]
  },
  {
    "slug": "ay-d-af",
    "city": "Şayād",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for history, culture, luxury and mild climate.",
    "overview": "Experience Şayād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%9Eay%C4%81d%20skyline",
        "alt": "Şayād skyline",
        "caption": "Şayād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%9Eay%C4%81d%20street",
        "alt": "Şayād street scene",
        "caption": "An atmospheric look at Şayād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%9Eay%C4%81d%20lifestyle",
        "alt": "Şayād lifestyle",
        "caption": "Daily life and culture in Şayād."
      }
    ],
    "tags": [
      "history",
      "culture",
      "luxury",
      "slow pace"
    ]
  },
  {
    "slug": "sidq-b-d-af",
    "city": "Sidqābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.2,
    "description": "A destination known for mountains, safety, coast and mild climate.",
    "overview": "Experience Sidqābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sidq%C4%81b%C4%81d%20skyline",
        "alt": "Sidqābād skyline",
        "caption": "Sidqābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sidq%C4%81b%C4%81d%20street",
        "alt": "Sidqābād street scene",
        "caption": "An atmospheric look at Sidqābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sidq%C4%81b%C4%81d%20lifestyle",
        "alt": "Sidqābād lifestyle",
        "caption": "Daily life and culture in Sidqābād."
      }
    ],
    "tags": [
      "mountains",
      "safety",
      "coast",
      "nature"
    ]
  },
  {
    "slug": "s-yagaz-af",
    "city": "Sāyagaz",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for expat-friendly, history, nature and mild climate.",
    "overview": "Experience Sāyagaz's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?S%C4%81yagaz%20skyline",
        "alt": "Sāyagaz skyline",
        "caption": "Sāyagaz cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%C4%81yagaz%20street",
        "alt": "Sāyagaz street scene",
        "caption": "An atmospheric look at Sāyagaz's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?S%C4%81yagaz%20lifestyle",
        "alt": "Sāyagaz lifestyle",
        "caption": "Daily life and culture in Sāyagaz."
      }
    ],
    "tags": [
      "expat-friendly",
      "history",
      "nature",
      "nightlife"
    ]
  },
  {
    "slug": "sar-e-taygh-n-af",
    "city": "Sar-e Tayghān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for mountains, walkability, expat-friendly and mild climate.",
    "overview": "Experience Sar-e Tayghān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Taygh%C4%81n%20skyline",
        "alt": "Sar-e Tayghān skyline",
        "caption": "Sar-e Tayghān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Taygh%C4%81n%20street",
        "alt": "Sar-e Tayghān street scene",
        "caption": "An atmospheric look at Sar-e Tayghān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Taygh%C4%81n%20lifestyle",
        "alt": "Sar-e Tayghān lifestyle",
        "caption": "Daily life and culture in Sar-e Tayghān."
      }
    ],
    "tags": [
      "mountains",
      "walkability",
      "expat-friendly",
      "startup"
    ]
  },
  {
    "slug": "sar-b-af",
    "city": "Sarōbī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for startup, walkability, golf and mild climate.",
    "overview": "Experience Sarōbī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sar%C5%8Db%C4%AB%20skyline",
        "alt": "Sarōbī skyline",
        "caption": "Sarōbī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%C5%8Db%C4%AB%20street",
        "alt": "Sarōbī street scene",
        "caption": "An atmospheric look at Sarōbī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%C5%8Db%C4%AB%20lifestyle",
        "alt": "Sarōbī lifestyle",
        "caption": "Daily life and culture in Sarōbī."
      }
    ],
    "tags": [
      "startup",
      "walkability",
      "golf",
      "climate"
    ]
  },
  {
    "slug": "sar-k-af",
    "city": "Sar Kāṉī",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.2,
    "description": "A destination known for beach, walkability, retirement and mild climate.",
    "overview": "Experience Sar Kāṉī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sar%20K%C4%81%E1%B9%89%C4%AB%20skyline",
        "alt": "Sar Kāṉī skyline",
        "caption": "Sar Kāṉī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%20K%C4%81%E1%B9%89%C4%AB%20street",
        "alt": "Sar Kāṉī street scene",
        "caption": "An atmospheric look at Sar Kāṉī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%20K%C4%81%E1%B9%89%C4%AB%20lifestyle",
        "alt": "Sar Kāṉī lifestyle",
        "caption": "Daily life and culture in Sar Kāṉī."
      }
    ],
    "tags": [
      "beach",
      "walkability",
      "retirement",
      "outdoor recreation"
    ]
  },
  {
    "slug": "sarfir-z-kal-af",
    "city": "Sarfirāz Kalā",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.3,
    "description": "A destination known for island, coast, nature and mild climate.",
    "overview": "Experience Sarfirāz Kalā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sarfir%C4%81z%20Kal%C4%81%20skyline",
        "alt": "Sarfirāz Kalā skyline",
        "caption": "Sarfirāz Kalā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sarfir%C4%81z%20Kal%C4%81%20street",
        "alt": "Sarfirāz Kalā street scene",
        "caption": "An atmospheric look at Sarfirāz Kalā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sarfir%C4%81z%20Kal%C4%81%20lifestyle",
        "alt": "Sarfirāz Kalā lifestyle",
        "caption": "Daily life and culture in Sarfirāz Kalā."
      }
    ],
    "tags": [
      "island",
      "coast",
      "nature",
      "budget"
    ]
  },
  {
    "slug": "sar-e-pul-af",
    "city": "Sar-e Pul",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for island, golf, walkability and mild climate.",
    "overview": "Experience Sar-e Pul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Pul%20skyline",
        "alt": "Sar-e Pul skyline",
        "caption": "Sar-e Pul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Pul%20street",
        "alt": "Sar-e Pul street scene",
        "caption": "An atmospheric look at Sar-e Pul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar-e%20Pul%20lifestyle",
        "alt": "Sar-e Pul lifestyle",
        "caption": "Daily life and culture in Sar-e Pul."
      }
    ],
    "tags": [
      "island",
      "golf",
      "walkability",
      "climate"
    ]
  },
  {
    "slug": "sar-chak-n-af",
    "city": "Sar Chakān",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for safety, food, arts and mild climate.",
    "overview": "Experience Sar Chakān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sar%20Chak%C4%81n%20skyline",
        "alt": "Sar Chakān skyline",
        "caption": "Sar Chakān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%20Chak%C4%81n%20street",
        "alt": "Sar Chakān street scene",
        "caption": "An atmospheric look at Sar Chakān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sar%20Chak%C4%81n%20lifestyle",
        "alt": "Sar Chakān lifestyle",
        "caption": "Daily life and culture in Sar Chakān."
      }
    ],
    "tags": [
      "safety",
      "food",
      "arts",
      "expat-friendly"
    ]
  },
  {
    "slug": "sang-n-af",
    "city": "Sangīn",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for nature, climate, coast and mild climate.",
    "overview": "Experience Sangīn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sang%C4%ABn%20skyline",
        "alt": "Sangīn skyline",
        "caption": "Sangīn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang%C4%ABn%20street",
        "alt": "Sangīn street scene",
        "caption": "An atmospheric look at Sangīn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang%C4%ABn%20lifestyle",
        "alt": "Sangīn lifestyle",
        "caption": "Daily life and culture in Sangīn."
      }
    ],
    "tags": [
      "nature",
      "climate",
      "coast",
      "retirement"
    ]
  },
  {
    "slug": "sang-e-m-shah-af",
    "city": "Sang-e Māshah",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for digital nomad, culture, startup and mild climate.",
    "overview": "Experience Sang-e Māshah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20M%C4%81shah%20skyline",
        "alt": "Sang-e Māshah skyline",
        "caption": "Sang-e Māshah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20M%C4%81shah%20street",
        "alt": "Sang-e Māshah street scene",
        "caption": "An atmospheric look at Sang-e Māshah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20M%C4%81shah%20lifestyle",
        "alt": "Sang-e Māshah lifestyle",
        "caption": "Daily life and culture in Sang-e Māshah."
      }
    ],
    "tags": [
      "digital nomad",
      "culture",
      "startup",
      "food"
    ]
  },
  {
    "slug": "sang-e-ch-rak-af",
    "city": "Sang-e Chārak",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.3,
    "description": "A destination known for mountains, digital nomad, history and mild climate.",
    "overview": "Experience Sang-e Chārak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20Ch%C4%81rak%20skyline",
        "alt": "Sang-e Chārak skyline",
        "caption": "Sang-e Chārak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20Ch%C4%81rak%20street",
        "alt": "Sang-e Chārak street scene",
        "caption": "An atmospheric look at Sang-e Chārak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang-e%20Ch%C4%81rak%20lifestyle",
        "alt": "Sang-e Chārak lifestyle",
        "caption": "Daily life and culture in Sang-e Chārak."
      }
    ],
    "tags": [
      "mountains",
      "digital nomad",
      "history",
      "food"
    ]
  },
  {
    "slug": "sang-atesh-af",
    "city": "Sang Atesh",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for outdoor recreation, luxury, lake and mild climate.",
    "overview": "Experience Sang Atesh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sang%20Atesh%20skyline",
        "alt": "Sang Atesh skyline",
        "caption": "Sang Atesh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang%20Atesh%20street",
        "alt": "Sang Atesh street scene",
        "caption": "An atmospheric look at Sang Atesh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sang%20Atesh%20lifestyle",
        "alt": "Sang Atesh lifestyle",
        "caption": "Daily life and culture in Sang Atesh."
      }
    ],
    "tags": [
      "outdoor recreation",
      "luxury",
      "lake",
      "climate"
    ]
  },
  {
    "slug": "sangar-sar-y-af",
    "city": "Sangar Sarāy",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for wellness, slow pace, expat-friendly and mild climate.",
    "overview": "Experience Sangar Sarāy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sangar%20Sar%C4%81y%20skyline",
        "alt": "Sangar Sarāy skyline",
        "caption": "Sangar Sarāy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sangar%20Sar%C4%81y%20street",
        "alt": "Sangar Sarāy street scene",
        "caption": "An atmospheric look at Sangar Sarāy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sangar%20Sar%C4%81y%20lifestyle",
        "alt": "Sangar Sarāy lifestyle",
        "caption": "Daily life and culture in Sangar Sarāy."
      }
    ],
    "tags": [
      "wellness",
      "slow pace",
      "expat-friendly",
      "nature"
    ]
  },
  {
    "slug": "a-bak-af",
    "city": "Aībak",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for history, budget, wellness and mild climate.",
    "overview": "Experience Aībak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?A%C4%ABbak%20skyline",
        "alt": "Aībak skyline",
        "caption": "Aībak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?A%C4%ABbak%20street",
        "alt": "Aībak street scene",
        "caption": "An atmospheric look at Aībak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?A%C4%ABbak%20lifestyle",
        "alt": "Aībak lifestyle",
        "caption": "Daily life and culture in Aībak."
      }
    ],
    "tags": [
      "history",
      "budget",
      "wellness",
      "slow pace"
    ]
  },
  {
    "slug": "r-ye-sang-af",
    "city": "Rū-ye Sang",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for food, healthcare, digital nomad and mild climate.",
    "overview": "Experience Rū-ye Sang's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?R%C5%AB-ye%20Sang%20skyline",
        "alt": "Rū-ye Sang skyline",
        "caption": "Rū-ye Sang cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C5%AB-ye%20Sang%20street",
        "alt": "Rū-ye Sang street scene",
        "caption": "An atmospheric look at Rū-ye Sang's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C5%AB-ye%20Sang%20lifestyle",
        "alt": "Rū-ye Sang lifestyle",
        "caption": "Daily life and culture in Rū-ye Sang."
      }
    ],
    "tags": [
      "food",
      "healthcare",
      "digital nomad",
      "expat-friendly"
    ]
  },
  {
    "slug": "r-db-r-af",
    "city": "Rūdbār",
    "country": "AF",
    "emoji": "🌍",
    "match": 96,
    "description": "A destination known for beach, walkability, healthcare and mild climate.",
    "overview": "Experience Rūdbār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?R%C5%ABdb%C4%81r%20skyline",
        "alt": "Rūdbār skyline",
        "caption": "Rūdbār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C5%ABdb%C4%81r%20street",
        "alt": "Rūdbār street scene",
        "caption": "An atmospheric look at Rūdbār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C5%ABdb%C4%81r%20lifestyle",
        "alt": "Rūdbār lifestyle",
        "caption": "Daily life and culture in Rūdbār."
      }
    ],
    "tags": [
      "beach",
      "walkability",
      "healthcare",
      "food"
    ]
  },
  {
    "slug": "rust-q-af",
    "city": "Rustāq",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for lake, nature, eco and mild climate.",
    "overview": "Experience Rustāq's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Rust%C4%81q%20skyline",
        "alt": "Rustāq skyline",
        "caption": "Rustāq cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Rust%C4%81q%20street",
        "alt": "Rustāq street scene",
        "caption": "An atmospheric look at Rustāq's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Rust%C4%81q%20lifestyle",
        "alt": "Rustāq lifestyle",
        "caption": "Daily life and culture in Rustāq."
      }
    ],
    "tags": [
      "lake",
      "nature",
      "eco",
      "history"
    ]
  },
  {
    "slug": "rab-e-sang-ye-p-n-af",
    "city": "Rabāţ-e Sangī-ye Pā’īn",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for wellness, mountains, walkability and mild climate.",
    "overview": "Experience Rabāţ-e Sangī-ye Pā’īn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Rab%C4%81%C5%A3-e%20Sang%C4%AB-ye%20P%C4%81%E2%80%99%C4%ABn%20skyline",
        "alt": "Rabāţ-e Sangī-ye Pā’īn skyline",
        "caption": "Rabāţ-e Sangī-ye Pā’īn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Rab%C4%81%C5%A3-e%20Sang%C4%AB-ye%20P%C4%81%E2%80%99%C4%ABn%20street",
        "alt": "Rabāţ-e Sangī-ye Pā’īn street scene",
        "caption": "An atmospheric look at Rabāţ-e Sangī-ye Pā’īn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Rab%C4%81%C5%A3-e%20Sang%C4%AB-ye%20P%C4%81%E2%80%99%C4%ABn%20lifestyle",
        "alt": "Rabāţ-e Sangī-ye Pā’īn lifestyle",
        "caption": "Daily life and culture in Rabāţ-e Sangī-ye Pā’īn."
      }
    ],
    "tags": [
      "wellness",
      "mountains",
      "walkability",
      "culture"
    ]
  },
  {
    "slug": "r-mak-af",
    "city": "Rāmak",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for expat-friendly, nightlife, food and mild climate.",
    "overview": "Experience Rāmak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81mak%20skyline",
        "alt": "Rāmak skyline",
        "caption": "Rāmak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81mak%20street",
        "alt": "Rāmak street scene",
        "caption": "An atmospheric look at Rāmak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81mak%20lifestyle",
        "alt": "Rāmak lifestyle",
        "caption": "Daily life and culture in Rāmak."
      }
    ],
    "tags": [
      "expat-friendly",
      "nightlife",
      "food",
      "walkability"
    ]
  },
  {
    "slug": "qurgh-n-af",
    "city": "Qurghān",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for walkability, arts, island and mild climate.",
    "overview": "Experience Qurghān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qurgh%C4%81n%20skyline",
        "alt": "Qurghān skyline",
        "caption": "Qurghān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qurgh%C4%81n%20street",
        "alt": "Qurghān street scene",
        "caption": "An atmospheric look at Qurghān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qurgh%C4%81n%20lifestyle",
        "alt": "Qurghān lifestyle",
        "caption": "Daily life and culture in Qurghān."
      }
    ],
    "tags": [
      "walkability",
      "arts",
      "island",
      "safety"
    ]
  },
  {
    "slug": "quchangh-af",
    "city": "Quchanghī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for outdoor recreation, healthcare, slow pace and mild climate.",
    "overview": "Experience Quchanghī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Quchangh%C4%AB%20skyline",
        "alt": "Quchanghī skyline",
        "caption": "Quchanghī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Quchangh%C4%AB%20street",
        "alt": "Quchanghī street scene",
        "caption": "An atmospheric look at Quchanghī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Quchangh%C4%AB%20lifestyle",
        "alt": "Quchanghī lifestyle",
        "caption": "Daily life and culture in Quchanghī."
      }
    ],
    "tags": [
      "outdoor recreation",
      "healthcare",
      "slow pace",
      "coast"
    ]
  },
  {
    "slug": "qa-r-af",
    "city": "Qaīşār",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.1,
    "description": "A destination known for arts, startup, safety and mild climate.",
    "overview": "Experience Qaīşār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qa%C4%AB%C5%9F%C4%81r%20skyline",
        "alt": "Qaīşār skyline",
        "caption": "Qaīşār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qa%C4%AB%C5%9F%C4%81r%20street",
        "alt": "Qaīşār street scene",
        "caption": "An atmospheric look at Qaīşār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qa%C4%AB%C5%9F%C4%81r%20lifestyle",
        "alt": "Qaīşār lifestyle",
        "caption": "Daily life and culture in Qaīşār."
      }
    ],
    "tags": [
      "arts",
      "startup",
      "safety",
      "retirement"
    ]
  },
  {
    "slug": "qarq-n-af",
    "city": "Qarqīn",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for climate, food, eco and mild climate.",
    "overview": "Experience Qarqīn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarq%C4%ABn%20skyline",
        "alt": "Qarqīn skyline",
        "caption": "Qarqīn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarq%C4%ABn%20street",
        "alt": "Qarqīn street scene",
        "caption": "An atmospheric look at Qarqīn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarq%C4%ABn%20lifestyle",
        "alt": "Qarqīn lifestyle",
        "caption": "Daily life and culture in Qarqīn."
      }
    ],
    "tags": [
      "climate",
      "food",
      "eco",
      "nature"
    ]
  },
  {
    "slug": "qarghah-af",
    "city": "Qarghah’ī",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.9,
    "description": "A destination known for eco, startup, culture and mild climate.",
    "overview": "Experience Qarghah’ī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarghah%E2%80%99%C4%AB%20skyline",
        "alt": "Qarghah’ī skyline",
        "caption": "Qarghah’ī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarghah%E2%80%99%C4%AB%20street",
        "alt": "Qarghah’ī street scene",
        "caption": "An atmospheric look at Qarghah’ī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarghah%E2%80%99%C4%AB%20lifestyle",
        "alt": "Qarghah’ī lifestyle",
        "caption": "Daily life and culture in Qarghah’ī."
      }
    ],
    "tags": [
      "eco",
      "startup",
      "culture",
      "history"
    ]
  },
  {
    "slug": "qarch-gak-af",
    "city": "Qarchī Gak",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.8,
    "description": "A destination known for walkability, family, island and mild climate.",
    "overview": "Experience Qarchī Gak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarch%C4%AB%20Gak%20skyline",
        "alt": "Qarchī Gak skyline",
        "caption": "Qarchī Gak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarch%C4%AB%20Gak%20street",
        "alt": "Qarchī Gak street scene",
        "caption": "An atmospheric look at Qarchī Gak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarch%C4%AB%20Gak%20lifestyle",
        "alt": "Qarchī Gak lifestyle",
        "caption": "Daily life and culture in Qarchī Gak."
      }
    ],
    "tags": [
      "walkability",
      "family",
      "island",
      "wellness"
    ]
  },
  {
    "slug": "qar-wul-af",
    "city": "Qarāwul",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.8,
    "description": "A destination known for food, golf, climate and mild climate.",
    "overview": "Experience Qarāwul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qar%C4%81wul%20skyline",
        "alt": "Qarāwul skyline",
        "caption": "Qarāwul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qar%C4%81wul%20street",
        "alt": "Qarāwul street scene",
        "caption": "An atmospheric look at Qarāwul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qar%C4%81wul%20lifestyle",
        "alt": "Qarāwul lifestyle",
        "caption": "Daily life and culture in Qarāwul."
      }
    ],
    "tags": [
      "food",
      "golf",
      "climate",
      "history"
    ]
  },
  {
    "slug": "qarah-b-gh-af",
    "city": "Qarah Bāgh",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for lake, outdoor recreation, arts and mild climate.",
    "overview": "Experience Qarah Bāgh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20skyline",
        "alt": "Qarah Bāgh skyline",
        "caption": "Qarah Bāgh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20street",
        "alt": "Qarah Bāgh street scene",
        "caption": "An atmospheric look at Qarah Bāgh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20lifestyle",
        "alt": "Qarah Bāgh lifestyle",
        "caption": "Daily life and culture in Qarah Bāgh."
      }
    ],
    "tags": [
      "lake",
      "outdoor recreation",
      "arts",
      "retirement"
    ]
  },
  {
    "slug": "qala-i-naw-af",
    "city": "Qala i Naw",
    "country": "AF",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for digital nomad, slow pace, eco and mild climate.",
    "overview": "Experience Qala i Naw's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qala%20i%20Naw%20skyline",
        "alt": "Qala i Naw skyline",
        "caption": "Qala i Naw cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qala%20i%20Naw%20street",
        "alt": "Qala i Naw street scene",
        "caption": "An atmospheric look at Qala i Naw's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qala%20i%20Naw%20lifestyle",
        "alt": "Qala i Naw lifestyle",
        "caption": "Daily life and culture in Qala i Naw."
      }
    ],
    "tags": [
      "digital nomad",
      "slow pace",
      "eco",
      "healthcare"
    ]
  },
  {
    "slug": "qal-ah-ye-k-f-af",
    "city": "Qal‘ah-ye Kūf",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for healthcare, climate, family and mild climate.",
    "overview": "Experience Qal‘ah-ye Kūf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20K%C5%ABf%20skyline",
        "alt": "Qal‘ah-ye Kūf skyline",
        "caption": "Qal‘ah-ye Kūf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20K%C5%ABf%20street",
        "alt": "Qal‘ah-ye Kūf street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Kūf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20K%C5%ABf%20lifestyle",
        "alt": "Qal‘ah-ye Kūf lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Kūf."
      }
    ],
    "tags": [
      "healthcare",
      "climate",
      "family",
      "retirement"
    ]
  },
  {
    "slug": "qal-ah-ye-kuhnah-af",
    "city": "Qal‘ah-ye Kuhnah",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.2,
    "description": "A destination known for startup, family, budget and mild climate.",
    "overview": "Experience Qal‘ah-ye Kuhnah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Kuhnah%20skyline",
        "alt": "Qal‘ah-ye Kuhnah skyline",
        "caption": "Qal‘ah-ye Kuhnah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Kuhnah%20street",
        "alt": "Qal‘ah-ye Kuhnah street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Kuhnah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Kuhnah%20lifestyle",
        "alt": "Qal‘ah-ye Kuhnah lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Kuhnah."
      }
    ],
    "tags": [
      "startup",
      "family",
      "budget",
      "history"
    ]
  },
  {
    "slug": "qal-ah-ye-shahr-af",
    "city": "Qal‘ah-ye Shahr",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.9,
    "description": "A destination known for island, budget, walkability and mild climate.",
    "overview": "Experience Qal‘ah-ye Shahr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Shahr%20skyline",
        "alt": "Qal‘ah-ye Shahr skyline",
        "caption": "Qal‘ah-ye Shahr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Shahr%20street",
        "alt": "Qal‘ah-ye Shahr street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Shahr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Shahr%20lifestyle",
        "alt": "Qal‘ah-ye Shahr lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Shahr."
      }
    ],
    "tags": [
      "island",
      "budget",
      "walkability",
      "golf"
    ]
  },
  {
    "slug": "qal-t-af",
    "city": "Qalāt",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.2,
    "description": "A destination known for startup, beach, expat-friendly and mild climate.",
    "overview": "Experience Qalāt's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%C4%81t%20skyline",
        "alt": "Qalāt skyline",
        "caption": "Qalāt cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%C4%81t%20street",
        "alt": "Qalāt street scene",
        "caption": "An atmospheric look at Qalāt's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%C4%81t%20lifestyle",
        "alt": "Qalāt lifestyle",
        "caption": "Daily life and culture in Qalāt."
      }
    ],
    "tags": [
      "startup",
      "beach",
      "expat-friendly",
      "island"
    ]
  },
  {
    "slug": "qal-ah-ye-sh-h-af",
    "city": "Qal‘ah-ye Shāhī",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for walkability, coast, digital nomad and mild climate.",
    "overview": "Experience Qal‘ah-ye Shāhī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Sh%C4%81h%C4%AB%20skyline",
        "alt": "Qal‘ah-ye Shāhī skyline",
        "caption": "Qal‘ah-ye Shāhī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Sh%C4%81h%C4%AB%20street",
        "alt": "Qal‘ah-ye Shāhī street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Shāhī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Sh%C4%81h%C4%AB%20lifestyle",
        "alt": "Qal‘ah-ye Shāhī lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Shāhī."
      }
    ],
    "tags": [
      "walkability",
      "coast",
      "digital nomad",
      "nightlife"
    ]
  },
  {
    "slug": "q-dis-af",
    "city": "Qādis",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.7,
    "description": "A destination known for culture, nightlife, history and mild climate.",
    "overview": "Experience Qādis's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81dis%20skyline",
        "alt": "Qādis skyline",
        "caption": "Qādis cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81dis%20street",
        "alt": "Qādis street scene",
        "caption": "An atmospheric look at Qādis's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Q%C4%81dis%20lifestyle",
        "alt": "Qādis lifestyle",
        "caption": "Daily life and culture in Qādis."
      }
    ],
    "tags": [
      "culture",
      "nightlife",
      "history",
      "healthcare"
    ]
  },
  {
    "slug": "p-r-n-af",
    "city": "Pārūn",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for startup, coast, outdoor recreation and mild climate.",
    "overview": "Experience Pārūn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81r%C5%ABn%20skyline",
        "alt": "Pārūn skyline",
        "caption": "Pārūn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81r%C5%ABn%20street",
        "alt": "Pārūn street scene",
        "caption": "An atmospheric look at Pārūn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81r%C5%ABn%20lifestyle",
        "alt": "Pārūn lifestyle",
        "caption": "Daily life and culture in Pārūn."
      }
    ],
    "tags": [
      "startup",
      "coast",
      "outdoor recreation",
      "culture"
    ]
  },
  {
    "slug": "pul-e-khumr-af",
    "city": "Pul-e Khumrī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.6,
    "description": "A destination known for eco, beach, safety and mild climate.",
    "overview": "Experience Pul-e Khumrī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Khumr%C4%AB%20skyline",
        "alt": "Pul-e Khumrī skyline",
        "caption": "Pul-e Khumrī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Khumr%C4%AB%20street",
        "alt": "Pul-e Khumrī street scene",
        "caption": "An atmospheric look at Pul-e Khumrī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Khumr%C4%AB%20lifestyle",
        "alt": "Pul-e Khumrī lifestyle",
        "caption": "Daily life and culture in Pul-e Khumrī."
      }
    ],
    "tags": [
      "eco",
      "beach",
      "safety",
      "outdoor recreation"
    ]
  },
  {
    "slug": "pul-e-alam-af",
    "city": "Pul-e ‘Alam",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for nature, safety, history and mild climate.",
    "overview": "Experience Pul-e ‘Alam's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E2%80%98Alam%20skyline",
        "alt": "Pul-e ‘Alam skyline",
        "caption": "Pul-e ‘Alam cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E2%80%98Alam%20street",
        "alt": "Pul-e ‘Alam street scene",
        "caption": "An atmospheric look at Pul-e ‘Alam's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E2%80%98Alam%20lifestyle",
        "alt": "Pul-e ‘Alam lifestyle",
        "caption": "Daily life and culture in Pul-e ‘Alam."
      }
    ],
    "tags": [
      "nature",
      "safety",
      "history",
      "slow pace"
    ]
  },
  {
    "slug": "pasnay-af",
    "city": "Pasnay",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for safety, island, eco and mild climate.",
    "overview": "Experience Pasnay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pasnay%20skyline",
        "alt": "Pasnay skyline",
        "caption": "Pasnay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pasnay%20street",
        "alt": "Pasnay street scene",
        "caption": "An atmospheric look at Pasnay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pasnay%20lifestyle",
        "alt": "Pasnay lifestyle",
        "caption": "Daily life and culture in Pasnay."
      }
    ],
    "tags": [
      "safety",
      "island",
      "eco",
      "climate"
    ]
  },
  {
    "slug": "p-shm-l-af",
    "city": "Pāshmūl",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.1,
    "description": "A destination known for expat-friendly, culture, walkability and mild climate.",
    "overview": "Experience Pāshmūl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81shm%C5%ABl%20skyline",
        "alt": "Pāshmūl skyline",
        "caption": "Pāshmūl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81shm%C5%ABl%20street",
        "alt": "Pāshmūl street scene",
        "caption": "An atmospheric look at Pāshmūl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?P%C4%81shm%C5%ABl%20lifestyle",
        "alt": "Pāshmūl lifestyle",
        "caption": "Daily life and culture in Pāshmūl."
      }
    ],
    "tags": [
      "expat-friendly",
      "culture",
      "walkability",
      "luxury"
    ]
  },
  {
    "slug": "pas-band-af",
    "city": "Pasāband",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for island, mountains, budget and mild climate.",
    "overview": "Experience Pasāband's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pas%C4%81band%20skyline",
        "alt": "Pasāband skyline",
        "caption": "Pasāband cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%C4%81band%20street",
        "alt": "Pasāband street scene",
        "caption": "An atmospheric look at Pasāband's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%C4%81band%20lifestyle",
        "alt": "Pasāband lifestyle",
        "caption": "Daily life and culture in Pasāband."
      }
    ],
    "tags": [
      "island",
      "mountains",
      "budget",
      "startup"
    ]
  },
  {
    "slug": "panj-b-af",
    "city": "Panjāb",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.5,
    "description": "A destination known for lake, coast, culture and mild climate.",
    "overview": "Experience Panjāb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Panj%C4%81b%20skyline",
        "alt": "Panjāb skyline",
        "caption": "Panjāb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Panj%C4%81b%20street",
        "alt": "Panjāb street scene",
        "caption": "An atmospheric look at Panjāb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Panj%C4%81b%20lifestyle",
        "alt": "Panjāb lifestyle",
        "caption": "Daily life and culture in Panjāb."
      }
    ],
    "tags": [
      "lake",
      "coast",
      "culture",
      "arts"
    ]
  },
  {
    "slug": "paghm-n-af",
    "city": "Paghmān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for expat-friendly, food, startup and mild climate.",
    "overview": "Experience Paghmān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Paghm%C4%81n%20skyline",
        "alt": "Paghmān skyline",
        "caption": "Paghmān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Paghm%C4%81n%20street",
        "alt": "Paghmān street scene",
        "caption": "An atmospheric look at Paghmān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Paghm%C4%81n%20lifestyle",
        "alt": "Paghmān lifestyle",
        "caption": "Daily life and culture in Paghmān."
      }
    ],
    "tags": [
      "expat-friendly",
      "food",
      "startup",
      "island"
    ]
  },
  {
    "slug": "mnah-af",
    "city": "Ōmnah",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for culture, slow pace, walkability and mild climate.",
    "overview": "Experience Ōmnah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cmnah%20skyline",
        "alt": "Ōmnah skyline",
        "caption": "Ōmnah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cmnah%20street",
        "alt": "Ōmnah street scene",
        "caption": "An atmospheric look at Ōmnah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cmnah%20lifestyle",
        "alt": "Ōmnah lifestyle",
        "caption": "Daily life and culture in Ōmnah."
      }
    ],
    "tags": [
      "culture",
      "slow pace",
      "walkability",
      "family"
    ]
  },
  {
    "slug": "b-h-af",
    "city": "Ōbêh",
    "country": "AF",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for nightlife, eco, outdoor recreation and mild climate.",
    "overview": "Experience Ōbêh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cb%C3%AAh%20skyline",
        "alt": "Ōbêh skyline",
        "caption": "Ōbêh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cb%C3%AAh%20street",
        "alt": "Ōbêh street scene",
        "caption": "An atmospheric look at Ōbêh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Cb%C3%AAh%20lifestyle",
        "alt": "Ōbêh lifestyle",
        "caption": "Daily life and culture in Ōbêh."
      }
    ],
    "tags": [
      "nightlife",
      "eco",
      "outdoor recreation",
      "history"
    ]
  },
  {
    "slug": "uruzg-n-af",
    "city": "Uruzgān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for coast, golf, history and mild climate.",
    "overview": "Experience Uruzgān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Uruzg%C4%81n%20skyline",
        "alt": "Uruzgān skyline",
        "caption": "Uruzgān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Uruzg%C4%81n%20street",
        "alt": "Uruzgān street scene",
        "caption": "An atmospheric look at Uruzgān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Uruzg%C4%81n%20lifestyle",
        "alt": "Uruzgān lifestyle",
        "caption": "Daily life and culture in Uruzgān."
      }
    ],
    "tags": [
      "coast",
      "golf",
      "history",
      "eco"
    ]
  },
  {
    "slug": "urgun-af",
    "city": "Urgun",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for arts, outdoor recreation, luxury and mild climate.",
    "overview": "Experience Urgun's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Urgun%20skyline",
        "alt": "Urgun skyline",
        "caption": "Urgun cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Urgun%20street",
        "alt": "Urgun street scene",
        "caption": "An atmospheric look at Urgun's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Urgun%20lifestyle",
        "alt": "Urgun lifestyle",
        "caption": "Daily life and culture in Urgun."
      }
    ],
    "tags": [
      "arts",
      "outdoor recreation",
      "luxury",
      "island"
    ]
  },
  {
    "slug": "n-say-af",
    "city": "Nūsay",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for nature, wellness, food and mild climate.",
    "overview": "Experience Nūsay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABsay%20skyline",
        "alt": "Nūsay skyline",
        "caption": "Nūsay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABsay%20street",
        "alt": "Nūsay street scene",
        "caption": "An atmospheric look at Nūsay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABsay%20lifestyle",
        "alt": "Nūsay lifestyle",
        "caption": "Daily life and culture in Nūsay."
      }
    ],
    "tags": [
      "nature",
      "wellness",
      "food",
      "nightlife"
    ]
  },
  {
    "slug": "n-rgal-af",
    "city": "Nūrgal",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.4,
    "description": "A destination known for startup, golf, family and mild climate.",
    "overview": "Experience Nūrgal's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABrgal%20skyline",
        "alt": "Nūrgal skyline",
        "caption": "Nūrgal cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABrgal%20street",
        "alt": "Nūrgal street scene",
        "caption": "An atmospheric look at Nūrgal's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C5%ABrgal%20lifestyle",
        "alt": "Nūrgal lifestyle",
        "caption": "Daily life and culture in Nūrgal."
      }
    ],
    "tags": [
      "startup",
      "golf",
      "family",
      "beach"
    ]
  },
  {
    "slug": "now-z-d-af",
    "city": "Now Zād",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.7,
    "description": "A destination known for nature, digital nomad, startup and mild climate.",
    "overview": "Experience Now Zād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Now%20Z%C4%81d%20skyline",
        "alt": "Now Zād skyline",
        "caption": "Now Zād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Now%20Z%C4%81d%20street",
        "alt": "Now Zād street scene",
        "caption": "An atmospheric look at Now Zād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Now%20Z%C4%81d%20lifestyle",
        "alt": "Now Zād lifestyle",
        "caption": "Daily life and culture in Now Zād."
      }
    ],
    "tags": [
      "nature",
      "digital nomad",
      "startup",
      "luxury"
    ]
  },
  {
    "slug": "n-l-af",
    "city": "Nīlī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for safety, expat-friendly, history and mild climate.",
    "overview": "Experience Nīlī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABl%C4%AB%20skyline",
        "alt": "Nīlī skyline",
        "caption": "Nīlī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABl%C4%AB%20street",
        "alt": "Nīlī street scene",
        "caption": "An atmospheric look at Nīlī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABl%C4%AB%20lifestyle",
        "alt": "Nīlī lifestyle",
        "caption": "Daily life and culture in Nīlī."
      }
    ],
    "tags": [
      "safety",
      "expat-friendly",
      "history",
      "beach"
    ]
  },
  {
    "slug": "nayak-af",
    "city": "Nayak",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for mountains, island, family and mild climate.",
    "overview": "Experience Nayak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Nayak%20skyline",
        "alt": "Nayak skyline",
        "caption": "Nayak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nayak%20street",
        "alt": "Nayak street scene",
        "caption": "An atmospheric look at Nayak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nayak%20lifestyle",
        "alt": "Nayak lifestyle",
        "caption": "Daily life and culture in Nayak."
      }
    ],
    "tags": [
      "mountains",
      "island",
      "family",
      "retirement"
    ]
  },
  {
    "slug": "n-yak-af",
    "city": "Nāyak",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.9,
    "description": "A destination known for climate, island, safety and mild climate.",
    "overview": "Experience Nāyak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yak%20skyline",
        "alt": "Nāyak skyline",
        "caption": "Nāyak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yak%20street",
        "alt": "Nāyak street scene",
        "caption": "An atmospheric look at Nāyak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81yak%20lifestyle",
        "alt": "Nāyak lifestyle",
        "caption": "Daily life and culture in Nāyak."
      }
    ],
    "tags": [
      "climate",
      "island",
      "safety",
      "nature"
    ]
  },
  {
    "slug": "now-dah-nak-af",
    "city": "Now Dahānak",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for digital nomad, nightlife, eco and mild climate.",
    "overview": "Experience Now Dahānak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Now%20Dah%C4%81nak%20skyline",
        "alt": "Now Dahānak skyline",
        "caption": "Now Dahānak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Now%20Dah%C4%81nak%20street",
        "alt": "Now Dahānak street scene",
        "caption": "An atmospheric look at Now Dahānak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Now%20Dah%C4%81nak%20lifestyle",
        "alt": "Now Dahānak lifestyle",
        "caption": "Daily life and culture in Now Dahānak."
      }
    ],
    "tags": [
      "digital nomad",
      "nightlife",
      "eco",
      "slow pace"
    ]
  },
  {
    "slug": "kak-af",
    "city": "Ōkak",
    "country": "AF",
    "emoji": "🌍",
    "match": 94,
    "description": "A destination known for food, outdoor recreation, culture and mild climate.",
    "overview": "Experience Ōkak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Ckak%20skyline",
        "alt": "Ōkak skyline",
        "caption": "Ōkak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Ckak%20street",
        "alt": "Ōkak street scene",
        "caption": "An atmospheric look at Ōkak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%8Ckak%20lifestyle",
        "alt": "Ōkak lifestyle",
        "caption": "Daily life and culture in Ōkak."
      }
    ],
    "tags": [
      "food",
      "outdoor recreation",
      "culture",
      "climate"
    ]
  },
  {
    "slug": "n-ay-af",
    "city": "Nāṟay",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.5,
    "description": "A destination known for retirement, budget, history and mild climate.",
    "overview": "Experience Nāṟay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81%E1%B9%9Fay%20skyline",
        "alt": "Nāṟay skyline",
        "caption": "Nāṟay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81%E1%B9%9Fay%20street",
        "alt": "Nāṟay street scene",
        "caption": "An atmospheric look at Nāṟay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%81%E1%B9%9Fay%20lifestyle",
        "alt": "Nāṟay lifestyle",
        "caption": "Daily life and culture in Nāṟay."
      }
    ],
    "tags": [
      "retirement",
      "budget",
      "history",
      "nature"
    ]
  },
  {
    "slug": "narang-af",
    "city": "Narang",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for family, safety, culture and mild climate.",
    "overview": "Experience Narang's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Narang%20skyline",
        "alt": "Narang skyline",
        "caption": "Narang cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Narang%20street",
        "alt": "Narang street scene",
        "caption": "An atmospheric look at Narang's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Narang%20lifestyle",
        "alt": "Narang lifestyle",
        "caption": "Daily life and culture in Narang."
      }
    ],
    "tags": [
      "family",
      "safety",
      "culture",
      "slow pace"
    ]
  },
  {
    "slug": "n-k-h-af",
    "city": "Nīkêh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.4,
    "description": "A destination known for mountains, nature, safety and mild climate.",
    "overview": "Experience Nīkêh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABk%C3%AAh%20skyline",
        "alt": "Nīkêh skyline",
        "caption": "Nīkêh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABk%C3%AAh%20street",
        "alt": "Nīkêh street scene",
        "caption": "An atmospheric look at Nīkêh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?N%C4%ABk%C3%AAh%20lifestyle",
        "alt": "Nīkêh lifestyle",
        "caption": "Daily life and culture in Nīkêh."
      }
    ],
    "tags": [
      "mountains",
      "nature",
      "safety",
      "lake"
    ]
  },
  {
    "slug": "nahr-n-af",
    "city": "Nahrīn",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for walkability, digital nomad, island and mild climate.",
    "overview": "Experience Nahrīn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Nahr%C4%ABn%20skyline",
        "alt": "Nahrīn skyline",
        "caption": "Nahrīn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nahr%C4%ABn%20street",
        "alt": "Nahrīn street scene",
        "caption": "An atmospheric look at Nahrīn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Nahr%C4%ABn%20lifestyle",
        "alt": "Nahrīn lifestyle",
        "caption": "Daily life and culture in Nahrīn."
      }
    ],
    "tags": [
      "walkability",
      "digital nomad",
      "island",
      "slow pace"
    ]
  },
  {
    "slug": "uk-mat-e-n-d-al-af",
    "city": "Ḩukūmat-e Nād ‘Alī",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.7,
    "description": "A destination known for budget, lake, wellness and mild climate.",
    "overview": "Experience Ḩukūmat-e Nād ‘Alī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20N%C4%81d%20%E2%80%98Al%C4%AB%20skyline",
        "alt": "Ḩukūmat-e Nād ‘Alī skyline",
        "caption": "Ḩukūmat-e Nād ‘Alī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20N%C4%81d%20%E2%80%98Al%C4%AB%20street",
        "alt": "Ḩukūmat-e Nād ‘Alī street scene",
        "caption": "An atmospheric look at Ḩukūmat-e Nād ‘Alī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20N%C4%81d%20%E2%80%98Al%C4%AB%20lifestyle",
        "alt": "Ḩukūmat-e Nād ‘Alī lifestyle",
        "caption": "Daily life and culture in Ḩukūmat-e Nād ‘Alī."
      }
    ],
    "tags": [
      "budget",
      "lake",
      "wellness",
      "climate"
    ]
  },
  {
    "slug": "m-s-qal-ah-af",
    "city": "Mūsá Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.3,
    "description": "A destination known for outdoor recreation, climate, walkability and mild climate.",
    "overview": "Experience Mūsá Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C5%ABs%C3%A1%20Qal%E2%80%98ah%20skyline",
        "alt": "Mūsá Qal‘ah skyline",
        "caption": "Mūsá Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C5%ABs%C3%A1%20Qal%E2%80%98ah%20street",
        "alt": "Mūsá Qal‘ah street scene",
        "caption": "An atmospheric look at Mūsá Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C5%ABs%C3%A1%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Mūsá Qal‘ah lifestyle",
        "caption": "Daily life and culture in Mūsá Qal‘ah."
      }
    ],
    "tags": [
      "outdoor recreation",
      "climate",
      "walkability",
      "retirement"
    ]
  },
  {
    "slug": "bala-murghab-af",
    "city": "Bala Murghab",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for digital nomad, retirement, culture and mild climate.",
    "overview": "Experience Bala Murghab's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bala%20Murghab%20skyline",
        "alt": "Bala Murghab skyline",
        "caption": "Bala Murghab cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bala%20Murghab%20street",
        "alt": "Bala Murghab street scene",
        "caption": "An atmospheric look at Bala Murghab's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bala%20Murghab%20lifestyle",
        "alt": "Bala Murghab lifestyle",
        "caption": "Daily life and culture in Bala Murghab."
      }
    ],
    "tags": [
      "digital nomad",
      "retirement",
      "culture",
      "wellness"
    ]
  },
  {
    "slug": "muq-r-af",
    "city": "Muqêr",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.4,
    "description": "A destination known for luxury, climate, golf and mild climate.",
    "overview": "Experience Muqêr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Muq%C3%AAr%20skyline",
        "alt": "Muqêr skyline",
        "caption": "Muqêr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muq%C3%AAr%20street",
        "alt": "Muqêr street scene",
        "caption": "An atmospheric look at Muqêr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muq%C3%AAr%20lifestyle",
        "alt": "Muqêr lifestyle",
        "caption": "Daily life and culture in Muqêr."
      }
    ],
    "tags": [
      "luxury",
      "climate",
      "golf",
      "outdoor recreation"
    ]
  },
  {
    "slug": "mu-ammad-ghah-wulusw-l-af",
    "city": "Muḩammad Āghah Wuluswālī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for island, healthcare, arts and mild climate.",
    "overview": "Experience Muḩammad Āghah Wuluswālī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mu%E1%B8%A9ammad%20%C4%80ghah%20Wulusw%C4%81l%C4%AB%20skyline",
        "alt": "Muḩammad Āghah Wuluswālī skyline",
        "caption": "Muḩammad Āghah Wuluswālī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mu%E1%B8%A9ammad%20%C4%80ghah%20Wulusw%C4%81l%C4%AB%20street",
        "alt": "Muḩammad Āghah Wuluswālī street scene",
        "caption": "An atmospheric look at Muḩammad Āghah Wuluswālī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mu%E1%B8%A9ammad%20%C4%80ghah%20Wulusw%C4%81l%C4%AB%20lifestyle",
        "alt": "Muḩammad Āghah Wuluswālī lifestyle",
        "caption": "Daily life and culture in Muḩammad Āghah Wuluswālī."
      }
    ],
    "tags": [
      "island",
      "healthcare",
      "arts",
      "outdoor recreation"
    ]
  },
  {
    "slug": "m-z-n-al-qahd-r-af",
    "city": "Mīzān ‘Alāqahdārī",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.4,
    "description": "A destination known for nightlife, startup, healthcare and mild climate.",
    "overview": "Experience Mīzān ‘Alāqahdārī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABz%C4%81n%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20skyline",
        "alt": "Mīzān ‘Alāqahdārī skyline",
        "caption": "Mīzān ‘Alāqahdārī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABz%C4%81n%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20street",
        "alt": "Mīzān ‘Alāqahdārī street scene",
        "caption": "An atmospheric look at Mīzān ‘Alāqahdārī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABz%C4%81n%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20lifestyle",
        "alt": "Mīzān ‘Alāqahdārī lifestyle",
        "caption": "Daily life and culture in Mīzān ‘Alāqahdārī."
      }
    ],
    "tags": [
      "nightlife",
      "startup",
      "healthcare",
      "food"
    ]
  },
  {
    "slug": "m-r-bachah-k-af",
    "city": "Mīr Bachah Kōṯ",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for outdoor recreation, food, lake and mild climate.",
    "overview": "Experience Mīr Bachah Kōṯ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%20Bachah%20K%C5%8D%E1%B9%AF%20skyline",
        "alt": "Mīr Bachah Kōṯ skyline",
        "caption": "Mīr Bachah Kōṯ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%20Bachah%20K%C5%8D%E1%B9%AF%20street",
        "alt": "Mīr Bachah Kōṯ street scene",
        "caption": "An atmospheric look at Mīr Bachah Kōṯ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%20Bachah%20K%C5%8D%E1%B9%AF%20lifestyle",
        "alt": "Mīr Bachah Kōṯ lifestyle",
        "caption": "Daily life and culture in Mīr Bachah Kōṯ."
      }
    ],
    "tags": [
      "outdoor recreation",
      "food",
      "lake",
      "safety"
    ]
  },
  {
    "slug": "m-r-n-af",
    "city": "Mīrān",
    "country": "AF",
    "emoji": "🌍",
    "match": 95,
    "description": "A destination known for digital nomad, history, expat-friendly and mild climate.",
    "overview": "Experience Mīrān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81n%20skyline",
        "alt": "Mīrān skyline",
        "caption": "Mīrān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81n%20street",
        "alt": "Mīrān street scene",
        "caption": "An atmospheric look at Mīrān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81n%20lifestyle",
        "alt": "Mīrān lifestyle",
        "caption": "Daily life and culture in Mīrān."
      }
    ],
    "tags": [
      "digital nomad",
      "history",
      "expat-friendly",
      "mountains"
    ]
  },
  {
    "slug": "m-r-b-d-af",
    "city": "Mīrābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.1,
    "description": "A destination known for expat-friendly, safety, culture and mild climate.",
    "overview": "Experience Mīrābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81b%C4%81d%20skyline",
        "alt": "Mīrābād skyline",
        "caption": "Mīrābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81b%C4%81d%20street",
        "alt": "Mīrābād street scene",
        "caption": "An atmospheric look at Mīrābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%ABr%C4%81b%C4%81d%20lifestyle",
        "alt": "Mīrābād lifestyle",
        "caption": "Daily life and culture in Mīrābād."
      }
    ],
    "tags": [
      "expat-friendly",
      "safety",
      "culture",
      "nature"
    ]
  },
  {
    "slug": "maymana-af",
    "city": "Maymana",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.2,
    "description": "A destination known for retirement, digital nomad, wellness and mild climate.",
    "overview": "Experience Maymana's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Maymana%20skyline",
        "alt": "Maymana skyline",
        "caption": "Maymana cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maymana%20street",
        "alt": "Maymana street scene",
        "caption": "An atmospheric look at Maymana's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maymana%20lifestyle",
        "alt": "Maymana lifestyle",
        "caption": "Daily life and culture in Maymana."
      }
    ],
    "tags": [
      "retirement",
      "digital nomad",
      "wellness",
      "golf"
    ]
  },
  {
    "slug": "ma-d-n-kh-lah-af",
    "city": "Maīdān Khūlah",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.4,
    "description": "A destination known for budget, walkability, lake and mild climate.",
    "overview": "Experience Maīdān Khūlah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ma%C4%ABd%C4%81n%20Kh%C5%ABlah%20skyline",
        "alt": "Maīdān Khūlah skyline",
        "caption": "Maīdān Khūlah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ma%C4%ABd%C4%81n%20Kh%C5%ABlah%20street",
        "alt": "Maīdān Khūlah street scene",
        "caption": "An atmospheric look at Maīdān Khūlah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ma%C4%ABd%C4%81n%20Kh%C5%ABlah%20lifestyle",
        "alt": "Maīdān Khūlah lifestyle",
        "caption": "Daily life and culture in Maīdān Khūlah."
      }
    ],
    "tags": [
      "budget",
      "walkability",
      "lake",
      "family"
    ]
  },
  {
    "slug": "mingajik-af",
    "city": "Mingajik",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.5,
    "description": "A destination known for digital nomad, wellness, expat-friendly and mild climate.",
    "overview": "Experience Mingajik's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mingajik%20skyline",
        "alt": "Mingajik skyline",
        "caption": "Mingajik cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mingajik%20street",
        "alt": "Mingajik street scene",
        "caption": "An atmospheric look at Mingajik's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mingajik%20lifestyle",
        "alt": "Mingajik lifestyle",
        "caption": "Daily life and culture in Mingajik."
      }
    ],
    "tags": [
      "digital nomad",
      "wellness",
      "expat-friendly",
      "history"
    ]
  },
  {
    "slug": "mehtar-l-m-af",
    "city": "Mehtar Lām",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for retirement, safety, coast and mild climate.",
    "overview": "Experience Mehtar Lām's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mehtar%20L%C4%81m%20skyline",
        "alt": "Mehtar Lām skyline",
        "caption": "Mehtar Lām cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mehtar%20L%C4%81m%20street",
        "alt": "Mehtar Lām street scene",
        "caption": "An atmospheric look at Mehtar Lām's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mehtar%20L%C4%81m%20lifestyle",
        "alt": "Mehtar Lām lifestyle",
        "caption": "Daily life and culture in Mehtar Lām."
      }
    ],
    "tags": [
      "retirement",
      "safety",
      "coast",
      "eco"
    ]
  },
  {
    "slug": "maz-r-e-shar-f-af",
    "city": "Mazār-e Sharīf",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for arts, wellness, safety and mild climate.",
    "overview": "Experience Mazār-e Sharīf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Maz%C4%81r-e%20Shar%C4%ABf%20skyline",
        "alt": "Mazār-e Sharīf skyline",
        "caption": "Mazār-e Sharīf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maz%C4%81r-e%20Shar%C4%ABf%20street",
        "alt": "Mazār-e Sharīf street scene",
        "caption": "An atmospheric look at Mazār-e Sharīf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maz%C4%81r-e%20Shar%C4%ABf%20lifestyle",
        "alt": "Mazār-e Sharīf lifestyle",
        "caption": "Daily life and culture in Mazār-e Sharīf."
      }
    ],
    "tags": [
      "arts",
      "wellness",
      "safety",
      "outdoor recreation"
    ]
  },
  {
    "slug": "m-ymay-af",
    "city": "Māymay",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for healthcare, walkability, climate and mild climate.",
    "overview": "Experience Māymay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81ymay%20skyline",
        "alt": "Māymay skyline",
        "caption": "Māymay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81ymay%20street",
        "alt": "Māymay street scene",
        "caption": "An atmospheric look at Māymay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81ymay%20lifestyle",
        "alt": "Māymay lifestyle",
        "caption": "Daily life and culture in Māymay."
      }
    ],
    "tags": [
      "healthcare",
      "walkability",
      "climate",
      "island"
    ]
  },
  {
    "slug": "mut-kh-n-af",
    "city": "Mutā Khān",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.3,
    "description": "A destination known for digital nomad, beach, arts and mild climate.",
    "overview": "Experience Mutā Khān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mut%C4%81%20Kh%C4%81n%20skyline",
        "alt": "Mutā Khān skyline",
        "caption": "Mutā Khān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mut%C4%81%20Kh%C4%81n%20street",
        "alt": "Mutā Khān street scene",
        "caption": "An atmospheric look at Mutā Khān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mut%C4%81%20Kh%C4%81n%20lifestyle",
        "alt": "Mutā Khān lifestyle",
        "caption": "Daily life and culture in Mutā Khān."
      }
    ],
    "tags": [
      "digital nomad",
      "beach",
      "arts",
      "golf"
    ]
  },
  {
    "slug": "mashhad-af",
    "city": "Mashhad",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.3,
    "description": "A destination known for walkability, digital nomad, beach and mild climate.",
    "overview": "Experience Mashhad's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mashhad%20skyline",
        "alt": "Mashhad skyline",
        "caption": "Mashhad cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mashhad%20street",
        "alt": "Mashhad street scene",
        "caption": "An atmospheric look at Mashhad's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mashhad%20lifestyle",
        "alt": "Mashhad lifestyle",
        "caption": "Daily life and culture in Mashhad."
      }
    ],
    "tags": [
      "walkability",
      "digital nomad",
      "beach",
      "food"
    ]
  },
  {
    "slug": "mard-n-af",
    "city": "Mardīān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.7,
    "description": "A destination known for nightlife, arts, mountains and mild climate.",
    "overview": "Experience Mardīān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mard%C4%AB%C4%81n%20skyline",
        "alt": "Mardīān skyline",
        "caption": "Mardīān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mard%C4%AB%C4%81n%20street",
        "alt": "Mardīān street scene",
        "caption": "An atmospheric look at Mardīān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mard%C4%AB%C4%81n%20lifestyle",
        "alt": "Mardīān lifestyle",
        "caption": "Daily life and culture in Mardīān."
      }
    ],
    "tags": [
      "nightlife",
      "arts",
      "mountains",
      "expat-friendly"
    ]
  },
  {
    "slug": "mand-l-af",
    "city": "Mandōl",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for history, startup, luxury and mild climate.",
    "overview": "Experience Mandōl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mand%C5%8Dl%20skyline",
        "alt": "Mandōl skyline",
        "caption": "Mandōl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mand%C5%8Dl%20street",
        "alt": "Mandōl street scene",
        "caption": "An atmospheric look at Mandōl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mand%C5%8Dl%20lifestyle",
        "alt": "Mandōl lifestyle",
        "caption": "Daily life and culture in Mandōl."
      }
    ],
    "tags": [
      "history",
      "startup",
      "luxury",
      "walkability"
    ]
  },
  {
    "slug": "m-m-kh-l-af",
    "city": "Māmā Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.9,
    "description": "A destination known for walkability, culture, mountains and mild climate.",
    "overview": "Experience Māmā Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81m%C4%81%20Kh%C4%93l%20skyline",
        "alt": "Māmā Khēl skyline",
        "caption": "Māmā Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81m%C4%81%20Kh%C4%93l%20street",
        "alt": "Māmā Khēl street scene",
        "caption": "An atmospheric look at Māmā Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81m%C4%81%20Kh%C4%93l%20lifestyle",
        "alt": "Māmā Khēl lifestyle",
        "caption": "Daily life and culture in Māmā Khēl."
      }
    ],
    "tags": [
      "walkability",
      "culture",
      "mountains",
      "retirement"
    ]
  },
  {
    "slug": "lashkar-g-h-af",
    "city": "Lashkar Gāh",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for culture, healthcare, retirement and mild climate.",
    "overview": "Experience Lashkar Gāh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Lashkar%20G%C4%81h%20skyline",
        "alt": "Lashkar Gāh skyline",
        "caption": "Lashkar Gāh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lashkar%20G%C4%81h%20street",
        "alt": "Lashkar Gāh street scene",
        "caption": "An atmospheric look at Lashkar Gāh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lashkar%20G%C4%81h%20lifestyle",
        "alt": "Lashkar Gāh lifestyle",
        "caption": "Daily life and culture in Lashkar Gāh."
      }
    ],
    "tags": [
      "culture",
      "healthcare",
      "retirement",
      "golf"
    ]
  },
  {
    "slug": "l-sh-e-juwayn-af",
    "city": "Lāsh-e Juwayn",
    "country": "AF",
    "emoji": "🌍",
    "match": 95,
    "description": "A destination known for climate, slow pace, history and mild climate.",
    "overview": "Experience Lāsh-e Juwayn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh-e%20Juwayn%20skyline",
        "alt": "Lāsh-e Juwayn skyline",
        "caption": "Lāsh-e Juwayn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh-e%20Juwayn%20street",
        "alt": "Lāsh-e Juwayn street scene",
        "caption": "An atmospheric look at Lāsh-e Juwayn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?L%C4%81sh-e%20Juwayn%20lifestyle",
        "alt": "Lāsh-e Juwayn lifestyle",
        "caption": "Daily life and culture in Lāsh-e Juwayn."
      }
    ],
    "tags": [
      "climate",
      "slow pace",
      "history",
      "healthcare"
    ]
  },
  {
    "slug": "larkird-af",
    "city": "Larkird",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for outdoor recreation, safety, lake and mild climate.",
    "overview": "Experience Larkird's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Larkird%20skyline",
        "alt": "Larkird skyline",
        "caption": "Larkird cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Larkird%20street",
        "alt": "Larkird street scene",
        "caption": "An atmospheric look at Larkird's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Larkird%20lifestyle",
        "alt": "Larkird lifestyle",
        "caption": "Daily life and culture in Larkird."
      }
    ],
    "tags": [
      "outdoor recreation",
      "safety",
      "lake",
      "eco"
    ]
  },
  {
    "slug": "la-l-af",
    "city": "La‘l",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for wellness, culture, beach and mild climate.",
    "overview": "Experience La‘l's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?La%E2%80%98l%20skyline",
        "alt": "La‘l skyline",
        "caption": "La‘l cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?La%E2%80%98l%20street",
        "alt": "La‘l street scene",
        "caption": "An atmospheric look at La‘l's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?La%E2%80%98l%20lifestyle",
        "alt": "La‘l lifestyle",
        "caption": "Daily life and culture in La‘l."
      }
    ],
    "tags": [
      "wellness",
      "culture",
      "beach",
      "food"
    ]
  },
  {
    "slug": "kushk-af",
    "city": "Kushk",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.8,
    "description": "A destination known for climate, expat-friendly, safety and mild climate.",
    "overview": "Experience Kushk's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kushk%20skyline",
        "alt": "Kushk skyline",
        "caption": "Kushk cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushk%20street",
        "alt": "Kushk street scene",
        "caption": "An atmospheric look at Kushk's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushk%20lifestyle",
        "alt": "Kushk lifestyle",
        "caption": "Daily life and culture in Kushk."
      }
    ],
    "tags": [
      "climate",
      "expat-friendly",
      "safety",
      "mountains"
    ]
  },
  {
    "slug": "r-ay-balochi-af",
    "city": "Rāẕay Balochi",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for beach, walkability, island and mild climate.",
    "overview": "Experience Rāẕay Balochi's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81%E1%BA%95ay%20Balochi%20skyline",
        "alt": "Rāẕay Balochi skyline",
        "caption": "Rāẕay Balochi cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81%E1%BA%95ay%20Balochi%20street",
        "alt": "Rāẕay Balochi street scene",
        "caption": "An atmospheric look at Rāẕay Balochi's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?R%C4%81%E1%BA%95ay%20Balochi%20lifestyle",
        "alt": "Rāẕay Balochi lifestyle",
        "caption": "Daily life and culture in Rāẕay Balochi."
      }
    ],
    "tags": [
      "beach",
      "walkability",
      "island",
      "startup"
    ]
  },
  {
    "slug": "k-ow-l-af",
    "city": "Kōṯowāl",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for walkability, beach, culture and mild climate.",
    "overview": "Experience Kōṯowāl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?K%C5%8D%E1%B9%AFow%C4%81l%20skyline",
        "alt": "Kōṯowāl skyline",
        "caption": "Kōṯowāl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?K%C5%8D%E1%B9%AFow%C4%81l%20street",
        "alt": "Kōṯowāl street scene",
        "caption": "An atmospheric look at Kōṯowāl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?K%C5%8D%E1%B9%AFow%C4%81l%20lifestyle",
        "alt": "Kōṯowāl lifestyle",
        "caption": "Daily life and culture in Kōṯowāl."
      }
    ],
    "tags": [
      "walkability",
      "beach",
      "culture",
      "climate"
    ]
  },
  {
    "slug": "kushk-e-kuhnah-af",
    "city": "Kushk-e Kuhnah",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.3,
    "description": "A destination known for digital nomad, luxury, expat-friendly and mild climate.",
    "overview": "Experience Kushk-e Kuhnah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kushk-e%20Kuhnah%20skyline",
        "alt": "Kushk-e Kuhnah skyline",
        "caption": "Kushk-e Kuhnah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushk-e%20Kuhnah%20street",
        "alt": "Kushk-e Kuhnah street scene",
        "caption": "An atmospheric look at Kushk-e Kuhnah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushk-e%20Kuhnah%20lifestyle",
        "alt": "Kushk-e Kuhnah lifestyle",
        "caption": "Daily life and culture in Kushk-e Kuhnah."
      }
    ],
    "tags": [
      "digital nomad",
      "luxury",
      "expat-friendly",
      "startup"
    ]
  },
  {
    "slug": "kuran-wa-munjan-af",
    "city": "Kuran wa Munjan",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.7,
    "description": "A destination known for mountains, walkability, wellness and mild climate.",
    "overview": "Experience Kuran wa Munjan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kuran%20wa%20Munjan%20skyline",
        "alt": "Kuran wa Munjan skyline",
        "caption": "Kuran wa Munjan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kuran%20wa%20Munjan%20street",
        "alt": "Kuran wa Munjan street scene",
        "caption": "An atmospheric look at Kuran wa Munjan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kuran%20wa%20Munjan%20lifestyle",
        "alt": "Kuran wa Munjan lifestyle",
        "caption": "Daily life and culture in Kuran wa Munjan."
      }
    ],
    "tags": [
      "mountains",
      "walkability",
      "wellness",
      "family"
    ]
  },
  {
    "slug": "kunduz-af",
    "city": "Kunduz",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for climate, nightlife, healthcare and mild climate.",
    "overview": "Experience Kunduz's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kunduz%20skyline",
        "alt": "Kunduz skyline",
        "caption": "Kunduz cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kunduz%20street",
        "alt": "Kunduz street scene",
        "caption": "An atmospheric look at Kunduz's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kunduz%20lifestyle",
        "alt": "Kunduz lifestyle",
        "caption": "Daily life and culture in Kunduz."
      }
    ],
    "tags": [
      "climate",
      "nightlife",
      "healthcare",
      "startup"
    ]
  },
  {
    "slug": "kh-sh-af",
    "city": "Khōshī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.9,
    "description": "A destination known for budget, food, luxury and mild climate.",
    "overview": "Experience Khōshī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%AB%20skyline",
        "alt": "Khōshī skyline",
        "caption": "Khōshī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%AB%20street",
        "alt": "Khōshī street scene",
        "caption": "An atmospheric look at Khōshī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%AB%20lifestyle",
        "alt": "Khōshī lifestyle",
        "caption": "Daily life and culture in Khōshī."
      }
    ],
    "tags": [
      "budget",
      "food",
      "luxury",
      "island"
    ]
  },
  {
    "slug": "kh-sh-mand-af",
    "city": "Khōshāmand",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.9,
    "description": "A destination known for expat-friendly, healthcare, slow pace and mild climate.",
    "overview": "Experience Khōshāmand's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%81mand%20skyline",
        "alt": "Khōshāmand skyline",
        "caption": "Khōshāmand cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%81mand%20street",
        "alt": "Khōshāmand street scene",
        "caption": "An atmospheric look at Khōshāmand's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dsh%C4%81mand%20lifestyle",
        "alt": "Khōshāmand lifestyle",
        "caption": "Daily life and culture in Khōshāmand."
      }
    ],
    "tags": [
      "expat-friendly",
      "healthcare",
      "slow pace",
      "culture"
    ]
  },
  {
    "slug": "khw-jah-gh-r-af",
    "city": "Khwājah Ghār",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.3,
    "description": "A destination known for beach, startup, safety and mild climate.",
    "overview": "Experience Khwājah Ghār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20Gh%C4%81r%20skyline",
        "alt": "Khwājah Ghār skyline",
        "caption": "Khwājah Ghār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20Gh%C4%81r%20street",
        "alt": "Khwājah Ghār street scene",
        "caption": "An atmospheric look at Khwājah Ghār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20Gh%C4%81r%20lifestyle",
        "alt": "Khwājah Ghār lifestyle",
        "caption": "Daily life and culture in Khwājah Ghār."
      }
    ],
    "tags": [
      "beach",
      "startup",
      "safety",
      "culture"
    ]
  },
  {
    "slug": "khw-jah-d-k-h-af",
    "city": "Khwājah Dū Kōh",
    "country": "AF",
    "emoji": "🌍",
    "match": 92,
    "description": "A destination known for healthcare, nightlife, island and mild climate.",
    "overview": "Experience Khwājah Dū Kōh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20D%C5%AB%20K%C5%8Dh%20skyline",
        "alt": "Khwājah Dū Kōh skyline",
        "caption": "Khwājah Dū Kōh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20D%C5%AB%20K%C5%8Dh%20street",
        "alt": "Khwājah Dū Kōh street scene",
        "caption": "An atmospheric look at Khwājah Dū Kōh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khw%C4%81jah%20D%C5%AB%20K%C5%8Dh%20lifestyle",
        "alt": "Khwājah Dū Kōh lifestyle",
        "caption": "Daily life and culture in Khwājah Dū Kōh."
      }
    ],
    "tags": [
      "healthcare",
      "nightlife",
      "island",
      "budget"
    ]
  },
  {
    "slug": "deh-khw-h-n-af",
    "city": "Deh Khwāhān",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for lake, healthcare, beach and mild climate.",
    "overview": "Experience Deh Khwāhān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Deh%20Khw%C4%81h%C4%81n%20skyline",
        "alt": "Deh Khwāhān skyline",
        "caption": "Deh Khwāhān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh%20Khw%C4%81h%C4%81n%20street",
        "alt": "Deh Khwāhān street scene",
        "caption": "An atmospheric look at Deh Khwāhān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh%20Khw%C4%81h%C4%81n%20lifestyle",
        "alt": "Deh Khwāhān lifestyle",
        "caption": "Daily life and culture in Deh Khwāhān."
      }
    ],
    "tags": [
      "lake",
      "healthcare",
      "beach",
      "arts"
    ]
  },
  {
    "slug": "khulbis-t-af",
    "city": "Khulbisāt",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.8,
    "description": "A destination known for nature, culture, walkability and mild climate.",
    "overview": "Experience Khulbisāt's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khulbis%C4%81t%20skyline",
        "alt": "Khulbisāt skyline",
        "caption": "Khulbisāt cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khulbis%C4%81t%20street",
        "alt": "Khulbisāt street scene",
        "caption": "An atmospheric look at Khulbisāt's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khulbis%C4%81t%20lifestyle",
        "alt": "Khulbisāt lifestyle",
        "caption": "Daily life and culture in Khulbisāt."
      }
    ],
    "tags": [
      "nature",
      "culture",
      "walkability",
      "history"
    ]
  },
  {
    "slug": "kh-gy-af",
    "city": "Khūgyāṉī",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for coast, startup, history and mild climate.",
    "overview": "Experience Khūgyāṉī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%ABgy%C4%81%E1%B9%89%C4%AB%20skyline",
        "alt": "Khūgyāṉī skyline",
        "caption": "Khūgyāṉī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%ABgy%C4%81%E1%B9%89%C4%AB%20street",
        "alt": "Khūgyāṉī street scene",
        "caption": "An atmospheric look at Khūgyāṉī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%ABgy%C4%81%E1%B9%89%C4%AB%20lifestyle",
        "alt": "Khūgyāṉī lifestyle",
        "caption": "Daily life and culture in Khūgyāṉī."
      }
    ],
    "tags": [
      "coast",
      "startup",
      "history",
      "outdoor recreation"
    ]
  },
  {
    "slug": "kh-st-af",
    "city": "Khōst",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.3,
    "description": "A destination known for climate, retirement, mountains and mild climate.",
    "overview": "Experience Khōst's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dst%20skyline",
        "alt": "Khōst skyline",
        "caption": "Khōst cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dst%20street",
        "alt": "Khōst street scene",
        "caption": "An atmospheric look at Khōst's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C5%8Dst%20lifestyle",
        "alt": "Khōst lifestyle",
        "caption": "Daily life and culture in Khōst."
      }
    ],
    "tags": [
      "climate",
      "retirement",
      "mountains",
      "healthcare"
    ]
  },
  {
    "slug": "khulm-af",
    "city": "Khulm",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for history, beach, eco and mild climate.",
    "overview": "Experience Khulm's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khulm%20skyline",
        "alt": "Khulm skyline",
        "caption": "Khulm cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khulm%20street",
        "alt": "Khulm street scene",
        "caption": "An atmospheric look at Khulm's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khulm%20lifestyle",
        "alt": "Khulm lifestyle",
        "caption": "Daily life and culture in Khulm."
      }
    ],
    "tags": [
      "history",
      "beach",
      "eco",
      "expat-friendly"
    ]
  },
  {
    "slug": "khud-yd-d-kh-l-af",
    "city": "Khudāydād Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for walkability, healthcare, nightlife and mild climate.",
    "overview": "Experience Khudāydād Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khud%C4%81yd%C4%81d%20Kh%C4%93l%20skyline",
        "alt": "Khudāydād Khēl skyline",
        "caption": "Khudāydād Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khud%C4%81yd%C4%81d%20Kh%C4%93l%20street",
        "alt": "Khudāydād Khēl street scene",
        "caption": "An atmospheric look at Khudāydād Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khud%C4%81yd%C4%81d%20Kh%C4%93l%20lifestyle",
        "alt": "Khudāydād Khēl lifestyle",
        "caption": "Daily life and culture in Khudāydād Khēl."
      }
    ],
    "tags": [
      "walkability",
      "healthcare",
      "nightlife",
      "food"
    ]
  },
  {
    "slug": "khinj-n-af",
    "city": "Khinjān",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for food, digital nomad, expat-friendly and mild climate.",
    "overview": "Experience Khinjān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khinj%C4%81n%20skyline",
        "alt": "Khinjān skyline",
        "caption": "Khinjān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khinj%C4%81n%20street",
        "alt": "Khinjān street scene",
        "caption": "An atmospheric look at Khinjān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khinj%C4%81n%20lifestyle",
        "alt": "Khinjān lifestyle",
        "caption": "Daily life and culture in Khinjān."
      }
    ],
    "tags": [
      "food",
      "digital nomad",
      "expat-friendly",
      "mountains"
    ]
  },
  {
    "slug": "khinj-af",
    "city": "Khinj",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.5,
    "description": "A destination known for startup, walkability, coast and mild climate.",
    "overview": "Experience Khinj's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khinj%20skyline",
        "alt": "Khinj skyline",
        "caption": "Khinj cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khinj%20street",
        "alt": "Khinj street scene",
        "caption": "An atmospheric look at Khinj's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khinj%20lifestyle",
        "alt": "Khinj lifestyle",
        "caption": "Daily life and culture in Khinj."
      }
    ],
    "tags": [
      "startup",
      "walkability",
      "coast",
      "digital nomad"
    ]
  },
  {
    "slug": "kh-n-nesh-n-af",
    "city": "Khān Neshīn",
    "country": "AF",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for walkability, digital nomad, culture and mild climate.",
    "overview": "Experience Khān Neshīn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81n%20Nesh%C4%ABn%20skyline",
        "alt": "Khān Neshīn skyline",
        "caption": "Khān Neshīn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81n%20Nesh%C4%ABn%20street",
        "alt": "Khān Neshīn street scene",
        "caption": "An atmospheric look at Khān Neshīn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81n%20Nesh%C4%ABn%20lifestyle",
        "alt": "Khān Neshīn lifestyle",
        "caption": "Daily life and culture in Khān Neshīn."
      }
    ],
    "tags": [
      "walkability",
      "digital nomad",
      "culture",
      "mountains"
    ]
  },
  {
    "slug": "kh-naq-h-af",
    "city": "Khānaqāh",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for slow pace, island, climate and mild climate.",
    "overview": "Experience Khānaqāh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81naq%C4%81h%20skyline",
        "alt": "Khānaqāh skyline",
        "caption": "Khānaqāh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81naq%C4%81h%20street",
        "alt": "Khānaqāh street scene",
        "caption": "An atmospheric look at Khānaqāh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81naq%C4%81h%20lifestyle",
        "alt": "Khānaqāh lifestyle",
        "caption": "Daily life and culture in Khānaqāh."
      }
    ],
    "tags": [
      "slow pace",
      "island",
      "climate",
      "mountains"
    ]
  },
  {
    "slug": "chah-r-b-gh-af",
    "city": "Chahār Bāgh",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for beach, retirement, golf and mild climate.",
    "overview": "Experience Chahār Bāgh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20B%C4%81gh%20skyline",
        "alt": "Chahār Bāgh skyline",
        "caption": "Chahār Bāgh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20B%C4%81gh%20street",
        "alt": "Chahār Bāgh street scene",
        "caption": "An atmospheric look at Chahār Bāgh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20B%C4%81gh%20lifestyle",
        "alt": "Chahār Bāgh lifestyle",
        "caption": "Daily life and culture in Chahār Bāgh."
      }
    ],
    "tags": [
      "beach",
      "retirement",
      "golf",
      "food"
    ]
  },
  {
    "slug": "khand-d-af",
    "city": "Khandūd",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for digital nomad, mountains, safety and mild climate.",
    "overview": "Experience Khandūd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khand%C5%ABd%20skyline",
        "alt": "Khandūd skyline",
        "caption": "Khandūd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khand%C5%ABd%20street",
        "alt": "Khandūd street scene",
        "caption": "An atmospheric look at Khandūd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khand%C5%ABd%20lifestyle",
        "alt": "Khandūd lifestyle",
        "caption": "Daily life and culture in Khandūd."
      }
    ],
    "tags": [
      "digital nomad",
      "mountains",
      "safety",
      "island"
    ]
  },
  {
    "slug": "khanabad-af",
    "city": "Khanabad",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for digital nomad, golf, coast and mild climate.",
    "overview": "Experience Khanabad's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khanabad%20skyline",
        "alt": "Khanabad skyline",
        "caption": "Khanabad cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khanabad%20street",
        "alt": "Khanabad street scene",
        "caption": "An atmospheric look at Khanabad's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khanabad%20lifestyle",
        "alt": "Khanabad lifestyle",
        "caption": "Daily life and culture in Khanabad."
      }
    ],
    "tags": [
      "digital nomad",
      "golf",
      "coast",
      "walkability"
    ]
  },
  {
    "slug": "khamy-b-af",
    "city": "Khamyāb",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for budget, mountains, culture and mild climate.",
    "overview": "Experience Khamyāb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khamy%C4%81b%20skyline",
        "alt": "Khamyāb skyline",
        "caption": "Khamyāb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khamy%C4%81b%20street",
        "alt": "Khamyāb street scene",
        "caption": "An atmospheric look at Khamyāb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khamy%C4%81b%20lifestyle",
        "alt": "Khamyāb lifestyle",
        "caption": "Daily life and culture in Khamyāb."
      }
    ],
    "tags": [
      "budget",
      "mountains",
      "culture",
      "slow pace"
    ]
  },
  {
    "slug": "kh-kir-n-af",
    "city": "Khākirān",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for budget, wellness, safety and mild climate.",
    "overview": "Experience Khākirān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81kir%C4%81n%20skyline",
        "alt": "Khākirān skyline",
        "caption": "Khākirān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81kir%C4%81n%20street",
        "alt": "Khākirān street scene",
        "caption": "An atmospheric look at Khākirān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kh%C4%81kir%C4%81n%20lifestyle",
        "alt": "Khākirān lifestyle",
        "caption": "Daily life and culture in Khākirān."
      }
    ],
    "tags": [
      "budget",
      "wellness",
      "safety",
      "retirement"
    ]
  },
  {
    "slug": "kaz-h-ah-af",
    "city": "Kaz̲h̲ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for coast, lake, outdoor recreation and mild climate.",
    "overview": "Experience Kaz̲h̲ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kaz%CC%B2h%CC%B2ah%20skyline",
        "alt": "Kaz̲h̲ah skyline",
        "caption": "Kaz̲h̲ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kaz%CC%B2h%CC%B2ah%20street",
        "alt": "Kaz̲h̲ah street scene",
        "caption": "An atmospheric look at Kaz̲h̲ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kaz%CC%B2h%CC%B2ah%20lifestyle",
        "alt": "Kaz̲h̲ah lifestyle",
        "caption": "Daily life and culture in Kaz̲h̲ah."
      }
    ],
    "tags": [
      "coast",
      "lake",
      "outdoor recreation",
      "beach"
    ]
  },
  {
    "slug": "kishk-e-nakh-d-af",
    "city": "Kishk-e Nakhūd",
    "country": "AF",
    "emoji": "🌍",
    "match": 97,
    "description": "A destination known for mountains, culture, luxury and mild climate.",
    "overview": "Experience Kishk-e Nakhūd's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kishk-e%20Nakh%C5%ABd%20skyline",
        "alt": "Kishk-e Nakhūd skyline",
        "caption": "Kishk-e Nakhūd cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kishk-e%20Nakh%C5%ABd%20street",
        "alt": "Kishk-e Nakhūd street scene",
        "caption": "An atmospheric look at Kishk-e Nakhūd's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kishk-e%20Nakh%C5%ABd%20lifestyle",
        "alt": "Kishk-e Nakhūd lifestyle",
        "caption": "Daily life and culture in Kishk-e Nakhūd."
      }
    ],
    "tags": [
      "mountains",
      "culture",
      "luxury",
      "digital nomad"
    ]
  },
  {
    "slug": "karukh-af",
    "city": "Karukh",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.5,
    "description": "A destination known for food, family, digital nomad and mild climate.",
    "overview": "Experience Karukh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Karukh%20skyline",
        "alt": "Karukh skyline",
        "caption": "Karukh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Karukh%20street",
        "alt": "Karukh street scene",
        "caption": "An atmospheric look at Karukh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Karukh%20lifestyle",
        "alt": "Karukh lifestyle",
        "caption": "Daily life and culture in Karukh."
      }
    ],
    "tags": [
      "food",
      "family",
      "digital nomad",
      "history"
    ]
  },
  {
    "slug": "kan-ay-af",
    "city": "Kanḏay",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.6,
    "description": "A destination known for luxury, wellness, nightlife and mild climate.",
    "overview": "Experience Kanḏay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kan%E1%B8%8Fay%20skyline",
        "alt": "Kanḏay skyline",
        "caption": "Kanḏay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kan%E1%B8%8Fay%20street",
        "alt": "Kanḏay street scene",
        "caption": "An atmospheric look at Kanḏay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kan%E1%B8%8Fay%20lifestyle",
        "alt": "Kanḏay lifestyle",
        "caption": "Daily life and culture in Kanḏay."
      }
    ],
    "tags": [
      "luxury",
      "wellness",
      "nightlife",
      "walkability"
    ]
  },
  {
    "slug": "kandah-r-af",
    "city": "Kandahār",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for budget, nightlife, lake and mild climate.",
    "overview": "Experience Kandahār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kandah%C4%81r%20skyline",
        "alt": "Kandahār skyline",
        "caption": "Kandahār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kandah%C4%81r%20street",
        "alt": "Kandahār street scene",
        "caption": "An atmospheric look at Kandahār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kandah%C4%81r%20lifestyle",
        "alt": "Kandahār lifestyle",
        "caption": "Daily life and culture in Kandahār."
      }
    ],
    "tags": [
      "budget",
      "nightlife",
      "lake",
      "food"
    ]
  },
  {
    "slug": "kal-n-deh-af",
    "city": "Kalān Deh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.1,
    "description": "A destination known for nightlife, climate, island and mild climate.",
    "overview": "Experience Kalān Deh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kal%C4%81n%20Deh%20skyline",
        "alt": "Kalān Deh skyline",
        "caption": "Kalān Deh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kal%C4%81n%20Deh%20street",
        "alt": "Kalān Deh street scene",
        "caption": "An atmospheric look at Kalān Deh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kal%C4%81n%20Deh%20lifestyle",
        "alt": "Kalān Deh lifestyle",
        "caption": "Daily life and culture in Kalān Deh."
      }
    ],
    "tags": [
      "nightlife",
      "climate",
      "island",
      "retirement"
    ]
  },
  {
    "slug": "kalak-n-af",
    "city": "Kalakān",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for climate, wellness, culture and mild climate.",
    "overview": "Experience Kalakān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kalak%C4%81n%20skyline",
        "alt": "Kalakān skyline",
        "caption": "Kalakān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalak%C4%81n%20street",
        "alt": "Kalakān street scene",
        "caption": "An atmospheric look at Kalakān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalak%C4%81n%20lifestyle",
        "alt": "Kalakān lifestyle",
        "caption": "Daily life and culture in Kalakān."
      }
    ],
    "tags": [
      "climate",
      "wellness",
      "culture",
      "history"
    ]
  },
  {
    "slug": "kalafg-n-af",
    "city": "Kalafgān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.7,
    "description": "A destination known for retirement, nightlife, history and mild climate.",
    "overview": "Experience Kalafgān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kalafg%C4%81n%20skyline",
        "alt": "Kalafgān skyline",
        "caption": "Kalafgān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalafg%C4%81n%20street",
        "alt": "Kalafgān street scene",
        "caption": "An atmospheric look at Kalafgān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kalafg%C4%81n%20lifestyle",
        "alt": "Kalafgān lifestyle",
        "caption": "Daily life and culture in Kalafgān."
      }
    ],
    "tags": [
      "retirement",
      "nightlife",
      "history",
      "slow pace"
    ]
  },
  {
    "slug": "kajr-n-af",
    "city": "Kajrān",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for nightlife, golf, walkability and mild climate.",
    "overview": "Experience Kajrān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kajr%C4%81n%20skyline",
        "alt": "Kajrān skyline",
        "caption": "Kajrān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kajr%C4%81n%20street",
        "alt": "Kajrān street scene",
        "caption": "An atmospheric look at Kajrān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kajr%C4%81n%20lifestyle",
        "alt": "Kajrān lifestyle",
        "caption": "Daily life and culture in Kajrān."
      }
    ],
    "tags": [
      "nightlife",
      "golf",
      "walkability",
      "arts"
    ]
  },
  {
    "slug": "k-af",
    "city": "Kā’ī",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for food, lake, climate and mild climate.",
    "overview": "Experience Kā’ī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?K%C4%81%E2%80%99%C4%AB%20skyline",
        "alt": "Kā’ī skyline",
        "caption": "Kā’ī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?K%C4%81%E2%80%99%C4%AB%20street",
        "alt": "Kā’ī street scene",
        "caption": "An atmospheric look at Kā’ī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?K%C4%81%E2%80%99%C4%AB%20lifestyle",
        "alt": "Kā’ī lifestyle",
        "caption": "Daily life and culture in Kā’ī."
      }
    ],
    "tags": [
      "food",
      "lake",
      "climate",
      "golf"
    ]
  },
  {
    "slug": "kabul-af",
    "city": "Kabul",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for wellness, startup, culture and mild climate.",
    "overview": "Experience Kabul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kabul%20skyline",
        "alt": "Kabul skyline",
        "caption": "Kabul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kabul%20street",
        "alt": "Kabul street scene",
        "caption": "An atmospheric look at Kabul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kabul%20lifestyle",
        "alt": "Kabul lifestyle",
        "caption": "Daily life and culture in Kabul."
      }
    ],
    "tags": [
      "wellness",
      "startup",
      "culture",
      "nature"
    ]
  },
  {
    "slug": "jurm-af",
    "city": "Jurm",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.9,
    "description": "A destination known for digital nomad, island, coast and mild climate.",
    "overview": "Experience Jurm's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jurm%20skyline",
        "alt": "Jurm skyline",
        "caption": "Jurm cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jurm%20street",
        "alt": "Jurm street scene",
        "caption": "An atmospheric look at Jurm's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jurm%20lifestyle",
        "alt": "Jurm lifestyle",
        "caption": "Daily life and culture in Jurm."
      }
    ],
    "tags": [
      "digital nomad",
      "island",
      "coast",
      "beach"
    ]
  },
  {
    "slug": "jawand-af",
    "city": "Jawand",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.2,
    "description": "A destination known for arts, history, digital nomad and mild climate.",
    "overview": "Experience Jawand's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jawand%20skyline",
        "alt": "Jawand skyline",
        "caption": "Jawand cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jawand%20street",
        "alt": "Jawand street scene",
        "caption": "An atmospheric look at Jawand's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jawand%20lifestyle",
        "alt": "Jawand lifestyle",
        "caption": "Daily life and culture in Jawand."
      }
    ],
    "tags": [
      "arts",
      "history",
      "digital nomad",
      "expat-friendly"
    ]
  },
  {
    "slug": "j-n-kh-l-af",
    "city": "Jānī Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.3,
    "description": "A destination known for island, culture, healthcare and mild climate.",
    "overview": "Experience Jānī Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?J%C4%81n%C4%AB%20Kh%C4%93l%20skyline",
        "alt": "Jānī Khēl skyline",
        "caption": "Jānī Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?J%C4%81n%C4%AB%20Kh%C4%93l%20street",
        "alt": "Jānī Khēl street scene",
        "caption": "An atmospheric look at Jānī Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?J%C4%81n%C4%AB%20Kh%C4%93l%20lifestyle",
        "alt": "Jānī Khēl lifestyle",
        "caption": "Daily life and culture in Jānī Khēl."
      }
    ],
    "tags": [
      "island",
      "culture",
      "healthcare",
      "family"
    ]
  },
  {
    "slug": "jalr-z-af",
    "city": "Jalrēz",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for healthcare, retirement, climate and mild climate.",
    "overview": "Experience Jalrēz's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jalr%C4%93z%20skyline",
        "alt": "Jalrēz skyline",
        "caption": "Jalrēz cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jalr%C4%93z%20street",
        "alt": "Jalrēz street scene",
        "caption": "An atmospheric look at Jalrēz's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jalr%C4%93z%20lifestyle",
        "alt": "Jalrēz lifestyle",
        "caption": "Daily life and culture in Jalrēz."
      }
    ],
    "tags": [
      "healthcare",
      "retirement",
      "climate",
      "island"
    ]
  },
  {
    "slug": "jal-l-b-d-af",
    "city": "Jalālābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for retirement, food, startup and mild climate.",
    "overview": "Experience Jalālābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jal%C4%81l%C4%81b%C4%81d%20skyline",
        "alt": "Jalālābād skyline",
        "caption": "Jalālābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jal%C4%81l%C4%81b%C4%81d%20street",
        "alt": "Jalālābād street scene",
        "caption": "An atmospheric look at Jalālābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jal%C4%81l%C4%81b%C4%81d%20lifestyle",
        "alt": "Jalālābād lifestyle",
        "caption": "Daily life and culture in Jalālābād."
      }
    ],
    "tags": [
      "retirement",
      "food",
      "startup",
      "luxury"
    ]
  },
  {
    "slug": "jabal-os-saraj-af",
    "city": "Jabal os Saraj",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for slow pace, climate, healthcare and mild climate.",
    "overview": "Experience Jabal os Saraj's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jabal%20os%20Saraj%20skyline",
        "alt": "Jabal os Saraj skyline",
        "caption": "Jabal os Saraj cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jabal%20os%20Saraj%20street",
        "alt": "Jabal os Saraj street scene",
        "caption": "An atmospheric look at Jabal os Saraj's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jabal%20os%20Saraj%20lifestyle",
        "alt": "Jabal os Saraj lifestyle",
        "caption": "Daily life and culture in Jabal os Saraj."
      }
    ],
    "tags": [
      "slow pace",
      "climate",
      "healthcare",
      "outdoor recreation"
    ]
  },
  {
    "slug": "uk-mat-e-sh-nka-af",
    "city": "Ḩukūmat-e Shīnkaī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for island, food, history and mild climate.",
    "overview": "Experience Ḩukūmat-e Shīnkaī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20Sh%C4%ABnka%C4%AB%20skyline",
        "alt": "Ḩukūmat-e Shīnkaī skyline",
        "caption": "Ḩukūmat-e Shīnkaī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20Sh%C4%ABnka%C4%AB%20street",
        "alt": "Ḩukūmat-e Shīnkaī street scene",
        "caption": "An atmospheric look at Ḩukūmat-e Shīnkaī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat-e%20Sh%C4%ABnka%C4%AB%20lifestyle",
        "alt": "Ḩukūmat-e Shīnkaī lifestyle",
        "caption": "Daily life and culture in Ḩukūmat-e Shīnkaī."
      }
    ],
    "tags": [
      "island",
      "food",
      "history",
      "slow pace"
    ]
  },
  {
    "slug": "her-t-af",
    "city": "Herāt",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.2,
    "description": "A destination known for golf, eco, history and mild climate.",
    "overview": "Experience Herāt's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Her%C4%81t%20skyline",
        "alt": "Herāt skyline",
        "caption": "Herāt cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Her%C4%81t%20street",
        "alt": "Herāt street scene",
        "caption": "An atmospheric look at Herāt's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Her%C4%81t%20lifestyle",
        "alt": "Herāt lifestyle",
        "caption": "Daily life and culture in Herāt."
      }
    ],
    "tags": [
      "golf",
      "eco",
      "history",
      "lake"
    ]
  },
  {
    "slug": "j-kh-l-af",
    "city": "Ḩājī Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.2,
    "description": "A destination known for family, arts, startup and mild climate.",
    "overview": "Experience Ḩājī Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81j%C4%AB%20Kh%C4%93l%20skyline",
        "alt": "Ḩājī Khēl skyline",
        "caption": "Ḩājī Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81j%C4%AB%20Kh%C4%93l%20street",
        "alt": "Ḩājī Khēl street scene",
        "caption": "An atmospheric look at Ḩājī Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81j%C4%AB%20Kh%C4%93l%20lifestyle",
        "alt": "Ḩājī Khēl lifestyle",
        "caption": "Daily life and culture in Ḩājī Khēl."
      }
    ],
    "tags": [
      "family",
      "arts",
      "startup",
      "nature"
    ]
  },
  {
    "slug": "fiz-moghul-af",
    "city": "Ḩāfiz̧ Moghul",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for expat-friendly, nature, digital nomad and mild climate.",
    "overview": "Experience Ḩāfiz̧ Moghul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%20Moghul%20skyline",
        "alt": "Ḩāfiz̧ Moghul skyline",
        "caption": "Ḩāfiz̧ Moghul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%20Moghul%20street",
        "alt": "Ḩāfiz̧ Moghul street scene",
        "caption": "An atmospheric look at Ḩāfiz̧ Moghul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%20Moghul%20lifestyle",
        "alt": "Ḩāfiz̧ Moghul lifestyle",
        "caption": "Daily life and culture in Ḩāfiz̧ Moghul."
      }
    ],
    "tags": [
      "expat-friendly",
      "nature",
      "digital nomad",
      "beach"
    ]
  },
  {
    "slug": "fiz-n-af",
    "city": "Ḩāfiz̧ān",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for safety, food, culture and mild climate.",
    "overview": "Experience Ḩāfiz̧ān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%C4%81n%20skyline",
        "alt": "Ḩāfiz̧ān skyline",
        "caption": "Ḩāfiz̧ān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%C4%81n%20street",
        "alt": "Ḩāfiz̧ān street scene",
        "caption": "An atmospheric look at Ḩāfiz̧ān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8%C4%81fiz%CC%A7%C4%81n%20lifestyle",
        "alt": "Ḩāfiz̧ān lifestyle",
        "caption": "Daily life and culture in Ḩāfiz̧ān."
      }
    ],
    "tags": [
      "safety",
      "food",
      "culture",
      "mountains"
    ]
  },
  {
    "slug": "guz-arah-af",
    "city": "Guz̄arah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for climate, budget, healthcare and mild climate.",
    "overview": "Experience Guz̄arah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Guz%CC%84arah%20skyline",
        "alt": "Guz̄arah skyline",
        "caption": "Guz̄arah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Guz%CC%84arah%20street",
        "alt": "Guz̄arah street scene",
        "caption": "An atmospheric look at Guz̄arah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Guz%CC%84arah%20lifestyle",
        "alt": "Guz̄arah lifestyle",
        "caption": "Daily life and culture in Guz̄arah."
      }
    ],
    "tags": [
      "climate",
      "budget",
      "healthcare",
      "beach"
    ]
  },
  {
    "slug": "g-shtah-af",
    "city": "Gōshtah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94,
    "description": "A destination known for walkability, golf, beach and mild climate.",
    "overview": "Experience Gōshtah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dshtah%20skyline",
        "alt": "Gōshtah skyline",
        "caption": "Gōshtah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dshtah%20street",
        "alt": "Gōshtah street scene",
        "caption": "An atmospheric look at Gōshtah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dshtah%20lifestyle",
        "alt": "Gōshtah lifestyle",
        "caption": "Daily life and culture in Gōshtah."
      }
    ],
    "tags": [
      "walkability",
      "golf",
      "beach",
      "history"
    ]
  },
  {
    "slug": "g-mal-k-lay-af",
    "city": "Gōmal Kêlay",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for retirement, safety, island and mild climate.",
    "overview": "Experience Gōmal Kêlay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dmal%20K%C3%AAlay%20skyline",
        "alt": "Gōmal Kêlay skyline",
        "caption": "Gōmal Kêlay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dmal%20K%C3%AAlay%20street",
        "alt": "Gōmal Kêlay street scene",
        "caption": "An atmospheric look at Gōmal Kêlay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?G%C5%8Dmal%20K%C3%AAlay%20lifestyle",
        "alt": "Gōmal Kêlay lifestyle",
        "caption": "Daily life and culture in Gōmal Kêlay."
      }
    ],
    "tags": [
      "retirement",
      "safety",
      "island",
      "beach"
    ]
  },
  {
    "slug": "al-qahd-r-g-l-n-af",
    "city": "‘Alāqahdārī Gēlān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for lake, history, retirement and mild climate.",
    "overview": "Experience ‘Alāqahdārī Gēlān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20G%C4%93l%C4%81n%20skyline",
        "alt": "‘Alāqahdārī Gēlān skyline",
        "caption": "‘Alāqahdārī Gēlān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20G%C4%93l%C4%81n%20street",
        "alt": "‘Alāqahdārī Gēlān street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Gēlān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20G%C4%93l%C4%81n%20lifestyle",
        "alt": "‘Alāqahdārī Gēlān lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Gēlān."
      }
    ],
    "tags": [
      "lake",
      "history",
      "retirement",
      "climate"
    ]
  },
  {
    "slug": "gh-riy-n-af",
    "city": "Ghōriyān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.2,
    "description": "A destination known for nightlife, food, coast and mild climate.",
    "overview": "Experience Ghōriyān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Gh%C5%8Driy%C4%81n%20skyline",
        "alt": "Ghōriyān skyline",
        "caption": "Ghōriyān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gh%C5%8Driy%C4%81n%20street",
        "alt": "Ghōriyān street scene",
        "caption": "An atmospheric look at Ghōriyān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gh%C5%8Driy%C4%81n%20lifestyle",
        "alt": "Ghōriyān lifestyle",
        "caption": "Daily life and culture in Ghōriyān."
      }
    ],
    "tags": [
      "nightlife",
      "food",
      "coast",
      "healthcare"
    ]
  },
  {
    "slug": "ghormach-af",
    "city": "Ghormach",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for budget, island, family and mild climate.",
    "overview": "Experience Ghormach's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ghormach%20skyline",
        "alt": "Ghormach skyline",
        "caption": "Ghormach cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghormach%20street",
        "alt": "Ghormach street scene",
        "caption": "An atmospheric look at Ghormach's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghormach%20lifestyle",
        "alt": "Ghormach lifestyle",
        "caption": "Daily life and culture in Ghormach."
      }
    ],
    "tags": [
      "budget",
      "island",
      "family",
      "wellness"
    ]
  },
  {
    "slug": "ghurayd-gharam-af",
    "city": "Ghurayd Gharamē",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for golf, history, expat-friendly and mild climate.",
    "overview": "Experience Ghurayd Gharamē's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ghurayd%20Gharam%C4%93%20skyline",
        "alt": "Ghurayd Gharamē skyline",
        "caption": "Ghurayd Gharamē cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghurayd%20Gharam%C4%93%20street",
        "alt": "Ghurayd Gharamē street scene",
        "caption": "An atmospheric look at Ghurayd Gharamē's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghurayd%20Gharam%C4%93%20lifestyle",
        "alt": "Ghurayd Gharamē lifestyle",
        "caption": "Daily life and culture in Ghurayd Gharamē."
      }
    ],
    "tags": [
      "golf",
      "history",
      "expat-friendly",
      "budget"
    ]
  },
  {
    "slug": "ghazni-af",
    "city": "Ghazni",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.4,
    "description": "A destination known for budget, coast, wellness and mild climate.",
    "overview": "Experience Ghazni's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ghazni%20skyline",
        "alt": "Ghazni skyline",
        "caption": "Ghazni cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghazni%20street",
        "alt": "Ghazni street scene",
        "caption": "An atmospheric look at Ghazni's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghazni%20lifestyle",
        "alt": "Ghazni lifestyle",
        "caption": "Daily life and culture in Ghazni."
      }
    ],
    "tags": [
      "budget",
      "coast",
      "wellness",
      "expat-friendly"
    ]
  },
  {
    "slug": "gereshk-af",
    "city": "Gereshk",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.2,
    "description": "A destination known for safety, coast, golf and mild climate.",
    "overview": "Experience Gereshk's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Gereshk%20skyline",
        "alt": "Gereshk skyline",
        "caption": "Gereshk cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gereshk%20street",
        "alt": "Gereshk street scene",
        "caption": "An atmospheric look at Gereshk's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gereshk%20lifestyle",
        "alt": "Gereshk lifestyle",
        "caption": "Daily life and culture in Gereshk."
      }
    ],
    "tags": [
      "safety",
      "coast",
      "golf",
      "family"
    ]
  },
  {
    "slug": "gardez-af",
    "city": "Gardez",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for startup, coast, expat-friendly and mild climate.",
    "overview": "Experience Gardez's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Gardez%20skyline",
        "alt": "Gardez skyline",
        "caption": "Gardez cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gardez%20street",
        "alt": "Gardez street scene",
        "caption": "An atmospheric look at Gardez's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Gardez%20lifestyle",
        "alt": "Gardez lifestyle",
        "caption": "Daily life and culture in Gardez."
      }
    ],
    "tags": [
      "startup",
      "coast",
      "expat-friendly",
      "island"
    ]
  },
  {
    "slug": "fayzabad-af",
    "city": "Fayzabad",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for outdoor recreation, digital nomad, family and mild climate.",
    "overview": "Experience Fayzabad's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Fayzabad%20skyline",
        "alt": "Fayzabad skyline",
        "caption": "Fayzabad cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fayzabad%20street",
        "alt": "Fayzabad street scene",
        "caption": "An atmospheric look at Fayzabad's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fayzabad%20lifestyle",
        "alt": "Fayzabad lifestyle",
        "caption": "Daily life and culture in Fayzabad."
      }
    ],
    "tags": [
      "outdoor recreation",
      "digital nomad",
      "family",
      "wellness"
    ]
  },
  {
    "slug": "fa-b-d-af",
    "city": "Faīẕābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for mountains, food, coast and mild climate.",
    "overview": "Experience Faīẕābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Fa%C4%AB%E1%BA%95%C4%81b%C4%81d%20skyline",
        "alt": "Faīẕābād skyline",
        "caption": "Faīẕābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fa%C4%AB%E1%BA%95%C4%81b%C4%81d%20street",
        "alt": "Faīẕābād street scene",
        "caption": "An atmospheric look at Faīẕābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fa%C4%AB%E1%BA%95%C4%81b%C4%81d%20lifestyle",
        "alt": "Faīẕābād lifestyle",
        "caption": "Daily life and culture in Faīẕābād."
      }
    ],
    "tags": [
      "mountains",
      "food",
      "coast",
      "nightlife"
    ]
  },
  {
    "slug": "fay-b-d-af",
    "city": "Fayẕābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for climate, beach, budget and mild climate.",
    "overview": "Experience Fayẕābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Fay%E1%BA%95%C4%81b%C4%81d%20skyline",
        "alt": "Fayẕābād skyline",
        "caption": "Fayẕābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fay%E1%BA%95%C4%81b%C4%81d%20street",
        "alt": "Fayẕābād street scene",
        "caption": "An atmospheric look at Fayẕābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fay%E1%BA%95%C4%81b%C4%81d%20lifestyle",
        "alt": "Fayẕābād lifestyle",
        "caption": "Daily life and culture in Fayẕābād."
      }
    ],
    "tags": [
      "climate",
      "beach",
      "budget",
      "nature"
    ]
  },
  {
    "slug": "qal-ah-ye-f-rs-af",
    "city": "Qal‘ah-ye Fārsī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for arts, digital nomad, nature and mild climate.",
    "overview": "Experience Qal‘ah-ye Fārsī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20F%C4%81rs%C4%AB%20skyline",
        "alt": "Qal‘ah-ye Fārsī skyline",
        "caption": "Qal‘ah-ye Fārsī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20F%C4%81rs%C4%AB%20street",
        "alt": "Qal‘ah-ye Fārsī street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Fārsī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20F%C4%81rs%C4%AB%20lifestyle",
        "alt": "Qal‘ah-ye Fārsī lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Fārsī."
      }
    ],
    "tags": [
      "arts",
      "digital nomad",
      "nature",
      "island"
    ]
  },
  {
    "slug": "farkh-r-af",
    "city": "Farkhār",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for nightlife, food, family and mild climate.",
    "overview": "Experience Farkhār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Farkh%C4%81r%20skyline",
        "alt": "Farkhār skyline",
        "caption": "Farkhār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farkh%C4%81r%20street",
        "alt": "Farkhār street scene",
        "caption": "An atmospheric look at Farkhār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farkh%C4%81r%20lifestyle",
        "alt": "Farkhār lifestyle",
        "caption": "Daily life and culture in Farkhār."
      }
    ],
    "tags": [
      "nightlife",
      "food",
      "family",
      "retirement"
    ]
  },
  {
    "slug": "farah-af",
    "city": "Farah",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for safety, nature, family and mild climate.",
    "overview": "Experience Farah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Farah%20skyline",
        "alt": "Farah skyline",
        "caption": "Farah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farah%20street",
        "alt": "Farah street scene",
        "caption": "An atmospheric look at Farah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farah%20lifestyle",
        "alt": "Farah lifestyle",
        "caption": "Daily life and culture in Farah."
      }
    ],
    "tags": [
      "safety",
      "nature",
      "family",
      "retirement"
    ]
  },
  {
    "slug": "ist-lif-af",
    "city": "Istālif",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.1,
    "description": "A destination known for retirement, walkability, beach and mild climate.",
    "overview": "Experience Istālif's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ist%C4%81lif%20skyline",
        "alt": "Istālif skyline",
        "caption": "Istālif cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ist%C4%81lif%20street",
        "alt": "Istālif street scene",
        "caption": "An atmospheric look at Istālif's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ist%C4%81lif%20lifestyle",
        "alt": "Istālif lifestyle",
        "caption": "Daily life and culture in Istālif."
      }
    ],
    "tags": [
      "retirement",
      "walkability",
      "beach",
      "culture"
    ]
  },
  {
    "slug": "eslam-qaleh-af",
    "city": "Eslam Qaleh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for startup, island, expat-friendly and mild climate.",
    "overview": "Experience Eslam Qaleh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Eslam%20Qaleh%20skyline",
        "alt": "Eslam Qaleh skyline",
        "caption": "Eslam Qaleh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Eslam%20Qaleh%20street",
        "alt": "Eslam Qaleh street scene",
        "caption": "An atmospheric look at Eslam Qaleh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Eslam%20Qaleh%20lifestyle",
        "alt": "Eslam Qaleh lifestyle",
        "caption": "Daily life and culture in Eslam Qaleh."
      }
    ],
    "tags": [
      "startup",
      "island",
      "expat-friendly",
      "food"
    ]
  },
  {
    "slug": "isl-m-chumgar-af",
    "city": "Islām Chumgar",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.9,
    "description": "A destination known for nature, eco, food and mild climate.",
    "overview": "Experience Islām Chumgar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Isl%C4%81m%20Chumgar%20skyline",
        "alt": "Islām Chumgar skyline",
        "caption": "Islām Chumgar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Isl%C4%81m%20Chumgar%20street",
        "alt": "Islām Chumgar street scene",
        "caption": "An atmospheric look at Islām Chumgar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Isl%C4%81m%20Chumgar%20lifestyle",
        "alt": "Islām Chumgar lifestyle",
        "caption": "Daily life and culture in Islām Chumgar."
      }
    ],
    "tags": [
      "nature",
      "eco",
      "food",
      "coast"
    ]
  },
  {
    "slug": "inj-l-af",
    "city": "Injīl",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for arts, beach, history and mild climate.",
    "overview": "Experience Injīl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Inj%C4%ABl%20skyline",
        "alt": "Injīl skyline",
        "caption": "Injīl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Inj%C4%ABl%20street",
        "alt": "Injīl street scene",
        "caption": "An atmospheric look at Injīl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Inj%C4%ABl%20lifestyle",
        "alt": "Injīl lifestyle",
        "caption": "Daily life and culture in Injīl."
      }
    ],
    "tags": [
      "arts",
      "beach",
      "history",
      "expat-friendly"
    ]
  },
  {
    "slug": "im-m-ib-af",
    "city": "Imām Şāḩib",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for family, slow pace, history and mild climate.",
    "overview": "Experience Imām Şāḩib's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Im%C4%81m%20%C5%9E%C4%81%E1%B8%A9ib%20skyline",
        "alt": "Imām Şāḩib skyline",
        "caption": "Imām Şāḩib cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Im%C4%81m%20%C5%9E%C4%81%E1%B8%A9ib%20street",
        "alt": "Imām Şāḩib street scene",
        "caption": "An atmospheric look at Imām Şāḩib's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Im%C4%81m%20%C5%9E%C4%81%E1%B8%A9ib%20lifestyle",
        "alt": "Imām Şāḩib lifestyle",
        "caption": "Daily life and culture in Imām Şāḩib."
      }
    ],
    "tags": [
      "family",
      "slow pace",
      "history",
      "expat-friendly"
    ]
  },
  {
    "slug": "d-sh-af",
    "city": "Dōshī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for family, golf, digital nomad and mild climate.",
    "overview": "Experience Dōshī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C5%8Dsh%C4%AB%20skyline",
        "alt": "Dōshī skyline",
        "caption": "Dōshī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%8Dsh%C4%AB%20street",
        "alt": "Dōshī street scene",
        "caption": "An atmospheric look at Dōshī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%8Dsh%C4%AB%20lifestyle",
        "alt": "Dōshī lifestyle",
        "caption": "Daily life and culture in Dōshī."
      }
    ],
    "tags": [
      "family",
      "golf",
      "digital nomad",
      "climate"
    ]
  },
  {
    "slug": "dowlaty-r-af",
    "city": "Dowlatyār",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.6,
    "description": "A destination known for nature, nightlife, walkability and mild climate.",
    "overview": "Experience Dowlatyār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dowlaty%C4%81r%20skyline",
        "alt": "Dowlatyār skyline",
        "caption": "Dowlatyār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlaty%C4%81r%20street",
        "alt": "Dowlatyār street scene",
        "caption": "An atmospheric look at Dowlatyār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlaty%C4%81r%20lifestyle",
        "alt": "Dowlatyār lifestyle",
        "caption": "Daily life and culture in Dowlatyār."
      }
    ],
    "tags": [
      "nature",
      "nightlife",
      "walkability",
      "slow pace"
    ]
  },
  {
    "slug": "dowlat-sh-h-af",
    "city": "Dowlat Shāh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.7,
    "description": "A destination known for mountains, coast, wellness and mild climate.",
    "overview": "Experience Dowlat Shāh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%20Sh%C4%81h%20skyline",
        "alt": "Dowlat Shāh skyline",
        "caption": "Dowlat Shāh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%20Sh%C4%81h%20street",
        "alt": "Dowlat Shāh street scene",
        "caption": "An atmospheric look at Dowlat Shāh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%20Sh%C4%81h%20lifestyle",
        "alt": "Dowlat Shāh lifestyle",
        "caption": "Daily life and culture in Dowlat Shāh."
      }
    ],
    "tags": [
      "mountains",
      "coast",
      "wellness",
      "digital nomad"
    ]
  },
  {
    "slug": "dowlat-b-d-af",
    "city": "Dowlatābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.5,
    "description": "A destination known for retirement, digital nomad, walkability and mild climate.",
    "overview": "Experience Dowlatābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%C4%81b%C4%81d%20skyline",
        "alt": "Dowlatābād skyline",
        "caption": "Dowlatābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%C4%81b%C4%81d%20street",
        "alt": "Dowlatābād street scene",
        "caption": "An atmospheric look at Dowlatābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowlat%C4%81b%C4%81d%20lifestyle",
        "alt": "Dowlatābād lifestyle",
        "caption": "Daily life and culture in Dowlatābād."
      }
    ],
    "tags": [
      "retirement",
      "digital nomad",
      "walkability",
      "food"
    ]
  },
  {
    "slug": "d-qal-ah-af",
    "city": "Dū Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for nightlife, safety, digital nomad and mild climate.",
    "overview": "Experience Dū Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20Qal%E2%80%98ah%20skyline",
        "alt": "Dū Qal‘ah skyline",
        "caption": "Dū Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20Qal%E2%80%98ah%20street",
        "alt": "Dū Qal‘ah street scene",
        "caption": "An atmospheric look at Dū Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Dū Qal‘ah lifestyle",
        "caption": "Daily life and culture in Dū Qal‘ah."
      }
    ],
    "tags": [
      "nightlife",
      "safety",
      "digital nomad",
      "eco"
    ]
  },
  {
    "slug": "d-b-af",
    "city": "Dūāb",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.1,
    "description": "A destination known for island, mountains, slow pace and mild climate.",
    "overview": "Experience Dūāb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%C4%81b%20skyline",
        "alt": "Dūāb skyline",
        "caption": "Dūāb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%C4%81b%20street",
        "alt": "Dūāb street scene",
        "caption": "An atmospheric look at Dūāb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%C4%81b%20lifestyle",
        "alt": "Dūāb lifestyle",
        "caption": "Daily life and culture in Dūāb."
      }
    ],
    "tags": [
      "island",
      "mountains",
      "slow pace",
      "walkability"
    ]
  },
  {
    "slug": "d-n-rkh-l-k-lay-af",
    "city": "Dê Nārkhēl Kêlay",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.1,
    "description": "A destination known for retirement, mountains, coast and mild climate.",
    "overview": "Experience Dê Nārkhēl Kêlay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C3%AA%20N%C4%81rkh%C4%93l%20K%C3%AAlay%20skyline",
        "alt": "Dê Nārkhēl Kêlay skyline",
        "caption": "Dê Nārkhēl Kêlay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C3%AA%20N%C4%81rkh%C4%93l%20K%C3%AAlay%20street",
        "alt": "Dê Nārkhēl Kêlay street scene",
        "caption": "An atmospheric look at Dê Nārkhēl Kêlay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C3%AA%20N%C4%81rkh%C4%93l%20K%C3%AAlay%20lifestyle",
        "alt": "Dê Nārkhēl Kêlay lifestyle",
        "caption": "Daily life and culture in Dê Nārkhēl Kêlay."
      }
    ],
    "tags": [
      "retirement",
      "mountains",
      "coast",
      "wellness"
    ]
  },
  {
    "slug": "deh-af",
    "city": "Dehī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.4,
    "description": "A destination known for family, outdoor recreation, retirement and mild climate.",
    "overview": "Experience Dehī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Deh%C4%AB%20skyline",
        "alt": "Dehī skyline",
        "caption": "Dehī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh%C4%AB%20street",
        "alt": "Dehī street scene",
        "caption": "An atmospheric look at Dehī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh%C4%AB%20lifestyle",
        "alt": "Dehī lifestyle",
        "caption": "Daily life and culture in Dehī."
      }
    ],
    "tags": [
      "family",
      "outdoor recreation",
      "retirement",
      "walkability"
    ]
  },
  {
    "slug": "deh-e-al-af",
    "city": "Deh-e Şalāḩ",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.7,
    "description": "A destination known for nature, safety, climate and mild climate.",
    "overview": "Experience Deh-e Şalāḩ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20%C5%9Eal%C4%81%E1%B8%A9%20skyline",
        "alt": "Deh-e Şalāḩ skyline",
        "caption": "Deh-e Şalāḩ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20%C5%9Eal%C4%81%E1%B8%A9%20street",
        "alt": "Deh-e Şalāḩ street scene",
        "caption": "An atmospheric look at Deh-e Şalāḩ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20%C5%9Eal%C4%81%E1%B8%A9%20lifestyle",
        "alt": "Deh-e Şalāḩ lifestyle",
        "caption": "Daily life and culture in Deh-e Şalāḩ."
      }
    ],
    "tags": [
      "nature",
      "safety",
      "climate",
      "slow pace"
    ]
  },
  {
    "slug": "deh-e-now-af",
    "city": "Deh-e Now",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for mountains, culture, family and mild climate.",
    "overview": "Experience Deh-e Now's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20Now%20skyline",
        "alt": "Deh-e Now skyline",
        "caption": "Deh-e Now cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20Now%20street",
        "alt": "Deh-e Now street scene",
        "caption": "An atmospheric look at Deh-e Now's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Deh-e%20Now%20lifestyle",
        "alt": "Deh-e Now lifestyle",
        "caption": "Daily life and culture in Deh-e Now."
      }
    ],
    "tags": [
      "mountains",
      "culture",
      "family",
      "digital nomad"
    ]
  },
  {
    "slug": "dehd-d-af",
    "city": "Dehdādī",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for coast, golf, nightlife and mild climate.",
    "overview": "Experience Dehdādī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dehd%C4%81d%C4%AB%20skyline",
        "alt": "Dehdādī skyline",
        "caption": "Dehdādī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dehd%C4%81d%C4%AB%20street",
        "alt": "Dehdādī street scene",
        "caption": "An atmospheric look at Dehdādī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dehd%C4%81d%C4%AB%20lifestyle",
        "alt": "Dehdādī lifestyle",
        "caption": "Daily life and culture in Dehdādī."
      }
    ],
    "tags": [
      "coast",
      "golf",
      "nightlife",
      "culture"
    ]
  },
  {
    "slug": "dwah-man-ay-af",
    "city": "Dwah Manḏay",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.8,
    "description": "A destination known for coast, walkability, history and mild climate.",
    "overview": "Experience Dwah Manḏay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dwah%20Man%E1%B8%8Fay%20skyline",
        "alt": "Dwah Manḏay skyline",
        "caption": "Dwah Manḏay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dwah%20Man%E1%B8%8Fay%20street",
        "alt": "Dwah Manḏay street scene",
        "caption": "An atmospheric look at Dwah Manḏay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dwah%20Man%E1%B8%8Fay%20lifestyle",
        "alt": "Dwah Manḏay lifestyle",
        "caption": "Daily life and culture in Dwah Manḏay."
      }
    ],
    "tags": [
      "coast",
      "walkability",
      "history",
      "island"
    ]
  },
  {
    "slug": "dasht-e-qal-ah-af",
    "city": "Dasht-e Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for eco, luxury, lake and mild climate.",
    "overview": "Experience Dasht-e Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Qal%E2%80%98ah%20skyline",
        "alt": "Dasht-e Qal‘ah skyline",
        "caption": "Dasht-e Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Qal%E2%80%98ah%20street",
        "alt": "Dasht-e Qal‘ah street scene",
        "caption": "An atmospheric look at Dasht-e Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Dasht-e Qal‘ah lifestyle",
        "caption": "Daily life and culture in Dasht-e Qal‘ah."
      }
    ],
    "tags": [
      "eco",
      "luxury",
      "lake",
      "food"
    ]
  },
  {
    "slug": "dasht-e-arch-af",
    "city": "Dasht-e Archī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for digital nomad, walkability, food and mild climate.",
    "overview": "Experience Dasht-e Archī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Arch%C4%AB%20skyline",
        "alt": "Dasht-e Archī skyline",
        "caption": "Dasht-e Archī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Arch%C4%AB%20street",
        "alt": "Dasht-e Archī street scene",
        "caption": "An atmospheric look at Dasht-e Archī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dasht-e%20Arch%C4%AB%20lifestyle",
        "alt": "Dasht-e Archī lifestyle",
        "caption": "Daily life and culture in Dasht-e Archī."
      }
    ],
    "tags": [
      "digital nomad",
      "walkability",
      "food",
      "mountains"
    ]
  },
  {
    "slug": "darz-b-af",
    "city": "Darzāb",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for arts, walkability, island and mild climate.",
    "overview": "Experience Darzāb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Darz%C4%81b%20skyline",
        "alt": "Darzāb skyline",
        "caption": "Darzāb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Darz%C4%81b%20street",
        "alt": "Darzāb street scene",
        "caption": "An atmospheric look at Darzāb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Darz%C4%81b%20lifestyle",
        "alt": "Darzāb lifestyle",
        "caption": "Daily life and culture in Darzāb."
      }
    ],
    "tags": [
      "arts",
      "walkability",
      "island",
      "safety"
    ]
  },
  {
    "slug": "markaz-e-uk-mat-e-darw-sh-n-af",
    "city": "Markaz-e Ḩukūmat-e Darwēshān",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for food, expat-friendly, lake and mild climate.",
    "overview": "Experience Markaz-e Ḩukūmat-e Darwēshān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Darw%C4%93sh%C4%81n%20skyline",
        "alt": "Markaz-e Ḩukūmat-e Darwēshān skyline",
        "caption": "Markaz-e Ḩukūmat-e Darwēshān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Darw%C4%93sh%C4%81n%20street",
        "alt": "Markaz-e Ḩukūmat-e Darwēshān street scene",
        "caption": "An atmospheric look at Markaz-e Ḩukūmat-e Darwēshān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20%E1%B8%A8uk%C5%ABmat-e%20Darw%C4%93sh%C4%81n%20lifestyle",
        "alt": "Markaz-e Ḩukūmat-e Darwēshān lifestyle",
        "caption": "Daily life and culture in Markaz-e Ḩukūmat-e Darwēshān."
      }
    ],
    "tags": [
      "food",
      "expat-friendly",
      "lake",
      "safety"
    ]
  },
  {
    "slug": "darqad-af",
    "city": "Darqad",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.2,
    "description": "A destination known for safety, eco, nightlife and mild climate.",
    "overview": "Experience Darqad's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Darqad%20skyline",
        "alt": "Darqad skyline",
        "caption": "Darqad cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Darqad%20street",
        "alt": "Darqad street scene",
        "caption": "An atmospheric look at Darqad's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Darqad%20lifestyle",
        "alt": "Darqad lifestyle",
        "caption": "Daily life and culture in Darqad."
      }
    ],
    "tags": [
      "safety",
      "eco",
      "nightlife",
      "coast"
    ]
  },
  {
    "slug": "dar-yim-af",
    "city": "Darāyim",
    "country": "AF",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for startup, safety, budget and mild climate.",
    "overview": "Experience Darāyim's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dar%C4%81yim%20skyline",
        "alt": "Darāyim skyline",
        "caption": "Darāyim cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dar%C4%81yim%20street",
        "alt": "Darāyim street scene",
        "caption": "An atmospheric look at Darāyim's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dar%C4%81yim%20lifestyle",
        "alt": "Darāyim lifestyle",
        "caption": "Daily life and culture in Darāyim."
      }
    ],
    "tags": [
      "startup",
      "safety",
      "budget",
      "beach"
    ]
  },
  {
    "slug": "d-ng-m-af",
    "city": "Dāngām",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for eco, digital nomad, coast and mild climate.",
    "overview": "Experience Dāngām's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C4%81ng%C4%81m%20skyline",
        "alt": "Dāngām skyline",
        "caption": "Dāngām cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C4%81ng%C4%81m%20street",
        "alt": "Dāngām street scene",
        "caption": "An atmospheric look at Dāngām's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C4%81ng%C4%81m%20lifestyle",
        "alt": "Dāngām lifestyle",
        "caption": "Daily life and culture in Dāngām."
      }
    ],
    "tags": [
      "eco",
      "digital nomad",
      "coast",
      "healthcare"
    ]
  },
  {
    "slug": "an-ar-af",
    "city": "Ḏanḏar",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for outdoor recreation, history, nightlife and mild climate.",
    "overview": "Experience Ḏanḏar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%8Ean%E1%B8%8Far%20skyline",
        "alt": "Ḏanḏar skyline",
        "caption": "Ḏanḏar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%8Ean%E1%B8%8Far%20street",
        "alt": "Ḏanḏar street scene",
        "caption": "An atmospheric look at Ḏanḏar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%8Ean%E1%B8%8Far%20lifestyle",
        "alt": "Ḏanḏar lifestyle",
        "caption": "Daily life and culture in Ḏanḏar."
      }
    ],
    "tags": [
      "outdoor recreation",
      "history",
      "nightlife",
      "budget"
    ]
  },
  {
    "slug": "uk-mat-dahanah-ye-gh-r-af",
    "city": "Ḩukūmatī Dahanah-ye Ghōrī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for digital nomad, luxury, climate and mild climate.",
    "overview": "Experience Ḩukūmatī Dahanah-ye Ghōrī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Dahanah-ye%20Gh%C5%8Dr%C4%AB%20skyline",
        "alt": "Ḩukūmatī Dahanah-ye Ghōrī skyline",
        "caption": "Ḩukūmatī Dahanah-ye Ghōrī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Dahanah-ye%20Gh%C5%8Dr%C4%AB%20street",
        "alt": "Ḩukūmatī Dahanah-ye Ghōrī street scene",
        "caption": "An atmospheric look at Ḩukūmatī Dahanah-ye Ghōrī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Dahanah-ye%20Gh%C5%8Dr%C4%AB%20lifestyle",
        "alt": "Ḩukūmatī Dahanah-ye Ghōrī lifestyle",
        "caption": "Daily life and culture in Ḩukūmatī Dahanah-ye Ghōrī."
      }
    ],
    "tags": [
      "digital nomad",
      "luxury",
      "climate",
      "wellness"
    ]
  },
  {
    "slug": "tsowk-y-af",
    "city": "Tsowkêy",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.8,
    "description": "A destination known for eco, wellness, budget and mild climate.",
    "overview": "Experience Tsowkêy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tsowk%C3%AAy%20skyline",
        "alt": "Tsowkêy skyline",
        "caption": "Tsowkêy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsowk%C3%AAy%20street",
        "alt": "Tsowkêy street scene",
        "caption": "An atmospheric look at Tsowkêy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsowk%C3%AAy%20lifestyle",
        "alt": "Tsowkêy lifestyle",
        "caption": "Daily life and culture in Tsowkêy."
      }
    ],
    "tags": [
      "eco",
      "wellness",
      "budget",
      "nightlife"
    ]
  },
  {
    "slug": "ch-ras-af",
    "city": "Chīras",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.2,
    "description": "A destination known for luxury, walkability, slow pace and mild climate.",
    "overview": "Experience Chīras's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABras%20skyline",
        "alt": "Chīras skyline",
        "caption": "Chīras cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABras%20street",
        "alt": "Chīras street scene",
        "caption": "An atmospheric look at Chīras's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABras%20lifestyle",
        "alt": "Chīras lifestyle",
        "caption": "Daily life and culture in Chīras."
      }
    ],
    "tags": [
      "luxury",
      "walkability",
      "slow pace",
      "budget"
    ]
  },
  {
    "slug": "ch-chkah-af",
    "city": "Chīchkah",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.5,
    "description": "A destination known for food, lake, luxury and mild climate.",
    "overview": "Experience Chīchkah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABchkah%20skyline",
        "alt": "Chīchkah skyline",
        "caption": "Chīchkah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABchkah%20street",
        "alt": "Chīchkah street scene",
        "caption": "An atmospheric look at Chīchkah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%ABchkah%20lifestyle",
        "alt": "Chīchkah lifestyle",
        "caption": "Daily life and culture in Chīchkah."
      }
    ],
    "tags": [
      "food",
      "lake",
      "luxury",
      "coast"
    ]
  },
  {
    "slug": "chisht-e-shar-f-af",
    "city": "Chisht-e Sharīf",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for healthcare, budget, coast and mild climate.",
    "overview": "Experience Chisht-e Sharīf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chisht-e%20Shar%C4%ABf%20skyline",
        "alt": "Chisht-e Sharīf skyline",
        "caption": "Chisht-e Sharīf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chisht-e%20Shar%C4%ABf%20street",
        "alt": "Chisht-e Sharīf street scene",
        "caption": "An atmospheric look at Chisht-e Sharīf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chisht-e%20Shar%C4%ABf%20lifestyle",
        "alt": "Chisht-e Sharīf lifestyle",
        "caption": "Daily life and culture in Chisht-e Sharīf."
      }
    ],
    "tags": [
      "healthcare",
      "budget",
      "coast",
      "walkability"
    ]
  },
  {
    "slug": "chin-r-af",
    "city": "Chinār",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for digital nomad, nature, island and mild climate.",
    "overview": "Experience Chinār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chin%C4%81r%20skyline",
        "alt": "Chinār skyline",
        "caption": "Chinār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chin%C4%81r%20street",
        "alt": "Chinār street scene",
        "caption": "An atmospheric look at Chinār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chin%C4%81r%20lifestyle",
        "alt": "Chinār lifestyle",
        "caption": "Daily life and culture in Chinār."
      }
    ],
    "tags": [
      "digital nomad",
      "nature",
      "island",
      "lake"
    ]
  },
  {
    "slug": "chimt-l-af",
    "city": "Chimtāl",
    "country": "AF",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for golf, nature, mountains and mild climate.",
    "overview": "Experience Chimtāl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chimt%C4%81l%20skyline",
        "alt": "Chimtāl skyline",
        "caption": "Chimtāl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chimt%C4%81l%20street",
        "alt": "Chimtāl street scene",
        "caption": "An atmospheric look at Chimtāl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chimt%C4%81l%20lifestyle",
        "alt": "Chimtāl lifestyle",
        "caption": "Daily life and culture in Chimtāl."
      }
    ],
    "tags": [
      "golf",
      "nature",
      "mountains",
      "island"
    ]
  },
  {
    "slug": "charkh-af",
    "city": "Charkh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.1,
    "description": "A destination known for mountains, nature, island and mild climate.",
    "overview": "Experience Charkh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Charkh%20skyline",
        "alt": "Charkh skyline",
        "caption": "Charkh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Charkh%20street",
        "alt": "Charkh street scene",
        "caption": "An atmospheric look at Charkh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Charkh%20lifestyle",
        "alt": "Charkh lifestyle",
        "caption": "Daily life and culture in Charkh."
      }
    ],
    "tags": [
      "mountains",
      "nature",
      "island",
      "outdoor recreation"
    ]
  },
  {
    "slug": "charikar-af",
    "city": "Charikar",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for walkability, retirement, nightlife and mild climate.",
    "overview": "Experience Charikar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Charikar%20skyline",
        "alt": "Charikar skyline",
        "caption": "Charikar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Charikar%20street",
        "alt": "Charikar street scene",
        "caption": "An atmospheric look at Charikar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Charikar%20lifestyle",
        "alt": "Charikar lifestyle",
        "caption": "Daily life and culture in Charikar."
      }
    ],
    "tags": [
      "walkability",
      "retirement",
      "nightlife",
      "golf"
    ]
  },
  {
    "slug": "dowr-e-rab-af",
    "city": "Dowr-e Rabāţ",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for nightlife, walkability, history and mild climate.",
    "overview": "Experience Dowr-e Rabāţ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dowr-e%20Rab%C4%81%C5%A3%20skyline",
        "alt": "Dowr-e Rabāţ skyline",
        "caption": "Dowr-e Rabāţ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowr-e%20Rab%C4%81%C5%A3%20street",
        "alt": "Dowr-e Rabāţ street scene",
        "caption": "An atmospheric look at Dowr-e Rabāţ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dowr-e%20Rab%C4%81%C5%A3%20lifestyle",
        "alt": "Dowr-e Rabāţ lifestyle",
        "caption": "Daily life and culture in Dowr-e Rabāţ."
      }
    ],
    "tags": [
      "nightlife",
      "walkability",
      "history",
      "family"
    ]
  },
  {
    "slug": "tsap-ra-af",
    "city": "Tsapêraī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.5,
    "description": "A destination known for nature, golf, retirement and mild climate.",
    "overview": "Experience Tsapêraī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tsap%C3%AAra%C4%AB%20skyline",
        "alt": "Tsapêraī skyline",
        "caption": "Tsapêraī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsap%C3%AAra%C4%AB%20street",
        "alt": "Tsapêraī street scene",
        "caption": "An atmospheric look at Tsapêraī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsap%C3%AAra%C4%AB%20lifestyle",
        "alt": "Tsapêraī lifestyle",
        "caption": "Daily life and culture in Tsapêraī."
      }
    ],
    "tags": [
      "nature",
      "golf",
      "retirement",
      "climate"
    ]
  },
  {
    "slug": "tsamkan-af",
    "city": "Tsamkanī",
    "country": "AF",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for coast, beach, eco and mild climate.",
    "overview": "Experience Tsamkanī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tsamkan%C4%AB%20skyline",
        "alt": "Tsamkanī skyline",
        "caption": "Tsamkanī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsamkan%C4%AB%20street",
        "alt": "Tsamkanī street scene",
        "caption": "An atmospheric look at Tsamkanī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tsamkan%C4%AB%20lifestyle",
        "alt": "Tsamkanī lifestyle",
        "caption": "Daily life and culture in Tsamkanī."
      }
    ],
    "tags": [
      "coast",
      "beach",
      "eco",
      "golf"
    ]
  },
  {
    "slug": "chakaray-af",
    "city": "Chakaray",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for family, luxury, healthcare and mild climate.",
    "overview": "Experience Chakaray's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chakaray%20skyline",
        "alt": "Chakaray skyline",
        "caption": "Chakaray cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chakaray%20street",
        "alt": "Chakaray street scene",
        "caption": "An atmospheric look at Chakaray's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chakaray%20lifestyle",
        "alt": "Chakaray lifestyle",
        "caption": "Daily life and culture in Chakaray."
      }
    ],
    "tags": [
      "family",
      "luxury",
      "healthcare",
      "eco"
    ]
  },
  {
    "slug": "ch-kar-n-af",
    "city": "Chākarān",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.4,
    "description": "A destination known for digital nomad, lake, nightlife and mild climate.",
    "overview": "Experience Chākarān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81kar%C4%81n%20skyline",
        "alt": "Chākarān skyline",
        "caption": "Chākarān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81kar%C4%81n%20street",
        "alt": "Chākarān street scene",
        "caption": "An atmospheric look at Chākarān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81kar%C4%81n%20lifestyle",
        "alt": "Chākarān lifestyle",
        "caption": "Daily life and culture in Chākarān."
      }
    ],
    "tags": [
      "digital nomad",
      "lake",
      "nightlife",
      "coast"
    ]
  },
  {
    "slug": "chah-r-qal-ah-af",
    "city": "Chahār Qal‘ah",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.8,
    "description": "A destination known for nightlife, golf, wellness and mild climate.",
    "overview": "Experience Chahār Qal‘ah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Qal%E2%80%98ah%20skyline",
        "alt": "Chahār Qal‘ah skyline",
        "caption": "Chahār Qal‘ah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Qal%E2%80%98ah%20street",
        "alt": "Chahār Qal‘ah street scene",
        "caption": "An atmospheric look at Chahār Qal‘ah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Qal%E2%80%98ah%20lifestyle",
        "alt": "Chahār Qal‘ah lifestyle",
        "caption": "Daily life and culture in Chahār Qal‘ah."
      }
    ],
    "tags": [
      "nightlife",
      "golf",
      "wellness",
      "digital nomad"
    ]
  },
  {
    "slug": "chah-r-burj-af",
    "city": "Chahār Burj",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.2,
    "description": "A destination known for retirement, slow pace, startup and mild climate.",
    "overview": "Experience Chahār Burj's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Burj%20skyline",
        "alt": "Chahār Burj skyline",
        "caption": "Chahār Burj cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Burj%20street",
        "alt": "Chahār Burj street scene",
        "caption": "An atmospheric look at Chahār Burj's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chah%C4%81r%20Burj%20lifestyle",
        "alt": "Chahār Burj lifestyle",
        "caption": "Daily life and culture in Chahār Burj."
      }
    ],
    "tags": [
      "retirement",
      "slow pace",
      "startup",
      "healthcare"
    ]
  },
  {
    "slug": "ch-h-b-af",
    "city": "Chāh Āb",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for climate, safety, wellness and mild climate.",
    "overview": "Experience Chāh Āb's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81h%20%C4%80b%20skyline",
        "alt": "Chāh Āb skyline",
        "caption": "Chāh Āb cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81h%20%C4%80b%20street",
        "alt": "Chāh Āb street scene",
        "caption": "An atmospheric look at Chāh Āb's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ch%C4%81h%20%C4%80b%20lifestyle",
        "alt": "Chāh Āb lifestyle",
        "caption": "Daily life and culture in Chāh Āb."
      }
    ],
    "tags": [
      "climate",
      "safety",
      "wellness",
      "digital nomad"
    ]
  },
  {
    "slug": "fayr-z-k-h-af",
    "city": "Fayrōz Kōh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for culture, startup, wellness and mild climate.",
    "overview": "Experience Fayrōz Kōh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Fayr%C5%8Dz%20K%C5%8Dh%20skyline",
        "alt": "Fayrōz Kōh skyline",
        "caption": "Fayrōz Kōh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fayr%C5%8Dz%20K%C5%8Dh%20street",
        "alt": "Fayrōz Kōh street scene",
        "caption": "An atmospheric look at Fayrōz Kōh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Fayr%C5%8Dz%20K%C5%8Dh%20lifestyle",
        "alt": "Fayrōz Kōh lifestyle",
        "caption": "Daily life and culture in Fayrōz Kōh."
      }
    ],
    "tags": [
      "culture",
      "startup",
      "wellness",
      "luxury"
    ]
  },
  {
    "slug": "bul-lah-af",
    "city": "Bulōlah",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.4,
    "description": "A destination known for nature, healthcare, safety and mild climate.",
    "overview": "Experience Bulōlah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bul%C5%8Dlah%20skyline",
        "alt": "Bulōlah skyline",
        "caption": "Bulōlah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bul%C5%8Dlah%20street",
        "alt": "Bulōlah street scene",
        "caption": "An atmospheric look at Bulōlah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bul%C5%8Dlah%20lifestyle",
        "alt": "Bulōlah lifestyle",
        "caption": "Daily life and culture in Bulōlah."
      }
    ],
    "tags": [
      "nature",
      "healthcare",
      "safety",
      "family"
    ]
  },
  {
    "slug": "bal-chir-gh-af",
    "city": "Bal Chirāgh",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.1,
    "description": "A destination known for safety, eco, wellness and mild climate.",
    "overview": "Experience Bal Chirāgh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bal%20Chir%C4%81gh%20skyline",
        "alt": "Bal Chirāgh skyline",
        "caption": "Bal Chirāgh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bal%20Chir%C4%81gh%20street",
        "alt": "Bal Chirāgh street scene",
        "caption": "An atmospheric look at Bal Chirāgh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bal%20Chir%C4%81gh%20lifestyle",
        "alt": "Bal Chirāgh lifestyle",
        "caption": "Daily life and culture in Bal Chirāgh."
      }
    ],
    "tags": [
      "safety",
      "eco",
      "wellness",
      "expat-friendly"
    ]
  },
  {
    "slug": "b-z-r-e-t-lah-af",
    "city": "Bāzār-e Tālah",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for budget, eco, safety and mild climate.",
    "overview": "Experience Bāzār-e Tālah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20T%C4%81lah%20skyline",
        "alt": "Bāzār-e Tālah skyline",
        "caption": "Bāzār-e Tālah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20T%C4%81lah%20street",
        "alt": "Bāzār-e Tālah street scene",
        "caption": "An atmospheric look at Bāzār-e Tālah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81r-e%20T%C4%81lah%20lifestyle",
        "alt": "Bāzār-e Tālah lifestyle",
        "caption": "Daily life and culture in Bāzār-e Tālah."
      }
    ],
    "tags": [
      "budget",
      "eco",
      "safety",
      "digital nomad"
    ]
  },
  {
    "slug": "muhmand-dara-af",
    "city": "Muhmand Dara",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.3,
    "description": "A destination known for slow pace, digital nomad, luxury and mild climate.",
    "overview": "Experience Muhmand Dara's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Muhmand%20Dara%20skyline",
        "alt": "Muhmand Dara skyline",
        "caption": "Muhmand Dara cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muhmand%20Dara%20street",
        "alt": "Muhmand Dara street scene",
        "caption": "An atmospheric look at Muhmand Dara's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Muhmand%20Dara%20lifestyle",
        "alt": "Muhmand Dara lifestyle",
        "caption": "Daily life and culture in Muhmand Dara."
      }
    ],
    "tags": [
      "slow pace",
      "digital nomad",
      "luxury",
      "arts"
    ]
  },
  {
    "slug": "b-rkah-af",
    "city": "Būrkah",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.7,
    "description": "A destination known for island, luxury, mountains and mild climate.",
    "overview": "Experience Būrkah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABrkah%20skyline",
        "alt": "Būrkah skyline",
        "caption": "Būrkah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABrkah%20street",
        "alt": "Būrkah street scene",
        "caption": "An atmospheric look at Būrkah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C5%ABrkah%20lifestyle",
        "alt": "Būrkah lifestyle",
        "caption": "Daily life and culture in Būrkah."
      }
    ],
    "tags": [
      "island",
      "luxury",
      "mountains",
      "healthcare"
    ]
  },
  {
    "slug": "barg-e-mat-l-af",
    "city": "Barg-e Matāl",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.2,
    "description": "A destination known for digital nomad, family, climate and mild climate.",
    "overview": "Experience Barg-e Matāl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Barg-e%20Mat%C4%81l%20skyline",
        "alt": "Barg-e Matāl skyline",
        "caption": "Barg-e Matāl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barg-e%20Mat%C4%81l%20street",
        "alt": "Barg-e Matāl street scene",
        "caption": "An atmospheric look at Barg-e Matāl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barg-e%20Mat%C4%81l%20lifestyle",
        "alt": "Barg-e Matāl lifestyle",
        "caption": "Daily life and culture in Barg-e Matāl."
      }
    ],
    "tags": [
      "digital nomad",
      "family",
      "climate",
      "nightlife"
    ]
  },
  {
    "slug": "barak-af",
    "city": "Barakī",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.9,
    "description": "A destination known for island, food, outdoor recreation and mild climate.",
    "overview": "Experience Barakī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Barak%C4%AB%20skyline",
        "alt": "Barakī skyline",
        "caption": "Barakī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barak%C4%AB%20street",
        "alt": "Barakī street scene",
        "caption": "An atmospheric look at Barakī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barak%C4%AB%20lifestyle",
        "alt": "Barakī lifestyle",
        "caption": "Daily life and culture in Barakī."
      }
    ],
    "tags": [
      "island",
      "food",
      "outdoor recreation",
      "expat-friendly"
    ]
  },
  {
    "slug": "baraki-barak-af",
    "city": "Baraki Barak",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.6,
    "description": "A destination known for mountains, family, luxury and mild climate.",
    "overview": "Experience Baraki Barak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Baraki%20Barak%20skyline",
        "alt": "Baraki Barak skyline",
        "caption": "Baraki Barak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Baraki%20Barak%20street",
        "alt": "Baraki Barak street scene",
        "caption": "An atmospheric look at Baraki Barak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Baraki%20Barak%20lifestyle",
        "alt": "Baraki Barak lifestyle",
        "caption": "Daily life and culture in Baraki Barak."
      }
    ],
    "tags": [
      "mountains",
      "family",
      "luxury",
      "slow pace"
    ]
  },
  {
    "slug": "ban-af",
    "city": "Banū",
    "country": "AF",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for healthcare, budget, slow pace and mild climate.",
    "overview": "Experience Banū's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ban%C5%AB%20skyline",
        "alt": "Banū skyline",
        "caption": "Banū cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ban%C5%AB%20street",
        "alt": "Banū street scene",
        "caption": "An atmospheric look at Banū's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ban%C5%AB%20lifestyle",
        "alt": "Banū lifestyle",
        "caption": "Daily life and culture in Banū."
      }
    ],
    "tags": [
      "healthcare",
      "budget",
      "slow pace",
      "food"
    ]
  },
  {
    "slug": "b-my-n-af",
    "city": "Bāmyān",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for island, mountains, wellness and mild climate.",
    "overview": "Experience Bāmyān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81my%C4%81n%20skyline",
        "alt": "Bāmyān skyline",
        "caption": "Bāmyān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81my%C4%81n%20street",
        "alt": "Bāmyān street scene",
        "caption": "An atmospheric look at Bāmyān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81my%C4%81n%20lifestyle",
        "alt": "Bāmyān lifestyle",
        "caption": "Daily life and culture in Bāmyān."
      }
    ],
    "tags": [
      "island",
      "mountains",
      "wellness",
      "outdoor recreation"
    ]
  },
  {
    "slug": "balkh-af",
    "city": "Balkh",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.7,
    "description": "A destination known for nature, history, startup and mild climate.",
    "overview": "Experience Balkh's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Balkh%20skyline",
        "alt": "Balkh skyline",
        "caption": "Balkh cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Balkh%20street",
        "alt": "Balkh street scene",
        "caption": "An atmospheric look at Balkh's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Balkh%20lifestyle",
        "alt": "Balkh lifestyle",
        "caption": "Daily life and culture in Balkh."
      }
    ],
    "tags": [
      "nature",
      "history",
      "startup",
      "beach"
    ]
  },
  {
    "slug": "bah-rak-af",
    "city": "Bahārak",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for food, luxury, arts and mild climate.",
    "overview": "Experience Bahārak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bah%C4%81rak%20skyline",
        "alt": "Bahārak skyline",
        "caption": "Bahārak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bah%C4%81rak%20street",
        "alt": "Bahārak street scene",
        "caption": "An atmospheric look at Bahārak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bah%C4%81rak%20lifestyle",
        "alt": "Bahārak lifestyle",
        "caption": "Daily life and culture in Bahārak."
      }
    ],
    "tags": [
      "food",
      "luxury",
      "arts",
      "history"
    ]
  },
  {
    "slug": "bagr-m-af",
    "city": "Bagrāmī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97,
    "description": "A destination known for luxury, wellness, walkability and mild climate.",
    "overview": "Experience Bagrāmī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bagr%C4%81m%C4%AB%20skyline",
        "alt": "Bagrāmī skyline",
        "caption": "Bagrāmī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bagr%C4%81m%C4%AB%20street",
        "alt": "Bagrāmī street scene",
        "caption": "An atmospheric look at Bagrāmī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bagr%C4%81m%C4%AB%20lifestyle",
        "alt": "Bagrāmī lifestyle",
        "caption": "Daily life and culture in Bagrāmī."
      }
    ],
    "tags": [
      "luxury",
      "wellness",
      "walkability",
      "nature"
    ]
  },
  {
    "slug": "baghl-n-af",
    "city": "Baghlān",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.7,
    "description": "A destination known for golf, walkability, beach and mild climate.",
    "overview": "Experience Baghlān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Baghl%C4%81n%20skyline",
        "alt": "Baghlān skyline",
        "caption": "Baghlān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Baghl%C4%81n%20street",
        "alt": "Baghlān street scene",
        "caption": "An atmospheric look at Baghlān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Baghl%C4%81n%20lifestyle",
        "alt": "Baghlān lifestyle",
        "caption": "Daily life and culture in Baghlān."
      }
    ],
    "tags": [
      "golf",
      "walkability",
      "beach",
      "digital nomad"
    ]
  },
  {
    "slug": "uk-mat-azrah-af",
    "city": "Ḩukūmatī Azrah",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for beach, nature, arts and mild climate.",
    "overview": "Experience Ḩukūmatī Azrah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Azrah%20skyline",
        "alt": "Ḩukūmatī Azrah skyline",
        "caption": "Ḩukūmatī Azrah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Azrah%20street",
        "alt": "Ḩukūmatī Azrah street scene",
        "caption": "An atmospheric look at Ḩukūmatī Azrah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E1%B8%A8uk%C5%ABmat%C4%AB%20Azrah%20lifestyle",
        "alt": "Ḩukūmatī Azrah lifestyle",
        "caption": "Daily life and culture in Ḩukūmatī Azrah."
      }
    ],
    "tags": [
      "beach",
      "nature",
      "arts",
      "walkability"
    ]
  },
  {
    "slug": "rt-khw-jah-af",
    "city": "Ārt Khwājah",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for slow pace, history, climate and mild climate.",
    "overview": "Experience Ārt Khwājah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C4%80rt%20Khw%C4%81jah%20skyline",
        "alt": "Ārt Khwājah skyline",
        "caption": "Ārt Khwājah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80rt%20Khw%C4%81jah%20street",
        "alt": "Ārt Khwājah street scene",
        "caption": "An atmospheric look at Ārt Khwājah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80rt%20Khw%C4%81jah%20lifestyle",
        "alt": "Ārt Khwājah lifestyle",
        "caption": "Daily life and culture in Ārt Khwājah."
      }
    ],
    "tags": [
      "slow pace",
      "history",
      "climate",
      "retirement"
    ]
  },
  {
    "slug": "al-qahd-r-a-ghar-af",
    "city": "‘Alāqahdārī Aṯghar",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.8,
    "description": "A destination known for expat-friendly, lake, budget and mild climate.",
    "overview": "Experience ‘Alāqahdārī Aṯghar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20A%E1%B9%AFghar%20skyline",
        "alt": "‘Alāqahdārī Aṯghar skyline",
        "caption": "‘Alāqahdārī Aṯghar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20A%E1%B9%AFghar%20street",
        "alt": "‘Alāqahdārī Aṯghar street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Aṯghar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20A%E1%B9%AFghar%20lifestyle",
        "alt": "‘Alāqahdārī Aṯghar lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Aṯghar."
      }
    ],
    "tags": [
      "expat-friendly",
      "lake",
      "budget",
      "wellness"
    ]
  },
  {
    "slug": "sm-r-af",
    "city": "Āsmār",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.3,
    "description": "A destination known for culture, coast, history and mild climate.",
    "overview": "Experience Āsmār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C4%80sm%C4%81r%20skyline",
        "alt": "Āsmār skyline",
        "caption": "Āsmār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80sm%C4%81r%20street",
        "alt": "Āsmār street scene",
        "caption": "An atmospheric look at Āsmār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80sm%C4%81r%20lifestyle",
        "alt": "Āsmār lifestyle",
        "caption": "Daily life and culture in Āsmār."
      }
    ],
    "tags": [
      "culture",
      "coast",
      "history",
      "food"
    ]
  },
  {
    "slug": "ashk-sham-af",
    "city": "Ashkāsham",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.4,
    "description": "A destination known for nightlife, safety, nature and mild climate.",
    "overview": "Experience Ashkāsham's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ashk%C4%81sham%20skyline",
        "alt": "Ashkāsham skyline",
        "caption": "Ashkāsham cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ashk%C4%81sham%20street",
        "alt": "Ashkāsham street scene",
        "caption": "An atmospheric look at Ashkāsham's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ashk%C4%81sham%20lifestyle",
        "alt": "Ashkāsham lifestyle",
        "caption": "Daily life and culture in Ashkāsham."
      }
    ],
    "tags": [
      "nightlife",
      "safety",
      "nature",
      "walkability"
    ]
  },
  {
    "slug": "asad-b-d-af",
    "city": "Asadābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.4,
    "description": "A destination known for nightlife, mountains, outdoor recreation and mild climate.",
    "overview": "Experience Asadābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Asad%C4%81b%C4%81d%20skyline",
        "alt": "Asadābād skyline",
        "caption": "Asadābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Asad%C4%81b%C4%81d%20street",
        "alt": "Asadābād street scene",
        "caption": "An atmospheric look at Asadābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Asad%C4%81b%C4%81d%20lifestyle",
        "alt": "Asadābād lifestyle",
        "caption": "Daily life and culture in Asadābād."
      }
    ],
    "tags": [
      "nightlife",
      "mountains",
      "outdoor recreation",
      "startup"
    ]
  },
  {
    "slug": "aqcha-af",
    "city": "Aqcha",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for mountains, family, climate and mild climate.",
    "overview": "Experience Aqcha's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Aqcha%20skyline",
        "alt": "Aqcha skyline",
        "caption": "Aqcha cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aqcha%20street",
        "alt": "Aqcha street scene",
        "caption": "An atmospheric look at Aqcha's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aqcha%20lifestyle",
        "alt": "Aqcha lifestyle",
        "caption": "Daily life and culture in Aqcha."
      }
    ],
    "tags": [
      "mountains",
      "family",
      "climate",
      "startup"
    ]
  },
  {
    "slug": "andkhoy-af",
    "city": "Andkhoy",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.9,
    "description": "A destination known for eco, arts, golf and mild climate.",
    "overview": "Experience Andkhoy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Andkhoy%20skyline",
        "alt": "Andkhoy skyline",
        "caption": "Andkhoy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Andkhoy%20street",
        "alt": "Andkhoy street scene",
        "caption": "An atmospheric look at Andkhoy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Andkhoy%20lifestyle",
        "alt": "Andkhoy lifestyle",
        "caption": "Daily life and culture in Andkhoy."
      }
    ],
    "tags": [
      "eco",
      "arts",
      "golf",
      "luxury"
    ]
  },
  {
    "slug": "un-bah-af",
    "city": "’Unābah",
    "country": "AF",
    "emoji": "🌍",
    "match": 96,
    "description": "A destination known for mountains, expat-friendly, island and mild climate.",
    "overview": "Experience ’Unābah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%99Un%C4%81bah%20skyline",
        "alt": "’Unābah skyline",
        "caption": "’Unābah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%99Un%C4%81bah%20street",
        "alt": "’Unābah street scene",
        "caption": "An atmospheric look at ’Unābah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%99Un%C4%81bah%20lifestyle",
        "alt": "’Unābah lifestyle",
        "caption": "Daily life and culture in ’Unābah."
      }
    ],
    "tags": [
      "mountains",
      "expat-friendly",
      "island",
      "digital nomad"
    ]
  },
  {
    "slug": "an-r-darah-af",
    "city": "Anār Darah",
    "country": "AF",
    "emoji": "🌍",
    "match": 96,
    "description": "A destination known for golf, nature, arts and mild climate.",
    "overview": "Experience Anār Darah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?An%C4%81r%20Darah%20skyline",
        "alt": "Anār Darah skyline",
        "caption": "Anār Darah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?An%C4%81r%20Darah%20street",
        "alt": "Anār Darah street scene",
        "caption": "An atmospheric look at Anār Darah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?An%C4%81r%20Darah%20lifestyle",
        "alt": "Anār Darah lifestyle",
        "caption": "Daily life and culture in Anār Darah."
      }
    ],
    "tags": [
      "golf",
      "nature",
      "arts",
      "luxury"
    ]
  },
  {
    "slug": "am-nz-af",
    "city": "Amānzī",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.5,
    "description": "A destination known for coast, nightlife, history and mild climate.",
    "overview": "Experience Amānzī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Am%C4%81nz%C4%AB%20skyline",
        "alt": "Amānzī skyline",
        "caption": "Amānzī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Am%C4%81nz%C4%AB%20street",
        "alt": "Amānzī street scene",
        "caption": "An atmospheric look at Amānzī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Am%C4%81nz%C4%AB%20lifestyle",
        "alt": "Amānzī lifestyle",
        "caption": "Daily life and culture in Amānzī."
      }
    ],
    "tags": [
      "coast",
      "nightlife",
      "history",
      "digital nomad"
    ]
  },
  {
    "slug": "al-qahd-r-ye-alm-r-af",
    "city": "‘Alāqahdārī-ye Almār",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for digital nomad, eco, lake and mild climate.",
    "overview": "Experience ‘Alāqahdārī-ye Almār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB-ye%20Alm%C4%81r%20skyline",
        "alt": "‘Alāqahdārī-ye Almār skyline",
        "caption": "‘Alāqahdārī-ye Almār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB-ye%20Alm%C4%81r%20street",
        "alt": "‘Alāqahdārī-ye Almār street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī-ye Almār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB-ye%20Alm%C4%81r%20lifestyle",
        "alt": "‘Alāqahdārī-ye Almār lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī-ye Almār."
      }
    ],
    "tags": [
      "digital nomad",
      "eco",
      "lake",
      "retirement"
    ]
  },
  {
    "slug": "al-sh-r-al-qahd-r-af",
    "city": "‘Alī Shēr ‘Alāqahdārī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.3,
    "description": "A destination known for budget, culture, food and mild climate.",
    "overview": "Experience ‘Alī Shēr ‘Alāqahdārī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Sh%C4%93r%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20skyline",
        "alt": "‘Alī Shēr ‘Alāqahdārī skyline",
        "caption": "‘Alī Shēr ‘Alāqahdārī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Sh%C4%93r%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20street",
        "alt": "‘Alī Shēr ‘Alāqahdārī street scene",
        "caption": "An atmospheric look at ‘Alī Shēr ‘Alāqahdārī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Sh%C4%93r%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20lifestyle",
        "alt": "‘Alī Shēr ‘Alāqahdārī lifestyle",
        "caption": "Daily life and culture in ‘Alī Shēr ‘Alāqahdārī."
      }
    ],
    "tags": [
      "budget",
      "culture",
      "food",
      "arts"
    ]
  },
  {
    "slug": "wulusw-l-al-ng-r-af",
    "city": "Wuluswālī ‘Alīngār",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.9,
    "description": "A destination known for healthcare, coast, arts and mild climate.",
    "overview": "Experience Wuluswālī ‘Alīngār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Wulusw%C4%81l%C4%AB%20%E2%80%98Al%C4%ABng%C4%81r%20skyline",
        "alt": "Wuluswālī ‘Alīngār skyline",
        "caption": "Wuluswālī ‘Alīngār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wulusw%C4%81l%C4%AB%20%E2%80%98Al%C4%ABng%C4%81r%20street",
        "alt": "Wuluswālī ‘Alīngār street scene",
        "caption": "An atmospheric look at Wuluswālī ‘Alīngār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wulusw%C4%81l%C4%AB%20%E2%80%98Al%C4%ABng%C4%81r%20lifestyle",
        "alt": "Wuluswālī ‘Alīngār lifestyle",
        "caption": "Daily life and culture in Wuluswālī ‘Alīngār."
      }
    ],
    "tags": [
      "healthcare",
      "coast",
      "arts",
      "climate"
    ]
  },
  {
    "slug": "al-kh-l-af",
    "city": "‘Alī Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for retirement, slow pace, luxury and mild climate.",
    "overview": "Experience ‘Alī Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Kh%C4%93l%20skyline",
        "alt": "‘Alī Khēl skyline",
        "caption": "‘Alī Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Kh%C4%93l%20street",
        "alt": "‘Alī Khēl street scene",
        "caption": "An atmospheric look at ‘Alī Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%20Kh%C4%93l%20lifestyle",
        "alt": "‘Alī Khēl lifestyle",
        "caption": "Daily life and culture in ‘Alī Khēl."
      }
    ],
    "tags": [
      "retirement",
      "slow pace",
      "luxury",
      "walkability"
    ]
  },
  {
    "slug": "al-qahd-r-y-suf-kh-l-af",
    "city": "‘Alāqahdārī Yōsuf Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for island, wellness, startup and mild climate.",
    "overview": "Experience ‘Alāqahdārī Yōsuf Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Y%C5%8Dsuf%20Kh%C4%93l%20skyline",
        "alt": "‘Alāqahdārī Yōsuf Khēl skyline",
        "caption": "‘Alāqahdārī Yōsuf Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Y%C5%8Dsuf%20Kh%C4%93l%20street",
        "alt": "‘Alāqahdārī Yōsuf Khēl street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Yōsuf Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Y%C5%8Dsuf%20Kh%C4%93l%20lifestyle",
        "alt": "‘Alāqahdārī Yōsuf Khēl lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Yōsuf Khēl."
      }
    ],
    "tags": [
      "island",
      "wellness",
      "startup",
      "history"
    ]
  },
  {
    "slug": "al-qahd-r-d-sh-af",
    "city": "‘Alāqahdārī Dīshū",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for eco, mountains, safety and mild climate.",
    "overview": "Experience ‘Alāqahdārī Dīshū's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20D%C4%ABsh%C5%AB%20skyline",
        "alt": "‘Alāqahdārī Dīshū skyline",
        "caption": "‘Alāqahdārī Dīshū cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20D%C4%ABsh%C5%AB%20street",
        "alt": "‘Alāqahdārī Dīshū street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Dīshū's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20D%C4%ABsh%C5%AB%20lifestyle",
        "alt": "‘Alāqahdārī Dīshū lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Dīshū."
      }
    ],
    "tags": [
      "eco",
      "mountains",
      "safety",
      "coast"
    ]
  },
  {
    "slug": "alah-s-y-af",
    "city": "Alah Sāy",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.2,
    "description": "A destination known for outdoor recreation, food, eco and mild climate.",
    "overview": "Experience Alah Sāy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Alah%20S%C4%81y%20skyline",
        "alt": "Alah Sāy skyline",
        "caption": "Alah Sāy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Alah%20S%C4%81y%20street",
        "alt": "Alah Sāy street scene",
        "caption": "An atmospheric look at Alah Sāy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Alah%20S%C4%81y%20lifestyle",
        "alt": "Alah Sāy lifestyle",
        "caption": "Daily life and culture in Alah Sāy."
      }
    ],
    "tags": [
      "outdoor recreation",
      "food",
      "eco",
      "history"
    ]
  },
  {
    "slug": "pach-r-wa-g-m-af",
    "city": "Pachīr wa Āgām",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.2,
    "description": "A destination known for outdoor recreation, digital nomad, expat-friendly and mild climate.",
    "overview": "Experience Pachīr wa Āgām's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pach%C4%ABr%20wa%20%C4%80g%C4%81m%20skyline",
        "alt": "Pachīr wa Āgām skyline",
        "caption": "Pachīr wa Āgām cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pach%C4%ABr%20wa%20%C4%80g%C4%81m%20street",
        "alt": "Pachīr wa Āgām street scene",
        "caption": "An atmospheric look at Pachīr wa Āgām's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pach%C4%ABr%20wa%20%C4%80g%C4%81m%20lifestyle",
        "alt": "Pachīr wa Āgām lifestyle",
        "caption": "Daily life and culture in Pachīr wa Āgām."
      }
    ],
    "tags": [
      "outdoor recreation",
      "digital nomad",
      "expat-friendly",
      "lake"
    ]
  },
  {
    "slug": "f-q-af",
    "city": "Āfāqī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.1,
    "description": "A destination known for lake, expat-friendly, arts and mild climate.",
    "overview": "Experience Āfāqī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C4%80f%C4%81q%C4%AB%20skyline",
        "alt": "Āfāqī skyline",
        "caption": "Āfāqī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80f%C4%81q%C4%AB%20street",
        "alt": "Āfāqī street scene",
        "caption": "An atmospheric look at Āfāqī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80f%C4%81q%C4%AB%20lifestyle",
        "alt": "Āfāqī lifestyle",
        "caption": "Daily life and culture in Āfāqī."
      }
    ],
    "tags": [
      "lake",
      "expat-friendly",
      "arts",
      "slow pace"
    ]
  },
  {
    "slug": "adraskan-af",
    "city": "Adraskan",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for budget, startup, history and mild climate.",
    "overview": "Experience Adraskan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Adraskan%20skyline",
        "alt": "Adraskan skyline",
        "caption": "Adraskan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Adraskan%20street",
        "alt": "Adraskan street scene",
        "caption": "An atmospheric look at Adraskan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Adraskan%20lifestyle",
        "alt": "Adraskan lifestyle",
        "caption": "Daily life and culture in Adraskan."
      }
    ],
    "tags": [
      "budget",
      "startup",
      "history",
      "slow pace"
    ]
  },
  {
    "slug": "b-e-kamar-af",
    "city": "Āb-e Kamarī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.9,
    "description": "A destination known for family, retirement, budget and mild climate.",
    "overview": "Experience Āb-e Kamarī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C4%80b-e%20Kamar%C4%AB%20skyline",
        "alt": "Āb-e Kamarī skyline",
        "caption": "Āb-e Kamarī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80b-e%20Kamar%C4%AB%20street",
        "alt": "Āb-e Kamarī street scene",
        "caption": "An atmospheric look at Āb-e Kamarī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C4%80b-e%20Kamar%C4%AB%20lifestyle",
        "alt": "Āb-e Kamarī lifestyle",
        "caption": "Daily life and culture in Āb-e Kamarī."
      }
    ],
    "tags": [
      "family",
      "retirement",
      "budget",
      "startup"
    ]
  },
  {
    "slug": "khad-r-af",
    "city": "Khadīr",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for nightlife, slow pace, food and mild climate.",
    "overview": "Experience Khadīr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khad%C4%ABr%20skyline",
        "alt": "Khadīr skyline",
        "caption": "Khadīr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khad%C4%ABr%20street",
        "alt": "Khadīr street scene",
        "caption": "An atmospheric look at Khadīr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khad%C4%ABr%20lifestyle",
        "alt": "Khadīr lifestyle",
        "caption": "Daily life and culture in Khadīr."
      }
    ],
    "tags": [
      "nightlife",
      "slow pace",
      "food",
      "wellness"
    ]
  },
  {
    "slug": "ghul-m-al-af",
    "city": "Ghulām ‘Alī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.7,
    "description": "A destination known for arts, food, luxury and mild climate.",
    "overview": "Experience Ghulām ‘Alī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ghul%C4%81m%20%E2%80%98Al%C4%AB%20skyline",
        "alt": "Ghulām ‘Alī skyline",
        "caption": "Ghulām ‘Alī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghul%C4%81m%20%E2%80%98Al%C4%AB%20street",
        "alt": "Ghulām ‘Alī street scene",
        "caption": "An atmospheric look at Ghulām ‘Alī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ghul%C4%81m%20%E2%80%98Al%C4%AB%20lifestyle",
        "alt": "Ghulām ‘Alī lifestyle",
        "caption": "Daily life and culture in Ghulām ‘Alī."
      }
    ],
    "tags": [
      "arts",
      "food",
      "luxury",
      "safety"
    ]
  },
  {
    "slug": "qarah-b-gh-b-z-r-af",
    "city": "Qarah Bāgh Bāzār",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.7,
    "description": "A destination known for wellness, expat-friendly, island and mild climate.",
    "overview": "Experience Qarah Bāgh Bāzār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20B%C4%81z%C4%81r%20skyline",
        "alt": "Qarah Bāgh Bāzār skyline",
        "caption": "Qarah Bāgh Bāzār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20B%C4%81z%C4%81r%20street",
        "alt": "Qarah Bāgh Bāzār street scene",
        "caption": "An atmospheric look at Qarah Bāgh Bāzār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarah%20B%C4%81gh%20B%C4%81z%C4%81r%20lifestyle",
        "alt": "Qarah Bāgh Bāzār lifestyle",
        "caption": "Daily life and culture in Qarah Bāgh Bāzār."
      }
    ],
    "tags": [
      "wellness",
      "expat-friendly",
      "island",
      "climate"
    ]
  },
  {
    "slug": "zargar-n-af",
    "city": "Zargarān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for food, beach, healthcare and mild climate.",
    "overview": "Experience Zargarān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zargar%C4%81n%20skyline",
        "alt": "Zargarān skyline",
        "caption": "Zargarān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zargar%C4%81n%20street",
        "alt": "Zargarān street scene",
        "caption": "An atmospheric look at Zargarān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zargar%C4%81n%20lifestyle",
        "alt": "Zargarān lifestyle",
        "caption": "Daily life and culture in Zargarān."
      }
    ],
    "tags": [
      "food",
      "beach",
      "healthcare",
      "climate"
    ]
  },
  {
    "slug": "surkh-biland-af",
    "city": "Surkh Bilandī",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for outdoor recreation, retirement, lake and mild climate.",
    "overview": "Experience Surkh Bilandī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Surkh%20Biland%C4%AB%20skyline",
        "alt": "Surkh Bilandī skyline",
        "caption": "Surkh Bilandī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Surkh%20Biland%C4%AB%20street",
        "alt": "Surkh Bilandī street scene",
        "caption": "An atmospheric look at Surkh Bilandī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Surkh%20Biland%C4%AB%20lifestyle",
        "alt": "Surkh Bilandī lifestyle",
        "caption": "Daily life and culture in Surkh Bilandī."
      }
    ],
    "tags": [
      "outdoor recreation",
      "retirement",
      "lake",
      "safety"
    ]
  },
  {
    "slug": "pul-e-sang-af",
    "city": "Pul-e Sangī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for island, arts, healthcare and mild climate.",
    "overview": "Experience Pul-e Sangī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Sang%C4%AB%20skyline",
        "alt": "Pul-e Sangī skyline",
        "caption": "Pul-e Sangī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Sang%C4%AB%20street",
        "alt": "Pul-e Sangī street scene",
        "caption": "An atmospheric look at Pul-e Sangī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20Sang%C4%AB%20lifestyle",
        "alt": "Pul-e Sangī lifestyle",
        "caption": "Daily life and culture in Pul-e Sangī."
      }
    ],
    "tags": [
      "island",
      "arts",
      "healthcare",
      "slow pace"
    ]
  },
  {
    "slug": "langar-af",
    "city": "Langar",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.1,
    "description": "A destination known for safety, coast, history and mild climate.",
    "overview": "Experience Langar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Langar%20skyline",
        "alt": "Langar skyline",
        "caption": "Langar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Langar%20street",
        "alt": "Langar street scene",
        "caption": "An atmospheric look at Langar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Langar%20lifestyle",
        "alt": "Langar lifestyle",
        "caption": "Daily life and culture in Langar."
      }
    ],
    "tags": [
      "safety",
      "coast",
      "history",
      "arts"
    ]
  },
  {
    "slug": "b-gh-e-ma-d-n-af",
    "city": "Bāgh-e Maīdān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.1,
    "description": "A destination known for family, outdoor recreation, retirement and mild climate.",
    "overview": "Experience Bāgh-e Maīdān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81gh-e%20Ma%C4%ABd%C4%81n%20skyline",
        "alt": "Bāgh-e Maīdān skyline",
        "caption": "Bāgh-e Maīdān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81gh-e%20Ma%C4%ABd%C4%81n%20street",
        "alt": "Bāgh-e Maīdān street scene",
        "caption": "An atmospheric look at Bāgh-e Maīdān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81gh-e%20Ma%C4%ABd%C4%81n%20lifestyle",
        "alt": "Bāgh-e Maīdān lifestyle",
        "caption": "Daily life and culture in Bāgh-e Maīdān."
      }
    ],
    "tags": [
      "family",
      "outdoor recreation",
      "retirement",
      "luxury"
    ]
  },
  {
    "slug": "ibr-h-m-kh-n-af",
    "city": "Ibrāhīm Khān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.5,
    "description": "A destination known for golf, lake, island and mild climate.",
    "overview": "Experience Ibrāhīm Khān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ibr%C4%81h%C4%ABm%20Kh%C4%81n%20skyline",
        "alt": "Ibrāhīm Khān skyline",
        "caption": "Ibrāhīm Khān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ibr%C4%81h%C4%ABm%20Kh%C4%81n%20street",
        "alt": "Ibrāhīm Khān street scene",
        "caption": "An atmospheric look at Ibrāhīm Khān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ibr%C4%81h%C4%ABm%20Kh%C4%81n%20lifestyle",
        "alt": "Ibrāhīm Khān lifestyle",
        "caption": "Daily life and culture in Ibrāhīm Khān."
      }
    ],
    "tags": [
      "golf",
      "lake",
      "island",
      "startup"
    ]
  },
  {
    "slug": "qarangh-t-gha-af",
    "city": "Qaranghū Tōghaī",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.9,
    "description": "A destination known for expat-friendly, outdoor recreation, nature and mild climate.",
    "overview": "Experience Qaranghū Tōghaī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qarangh%C5%AB%20T%C5%8Dgha%C4%AB%20skyline",
        "alt": "Qaranghū Tōghaī skyline",
        "caption": "Qaranghū Tōghaī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarangh%C5%AB%20T%C5%8Dgha%C4%AB%20street",
        "alt": "Qaranghū Tōghaī street scene",
        "caption": "An atmospheric look at Qaranghū Tōghaī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qarangh%C5%AB%20T%C5%8Dgha%C4%AB%20lifestyle",
        "alt": "Qaranghū Tōghaī lifestyle",
        "caption": "Daily life and culture in Qaranghū Tōghaī."
      }
    ],
    "tags": [
      "expat-friendly",
      "outdoor recreation",
      "nature",
      "family"
    ]
  },
  {
    "slug": "b-z-rak-af",
    "city": "Bāzārak",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.2,
    "description": "A destination known for budget, healthcare, slow pace and mild climate.",
    "overview": "Experience Bāzārak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81rak%20skyline",
        "alt": "Bāzārak skyline",
        "caption": "Bāzārak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81rak%20street",
        "alt": "Bāzārak street scene",
        "caption": "An atmospheric look at Bāzārak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81z%C4%81rak%20lifestyle",
        "alt": "Bāzārak lifestyle",
        "caption": "Daily life and culture in Bāzārak."
      }
    ],
    "tags": [
      "budget",
      "healthcare",
      "slow pace",
      "mountains"
    ]
  },
  {
    "slug": "sh-rw-n-ye-b-l-af",
    "city": "Shērwānī-ye Bālā",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for food, mountains, nature and mild climate.",
    "overview": "Experience Shērwānī-ye Bālā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%93rw%C4%81n%C4%AB-ye%20B%C4%81l%C4%81%20skyline",
        "alt": "Shērwānī-ye Bālā skyline",
        "caption": "Shērwānī-ye Bālā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%93rw%C4%81n%C4%AB-ye%20B%C4%81l%C4%81%20street",
        "alt": "Shērwānī-ye Bālā street scene",
        "caption": "An atmospheric look at Shērwānī-ye Bālā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sh%C4%93rw%C4%81n%C4%AB-ye%20B%C4%81l%C4%81%20lifestyle",
        "alt": "Shērwānī-ye Bālā lifestyle",
        "caption": "Daily life and culture in Shērwānī-ye Bālā."
      }
    ],
    "tags": [
      "food",
      "mountains",
      "nature",
      "family"
    ]
  },
  {
    "slug": "kir-m-n-af",
    "city": "Kirāmān",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for golf, history, food and mild climate.",
    "overview": "Experience Kirāmān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kir%C4%81m%C4%81n%20skyline",
        "alt": "Kirāmān skyline",
        "caption": "Kirāmān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kir%C4%81m%C4%81n%20street",
        "alt": "Kirāmān street scene",
        "caption": "An atmospheric look at Kirāmān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kir%C4%81m%C4%81n%20lifestyle",
        "alt": "Kirāmān lifestyle",
        "caption": "Daily life and culture in Kirāmān."
      }
    ],
    "tags": [
      "golf",
      "history",
      "food",
      "startup"
    ]
  },
  {
    "slug": "al-qahd-r-sa-b-af",
    "city": "‘Alāqahdārī Saṟōbī",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.7,
    "description": "A destination known for luxury, healthcare, eco and mild climate.",
    "overview": "Experience ‘Alāqahdārī Saṟōbī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sa%E1%B9%9F%C5%8Db%C4%AB%20skyline",
        "alt": "‘Alāqahdārī Saṟōbī skyline",
        "caption": "‘Alāqahdārī Saṟōbī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sa%E1%B9%9F%C5%8Db%C4%AB%20street",
        "alt": "‘Alāqahdārī Saṟōbī street scene",
        "caption": "An atmospheric look at ‘Alāqahdārī Saṟōbī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20Sa%E1%B9%9F%C5%8Db%C4%AB%20lifestyle",
        "alt": "‘Alāqahdārī Saṟōbī lifestyle",
        "caption": "Daily life and culture in ‘Alāqahdārī Saṟōbī."
      }
    ],
    "tags": [
      "luxury",
      "healthcare",
      "eco",
      "retirement"
    ]
  },
  {
    "slug": "z-k-al-qahd-r-af",
    "city": "Zīṟūk ‘Alāqahdārī",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.4,
    "description": "A destination known for healthcare, digital nomad, food and mild climate.",
    "overview": "Experience Zīṟūk ‘Alāqahdārī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%E1%B9%9F%C5%ABk%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20skyline",
        "alt": "Zīṟūk ‘Alāqahdārī skyline",
        "caption": "Zīṟūk ‘Alāqahdārī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%E1%B9%9F%C5%ABk%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20street",
        "alt": "Zīṟūk ‘Alāqahdārī street scene",
        "caption": "An atmospheric look at Zīṟūk ‘Alāqahdārī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%AB%E1%B9%9F%C5%ABk%20%E2%80%98Al%C4%81qahd%C4%81r%C4%AB%20lifestyle",
        "alt": "Zīṟūk ‘Alāqahdārī lifestyle",
        "caption": "Daily life and culture in Zīṟūk ‘Alāqahdārī."
      }
    ],
    "tags": [
      "healthcare",
      "digital nomad",
      "food",
      "climate"
    ]
  },
  {
    "slug": "kushkak-af",
    "city": "Kushkak",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for wellness, arts, nightlife and mild climate.",
    "overview": "Experience Kushkak's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kushkak%20skyline",
        "alt": "Kushkak skyline",
        "caption": "Kushkak cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushkak%20street",
        "alt": "Kushkak street scene",
        "caption": "An atmospheric look at Kushkak's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kushkak%20lifestyle",
        "alt": "Kushkak lifestyle",
        "caption": "Daily life and culture in Kushkak."
      }
    ],
    "tags": [
      "wellness",
      "arts",
      "nightlife",
      "climate"
    ]
  },
  {
    "slug": "khayr-k-af",
    "city": "Khayr Kōṯ",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for outdoor recreation, arts, eco and mild climate.",
    "overview": "Experience Khayr Kōṯ's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Khayr%20K%C5%8D%E1%B9%AF%20skyline",
        "alt": "Khayr Kōṯ skyline",
        "caption": "Khayr Kōṯ cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khayr%20K%C5%8D%E1%B9%AF%20street",
        "alt": "Khayr Kōṯ street scene",
        "caption": "An atmospheric look at Khayr Kōṯ's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Khayr%20K%C5%8D%E1%B9%AF%20lifestyle",
        "alt": "Khayr Kōṯ lifestyle",
        "caption": "Daily life and culture in Khayr Kōṯ."
      }
    ],
    "tags": [
      "outdoor recreation",
      "arts",
      "eco",
      "wellness"
    ]
  },
  {
    "slug": "chow-y-af",
    "city": "Chowṉêy",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.7,
    "description": "A destination known for startup, digital nomad, luxury and mild climate.",
    "overview": "Experience Chowṉêy's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chow%E1%B9%89%C3%AAy%20skyline",
        "alt": "Chowṉêy skyline",
        "caption": "Chowṉêy cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chow%E1%B9%89%C3%AAy%20street",
        "alt": "Chowṉêy street scene",
        "caption": "An atmospheric look at Chowṉêy's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chow%E1%B9%89%C3%AAy%20lifestyle",
        "alt": "Chowṉêy lifestyle",
        "caption": "Daily life and culture in Chowṉêy."
      }
    ],
    "tags": [
      "startup",
      "digital nomad",
      "luxury",
      "food"
    ]
  },
  {
    "slug": "wu-ahp-r-af",
    "city": "Wuṯahpūr",
    "country": "AF",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for startup, walkability, retirement and mild climate.",
    "overview": "Experience Wuṯahpūr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Wu%E1%B9%AFahp%C5%ABr%20skyline",
        "alt": "Wuṯahpūr skyline",
        "caption": "Wuṯahpūr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wu%E1%B9%AFahp%C5%ABr%20street",
        "alt": "Wuṯahpūr street scene",
        "caption": "An atmospheric look at Wuṯahpūr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Wu%E1%B9%AFahp%C5%ABr%20lifestyle",
        "alt": "Wuṯahpūr lifestyle",
        "caption": "Daily life and culture in Wuṯahpūr."
      }
    ],
    "tags": [
      "startup",
      "walkability",
      "retirement",
      "eco"
    ]
  },
  {
    "slug": "karb-af",
    "city": "Karbōṟī",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for island, outdoor recreation, eco and mild climate.",
    "overview": "Experience Karbōṟī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Karb%C5%8D%E1%B9%9F%C4%AB%20skyline",
        "alt": "Karbōṟī skyline",
        "caption": "Karbōṟī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Karb%C5%8D%E1%B9%9F%C4%AB%20street",
        "alt": "Karbōṟī street scene",
        "caption": "An atmospheric look at Karbōṟī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Karb%C5%8D%E1%B9%9F%C4%AB%20lifestyle",
        "alt": "Karbōṟī lifestyle",
        "caption": "Daily life and culture in Karbōṟī."
      }
    ],
    "tags": [
      "island",
      "outdoor recreation",
      "eco",
      "lake"
    ]
  },
  {
    "slug": "sul-np-r-e-uly-af",
    "city": "Sulţānpūr-e ‘Ulyā",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.8,
    "description": "A destination known for walkability, expat-friendly, nature and mild climate.",
    "overview": "Experience Sulţānpūr-e ‘Ulyā's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sul%C5%A3%C4%81np%C5%ABr-e%20%E2%80%98Uly%C4%81%20skyline",
        "alt": "Sulţānpūr-e ‘Ulyā skyline",
        "caption": "Sulţānpūr-e ‘Ulyā cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sul%C5%A3%C4%81np%C5%ABr-e%20%E2%80%98Uly%C4%81%20street",
        "alt": "Sulţānpūr-e ‘Ulyā street scene",
        "caption": "An atmospheric look at Sulţānpūr-e ‘Ulyā's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sul%C5%A3%C4%81np%C5%ABr-e%20%E2%80%98Uly%C4%81%20lifestyle",
        "alt": "Sulţānpūr-e ‘Ulyā lifestyle",
        "caption": "Daily life and culture in Sulţānpūr-e ‘Ulyā."
      }
    ],
    "tags": [
      "walkability",
      "expat-friendly",
      "nature",
      "lake"
    ]
  },
  {
    "slug": "b-b-ib-af",
    "city": "Bābā Şāḩib",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.4,
    "description": "A destination known for food, retirement, nature and mild climate.",
    "overview": "Experience Bābā Şāḩib's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81b%C4%81%20%C5%9E%C4%81%E1%B8%A9ib%20skyline",
        "alt": "Bābā Şāḩib skyline",
        "caption": "Bābā Şāḩib cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81b%C4%81%20%C5%9E%C4%81%E1%B8%A9ib%20street",
        "alt": "Bābā Şāḩib street scene",
        "caption": "An atmospheric look at Bābā Şāḩib's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?B%C4%81b%C4%81%20%C5%9E%C4%81%E1%B8%A9ib%20lifestyle",
        "alt": "Bābā Şāḩib lifestyle",
        "caption": "Daily life and culture in Bābā Şāḩib."
      }
    ],
    "tags": [
      "food",
      "retirement",
      "nature",
      "golf"
    ]
  },
  {
    "slug": "chandal-b-af",
    "city": "Chandal Bā’ī",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for climate, startup, luxury and mild climate.",
    "overview": "Experience Chandal Bā’ī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Chandal%20B%C4%81%E2%80%99%C4%AB%20skyline",
        "alt": "Chandal Bā’ī skyline",
        "caption": "Chandal Bā’ī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chandal%20B%C4%81%E2%80%99%C4%AB%20street",
        "alt": "Chandal Bā’ī street scene",
        "caption": "An atmospheric look at Chandal Bā’ī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Chandal%20B%C4%81%E2%80%99%C4%AB%20lifestyle",
        "alt": "Chandal Bā’ī lifestyle",
        "caption": "Daily life and culture in Chandal Bā’ī."
      }
    ],
    "tags": [
      "climate",
      "startup",
      "luxury",
      "budget"
    ]
  },
  {
    "slug": "dahan-e-jarf-af",
    "city": "Dahan-e Jarf",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.9,
    "description": "A destination known for healthcare, startup, coast and mild climate.",
    "overview": "Experience Dahan-e Jarf's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dahan-e%20Jarf%20skyline",
        "alt": "Dahan-e Jarf skyline",
        "caption": "Dahan-e Jarf cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dahan-e%20Jarf%20street",
        "alt": "Dahan-e Jarf street scene",
        "caption": "An atmospheric look at Dahan-e Jarf's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dahan-e%20Jarf%20lifestyle",
        "alt": "Dahan-e Jarf lifestyle",
        "caption": "Daily life and culture in Dahan-e Jarf."
      }
    ],
    "tags": [
      "healthcare",
      "startup",
      "coast",
      "expat-friendly"
    ]
  },
  {
    "slug": "maydanshakhr-af",
    "city": "Maydanshakhr",
    "country": "AF",
    "emoji": "🌍",
    "match": 94,
    "description": "A destination known for family, outdoor recreation, walkability and mild climate.",
    "overview": "Experience Maydanshakhr's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Maydanshakhr%20skyline",
        "alt": "Maydanshakhr skyline",
        "caption": "Maydanshakhr cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maydanshakhr%20street",
        "alt": "Maydanshakhr street scene",
        "caption": "An atmospheric look at Maydanshakhr's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Maydanshakhr%20lifestyle",
        "alt": "Maydanshakhr lifestyle",
        "caption": "Daily life and culture in Maydanshakhr."
      }
    ],
    "tags": [
      "family",
      "outdoor recreation",
      "walkability",
      "history"
    ]
  },
  {
    "slug": "d-la-nah-af",
    "city": "Dū Laīnah",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for luxury, digital nomad, walkability and mild climate.",
    "overview": "Experience Dū Laīnah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20La%C4%ABnah%20skyline",
        "alt": "Dū Laīnah skyline",
        "caption": "Dū Laīnah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20La%C4%ABnah%20street",
        "alt": "Dū Laīnah street scene",
        "caption": "An atmospheric look at Dū Laīnah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?D%C5%AB%20La%C4%ABnah%20lifestyle",
        "alt": "Dū Laīnah lifestyle",
        "caption": "Daily life and culture in Dū Laīnah."
      }
    ],
    "tags": [
      "luxury",
      "digital nomad",
      "walkability",
      "arts"
    ]
  },
  {
    "slug": "qaram-q-l-af",
    "city": "Qaram Qōl",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for expat-friendly, arts, beach and mild climate.",
    "overview": "Experience Qaram Qōl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qaram%20Q%C5%8Dl%20skyline",
        "alt": "Qaram Qōl skyline",
        "caption": "Qaram Qōl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qaram%20Q%C5%8Dl%20street",
        "alt": "Qaram Qōl street scene",
        "caption": "An atmospheric look at Qaram Qōl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qaram%20Q%C5%8Dl%20lifestyle",
        "alt": "Qaram Qōl lifestyle",
        "caption": "Daily life and culture in Qaram Qōl."
      }
    ],
    "tags": [
      "expat-friendly",
      "arts",
      "beach",
      "eco"
    ]
  },
  {
    "slug": "pul-e-i-r-af",
    "city": "Pul-e Ḩişār",
    "country": "AF",
    "emoji": "🌍",
    "match": 97.9,
    "description": "A destination known for climate, walkability, food and mild climate.",
    "overview": "Experience Pul-e Ḩişār's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E1%B8%A8i%C5%9F%C4%81r%20skyline",
        "alt": "Pul-e Ḩişār skyline",
        "caption": "Pul-e Ḩişār cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E1%B8%A8i%C5%9F%C4%81r%20street",
        "alt": "Pul-e Ḩişār street scene",
        "caption": "An atmospheric look at Pul-e Ḩişār's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pul-e%20%E1%B8%A8i%C5%9F%C4%81r%20lifestyle",
        "alt": "Pul-e Ḩişār lifestyle",
        "caption": "Daily life and culture in Pul-e Ḩişār."
      }
    ],
    "tags": [
      "climate",
      "walkability",
      "food",
      "digital nomad"
    ]
  },
  {
    "slug": "lab-sar-af",
    "city": "Lab-Sar",
    "country": "AF",
    "emoji": "🌍",
    "match": 99.1,
    "description": "A destination known for history, family, climate and mild climate.",
    "overview": "Experience Lab-Sar's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Lab-Sar%20skyline",
        "alt": "Lab-Sar skyline",
        "caption": "Lab-Sar cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lab-Sar%20street",
        "alt": "Lab-Sar street scene",
        "caption": "An atmospheric look at Lab-Sar's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Lab-Sar%20lifestyle",
        "alt": "Lab-Sar lifestyle",
        "caption": "Daily life and culture in Lab-Sar."
      }
    ],
    "tags": [
      "history",
      "family",
      "climate",
      "coast"
    ]
  },
  {
    "slug": "qchah-kh-nah-af",
    "city": "Ţāqchah Khānah",
    "country": "AF",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for nightlife, family, safety and mild climate.",
    "overview": "Experience Ţāqchah Khānah's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2%C4%81qchah%20Kh%C4%81nah%20skyline",
        "alt": "Ţāqchah Khānah skyline",
        "caption": "Ţāqchah Khānah cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2%C4%81qchah%20Kh%C4%81nah%20street",
        "alt": "Ţāqchah Khānah street scene",
        "caption": "An atmospheric look at Ţāqchah Khānah's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%C5%A2%C4%81qchah%20Kh%C4%81nah%20lifestyle",
        "alt": "Ţāqchah Khānah lifestyle",
        "caption": "Daily life and culture in Ţāqchah Khānah."
      }
    ],
    "tags": [
      "nightlife",
      "family",
      "safety",
      "expat-friendly"
    ]
  },
  {
    "slug": "march-af",
    "city": "March",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.4,
    "description": "A destination known for eco, luxury, family and mild climate.",
    "overview": "Experience March's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?March%20skyline",
        "alt": "March skyline",
        "caption": "March cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?March%20street",
        "alt": "March street scene",
        "caption": "An atmospheric look at March's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?March%20lifestyle",
        "alt": "March lifestyle",
        "caption": "Daily life and culture in March."
      }
    ],
    "tags": [
      "eco",
      "luxury",
      "family",
      "walkability"
    ]
  },
  {
    "slug": "z-rak-af",
    "city": "Zīrakī",
    "country": "AF",
    "emoji": "🌍",
    "match": 93.7,
    "description": "A destination known for walkability, island, nightlife and mild climate.",
    "overview": "Experience Zīrakī's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%ABrak%C4%AB%20skyline",
        "alt": "Zīrakī skyline",
        "caption": "Zīrakī cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%ABrak%C4%AB%20street",
        "alt": "Zīrakī street scene",
        "caption": "An atmospheric look at Zīrakī's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Z%C4%ABrak%C4%AB%20lifestyle",
        "alt": "Zīrakī lifestyle",
        "caption": "Daily life and culture in Zīrakī."
      }
    ],
    "tags": [
      "walkability",
      "island",
      "nightlife",
      "climate"
    ]
  },
  {
    "slug": "al-b-d-af",
    "city": "‘Alīābād",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.7,
    "description": "A destination known for retirement, healthcare, beach and mild climate.",
    "overview": "Experience ‘Alīābād's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%C4%81b%C4%81d%20skyline",
        "alt": "‘Alīābād skyline",
        "caption": "‘Alīābād cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%C4%81b%C4%81d%20street",
        "alt": "‘Alīābād street scene",
        "caption": "An atmospheric look at ‘Alīābād's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?%E2%80%98Al%C4%AB%C4%81b%C4%81d%20lifestyle",
        "alt": "‘Alīābād lifestyle",
        "caption": "Daily life and culture in ‘Alīābād."
      }
    ],
    "tags": [
      "retirement",
      "healthcare",
      "beach",
      "mountains"
    ]
  },
  {
    "slug": "pas-pul-af",
    "city": "Pas Pul",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for golf, luxury, slow pace and mild climate.",
    "overview": "Experience Pas Pul's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Pas%20Pul%20skyline",
        "alt": "Pas Pul skyline",
        "caption": "Pas Pul cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%20Pul%20street",
        "alt": "Pas Pul street scene",
        "caption": "An atmospheric look at Pas Pul's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Pas%20Pul%20lifestyle",
        "alt": "Pas Pul lifestyle",
        "caption": "Daily life and culture in Pas Pul."
      }
    ],
    "tags": [
      "golf",
      "luxury",
      "slow pace",
      "budget"
    ]
  },
  {
    "slug": "qal-ah-ye-na-m-af",
    "city": "Qal‘ah-ye Na‘īm",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.8,
    "description": "A destination known for golf, mountains, lake and mild climate.",
    "overview": "Experience Qal‘ah-ye Na‘īm's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Na%E2%80%98%C4%ABm%20skyline",
        "alt": "Qal‘ah-ye Na‘īm skyline",
        "caption": "Qal‘ah-ye Na‘īm cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Na%E2%80%98%C4%ABm%20street",
        "alt": "Qal‘ah-ye Na‘īm street scene",
        "caption": "An atmospheric look at Qal‘ah-ye Na‘īm's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Qal%E2%80%98ah-ye%20Na%E2%80%98%C4%ABm%20lifestyle",
        "alt": "Qal‘ah-ye Na‘īm lifestyle",
        "caption": "Daily life and culture in Qal‘ah-ye Na‘īm."
      }
    ],
    "tags": [
      "golf",
      "mountains",
      "lake",
      "walkability"
    ]
  },
  {
    "slug": "markaz-e-woluswal-ye-ch-n-af",
    "city": "Markaz-e Woluswalī-ye Āchīn",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for retirement, island, beach and mild climate.",
    "overview": "Experience Markaz-e Woluswalī-ye Āchīn's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Woluswal%C4%AB-ye%20%C4%80ch%C4%ABn%20skyline",
        "alt": "Markaz-e Woluswalī-ye Āchīn skyline",
        "caption": "Markaz-e Woluswalī-ye Āchīn cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Woluswal%C4%AB-ye%20%C4%80ch%C4%ABn%20street",
        "alt": "Markaz-e Woluswalī-ye Āchīn street scene",
        "caption": "An atmospheric look at Markaz-e Woluswalī-ye Āchīn's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markaz-e%20Woluswal%C4%AB-ye%20%C4%80ch%C4%ABn%20lifestyle",
        "alt": "Markaz-e Woluswalī-ye Āchīn lifestyle",
        "caption": "Daily life and culture in Markaz-e Woluswalī-ye Āchīn."
      }
    ],
    "tags": [
      "retirement",
      "island",
      "beach",
      "lake"
    ]
  },
  {
    "slug": "m-gay-af",
    "city": "Māṉōgay",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.9,
    "description": "A destination known for wellness, budget, slow pace and mild climate.",
    "overview": "Experience Māṉōgay's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81%E1%B9%89%C5%8Dgay%20skyline",
        "alt": "Māṉōgay skyline",
        "caption": "Māṉōgay cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81%E1%B9%89%C5%8Dgay%20street",
        "alt": "Māṉōgay street scene",
        "caption": "An atmospheric look at Māṉōgay's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?M%C4%81%E1%B9%89%C5%8Dgay%20lifestyle",
        "alt": "Māṉōgay lifestyle",
        "caption": "Daily life and culture in Māṉōgay."
      }
    ],
    "tags": [
      "wellness",
      "budget",
      "slow pace",
      "eco"
    ]
  },
  {
    "slug": "st-r-giy-n-af",
    "city": "Stêr Giyān",
    "country": "AF",
    "emoji": "🌍",
    "match": 98.8,
    "description": "A destination known for outdoor recreation, history, lake and mild climate.",
    "overview": "Experience Stêr Giyān's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St%C3%AAr%20Giy%C4%81n%20skyline",
        "alt": "Stêr Giyān skyline",
        "caption": "Stêr Giyān cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St%C3%AAr%20Giy%C4%81n%20street",
        "alt": "Stêr Giyān street scene",
        "caption": "An atmospheric look at Stêr Giyān's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St%C3%AAr%20Giy%C4%81n%20lifestyle",
        "alt": "Stêr Giyān lifestyle",
        "caption": "Daily life and culture in Stêr Giyān."
      }
    ],
    "tags": [
      "outdoor recreation",
      "history",
      "lake",
      "nature"
    ]
  },
  {
    "slug": "sharan-af",
    "city": "Sharan",
    "country": "AF",
    "emoji": "🌍",
    "match": 92,
    "description": "A destination known for food, climate, nature and mild climate.",
    "overview": "Experience Sharan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sharan%20skyline",
        "alt": "Sharan skyline",
        "caption": "Sharan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sharan%20street",
        "alt": "Sharan street scene",
        "caption": "An atmospheric look at Sharan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sharan%20lifestyle",
        "alt": "Sharan lifestyle",
        "caption": "Daily life and culture in Sharan."
      }
    ],
    "tags": [
      "food",
      "climate",
      "nature",
      "slow pace"
    ]
  },
  {
    "slug": "sal-m-kh-l-af",
    "city": "Salām Khēl",
    "country": "AF",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for family, climate, nature and mild climate.",
    "overview": "Experience Salām Khēl's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sal%C4%81m%20Kh%C4%93l%20skyline",
        "alt": "Salām Khēl skyline",
        "caption": "Salām Khēl cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sal%C4%81m%20Kh%C4%93l%20street",
        "alt": "Salām Khēl street scene",
        "caption": "An atmospheric look at Salām Khēl's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sal%C4%81m%20Kh%C4%93l%20lifestyle",
        "alt": "Salām Khēl lifestyle",
        "caption": "Daily life and culture in Salām Khēl."
      }
    ],
    "tags": [
      "family",
      "climate",
      "nature",
      "arts"
    ]
  },
  {
    "slug": "mazad-af",
    "city": "Mazad",
    "country": "AF",
    "emoji": "🌍",
    "match": 94.4,
    "description": "A destination known for healthcare, coast, budget and mild climate.",
    "overview": "Experience Mazad's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mazad%20skyline",
        "alt": "Mazad skyline",
        "caption": "Mazad cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mazad%20street",
        "alt": "Mazad street scene",
        "caption": "An atmospheric look at Mazad's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mazad%20lifestyle",
        "alt": "Mazad lifestyle",
        "caption": "Daily life and culture in Mazad."
      }
    ],
    "tags": [
      "healthcare",
      "coast",
      "budget",
      "culture"
    ]
  },
  {
    "slug": "willikies-ag",
    "city": "Willikies",
    "country": "AG",
    "emoji": "🌍",
    "match": 98.4,
    "description": "A destination known for budget, history, food and mild climate.",
    "overview": "Experience Willikies's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Willikies%20skyline",
        "alt": "Willikies skyline",
        "caption": "Willikies cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Willikies%20street",
        "alt": "Willikies street scene",
        "caption": "An atmospheric look at Willikies's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Willikies%20lifestyle",
        "alt": "Willikies lifestyle",
        "caption": "Daily life and culture in Willikies."
      }
    ],
    "tags": [
      "budget",
      "history",
      "food",
      "nature"
    ]
  },
  {
    "slug": "swetes-ag",
    "city": "Swetes",
    "country": "AG",
    "emoji": "🌍",
    "match": 94,
    "description": "A destination known for beach, safety, digital nomad and mild climate.",
    "overview": "Experience Swetes's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Swetes%20skyline",
        "alt": "Swetes skyline",
        "caption": "Swetes cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Swetes%20street",
        "alt": "Swetes street scene",
        "caption": "An atmospheric look at Swetes's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Swetes%20lifestyle",
        "alt": "Swetes lifestyle",
        "caption": "Daily life and culture in Swetes."
      }
    ],
    "tags": [
      "beach",
      "safety",
      "digital nomad",
      "eco"
    ]
  },
  {
    "slug": "saint-john-s-ag",
    "city": "Saint John’s",
    "country": "AG",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for mountains, walkability, food and mild climate.",
    "overview": "Experience Saint John’s's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Saint%20John%E2%80%99s%20skyline",
        "alt": "Saint John’s skyline",
        "caption": "Saint John’s cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Saint%20John%E2%80%99s%20street",
        "alt": "Saint John’s street scene",
        "caption": "An atmospheric look at Saint John’s's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Saint%20John%E2%80%99s%20lifestyle",
        "alt": "Saint John’s lifestyle",
        "caption": "Daily life and culture in Saint John’s."
      }
    ],
    "tags": [
      "mountains",
      "walkability",
      "food",
      "nature"
    ]
  },
  {
    "slug": "potters-village-ag",
    "city": "Potters Village",
    "country": "AG",
    "emoji": "🌍",
    "match": 97.5,
    "description": "A destination known for lake, retirement, luxury and mild climate.",
    "overview": "Experience Potters Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Potters%20Village%20skyline",
        "alt": "Potters Village skyline",
        "caption": "Potters Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Potters%20Village%20street",
        "alt": "Potters Village street scene",
        "caption": "An atmospheric look at Potters Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Potters%20Village%20lifestyle",
        "alt": "Potters Village lifestyle",
        "caption": "Daily life and culture in Potters Village."
      }
    ],
    "tags": [
      "lake",
      "retirement",
      "luxury",
      "island"
    ]
  },
  {
    "slug": "piggotts-ag",
    "city": "Piggotts",
    "country": "AG",
    "emoji": "🌍",
    "match": 92.3,
    "description": "A destination known for startup, retirement, healthcare and mild climate.",
    "overview": "Experience Piggotts's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Piggotts%20skyline",
        "alt": "Piggotts skyline",
        "caption": "Piggotts cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Piggotts%20street",
        "alt": "Piggotts street scene",
        "caption": "An atmospheric look at Piggotts's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Piggotts%20lifestyle",
        "alt": "Piggotts lifestyle",
        "caption": "Daily life and culture in Piggotts."
      }
    ],
    "tags": [
      "startup",
      "retirement",
      "healthcare",
      "island"
    ]
  },
  {
    "slug": "parham-ag",
    "city": "Parham",
    "country": "AG",
    "emoji": "🌍",
    "match": 92,
    "description": "A destination known for family, digital nomad, walkability and mild climate.",
    "overview": "Experience Parham's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Parham%20skyline",
        "alt": "Parham skyline",
        "caption": "Parham cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Parham%20street",
        "alt": "Parham street scene",
        "caption": "An atmospheric look at Parham's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Parham%20lifestyle",
        "alt": "Parham lifestyle",
        "caption": "Daily life and culture in Parham."
      }
    ],
    "tags": [
      "family",
      "digital nomad",
      "walkability",
      "eco"
    ]
  },
  {
    "slug": "new-winthorpes-ag",
    "city": "New Winthorpes",
    "country": "AG",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for budget, walkability, beach and mild climate.",
    "overview": "Experience New Winthorpes's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?New%20Winthorpes%20skyline",
        "alt": "New Winthorpes skyline",
        "caption": "New Winthorpes cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?New%20Winthorpes%20street",
        "alt": "New Winthorpes street scene",
        "caption": "An atmospheric look at New Winthorpes's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?New%20Winthorpes%20lifestyle",
        "alt": "New Winthorpes lifestyle",
        "caption": "Daily life and culture in New Winthorpes."
      }
    ],
    "tags": [
      "budget",
      "walkability",
      "beach",
      "history"
    ]
  },
  {
    "slug": "liberta-ag",
    "city": "Liberta",
    "country": "AG",
    "emoji": "🌍",
    "match": 98.7,
    "description": "A destination known for history, safety, culture and mild climate.",
    "overview": "Experience Liberta's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Liberta%20skyline",
        "alt": "Liberta skyline",
        "caption": "Liberta cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Liberta%20street",
        "alt": "Liberta street scene",
        "caption": "An atmospheric look at Liberta's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Liberta%20lifestyle",
        "alt": "Liberta lifestyle",
        "caption": "Daily life and culture in Liberta."
      }
    ],
    "tags": [
      "history",
      "safety",
      "culture",
      "climate"
    ]
  },
  {
    "slug": "falmouth-ag",
    "city": "Falmouth",
    "country": "AG",
    "emoji": "🌍",
    "match": 92.1,
    "description": "A destination known for safety, wellness, nature and mild climate.",
    "overview": "Experience Falmouth's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Falmouth%20skyline",
        "alt": "Falmouth skyline",
        "caption": "Falmouth cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Falmouth%20street",
        "alt": "Falmouth street scene",
        "caption": "An atmospheric look at Falmouth's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Falmouth%20lifestyle",
        "alt": "Falmouth lifestyle",
        "caption": "Daily life and culture in Falmouth."
      }
    ],
    "tags": [
      "safety",
      "wellness",
      "nature",
      "arts"
    ]
  },
  {
    "slug": "codrington-ag",
    "city": "Codrington",
    "country": "AG",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for coast, family, startup and mild climate.",
    "overview": "Experience Codrington's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Codrington%20skyline",
        "alt": "Codrington skyline",
        "caption": "Codrington cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Codrington%20street",
        "alt": "Codrington street scene",
        "caption": "An atmospheric look at Codrington's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Codrington%20lifestyle",
        "alt": "Codrington lifestyle",
        "caption": "Daily life and culture in Codrington."
      }
    ],
    "tags": [
      "coast",
      "family",
      "startup",
      "eco"
    ]
  },
  {
    "slug": "bolands-ag",
    "city": "Bolands",
    "country": "AG",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for retirement, healthcare, mountains and mild climate.",
    "overview": "Experience Bolands's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bolands%20skyline",
        "alt": "Bolands skyline",
        "caption": "Bolands cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bolands%20street",
        "alt": "Bolands street scene",
        "caption": "An atmospheric look at Bolands's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bolands%20lifestyle",
        "alt": "Bolands lifestyle",
        "caption": "Daily life and culture in Bolands."
      }
    ],
    "tags": [
      "retirement",
      "healthcare",
      "mountains",
      "slow pace"
    ]
  },
  {
    "slug": "all-saints-ag",
    "city": "All Saints",
    "country": "AG",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for lake, retirement, eco and mild climate.",
    "overview": "Experience All Saints's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?All%20Saints%20skyline",
        "alt": "All Saints skyline",
        "caption": "All Saints cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?All%20Saints%20street",
        "alt": "All Saints street scene",
        "caption": "An atmospheric look at All Saints's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?All%20Saints%20lifestyle",
        "alt": "All Saints lifestyle",
        "caption": "Daily life and culture in All Saints."
      }
    ],
    "tags": [
      "lake",
      "retirement",
      "eco",
      "walkability"
    ]
  },
  {
    "slug": "sugar-factory-ag",
    "city": "Sugar Factory",
    "country": "AG",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for healthcare, nightlife, island and mild climate.",
    "overview": "Experience Sugar Factory's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sugar%20Factory%20skyline",
        "alt": "Sugar Factory skyline",
        "caption": "Sugar Factory cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sugar%20Factory%20street",
        "alt": "Sugar Factory street scene",
        "caption": "An atmospheric look at Sugar Factory's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sugar%20Factory%20lifestyle",
        "alt": "Sugar Factory lifestyle",
        "caption": "Daily life and culture in Sugar Factory."
      }
    ],
    "tags": [
      "healthcare",
      "nightlife",
      "island",
      "mountains"
    ]
  },
  {
    "slug": "jacks-hill-ag",
    "city": "Jacks Hill",
    "country": "AG",
    "emoji": "🌍",
    "match": 92.8,
    "description": "A destination known for nightlife, luxury, culture and mild climate.",
    "overview": "Experience Jacks Hill's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Jacks%20Hill%20skyline",
        "alt": "Jacks Hill skyline",
        "caption": "Jacks Hill cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jacks%20Hill%20street",
        "alt": "Jacks Hill street scene",
        "caption": "An atmospheric look at Jacks Hill's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Jacks%20Hill%20lifestyle",
        "alt": "Jacks Hill lifestyle",
        "caption": "Daily life and culture in Jacks Hill."
      }
    ],
    "tags": [
      "nightlife",
      "luxury",
      "culture",
      "healthcare"
    ]
  },
  {
    "slug": "st-paul-parish-ag",
    "city": "St. Paul Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 95.6,
    "description": "A destination known for wellness, startup, budget and mild climate.",
    "overview": "Experience St. Paul Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St.%20Paul%20Parish%20skyline",
        "alt": "St. Paul Parish skyline",
        "caption": "St. Paul Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Paul%20Parish%20street",
        "alt": "St. Paul Parish street scene",
        "caption": "An atmospheric look at St. Paul Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Paul%20Parish%20lifestyle",
        "alt": "St. Paul Parish lifestyle",
        "caption": "Daily life and culture in St. Paul Parish."
      }
    ],
    "tags": [
      "wellness",
      "startup",
      "budget",
      "eco"
    ]
  },
  {
    "slug": "barbuda-parish-ag",
    "city": "Barbuda Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 95.5,
    "description": "A destination known for coast, history, startup and mild climate.",
    "overview": "Experience Barbuda Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Barbuda%20Parish%20skyline",
        "alt": "Barbuda Parish skyline",
        "caption": "Barbuda Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barbuda%20Parish%20street",
        "alt": "Barbuda Parish street scene",
        "caption": "An atmospheric look at Barbuda Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Barbuda%20Parish%20lifestyle",
        "alt": "Barbuda Parish lifestyle",
        "caption": "Daily life and culture in Barbuda Parish."
      }
    ],
    "tags": [
      "coast",
      "history",
      "startup",
      "walkability"
    ]
  },
  {
    "slug": "st-george-parish-ag",
    "city": "St. George Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for lake, slow pace, climate and mild climate.",
    "overview": "Experience St. George Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St.%20George%20Parish%20skyline",
        "alt": "St. George Parish skyline",
        "caption": "St. George Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20George%20Parish%20street",
        "alt": "St. George Parish street scene",
        "caption": "An atmospheric look at St. George Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20George%20Parish%20lifestyle",
        "alt": "St. George Parish lifestyle",
        "caption": "Daily life and culture in St. George Parish."
      }
    ],
    "tags": [
      "lake",
      "slow pace",
      "climate",
      "mountains"
    ]
  },
  {
    "slug": "st-peter-parish-ag",
    "city": "St. Peter Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 94.2,
    "description": "A destination known for history, digital nomad, mountains and mild climate.",
    "overview": "Experience St. Peter Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St.%20Peter%20Parish%20skyline",
        "alt": "St. Peter Parish skyline",
        "caption": "St. Peter Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Peter%20Parish%20street",
        "alt": "St. Peter Parish street scene",
        "caption": "An atmospheric look at St. Peter Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Peter%20Parish%20lifestyle",
        "alt": "St. Peter Parish lifestyle",
        "caption": "Daily life and culture in St. Peter Parish."
      }
    ],
    "tags": [
      "history",
      "digital nomad",
      "mountains",
      "family"
    ]
  },
  {
    "slug": "st-mary-parish-ag",
    "city": "St. Mary Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 98.9,
    "description": "A destination known for outdoor recreation, slow pace, beach and mild climate.",
    "overview": "Experience St. Mary Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St.%20Mary%20Parish%20skyline",
        "alt": "St. Mary Parish skyline",
        "caption": "St. Mary Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Mary%20Parish%20street",
        "alt": "St. Mary Parish street scene",
        "caption": "An atmospheric look at St. Mary Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Mary%20Parish%20lifestyle",
        "alt": "St. Mary Parish lifestyle",
        "caption": "Daily life and culture in St. Mary Parish."
      }
    ],
    "tags": [
      "outdoor recreation",
      "slow pace",
      "beach",
      "nature"
    ]
  },
  {
    "slug": "st-philip-parish-ag",
    "city": "St. Philip Parish",
    "country": "AG",
    "emoji": "🌍",
    "match": 99.4,
    "description": "A destination known for golf, healthcare, outdoor recreation and mild climate.",
    "overview": "Experience St. Philip Parish's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?St.%20Philip%20Parish%20skyline",
        "alt": "St. Philip Parish skyline",
        "caption": "St. Philip Parish cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Philip%20Parish%20street",
        "alt": "St. Philip Parish street scene",
        "caption": "An atmospheric look at St. Philip Parish's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?St.%20Philip%20Parish%20lifestyle",
        "alt": "St. Philip Parish lifestyle",
        "caption": "Daily life and culture in St. Philip Parish."
      }
    ],
    "tags": [
      "golf",
      "healthcare",
      "outdoor recreation",
      "climate"
    ]
  },
  {
    "slug": "west-end-village-ai",
    "city": "West End Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 96.1,
    "description": "A destination known for expat-friendly, healthcare, budget and mild climate.",
    "overview": "Experience West End Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?West%20End%20Village%20skyline",
        "alt": "West End Village skyline",
        "caption": "West End Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?West%20End%20Village%20street",
        "alt": "West End Village street scene",
        "caption": "An atmospheric look at West End Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?West%20End%20Village%20lifestyle",
        "alt": "West End Village lifestyle",
        "caption": "Daily life and culture in West End Village."
      }
    ],
    "tags": [
      "expat-friendly",
      "healthcare",
      "budget",
      "digital nomad"
    ]
  },
  {
    "slug": "the-valley-ai",
    "city": "The Valley",
    "country": "AI",
    "emoji": "🌍",
    "match": 96.6,
    "description": "A destination known for outdoor recreation, slow pace, luxury and mild climate.",
    "overview": "Experience The Valley's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?The%20Valley%20skyline",
        "alt": "The Valley skyline",
        "caption": "The Valley cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Valley%20street",
        "alt": "The Valley street scene",
        "caption": "An atmospheric look at The Valley's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Valley%20lifestyle",
        "alt": "The Valley lifestyle",
        "caption": "Daily life and culture in The Valley."
      }
    ],
    "tags": [
      "outdoor recreation",
      "slow pace",
      "luxury",
      "beach"
    ]
  },
  {
    "slug": "the-quarter-ai",
    "city": "The Quarter",
    "country": "AI",
    "emoji": "🌍",
    "match": 95.6,
    "description": "A destination known for nightlife, arts, food and mild climate.",
    "overview": "Experience The Quarter's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?The%20Quarter%20skyline",
        "alt": "The Quarter skyline",
        "caption": "The Quarter cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Quarter%20street",
        "alt": "The Quarter street scene",
        "caption": "An atmospheric look at The Quarter's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?The%20Quarter%20lifestyle",
        "alt": "The Quarter lifestyle",
        "caption": "Daily life and culture in The Quarter."
      }
    ],
    "tags": [
      "nightlife",
      "arts",
      "food",
      "retirement"
    ]
  },
  {
    "slug": "farrington-ai",
    "city": "Farrington",
    "country": "AI",
    "emoji": "🌍",
    "match": 97.9,
    "description": "A destination known for digital nomad, lake, culture and mild climate.",
    "overview": "Experience Farrington's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Farrington%20skyline",
        "alt": "Farrington skyline",
        "caption": "Farrington cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farrington%20street",
        "alt": "Farrington street scene",
        "caption": "An atmospheric look at Farrington's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Farrington%20lifestyle",
        "alt": "Farrington lifestyle",
        "caption": "Daily life and culture in Farrington."
      }
    ],
    "tags": [
      "digital nomad",
      "lake",
      "culture",
      "beach"
    ]
  },
  {
    "slug": "stoney-ground-ai",
    "city": "Stoney Ground",
    "country": "AI",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for mountains, lake, beach and mild climate.",
    "overview": "Experience Stoney Ground's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Stoney%20Ground%20skyline",
        "alt": "Stoney Ground skyline",
        "caption": "Stoney Ground cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Stoney%20Ground%20street",
        "alt": "Stoney Ground street scene",
        "caption": "An atmospheric look at Stoney Ground's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Stoney%20Ground%20lifestyle",
        "alt": "Stoney Ground lifestyle",
        "caption": "Daily life and culture in Stoney Ground."
      }
    ],
    "tags": [
      "mountains",
      "lake",
      "beach",
      "digital nomad"
    ]
  },
  {
    "slug": "south-hill-village-ai",
    "city": "South Hill Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 94.6,
    "description": "A destination known for nightlife, outdoor recreation, arts and mild climate.",
    "overview": "Experience South Hill Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?South%20Hill%20Village%20skyline",
        "alt": "South Hill Village skyline",
        "caption": "South Hill Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?South%20Hill%20Village%20street",
        "alt": "South Hill Village street scene",
        "caption": "An atmospheric look at South Hill Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?South%20Hill%20Village%20lifestyle",
        "alt": "South Hill Village lifestyle",
        "caption": "Daily life and culture in South Hill Village."
      }
    ],
    "tags": [
      "nightlife",
      "outdoor recreation",
      "arts",
      "coast"
    ]
  },
  {
    "slug": "sandy-ground-village-ai",
    "city": "Sandy Ground Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 93.5,
    "description": "A destination known for startup, nature, coast and mild climate.",
    "overview": "Experience Sandy Ground Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Ground%20Village%20skyline",
        "alt": "Sandy Ground Village skyline",
        "caption": "Sandy Ground Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Ground%20Village%20street",
        "alt": "Sandy Ground Village street scene",
        "caption": "An atmospheric look at Sandy Ground Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Ground%20Village%20lifestyle",
        "alt": "Sandy Ground Village lifestyle",
        "caption": "Daily life and culture in Sandy Ground Village."
      }
    ],
    "tags": [
      "startup",
      "nature",
      "coast",
      "culture"
    ]
  },
  {
    "slug": "north-side-ai",
    "city": "North Side",
    "country": "AI",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for island, eco, arts and mild climate.",
    "overview": "Experience North Side's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?North%20Side%20skyline",
        "alt": "North Side skyline",
        "caption": "North Side cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?North%20Side%20street",
        "alt": "North Side street scene",
        "caption": "An atmospheric look at North Side's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?North%20Side%20lifestyle",
        "alt": "North Side lifestyle",
        "caption": "Daily life and culture in North Side."
      }
    ],
    "tags": [
      "island",
      "eco",
      "arts",
      "nightlife"
    ]
  },
  {
    "slug": "north-hill-village-ai",
    "city": "North Hill Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 92.6,
    "description": "A destination known for budget, family, eco and mild climate.",
    "overview": "Experience North Hill Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?North%20Hill%20Village%20skyline",
        "alt": "North Hill Village skyline",
        "caption": "North Hill Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?North%20Hill%20Village%20street",
        "alt": "North Hill Village street scene",
        "caption": "An atmospheric look at North Hill Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?North%20Hill%20Village%20lifestyle",
        "alt": "North Hill Village lifestyle",
        "caption": "Daily life and culture in North Hill Village."
      }
    ],
    "tags": [
      "budget",
      "family",
      "eco",
      "digital nomad"
    ]
  },
  {
    "slug": "island-harbour-ai",
    "city": "Island Harbour",
    "country": "AI",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for expat-friendly, history, wellness and mild climate.",
    "overview": "Experience Island Harbour's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Island%20Harbour%20skyline",
        "alt": "Island Harbour skyline",
        "caption": "Island Harbour cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Island%20Harbour%20street",
        "alt": "Island Harbour street scene",
        "caption": "An atmospheric look at Island Harbour's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Island%20Harbour%20lifestyle",
        "alt": "Island Harbour lifestyle",
        "caption": "Daily life and culture in Island Harbour."
      }
    ],
    "tags": [
      "expat-friendly",
      "history",
      "wellness",
      "family"
    ]
  },
  {
    "slug": "george-hill-ai",
    "city": "George Hill",
    "country": "AI",
    "emoji": "🌍",
    "match": 93.1,
    "description": "A destination known for beach, startup, climate and mild climate.",
    "overview": "Experience George Hill's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?George%20Hill%20skyline",
        "alt": "George Hill skyline",
        "caption": "George Hill cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?George%20Hill%20street",
        "alt": "George Hill street scene",
        "caption": "An atmospheric look at George Hill's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?George%20Hill%20lifestyle",
        "alt": "George Hill lifestyle",
        "caption": "Daily life and culture in George Hill."
      }
    ],
    "tags": [
      "beach",
      "startup",
      "climate",
      "slow pace"
    ]
  },
  {
    "slug": "east-end-village-ai",
    "city": "East End Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 93.9,
    "description": "A destination known for island, nature, lake and mild climate.",
    "overview": "Experience East End Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?East%20End%20Village%20skyline",
        "alt": "East End Village skyline",
        "caption": "East End Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?East%20End%20Village%20street",
        "alt": "East End Village street scene",
        "caption": "An atmospheric look at East End Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?East%20End%20Village%20lifestyle",
        "alt": "East End Village lifestyle",
        "caption": "Daily life and culture in East End Village."
      }
    ],
    "tags": [
      "island",
      "nature",
      "lake",
      "digital nomad"
    ]
  },
  {
    "slug": "blowing-point-village-ai",
    "city": "Blowing Point Village",
    "country": "AI",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for island, lake, history and mild climate.",
    "overview": "Experience Blowing Point Village's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Blowing%20Point%20Village%20skyline",
        "alt": "Blowing Point Village skyline",
        "caption": "Blowing Point Village cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Blowing%20Point%20Village%20street",
        "alt": "Blowing Point Village street scene",
        "caption": "An atmospheric look at Blowing Point Village's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Blowing%20Point%20Village%20lifestyle",
        "alt": "Blowing Point Village lifestyle",
        "caption": "Daily life and culture in Blowing Point Village."
      }
    ],
    "tags": [
      "island",
      "lake",
      "history",
      "nightlife"
    ]
  },
  {
    "slug": "sandy-hill-ai",
    "city": "Sandy Hill",
    "country": "AI",
    "emoji": "🌍",
    "match": 96.5,
    "description": "A destination known for expat-friendly, nature, safety and mild climate.",
    "overview": "Experience Sandy Hill's sunny days and vibrant street life while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "sunny days and vibrant street life",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Hill%20skyline",
        "alt": "Sandy Hill skyline",
        "caption": "Sandy Hill cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Hill%20street",
        "alt": "Sandy Hill street scene",
        "caption": "An atmospheric look at Sandy Hill's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sandy%20Hill%20lifestyle",
        "alt": "Sandy Hill lifestyle",
        "caption": "Daily life and culture in Sandy Hill."
      }
    ],
    "tags": [
      "expat-friendly",
      "nature",
      "safety",
      "luxury"
    ]
  },
  {
    "slug": "xarr-al",
    "city": "Xarrë",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.2,
    "description": "A destination known for safety, family, arts and mild climate.",
    "overview": "Experience Xarrë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Xarr%C3%AB%20skyline",
        "alt": "Xarrë skyline",
        "caption": "Xarrë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Xarr%C3%AB%20street",
        "alt": "Xarrë street scene",
        "caption": "An atmospheric look at Xarrë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Xarr%C3%AB%20lifestyle",
        "alt": "Xarrë lifestyle",
        "caption": "Daily life and culture in Xarrë."
      }
    ],
    "tags": [
      "safety",
      "family",
      "arts",
      "nature"
    ]
  },
  {
    "slug": "sarand-al",
    "city": "Sarandë",
    "country": "AL",
    "emoji": "🌍",
    "match": 96.5,
    "description": "A destination known for beach, slow pace, family and mild climate.",
    "overview": "Experience Sarandë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Sarand%C3%AB%20skyline",
        "alt": "Sarandë skyline",
        "caption": "Sarandë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sarand%C3%AB%20street",
        "alt": "Sarandë street scene",
        "caption": "An atmospheric look at Sarandë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Sarand%C3%AB%20lifestyle",
        "alt": "Sarandë lifestyle",
        "caption": "Daily life and culture in Sarandë."
      }
    ],
    "tags": [
      "beach",
      "slow pace",
      "family",
      "food"
    ]
  },
  {
    "slug": "mesopotam-al",
    "city": "Mesopotam",
    "country": "AL",
    "emoji": "🌍",
    "match": 92.4,
    "description": "A destination known for history, lake, mountains and mild climate.",
    "overview": "Experience Mesopotam's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Mesopotam%20skyline",
        "alt": "Mesopotam skyline",
        "caption": "Mesopotam cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mesopotam%20street",
        "alt": "Mesopotam street scene",
        "caption": "An atmospheric look at Mesopotam's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Mesopotam%20lifestyle",
        "alt": "Mesopotam lifestyle",
        "caption": "Daily life and culture in Mesopotam."
      }
    ],
    "tags": [
      "history",
      "lake",
      "mountains",
      "slow pace"
    ]
  },
  {
    "slug": "markat-al",
    "city": "Markat",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for golf, startup, food and mild climate.",
    "overview": "Experience Markat's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Markat%20skyline",
        "alt": "Markat skyline",
        "caption": "Markat cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markat%20street",
        "alt": "Markat street scene",
        "caption": "An atmospheric look at Markat's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Markat%20lifestyle",
        "alt": "Markat lifestyle",
        "caption": "Daily life and culture in Markat."
      }
    ],
    "tags": [
      "golf",
      "startup",
      "food",
      "safety"
    ]
  },
  {
    "slug": "livadhja-al",
    "city": "Livadhja",
    "country": "AL",
    "emoji": "🌍",
    "match": 93,
    "description": "A destination known for safety, history, coast and mild climate.",
    "overview": "Experience Livadhja's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Livadhja%20skyline",
        "alt": "Livadhja skyline",
        "caption": "Livadhja cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Livadhja%20street",
        "alt": "Livadhja street scene",
        "caption": "An atmospheric look at Livadhja's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Livadhja%20lifestyle",
        "alt": "Livadhja lifestyle",
        "caption": "Daily life and culture in Livadhja."
      }
    ],
    "tags": [
      "safety",
      "history",
      "coast",
      "digital nomad"
    ]
  },
  {
    "slug": "konispol-al",
    "city": "Konispol",
    "country": "AL",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for startup, healthcare, retirement and mild climate.",
    "overview": "Experience Konispol's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Konispol%20skyline",
        "alt": "Konispol skyline",
        "caption": "Konispol cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Konispol%20street",
        "alt": "Konispol street scene",
        "caption": "An atmospheric look at Konispol's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Konispol%20lifestyle",
        "alt": "Konispol lifestyle",
        "caption": "Daily life and culture in Konispol."
      }
    ],
    "tags": [
      "startup",
      "healthcare",
      "retirement",
      "arts"
    ]
  },
  {
    "slug": "kakavij-al",
    "city": "Kakavijë",
    "country": "AL",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for startup, digital nomad, budget and mild climate.",
    "overview": "Experience Kakavijë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Kakavij%C3%AB%20skyline",
        "alt": "Kakavijë skyline",
        "caption": "Kakavijë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kakavij%C3%AB%20street",
        "alt": "Kakavijë street scene",
        "caption": "An atmospheric look at Kakavijë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Kakavij%C3%AB%20lifestyle",
        "alt": "Kakavijë lifestyle",
        "caption": "Daily life and culture in Kakavijë."
      }
    ],
    "tags": [
      "startup",
      "digital nomad",
      "budget",
      "golf"
    ]
  },
  {
    "slug": "finiq-al",
    "city": "Finiq",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.7,
    "description": "A destination known for nature, island, budget and mild climate.",
    "overview": "Experience Finiq's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Finiq%20skyline",
        "alt": "Finiq skyline",
        "caption": "Finiq cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Finiq%20street",
        "alt": "Finiq street scene",
        "caption": "An atmospheric look at Finiq's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Finiq%20lifestyle",
        "alt": "Finiq lifestyle",
        "caption": "Daily life and culture in Finiq."
      }
    ],
    "tags": [
      "nature",
      "island",
      "budget",
      "healthcare"
    ]
  },
  {
    "slug": "dhiv-r-al",
    "city": "Dhivër",
    "country": "AL",
    "emoji": "🌍",
    "match": 98.6,
    "description": "A destination known for nature, retirement, startup and mild climate.",
    "overview": "Experience Dhivër's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Dhiv%C3%ABr%20skyline",
        "alt": "Dhivër skyline",
        "caption": "Dhivër cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dhiv%C3%ABr%20street",
        "alt": "Dhivër street scene",
        "caption": "An atmospheric look at Dhivër's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Dhiv%C3%ABr%20lifestyle",
        "alt": "Dhivër lifestyle",
        "caption": "Daily life and culture in Dhivër."
      }
    ],
    "tags": [
      "nature",
      "retirement",
      "startup",
      "climate"
    ]
  },
  {
    "slug": "delvin-al",
    "city": "Delvinë",
    "country": "AL",
    "emoji": "🌍",
    "match": 95,
    "description": "A destination known for island, nature, safety and mild climate.",
    "overview": "Experience Delvinë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Delvin%C3%AB%20skyline",
        "alt": "Delvinë skyline",
        "caption": "Delvinë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Delvin%C3%AB%20street",
        "alt": "Delvinë street scene",
        "caption": "An atmospheric look at Delvinë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Delvin%C3%AB%20lifestyle",
        "alt": "Delvinë lifestyle",
        "caption": "Daily life and culture in Delvinë."
      }
    ],
    "tags": [
      "island",
      "nature",
      "safety",
      "healthcare"
    ]
  },
  {
    "slug": "aliko-al",
    "city": "Aliko",
    "country": "AL",
    "emoji": "🌍",
    "match": 94.9,
    "description": "A destination known for slow pace, golf, digital nomad and mild climate.",
    "overview": "Experience Aliko's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Aliko%20skyline",
        "alt": "Aliko skyline",
        "caption": "Aliko cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aliko%20street",
        "alt": "Aliko street scene",
        "caption": "An atmospheric look at Aliko's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Aliko%20lifestyle",
        "alt": "Aliko lifestyle",
        "caption": "Daily life and culture in Aliko."
      }
    ],
    "tags": [
      "slow pace",
      "golf",
      "digital nomad",
      "safety"
    ]
  },
  {
    "slug": "bu-imas-al",
    "city": "Buçimas",
    "country": "AL",
    "emoji": "🌍",
    "match": 98.5,
    "description": "A destination known for mountains, nature, slow pace and mild climate.",
    "overview": "Experience Buçimas's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Bu%C3%A7imas%20skyline",
        "alt": "Buçimas skyline",
        "caption": "Buçimas cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bu%C3%A7imas%20street",
        "alt": "Buçimas street scene",
        "caption": "An atmospheric look at Buçimas's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Bu%C3%A7imas%20lifestyle",
        "alt": "Buçimas lifestyle",
        "caption": "Daily life and culture in Buçimas."
      }
    ],
    "tags": [
      "mountains",
      "nature",
      "slow pace",
      "walkability"
    ]
  },
  {
    "slug": "zerqan-al",
    "city": "Zerqan",
    "country": "AL",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for walkability, culture, island and mild climate.",
    "overview": "Experience Zerqan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zerqan%20skyline",
        "alt": "Zerqan skyline",
        "caption": "Zerqan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zerqan%20street",
        "alt": "Zerqan street scene",
        "caption": "An atmospheric look at Zerqan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zerqan%20lifestyle",
        "alt": "Zerqan lifestyle",
        "caption": "Daily life and culture in Zerqan."
      }
    ],
    "tags": [
      "walkability",
      "culture",
      "island",
      "luxury"
    ]
  },
  {
    "slug": "zavalin-al",
    "city": "Zavalinë",
    "country": "AL",
    "emoji": "🌍",
    "match": 96,
    "description": "A destination known for wellness, slow pace, walkability and mild climate.",
    "overview": "Experience Zavalinë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zavalin%C3%AB%20skyline",
        "alt": "Zavalinë skyline",
        "caption": "Zavalinë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zavalin%C3%AB%20street",
        "alt": "Zavalinë street scene",
        "caption": "An atmospheric look at Zavalinë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zavalin%C3%AB%20lifestyle",
        "alt": "Zavalinë lifestyle",
        "caption": "Daily life and culture in Zavalinë."
      }
    ],
    "tags": [
      "wellness",
      "slow pace",
      "walkability",
      "arts"
    ]
  },
  {
    "slug": "zapod-al",
    "city": "Zapod",
    "country": "AL",
    "emoji": "🌍",
    "match": 94.1,
    "description": "A destination known for culture, nightlife, retirement and mild climate.",
    "overview": "Experience Zapod's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zapod%20skyline",
        "alt": "Zapod skyline",
        "caption": "Zapod cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zapod%20street",
        "alt": "Zapod street scene",
        "caption": "An atmospheric look at Zapod's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zapod%20lifestyle",
        "alt": "Zapod lifestyle",
        "caption": "Daily life and culture in Zapod."
      }
    ],
    "tags": [
      "culture",
      "nightlife",
      "retirement",
      "mountains"
    ]
  },
  {
    "slug": "zall-re-al",
    "city": "Zall-Reç",
    "country": "AL",
    "emoji": "🌍",
    "match": 99.2,
    "description": "A destination known for healthcare, budget, nature and mild climate.",
    "overview": "Experience Zall-Reç's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zall-Re%C3%A7%20skyline",
        "alt": "Zall-Reç skyline",
        "caption": "Zall-Reç cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zall-Re%C3%A7%20street",
        "alt": "Zall-Reç street scene",
        "caption": "An atmospheric look at Zall-Reç's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zall-Re%C3%A7%20lifestyle",
        "alt": "Zall-Reç lifestyle",
        "caption": "Daily life and culture in Zall-Reç."
      }
    ],
    "tags": [
      "healthcare",
      "budget",
      "nature",
      "slow pace"
    ]
  },
  {
    "slug": "zall-dardh-al",
    "city": "Zall-Dardhë",
    "country": "AL",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for beach, food, island and mild climate.",
    "overview": "Experience Zall-Dardhë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Zall-Dardh%C3%AB%20skyline",
        "alt": "Zall-Dardhë skyline",
        "caption": "Zall-Dardhë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zall-Dardh%C3%AB%20street",
        "alt": "Zall-Dardhë street scene",
        "caption": "An atmospheric look at Zall-Dardhë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Zall-Dardh%C3%AB%20lifestyle",
        "alt": "Zall-Dardhë lifestyle",
        "caption": "Daily life and culture in Zall-Dardhë."
      }
    ],
    "tags": [
      "beach",
      "food",
      "island",
      "retirement"
    ]
  },
  {
    "slug": "xib-r-murriz-al",
    "city": "Xibër-Murrizë",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.4,
    "description": "A destination known for golf, coast, nightlife and mild climate.",
    "overview": "Experience Xibër-Murrizë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Xib%C3%ABr-Murriz%C3%AB%20skyline",
        "alt": "Xibër-Murrizë skyline",
        "caption": "Xibër-Murrizë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Xib%C3%ABr-Murriz%C3%AB%20street",
        "alt": "Xibër-Murrizë street scene",
        "caption": "An atmospheric look at Xibër-Murrizë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Xib%C3%ABr-Murriz%C3%AB%20lifestyle",
        "alt": "Xibër-Murrizë lifestyle",
        "caption": "Daily life and culture in Xibër-Murrizë."
      }
    ],
    "tags": [
      "golf",
      "coast",
      "nightlife",
      "budget"
    ]
  },
  {
    "slug": "vreshtas-al",
    "city": "Vreshtas",
    "country": "AL",
    "emoji": "🌍",
    "match": 93.2,
    "description": "A destination known for luxury, island, history and mild climate.",
    "overview": "Experience Vreshtas's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vreshtas%20skyline",
        "alt": "Vreshtas skyline",
        "caption": "Vreshtas cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vreshtas%20street",
        "alt": "Vreshtas street scene",
        "caption": "An atmospheric look at Vreshtas's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vreshtas%20lifestyle",
        "alt": "Vreshtas lifestyle",
        "caption": "Daily life and culture in Vreshtas."
      }
    ],
    "tags": [
      "luxury",
      "island",
      "history",
      "golf"
    ]
  },
  {
    "slug": "voskopoj-al",
    "city": "Voskopojë",
    "country": "AL",
    "emoji": "🌍",
    "match": 92.9,
    "description": "A destination known for eco, beach, food and mild climate.",
    "overview": "Experience Voskopojë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Voskopoj%C3%AB%20skyline",
        "alt": "Voskopojë skyline",
        "caption": "Voskopojë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Voskopoj%C3%AB%20street",
        "alt": "Voskopojë street scene",
        "caption": "An atmospheric look at Voskopojë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Voskopoj%C3%AB%20lifestyle",
        "alt": "Voskopojë lifestyle",
        "caption": "Daily life and culture in Voskopojë."
      }
    ],
    "tags": [
      "eco",
      "beach",
      "food",
      "budget"
    ]
  },
  {
    "slug": "voskop-al",
    "city": "Voskop",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for mountains, safety, climate and mild climate.",
    "overview": "Experience Voskop's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Voskop%20skyline",
        "alt": "Voskop skyline",
        "caption": "Voskop cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Voskop%20street",
        "alt": "Voskop street scene",
        "caption": "An atmospheric look at Voskop's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Voskop%20lifestyle",
        "alt": "Voskop lifestyle",
        "caption": "Daily life and culture in Voskop."
      }
    ],
    "tags": [
      "mountains",
      "safety",
      "climate",
      "digital nomad"
    ]
  },
  {
    "slug": "vithkuq-al",
    "city": "Vithkuq",
    "country": "AL",
    "emoji": "🌍",
    "match": 94,
    "description": "A destination known for retirement, beach, history and mild climate.",
    "overview": "Experience Vithkuq's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vithkuq%20skyline",
        "alt": "Vithkuq skyline",
        "caption": "Vithkuq cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vithkuq%20street",
        "alt": "Vithkuq street scene",
        "caption": "An atmospheric look at Vithkuq's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vithkuq%20lifestyle",
        "alt": "Vithkuq lifestyle",
        "caption": "Daily life and culture in Vithkuq."
      }
    ],
    "tags": [
      "retirement",
      "beach",
      "history",
      "startup"
    ]
  },
  {
    "slug": "v-rtop-al",
    "city": "Vërtop",
    "country": "AL",
    "emoji": "🌍",
    "match": 99.3,
    "description": "A destination known for food, history, arts and mild climate.",
    "overview": "Experience Vërtop's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?V%C3%ABrtop%20skyline",
        "alt": "Vërtop skyline",
        "caption": "Vërtop cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?V%C3%ABrtop%20street",
        "alt": "Vërtop street scene",
        "caption": "An atmospheric look at Vërtop's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?V%C3%ABrtop%20lifestyle",
        "alt": "Vërtop lifestyle",
        "caption": "Daily life and culture in Vërtop."
      }
    ],
    "tags": [
      "food",
      "history",
      "arts",
      "startup"
    ]
  },
  {
    "slug": "vergo-al",
    "city": "Vergo",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.8,
    "description": "A destination known for eco, nightlife, luxury and mild climate.",
    "overview": "Experience Vergo's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vergo%20skyline",
        "alt": "Vergo skyline",
        "caption": "Vergo cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vergo%20street",
        "alt": "Vergo street scene",
        "caption": "An atmospheric look at Vergo's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vergo%20lifestyle",
        "alt": "Vergo lifestyle",
        "caption": "Daily life and culture in Vergo."
      }
    ],
    "tags": [
      "eco",
      "nightlife",
      "luxury",
      "family"
    ]
  },
  {
    "slug": "vendresha-e-vog-l-al",
    "city": "Vendresha e Vogël",
    "country": "AL",
    "emoji": "🌍",
    "match": 97.3,
    "description": "A destination known for retirement, nightlife, arts and mild climate.",
    "overview": "Experience Vendresha e Vogël's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vendresha%20e%20Vog%C3%ABl%20skyline",
        "alt": "Vendresha e Vogël skyline",
        "caption": "Vendresha e Vogël cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vendresha%20e%20Vog%C3%ABl%20street",
        "alt": "Vendresha e Vogël street scene",
        "caption": "An atmospheric look at Vendresha e Vogël's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vendresha%20e%20Vog%C3%ABl%20lifestyle",
        "alt": "Vendresha e Vogël lifestyle",
        "caption": "Daily life and culture in Vendresha e Vogël."
      }
    ],
    "tags": [
      "retirement",
      "nightlife",
      "arts",
      "startup"
    ]
  },
  {
    "slug": "vel-an-al",
    "city": "Velçan",
    "country": "AL",
    "emoji": "🌍",
    "match": 99.5,
    "description": "A destination known for budget, startup, island and mild climate.",
    "overview": "Experience Velçan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Vel%C3%A7an%20skyline",
        "alt": "Velçan skyline",
        "caption": "Velçan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vel%C3%A7an%20street",
        "alt": "Velçan street scene",
        "caption": "An atmospheric look at Velçan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Vel%C3%A7an%20lifestyle",
        "alt": "Velçan lifestyle",
        "caption": "Daily life and culture in Velçan."
      }
    ],
    "tags": [
      "budget",
      "startup",
      "island",
      "lake"
    ]
  },
  {
    "slug": "ujmisht-al",
    "city": "Ujmisht",
    "country": "AL",
    "emoji": "🌍",
    "match": 95.9,
    "description": "A destination known for lake, island, coast and mild climate.",
    "overview": "Experience Ujmisht's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ujmisht%20skyline",
        "alt": "Ujmisht skyline",
        "caption": "Ujmisht cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ujmisht%20street",
        "alt": "Ujmisht street scene",
        "caption": "An atmospheric look at Ujmisht's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ujmisht%20lifestyle",
        "alt": "Ujmisht lifestyle",
        "caption": "Daily life and culture in Ujmisht."
      }
    ],
    "tags": [
      "lake",
      "island",
      "coast",
      "food"
    ]
  },
  {
    "slug": "ud-nisht-al",
    "city": "Udënisht",
    "country": "AL",
    "emoji": "🌍",
    "match": 94.2,
    "description": "A destination known for lake, food, budget and mild climate.",
    "overview": "Experience Udënisht's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Ud%C3%ABnisht%20skyline",
        "alt": "Udënisht skyline",
        "caption": "Udënisht cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ud%C3%ABnisht%20street",
        "alt": "Udënisht street scene",
        "caption": "An atmospheric look at Udënisht's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Ud%C3%ABnisht%20lifestyle",
        "alt": "Udënisht lifestyle",
        "caption": "Daily life and culture in Udënisht."
      }
    ],
    "tags": [
      "lake",
      "food",
      "budget",
      "slow pace"
    ]
  },
  {
    "slug": "tunj-al",
    "city": "Tunjë",
    "country": "AL",
    "emoji": "🌍",
    "match": 99,
    "description": "A destination known for history, nightlife, beach and mild climate.",
    "overview": "Experience Tunjë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tunj%C3%AB%20skyline",
        "alt": "Tunjë skyline",
        "caption": "Tunjë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tunj%C3%AB%20street",
        "alt": "Tunjë street scene",
        "caption": "An atmospheric look at Tunjë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tunj%C3%AB%20lifestyle",
        "alt": "Tunjë lifestyle",
        "caption": "Daily life and culture in Tunjë."
      }
    ],
    "tags": [
      "history",
      "nightlife",
      "beach",
      "mountains"
    ]
  },
  {
    "slug": "tregan-al",
    "city": "Tregan",
    "country": "AL",
    "emoji": "🌍",
    "match": 92.8,
    "description": "A destination known for startup, safety, coast and mild climate.",
    "overview": "Experience Tregan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Easy airport access and compact urban mobility.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Tregan%20skyline",
        "alt": "Tregan skyline",
        "caption": "Tregan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tregan%20street",
        "alt": "Tregan street scene",
        "caption": "An atmospheric look at Tregan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Tregan%20lifestyle",
        "alt": "Tregan lifestyle",
        "caption": "Daily life and culture in Tregan."
      }
    ],
    "tags": [
      "startup",
      "safety",
      "coast",
      "healthcare"
    ]
  },
  {
    "slug": "trebisht-mu-in-al",
    "city": "Trebisht-Muçinë",
    "country": "AL",
    "emoji": "🌍",
    "match": 94.3,
    "description": "A destination known for budget, retirement, walkability and mild climate.",
    "overview": "Experience Trebisht-Muçinë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Trebisht-Mu%C3%A7in%C3%AB%20skyline",
        "alt": "Trebisht-Muçinë skyline",
        "caption": "Trebisht-Muçinë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Trebisht-Mu%C3%A7in%C3%AB%20street",
        "alt": "Trebisht-Muçinë street scene",
        "caption": "An atmospheric look at Trebisht-Muçinë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Trebisht-Mu%C3%A7in%C3%AB%20lifestyle",
        "alt": "Trebisht-Muçinë lifestyle",
        "caption": "Daily life and culture in Trebisht-Muçinë."
      }
    ],
    "tags": [
      "budget",
      "retirement",
      "walkability",
      "wellness"
    ]
  },
  {
    "slug": "trebinj-al",
    "city": "Trebinjë",
    "country": "AL",
    "emoji": "🌍",
    "match": 96.8,
    "description": "A destination known for nightlife, slow pace, expat-friendly and mild climate.",
    "overview": "Experience Trebinjë's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Trebinj%C3%AB%20skyline",
        "alt": "Trebinjë skyline",
        "caption": "Trebinjë cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Trebinj%C3%AB%20street",
        "alt": "Trebinjë street scene",
        "caption": "An atmospheric look at Trebinjë's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Trebinj%C3%AB%20lifestyle",
        "alt": "Trebinjë lifestyle",
        "caption": "Daily life and culture in Trebinjë."
      }
    ],
    "tags": [
      "nightlife",
      "slow pace",
      "expat-friendly",
      "coast"
    ]
  },
  {
    "slug": "topojan-al",
    "city": "Topojan",
    "country": "AL",
    "emoji": "🌍",
    "match": 97.6,
    "description": "A destination known for walkability, wellness, arts and mild climate.",
    "overview": "Experience Topojan's balanced city living with lots of local flavor while enjoying its unique local culture.",
    "climate": "Enjoy mild climate with a mix of indoor comforts and outdoor adventures.",
    "lifestyle": "balanced city living with lots of local flavor",
    "transportation": "Well-connected by transit, trains, and local rideshares.",
    "images": [
      {
        "src": "https://images.unsplash.com/featured/?Topojan%20skyline",
        "alt": "Topojan skyline",
        "caption": "Topojan cityscape welcome view."
      },
      {
        "src": "https://images.unsplash.com/featured/?Topojan%20street",
        "alt": "Topojan street scene",
        "caption": "An atmospheric look at Topojan's streets and neighborhoods."
      },
      {
        "src": "https://images.unsplash.com/featured/?Topojan%20lifestyle",
        "alt": "Topojan lifestyle",
        "caption": "Daily life and culture in Topojan."
      }
    ],
    "tags": [
      "walkability",
      "wellness",
      "arts",
      "expat-friendly"
    ]
  }
];
