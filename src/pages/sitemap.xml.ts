import { blogPosts } from '../data/blogPosts';
import { apps } from '../data/apps';

const site = 'https://pilotprotocol.network';

// Enumerate every page module so the sitemap reflects the real route
// tree — no hand-maintained list to drift out of date. New pages appear
// automatically; only error pages, dynamic templates, and the /plain
// text-mirror are filtered out.
const pageGlob = import.meta.glob('./**/*.{astro,md,mdx}');

function url(loc: string, lastmod: string, priority: number, changefreq = 'monthly') {
  const modified = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return `  <url><loc>${site}${loc}</loc>${modified}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function blogDate(date: string, year?: number): string {
  const y = year || new Date().getFullYear();
  const d = new Date(`${date}, ${y}`);
  const iso = d.toISOString();
  return iso.split('T')[0];
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

function priorityFor(loc: string): { p: number; freq: string } {
  if (loc === '/') return { p: 1.0, freq: 'weekly' };
  if (loc === '/blog/') return { p: 0.9, freq: 'weekly' };
  if (loc === '/docs/' || loc === '/docs/getting-started') return { p: 0.9, freq: 'monthly' };
  if (loc === '/plans' || loc === '/app-store') return { p: 0.9, freq: 'monthly' };
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
  const blogDates = new Map(blogPosts.map((b) => [b.slug, b.iso_date || blogDate(b.date, b.year)]));

  const seen = new Set<string>();
  const urls: string[] = [];
  const add = (loc: string, lastmod: string, priority: number, freq = 'monthly') => {
    if (seen.has(loc)) return;
    seen.add(loc);
    urls.push(url(loc, lastmod, priority, freq));
  };

  // 1. Every static page route discovered from the filesystem.
  for (const key of Object.keys(pageGlob)) {
    const loc = routeFromKey(key);
    if (loc === '/404' || loc === '/500') continue; // error pages
    if (loc.includes('[')) continue;                // dynamic template — expanded below
    if (loc.startsWith('/plain/')) continue;        // non-canonical text mirror
    const blogSlug = loc.startsWith('/blog/') ? loc.replace('/blog/', '').replace(/\/$/, '') : '';
    const lastmod = blogSlug && blogDates.has(blogSlug) ? blogDates.get(blogSlug)! : '';
    const { p, freq } = priorityFor(loc);
    add(loc, lastmod, p, freq);
  }

  // 2. Dynamic public routes.
  for (const app of apps) add(`/apps/${app.id}`, app.publishedAt || '', 0.7);

  try {
    const response = await fetch('https://raw.githubusercontent.com/TeoSlayer/pilot-skills/main/setups.json');
    if (response.ok) {
      const catalog = await response.json() as { setups?: { slug: string }[] };
      for (const setup of catalog.setups || []) add(`/for/setups/${setup.slug}`, '', 0.7);
    }
  } catch { /* The collection pages still remain in the sitemap offline. */ }

  // 3. Static assets served from public/ that aren't .astro routes.
  add('/llms.txt', '2026-07-31', 0.5);
  add('/brand/', '2026-07-31', 0.6);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
