// Generator for src/data/apps.ts — deterministic, no randomness at build.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const ICONS_BASE = process.argv[3];   // optional: path to node_modules holding simple-icons + lucide-static
const PUBLIC_DIR = process.argv[4];    // optional: repo public/ dir to copy appicons into
const SI = ICONS_BASE ? path.join(ICONS_BASE, 'simple-icons/icons') : null;
const LU = ICONS_BASE ? path.join(ICONS_BASE, 'lucide-static/icons') : null;

// ---------- real icons: brand logo (Simple Icons) or line glyph (Lucide) ----------
const ICON_MAP = {
  'io.pilot.postgres': { brand: 'postgresql', hex: '#4169E1' },
  'io.pilot.cosift': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.pilot.smolmachines': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.pilot.sixtyfour': { image: 'png', fit: 'cover', bg: '#0b0b0a' },
  'io.pilot.aegis': { image: 'svg', fit: 'contain', bg: '#ffffff' },
  'io.pilot.plainweb': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.pilot.slipstream': { lucide: 'trending-up' },
  'io.pilot.miren': { image: 'png', fit: 'cover', bg: '#1b6ef3' },
  'io.pilot.otto': { image: 'png', fit: 'cover', bg: '#ffffff' },
  'io.pilot.agentphone': { lucide: 'phone' },
  'io.telepat.ideon-free': { image: 'png', fit: 'cover', bg: '#0b0b0a' },
  'io.pilot.wallet': { image: 'png', fit: 'contain', bg: '#ffffff' },
  // data
  'io.pilot.duckdb': { brand: 'duckdb', hex: '#FFF000' },
  'io.pilot.redis': { brand: 'redis', hex: '#FF4438' },
  'io.pilot.sqlite': { brand: 'sqlite', hex: '#003B57' },
  'io.pilot.mysql': { brand: 'mysql', hex: '#4479A1' },
  'io.pilot.mongodb': { brand: 'mongodb', hex: '#47A248' },
  'io.pilot.clickhouse': { brand: 'clickhouse', hex: '#FFCC01' },
  'io.pilot.neo4j': { brand: 'neo4j', hex: '#4581C3' },
  'io.pilot.minio': { brand: 'minio', hex: '#C72E49' },
  'io.pilot.pgvector': { lucide: 'boxes' },
  'io.pilot.pgadmin': { lucide: 'database' },
  'io.pilot.redis-insight': { lucide: 'gauge' },
  'io.pilot.etcd': { brand: 'etcd', hex: '#419EDA' },
  'io.pilot.cassandra': { brand: 'apachecassandra', hex: '#1287B1' },
  // search
  'io.pilot.qdrant': { brand: 'qdrant', hex: '#DC244C' },
  'io.pilot.meilisearch': { brand: 'meilisearch', hex: '#FF5CAA' },
  'io.pilot.elasticsearch': { brand: 'elasticsearch', hex: '#43C5DB' },
  'io.pilot.weaviate': { lucide: 'layers' },
  'io.pilot.tavily': { lucide: 'search-check' },
  'io.pilot.qdrant-client': { lucide: 'layers' },
  // web
  'io.pilot.firecrawl': { lucide: 'flame' },
  'io.pilot.readability': { lucide: 'book-open' },
  'io.pilot.sitemapper': { lucide: 'network' },
  'io.pilot.playwright': { lucide: 'drama' },
  // compute
  'io.pilot.docker': { brand: 'docker', hex: '#2496ED' },
  'io.pilot.wasmedge': { brand: 'webassembly', hex: '#654FF0' },
  'io.pilot.qemu': { brand: 'qemu', hex: '#FF6600' },
  'io.pilot.firecracker': { lucide: 'flame' },
  'io.pilot.deno': { brand: 'deno', hex: '#000000' },
  'io.pilot.bun': { brand: 'bun', hex: '#FBF0DF' },
  // devops
  'io.pilot.flyctl': { brand: 'flydotio', hex: '#7B3FE4' },
  'io.pilot.terraform': { brand: 'terraform', hex: '#7B42BC' },
  'io.pilot.kubectl': { brand: 'kubernetes', hex: '#326CE5' },
  'io.pilot.kind': { lucide: 'boxes' },
  'io.pilot.prometheus': { brand: 'prometheus', hex: '#E6522C' },
  'io.pilot.grafana': { brand: 'grafana', hex: '#F46800' },
  'io.pilot.caddy': { brand: 'caddy', hex: '#1F88C0' },
  'io.pilot.ngrok': { lucide: 'milestone' },
  // ai
  'io.pilot.ollama': { brand: 'ollama', hex: '#0B0B0A' },
  'io.pilot.embeddings': { lucide: 'grid-3x3' },
  'io.pilot.whisper': { lucide: 'mic' },
  'io.pilot.litellm': { lucide: 'route' },
  'io.pilot.rerank': { lucide: 'list-ordered' },
  // automation
  'io.pilot.puppeteer': { brand: 'puppeteer', hex: '#40B5A4' },
  'io.pilot.cron': { lucide: 'clock' },
  'io.pilot.webhook': { lucide: 'webhook' },
  // comms
  'io.pilot.email': { lucide: 'mail' },
  'io.pilot.slack': { lucide: 'slack' },
  'io.pilot.telegram': { brand: 'telegram', hex: '#26A5E4' },
  // finance
  'io.pilot.coingecko': { lucide: 'coins' },
  'io.pilot.alphavantage': { lucide: 'chart-line' },
  'io.pilot.ccxt': { lucide: 'arrow-left-right' },
  // intel
  'io.pilot.clearbit': { lucide: 'building-2' },
  'io.pilot.newsapi': { lucide: 'newspaper' },
  // writing
  'io.pilot.pandoc': { lucide: 'repeat' },
  'io.pilot.typst': { lucide: 'file-type' },
};

