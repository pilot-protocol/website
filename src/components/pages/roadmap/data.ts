import type { Media } from "./media";

/* Everything on the roadmap, from pilotprotocol.network/roadmap (updated October 2026). */

export const LANES = [
  {
    name: "Pilot Protocol",
    short: "Protocol",
    baseline:
      "The open-source daemon and pilotctl (AGPL-3.0): addresses, Ed25519 identity, encrypted tunnels, NAT traversal and explicit trust, over a public backbone run at no charge.",
  },
  {
    name: "Data service agents",
    short: "Data agents",
    baseline: "About 430 live data agents, the list-agents directory, and pilot-mom, which turns a task into a plan of agent calls.",
  },
  {
    name: "App Store",
    short: "App Store",
    baseline: "30 apps from their publishers, reviewed, signature-verified and SHA-256 pinned, installed with one command.",
  },
  {
    name: "Pilot Cloud",
    short: "Cloud",
    baseline:
      "A hosted, always-on Pilot node used over MCP from Claude, ChatGPT and other clients. Free; sign-ups are capped by capacity.",
  },
] as const;

/**
 * Sky: the picture at the head of each product's "available today" card, from its own line: pilotctl on macOS and
 * Linux; some of the sources the data agents answer from; apps from the catalogue; the MCP clients Pilot Cloud names.
 */
export const BASE_MEDIA: Media[] = [
  { kind: "marks", brands: ["apple", "linux"], glyphs: ["terminal"] },
  { kind: "marks", brands: ["openmeteo", "nasa", "wikipedia", "github", "hackernews"] },
  { kind: "apps", ids: ["io.pilot.postgres", "io.pilot.redis", "io.pilot.docker", "io.pilot.duckdb", "io.pilot.otto"] },
  { kind: "marks", brands: ["claude", "openai", "mcp"] },
];

export type Stage = "shipped" | "progress";

export type Item = {
  id: string;
  lane: 0 | 1 | 2 | 3;
  stage: Stage;
  title: string;
  body: string;
  /** Where the item stands, in the source's own words. */
  status: string;
  link: { label: string; href: string };
  /** Sky: the small picture at the head of the card. */
  media: Media;
};

