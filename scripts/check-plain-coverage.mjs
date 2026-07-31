#!/usr/bin/env node
// check-plain-coverage.mjs
//
// CI guard: every "human UI" page that is supposed to have a plain-text
// "machine UI" twin must actually have one — and no plain page may be left
// orphaned after its human source is deleted.
//
// This is the cheap structural guard from the source-of-truth plan. It does
// NOT compare content (that drift is a separate, harder problem); it only
// enforces that the two trees stay in 1:1 correspondence. It would have caught
// both real bugs we hit: the orphaned plain/docs/tags.astro (human page
// deleted) and the missing plain twin for docs/consent.astro (human page
// added, plain forgotten).
//
// Usage:
//   node scripts/check-plain-coverage.mjs
//
// Exit code: 0 when coverage is complete, 1 when any page is missing/orphaned.

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// Curated main-page pairs (human source -> plain twin). Not every human page
// has a plain twin (404, terms, privacy, etc. intentionally don't); only the
// pages listed here are required to. Keep this in sync with the marketing
// pages that ship a /plain/ variant. The skills plain pages render
// live from upstream JSON, so they pair with their /for/ marketing sources.
const MAIN_PAIRS = [
  { human: 'src/pages/index.astro',          plain: 'src/pages/plain/index.astro' },
  { human: 'src/pages/for/p2p.astro',        plain: 'src/pages/plain/p2p.astro' },
  { human: 'src/pages/for/mcp.astro',        plain: 'src/pages/plain/mcp.astro' },
  { human: 'src/pages/plans.astro',          plain: 'src/pages/plain/plans.astro' },
  { human: 'src/pages/trust.astro',          plain: 'src/pages/plain/trust.astro' },
  { human: 'src/pages/for/skills.astro',     plain: 'src/pages/plain/skills/index.astro' },
  { human: 'src/pages/app-store.astro',      plain: 'src/pages/plain/app-store.astro' },
  { human: 'src/pages/publish.astro',        plain: 'src/pages/plain/publish.astro' },
];

// Directory pair checked for strict 1:1 slug correspondence.
const DOCS_HUMAN_DIR = 'src/pages/docs';
const DOCS_PLAIN_DIR = 'src/pages/plain/docs';

async function astroSlugs(relDir) {
  const abs = join(REPO_ROOT, relDir);
  const entries = await readdir(abs);
  return new Set(
    entries.filter((f) => f.endsWith('.astro')).map((f) => basename(f, '.astro')),
  );
}

const PLAIN_DIR = 'src/pages/plain';

// Recursively collect every plain .astro file (repo-relative paths).
async function walkAstro(relDir) {
  const out = [];
  const entries = await readdir(join(REPO_ROOT, relDir), { withFileTypes: true });
  for (const e of entries) {
    const rel = `${relDir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await walkAstro(rel)));
    else if (e.name.endsWith('.astro')) out.push(rel);
  }
  return out;
}

// Same hashing as scripts/regen-plain.mjs sourceHash(): raw utf8, sha256, hex.
function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// Pull the regen provenance stamp out of a generated plain file, if present.
// Returns { source, hash } or null for hand-written / data-driven plain pages.
function readStamp(plainText) {
  const src = plainText.match(/^\/\/ plain-source:\s*(.+)$/m);
  const hash = plainText.match(/^\/\/ plain-source-sha256:\s*([0-9a-f]{64})$/m);
  if (!src || !hash) return null;
  return { source: src[1].trim(), hash: hash[1] };
}

async function main() {
  const errors = [];

  // 1. Curated main pages: both sides must exist.
  for (const { human, plain } of MAIN_PAIRS) {
    if (!existsSync(join(REPO_ROOT, human))) {
      errors.push(`Manifest source missing: ${human} (listed in MAIN_PAIRS but not on disk — update the manifest)`);
    } else if (!existsSync(join(REPO_ROOT, plain))) {
      errors.push(`Missing plain twin: ${human} -> ${plain}`);
    }
  }

  // 2. Docs: strict 1:1 between human and plain slug sets.
  const human = await astroSlugs(DOCS_HUMAN_DIR);
  const plain = await astroSlugs(DOCS_PLAIN_DIR);

  for (const slug of human) {
    if (!plain.has(slug)) {
      errors.push(`Missing plain twin: ${DOCS_HUMAN_DIR}/${slug}.astro -> ${DOCS_PLAIN_DIR}/${slug}.astro`);
    }
  }
  for (const slug of plain) {
    if (!human.has(slug)) {
      errors.push(`Orphaned plain page: ${DOCS_PLAIN_DIR}/${slug}.astro has no human source at ${DOCS_HUMAN_DIR}/${slug}.astro`);
    }
  }

  // 3. Content drift: every plain file that carries a regen provenance stamp
  //    must match the CURRENT hash of its source. A mismatch means the source
  //    was edited but the plain twin was never regenerated — the silent staleness
  //    the structural checks above can't see. Files with no stamp (data-driven
  //    skills/setups pages, hand-written plain pages) are skipped here.
  let stamped = 0;
  for (const rel of await walkAstro(PLAIN_DIR)) {
    const stamp = readStamp(await readFile(join(REPO_ROOT, rel), 'utf8'));
    if (!stamp) continue;
    stamped += 1;
    const srcAbs = join(REPO_ROOT, stamp.source);
    if (!existsSync(srcAbs)) {
      errors.push(`Stale plain page: ${rel} was generated from ${stamp.source}, which no longer exists (remove the plain page or restore the source)`);
      continue;
    }
    const current = sha256(await readFile(srcAbs, 'utf8'));
    if (current !== stamp.hash) {
      errors.push(`Stale plain page: ${stamp.source} changed since ${rel} was generated — re-run \`node scripts/regen-plain.mjs\` and commit the result`);
    }
  }

  const checked = MAIN_PAIRS.length + human.size + stamped;
  if (errors.length) {
    console.error('✗ Plain (machine UI) coverage check failed:\n');
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      `\n${errors.length} problem(s). Every human page above needs a /plain/ twin, ` +
      `and every plain page needs a human source. Add the missing file or remove the orphan.`,
    );
    process.exit(1);
  }

  console.log(`✓ Plain coverage OK — ${checked} required pairs present, no orphans, ${stamped} stamped twins in sync with source.`);
}

main().catch((err) => {
  console.error('check-plain-coverage.mjs crashed:', err);
  process.exit(1);
});
