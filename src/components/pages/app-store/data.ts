import { APPS, type App } from "@/lib/apps";

/* Categories, "New & Updated" and the featured app, as listed on pilotprotocol.network/app-store. */

export type Category = { id: string; name: string; blurb: string; apps: string[] };

const p = (s: string) => `io.pilot.${s}`;

export const CATEGORIES: Category[] = [
  {
    id: "data",
    name: "Data & Storage",
    blurb: "Databases, caches, and stores an agent can stand up in one command.",
    apps: ["duckdb", "insforge", "mysql", "orthogonal", "postgres", "redis", "sixtyfour", "sqlite"].map(p),
  },
  { id: "ai", name: "AI & Search", blurb: "Grounded search, retrieval, and generation for agents.", apps: [p("cosift"), "io.telepat.ideon-free"] },
  {
    id: "web",
    name: "Web & Automation",
    blurb: "Turn the live web into clean text and drive real browsers.",
    apps: ["bowmark", "otto", "plainweb"].map(p),
  },
  {
    id: "infra",
    name: "Infrastructure",
    blurb: "Containers, microVMs, and deploys: the compute layer for agents.",
    apps: ["docker", "insforge", "miren", "smol", "tldr", "upfile"].map(p),
  },
  { id: "security", name: "Security", blurb: "Guardrails and firewalls for agents and their inputs.", apps: ["aegis", "didit"].map(p) },
  {
    id: "finance",
    name: "Finance & Payments",
    blurb: "Settle value on the overlay and read the markets.",
    apps: ["com.comos-federation.connector", p("slipstream"), p("wallet")],
  },
  {
    id: "work",
    name: "Work & Research",
    blurb: "Put real-world work in motion: human hands on a task, and pricing research with your own customers.",
    apps: ["com.comos-federation.connector", p("generallegal"), p("kinetic"), p("rentahuman")],
  },
  {
    id: "comms",
    name: "Communications",
    blurb: "Give an agent its own phone number or email inbox.",
    apps: ["agentphone", "deadsimple", "dial", "primitive"].map(p),
  },
];

/** "New & Updated": just shipped or recently bumped on the catalogue. */
export const FRESH = ["dial", "deadsimple", "kinetic", "rentahuman", "upfile", "bowmark", "primitive", "didit", "agentphone", "orthogonal"].map(p);

export const FEATURED_ID = p("postgres");
export const ALSO_FEATURED = [p("duckdb"), p("docker")];

/** The publisher's own "Full usage demo" for PostgreSQL: each call and what it returns. */
export const POSTGRES_DEMO: { label: string; method: string; args: string; result: string }[] = [
  { label: "Confirm the client works", method: "postgres.version", args: "{}", result: "the delivered client version, e.g. “psql (PostgreSQL) 17.10”" },
  { label: "Create a data directory", method: "postgres.initdb", args: '{"datadir":"/work/pgdata"}', result: "a new initialized cluster at /work/pgdata" },
  { label: "Start the server", method: "postgres.start", args: '{"datadir":"/work/pgdata","port":"5599"}', result: "server accepting connections on 127.0.0.1:5599" },
  { label: "Create a database", method: "postgres.createdb", args: '{"port":"5599","dbname":"shop"}', result: "database `shop` created, owned by postgres" },
  {
    label: "Create a table, insert, select",
    method: "postgres.query",
    args: `{"uri":"host=127.0.0.1 port=5599 user=postgres dbname=shop","sql":"CREATE TABLE items(id INT PRIMARY KEY, name TEXT); INSERT INTO items VALUES (1,'pen'); SELECT * FROM items"}`,
    result: "one row: id=1, name=pen",
  },
];

/** PostgreSQL's 13 methods, in the order its store page lists them (content/apps/io.pilot.postgres.json). */
export const POSTGRES_METHODS = [
  "initdb",
  "start",
  "stop",
  "status",
  "ready",
  "createdb",
  "query",
  "query_csv",
  "command",
  "list",
  "exec",
  "psql_help",
  "version",
];

/** Cosift's detail page, as `pilotctl appstore view io.pilot.cosift` shows it (content/apps/io.pilot.cosift.json). */
export const COSIFT = {
  id: "io.pilot.cosift",
  version: "v0.1.2",
  size: "8.2 MB",
  released: "Jun 9, 2026",
  methods: ["search", "find_similar", "contents", "answer", "research", "stats", "health", "help"],
};

/**
 * What `cosift.help` reports for the three methods docs/app-store names with their latency class, and the
 * parameters its worked examples pass. The other five are listed by name only.
 */
export const COSIFT_HELP: { method: string; params: string[]; latency: 0 | 1 | 2 }[] = [
  { method: "cosift.search", params: ["q", "k", "retriever", "rerank"], latency: 0 },
  { method: "cosift.answer", params: ["q"], latency: 1 },
  { method: "cosift.research", params: ["q"], latency: 2 },
];

/** docs/app-store, "Discovery & the help convention": the three latency classes. */
export const LATENCY = [
  { name: "fast", range: "under 1s" },
  { name: "med", range: "1–5s" },
  { name: "slow", range: "5–30s" },
] as const;

export function byId(id: string): App {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app ${id}`);
  return app;
}

export function categoriesOf(id: string) {
  return CATEGORIES.filter((c) => c.apps.includes(id));
}

/** Per-app facts from each app's catalogue page, passed in from the server. */
export type Facts = Record<string, { version: string; methods: string }>;
