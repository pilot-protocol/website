import { blogPosts } from '../../data/blogPosts';

export async function GET() {
  const site = 'https://pilotprotocol.network';
  const posts = [...blogPosts].sort((a, b) => (b.iso_date || '').localeCompare(a.iso_date || ''));
  const items = posts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${site}/blog/${post.slug}</link>
      <guid isPermaLink="true">${site}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(`${post.iso_date || `${post.date}, ${post.year || 2026}`}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pilot Protocol Blog</title>
    <link>${site}/blog/</link>
    <description>Technical articles on AI agent networking, P2P infrastructure, NAT traversal, trust models, and building with Pilot Protocol.</description>
    <language>en</language>
    <atom:link href="${site}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date(`${posts[0]?.iso_date || '2026-07-31'}T12:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
