import { SITE_VARIANT } from "@/lib/site";

/** The App Store catalogue as listed on pilotprotocol.network/app-store. */
export type App = {
  id: string;
  name: string;
  publisher: string;
  description: string;
  icon: string;
  code: string;
  linux?: boolean;
  mac?: boolean;
};

const both = { linux: true, mac: true };

/* Pilot Protocol's own apps carry the publisher's mark: the P on the brand blue on the sky site. */
const PILOT_ICON = SITE_VARIANT === "sky" ? "/apps/pilot-sky.webp" : undefined;

export const APPS: App[] = [
  { id: "io.pilot.agentphone", name: "AgentPhone", publisher: "AgentPhone", icon: "/apps/agentphone.webp", code: "Ph", description: "A real phone number for your agent: voice calls, SMS/iMessage, and conversations over REST.", ...both },
  { id: "io.pilot.postgres", name: "PostgreSQL", publisher: "Pilot Protocol", icon: "/apps/postgres.webp", code: "Pg", description: "Run and query PostgreSQL from an agent: local server lifecycle plus psql, any libpq target.", ...both },
  { id: "io.pilot.smol", name: "Smol Machines", publisher: "smol machines", icon: "/apps/smol.webp", code: "Sm", description: "Fast, hardware-isolated microVMs, local and cloud.", ...both },
  { id: "io.pilot.plainweb", name: "Plainweb", publisher: "Pilot Protocol", icon: PILOT_ICON ?? "/apps/plainweb.webp", code: "Pw", description: "Any web page as clean Markdown. No HTML, no JS, one call.", ...both },
  { id: "io.pilot.wallet", name: "Wallet", publisher: "Pilot Protocol", icon: PILOT_ICON ?? "/apps/wallet.webp", code: "Wl", description: "USDC payments across Base, Ethereum and Polygon, over x402, with spend caps.", mac: true },
  { id: "io.pilot.primitive", name: "Primitive", publisher: "Primitive", icon: "/apps/primitive.webp", code: "Pr", description: "Email for AI agents: provision a managed inbox in one call, then send, receive, reply and search.", ...both },
  { id: "io.pilot.otto", name: "Otto", publisher: "Telepat", icon: "/apps/otto.webp", code: "Ot", description: "Drive real Chrome tabs from an agent: extract, automate, screenshot. No headless farm.", ...both },
  { id: "io.pilot.aegis", name: "AEGIS", publisher: "Pilot Protocol", icon: "/apps/aegis.webp", code: "Ae", description: "Runtime firewall for AI agents. Blocks prompt injection before your agent reads it.", ...both },
  { id: "io.pilot.sixtyfour", name: "Sixtyfour", publisher: "Sixtyfour", icon: "/apps/sixtyfour.webp", code: "64", description: "People and company intelligence: contact discovery, enrichment and agentic research.", ...both },
  { id: "io.pilot.dial", name: "Dial", publisher: "GetDial AI", icon: "/apps/dial.webp", code: "Di", description: "A complete phone identity for your agent: calls, SMS and iMessage on a real US number.", ...both },
  { id: "io.pilot.docker", name: "Docker", publisher: "Pilot Protocol", icon: "/apps/docker.webp", code: "Dk", description: "A local Docker Engine and CLI on Linux. Real containers, run by your agent.", linux: true },
  { id: "io.pilot.bowmark", name: "Bowmark", publisher: "Bowmark AI", icon: "/apps/bowmark.webp", code: "Bm", description: "Live data from real websites: prices, stock, fares and quotes, even what only appears after you operate the page.", ...both },
  { id: "io.pilot.redis", name: "Redis", publisher: "Pilot Protocol", icon: "/apps/redis.webp", code: "Rd", description: "Start a local in-memory store and run any command with redis-cli.", ...both },
  { id: "io.pilot.orthogonal", name: "Orthogonal", publisher: "Orthogonal", icon: "/apps/orthogonal.webp", code: "Or", description: "One key, 851 paid APIs, described in English and metered per user.", ...both },
  { id: "io.pilot.duckdb", name: "DuckDB", publisher: "Pilot Protocol", icon: "/apps/duckdb.webp", code: "Dd", description: "In-process analytical SQL over local files.", ...both },
  { id: "io.pilot.deadsimple", name: "Dead Simple Email", publisher: "Dead Simple Email", icon: "/apps/deadsimple.webp", code: "Ds", description: "An email identity your agent provisions for itself, then uses to send, receive and read its own signup codes.", ...both },
  { id: "io.pilot.didit", name: "Didit", publisher: "Didit", icon: "/apps/didit.webp", code: "Dt", description: "One API for identity and fraud: KYC, liveness, face match and AML.", ...both },
  { id: "io.pilot.upfile", name: "Upfile", publisher: "Upfile", icon: "/apps/upfile.webp", code: "Up", description: "Upload a file, get a permanent URL. One call to sign up, one to upload.", ...both },
  { id: "io.pilot.miren", name: "Miren", publisher: "Miren", icon: "/apps/miren.webp", code: "Mi", description: "Operate the Miren PaaS from an agent: deploy apps, run the server and debug them.", ...both },
  { id: "io.pilot.tldr", name: "tldr", publisher: "Pilot Protocol", icon: "/apps/tldr.webp", code: "Tl", description: "Simplified man pages for 7,350+ CLIs. Example-first command recall for agents.", ...both },
  { id: "io.pilot.rentahuman", name: "Rent A Human", publisher: "Rent A Human", icon: "/apps/rentahuman.webp", code: "Rh", description: "Hire a real person for a physical-world task, in plain language.", ...both },
  { id: "io.pilot.kinetic", name: "Kinetic Pricing", publisher: "Kinetic Pricing", icon: "/apps/kinetic.webp", code: "Kp", description: "Decide what to charge, using answers from your own customers rather than a guess.", ...both },
  { id: "io.telepat.ideon-free", name: "Ideon (Free)", publisher: "Telepat", icon: "/apps/ideon-free.webp", code: "Id", description: "Free long-form article generation for agents.", ...both },
  { id: "io.pilot.mysql", name: "MySQL", publisher: "Pilot Protocol", icon: "/apps/mysql.webp", code: "My", description: "Run a real MySQL server from an agent. Full client/server SQL, no cloud account.", ...both },
  { id: "io.pilot.sqlite", name: "SQLite", publisher: "Pilot Protocol", icon: "/apps/sqlite.webp", code: "Sq", description: "Transactional SQL in a single file, with no server to run.", ...both },
  { id: "io.pilot.cosift", name: "Cosift", publisher: "Pilot Protocol", icon: PILOT_ICON ?? "/apps/cosift.webp", code: "Cs", description: "Grounded web search, retrieval and research for agents.", ...both },
  { id: "io.pilot.insforge", name: "InsForge", publisher: "InsForge", icon: "/apps/insforge.webp", code: "If", description: "The agent-native cloud as one app: provisions your own isolated backend.", ...both },
  { id: "io.pilot.slipstream", name: "Slipstream", publisher: "Pilot Protocol", icon: "/apps/slipstream.webp", code: "Ss", description: "Polymarket smart-money leaderboard, signals and tape.", ...both },
  { id: "io.pilot.generallegal", name: "General Legal", publisher: "General Legal", icon: "/apps/generallegal.webp", code: "Gl", description: "Attorney-backed contract review and Delaware company formation from a licensed US law firm.", linux: true },
  { id: "com.comos-federation.connector", name: "ComOS Federation", publisher: "ComOS Federation, Inc.", icon: "/apps/comos.webp", code: "Co", description: "Read the ComOS commerce network's public surfaces from Pilot.", ...both },
];