export const ITEMS: Item[] = [
  {
    id: "01.01",
    lane: 0,
    stage: "shipped",
    title: "Steadier connections: v1.16 to v1.18",
    body: "Daemons forget peers nobody uses, so long-running agents no longer grow until they run out of memory, and use much less CPU under send bursts. Relayed trust handshakes complete in seconds instead of two minutes, and a daemon recovers as soon as its IP address changes.",
    status: "v1.18.0 · 8 October",
    link: { label: "v1.18.0 release notes", href: "https://github.com/pilot-protocol/pilotprotocol/releases/tag/v1.18.0" },
    media: { kind: "tags", tags: ["v1.16", "v1.17", "v1.18"] },
  },
  {
    id: "01.02",
    lane: 0,
    stage: "shipped",
    title: "send-message and installs that report back",
    body: "send-message --wait matches the reply to the message by ID, takes its payload from stdin or a file, and delivers messages over 256 KB; a send nobody acknowledges now fails. appstore install waits for the app’s first start and reports it.",
    status: "v1.17.0",
    link: { label: "v1.17.0 release notes", href: "https://github.com/pilot-protocol/pilotprotocol/releases/tag/v1.17.0" },
    media: { kind: "code", code: "send-message --wait" },
  },
  {
    id: "01.03",
    lane: 1,
    stage: "shipped",
    title: "The whole fleet on v1.18",
    body: "Every data agent moved to the current daemon release, and the list-agents directory answers each query once.",
    status: "All data agents",
    link: { label: "The data agents", href: "/service-agents" },
    media: { kind: "marks", brands: ["openmeteo", "nasa", "wikipedia"], tag: "v1.18" },
  },
  {
    id: "01.04",
    lane: 2,
    stage: "shipped",
    title: "Apps that stop cleanly",
    body: "Stopping an app stops its whole process group, with SIGTERM first and SIGKILL after three seconds, and the supervisor hands apps the daemon’s real address.",
    status: "Daemon v1.15.0 and later",
    link: { label: "App Store runtime source", href: "https://github.com/pilot-protocol/app-store" },
    media: { kind: "signals" },
  },
  {
    id: "01.05",
    lane: 3,
    stage: "shipped",
    title: "Sign-in, inbox and room for more",
    body: "Sign in with Apple joined email codes, Google and GitHub. Conversations with friends’ agents have an inbox. OAuth for MCP clients gained a read-only scope and token revocation, and there is room for 200 accounts.",
    status: "cloud.pilotprotocol.network",
    link: { label: "Pilot Cloud", href: "/cloud" },
    media: { kind: "marks", brands: ["apple", "google", "github"], glyphs: ["envelope"] },
  },
  {
    id: "02.01",
    lane: 0,
    stage: "progress",
    title: "Transport recovery and throughput",
    body: "Open pull requests keep a session alive when the two sides’ keys fall out of step, so it recovers without a restart, and fix a throughput collapse under packet loss, with a benchmark harness to measure overlay throughput.",
    status: "Open pull requests",
    link: { label: "Open pull requests", href: "https://github.com/pilot-protocol/pilotprotocol/pulls" },
    media: { kind: "repo", repo: "pilotprotocol", glyph: "pullRequest" },
  },
  {
    id: "02.02",
    lane: 0,
    stage: "progress",
    title: "A faster registry",
    body: "The open-source registry takes its remaining locks off the request path and saves its snapshots faster, streaming them to disk.",
    status: "In beta releases",
    link: { label: "Registry source", href: "https://github.com/pilot-protocol/rendezvous" },
    media: { kind: "repo", repo: "rendezvous", glyph: "server" },
  },
  {
    id: "02.03",
    lane: 0,
    stage: "progress",
    title: "Uninstall keeps app state",
    body: "pilotctl appstore uninstall moves an app’s state into backups instead of deleting it.",
    status: "Merged · ships with the next release",
    link: { label: "Recent commits", href: "https://github.com/pilot-protocol/pilotprotocol/commits/main" },
    media: { kind: "code", code: "pilotctl appstore uninstall", to: { glyph: "archive", label: "backups" } },
  },
  {
    id: "02.04",
    lane: 2,
    stage: "progress",
    title: "App updates in review",
    body: "Updates to PostgreSQL, Redis, Smol, Bowmark, AEGIS and Plainweb so their processes exit with the daemon and leave no stray children, and General Legal for four platforms.",
    status: "In review",
    link: { label: "Open submissions", href: "https://github.com/pilot-protocol/app-template/pulls" },
    media: { kind: "apps", ids: ["io.pilot.postgres", "io.pilot.redis", "io.pilot.smol", "io.pilot.bowmark", "io.pilot.aegis", "io.pilot.plainweb", "io.pilot.generallegal"] },
  },
  {
    id: "02.05",
    lane: 2,
    stage: "progress",
    title: "Wallet 0.4",
    body: "The Wallet app sends USDC on chain and pays gas from its own ETH, has a daily ceiling, and keeps a copy of its key outside the install directory. The catalogue still lists 0.3.3.",
    status: "Waiting to enter the catalogue",
    link: { label: "Wallet source", href: "https://github.com/pilot-protocol/wallet" },
    media: { kind: "apps", ids: ["io.pilot.wallet"], tags: ["0.3.3", "0.4"] },
  },
  {
    id: "02.06",
    lane: 3,
    stage: "progress",
    title: "iPhone, iPad and Mac apps",
    body: "The same Inbox, Friends and Agents as the website.",
    status: "Built · not yet in the App Store",
    link: { label: "Pilot Cloud", href: "/cloud" },
    media: { kind: "marks", brands: ["apple"], glyphs: ["mobile", "tablet", "laptop"] },
  },
  {
    id: "02.07",
    lane: 3,
    stage: "progress",
    title: "Connector directories",
    body: "Getting Pilot Cloud listed in MCP clients’ connector directories. The OAuth flows, tool descriptions and reviewer accounts they ask for are in place.",
    status: "Listing requirements in place",
    link: { label: "MCP docs", href: "/docs/mcp" },
    media: { kind: "marks", brands: ["mcp"] },
  },
];

export const PRINCIPLES = [
  {
    title: "Security before reach",
    body: "A larger network is only useful when identity, privacy, revocation, and operational boundaries remain understandable.",
  },
  {
    title: "Evidence over claims",
    body: "Documentation, metric definitions and the claims on this site should move with the product.",
  },
  {
    title: "Compatibility by default",
    body: "New controls should fit existing environments and preserve practical upgrade paths for deployed agents.",
  },
  {
    title: "Incremental delivery",
    body: "Each release should be useful on its own rather than depend on one distant rewrite.",
  },
];
