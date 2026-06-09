# PILOT-32 Performance Baseline

Captured: **2026-05-27** on branch `pilot-32` at commit `7197650` (pre-fixes).
Tooling: `scripts/check-page-weight.mjs` + Lighthouse CI 0.14 (desktop preset).

## Lighthouse scores

| URL | Perf | A11y | BP | SEO | LCP (ms) | TBT (ms) | CLS |
|---|---|---|---|---|---|---|---|
| `/` (landing) | **96** ✅ | 94 | 96 | 100 | 1272 | 0 | 0.024 |
| `/plans` | 98 ✅ | 98 | 100 | 100 | 1047 | 0 | 0.033 |
| `/docs/` | 100 ✅ | 98 | 100 | 100 | 561 | 0 | 0.000 |
| `/docs/getting-started` | 98 ✅ | 100 | 100 | 100 | 1127 | 0 | 0.008 |
| `/docs/cli-reference` | 97 ✅ | 100 | 100 | 100 | 1248 | 0 | 0.000 |
| **`/blog/` (index)** | **27 ❌** | 98 | 100 | 100 | **4880** | **4848** | 0.014 |
| `/blog/how-pilot-protocol-works` | 100 ✅ | 100 | 100 | 92 | 786 | 0 | 0.002 |

PILOT-32 AC #1 ("Lighthouse Performance ≥ 90 on landing + docs"): **already met on landing and every docs URL tested**. Blog index is the outlier and a launch-day risk even though it's not explicitly in the AC.

## Page weights (gzipped HTML + same-origin CSS + JS + images, browser-cache-aware dedup)

| Page | Class | Total | Budget | Status |
|---|---|---|---|---|
| `index.html` | landing | 1.17 MB | 1.00 MB | **OVER** (170 KB over) |
| `plans.html` | marketing | 791 KB | 800 KB | ok |
| `404.html` | marketing | 901 KB | 500 KB | **OVER** |
| `500.html` | marketing | 901 KB | 500 KB | **OVER** |
| `for/networks.html` | marketing | 792 KB | 800 KB | ok |
| `for/p2p.html` | marketing | 791 KB | 800 KB | ok |
| `for/mcp.html` | marketing | 791 KB | 800 KB | ok |
| `for/skills.html` | marketing | 808 KB | 800 KB | OVER (8 KB) |
| `for/setups.html` | marketing | 795 KB | 800 KB | ok |
| `for/compatibility.html` | marketing | 796 KB | 800 KB | ok |
| `docs/index.html` | docs | 795 KB | 500 KB | **OVER** |
| `docs/getting-started.html` | docs | 796 KB | 500 KB | **OVER** |
| `docs/cli-reference.html` | docs | 801 KB | 500 KB | **OVER** |
| `docs/concepts.html` | docs | 796 KB | 500 KB | **OVER** |
| `blog/index.html` | blog-index | 824 KB | 1.00 MB | ok |
| `blog/how-pilot-protocol-works.html` | blog-post | 852 KB | 800 KB | OVER (52 KB) |
| `blog/why-ai-agents-need-network-stack.html` | blog-post | 807 KB | 800 KB | OVER (7 KB) |

PILOT-32 AC #2 ("Page weight < 1 MB compressed on landing"): **not met** — 1.17 MB cold. Every other class is also at or over budget because the same two PNGs are loaded site-wide via Nav/Footer.

## Where the bytes are (landing)

```
HTML gzip:        17.6 KB
CSS gzip total:   10.8 KB     a2a-agent-cards-over-pilot-tunnels.BhQKQI-u.css (compiled system.css)
JS gzip total:     2.5 KB     BaseHead inline script
Image total:    1138.0 KB
  └─ /img/pilot.png       753.5 KB   (Nav + Footer logo — same URL, browser caches once)
  └─ /img/ietf-logo.png   356.0 KB   (hero)
```

Image weight is **97% of the page**. Two PNGs cause the entire over-budget condition. Migrating both to WebP via `astro:assets` is expected to save ~530 KB on **every page** (not just landing) because they ship through `Nav` and `Footer`.

## Why `/blog/` collapses

Lighthouse JSON shows the main-thread breakdown:

```
Style & Layout:                  19,015 ms
Script Evaluation:                   49 ms
Rendering:                           45 ms
```

19 seconds of style recalc on a static page is not a JS problem — it's CSS engine cost against a heavy DOM. Most likely the compiled `system.css` (60 KB raw, hundreds of selectors) interacting with the ~95 blog-card subtrees rendered server-side. Possible levers:

- Trim `system.css` rules that don't apply on the index (the file is shared across landing/marketing/docs)
- Reduce the DOM — paginate or virtualise the card grid; today we render all 95 posts up front
- Inline only above-the-fold CSS for `/blog/`; lazy-load the rest

Adding to `REMEDIATION.md` as a P1 (not in the AC, but a credibility risk on launch).

## Conclusion → next phase

Phase 2 (image migration to `astro:assets`) addresses the AC #2 page-weight miss and incidentally helps every page. Phase 3 picks up the smaller fixes (self-host Prism, slim Google Fonts, header cache, defer GA). The blog-index style-recalc issue is added to remediation; if it can be unblocked by trimming `system.css` it folds into Phase 3, otherwise it's a follow-up.
