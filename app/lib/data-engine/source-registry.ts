import type { IngestionSourceDefinition } from "./types";

export const SOURCE_REGISTRY: Record<string, IngestionSourceDefinition> = {
  openmeteo: {
    key: "openmeteo",
    name: "Open-Meteo",
    baseUrl: "https://api.open-meteo.com",
    documentationUrl: "https://open-meteo.com/",
  },
  meteostat: {
    key: "meteostat",
    name: "Meteostat",
    baseUrl: "https://meteostat.net",
    documentationUrl: "https://dev.meteostat.net/",
  },
  numbeo: {
    key: "numbeo",
    name: "Numbeo",
    baseUrl: "https://www.numbeo.com",
    authEnv: ["NUMBEO_API_KEY"],
    documentationUrl: "https://www.numbeo.com/api/doc.jsp",
  },
  ourairports: {
    key: "ourairports",
    name: "OurAirports",
    baseUrl: "https://ourairports.com",
    documentationUrl: "https://ourairports.com/data/",
  },
  osm: {
    key: "osm",
    name: "OpenStreetMap / Overpass",
    baseUrl: "https://overpass-api.de",
    documentationUrl: "https://wiki.openstreetmap.org/wiki/Overpass_API",
  },
  youtube: {
    key: "youtube",
    name: "YouTube Data API",
    baseUrl: "https://www.googleapis.com/youtube/v3",
    authEnv: ["YOUTUBE_API_KEY"],
    documentationUrl: "https://developers.google.com/youtube/v3",
  },
  routing: {
    key: "routing",
    name: "Routing Provider",
    baseUrl: "https://maps.googleapis.com/maps/api",
    authEnv: ["GOOGLE_MAPS_API_KEY"],
    documentationUrl: "https://developers.google.com/maps/documentation/distance-matrix",
  },
};
