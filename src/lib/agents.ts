/** The list-agents directory by category, as published on pilotprotocol.network/service-agents. */
export type AgentCategory = { id: string; name: string; count: number; examples: string[] };

export const AGENT_CATEGORIES: AgentCategory[] = [
  { id: "geo", name: "Geo and maps", count: 32, examples: ["nominatim-search", "google-maps-routes", "ip-api"] },
  { id: "reference", name: "Reference", count: 32, examples: ["dictionary-api", "wikidata-wbgetentities", "timeapi-io"] },
  { id: "health", name: "Health", count: 30, examples: ["openfda-drug-label", "clinicaltrials-search", "who-gho-indicator"] },
  { id: "science", name: "Science", count: 30, examples: ["gbif-occurrence", "usgs-volcanic-activity", "zenodo-records"] },
  { id: "government", name: "Government", count: 25, examples: ["federal-register", "uk-parliament-members", "us-census-population"] },
  { id: "finance", name: "Finance and crypto", count: 22, examples: ["coingecko-markets-simple", "ecb-exchange-rates", "sec-edgar-tickers"] },
  { id: "news", name: "News", count: 22, examples: ["hn-top", "gdelt-context-api", "usgs-earthquakes"] },
  { id: "dev", name: "Developer", count: 20, examples: ["crates-io-crate", "github-search-repos", "homebrew-formulae"] },
  { id: "transit", name: "Transit", count: 20, examples: ["bvg-berlin-departures", "mbta-routes", "swiss-transport-connections"] },
  { id: "academic", name: "Academic", count: 18, examples: ["openalex-works", "crossref-works", "dblp-publ-search"] },
  { id: "language", name: "Language", count: 18, examples: ["free-dictionary-en", "mymemory-translate", "wiktionary-define"] },
  { id: "security", name: "Security", count: 18, examples: ["nvd-cves", "cisa-kev", "crtsh"] },
  { id: "sports", name: "Sports", count: 17, examples: ["openf1-drivers", "espn-nba-scoreboard", "nhl-api-live"] },
  { id: "entertainment", name: "Entertainment", count: 16, examples: ["tvmaze-schedule", "jikan-top-anime", "pokeapi-region"] },
  { id: "food", name: "Food", count: 13, examples: ["openfoodfacts-product", "themealdb-search", "thecocktaildb-search"] },
  { id: "knowledge", name: "Knowledge", count: 13, examples: ["wikipedia-summary", "nager-public-holidays", "archive-org-search"] },
  { id: "flights", name: "Flights", count: 10, examples: ["adsb-lol-latlon", "aviation-weather-metar", "adsbdb-callsign"] },
  { id: "space", name: "Space", count: 9, examples: ["iss-position", "nasa-apod", "jpl-fireball"] },
  { id: "vehicles", name: "Vehicles", count: 8, examples: ["nhtsa-recalls", "nhtsa-decodevin", "fueleconomy-years"] },
  { id: "weather", name: "Weather", count: 8, examples: ["open-meteo-forecast", "open-meteo-air-quality", "sunrise-sunset"] },
  { id: "economics", name: "Economics", count: 7, examples: ["worldbank-indicator", "imf-datamapper", "eurostat-data"] },
  { id: "culture", name: "Culture", count: 6, examples: ["met-museum-search", "artinstitutechi-artworks", "clevelandart"] },
  { id: "packages", name: "Packages", count: 6, examples: ["pypi-package", "npm-package", "crandb-info"] },
  { id: "traffic", name: "Traffic", count: 6, examples: ["tfl-line-status", "citybikes-networks", "gbfs-citibike-nyc"] },
  { id: "climate", name: "Climate", count: 5, examples: ["uk-carbon-intensity", "electricity-maps-zones", "nasa-power"] },
  { id: "gov-finance", name: "Government finance", count: 5, examples: ["sec-company-facts", "bls-timeseries", "hts-usitc-search"] },
  { id: "books", name: "Books", count: 3, examples: ["openlibrary-search", "gutendex-books", "openlibrary-authors"] },
  { id: "data", name: "Data", count: 3, examples: ["pubchem-compound-search", "data-gouv-fr", "pubchem-substance-search"] },
  { id: "music", name: "Music", count: 3, examples: ["musicbrainz-artist", "itunes-search", "lyrics-ovh"] },
  { id: "nature", name: "Nature", count: 3, examples: ["inaturalist-obs", "worms-by-name", "gbif-suggest"] },
];

export const AGENT_TOTAL = AGENT_CATEGORIES.reduce((n, c) => n + c.count, 0);
