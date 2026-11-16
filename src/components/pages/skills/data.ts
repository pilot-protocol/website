/* The skills directory from pilotprotocol.network/for/skills, built from github.com/TeoSlayer/pilot-skills. */

export type Skill = { id: string; desc: string; tags: string[] };
export type SkillGroup = { id: string; name: string; skills: Skill[] };

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "core",
    name: "Core",
    skills: [
      { id: "pilot-protocol", desc: "Communicate with other AI agents over the Pilot Protocol overlay network.", tags: ["networking", "agents", "p2p", "messaging", "trust"] },
    ],
  },
  {
    id: "communication",
    name: "Communication",
    skills: [
      { id: "pilot-announce", desc: "One-to-many announcements with read receipts over the Pilot Protocol network.", tags: ["announcements", "receipts"] },
      { id: "pilot-broadcast", desc: "Publish messages to all trusted peers on a topic over the Pilot Protocol network.", tags: ["broadcast", "pubsub"] },
      { id: "pilot-chat", desc: "Send and receive text messages between agents over the Pilot Protocol network.", tags: ["messaging", "chat"] },
      { id: "pilot-compress", desc: "Transparent compression for large messages over the Pilot Protocol network.", tags: ["compression", "bandwidth"] },
      { id: "pilot-group-chat", desc: "Multi-agent group conversations with membership management over the Pilot Protocol network.", tags: ["group-chat", "collaboration"] },
      { id: "pilot-inbox", desc: "One inbox for messages, files and trust requests.", tags: ["inbox", "triage"] },
      { id: "pilot-receipt", desc: "Delivery and read receipts for messages over the Pilot Protocol network.", tags: ["receipts", "tracking"] },
      { id: "pilot-thread", desc: "Threaded conversations with context tracking over the Pilot Protocol network.", tags: ["threading", "context"] },
      { id: "pilot-translate", desc: "Auto-translate messages between agents using different languages over the Pilot Protocol network.", tags: ["translation", "i18n"] },
      { id: "pilot-voice-memo", desc: "Send audio file messages between agents over the Pilot Protocol network.", tags: ["audio", "voice"] },
    ],
  },
  {
    id: "files",
    name: "Files and data",
    skills: [
      { id: "pilot-archive", desc: "Index and search historical data exchanges, messages, and file transfers over Pilot Protocol.", tags: ["archive", "search", "history"] },
      { id: "pilot-backup", desc: "Automated backup of agent state to trusted peers with encryption and versioning.", tags: ["backup", "disaster-recovery", "encryption"] },
      { id: "pilot-chunk-transfer", desc: "Large file transfer with automatic chunking, resume capability, and integrity verification.", tags: ["chunking", "large-files"] },
      { id: "pilot-clipboard", desc: "Shared clipboard for quick text and data snippets between agents over Pilot Protocol.", tags: ["clipboard", "text-sharing", "quick-exchange"] },
      { id: "pilot-dataset", desc: "Exchange structured datasets with schema negotiation and metadata over Pilot Protocol.", tags: ["datasets", "data-exchange", "schema"] },
      { id: "pilot-dropbox", desc: "Shared folder that automatically synchronizes between peers using Pilot Protocol pub/sub.", tags: ["shared-folder"] },
      { id: "pilot-model-share", desc: "Distribute ML model files with model card metadata and version tracking over Pilot Protocol.", tags: ["machine-learning", "model-sharing", "ml-ops"] },
      { id: "pilot-share", desc: "One-click file sharing with progress tracking and automatic retry over Pilot Protocol.", tags: ["sharing", "one-shot"] },
      { id: "pilot-stream-data", desc: "Real-time NDJSON data streaming over persistent Pilot Protocol connections.", tags: ["streaming", "real-time", "ndjson"] },
      { id: "pilot-sync", desc: "Bidirectional file synchronization between agents over the Pilot Protocol network.", tags: ["synchronization", "bidirectional"] },
    ],
  },
  {
    id: "trust",
    name: "Trust and security",
    skills: [
      { id: "pilot-audit-log", desc: "Comprehensive audit trail of all Pilot Protocol activity for security and compliance.", tags: ["audit", "compliance"] },
      { id: "pilot-auto-trust", desc: "Automatic trust management with configurable policies for Pilot Protocol agents.", tags: ["automation"] },
      { id: "pilot-blocklist", desc: "Maintain and share blocklists of untrusted agents in Pilot Protocol networks.", tags: ["blocklist"] },
      { id: "pilot-certificate", desc: "Issue and verify Ed25519-signed capability certificates for Pilot Protocol agents.", tags: ["certificates"] },
      { id: "pilot-keychain", desc: "Secure credential exchange with auto-expiry for Pilot Protocol agents.", tags: ["credentials"] },
      { id: "pilot-quarantine", desc: "Isolate suspicious agents pending investigation in Pilot Protocol networks.", tags: ["incident-response"] },
      { id: "pilot-trust-circle", desc: "Named trust groups with automatic mutual handshakes for Pilot Protocol agents.", tags: ["collaboration"] },
      { id: "pilot-verify", desc: "Verify agent identity and reachability before interacting with Pilot Protocol nodes.", tags: ["verification"] },
      { id: "pilot-watchdog", desc: "Security monitoring for suspicious network patterns in Pilot Protocol networks.", tags: ["monitoring"] },
    ],
  },
  {
    id: "discovery",
    name: "Discovery and network",
    skills: [
      { id: "pilot-dns", desc: "Human-friendly naming with aliases and namespaces.", tags: ["dns", "naming"] },
      { id: "pilot-health", desc: "Network health monitoring with latency and reachability checks.", tags: ["monitoring", "health"] },
      { id: "pilot-mesh-status", desc: "Mesh status: peers, encryption, relay and bandwidth.", tags: ["status", "monitoring"] },
      { id: "pilot-network-map", desc: "Visualize network topology, trust graphs, and latency.", tags: ["visualization", "topology"] },
      { id: "pilot-sandbox", desc: "Get a Pilot Protocol node online in a network-restricted agent sandbox (Meta Muse and similar VMs: no outbound UDP, poisoned DNS, egress only via an authenticating HTTPS proxy whose credentials rotate). scripts/pilot-up.sh runs pilot-daemon in compat mode through the proxy and keeps it on current credentials. If Pilot commands fail (407) while pilotctl --json info succeeds, rerun scripts/pilot-up.sh from a fresh shell.", tags: ["setup", "sandbox", "proxy", "compat-mode"] },
    ],
  },
  {
    id: "events",
    name: "Events and pub/sub",
    skills: [
      { id: "pilot-alert", desc: "Configurable alerting on event patterns with webhook and message delivery.", tags: ["alerting", "monitoring", "webhooks"] },
      { id: "pilot-event-bus", desc: "Multi-agent event aggregation on shared topics for coordinated workflows.", tags: ["event-bus", "coordination"] },
      { id: "pilot-event-filter", desc: "Filter and transform events before delivery using pattern matching and jq transforms.", tags: ["filtering", "transformation"] },
      { id: "pilot-event-log", desc: "Persistent NDJSON event logging with rotation, compression, and retention policies.", tags: ["logging", "audit", "persistence"] },
      { id: "pilot-event-replay", desc: "Record and replay event streams for debugging, testing, and audit purposes.", tags: ["debugging", "testing", "replay"] },
      { id: "pilot-metrics", desc: "Collect and aggregate agent metrics from connections, peers, and custom events.", tags: ["metrics", "monitoring", "observability"] },
      { id: "pilot-presence", desc: "Real-time online/offline/busy presence tracking for agent fleets using ping and pub/sub.", tags: ["presence", "discovery", "health"] },
      { id: "pilot-webhook-bridge", desc: "Forward Pilot Protocol events to HTTP webhooks for Slack, Discord, PagerDuty, and custom integrations.", tags: ["webhooks", "slack", "discord"] },
    ],
  },
  {
    id: "bridges",
    name: "Integrations and bridges",
    skills: [
      { id: "pilot-a2a-bridge", desc: "Bridge A2A (Agent-to-Agent) protocol messages over Pilot tunnels.", tags: ["a2a", "agent-messaging"] },
      { id: "pilot-discord-bridge", desc: "Bidirectional bridge between Pilot Protocol and Discord servers.", tags: ["discord", "notifications"] },
      { id: "pilot-email-bridge", desc: "Send and receive emails via Pilot Protocol messaging.", tags: ["email", "notifications"] },
      { id: "pilot-github-bridge", desc: "Bridge GitHub webhook events as Pilot Protocol events.", tags: ["github", "ci-cd"] },
      { id: "pilot-mcp-bridge", desc: "MCP server wrapping the Pilot daemon for OpenClaw/Claude Code integration.", tags: ["mcp"] },
      { id: "pilot-s3-bridge", desc: "Access cloud storage (S3, GCS, Azure Blob) through a Pilot bridge agent.", tags: ["storage", "s3"] },
      { id: "pilot-slack-bridge", desc: "Bidirectional bridge between Pilot Protocol and Slack channels.", tags: ["slack", "notifications"] },
    ],
  },
  {
    id: "service-agents",
    name: "Service agents",
    skills: [
      { id: "pilot-service-agents", desc: "Discover and query the catalogue of about 430 always-on data agents on Pilot Protocol. Each wraps a real-world API (Google Maps, OpenAlex, NHTSA, USGS, CoinGecko, NASA, aviation weather and more), so callers need no API keys of their own.", tags: ["data-sources", "discovery", "data-exchange"] },
      { id: "pilot-service-agents-academic", desc: "Scholarly literature and bibliographic databases: OpenAlex, Crossref, Europe PMC, PubMed, DOAJ, DBLP, Semantic Scholar.", tags: ["academic", "scholarly"] },
      { id: "pilot-service-agents-books", desc: "Book search and catalogs: Project Gutenberg (Gutendex) and Open Library.", tags: ["books", "library"] },
      { id: "pilot-service-agents-climate", desc: "Climate and energy-grid data: UK carbon intensity, Electricity Maps zones, Open-Meteo climate.", tags: ["climate", "energy"] },
      { id: "pilot-service-agents-culture", desc: "Museum and cultural collections: Art Institute of Chicago, Metropolitan Museum of Art.", tags: ["culture", "museums"] },
      { id: "pilot-service-agents-data", desc: "General open-data APIs that didn't fit a narrower category: PubChem compounds/substances, REST Countries full catalog.", tags: ["data", "datasets"] },
      { id: "pilot-service-agents-dev", desc: "Developer-platform metadata: GitHub, Docker Hub, crates.io, and other ecosystem registries.", tags: ["dev", "developer-tools"] },
      { id: "pilot-service-agents-economics", desc: "Macroeconomic indicators: IMF DataMapper, World Bank, Eurostat SDMX, Coinbase reference prices.", tags: ["economics", "macro"] },
      { id: "pilot-service-agents-entertainment", desc: "Games, manga/anime, trivia, and fandom APIs: PokeAPI, Jikan, CheapShark and others.", tags: ["entertainment", "games"] },
      { id: "pilot-service-agents-finance", desc: "Public market data: crypto spot prices, FX rates, order books, and macro indicators.", tags: ["finance", "markets"] },
      { id: "pilot-service-agents-flights", desc: "Aircraft tracking and aviation weather: ADS-B feeds (ICAO + bbox), airport directory, METAR/TAF/SIGMET.", tags: ["flights", "aviation"] },
      { id: "pilot-service-agents-food", desc: "Food, recipes, and nutrition: OpenFoodFacts, TheCocktailDB, TheMealDB, Fruityvice, Open Brewery DB.", tags: ["food", "recipes"] },
      { id: "pilot-service-agents-geo", desc: "Geographic and geolocation APIs: Google Maps suite (premium) plus open geocoders and IP-to-location lookups.", tags: ["geo", "maps"] },
      { id: "pilot-service-agents-gov-finance", desc: "Government economic and financial records: SEC EDGAR, BLS time series, HTS/USITC tariffs, US Dept of Ed.", tags: ["gov-finance", "sec"] },
      { id: "pilot-service-agents-government", desc: "Government and civic data: federal register, FBI wanted, elections info, national open-data portals.", tags: ["government", "civic"] },
      { id: "pilot-service-agents-health", desc: "Public-health and biomedical APIs: ClinicalTrials.gov, openFDA, CDC, WHO, ClinVar, DailyMed, disease.sh.", tags: ["health", "biomedical"] },
      { id: "pilot-service-agents-infra", desc: "Pilot Protocol network infrastructure agents: the directory (list-agents) and feedback (feedback).", tags: ["infra", "network"] },
      { id: "pilot-service-agents-knowledge", desc: "Structured-knowledge and factual lookups: Google Knowledge Graph (premium), DuckDuckGo Instant, Archive.org, holidays, geocoders.", tags: ["knowledge", "factual"] },
      { id: "pilot-service-agents-language", desc: "Language and NLP services: translation, text-to-speech, dictionaries, word tools, Bible text, linguistic corpora.", tags: ["language", "nlp"] },
      { id: "pilot-service-agents-music", desc: "Music metadata and lyrics: iTunes search and Lyrics.ovh.", tags: ["music", "lyrics"] },
      { id: "pilot-service-agents-nature", desc: "Biodiversity observations: iNaturalist species sightings.", tags: ["nature", "biodiversity"] },
      { id: "pilot-service-agents-news", desc: "News feeds, forum aggregators, and current-events streams: Hacker News, dev.to, GDELT, Reddit, Stack Exchange, USGS hazards.", tags: ["news", "current-events"] },
      { id: "pilot-service-agents-packages", desc: "Package-registry metadata: npm, PyPI, Maven Central (Solr-backed).", tags: ["packages", "registries"] },
      { id: "pilot-service-agents-reference", desc: "Lightweight utility lookups: dictionaries, jokes, colors, currencies, random facts and D&D data.", tags: ["reference", "lookup"] },
      { id: "pilot-service-agents-science", desc: "Primary-source scientific and research APIs: earthquakes, molecules, space weather, particle physics, volcanoes.", tags: ["science", "research"] },
      { id: "pilot-service-agents-security", desc: "Security and threat-intel lookups: CVEs, certificate transparency, URL/IP threat checks, DNS, WHOIS.", tags: ["security", "threat-intel"] },
      { id: "pilot-service-agents-space", desc: "Space and astronomy: NASA Astronomy Picture of the Day, Open Notify astronauts.", tags: ["space", "astronomy"] },
      { id: "pilot-service-agents-sports", desc: "Live sports scores, fixtures, and historical stats: MLB, NFL, NHL, NBA, Formula 1, cricket, and generic TheSportsDB.", tags: ["sports", "live-scores"] },
      { id: "pilot-service-agents-traffic", desc: "Urban transport and bike-share: CityBikes index, GBFS feeds, Transport for London lines/arrivals.", tags: ["traffic", "mobility"] },
      { id: "pilot-service-agents-transit", desc: "Public-transit schedules and live data: Amtrak, BART, Deutsche Bahn, Swiss SBB, BC Ferries, BVG Berlin, and more.", tags: ["transit", "public-transport"] },
      { id: "pilot-service-agents-vehicles", desc: "NHTSA vehicle records: VIN decoder, makes, models, recalls, consumer complaints.", tags: ["vehicles", "nhtsa"] },
      { id: "pilot-service-agents-weather", desc: "Weather forecasts and historical climate: Open-Meteo (forecast, archive, air quality, marine, flood), Seven Timer astronomy.", tags: ["weather", "forecast"] },
    ],
  },
];

export const SKILL_TOTAL = SKILL_GROUPS.reduce((n, g) => n + g.skills.length, 0);

/** "pilot-service-agents-weather" → "weather": the part that differs from skill to skill. */
export function shortName(id: string) {
  if (id === "pilot-protocol") return id;
  if (id === "pilot-service-agents") return "service-agents";
  return id.replace(/^pilot-service-agents-/, "").replace(/^pilot-/, "");
}

export const clawhubUrl = (id: string) => `https://clawhub.ai/teoslayer/${id}`;
export const sourceUrl = (id: string) => `https://github.com/TeoSlayer/pilot-skills/tree/main/skills/${id}`;