function relLum(hex) {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

const _copied = [];
function iconFor(id, hue) {
  const spec = ICON_MAP[id];
  // image mode: a real full-colour logo lives at /appicons/<id>.<ext> (committed, not copied here)
  if (spec && spec.image) {
    return { mode: 'image', img: `/appicons/${id}.${spec.image}`, fit: spec.fit || 'contain', pos: spec.pos || 'center', color: spec.bg || '#ffffff', ink: false, file: null, hue };
  }
  let color, ink, src;
  if (spec && spec.brand) {
    color = spec.hex; ink = relLum(spec.hex) > 0.6;
    src = SI ? path.join(SI, `${spec.brand}.svg`) : null;
  } else {
    const name = (spec && spec.lucide) || 'box';
    color = `oklch(0.6 0.19 ${hue})`; ink = false;
    src = LU ? path.join(LU, `${name}.svg`) : null;
  }
  // copy the SVG into public/appicons/<id>.svg (build-time only)
  if (src && PUBLIC_DIR) {
    const destDir = path.join(PUBLIC_DIR, 'appicons');
    fs.mkdirSync(destDir, { recursive: true });
    let realSrc = src;
    if (!fs.existsSync(realSrc) && LU) realSrc = path.join(LU, 'box.svg'); // safe fallback
    if (fs.existsSync(realSrc)) { fs.copyFileSync(realSrc, path.join(destDir, `${id}.svg`)); _copied.push(id); }
    else { console.warn('MISSING icon src for', id, src); }
  }
  return { mode: 'mask', img: null, fit: null, pos: null, color, ink, file: `/appicons/${id}.svg`, hue };
}

// ---------- deterministic helpers ----------
function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
const between = (id, salt, lo, hi) => { const h = hash(id + '#' + salt); return lo + (h % (hi - lo + 1)); };
const pick = (id, salt, arr) => arr[hash(id + '#' + salt) % arr.length];

// rating 4.2..5.0, weighted high; premium apps floored at 4.6; deterministic
function ratingFor(id, premium = false) {
  const base = 42 + (hash(id + 'rt') % 9); // 42..50 -> 4.2..5.0
  const v = premium ? Math.max(46, base) : base;
  return Math.min(50, v) / 10;
}
function ratingCount(id) { return between(id, 'rc', 18, 2400); }
function downloads(id) { return between(id, 'dl', 320, 84000); }
function histogram(id, rating, count) {
  // skew toward the rounded rating
  const r = Math.round(rating);
  const weights = [0, 0, 0, 0, 0];
  for (let s = 1; s <= 5; s++) {
    const d = Math.abs(s - r);
    weights[s - 1] = Math.max(1, 100 - d * 34) + (hash(id + 's' + s) % 12);
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.round((w / sum) * count));
}

const PLATFORMS = ['darwin-arm64', 'darwin-amd64', 'linux-arm64', 'linux-amd64'];
function bundlesFor(id, baseBytes, platforms = PLATFORMS) {
  return platforms.map((p) => {
    const jitter = 1 + ((hash(id + p) % 24) - 12) / 100; // ±12%
    return { platform: p, bytes: Math.round(baseBytes * jitter) };
  });
}

// ---------- categories ----------
const CATEGORIES = [
  { id: 'data',     name: 'Data & Storage',      blurb: 'Databases, caches, and stores an agent can stand up in one command.', hue: 125 },
  { id: 'ai',       name: 'AI & Search',         blurb: 'Grounded search, retrieval, and generation for agents.',               hue: 265 },
  { id: 'web',      name: 'Web & Automation',    blurb: 'Turn the live web into clean text and drive real browsers.',            hue: 200 },
  { id: 'infra',    name: 'Infrastructure',      blurb: 'Containers, microVMs, and deploys — the compute layer for agents.',     hue: 30  },
  { id: 'security', name: 'Security',            blurb: 'Guardrails, firewalls, and isolation for agents and their inputs.',     hue: 5   },
  { id: 'finance',  name: 'Finance & Payments',  blurb: 'Settle value on-overlay and read the markets.',                        hue: 155 },
  { id: 'comms',    name: 'Comms & Voice',       blurb: 'Phone numbers, messaging, and threaded conversations.',                 hue: 220 },
];
const CAT_HUE = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.hue]));

