export const SITE_URL = "https://pilotprotocol.network";
/**
 * Where this build is served. A build for another host can set NEXT_PUBLIC_DEPLOY_URL so link previews load that
 * host's share images; canonical URLs always stay on SITE_URL.
 */
export const DEPLOY_URL = process.env.NEXT_PUBLIC_DEPLOY_URL || SITE_URL;

/**
 * Which design this build presents. "green" is the lime site (variant A at /, B–D as alternates);
 * "sky" is the flight design, with the sky home page at / and the sky accent on every page.
 * Set at build time: NEXT_PUBLIC_SITE_VARIANT=sky (see the deploy:app script).
 */
export const SITE_VARIANT: "green" | "sky" = process.env.NEXT_PUBLIC_SITE_VARIANT === "sky" ? "sky" : "green";

export const INSTALL_CMD = "curl -fsSL https://pilotprotocol.network/install.sh | sh";
export const MCP_URL = "https://cloud.pilotprotocol.network/mcp";

export const LINKS = {
  github: "https://github.com/pilot-protocol/pilotprotocol",
  githubOrg: "https://github.com/pilot-protocol",
  cloud: "https://cloud.pilotprotocol.network/",
  cloudPage: "/cloud",
  docs: "/docs",
  gettingStarted: "/docs/getting-started",
  concepts: "/docs/concepts",
  mcpDocs: "/docs/mcp",
  serviceAgents: "/service-agents",
  serviceAgentDocs: "/docs/service-agents",
  pilotMomDocs: "/docs/pilot-mom",
  appStore: "/app-store",
  publish: "/publish",
  selfHosting: "/self-hosting",
  security: "/security",
  trust: "/docs/trust",
  skillInjection: "/docs/consent#skillinject",
  blog: "/blog",
  learn: "/learn",
  x: "https://x.com/pilotprotocol",
  linkedin: "https://www.linkedin.com/company/112569955/",
} as const;

export type NavItem = { label: string; href: string; children?: { label: string; href: string; note: string }[] };

export const NAV: NavItem[] = [
  {
    label: "Protocol",
    href: "/docs/concepts",
    children: [
      { label: "How it works", href: "/docs/concepts", note: "Addresses, tunnels, NAT traversal, trust" },
      { label: "Security", href: "/security", note: "What Pilot secures, and what you keep" },
      { label: "Self-hosting", href: "/self-hosting", note: "Run your own registry and beacon" },
      { label: "Peer-to-peer", href: "/for/p2p", note: "Direct tunnels, hole punching, relay" },
      { label: "Compatibility", href: "/for/compatibility", note: "Where the daemon runs" },
      { label: "Learning center", href: "/learn", note: "Guides to the network layer" },
      { label: "Research", href: "/docs/research", note: "Papers and the wire specification" },
    ],
  },
  { label: "Service agents", href: "/service-agents" },
  { label: "App Store", href: "/app-store" },
  { label: "Pilot Cloud", href: "/cloud" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

/** Public registry stats. Used as the first paint and whenever the live endpoint can't be reached. */
export const STATS_FALLBACK = {
  totalNodes: 253_085,
  activeNodes: 218_735,
  requestsPerSec: 15_944,
  dataAgents: 430,
  apps: 30,
};

export const STATS_ENDPOINT = "https://polo.pilotprotocol.network/api/public-stats";
