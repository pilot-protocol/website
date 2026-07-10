# Claim audit: src/pages/blog/index.astro
Audited: 2026-07-10 · Sentences examined: 21 · verified: 17 · false: 2 · unverifiable: 0 · opinion: 2 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 31 | "Guides and field notes on connecting AI agents over a real network: … — with working `pilotctl` commands in every post." | 50 of 107 blog post files under src/pages/blog/ contain zero occurrences of "pilotctl" (`grep -L pilotctl *.astro`), including one of the three posts this very page links as a starting point (ai-agent-discovery-process-p2p-networks.astro). "in every post" is false. |
| 77 | "{readTime} min read" | readTime (lines 59-60) is computed from `post.description` (a 1-2 sentence blurb), floored at 3 — across all 107 posts in src/data/blogPosts.json the formula yields exactly 3 for every post. Actual post bodies are long-form: how-pilot-protocol-works.astro is ~2,949 words ≈ 15 min at the page's own 200 wpm rate. Every card displays a fabricated "3 min read". |

## Verified claims (grouped by source)
- Live curl (2026-07-10, all HTTP 200): canonical https://pilotprotocol.network/blog/ ; ogImage https://pilotprotocol.network/og/blogs.jpg ; RSS https://pilotprotocol.network/blog/feed.xml (JSON-LD url field same as canonical).
- Local files src/pages/blog/: linked posts ai-agent-discovery-process-p2p-networks.astro, peer-to-peer-agent-communication-no-server.astro, ai-agent-app-store.astro all exist (line 32); feed.xml.ts exists (RSS link, lines 35-37); 107 post pages match blogPosts.json count.
- src/data/blogPosts.json + blogPosts.ts: meta/JSON-LD description topics (lines 14, 19) — P2P, NAT traversal, trust, app-store all present in post tags/categories; "real pilotctl commands" holds for the collection (57/107 posts contain pilotctl) since this phrasing, unlike line 31, does not claim "every post"; numberOfItems = blogPosts.length (107, dynamic, by construction); filter tabs/cards/dates/tags render directly from data (lines 53, 70-78).
- Site source (privacy.astro, publisher-agreement.astro, DocFooter.astro, BlogLayout.astro): publisher "Vulture Labs" (line 22) consistent with site-wide legal entity; isPartOf WebSite "Pilot Protocol" https://pilotprotocol.network/ (line 21) is the live site root.
- This file's own script (lines 93-166): "Copy feed URL" (l.40) and "Copied" toast (l.43) match clipboard handler l.98-102; "Search posts…" placeholder (l.48) matches search filter l.118-155; "No posts match your search." (l.85) shown only when zero cards visible (l.142); "Scroll to top" aria-label (l.89) matches handler l.113-115.
- Page/title labels: "AI Agent Networking Blog | Pilot Protocol" (lines 14, 18) — accurate page identity.

## Opinion (not flagged)
- Line 29 "Journal" — section label, no factual content.
- Line 30 "AI agent networking, explained." — marketing heading.
