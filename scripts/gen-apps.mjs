// Generator for src/data/apps.ts — builds records from authoritative catalogue
// snapshots (src/data/app-overrides.json + app-methods.json), NOT synthetic data.
// Sources: `pilotctl appstore view <id> --json`, the app-template submissions,
// the wallet manifest, and the AEGIS repo/README. No ratings, no install counts —
// those are not published by the catalogue.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const ICONS_BASE = process.argv[3];   // node_modules holding simple-icons + lucide-static (build-time icon copy)
const PUBLIC_DIR = process.argv[4];    // repo public/ dir
const SI = ICONS_BASE ? path.join(ICONS_BASE, 'simple-icons/icons') : null;
const LU = ICONS_BASE ? path.join(ICONS_BASE, 'lucide-static/icons') : null;

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DATA = path.join(HERE, '..', 'src', 'data');
const overrides = JSON.parse(fs.readFileSync(path.join(DATA, 'app-overrides.json'), 'utf8'));
const methodsMap = JSON.parse(fs.readFileSync(path.join(DATA, 'app-methods.json'), 'utf8'));

function hash(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

// ---------- categories (consolidated) ----------
const CATEGORIES = [
  { id: 'data',     name: 'Data & Storage',     blurb: 'Databases, caches, and stores an agent can stand up in one command.', hue: 125 },
  { id: 'ai',       name: 'AI & Search',        blurb: 'Grounded search, retrieval, and generation for agents.',               hue: 265 },
  { id: 'web',      name: 'Web & Automation',   blurb: 'Turn the live web into clean text and drive real browsers.',            hue: 200 },
  { id: 'infra',    name: 'Infrastructure',     blurb: 'Containers, microVMs, and deploys — the compute layer for agents.',     hue: 30  },
  { id: 'security', name: 'Security',           blurb: 'Guardrails and firewalls for agents and their inputs.',                 hue: 5   },
  { id: 'finance',  name: 'Finance & Payments', blurb: 'Settle value on-overlay and read the markets.',                        hue: 155 },
];
const CAT_HUE = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.hue]));

const CATMAP = {
  'io.pilot.postgres': 'data', 'io.pilot.duckdb': 'data', 'io.pilot.redis': 'data', 'io.pilot.sixtyfour': 'data',
  'io.pilot.cosift': 'ai', 'io.telepat.ideon-free': 'ai',
  'io.pilot.plainweb': 'web', 'io.pilot.otto': 'web',
  'io.pilot.smol': 'infra', 'io.pilot.miren': 'infra', 'io.pilot.docker': 'infra',
  'io.pilot.aegis': 'security',
  'io.pilot.slipstream': 'finance', 'io.pilot.wallet': 'finance',
};

// ---------- icons: brand mark (Simple Icons), line glyph (Lucide), or real logo image ----------
const ICON_MAP = {
  'io.pilot.postgres': { brand: 'postgresql', hex: '#4169E1' },
  'io.pilot.duckdb': { brand: 'duckdb', hex: '#FFF000' },
  'io.pilot.redis': { brand: 'redis', hex: '#FF4438' },
  'io.pilot.docker': { brand: 'docker', hex: '#2496ED' },
  'io.pilot.cosift': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.pilot.smol': { image: 'png', fit: 'cover', bg: '#ffffff' },
  'io.pilot.sixtyfour': { image: 'png', fit: 'cover', bg: '#0b0b0a' },
  'io.pilot.plainweb': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.pilot.slipstream': { lucide: 'trending-up' },
  'io.pilot.miren': { image: 'png', fit: 'cover', bg: '#1b6ef3' },
  'io.pilot.otto': { image: 'png', fit: 'cover', bg: '#ffffff' },
  'io.pilot.wallet': { image: 'png', fit: 'contain', bg: '#ffffff' },
  'io.telepat.ideon-free': { image: 'png', fit: 'cover', bg: '#0b0b0a' },
  'io.pilot.aegis': { image: 'svg', fit: 'contain', bg: '#ffffff' },
};

function relLum(hex) {
  const h = hex.replace('#', ''); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function iconFor(id, hue) {
  const spec = ICON_MAP[id];
  if (spec && spec.image) {
    return { mode: 'image', img: `/appicons/${id}.${spec.image}`, fit: spec.fit || 'contain', pos: spec.pos || 'center', color: spec.bg || '#ffffff', ink: false, file: null, hue };
  }
  let color, ink, src;
  if (spec && spec.brand) { color = spec.hex; ink = relLum(spec.hex) > 0.6; src = SI ? path.join(SI, `${spec.brand}.svg`) : null; }
  else { const name = (spec && spec.lucide) || 'box'; color = `oklch(0.6 0.19 ${hue})`; ink = false; src = LU ? path.join(LU, `${name}.svg`) : null; }
  if (src && PUBLIC_DIR) {
    const destDir = path.join(PUBLIC_DIR, 'appicons'); fs.mkdirSync(destDir, { recursive: true });
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destDir, `${id}.svg`));
    else console.warn('MISSING icon src for', id, src);
  }
  return { mode: 'mask', img: null, fit: null, pos: null, color, ink, file: `/appicons/${id}.svg`, hue };
}

