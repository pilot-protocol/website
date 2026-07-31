#!/usr/bin/env node
/**
 * Post-build integrity check for the generated static site.
 *
 * Validates internal routes, assets and fragments, then checks public HTML
 * pages for baseline metadata and accessibility semantics. Run after `build`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://pilotprotocol.network';
const PUBLIC_HOSTS = new Set(['pilotprotocol.network', 'www.pilotprotocol.network']);

if (!existsSync(DIST)) {
  console.error('✗ dist/ is missing. Run `npm run build` before `npm run check:site`.');
  process.exit(1);
}

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function toPosix(value) {
  return value.split(sep).join('/');
}

function routeForFile(file) {
  const rel = `/${toPosix(relative(DIST, file))}`;
  if (rel === '/index.html') return '/';
  if (rel.endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  if (rel.endsWith('.html')) return rel.slice(0, -'.html'.length);
  return rel;
}

function sourceLabel(file) {
  return toPosix(relative(DIST, file));
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function withoutExecutableBodies(html) {
  return html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>')
    .replace(/<!--[\s\S]*?-->/g, '');
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? '') : null;
}

function textContent(markup) {
  return decodeHtml(markup.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function safeDecode(value) {
  try { return decodeURIComponent(value); }
  catch { return value; }
}

async function targetFor(pathname) {
  const decoded = safeDecode(pathname);
  const normalized = decoded.replace(/\/{2,}/g, '/');
  const clean = normalized.replace(/^\/+/, '');
  const direct = resolve(DIST, clean);
  if (!(direct === DIST || direct.startsWith(`${DIST}${sep}`))) return null;

  const candidates = normalized.endsWith('/')
    ? [`${direct}.html`, join(direct, 'index.html')]
    : [direct, `${direct}.html`, join(direct, 'index.html')];

  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch { /* Try the next static-route form. */ }
  }
  return null;
}

function referenceUrl(raw, sourceRoute) {
  const value = decodeHtml(raw.trim());
  if (!value || value === '#' || /^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(value)) return null;
  if (value.startsWith('//')) return null;

  let url;
  try { url = new URL(value, `${ORIGIN}${sourceRoute}`); }
  catch { return { invalid: true, value }; }

  if (!PUBLIC_HOSTS.has(url.hostname)) return null;
  return { url, value };
}

function markupReferences(html) {
  const clean = withoutExecutableBodies(html);
  const refs = [];
  const regular = /\b(?:href|src|poster|action)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of clean.matchAll(regular)) refs.push(match[1] ?? match[2] ?? '');

  const srcsets = /\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of clean.matchAll(srcsets)) {
    const value = match[1] ?? match[2] ?? '';
    for (const candidate of value.split(',')) {
      const candidateUrl = candidate.trim().split(/\s+/)[0];
      if (candidateUrl) refs.push(candidateUrl);
    }
  }
  return refs;
}

function cssReferences(css) {
  const refs = [];
  const pattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi;
  for (const match of css.matchAll(pattern)) refs.push(match[1] ?? match[2] ?? match[3] ?? '');
  return refs;
}

const allFiles = await walk(DIST);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html') && !sourceLabel(file).startsWith('cloudflare-pages/'));
const cssFiles = allFiles.filter((file) => file.endsWith('.css'));
const htmlCache = new Map();
const idsCache = new Map();
const errors = [];
let referencesChecked = 0;

async function htmlFor(file) {
  if (!htmlCache.has(file)) htmlCache.set(file, await readFile(file, 'utf8'));
  return htmlCache.get(file);
}

async function idsFor(file) {
  if (!idsCache.has(file)) {
    const html = await htmlFor(file);
    const ids = new Set();
    for (const match of html.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
      ids.add(decodeHtml(match[1] ?? match[2] ?? ''));
    }
    idsCache.set(file, ids);
  }
  return idsCache.get(file);
}

