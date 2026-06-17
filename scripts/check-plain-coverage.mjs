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

import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// Curated main-page pairs (human source -> plain twin). Not every human page
// has a plain twin (404, terms, privacy, etc. intentionally don't); only the
// pages listed here are required to. Keep this in sync with the marketing
// pages that ship a /plain/ variant. The skills/setups plain pages render
// live from upstream JSON, so they pair with their /for/ marketing sources.
const MAIN_PAIRS = [
  { human: 'src/pages/index.astro',          plain: 'src/pages/plain/index.astro' },
  { human: 'src/pages/for/networks.astro',   plain: 'src/pages/plain/networks.astro' },
  { human: 'src/pages/for/p2p.astro',        plain: 'src/pages/plain/p2p.astro' },
  { human: 'src/pages/for/mcp.astro',        plain: 'src/pages/plain/mcp.astro' },
  { human: 'src/pages/plans.astro',          plain: 'src/pages/plain/plans.astro' },
  { human: 'src/pages/for/skills.astro',     plain: 'src/pages/plain/skills/index.astro' },
  { human: 'src/pages/for/setups.astro',     plain: 'src/pages/plain/setups/index.astro' },
  { human: 'src/pages/for/setups/[slug].astro', plain: 'src/pages/plain/setups/[slug].astro' },
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

  const checked = MAIN_PAIRS.length + human.size;
  if (errors.length) {
    console.error('✗ Plain (machine UI) coverage check failed:\n');
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      `\n${errors.length} problem(s). Every human page above needs a /plain/ twin, ` +
      `and every plain page needs a human source. Add the missing file or remove the orphan.`,
    );
    process.exit(1);
  }

  console.log(`✓ Plain coverage OK — ${checked} required pairs present, no orphans.`);
}

main().catch((err) => {
  console.error('check-plain-coverage.mjs crashed:', err);
  process.exit(1);
});
