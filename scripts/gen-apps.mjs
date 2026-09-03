// Generator for src/data/apps.ts.
//
// The records come from the app-store metadata API — the one source the Alpha
// management console reads too. Before it existed this script built them from
// local JSON (app-overrides.json + app-methods.json + app-demos.json) while the
// console carried its own copy pasted across by hand, and the two drifted:
// 25 of 27 apps had different summary copy on the two surfaces.
//
// Editing an app now means editing one file in pilot-protocol/app-template
// under appstore-meta/data/apps/ and redeploying the API. Nothing about an
// app's copy is decided here.
//
//   node scripts/gen-apps.mjs <out.ts> [node_modules] [public/]
//
// APPSTORE_META_URL overrides the API. --offline skips the fetch entirely.
//
// The fetched document is written to src/data/app-metadata.json and committed.
// A static build must not depend on a live service: if the API is unreachable
// the snapshot is used and the build carries on, one release behind at worst.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const ICONS_BASE = process.argv[3];   // node_modules holding simple-icons + lucide-static
const PUBLIC_DIR = process.argv[4];    // repo public/ dir
const SI = ICONS_BASE ? path.join(ICONS_BASE, 'simple-icons/icons') : null;
const LU = ICONS_BASE ? path.join(ICONS_BASE, 'lucide-static/icons') : null;

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DATA = path.join(HERE, '..', 'src', 'data');
const SNAPSHOT = path.join(DATA, 'app-metadata.json');
const API = process.env.APPSTORE_META_URL || 'https://appstore-meta.pilotprotocol.network/v1/appstore/metadata';
const OFFLINE = process.argv.includes('--offline');

// ---------- the document ----------

async function fetchDocument() {
  if (OFFLINE) return null;
  try {
    const response = await fetch(API, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const document = await response.json();
    // An empty document is indistinguishable from a working one downstream and
    // would silently publish an empty store. Treat it as a failed fetch.
    if (!Array.isArray(document.apps) || document.apps.length === 0) throw new Error('no apps in the document');
    if (!Array.isArray(document.categories) || document.categories.length === 0) throw new Error('no categories in the document');
    return document;
  } catch (error) {
    console.warn(`WARN  could not read ${API}: ${error.message}`);
    return null;
  }
}

function readSnapshot() {
  if (!fs.existsSync(SNAPSHOT)) return null;
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  } catch (error) {
    console.warn(`WARN  snapshot ${SNAPSHOT} is unreadable: ${error.message}`);
    return null;
  }
}

function writeSnapshot(document) {
  // generated_at is the API process's start time, not a property of the
  // content; keeping it would make every run a diff.
  const { generated_at, ...content } = document;
  fs.writeFileSync(SNAPSHOT, `${JSON.stringify({ ...content, fetched_from: API }, null, 2)}\n`);
}

// ---------- icons ----------
// Which glyph an app's mark is cut from now travels in the document
// (icon.mark), so this file no longer keeps its own id-to-glyph table.

function copyMark(id, mark) {
  if (!mark || !PUBLIC_DIR) return;
  const base = mark.set === 'lucide' ? LU : SI;
  if (!base) return;
  const source = path.join(base, `${mark.name}.svg`);
  const destination = path.join(PUBLIC_DIR, 'appicons');
  fs.mkdirSync(destination, { recursive: true });
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(destination, `${id}.svg`));
  else console.warn(`WARN  missing icon source for ${id}: ${source}`);
}

// ---------- shape ----------
// The exported TypeScript shape is unchanged, so every page that reads
// apps.ts keeps working. This maps the API's snake_case onto it.

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

// A step is always a whole object. The app page dereferences
// `demo.quickstart.command` directly — the TypeScript shape says quickstart is
// non-nullable — so emitting null here would crash the build rather than drop
// a section.
function toStep(step) {
  const s = step || {};
  return {
    title: emptyToNull(s.title), goal: emptyToNull(s.goal),
    command: s.command || '', expect: emptyToNull(s.expect),
    cost: emptyToNull(s.cost), note: emptyToNull(s.note),
  };
}

function toDemo(demo, id) {
  if (!demo) return null;
  // A demo whose quickstart has no command has nothing to show and would
  // render an empty <code> block. Drop it, loudly.
  if (!demo.quickstart || !demo.quickstart.command) {
    console.warn(`WARN  ${id}: product_demo has no quickstart command; dropping the demo`);
    return null;
  }
  return {
    skill: demo.skill || '', title: demo.title || '', when_to_use: demo.when_to_use || '',
    metered: !!demo.metered,
    quickstart: toStep(demo.quickstart),
    // A step with no command renders an empty block on both surfaces.
    examples: (demo.examples || []).filter((e) => e && e.command).map(toStep),
    cost: demo.cost ? {
      unit: demo.cost.unit || '', free_budget: demo.cost.free_budget || '',
      hard_cap_usd: demo.cost.hard_cap_usd ?? null,
      operations: (demo.cost.operations || []).map((op) => ({ op: op.op || '', price: op.price || '', note: emptyToNull(op.note) })),
      worked_total: emptyToNull(demo.cost.worked_total), check_balance: emptyToNull(demo.cost.check_balance),
    } : null,
    gotchas: demo.gotchas || [], next: demo.next || [],
  };
}

