import { allPosts } from '../data/blogPosts';
import { apps } from '../data/apps';
import { learnGuides } from '../data/learnGuides';

const site = 'https://pilotprotocol.network';

// Enumerate every page module so the sitemap reflects the real route
// tree — no hand-maintained list to drift out of date. New pages appear
// automatically; only error pages, dynamic templates, and the /plain
// text-mirror are filtered out.
const pageGlob = import.meta.glob('./**/*.{astro,md,mdx}');

function url(loc: string, lastmod: string, priority: number, changefreq = 'monthly') {
  const modified = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  const absolute = `${site}${loc}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `  <url><loc>${absolute}</loc>${modified}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

// Map a glob key (e.g. './docs/app-store.astro') to a route.
function routeFromKey(key: string): string {
  const rel = key.replace(/^\.\//, '');
  if (rel === 'index.astro' || rel === 'index.md' || rel === 'index.mdx') return '/';
  const m = rel.match(/^(.*\/)index\.(astro|mdx?|md)$/);
  if (m) return '/' + m[1]; // directory index → trailing slash
  return '/' + rel.replace(/\.(astro|mdx?|md)$/, '');
}

const REFERENCE = new Set(['error-codes', 'troubleshooting', 'diagnostics', 'configuration']);
const LEGAL = new Set(['/privacy', '/cookies', '/terms', '/aup', '/publisher-agreement']);
// Standalone design previews are intentionally noindex and shared by direct link.
const PREVIEWS = new Set(['/cloud-landing', '/cloud-teaser', '/pilot-film']);

// The four offerings: the protocol (home), the service agents, the App Store
// and Pilot Cloud.
const OFFERINGS = new Set(['/service-agents', '/app-store', '/cloud']);

function priorityFor(loc: string): { p: number; freq: string } {
  if (loc === '/') return { p: 1.0, freq: 'weekly' };
  if (loc === '/blog/') return { p: 0.9, freq: 'weekly' };
  if (loc === '/docs/' || loc === '/docs/getting-started') return { p: 0.9, freq: 'monthly' };
  if (OFFERINGS.has(loc.replace(/\/$/, ''))) return { p: 0.9, freq: 'monthly' };
  if (loc.startsWith('/blog/')) return { p: 0.8, freq: 'monthly' };
  if (loc.startsWith('/docs/')) {
    const slug = loc.replace('/docs/', '').replace(/\/$/, '');
    return { p: REFERENCE.has(slug) ? 0.6 : 0.8, freq: 'monthly' };
  }
  if (LEGAL.has(loc) || loc === '/press') return { p: 0.7, freq: 'monthly' };
  if (loc.startsWith('/for/')) return { p: 0.8, freq: 'monthly' };
  return { p: 0.7, freq: 'monthly' };
}

export async function GET() {
  const postDates = new Map(
    allPosts.filter((post) => post.iso_date).map((post) => [post.slug, post.iso_date!]),
  );
  const learnDates = new Map(learnGuides.map((guide) => [guide.slug, guide.isoDate]));

  const seen = new Set<string>();
  const urls: string[] = [];
  const add = (loc: string, lastmod: string, priority: number, freq = 'monthly') => {
    if (seen.has(loc)) return;
    seen.add(loc);
    urls.push(url(loc, lastmod, priority, freq));
  };

  // 1. Every static page route discovered from the filesystem.
  for (const key of Object.keys(pageGlob).sort()) {
    const loc = routeFromKey(key);
    if (loc === '/404' || loc === '/500') continue; // error pages
    if (PREVIEWS.has(loc)) continue;               // noindex design previews
    if (loc.includes('[')) continue;                // dynamic template — expanded below
    if (loc.startsWith('/plain/')) continue;        // non-canonical text mirror
    const datedPostSlug = loc.startsWith('/blog/')
      ? loc.replace('/blog/', '').replace(/\/$/, '')
      : loc.startsWith('/news/')
        ? loc.replace('/news/', '').replace(/\/$/, '')
        : '';
    const learnSlug = loc.startsWith('/learn/') ? loc.replace('/learn/', '').replace(/\/$/, '') : '';
    const lastmod = datedPostSlug && postDates.has(datedPostSlug)
      ? postDates.get(datedPostSlug)!
      : learnSlug && learnDates.has(learnSlug)
        ? learnDates.get(learnSlug)!
        : '';
    const { p, freq } = priorityFor(loc);
    add(loc, lastmod, p, freq);
  }

  // 2. Dynamic public routes.
  for (const app of [...apps].sort((a, b) => a.id.localeCompare(b.id))) {
    add(`/apps/${app.id}`, app.publishedAt || '', 0.7);
  }

  // 3. Indexable HTML served from public/ that isn't an Astro route.
  add('/brand/', '2026-07-31', 0.6);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