async function checkReference(raw, sourceFile, sourceRoute) {
  const parsed = referenceUrl(raw, sourceRoute);
  if (!parsed) return;
  if (parsed.invalid) {
    errors.push(`${sourceLabel(sourceFile)}: invalid URL “${parsed.value}”`);
    return;
  }

  referencesChecked += 1;
  const { url, value } = parsed;
  const target = await targetFor(url.pathname);
  if (!target) {
    errors.push(`${sourceLabel(sourceFile)}: missing internal target “${value}”`);
    return;
  }

  if (!url.hash || !target.endsWith('.html')) return;
  if (url.pathname.replace(/\.html$/, '') === '/app-store' && /^#cat-[\w.-]+$/.test(url.hash)) return;

  const fragment = safeDecode(url.hash.slice(1));
  if (fragment && !(await idsFor(target)).has(fragment)) {
    errors.push(`${sourceLabel(sourceFile)}: missing fragment “#${fragment}” in ${sourceLabel(target)}`);
  }
}

for (const file of htmlFiles) {
  const html = await htmlFor(file);
  const route = routeForFile(file);
  for (const ref of markupReferences(html)) await checkReference(ref, file, route);
}

for (const file of cssFiles) {
  const css = await readFile(file, 'utf8');
  const route = routeForFile(file);
  for (const ref of cssReferences(css)) await checkReference(ref, file, route);
}

const titles = new Map();
const canonicals = new Map();
let publicPagesChecked = 0;

for (const file of htmlFiles) {
  const label = sourceLabel(file);
  const route = routeForFile(file);
  if (route.startsWith('/plain/') || route === '/404' || route === '/500') continue;

  publicPagesChecked += 1;
  const html = await htmlFor(file);
  const clean = withoutExecutableBodies(html);

  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(clean)) {
    errors.push(`${label}: missing html lang attribute`);
  }
  if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>/i.test(clean)) {
    errors.push(`${label}: missing viewport metadata`);
  }

  const titleMatch = clean.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? textContent(titleMatch[1]) : '';
  if (!title) errors.push(`${label}: missing document title`);
  else {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(label);
  }

  const descriptionTag = clean.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i)?.[0];
  if (!descriptionTag || !attr(descriptionTag, 'content')?.trim()) {
    errors.push(`${label}: missing meta description`);
  }

  const canonicalTag = [...clean.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical'));
  const canonical = canonicalTag ? attr(canonicalTag, 'href')?.trim() : '';
  if (!canonical) errors.push(`${label}: missing canonical URL`);
  else {
    if (!canonicals.has(canonical)) canonicals.set(canonical, []);
    canonicals.get(canonical).push(label);
  }

  const h1Count = [...clean.matchAll(/<h1\b[^>]*>/gi)].length;
  if (h1Count !== 1) errors.push(`${label}: expected one h1, found ${h1Count}`);

  const seenIds = new Set();
  for (const match of clean.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const id = decodeHtml(match[1] ?? match[2] ?? '');
    if (seenIds.has(id)) errors.push(`${label}: duplicate id “${id}”`);
    seenIds.add(id);
  }

  for (const match of clean.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(match[0], 'alt') === null) errors.push(`${label}: image missing alt attribute`);
  }

  for (const match of clean.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    if ((attr(tag, 'target') ?? '').toLowerCase() !== '_blank') continue;
    const rel = (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
    if (!rel.includes('noopener')) errors.push(`${label}: target="_blank" link missing rel="noopener"`);
  }

  for (const match of clean.matchAll(/<button\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\bdata-install-copy\b/i.test(tag)) continue;
    if ((attr(tag, 'type') ?? '').toLowerCase() !== 'button') {
      errors.push(`${label}: install copy control must use type="button"`);
    }
    const copyText = attr(tag, 'data-copy-text')?.trim() ?? '';
    if (!copyText) errors.push(`${label}: install copy control is missing data-copy-text`);
    else if (/^\$\s/.test(copyText)) errors.push(`${label}: copied install command includes a shell prompt marker`);
  }
}

for (const [title, files] of titles) {
  if (files.length > 1) errors.push(`duplicate title “${title}” in ${files.join(', ')}`);
}
for (const [canonical, files] of canonicals) {
  if (files.length > 1) errors.push(`duplicate canonical “${canonical}” in ${files.join(', ')}`);
}

if (errors.length) {
  console.error(`✗ Site integrity check failed with ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `✓ Site integrity OK — ${htmlFiles.length} HTML files, ${publicPagesChecked} public pages, ` +
  `${referencesChecked.toLocaleString('en-US')} internal references checked.`,
);
