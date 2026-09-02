#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

const origin = (process.env.SITE_URL || 'https://pilotprotocol.network').replace(/\/$/, '');
const reportPath = process.env.AUDIT_REPORT || '';
const concurrency = Math.max(1, Number(process.env.AUDIT_CONCURRENCY || 10));
const googlebot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const robotsGroups = (body = '') => {
  const groups = [];
  let agents = [];
  let rules = [];
  const flush = () => {
    if (agents.length) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      if (rules.length) flush();
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const field = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (field === 'user-agent') {
      if (rules.length) flush();
      agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && agents.length) {
      rules.push({ field, value });
    }
  }
  flush();
  return groups;
};

const robotsAllows = (groups, url, agent = 'googlebot') => {
  const matching = groups
    .map((group) => ({
      ...group,
      specificity: Math.max(-1, ...group.agents.map((token) => token === '*' ? 0 : agent.includes(token) ? token.length : -1)),
    }))
    .filter((group) => group.specificity >= 0);
  if (!matching.length) return true;
  const specificity = Math.max(...matching.map((group) => group.specificity));
  const rules = matching.filter((group) => group.specificity === specificity).flatMap((group) => group.rules);
  const path = `${new URL(url).pathname}${new URL(url).search}`;
  const matched = rules
    .filter((rule) => rule.value)
    .map((rule) => {
      const anchored = rule.value.endsWith('$');
      const pattern = anchored ? rule.value.slice(0, -1) : rule.value;
      const expression = `^${escapeRegExp(pattern).replaceAll('\\*', '.*')}${anchored ? '$' : ''}`;
      return new RegExp(expression).test(path) ? { ...rule, length: pattern.replaceAll('*', '').length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.length - a.length || Number(b.field === 'allow') - Number(a.field === 'allow'));
  return matched[0]?.field !== 'disallow';
};

const decode = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

const text = (html = '') => decode(html)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
};

const canonicalUrl = (value) => {
  try {
    const url = new URL(value, origin);
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return '';
  }
};

const pageGroup = (url) => {
  const path = new URL(url).pathname;
  const root = path.split('/').filter(Boolean)[0] || 'home';
  return root;
};

const shingles = (value, size = 5) => {
  const words = value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).filter(Boolean);
  const result = new Set();
  for (let i = 0; i <= words.length - size; i += 1) result.add(words.slice(i, i + size).join(' '));
  return result;
};

