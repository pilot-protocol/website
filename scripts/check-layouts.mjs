#!/usr/bin/env node
/**
 * Enforce that every page under src/pages/ goes through one of the four
 * approved layouts. Marketing pages should NOT re-import BaseHead, Nav, or
 * Footer directly — those are wrapped by MarketingLayout (along with the
 * shared Nav highlight, the og: + canonical meta, and the JSON-LD plumbing).
 *
 * Why this exists: PILOT-32 set a single perf/quality bar for the launch.
 * Without an enforced template, new pages drift back below the bar within
 * a few commits — different fonts, missing canonical URLs, duplicate
 * security headers, accidental ogImage breakage. The four layouts are the
 * choke point that makes the standard self-enforcing.
 *
 * Approved layouts (must be imported from somewhere under src/layouts/):
 *   - MarketingLayout  — landing, plans, /for/*, 404/500, error pages
 *   - DocLayout        — anything under /docs/
 *   - BlogLayout       — any blog post (NOT /blog/index.astro itself)
 *   - PlainLayout      — any /plain/* mirror
 *
 * Allowed exceptions (intentionally bare):
 *   - src/pages/sitemap.xml.ts     — emits XML, not HTML
 *   - src/pages/blog/index.astro   — blog index, custom layout (TODO: extract)
 *
 * Run:
 *   node scripts/check-layouts.mjs
 *   exits non-zero on the first violation found
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PAGES_DIR = resolve(ROOT, 'src/pages');

// Anything matching these globs is intentionally exempt. Keep the list short
// and document each exception with a one-line reason.
const EXEMPT = new Set([
  'src/pages/sitemap.xml.ts',     // emits XML, not HTML
  'src/pages/blog/index.astro',   // blog index has a custom card-grid layout; folded into a layout in a follow-up
]);

// Each entry is the exact component basename to match. The check looks for
// imports ending with `/<name>.astro` (or just `BaseHead`) so we don't
// false-positive on PageNav, DocsFooter, DocNav-like component names.
const BANNED_IMPORTS = ['BaseHead.astro', 'Nav.astro', 'Footer.astro'];

function listAstroPages() {
  // Use git ls-files so we respect .gitignore and don't walk node_modules.
  const out = execSync('git ls-files src/pages', { cwd: ROOT, encoding: 'utf8' });
  return out
    .trim()
    .split('\n')
    .filter((p) => p.endsWith('.astro') || p.endsWith('.ts'));
}

async function checkFile(relPath) {
  if (EXEMPT.has(relPath)) return null;
  const full = resolve(ROOT, relPath);
  const src = await readFile(full, 'utf8');

  const findings = [];

  // Detect direct imports of the banned components. We require the matched
  // path segment to be the FULL component basename (preceded by '/'), so
  // names like PageNav.astro / DocsFooter.astro don't false-positive.
  for (const banned of BANNED_IMPORTS) {
    const re = new RegExp(
      `^\\s*import\\s+\\w+\\s+from\\s+['"][^'"]*\\/${banned.replace('.', '\\.')}['"]`,
      'm',
    );
    if (re.test(src)) {
      findings.push(`imports ${banned} directly — wrap in a layout instead`);
    }
  }

  // Sanity check: the page should reference at least one approved layout, OR
  // be a plain TS endpoint. Astro pages that don't pull in any layout will
  // render an empty <html> shell, which is almost always a mistake.
  if (relPath.endsWith('.astro')) {
    const usesLayout = /import\s+\w+\s+from\s+['"][^'"]*layouts\/(MarketingLayout|DocLayout|BlogLayout|PlainLayout)\.astro['"]/m.test(src);
    if (!usesLayout) {
      findings.push('does not import any of MarketingLayout / DocLayout / BlogLayout / PlainLayout');
    }
  }

  return findings.length ? { path: relPath, findings } : null;
}

async function main() {
  const files = listAstroPages();
  const violations = [];
  for (const f of files) {
    const v = await checkFile(f);
    if (v) violations.push(v);
  }

  if (violations.length === 0) {
    console.log(`✓ check-layouts: ${files.length} pages, all use an approved layout`);
    return;
  }

  console.error(`\n✗ check-layouts: ${violations.length} page(s) violate the layout policy\n`);
  for (const v of violations) {
    console.error(`  ${v.path}`);
    for (const f of v.findings) console.error(`    - ${f}`);
  }
  console.error('\nFix:');
  console.error('  Use one of: src/layouts/{Marketing,Doc,Blog,Plain}Layout.astro');
  console.error('  See CONTRIBUTING.md → "Adding a new page" for examples.\n');
  process.exit(1);
}

main().catch((err) => {
  console.error('check-layouts failed:', err);
  process.exit(2);
});
