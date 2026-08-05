#!/usr/bin/env node
/**
 * Post-build integrity check for the generated static site.
 *
 * Validates internal routes, assets and fragments, then checks public HTML
 * pages for baseline metadata and accessibility semantics. Run after `build`.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://pilotprotocol.network';
const PUBLIC_HOSTS = new Set(['pilotprotocol.network', 'www.pilotprotocol.network']);
const MIN_TITLE_LENGTH = 50;
const MAX_TITLE_LENGTH = 60;
const MIN_CAMPAIGN_DESCRIPTION_LENGTH = 120;
const MAX_CAMPAIGN_DESCRIPTION_LENGTH = 160;
const MIN_CAMPAIGN_WORDS = 450;
const MAX_CAMPAIGN_CONTENT_OVERLAP = 0.55;

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

function normalizedRoute(value) {
  const pathname = String(value || '/')
    .replace(/\/index\.html$/i, '/')
    .replace(/\.html$/i, '')
    .replace(/\/{2,}/g, '/');
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

function isCampaignRoute(route) {
  return route.startsWith('/solutions/') || route.startsWith('/enterprise/');
}

function campaignTerms(value) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 3),
  );
}

function jaccardSimilarity(left, right) {
  let intersection = 0;
  for (const term of left) if (right.has(term)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union ? intersection / union : 0;
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
const publicHtmlFiles = htmlFiles.filter((file) => {
  const route = routeForFile(file);
  return !route.startsWith('/plain/') && route !== '/404' && route !== '/500';
});
const publicRoutes = new Set(publicHtmlFiles.map((file) => normalizedRoute(routeForFile(file))));
const inlinks = new Map([...publicRoutes].map((route) => [route, new Set()]));

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
const descriptions = new Map();
const contentHashes = new Map();
const campaignContent = new Map();
const campaignHeadings = new Map();
let publicPagesChecked = 0;

for (const file of htmlFiles) {
  const label = sourceLabel(file);
  const route = routeForFile(file);
  if (route.startsWith('/plain/') || route === '/404' || route === '/500') continue;

  publicPagesChecked += 1;
  const html = await htmlFor(file);
  const clean = withoutExecutableBodies(html);
  const publicRoute = normalizedRoute(route);
  const campaignPage = isCampaignRoute(publicRoute);

  if (campaignPage && !/^\/(?:solutions|enterprise)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(publicRoute)) {
    errors.push(`${label}: campaign route is not a clean descriptive URL`);
  }

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
    if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      errors.push(`${label}: title is ${title.length} characters; expected ${MIN_TITLE_LENGTH}–${MAX_TITLE_LENGTH}`);
    }
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(label);
  }

  const descriptionTag = clean.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i)?.[0];
  const description = descriptionTag ? attr(descriptionTag, 'content')?.trim() ?? '' : '';
  if (!description) {
    errors.push(`${label}: missing meta description`);
  } else {
    if (campaignPage && (
      description.length < MIN_CAMPAIGN_DESCRIPTION_LENGTH ||
      description.length > MAX_CAMPAIGN_DESCRIPTION_LENGTH
    )) {
      errors.push(
        `${label}: campaign description is ${description.length} characters; expected ` +
        `${MIN_CAMPAIGN_DESCRIPTION_LENGTH}–${MAX_CAMPAIGN_DESCRIPTION_LENGTH}`,
      );
    }
    if (!descriptions.has(description)) descriptions.set(description, []);
    descriptions.get(description).push(label);
  }

  const canonicalTag = [...clean.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical'));
  const canonical = canonicalTag ? attr(canonicalTag, 'href')?.trim() : '';
  if (!canonical) errors.push(`${label}: missing canonical URL`);
  else {
    if (!canonicals.has(canonical)) canonicals.set(canonical, []);
    canonicals.get(canonical).push(label);
    try {
      const canonicalUrl = new URL(canonical);
      if (canonicalUrl.origin !== ORIGIN || canonicalUrl.search || canonicalUrl.hash) {
        errors.push(`${label}: canonical must be an absolute, clean ${ORIGIN} URL`);
      } else if (normalizedRoute(canonicalUrl.pathname) !== normalizedRoute(route)) {
        errors.push(`${label}: canonical “${canonical}” does not match route “${route}”`);
      }
    } catch {
      errors.push(`${label}: canonical “${canonical}” is not a valid absolute URL`);
    }
  }

  const authorTag = clean.match(/<meta\b[^>]*\bname\s*=\s*["']author["'][^>]*>/i)?.[0];
  if (!authorTag || !attr(authorTag, 'content')?.trim()) errors.push(`${label}: missing author metadata`);

  if (campaignPage) {
    const robotsTag = clean.match(/<meta\b[^>]*\bname\s*=\s*["']robots["'][^>]*>/i)?.[0];
    const robots = robotsTag ? (attr(robotsTag, 'content') ?? '').toLowerCase() : '';
    if (!robots.includes('index') || robots.includes('noindex')) {
      errors.push(`${label}: campaign page is not explicitly indexable`);
    }
    if (!/<nav\b[^>]*\baria-label\s*=\s*["']Breadcrumb["']/i.test(clean)) {
      errors.push(`${label}: campaign page is missing a visible breadcrumb`);
    }
    for (const schemaType of ['Organization', 'WebPage', 'SoftwareApplication']) {
      if (!new RegExp(`"@type"\\s*:\\s*"${schemaType}"`, 'i').test(html)) {
        errors.push(`${label}: campaign page is missing ${schemaType} structured data`);
      }
    }
  }

  if (normalizedRoute(route) !== '/' && !/"@type"\s*:\s*"BreadcrumbList"/i.test(html)) {
    errors.push(`${label}: missing BreadcrumbList structured data`);
  }

  const mainMatch = clean.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) {
    errors.push(`${label}: missing main landmark`);
  } else {
    const mainText = textContent(mainMatch[1]);
    const wordCount = mainText.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
    if (wordCount < 130) errors.push(`${label}: thin primary content (${wordCount} words; expected at least 130)`);
    if (campaignPage && wordCount < MIN_CAMPAIGN_WORDS) {
      errors.push(`${label}: thin campaign content (${wordCount} words; expected at least ${MIN_CAMPAIGN_WORDS})`);
    }
    const normalizedContent = mainText.toLowerCase().replace(/\b\d{4}-\d{2}-\d{2}\b/g, '').replace(/\s+/g, ' ').trim();
    const hash = createHash('sha256').update(normalizedContent).digest('hex');
    if (!contentHashes.has(hash)) contentHashes.set(hash, []);
    contentHashes.get(hash).push(label);
    if (campaignPage) campaignContent.set(publicRoute, campaignTerms(normalizedContent));
  }

  const h1Count = [...clean.matchAll(/<h1\b[^>]*>/gi)].length;
  if (h1Count !== 1) errors.push(`${label}: expected one h1, found ${h1Count}`);
  if (campaignPage && h1Count === 1) {
    const headingMarkup = clean.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
    const heading = textContent(headingMarkup).toLowerCase();
    if (!campaignHeadings.has(heading)) campaignHeadings.set(heading, []);
    campaignHeadings.get(heading).push(label);
  }

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
    const href = attr(tag, 'href')?.trim() ?? '';
    if (/^javascript:/i.test(href)) errors.push(`${label}: JavaScript URL used as a link target`);
    const parsed = referenceUrl(href, route);
    if (parsed && !parsed.invalid) {
      if (/\.html$/i.test(parsed.url.pathname)) errors.push(`${label}: internal link uses a legacy .html URL “${href}”`);
      const targetRoute = normalizedRoute(parsed.url.pathname);
      const sourceRoute = normalizedRoute(route);
      if (targetRoute !== sourceRoute && publicRoutes.has(targetRoute)) inlinks.get(targetRoute)?.add(sourceRoute);
    }
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
for (const [description, files] of descriptions) {
  if (files.length > 1) errors.push(`duplicate meta description “${description}” in ${files.join(', ')}`);
}
for (const [canonical, files] of canonicals) {
  if (files.length > 1) errors.push(`duplicate canonical “${canonical}” in ${files.join(', ')}`);
}
for (const [hash, files] of contentHashes) {
  if (files.length > 1) errors.push(`duplicate primary content (${hash.slice(0, 10)}) in ${files.join(', ')}`);
}
for (const [heading, files] of campaignHeadings) {
  if (files.length > 1) errors.push(`duplicate campaign h1 “${heading}” in ${files.join(', ')}`);
}
const campaignEntries = [...campaignContent.entries()];
for (let leftIndex = 0; leftIndex < campaignEntries.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < campaignEntries.length; rightIndex += 1) {
    const [leftRoute, leftTerms] = campaignEntries[leftIndex];
    const [rightRoute, rightTerms] = campaignEntries[rightIndex];
    const overlap = jaccardSimilarity(leftTerms, rightTerms);
    if (overlap > MAX_CAMPAIGN_CONTENT_OVERLAP) {
      errors.push(
        `overlapping campaign content (${Math.round(overlap * 100)}%) between ` +
        `“${leftRoute}” and “${rightRoute}”`,
      );
    }
  }
}
for (const [route, sources] of inlinks) {
  if (route !== '/' && sources.size === 0) errors.push(`orphan public page “${route}” has no internal inlinks`);
}

const sitemapPath = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  errors.push('sitemap.xml is missing from the build');
} else {
  const sitemap = await readFile(sitemapPath, 'utf8');
  const sitemapRoutes = new Set();
  for (const match of sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    const value = decodeHtml(match[1].trim());
    try {
      const parsed = new URL(value);
      if (parsed.origin !== ORIGIN) errors.push(`sitemap contains off-origin URL “${value}”`);
      sitemapRoutes.add(normalizedRoute(parsed.pathname));
    } catch {
      errors.push(`sitemap contains invalid URL “${value}”`);
    }
  }
  for (const route of publicRoutes) {
    if (!sitemapRoutes.has(route)) errors.push(`sitemap is missing indexable route “${route}”`);
  }
  for (const route of sitemapRoutes) {
    if (!publicRoutes.has(route)) errors.push(`sitemap contains non-indexable or non-HTML route “${route}”`);
  }
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
