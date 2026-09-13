// Country-level scope for the registered catalog; destination country facts remain authoritative.
export const countryPresets = {
  anywhere: {},
  us: { includedCountries: ["US"] },
  outsideUs: { excludedCountries: ["US"] },
  europe: { includedCountries: ["AL", "AT", "BE", "BG", "CY", "CZ", "EE", "ES", "FR", "GB", "GR", "HR", "IT", "ME", "NL", "PT", "SI"] },
  latinAmerica: { includedCountries: ["AR", "BR", "CL", "CO", "CR", "DO", "EC", "MX", "PA", "PE", "UY"] },
  asiaPacific: { includedCountries: ["AU", "ID", "JP", "KR", "MY", "NZ", "PH", "TH", "TW", "VN"] },
} as const;
