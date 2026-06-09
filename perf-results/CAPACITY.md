# PILOT-32 Capacity Test Results

**Test run:** 2026-05-27 20:22 PT
**Profile:** `spike` (k6) — 0 → 5000 VUs over 60s, hold 5000 for 5 min, ramp down 60s
**Target:** `https://pilotprotocol-loadtest.pages.dev` — a dedicated Pages project deployed from the same `dist/` build as `pilotprotocol-pages` would be. Same Cloudflare account, same Pages infrastructure, same `_headers`, same `functions/500.ts`. The only meaningful environmental difference is that `*.pages.dev` URLs do **not** sit behind the zone-level Cloudflare cache (no `cf-cache-status` header is emitted), so this run measures **CF Pages backend capacity with the edge cache layer bypassed**.
**Source:** single host, k6 v2.0 from macOS, ulimit `-n 65536`.

## Headline numbers

```
total requests           77,111
duration                 449 s (7m 30s)
RPS (avg)                171.4
failed requests          8,961 / 77,111   (11.62%)
latency p50              5,779 ms
latency avg              13,165 ms
latency p90              54,406 ms
latency p95              60,001 ms   (k6 timeout cap)
latency max              60,566 ms
checks "status 200"      ~ 88% pass rate
```

**Thresholds the run was gated on, both crossed:**

- `http_req_duration p(95) < 400ms` — actual p95 = 60s ❌
- `http_req_failed rate < 1%` — actual 11.6% ❌

## What this means

PILOT-32 AC #4 — "Load test simulating 5K concurrent visitors" — **does not pass against an uncached origin.** The CF Pages backend, when forced to serve every request without edge caching, hits a capacity wall well before 5K concurrent VUs. Latency degrades to multi-second p50 within the first 60s of ramp-up.

This is **not** a code or build problem. The build is healthy:

- All 17 tracked pages well under the per-class page-weight budgets after the Phase 2 image migration
- Lighthouse perf ≥ 96 on landing, ≥ 96 on every docs URL, 100 on the sampled blog post
- All static assets served with correct long-cache `Cache-Control` headers
- The Pages Function for `/500` works (verified returning HTTP 500 with the inlined HTML body)

The failure is **environmental** — Cloudflare Pages, by default, does not edge-cache HTML responses. Every HTML request hits the Pages backend. On the production custom domain `pilotprotocol.network`, the same behavior was observed in pre-test sampling:

```
GET /                      cf-cache-status: DYNAMIC
GET /docs/                 cf-cache-status: DYNAMIC
GET /blog/                 cf-cache-status: DYNAMIC
GET /plans                 cf-cache-status: DYNAMIC
```

Our `_headers` rules (`/docs/* max-age=86400`, etc.) **are honored** in the response, but Cloudflare's edge does not act on them for HTML by default — that requires a **zone-level Cache Rule** with "Cache Everything" enabled for HTML routes. Until that's set in the Cloudflare dashboard, every HN visitor will land on the Pages backend.

## The fix (launch-blocking)

Configure a Cloudflare Cache Rule on the `pilotprotocol.network` zone:

```
If URI Path matches /, /docs/*, /blog/*, /plans, /for/*, /_astro/*, /img/*, /js/*
Then
  Cache eligibility: Eligible for cache
  Edge TTL: Use cache-control header from origin (or Override to: 1 hour for HTML)
  Browser TTL: Respect existing headers
```

After that rule is in place, **re-run this test against `pilotprotocol.network` directly.** Expected result: cache-hit rate climbs to >95% after a 30s warmup, p95 drops well below 400ms, and the 5K-VU spike becomes trivial (CDN edges absorb the load).

The k6 script already has a `cf_cache_hit_rate > 0.95` threshold gated on the URL being a custom domain (not `.pages.dev`); it'll automatically apply once we point at `pilotprotocol.network`.

## Headroom estimate (post-fix)

With proper edge caching the relevant capacity ceiling shifts from CF Pages backend to Cloudflare's global edge network. Cloudflare's published per-zone limits on the Free / Pro plan are well above what HN traffic generates (Free tier explicitly allows "unlimited" anycast-cached requests). A 5K-VU sustained test against the cached prod is expected to pass every threshold without issue.

The single-source nature of our test (one laptop, one egress IP) is actually a *harder* scenario than HN traffic — real HN visitors come from thousands of distinct IPs and connection-reuse patterns are more favorable for the CDN.

## Artifacts

- `perf-results/loadtest-replica.json` — full k6 metric export (this run)
- `perf-results/loadtest-last.json` — auto-emitted compact summary
- `scripts/loadtest.k6.js` — the test script (smoke + spike profiles)

## Re-run instructions

After Cache Rules are configured on the prod zone:

```bash
K6_PROFILE=spike k6 run scripts/loadtest.k6.js \
  -e BASE_URL=https://pilotprotocol.network \
  --summary-export=perf-results/loadtest-prod.json
```

Smoke test (local sanity) before any spike run:

```bash
npx serve -l 4322 dist                       # in one shell
K6_PROFILE=smoke k6 run scripts/loadtest.k6.js -e BASE_URL=http://localhost:4322
```

## Cleanup

The replica Pages project `pilotprotocol-loadtest` should be deleted after the prod re-run, or retained as a permanent staging environment for future capacity work:

```bash
wrangler pages project delete pilotprotocol-loadtest
```
