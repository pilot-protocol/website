#!/usr/bin/env node
/**
 * Page-weight budget check for the static dist/ output.
 *
 * For each tracked page we compute the *transferred* bytes on a cold load:
 *   - the HTML itself, gzip-encoded (Cloudflare serves with brotli/gzip)
 *   - every same-origin <link rel="stylesheet"> referenced
 *   - every same-origin <script src> referenced (modulo defer/async — still
 *     counted, since the bytes hit the wire)
 *   - every same-origin <img src> (best-effort: we count file size on disk;
 *     no transcoding accounting since CF Pages doesn't re-encode for us)
 *
 * Budgets are enforced per page class. The script writes a JSON report and
 * exits non-zero if any page exceeds its budget — meant to run in CI.
 *
 * Usage:
 *   node scripts/check-page-weight.mjs              # check, exit non-zero on failure
 *   node scripts/check-page-weight.mjs --baseline   # write perf-results/baseline.json, never fail
 *   node scripts/check-page-weight.mjs --json       # print JSON to stdout
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const OUT_DIR = resolve(ROOT, 'perf-results');

const args = new Set(process.argv.slice(2));
const isBaseline = args.has('--baseline');
const jsonOnly = args.has('--json');

// Pages we track. Path is relative to dist/. Budget is the maximum allowed
// transfer size for a cold load (HTML+CSS+JS+images) in bytes. Class drives
// the budget; the same class can have multiple sample pages.
const PAGES = [
  { path: 'index.html', class: 'landing', budget: 1_000_000 },
  { path: 'plans.html', class: 'marketing', budget: 800_000 },
  { path: '404.html', class: 'marketing', budget: 500_000 },
  { path: '500.html', class: 'marketing', budget: 500_000 },
  { path: 'for/networks.html', class: 'marketing', budget: 800_000 },
  { path: 'for/p2p.html', class: 'marketing', budget: 800_000 },
  { path: 'for/mcp.html', class: 'marketing', budget: 800_000 },
  { path: 'for/skills.html', class: 'marketing', budget: 800_000 },
  { path: 'for/setups.html', class: 'marketing', budget: 800_000 },
  { path: 'for/compatibility.html', class: 'marketing', budget: 800_000 },
  { path: 'docs/index.html', class: 'docs', budget: 500_000 },
  { path: 'docs/getting-started.html', class: 'docs', budget: 500_000 },
  { path: 'docs/cli-reference.html', class: 'docs', budget: 500_000 },
  { path: 'docs/concepts.html', class: 'docs', budget: 500_000 },
  { path: 'blog/index.html', class: 'blog-index', budget: 1_000_000 },
  { path: 'blog/how-pilot-protocol-works.html', class: 'blog-post', budget: 800_000 },
  { path: 'blog/why-ai-agents-need-network-stack.html', class: 'blog-post', budget: 800_000 },
];

const STATIC_DIST_DIR = '/'; // same-origin path prefix for assets like /_astro/foo.css

function abs(distPath) {
  return resolve(DIST, distPath.replace(/^\//, ''));
}

function gzipLen(buf) {
  return gzipSync(buf, { level: 9 }).length;
}

function pickAttr(tag, attr) {
  const m = tag.match(new RegExp(`${attr}=("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
}

function extractAssets(html) {
  const links = [];
  const scripts = [];
  const imgs = [];

  // <link rel="stylesheet" href="...">
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["']stylesheet["']/i.test(tag)) continue;
    const href = pickAttr(tag, 'href');
    if (href) links.push(href);
  }

  // <script src="...">
  for (const m of html.matchAll(/<script\b[^>]*\bsrc=("[^"]+"|'[^']+')[^>]*>/gi)) {
    const tag = m[0];
    const src = pickAttr(tag, 'src');
    if (src) scripts.push(src);
  }

  // <img src="...">  (we count the on-disk file size since CF doesn't transcode)
  for (const m of html.matchAll(/<img\b[^>]*\bsrc=("[^"]+"|'[^']+')[^>]*>/gi)) {
    const tag = m[0];
    const src = pickAttr(tag, 'src');
    if (src) imgs.push(src);
  }

  return { links, scripts, imgs };
}

function isSameOrigin(url) {
  return !/^https?:\/\//i.test(url) && !url.startsWith('//') && !url.startsWith('data:');
}

async function sizeOnDisk(distAbsPath) {
  try {
    const s = await stat(distAbsPath);
    return s.size;
  } catch {
    return 0;
  }
}

async function gzippedSizeOnDisk(distAbsPath) {
  try {
    const buf = await readFile(distAbsPath);
    return gzipLen(buf);
  } catch {
    return 0;
  }
}

async function measure(page) {
  const htmlPath = abs(page.path);
  if (!existsSync(htmlPath)) {
    return { ...page, error: `missing: ${page.path}`, total: Infinity };
  }
  const html = await readFile(htmlPath, 'utf8');
  const htmlGzip = gzipLen(Buffer.from(html, 'utf8'));
  const { links, scripts, imgs } = extractAssets(html);

  // Dedupe by URL — the browser fetches each unique URL once per page load.
  // Multiple <img src="/img/foo.png"> on the same page only count toward the
  // page-weight budget once.
  const cssEntries = [];
  const seenCss = new Set();
  for (const href of links) {
    if (!isSameOrigin(href) || seenCss.has(href)) continue;
    seenCss.add(href);
    const p = resolve(DIST, href.replace(/^\//, ''));
    cssEntries.push({ href, gzip: await gzippedSizeOnDisk(p) });
  }
  const jsEntries = [];
  const seenJs = new Set();
  for (const src of scripts) {
    if (!isSameOrigin(src) || seenJs.has(src)) continue;
    seenJs.add(src);
    const p = resolve(DIST, src.replace(/^\//, ''));
    jsEntries.push({ src, gzip: await gzippedSizeOnDisk(p) });
  }
  const imgEntries = [];
  const seenImg = new Set();
  for (const src of imgs) {
    if (!isSameOrigin(src) || seenImg.has(src)) continue;
    seenImg.add(src);
    const p = resolve(DIST, src.replace(/^\//, ''));
    imgEntries.push({ src, bytes: await sizeOnDisk(p) });
  }

  const cssTotal = cssEntries.reduce((a, b) => a + b.gzip, 0);
  const jsTotal = jsEntries.reduce((a, b) => a + b.gzip, 0);
  const imgTotal = imgEntries.reduce((a, b) => a + b.bytes, 0);
  const total = htmlGzip + cssTotal + jsTotal + imgTotal;

  return {
    page: page.path,
    class: page.class,
    budget: page.budget,
    total,
    over: total > page.budget,
    breakdown: {
      htmlGzip,
      cssTotal,
      jsTotal,
      imgTotal,
    },
    detail: {
      css: cssEntries,
      js: jsEntries,
      img: imgEntries,
    },
  };
}

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} KB`;
  return `${n} B`;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`dist/ not found — run "npm run build" first`);
    process.exit(2);
  }

  const results = [];
  for (const p of PAGES) results.push(await measure(p));

  await mkdir(OUT_DIR, { recursive: true });
  const out = {
    generatedAt: new Date().toISOString(),
    distRoot: relative(ROOT, DIST),
    pages: results,
  };

  const outFile = isBaseline
    ? resolve(OUT_DIR, 'baseline.json')
    : resolve(OUT_DIR, 'page-weights.json');
  await writeFile(outFile, JSON.stringify(out, null, 2));

  if (jsonOnly) {
    process.stdout.write(JSON.stringify(out, null, 2));
    return;
  }

  console.log(`\nPage weight report — ${outFile}\n`);
  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    `${pad('PAGE', 50)}  ${pad('CLASS', 12)}  ${pad('TOTAL', 12)}  ${pad('BUDGET', 12)}  STATUS`,
  );
  console.log('-'.repeat(110));
  let failures = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`${pad(r.page, 50)}  ${pad('-', 12)}  ${pad('-', 12)}  ${pad('-', 12)}  ${r.error}`);
      failures++;
      continue;
    }
    const status = r.over ? 'OVER' : 'ok';
    console.log(
      `${pad(r.page, 50)}  ${pad(r.class, 12)}  ${pad(fmt(r.total), 12)}  ${pad(fmt(r.budget), 12)}  ${status}`,
    );
    if (r.over) failures++;
  }
  console.log();
  if (failures > 0) {
    console.error(`${failures} page(s) over budget.`);
    if (!isBaseline) process.exit(1);
  } else {
    console.log('All pages within budget.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