const similarity = (left, right) => {
  if (!left.size || !right.size) return 0;
  const smaller = left.size < right.size ? left : right;
  const larger = smaller === left ? right : left;
  let intersection = 0;
  for (const item of smaller) if (larger.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
};

async function fetchText(url, redirect = 'follow') {
  const response = await fetch(url, {
    redirect,
    headers: { 'user-agent': googlebot, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(20_000),
  });
  return { response, body: await response.text() };
}

const sitemapUrl = `${origin}/sitemap.xml`;
const { response: sitemapResponse, body: sitemap } = await fetchText(sitemapUrl);
if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}: ${sitemapUrl}`);

const robotsUrl = `${origin}/robots.txt`;
let robotsStatus = 0;
let parsedRobots = [];
let robotsError = '';
try {
  const { response, body } = await fetchText(robotsUrl);
  robotsStatus = response.status;
  if (response.ok) parsedRobots = robotsGroups(body);
  else if (response.status >= 500 || response.status === 429) robotsError = `HTTP ${response.status}`;
} catch (error) {
  robotsError = error instanceof Error ? error.message : String(error);
}

const sitemapEntries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi)]
  .map(([, loc, lastmod]) => ({ url: decode(loc), lastmod: lastmod || '' }));

const results = new Array(sitemapEntries.length);
let cursor = 0;
async function worker() {
  while (cursor < sitemapEntries.length) {
    const index = cursor;
    cursor += 1;
    const entry = sitemapEntries[index];
    try {
      const { response, body } = await fetchText(entry.url, 'manual');
      const contentType = response.headers.get('content-type') || '';
      const metaTags = body.match(/<meta\b[^>]*>/gi) || [];
      const linkTags = body.match(/<link\b[^>]*>/gi) || [];
      const robotsTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'robots');
      const googlebotTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'googlebot');
      const descriptionTag = metaTags.find((tag) => attr(tag, 'name').toLowerCase() === 'description');
      const canonicalTags = linkTags.filter((tag) => attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
      const canonicalTag = canonicalTags[0];
      const mainMatch = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
      const mainText = text(mainMatch?.[1] || body.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || body);
      const title = text(body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
      const links = [];
      for (const tag of body.match(/<a\b[^>]*>/gi) || []) {
        const href = attr(tag, 'href');
        if (!href || /^(?:mailto:|tel:|javascript:)/i.test(href)) continue;
        try {
          const target = new URL(href, entry.url);
          if (target.origin !== new URL(origin).origin) continue;
          target.hash = '';
          target.search = '';
          links.push(target.toString());
        } catch { /* malformed href is reported by the build-time integrity check */ }
      }

      let invalidJsonLd = 0;
      let jsonLdCount = 0;
      for (const match of body.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        jsonLdCount += 1;
        try { JSON.parse(match[1]); } catch { invalidJsonLd += 1; }
      }

      results[index] = {
        ...entry,
        status: response.status,
        location: response.headers.get('location') || '',
        contentType,
        xRobots: response.headers.get('x-robots-tag') || '',
        title,
        description: attr(descriptionTag || '', 'content'),
        robots: attr(robotsTag || '', 'content'),
        googlebot: attr(googlebotTag || '', 'content'),
        robotsAllowed: robotsAllows(parsedRobots, entry.url),
        canonicalCount: canonicalTags.length,
        canonical: canonicalUrl(attr(canonicalTag || '', 'href')),
        expectedCanonical: canonicalUrl(entry.url),
        h1Count: (body.match(/<h1\b/gi) || []).length,
        wordCount: mainText.split(/\s+/).filter(Boolean).length,
        mainText,
        shingleSet: shingles(mainText),
        links: [...new Set(links)],
        jsonLdCount,
        invalidJsonLd,
      };
    } catch (error) {
      results[index] = { ...entry, error: error instanceof Error ? error.message : String(error), links: [], shingleSet: new Set() };
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const sitemapSet = new Set(sitemapEntries.map((entry) => canonicalUrl(entry.url)));
const inbound = new Map([...sitemapSet].map((url) => [url, 0]));
for (const page of results) {
  for (const link of page.links || []) {
    const normalized = canonicalUrl(link);
    if (normalized !== page.expectedCanonical && inbound.has(normalized)) inbound.set(normalized, inbound.get(normalized) + 1);
  }
}

const blockers = [];
const warnings = [];
const add = (list, type, page, detail) => list.push({ type, url: page.url, detail });
const today = new Date().toISOString().slice(0, 10);

if (robotsError) blockers.push({ type: 'robots-unavailable', url: robotsUrl, detail: robotsError });

for (const page of results) {
  if (page.error) { add(blockers, 'fetch-error', page, page.error); continue; }
  if (page.status !== 200) add(blockers, 'sitemap-non-200', page, `HTTP ${page.status}${page.location ? ` → ${page.location}` : ''}`);
  if (!page.contentType.includes('text/html')) add(blockers, 'non-html', page, page.contentType || 'missing content-type');
  if (!page.robotsAllowed) add(blockers, 'robots-blocked', page, 'Disallowed for Googlebot');
  if (/noindex/i.test(`${page.robots} ${page.googlebot} ${page.xRobots}`)) add(blockers, 'noindex-in-sitemap', page, `${page.robots} ${page.googlebot} ${page.xRobots}`.trim());
  if (page.canonicalCount > 1) add(blockers, 'multiple-canonicals', page, `${page.canonicalCount} canonical links`);
  if (!page.canonical) add(blockers, 'missing-canonical', page, 'No canonical link');
  else if (page.canonical !== page.expectedCanonical) add(blockers, 'canonical-mismatch', page, `${page.canonical} != ${page.expectedCanonical}`);
  if (!page.title) add(blockers, 'missing-title', page, 'No title');
  if (!page.description) add(blockers, 'missing-description', page, 'No meta description');
  if (page.h1Count !== 1) add(blockers, 'h1-count', page, `${page.h1Count} H1 elements`);
  if (page.invalidJsonLd) add(blockers, 'invalid-json-ld', page, `${page.invalidJsonLd}/${page.jsonLdCount} invalid blocks`);
  if (page.lastmod && page.lastmod > today) add(blockers, 'future-lastmod', page, page.lastmod);
  if (page.expectedCanonical !== `${origin}/` && (inbound.get(page.expectedCanonical) || 0) === 0) add(blockers, 'orphan', page, 'No crawlable internal link from another sitemap URL');

  if (page.title && (page.title.length < 30 || page.title.length > 60)) add(warnings, 'title-length', page, `${page.title.length} characters`);
  if (page.description && (page.description.length < 120 || page.description.length > 160)) add(warnings, 'description-length', page, `${page.description.length} characters`);
  if (page.wordCount < 150) add(warnings, 'thin-main-content', page, `${page.wordCount} words`);
  if (!page.jsonLdCount) add(warnings, 'missing-json-ld', page, 'No structured-data block');
  if (/nofollow/i.test(`${page.robots} ${page.googlebot} ${page.xRobots}`)) add(warnings, 'nofollow-page', page, 'Page-level nofollow limits link discovery');
}

for (const field of ['title', 'description', 'canonical']) {
  const buckets = new Map();
  for (const page of results) {
    const value = page[field];
    if (!value) continue;
    const key = field === 'canonical' ? value : value.toLowerCase();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(page.url);
  }
  for (const urls of buckets.values()) {
    if (urls.length < 2) continue;
    for (const url of urls) warnings.push({ type: `duplicate-${field}`, url, detail: `${urls.length} pages share this ${field}` });
  }
}

const similar = [];
const grouped = Map.groupBy(results.filter((page) => page.wordCount >= 150), (page) => pageGroup(page.url));
for (const [group, pages] of grouped) {
  for (let left = 0; left < pages.length; left += 1) {
    for (let right = left + 1; right < pages.length; right += 1) {
      const score = similarity(pages[left].shingleSet, pages[right].shingleSet);
      if (score >= 0.55) similar.push({ group, score, left: pages[left].url, right: pages[right].url });
    }
  }
}
similar.sort((a, b) => b.score - a.score);

const counts = (issues) => Object.fromEntries(
  [...Map.groupBy(issues, (issue) => issue.type)].map(([type, entries]) => [type, entries.length]).sort((a, b) => b[1] - a[1]),
);

const serializableResults = results.map(({ mainText, shingleSet, links, ...page }) => ({ ...page, inboundLinks: inbound.get(page.expectedCanonical) || 0 }));
const report = {
  generatedAt: new Date().toISOString(),
  origin,
  sitemapUrl,
  robotsUrl,
  robotsStatus,
  pages: results.length,
  blockers,
  warnings,
  nearDuplicates: similar,
  blockerCounts: counts(blockers),
  warningCounts: counts(warnings),
  results: serializableResults,
};

console.log(`Live indexability audit: ${results.length} sitemap URLs`);
console.log(`Blockers: ${blockers.length}`, report.blockerCounts);
console.log(`Warnings: ${warnings.length}`, report.warningCounts);
console.log(`Near-duplicate pairs (>=55% five-word shingles): ${similar.length}`);

for (const issue of blockers.slice(0, 40)) console.log(`BLOCKER ${issue.type}: ${issue.url} — ${issue.detail}`);
for (const issue of warnings.slice(0, 40)) console.log(`WARN ${issue.type}: ${issue.url} — ${issue.detail}`);
for (const pair of similar.slice(0, 30)) console.log(`SIMILAR ${(pair.score * 100).toFixed(1)}% [${pair.group}]: ${pair.left} <> ${pair.right}`);

if (reportPath) {
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${reportPath}`);
}

if (blockers.length) process.exitCode = 1;