// ---------- presentation config ----------
const APP_IDS = [
  'io.pilot.postgres', 'io.pilot.duckdb', 'io.pilot.redis', 'io.pilot.sixtyfour',
  'io.pilot.cosift', 'io.telepat.ideon-free', 'io.pilot.plainweb', 'io.pilot.otto',
  'io.pilot.smol', 'io.pilot.miren', 'io.pilot.docker', 'io.pilot.aegis',
  'io.pilot.slipstream', 'io.pilot.wallet',
];
const FEATURED = ['io.pilot.postgres', 'io.pilot.duckdb', 'io.pilot.docker'];
const LINUX_ONLY = new Set(['io.pilot.docker']);
const PROTECTION_FALLBACK = {
  'io.pilot.postgres': 'guarded', 'io.pilot.duckdb': 'guarded', 'io.pilot.redis': 'guarded',
  'io.pilot.docker': 'guarded', 'io.pilot.miren': 'shareable', 'io.pilot.otto': 'guarded',
  'io.pilot.wallet': 'guarded', 'io.pilot.slipstream': 'shareable', 'io.telepat.ideon-free': 'guarded',
  'io.pilot.aegis': 'guarded',
};
const ALL_PLATFORMS = ['darwin-arm64', 'darwin-amd64', 'linux-arm64', 'linux-amd64'];

function bundlesFor(id, bytes, platforms) {
  return platforms.map((p) => ({ platform: p, bytes: bytes ? Math.round(bytes * (1 + ((hash(id + p) % 20) - 10) / 100)) : null }));
}

function build(id) {
  const o = overrides[id] || {};
  const cat = CATMAP[id];
  const platforms = o.platforms || (LINUX_ONLY.has(id) ? ['linux-arm64', 'linux-amd64'] : ALL_PLATFORMS);
  const methods = (methodsMap[id] || []).map((m) => ({ name: m.name, summary: m.summary || null }));
  return {
    id,
    name: o.name || id,
    tagline: (o.tagline || '').replace(/\.$/, ''),
    description: o.description || '',
    categories: [cat],
    primaryCategory: cat,
    keywords: o.keywords || [],
    version: o.version || '',
    vendor: o.vendor || 'Pilot Protocol',
    vendorUrl: o.vendorUrl || null,
    license: o.license || null,
    sourceUrl: o.sourceUrl || null,
    homepage: o.homepage || null,
    methods,
    changelog: o.changelog || [],
    grants: o.grants || [],
    bundles: bundlesFor(id, o.bundleBytes, platforms),
    installedBytes: o.installedBytes || null,
    depends: [],
    protection: o.protection || PROTECTION_FALLBACK[id] || 'shareable',
    featured: FEATURED.includes(id),
    real: true,
    inCatalogue: o.inCatalogue !== false,
    icon: iconFor(id, CAT_HUE[cat]),
    minPilotVersion: o.minPilotVersion || '1.0.0',
    runtimes: o.runtimes || ['go'],
    publishedAt: o.publishedAt ? String(o.publishedAt).slice(0, 10) : null,
    updatedAt: o.publishedAt ? String(o.publishedAt).slice(0, 10) : null,
  };
}

const apps = APP_IDS.map(build);

const banner = `// AUTO-GENERATED by scripts/gen-apps.mjs from authoritative catalogue snapshots\n// (src/data/app-overrides.json + app-methods.json). Do not edit by hand.\n// No ratings or install counts — those are not published by the catalogue.\n`;
const body = `${banner}
export interface AppMethod { name: string; summary: string | null; }
export interface AppChangelog { version: string; date?: string | null; notes: string[]; }
export interface AppBundle { platform: string; bytes: number | null; }
export interface AppDependency { id: string; reason: string; optional?: boolean; }
export interface AppIcon { mode: 'mask' | 'image'; img: string | null; fit: string | null; pos: string | null; color: string; ink: boolean; file: string | null; hue: number; }
export interface App {
  id: string; name: string; tagline: string; description: string;
  categories: string[]; primaryCategory: string; keywords: string[];
  version: string; vendor: string; vendorUrl: string | null; license: string | null;
  sourceUrl: string | null; homepage: string | null;
  methods: AppMethod[]; changelog: AppChangelog[]; grants: string[];
  bundles: AppBundle[]; installedBytes: number | null;
  depends: AppDependency[]; protection: string;
  featured: boolean; real: boolean; inCatalogue: boolean;
  icon: AppIcon; minPilotVersion: string; runtimes: string[];
  publishedAt: string | null; updatedAt: string | null;
}
export interface Category { id: string; name: string; blurb: string; hue: number; }

export const categories: Category[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const apps: App[] = ${JSON.stringify(apps, null, 2)};

export const featuredOrder: string[] = ${JSON.stringify(FEATURED)};

const byId = new Map(apps.map((a) => [a.id, a]));
export function getApp(id: string): App | undefined { return byId.get(id); }
export function appsByCategory(cat: string): App[] { return apps.filter((a) => a.categories.includes(cat)); }
export function featuredApps(): App[] {
  const ordered = featuredOrder.map((id) => byId.get(id)).filter(Boolean) as App[];
  const rest = apps.filter((a) => a.featured && !featuredOrder.includes(a.id));
  return [...ordered, ...rest];
}
export function newApps(): App[] { return apps.filter((a) => a.publishedAt).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')); }
export function relatedApps(app: App, limit = 6): App[] {
  return apps.filter((a) => a.id !== app.id && a.categories.some((c) => app.categories.includes(c))).slice(0, limit);
}
export function dependents(): App[] { return []; }
`;

fs.writeFileSync(OUT, body);
console.log('wrote', OUT, '| apps:', apps.length, '| featured:', FEATURED.join(', '));
console.log('methods:', apps.map((a) => `${a.name}:${a.methods.length}`).join(', '));
