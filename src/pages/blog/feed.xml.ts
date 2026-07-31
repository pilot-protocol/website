import { blogPosts } from '../../data/blogPosts';

function xmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cdata(value: string): string {
  return value.replace(/]]>/g, ']]]]><![CDATA[>');
}

function rssDate(isoDate?: string): string | null {
  if (!isoDate) return null;
  const timestamp = Date.parse(`${isoDate}T12:00:00Z`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toUTCString();
}

export async function GET() {
  const site = 'https://pilotprotocol.network';
  const posts = [...blogPosts].sort((a, b) =>
    (b.iso_date || '').localeCompare(a.iso_date || '') || a.slug.localeCompare(b.slug)
  );
  const items = posts.map((post) => {
    const published = rssDate(post.iso_date);
    return `    <item>
      <title><![CDATA[${cdata(post.title)}]]></title>
      <link>${site}/blog/${post.slug}</link>
      <guid isPermaLink="true">${site}/blog/${post.slug}</guid>
      <description><![CDATA[${cdata(post.description)}]]></description>
${published ? `      <pubDate>${published}</pubDate>\n` : ''}      <category>${xmlText(post.category)}</category>
    </item>`;
  }).join('\n');

  const lastBuildDate = posts.map((post) => rssDate(post.iso_date)).find(Boolean);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pilot Protocol Blog</title>
    <link>${site}/blog/</link>
    <description>Technical articles on AI agent networking, P2P infrastructure, NAT traversal, trust models, and building with Pilot Protocol.</description>
    <language>en</language>
    <atom:link href="${site}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${lastBuildDate ? `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