function toApp(app) {
  copyMark(app.id, app.icon?.mark);
  return {
    id: app.id,
    name: app.name,
    tagline: (app.tagline || '').replace(/\.$/, ''),
    description: app.description || '',
    categories: app.categories || [],
    primaryCategory: app.primary_category,
    keywords: app.keywords || [],
    version: app.version || '',
    vendor: app.vendor || 'Pilot Protocol',
    vendorUrl: emptyToNull(app.vendor_url),
    license: emptyToNull(app.license),
    sourceUrl: emptyToNull(app.source_url),
    homepage: emptyToNull(app.homepage),
    methods: (app.methods || []).map((method) => ({
      name: method.name, summary: emptyToNull(method.summary),
      example: emptyToNull(method.example), gated: emptyToNull(method.gated),
    })),
    changelog: (app.changelog || []).map((release) => ({
      version: release.version, date: emptyToNull(release.date), notes: release.notes || [],
    })),
    grants: app.grants || [],
    bundles: (app.bundles || []).map((bundle) => ({ platform: bundle.platform, bytes: bundle.bytes || null })),
    installedBytes: app.installed_bytes || null,
    depends: (app.depends || []).map((dependency) => ({
      id: dependency.id, reason: dependency.reason || '', optional: !!dependency.optional,
    })),
    protection: app.protection || 'shareable',
    featured: !!app.featured,
    real: true,
    inCatalogue: app.in_catalogue !== false,
    icon: {
      mode: app.icon?.mode || 'mask',
      img: emptyToNull(app.icon?.img),
      fit: emptyToNull(app.icon?.fit),
      pos: emptyToNull(app.icon?.pos),
      color: app.icon?.color || '#ffffff',
      ink: !!app.icon?.ink,
      file: emptyToNull(app.icon?.file),
      hue: app.icon?.hue ?? 0,
    },
    minPilotVersion: app.min_pilot_version || '1.0.0',
    runtimes: app.runtimes || ['go'],
    publishedAt: emptyToNull(app.published_at),
    updatedAt: emptyToNull(app.updated_at),
    productDemo: toDemo(app.product_demo, app.id),
    limits: (app.limits || []).length ? app.limits.map((limit) => ({ label: limit.label, value: limit.value })) : null,
  };
}

// ---------- run ----------

const fetched = await fetchDocument();
if (fetched) writeSnapshot(fetched);

const document = fetched || readSnapshot();
if (!document) {
  console.error(`FATAL ${API} is unreachable and there is no snapshot at ${SNAPSHOT}.`);
  console.error('      Run once with the API reachable to create it, or pass --offline after committing one.');
  process.exit(1);
}
if (!fetched) console.warn(`WARN  building from the committed snapshot; copy may be one release behind.`);

const CATEGORIES = document.categories.map((category) => ({
  id: category.id, name: category.name, blurb: category.blurb || '', hue: category.hue ?? 0,
}));
const apps = document.apps.map(toApp);
const FEATURED = (document.featured_order || []).filter((id) => apps.some((app) => app.id === id));

const source = fetched ? API : `${path.basename(SNAPSHOT)} (offline)`;
const banner = `// AUTO-GENERATED by scripts/gen-apps.mjs from the app-store metadata API\n// (${source}) — the same document the Alpha management console reads.\n// Do not edit by hand, and do not edit the records here: change an app in\n// pilot-protocol/app-template under appstore-meta/data/apps/ and redeploy.\n// No ratings or install counts — those are not published by the catalogue.\n`;
const body = `${banner}
export interface AppMethod { name: string; summary: string | null; example: string | null; gated: string | null; }
export interface AppLimit { label: string; value: string; }
export interface AppChangelog { version: string; date?: string | null; notes: string[]; }
export interface AppBundle { platform: string; bytes: number | null; }
export interface AppDependency { id: string; reason: string; optional?: boolean; }
export interface AppIcon { mode: 'mask' | 'image'; img: string | null; fit: string | null; pos: string | null; color: string; ink: boolean; file: string | null; hue: number; }
export interface DemoStep { title?: string | null; goal?: string | null; command: string; expect?: string | null; cost?: string | null; note?: string | null; }
export interface DemoCostOp { op: string; price: string; note?: string | null; }
export interface DemoCost { unit: string; free_budget: string; hard_cap_usd: number | null; operations: DemoCostOp[]; worked_total?: string | null; check_balance?: string | null; }
export interface ProductDemo {
  skill: string; title: string; when_to_use: string; metered: boolean;
  quickstart: DemoStep; examples: DemoStep[]; cost: DemoCost | null;
  gotchas: string[]; next: string[];
}
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
  productDemo: ProductDemo | null;
  limits: AppLimit[] | null;
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
console.log('wrote', OUT, '| source:', source, '| apps:', apps.length, '| featured:', FEATURED.join(', '));
console.log('methods:', apps.map((a) => `${a.name}:${a.methods.length}`).join(', '));
