# Contributing

Thanks for your interest in contributing to `website` — Pilot Protocol website + docs — Astro static site at pilotprotocol.network.

## Quick start

```bash
git clone https://github.com/pilot-protocol/website.git
cd website
npm ci && npm run build
```

## Pull requests

1. Open an issue first for non-trivial changes so design can be discussed.
2. Branch off `main`; keep changes focused and self-contained.
3. Tests are required for new behavior; passing CI is required to merge.
4. Coverage should not regress (Codecov reports per-PR delta).
5. Conventional commit style is preferred (`feat:`, `fix:`, `docs:`, `chore:`, …) but not enforced.

## Adding a new page

New pages must use **one of four approved layouts**. CI enforces this via
`scripts/check-layouts.mjs` — a PR that introduces a hand-rolled
`BaseHead + Nav + Footer` skeleton will be rejected.

| Page class | Layout | Where it lives |
|---|---|---|
| Landing, plans, `/for/*`, 404/500, any other marketing | `src/layouts/MarketingLayout.astro` | `src/pages/...` |
| Documentation page (anything under `/docs/`) | `src/layouts/DocLayout.astro` | `src/pages/docs/...` |
| Blog post | `src/layouts/BlogLayout.astro` | `src/pages/blog/...` |
| Plain-text mirror (for AI agents / curl) | `src/layouts/PlainLayout.astro` | `src/pages/plain/...` |

### Marketing page template

Copy this skeleton into `src/pages/my-page.astro` (or `src/pages/for/whatever.astro`):

```astro
---
import MarketingLayout from '../layouts/MarketingLayout.astro';

const title = 'My page — Pilot Protocol';
const description = '60-90 char one-line summary that lands in search snippets and og:description.';
const canonicalUrl = 'https://pilotprotocol.network/my-page';

// Optional. Pass either a single JSON-LD object or an array of them.
const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: canonicalUrl,
  publisher: { '@type': 'Organization', name: 'Vulture Labs', url: 'https://vulturelabs.com' },
};
---
<MarketingLayout
  title={title}
  description={description}
  canonicalUrl={canonicalUrl}
  navActive="home"
  schema={schema}
>
  <section class="page-head">
    <div class="wrap">
      <div class="eyebrow">Eyebrow text</div>
      <h1>Headline <em>here.</em></h1>
      <p class="lede">One-paragraph hook.</p>
    </div>
  </section>

  <!-- More sections... -->

  {/* Page-scoped styles work as expected — Astro hoists them automatically. */}
  <style>
    .my-page-block { /* ... */ }
  </style>

  {/* Page-specific inline scripts go inside the layout default slot too. */}
</MarketingLayout>
```

### The bar every page is held to

| Check | How it's enforced |
|---|---|
| Lighthouse Performance ≥ 90 on landing + docs | `npx lhci autorun` (CI) — `lighthouserc.cjs` |
| Landing page weight < 1 MB compressed; docs < 500 KB; blog post < 800 KB | `node scripts/check-page-weight.mjs` (CI) |
| Page uses one of the four approved layouts | `node scripts/check-layouts.mjs` (CI) |
| Images go through `astro:assets` (`<Image src={import} />`), never `<img src="/img/...">` | Code review |
| Third-party JS is self-hosted under `public/js/` or loaded via the analytics module — never inline `<script src="https://...cdn...">` | Code review |

Run the full local sweep before opening a PR:

```bash
npm run perf:check   # build → page-weight → lighthouse → layout policy
```

Load-test scripts live in `scripts/loadtest.k6.js`; see
`perf-results/CAPACITY.md` for how to re-run the 5K-VU spike against a
fresh Pages preview when capacity work is needed.

## Code of conduct

Be respectful and constructive. Project maintainers will moderate.

## License

By contributing you agree your contributions will be released under the
project's license (AGPL-3.0-or-later — see `LICENSE`).