// ---------- REAL apps (from live catalogue) ----------
const REAL = [
  {
    id: 'io.pilot.postgres', name: 'PostgreSQL', tagline: 'The database, agent-native — initdb, psql, and the full client/server toolchain',
    description: "PostgreSQL 17.5.0 as a native CLI for agents: stand up and manage a local Postgres server (initdb / start / stop / createdb) and run SQL with psql — aligned-table or CSV results, backslash schema introspection, database listing, and the full client/server toolchain (pg_dump, pg_restore, pg_isready, ...) via a verbatim-argv passthrough. Connects to a local or remote server via a libpq connection string or PG* env.",
    categories: ['data'], keywords: ['postgres','sql','database','psql','pg_dump','relational'],
    version: '17.5.0', vendor: 'Pilot Protocol', license: 'PostgreSQL',
    sourceUrl: 'https://github.com/postgres/postgres', homepage: 'https://www.postgresql.org',
    methods: [
      { name: 'postgres.initdb', summary: 'Initialize a new local database cluster.' },
      { name: 'postgres.start', summary: 'Start the local Postgres server.' },
      { name: 'postgres.stop', summary: 'Stop the local server.' },
      { name: 'postgres.createdb', summary: 'Create a database.' },
      { name: 'postgres.psql', summary: 'Run SQL — aligned-table or CSV results.' },
      { name: 'postgres.exec', summary: 'Verbatim-argv passthrough to the full toolchain (pg_dump, pg_restore, pg_isready, ...).' },
      { name: 'postgres.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '17.5.0', date: '2026-06-28', notes: ['Native-CLI packaging of PostgreSQL 17.5.0 for the Pilot app store','Aligned-table + CSV result modes over IPC','Full client/server toolchain via verbatim-argv passthrough'] }],
    grants: ['fs.read:$APP/config.json','fs.write:$PGDATA','proc.exec:postgres','proc.exec:psql','net.dial:127.0.0.1','audit.log:*'],
    baseBytes: 31_400_000, protection: 'guarded', primaryCategory: 'data',
    featured: true, editorsChoice: true, glyph: '▚',
    minPilotVersion: '1.0.0', runtimes: ['native-cli'], publishedAt: '2026-06-28',
  },
  {
    id: 'io.pilot.cosift', name: 'Cosift', tagline: 'Grounded web search, retrieval, and research for agents',
    description: "Cosift is the Pilot app-store front door for the cosift search/answer/research API. It gives an agent keyword + semantic search, document retrieval, and LLM-grounded answers and multi-step research over a crawled web corpus — returned as clean structured JSON.\n\nEvery method is discoverable at runtime via cosift.help, which reports each method's parameters and a latency class (fast / med / slow) so a caller can pick the cheapest method that fits.",
    categories: ['ai'], keywords: ['search','rag','answer','research','web','retrieval'],
    version: '0.1.2', vendor: 'Pilot Protocol', license: 'MIT',
    sourceUrl: 'https://github.com/pilot-protocol/cosift', homepage: 'https://pilotprotocol.network',
    methods: [
      { name: 'cosift.search', summary: 'Keyword + semantic search over the crawled corpus' },
      { name: 'cosift.find_similar', summary: 'Find documents similar to a given result' },
      { name: 'cosift.contents', summary: 'Fetch the full contents of a document' },
      { name: 'cosift.answer', summary: 'Single-shot grounded answer with citations' },
      { name: 'cosift.research', summary: 'Multi-step research report over the corpus' },
      { name: 'cosift.stats', summary: 'Corpus and index statistics' },
      { name: 'cosift.health', summary: 'Service health check' },
      { name: 'cosift.help', summary: 'Discovery: methods, params, and latency classes' },
    ],
    changelog: [{ version: '0.1.2', date: '2026-06-09', notes: ['cosift search/answer/research adapter with cosift.help discovery','Installable via the Pilot app store catalogue'] }],
    grants: ['fs.read:$APP/config.json','audit.log:*','net.dial:cosift.pilotprotocol.network','net.dial:127.0.0.1'],
    baseBytes: 4_774_876, installedBytes: 8_641_298, protection: 'shareable', primaryCategory: 'ai',
    editorsChoice: true, glyph: 'cs', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-09',
  },
  {
    id: 'io.pilot.smolmachines', name: 'Smol Machines', tagline: 'Fast, hardware-isolated microVMs on demand',
    description: "Smol Machines — the app-store front door for the smolmachines VM engine. It lets an agent spin up fast, hardware-isolated Linux microVMs on demand (sub-second boot, real hypervisor isolation — not shared-kernel containers), then run workloads in a disposable sandbox. Free to use. Portable .smolmachine artifacts run identically on macOS and Linux, locally or in the cloud.\n\nUse it to run untrusted or AI-generated code safely, give an agent a real Linux shell, automate headless browsers, run GPU/compute jobs, and fan out parallel ephemeral workers thanks to sub-second boot.\n\nDiscover the live method surface at runtime with smolmachines.help.",
    categories: ['infra'], keywords: ['microvm','sandbox','vm','isolation','gpu','ci'],
    version: '1.2.0', vendor: 'smol machines', vendorUrl: 'https://smolmachines.com', license: 'Apache-2.0',
    sourceUrl: 'https://github.com/smol-machines/smolvm', homepage: 'https://smolmachines.com',
    methods: [
      { name: 'smolmachines.exec', summary: 'Run any smolvm subcommand in a fast, hardware-isolated Linux microVM.' },
      { name: 'smolmachines.help', summary: 'Discovery: every method with params, kind, and latency class.' },
    ],
    changelog: [{ version: '1.2.0', date: '2026-06-20', notes: ['Released v1.2.0'] },{ version: '1.1.0', date: '2026-05-30', notes: ['Portable .smolmachine artifacts run identically on macOS and Linux','GPU tasks via Vulkan'] }],
    grants: ['fs.read:$APP/config.json','proc.exec:smolvm','fs.read:$APP/install.json','fs.write:$APP','net.dial:pub-f09f9a4ea848491198d48e329ba030e3.r2.dev','audit.log:*'],
    baseBytes: 5_346_146, installedBytes: 9_140_402, protection: 'guarded', primaryCategory: 'infra',
    editorsChoice: true, glyph: 'sm', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-20',
  },
  {
    id: 'io.pilot.sixtyfour', name: 'Sixtyfour', tagline: 'People- and company-intelligence: discovery, enrichment, and agentic research',
    description: "Sixtyfour is the app-store front door for the Sixtyfour people-intelligence and company-intelligence API. It gives an agent contact discovery (find email / find phone), reverse lookups from an email or phone, full person and company enrichment, and an agentic QA researcher that answers free-form questions about a person or company. All returned as clean structured JSON, every field source-backed.",
    categories: ['data'], keywords: ['enrichment','people','company','email','phone','lead','research'],
    version: '0.1.0', vendor: 'Sixtyfour', license: 'Proprietary',
    sourceUrl: 'https://docs.sixtyfour.ai', homepage: 'https://sixtyfour.ai',
    methods: [
      { name: 'sixtyfour.people_intelligence', summary: 'Full, source-backed enrichment of a person from seed details.' },
      { name: 'sixtyfour.company_intelligence', summary: 'Full, source-backed company profile, optionally with people.' },
      { name: 'sixtyfour.find_email', summary: 'Find a verified email for a person from partial details.' },
      { name: 'sixtyfour.find_phone', summary: 'Find a phone number for a person from partial details.' },
      { name: 'sixtyfour.reverse_email', summary: 'Identify the person and company behind an email address.' },
      { name: 'sixtyfour.qa', summary: 'Agentic QA researcher over a person or company, with sources.' },
      { name: 'sixtyfour.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.1.0', date: '2026-06-21', notes: ['Contact discovery, reverse lookups, person/company enrichment, and an agentic QA researcher — all source-backed structured JSON.'] }],
    grants: ['fs.read:$APP/config.json','key.sign:self','net.dial:broker.pilotprotocol.network','audit.log:*'],
    baseBytes: 4_898_153, installedBytes: 8_679_650, protection: 'shareable', primaryCategory: 'data',
    glyph: '64', minPilotVersion: '1.10.0', runtimes: ['go'], publishedAt: '2026-06-21',
  },
  {
    id: 'io.pilot.plainweb', name: 'Plainweb', tagline: 'Any web page as clean Markdown — no HTML, no JS, one call',
    description: "Plainweb is a Pilot-owned URL→Markdown service: give it any web page and get back clean, accurate Markdown — no HTML, no JavaScript, just plain text structured as Markdown.\n\nOne call — plainweb.fetch(url) fetches the page and returns it as Markdown (GFM tables, fenced code with language, task lists). A cost-aware static→headless-Chrome fetch ladder means most pages never launch Chrome. Free and open — no API key required. Anonymous callers get 1000 requests/second.",
    categories: ['web'], keywords: ['plainweb','markdown','web','fetch','scrape','extract','readability','url'],
    version: '1.0.0', vendor: 'Pilot Protocol', vendorUrl: 'https://pilotprotocol.network', license: 'Proprietary',
    sourceUrl: 'https://github.com/pilot-protocol/plainweb', homepage: 'https://pilotprotocol.network',
    methods: [
      { name: 'plainweb.fetch', summary: 'Fetch any web page and return it as clean Markdown — no HTML, no JavaScript.' },
      { name: 'plainweb.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '1.0.0', date: '2026-06-14', notes: ['Released v1.0.0','go-readability primary with go-trafilatura fallback, html-to-markdown v2'] }],
    grants: ['fs.read:$APP/config.json','net.dial:plainweb-hu4fob755a-uc.a.run.app','audit.log:*'],
    baseBytes: 5_035_085, installedBytes: 8_625_202, protection: 'shareable', primaryCategory: 'web',
    editorsChoice: true, glyph: 'pw', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-14',
  },
  {
    id: 'io.pilot.slipstream', name: 'Slipstream', tagline: 'Polymarket smart-money leaderboard, signals, tape & opportunities',
    description: "SLIPSTREAM — a Polymarket smart-money leaderboard, live signals, tape, and opportunity feed, delivered over an Ed25519-signed API. Track the wallets that move prediction markets, surface fresh edges, and read the tape as structured JSON an agent can act on.",
    categories: ['finance'], keywords: ['polymarket','signals','leaderboard','markets','tape','prediction'],
    version: '1.0.0', vendor: 'Pilot Protocol', license: 'MIT',
    sourceUrl: 'https://github.com/pilot-protocol/catalog', homepage: 'https://pilotprotocol.network',
    methods: [
      { name: 'slipstream.leaderboard', summary: 'Smart-money leaderboard, ranked.' },
      { name: 'slipstream.signals', summary: 'Live trade signals from tracked wallets.' },
      { name: 'slipstream.tape', summary: 'Raw market tape as structured JSON.' },
      { name: 'slipstream.opportunities', summary: 'Ranked opportunity feed.' },
      { name: 'slipstream.help', summary: 'Discovery: methods, params, and latency classes.' },
    ],
    changelog: [{ version: '1.0.0', date: '2026-06-18', notes: ['Ed25519-signed API for leaderboard, signals, tape, and opportunities'] }],
    grants: ['fs.read:$APP/config.json','net.dial:slipstream.pilotprotocol.network','audit.log:*'],
    baseBytes: 4_674_914, protection: 'shareable', primaryCategory: 'finance',
    glyph: 'ss', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-18',
  },
  {
    id: 'io.pilot.miren', name: 'Miren', tagline: 'Operate the Miren PaaS from an agent: deploy, roll back, and debug apps',
    description: "Miren is a deployment platform for small teams. This app is the app-store front door for the miren CLI, letting an agent drive a Miren PaaS over IPC.\n\nDeploy lifecycle (deploy, analyze, rollback), inspect apps (status, history, JSON logs), server & diagnostics (doctor, whoami, connection debug), and a full-CLI passthrough via miren.exec. Structured JSON wherever the CLI offers it; discover the live surface with miren.help.",
    categories: ['infra'], keywords: ['miren','paas','deploy','server','debug','infrastructure','devops','logs','cli'],
    version: '0.1.0', vendor: 'Miren', vendorUrl: 'https://miren.dev', license: 'Proprietary',
    sourceUrl: 'https://github.com/mirendev', homepage: 'https://miren.dev',
    methods: [
      { name: 'miren.deploy', summary: 'Build and deploy the app in the current directory (non-interactive).' },
      { name: 'miren.rollback', summary: 'Roll an application back to its previous deployed version.' },
      { name: 'miren.apps', summary: 'List all applications on the cluster.' },
      { name: 'miren.logs', summary: 'Read recent logs for an application as JSON.' },
      { name: 'miren.doctor', summary: 'Diagnose the miren environment and connectivity.' },
      { name: 'miren.exec', summary: 'Run any verbatim miren argv (addon, auth, env, route, cluster, ...).' },
      { name: 'miren.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.1.0', date: '2026-06-22', notes: ['Deploy/rollback, status/logs/history, server & diagnostics, plus a passthrough exec for any miren subcommand.'] }],
    grants: ['fs.read:$APP/config.json','proc.exec:miren','net.dial:*.miren.dev','audit.log:*'],
    baseBytes: 2_850_932, installedBytes: 5_020_350, protection: 'shareable', primaryCategory: 'infra',
    glyph: 'mi', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-22',
  },
  {
    id: 'io.pilot.otto', name: 'Otto', tagline: 'Drive real Chrome tabs from an agent — extract, automate, screenshot',
    description: "Otto is secure remote browser automation. A controller CLI sends commands over an authenticated WebSocket to a relay daemon, which routes them to a Chrome extension running on live tabs. Code drives the browser deterministically; the agent decides what to do, not how to click.\n\nContent extraction (URL → markdown/HTML/text), site commands (Reddit/LinkedIn/Hacker News/Google), page & tab control (screenshots, low-level primitives), and a full-CLI passthrough. Real browser tabs, not a headless farm.",
    categories: ['web'], keywords: ['otto','browser','automation','chrome','scraping','extract','screenshot','relay'],
    version: '0.20.0', vendor: 'Telepat', vendorUrl: 'https://telepat.io', license: 'MIT',
    sourceUrl: 'https://github.com/telepat-io/otto', homepage: 'https://docs.telepat.io/otto',
    methods: [
      { name: 'otto.extract', summary: 'Extract readable page content through a live paired browser tab, as markdown JSON.' },
      { name: 'otto.screenshot', summary: 'Capture a viewport or full-page screenshot through a live tab.' },
      { name: 'otto.test', summary: 'Run a registered site command (getPosts, getFrontPage, ...) on a browser node.' },
      { name: 'otto.status', summary: 'Relay daemon status + connected browser node IDs.' },
      { name: 'otto.exec', summary: 'Run any verbatim otto argv.' },
      { name: 'otto.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.20.0', date: '2026-06-25', notes: ['Released v0.20.0'] }],
    grants: ['fs.read:$APP/config.json','proc.exec:otto','net.dial:127.0.0.1','net.listen:127.0.0.1','audit.log:*'],
    baseBytes: 5_355_850, installedBytes: 9_633_952, protection: 'guarded', primaryCategory: 'web',
    glyph: 'ot', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-25',
  },
  {
    id: 'io.pilot.agentphone', name: 'Agent Phone', tagline: 'Give your agent a real phone number: voice, SMS, and iMessage over REST',
    description: "Give your agent a real phone number: place and receive voice calls, send and receive SMS/iMessage, and hold threaded conversations — all over REST. Provision a number, create a calling agent, place a call and poll its transcript, send a text and poll for replies.",
    categories: ['comms'], keywords: ['phone','voice','sms','imessage','calls','number','rest'],
    version: '0.1.0', vendor: 'Pilot Protocol', license: 'Proprietary',
    sourceUrl: 'https://github.com/pilot-protocol/agentphone', homepage: 'https://pilotprotocol.network',
    methods: [
      { name: 'agentphone.provision', summary: 'Provision a phone number.' },
      { name: 'agentphone.call', summary: 'Place a voice call; poll for the transcript.' },
      { name: 'agentphone.text', summary: 'Send an SMS/iMessage; poll for replies.' },
      { name: 'agentphone.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.1.0', date: '2026-06-24', notes: ['Provision a number, place calls, send texts, and hold threaded conversations over REST.'] }],
    grants: ['fs.read:$APP/config.json','net.dial:agentphone.pilotprotocol.network','audit.log:*'],
    baseBytes: 4_100_000, protection: 'shareable', primaryCategory: 'comms',
    isNew: true, glyph: 'ap', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-24',
  },
  {
    id: 'io.telepat.ideon-free', name: 'Ideon (Free)', tagline: 'Free long-form article generation for agents',
    description: "Free article generation for agents: ideon-free.generate(idea) returns a jobId; ideon-free.poll(jobId) returns the finished markdown article. A thin adapter over Ideon's ideon_write — no payment.",
    categories: ['ai'], keywords: ['writing','article','generate','markdown','content','ideon'],
    version: '0.3.1', vendor: 'Telepat', vendorUrl: 'https://telepat.io', license: 'Proprietary',
    sourceUrl: 'https://telepat.io', homepage: 'https://telepat.io',
    methods: [
      { name: 'ideon-free.generate', summary: 'Submit an idea; returns a jobId.' },
      { name: 'ideon-free.poll', summary: 'Poll a jobId; returns the finished markdown article.' },
      { name: 'ideon-free.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.3.1', date: '2026-06-16', notes: ['Thin adapter over Ideon ideon_write — no payment.'] }],
    grants: ['audit.log:*','net.dial:ideon-mcp.telepat.io'],
    baseBytes: 900_000, installedBytes: 13_824, protection: 'guarded', primaryCategory: 'ai',
    glyph: 'id', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-16',
  },
  {
    id: 'io.pilot.wallet', name: 'Wallet', tagline: 'On-overlay USDC payments across Base, Ethereum, and Polygon',
    description: "The Pilot reference wallet brings x402 + EIP-3009 USDC payments to the overlay, with spend caps the supervisor enforces. One secp256k1 address works across all three USDC mainnets (Base, Ethereum, Polygon); per-chain RPC is configurable via PILOT_EVM_RPC_<chainID>.\n\nInstalling this app lets other apps and agents settle payments without leaving the network. Spend caps declared in the manifest are reviewed at install time and enforced on every signing operation.",
    categories: ['finance'], keywords: ['usdc','x402','eip-3009','evm','base','ethereum','polygon','payments'],
    version: '0.3.3', vendor: 'Pilot Protocol', vendorUrl: 'https://pilotprotocol.network', license: 'AGPL-3.0-or-later',
    sourceUrl: 'https://github.com/pilot-protocol/wallet', homepage: 'https://pilotprotocol.network',
    methods: [
      { name: 'wallet.pay', summary: 'Settle an x402 / EIP-3009 USDC payment.' },
      { name: 'wallet.balance', summary: 'Read balances across configured chains.' },
      { name: 'wallet.evm.chains', summary: 'List configured EVM chains for the wallet.' },
      { name: 'wallet.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [
      { version: '0.3.3', date: '2026-06-08', notes: ['Default --evm-chains expands to 8453,1,137 so supervised wallets get all three USDC mainnets out of the box','PILOT_EVM_CHAINS env overrides the default chain set'] },
      { version: '0.3.2', date: '2026-06-08', notes: ['Multichain EVM: same secp256k1 address across Base, Ethereum, Polygon','New wallet.evm.chains method; all evm.* methods accept an optional chain_id'] },
      { version: '0.3.1', date: '2026-06-08', notes: ['Wired the wallet.evm.* methods into the binary','Added --evm-identity, --evm-chain, --evm-rpc, --no-evm flags'] },
      { version: '0.3.0', date: '2026-06-08', notes: ['Signed wallet app bundle: ed25519-signed manifest, sha256-pinned binary'] },
    ],
    grants: ['fs.read:$APP/config.json','key.sign:self','net.dial:*.base.org','net.dial:*.infura.io','audit.log:*'],
    baseBytes: 9_110_758, protection: 'guarded', primaryCategory: 'finance',
    editorsChoice: true, glyph: 'wl', minPilotVersion: '1.0.0', runtimes: ['go'], publishedAt: '2026-06-08',
  },
  {
    id: 'io.pilot.duckdb', name: 'DuckDB', tagline: 'In-process analytical SQL — columnar, embedded, fast',
    description: "DuckDB 1.5.4 as a native CLI for agents: an in-process analytical (OLAP) database that runs SQL directly over CSV, Parquet, JSON, and its own columnar format — no server to stand up. Run queries and get aligned-table or CSV/JSON results, attach and query files in place, and reach the full DuckDB CLI surface via a verbatim-argv passthrough.\n\nEvery method is discoverable at runtime via duckdb.help, which reports each method's parameters and a latency class (fast / med / slow).",
    categories: ['data'], keywords: ['duckdb','olap','columnar','analytics','sql','parquet','embedded'],
    version: '1.5.4', vendor: 'DuckDB Labs', vendorUrl: 'https://duckdb.org', license: 'MIT',
    sourceUrl: 'https://github.com/duckdb/duckdb', homepage: 'https://duckdb.org',
    methods: [
      { name: 'duckdb.query', summary: 'Run SQL — aligned-table, CSV, or JSON results.' },
      { name: 'duckdb.exec', summary: 'Verbatim-argv passthrough to the full DuckDB CLI.' },
      { name: 'duckdb.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '1.5.4', date: '2026-06-27', notes: ['Native-CLI packaging of DuckDB 1.5.4 for the Pilot app store','Aligned-table + CSV + JSON result modes over IPC','Query Parquet / CSV / JSON files in place'] }],
    grants: ['fs.read:$APP/config.json','fs.read:*','fs.write:$APP','proc.exec:duckdb','audit.log:*'],
    baseBytes: 24_800_000, protection: 'guarded', primaryCategory: 'data',
    featured: true, editorsChoice: true, glyph: 'dk', minPilotVersion: '1.0.0', runtimes: ['native-cli'], publishedAt: '2026-06-27',
  },
  {
    id: 'io.pilot.redis', name: 'Redis', tagline: 'In-memory data store, cache, and message broker',
    description: "Redis 8.6.2 as a native CLI for agents: stand up and manage a local Redis server (start / stop) and drive it with redis-cli — strings, hashes, lists, sets, sorted sets, streams, and pub/sub, all as structured results. The full client/server toolchain is reachable via a verbatim-argv passthrough; connect to a local or remote server via a connection URL or REDIS* env.\n\nEvery method is discoverable at runtime via redis.help.",
    categories: ['data'], keywords: ['redis','cache','kv','in-memory','pubsub','streams','broker'],
    version: '8.6.2', vendor: 'Redis', vendorUrl: 'https://redis.io', license: 'RSALv2',
    sourceUrl: 'https://github.com/redis/redis', homepage: 'https://redis.io',
    methods: [
      { name: 'redis.start', summary: 'Start a local Redis server.' },
      { name: 'redis.stop', summary: 'Stop the local server.' },
      { name: 'redis.cli', summary: 'Run a command via redis-cli; structured results.' },
      { name: 'redis.exec', summary: 'Verbatim-argv passthrough to the full toolchain.' },
      { name: 'redis.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '8.6.2', date: '2026-06-26', notes: ['Native-CLI packaging of Redis 8.6.2 for the Pilot app store','Local server lifecycle (start / stop) over IPC','redis-cli with structured results'] }],
    grants: ['fs.read:$APP/config.json','fs.write:$APP','proc.exec:redis-server','proc.exec:redis-cli','net.dial:127.0.0.1','audit.log:*'],
    baseBytes: 18_200_000, protection: 'guarded', primaryCategory: 'data',
    editorsChoice: true, glyph: 'rd', minPilotVersion: '1.0.0', runtimes: ['native-cli'], publishedAt: '2026-06-26',
  },
  {
    id: 'io.pilot.docker', name: 'Docker', tagline: 'Build and run OCI containers from an agent — Linux hosts',
    description: "Docker Engine 29.6.1 packaged as a native app for agents on Linux: build images, run and manage containers, and drive the full docker CLI over a verbatim-argv passthrough — structured JSON wherever the CLI offers it.\n\nLinux only. The Docker daemon needs a Linux kernel, so this app runs on Linux hosts (arm64 + amd64); it is not available on macOS. Every method is discoverable at runtime via docker.help.",
    categories: ['infra'], keywords: ['docker','containers','oci','images','build','linux'],
    version: '29.6.1', vendor: 'Docker', vendorUrl: 'https://www.docker.com', license: 'Apache-2.0',
    sourceUrl: 'https://github.com/moby/moby', homepage: 'https://www.docker.com',
    methods: [
      { name: 'docker.run', summary: 'Run a container from an image.' },
      { name: 'docker.build', summary: 'Build an image from a Dockerfile/context.' },
      { name: 'docker.ps', summary: 'List containers as JSON.' },
      { name: 'docker.exec', summary: 'Verbatim-argv passthrough to the full docker CLI.' },
      { name: 'docker.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '29.6.1', date: '2026-06-30', notes: ['Native-CLI packaging of Docker Engine 29.6.1 for the Pilot app store','Linux hosts only (arm64 + amd64) — daemon requires a Linux kernel','Full docker CLI via verbatim-argv passthrough'] }],
    grants: ['fs.read:$APP/config.json','proc.exec:docker','net.dial:127.0.0.1','fs.read:*','fs.write:$APP','audit.log:*'],
    baseBytes: 52_300_000, protection: 'guarded', primaryCategory: 'infra',
    platforms: ['linux-arm64', 'linux-amd64'],
    featured: true, glyph: 'dc', minPilotVersion: '1.0.0', runtimes: ['native-cli'], publishedAt: '2026-06-30',
  },
  {
    id: 'io.pilot.aegis', name: 'AEGIS', tagline: 'Runtime firewall for AI agents',
    description: "AEGIS is a runtime firewall for AI agents. It intercepts prompt injection, jailbreaks, homoglyph attacks, and infrastructure-impersonation at every agent input surface — inbox messages, tool results, skill files, memory notes — before the agent reads them.\n\nAn 880 KB Rust binary, fully offline: 90% recall and 95% precision on a held-out attack corpus. No network calls, no model — deterministic checks that run inline on every input.",
    categories: ['security'], keywords: ['security','firewall','prompt-injection','jailbreak','guardrail','defense'],
    version: '0.1.4', vendor: 'Pilot Protocol', vendorUrl: 'https://aegis.pilotprotocol.network', license: 'Apache-2.0',
    sourceUrl: 'https://github.com/pilot-protocol/aegis', homepage: 'https://aegis.pilotprotocol.network',
    methods: [
      { name: 'aegis.scan', summary: 'Scan an input for prompt injection, jailbreaks, homoglyphs, and impersonation.' },
      { name: 'aegis.guard', summary: 'Wrap an input surface so every message is checked before the agent reads it.' },
      { name: 'aegis.status', summary: 'Report firewall status and recent verdicts.' },
      { name: 'aegis.help', summary: 'Discovery: every method with params and latency class.' },
    ],
    changelog: [{ version: '0.1.4', date: '2026-06-29', notes: ['Runtime firewall: prompt-injection, jailbreak, homoglyph, and impersonation detection at every input surface','880 KB Rust binary, fully offline','90% recall / 95% precision on the held-out corpus'] }],
    grants: ['fs.read:$APP/config.json','audit.log:*'],
    baseBytes: 2_300_000, installedBytes: 900_000, protection: 'shareable', primaryCategory: 'security',
    isNew: true, glyph: 'ae', minPilotVersion: '1.0.0', runtimes: ['native-cli'], publishedAt: '2026-06-29',
  },
];

// ---------- PLACEHOLDER apps ----------
// [id, name, tagline, primaryCat, extraCats, version, vendor, license, glyph, baseBytes, deps?, flags?]
const P = (o) => o;
const PLACE = [];

// ---------- build full records ----------
function buildReal(a) {
  const cats = a.categories;
  const premium = !!a.featured || !!a.editorsChoice;
  const rating = ratingFor(a.id, premium), count = ratingCount(a.id);
  const platforms = a.protection === 'guarded' && a.id.includes('postgres') ? PLATFORMS : PLATFORMS;
  return {
    id: a.id, name: a.name, tagline: a.tagline, description: a.description,
    categories: cats, primaryCategory: a.primaryCategory, keywords: a.keywords,
    version: a.version, vendor: a.vendor, vendorUrl: a.vendorUrl || null, license: a.license,
    sourceUrl: a.sourceUrl || null, homepage: a.homepage || null,
    methods: a.methods, changelog: a.changelog, grants: a.grants,
    bundles: bundlesFor(a.id, a.baseBytes, a.platforms || PLATFORMS), installedBytes: a.installedBytes || Math.round(a.baseBytes * 1.7),
    rating, ratingCount: count, ratingHistogram: histogram(a.id, rating, count),
    downloads: downloads(a.id), depends: a.depends || [], protection: a.protection,
    featured: !!a.featured, editorsChoice: !!a.editorsChoice, isNew: !!a.isNew, real: true,
    icon: iconFor(a.id, CAT_HUE[a.primaryCategory]), minPilotVersion: a.minPilotVersion || '1.0.0',
    runtimes: a.runtimes || ['go'], publishedAt: a.publishedAt || null, updatedAt: a.publishedAt || null,
  };
}

function buildPlace(p) {
  const cats = [p.cat, ...(p.extra || [])];
  const premium = !!p.featured;
  const rating = ratingFor(p.id, premium), count = ratingCount(p.id);
  const methods = [
    { name: `${p.id.split('.').pop()}.run`, summary: `Primary entrypoint for ${p.name}.` },
    { name: `${p.id.split('.').pop()}.status`, summary: 'Report health and readiness.' },
    { name: `${p.id.split('.').pop()}.exec`, summary: 'Verbatim-argv passthrough to the full CLI surface.' },
    { name: `${p.id.split('.').pop()}.help`, summary: 'Discovery: every method with params and latency class.' },
  ];
  const grants = ['fs.read:$APP/config.json', 'audit.log:*'];
  if (['data','compute','devops'].includes(p.cat)) { grants.push('fs.write:$APP', 'proc.exec:' + p.glyph, 'net.dial:127.0.0.1'); }
  else { grants.push('net.dial:*'); }
  const protection = ['data','compute','devops','automation'].includes(p.cat) ? 'guarded' : 'shareable';
  return {
    id: p.id, name: p.name, tagline: p.tagline,
    description: `${p.name} — ${p.tagline}. Packaged as a native CLI for agents: one command to install, sha256-pinned and signature-verified, auto-spawned by the daemon as a typed IPC service. Every method is discoverable at runtime via ${p.id.split('.').pop()}.help, which reports each method's parameters and a latency class (fast / med / slow) so a caller can pick the cheapest method that fits.\n\nStructured JSON in, structured JSON out — no browser, no headless Chrome, native protocol access from first byte.`,
    categories: cats, primaryCategory: p.cat, keywords: p.kw || [p.name.toLowerCase()],
    version: p.v, vendor: p.vendor, vendorUrl: null, license: p.lic,
    sourceUrl: `https://github.com/pilot-protocol/${p.id.split('.').pop()}`, homepage: null,
    methods, changelog: [{ version: p.v, date: '2026-06-' + (10 + (hash(p.id) % 19)).toString().padStart(2, '0'), notes: [`Native-CLI packaging of ${p.name} ${p.v} for the Pilot app store`, 'Structured-JSON results over IPC', 'Runtime method discovery via <app>.help'] }],
    grants,
    bundles: bundlesFor(p.id, p.bytes), installedBytes: Math.round(p.bytes * 1.7),
    rating, ratingCount: count, ratingHistogram: histogram(p.id, rating, count),
    downloads: downloads(p.id), depends: p.deps || [], protection,
    featured: !!p.featured, editorsChoice: false, isNew: !!p.isNew, real: false,
    icon: iconFor(p.id, CAT_HUE[p.cat]), minPilotVersion: '1.0.0',
    runtimes: ['native-cli'], publishedAt: null, updatedAt: null,
  };
}

const apps = [...REAL.map(buildReal), ...PLACE.map(buildPlace)];

// featured order: postgres first, then others flagged featured
const featuredOrder = ['io.pilot.postgres','io.pilot.duckdb','io.pilot.docker'];

const banner = `// AUTO-GENERATED by scripts/gen-apps.mjs — do not edit by hand.\n// 11 real Pilot catalogue apps + curated placeholders for the full store vision.\n`;
const body = `${banner}
export interface AppMethod { name: string; summary?: string; }
export interface AppChangelog { version: string; date?: string | null; notes: string[]; }
export interface AppBundle { platform: string; bytes: number; }
export interface AppDependency { id: string; reason: string; optional?: boolean; }
export interface AppIcon { mode: 'mask' | 'image'; img: string | null; fit: string | null; pos: string | null; color: string; ink: boolean; file: string | null; hue: number; }
export interface App {
  id: string; name: string; tagline: string; description: string;
  categories: string[]; primaryCategory: string; keywords: string[];
  version: string; vendor: string; vendorUrl: string | null; license: string;
  sourceUrl: string | null; homepage: string | null;
  methods: AppMethod[]; changelog: AppChangelog[]; grants: string[];
  bundles: AppBundle[]; installedBytes: number;
  rating: number; ratingCount: number; ratingHistogram: number[]; downloads: number;
  depends: AppDependency[]; protection: 'shareable' | 'guarded';
  featured: boolean; editorsChoice: boolean; isNew: boolean; real: boolean;
  icon: AppIcon; minPilotVersion: string; runtimes: string[];
  publishedAt: string | null; updatedAt: string | null;
}
export interface Category { id: string; name: string; blurb: string; hue: number; }

export const categories: Category[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const apps: App[] = ${JSON.stringify(apps, null, 2)};

export const featuredOrder: string[] = ${JSON.stringify(featuredOrder)};

// ---- derived helpers ----
const byId = new Map(apps.map((a) => [a.id, a]));
export function getApp(id: string): App | undefined { return byId.get(id); }
export function appsByCategory(cat: string): App[] {
  return apps.filter((a) => a.categories.includes(cat));
}
export function featuredApps(): App[] {
  const ordered = featuredOrder.map((id) => byId.get(id)).filter(Boolean) as App[];
  const rest = apps.filter((a) => a.featured && !featuredOrder.includes(a.id));
  return [...ordered, ...rest];
}
export function editorsChoice(): App[] { return apps.filter((a) => a.editorsChoice); }
export function newApps(): App[] { return apps.filter((a) => a.isNew); }
export function dependents(id: string): App[] {
  return apps.filter((a) => a.depends.some((d) => d.id === id));
}
export function relatedApps(app: App, limit = 6): App[] {
  return apps
    .filter((a) => a.id !== app.id && a.categories.some((c) => app.categories.includes(c)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
`;

fs.writeFileSync(OUT, body);
console.log('wrote', OUT, '\\n apps:', apps.length, '| real:', REAL.length, '| placeholders:', PLACE.length);
console.log('featured:', apps.filter(a=>a.featured).map(a=>a.id).join(', '));
console.log('with deps:', apps.filter(a=>a.depends.length).length);
console.log('icons copied:', _copied.length);
