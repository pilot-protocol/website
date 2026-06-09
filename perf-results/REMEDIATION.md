# PILOT-32 Remediation List

Findings from the Phase 1 audit + the spike-test result, prioritised for the HN launch. **Owner column** is Alex Godoroja per the Jira ticket; subtask owners can be reassigned as work decomposes.

Status legend:
- ✅ **applied** — committed on `pilot-32` branch, ready to ship
- 🚧 **deferred** — not blocking PILOT-32 closure, follow-up ticket recommended
- 🛑 **launch-blocking** — must land before HN traffic hits

## P0 — launch-blocking

| # | Fix | Owner | Status | Impact | Notes |
|---|---|---|---|---|---|
| 1 | **Configure Cloudflare Cache Rule** for HTML routes on `pilotprotocol.network` zone so the edge actually caches landing/docs/blog/plans/for/* | Alex Godoroja | 🛑 | Single biggest capacity lever. Uncached, the Pages backend collapses at 5K concurrent (p95 60s, 11.6% fail). With proper edge caching, 5K concurrent becomes trivial. | Done via CF dashboard; see CAPACITY.md for the exact rule shape. Re-run `npm run loadtest:spike` against `https://pilotprotocol.network` after to confirm `cf-cache-status: HIT > 95%` and p95 < 400 ms. |

## P1 — applied

| # | Fix | Owner | Status | Impact (bytes / ms / score) |
|---|---|---|---|---|
| 2 | Migrate `pilot.png` + `ietf-logo.png` to `astro:assets` so Astro emits WebP + sized variants | Alex Godoroja | ✅ | Landing cold load **1.17 MB → 35.7 KB** (33× reduction). Every page benefits because Nav + Footer ship `pilot.png` via `<Image>` now. |
| 3 | Add `content-visibility: auto` to `.blog-card` | Alex Godoroja | ✅ | `/blog/` Lighthouse perf **27 → 96**. Style-and-Layout main-thread cost on the 95-card index page went from **~19,000 ms → <500 ms**. |
| 4 | Self-host Prism (CSS + 3 JS files) under `/js/prism/`; drop the four cdnjs requests from `DocLayout` | Alex Godoroja | ✅ | Removes a third-party DNS+TLS round trip on every docs page. ~15 KB shifts from cdnjs to same-origin (now CDN-cacheable). |
| 5 | Slim Google Fonts request — drop unused Inter Tight 700 weight | Alex Godoroja | ✅ | One fewer woff2 on every cold visit (~12 KB). |
| 6 | Generate a 64×64 favicon via `getImage()` instead of pointing the `<link rel="icon">` at the full 1024×1024 pilot.png | Alex Godoroja | ✅ | Saves ~750 KB on the favicon request that every fresh visitor makes. |
| 7 | Switch `gtag.js` from `async` to `defer` | Alex Godoroja | ✅ | Pushes the analytics script out of the FCP critical path. Smaller TBT/INP wins. |
| 8 | Add `Cache-Control: public, max-age=31536000, immutable` for `/img/*`, `/blog/banners/*`, `/js/prism/*` in both `_headers` files | Alex Godoroja | ✅ | Once CF Cache Rule (P0) is in place, these assets stay in edge cache permanently. |
| 9 | Consolidate 12 hand-rolled marketing pages into a single `MarketingLayout` (`index`, `plans`, `404`, `500`, all 7 `/for/*` plus `for/setups/[slug]`) | Alex Godoroja | ✅ | Zero perf delta as-is — but every new marketing page now starts at the bar instead of having to opt into it. |
| 10 | CI gates: `check-page-weight`, `check-layouts`, `lhci` runs on every PR; budget violations fail the build | Alex Godoroja | ✅ | The standard is self-enforcing. |
| 11 | `CONTRIBUTING.md` "Adding a new page" section with the four-layout decision table and a copy-paste skeleton | Alex Godoroja | ✅ | Contributors no longer have to grep an existing page to figure out the pattern. |

## P1 — deferred (not blocking PILOT-32, but worth a follow-up ticket)

| # | Fix | Owner | Status | Notes |
|---|---|---|---|---|
| 12 | Compress / replace `dist/blog/banners/scriptorium-replace-agentic-active-research-ready-intelligence.png` (7.3 MB → expected ~500 KB after resize+WebP) | Alex Godoroja | 🚧 | Only affects one blog post, but it's a 14× weight outlier on that URL. Easiest fix: resize source to 1200 px wide and re-encode as WebP. |
| 13 | Migrate blog banners to `astro:assets` (currently raw `<img src="/blog/banners/...">` in `BlogLayout`) | Alex Godoroja | 🚧 | Requires `import.meta.glob` keyed by slug. ~95 blog posts each shave ~50–200 KB. |
| 14 | Delete unreferenced images from `public/img/` — `vulture-labs.png`, `vodafone.png`, `github.png`, `tencent.svg` | Alex Godoroja | 🚧 | No references found in `src/` or `dist/`. Verify with one more grep before deleting (don't want to break a blog post body that ships raw HTML). |
| 15 | Fold `src/pages/blog/index.astro` into a dedicated layout (or `MarketingLayout` with a `variant="blog-index"` slot) and remove its `EXEMPT` entry from `scripts/check-layouts.mjs` | Alex Godoroja | 🚧 | The blog index has a custom card grid + search/filter logic. Layout extraction is cosmetic, not functional. |
| 16 | Reduce `_500-body.ts` inline HTML payload — currently ~150 KB because the sad-doodle PNG is base64-inlined | Alex Godoroja | 🚧 | The Pages Function for `/500` is intentionally self-contained (must not fetch any asset), but a smaller base64 PNG would still satisfy that constraint. |
| 17 | Trim the Google Fonts payload further by subsetting (only the glyphs the site actually uses) or hosting woff2 directly | Alex Godoroja | 🚧 | Possible 30–50 % font weight reduction. Not worth doing until the P0 cache fix lands. |
| 18 | Investigate `module.BDUNv29v.js` (PostHog, 186 KB) — gate the dynamic import on whether `PUBLIC_POSTHOG_KEY` is even set, and route the analytics module the same way to skip the bundle entirely in environments without analytics | Alex Godoroja | 🚧 | Already deferred-loaded so doesn't impact FCP/LCP. Saving the bytes is still worthwhile for the privacy-conscious / no-JS visitor. |

## P2 — accepted limitations

| Limitation | Why it's OK |
|---|---|
| `*.pages.dev` deployments emit no `cf-cache-status` header | Documented in `CAPACITY.md`. Real prod uses the custom domain, which does. |
| The build-time fetch to `polo.pilotprotocol.network/api/stats` in `index.astro` and `for/networks.astro` adds ~500 ms to clean builds | Falls back gracefully if polo is unreachable — no build break. |
| `astro preview` (Vite-based) dies under > 50 concurrent connections | Dev-only server, not production. Use `npx serve dist` for any local load testing. Documented in `scripts/loadtest.k6.js`. |
