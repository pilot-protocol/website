/**
 * k6 load test for the Pilot Protocol marketing site.
 *
 * Two profiles, selected via the K6_PROFILE env var:
 *
 *   smoke (default)
 *     50 VUs for 30s, against a local Astro preview. Validates that the test
 *     script itself works and that the static build can serve. Not capacity
 *     proof — use spike for that.
 *
 *   spike
 *     Ramp 0 → 5000 VUs over 60s, hold 5000 for 5 minutes, ramp down 60s.
 *     Against pilotprotocol.network (or whatever BASE_URL is set to). This
 *     is the PILOT-32 AC #4 — 5K concurrent visitors. The work is largely on
 *     Cloudflare's CDN edge; the goal is to verify our pages stay cacheable
 *     and the edge serves them at p95 < 400ms with cf-cache-status: HIT
 *     after warmup.
 *
 * Run:
 *   K6_PROFILE=smoke k6 run scripts/loadtest.k6.js -e BASE_URL=http://localhost:4322
 *   K6_PROFILE=spike k6 run scripts/loadtest.k6.js -e BASE_URL=https://pilotprotocol.network \
 *     --summary-export=perf-results/loadtest-prod-summary.json
 *
 * Output: k6's text summary on stderr/stdout. Pass --summary-export for JSON.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4322';
const PROFILE = __ENV.K6_PROFILE || 'smoke';

// Endpoint mix (weighted). Matches a realistic HN-front-page distribution:
// landing dominates, docs is the next thing people read, blog gets sampled,
// plans/for are smaller tails.
const ENDPOINTS = [
  { path: '/',                                         weight: 45, name: 'landing' },
  { path: '/docs/',                                    weight: 10, name: 'docs-index' },
  { path: '/docs/getting-started',                     weight: 10, name: 'docs-getting-started' },
  { path: '/blog/',                                    weight: 10, name: 'blog-index' },
  { path: '/blog/how-pilot-protocol-works',            weight:  5, name: 'blog-post-1' },
  { path: '/blog/ietf-internet-draft-pilot-protocol',  weight:  5, name: 'blog-post-2' },
  { path: '/blog/why-ai-agents-need-network-stack',    weight:  5, name: 'blog-post-3' },
  { path: '/plans',                                    weight:  5, name: 'plans' },
  { path: '/for/networks',                             weight:  3, name: 'for-networks' },
  { path: '/for/p2p',                                  weight:  2, name: 'for-p2p' },
];

// Build a cumulative-weight lookup table once at script load.
const TOTAL_WEIGHT = ENDPOINTS.reduce((acc, e) => acc + e.weight, 0);
const PICKER = [];
{
  let cum = 0;
  for (const e of ENDPOINTS) {
    cum += e.weight;
    PICKER.push({ threshold: cum / TOTAL_WEIGHT, ...e });
  }
}

function pickEndpoint() {
  const r = Math.random();
  for (const p of PICKER) {
    if (r <= p.threshold) return p;
  }
  return PICKER[PICKER.length - 1];
}

// Custom metrics: track CF cache hit ratio. We tag by hit/miss/dynamic so the
// summary surfaces the cache health, which is the actual capacity question
// for this site.
const cacheHits = new Counter('cf_cache_hits');
const cacheMisses = new Counter('cf_cache_misses');
const cacheOther = new Counter('cf_cache_other');
const cacheHitRate = new Rate('cf_cache_hit_rate');

// Skip cache assertions for the 30s warmup window — first hits in each PoP
// will MISS while CF Pages warms its edge cache. After warmup we expect HIT.
const WARMUP_SECONDS = 30;
const startMs = Date.now();
function isWarmup() {
  return (Date.now() - startMs) / 1000 < WARMUP_SECONDS;
}

// Cache-hit threshold is only meaningful against a zone-level CDN endpoint
// (the custom domain). *.pages.dev deployment URLs and local servers don't
// emit cf-cache-status. Set SKIP_CACHE_CHECK=1 (default for any non-prod
// hostname) to drop the threshold so the run can still pass on its other
// metrics.
const HAS_CDN_CACHE_LAYER =
  __ENV.SKIP_CACHE_CHECK !== '1' &&
  !BASE_URL.includes('localhost') &&
  !BASE_URL.includes('.pages.dev');

export const options = (() => {
  if (PROFILE === 'spike') {
    const thresholds = {
      // PILOT-32 capacity bar.
      http_req_duration: ['p(95)<400', 'p(99)<800'],
      http_req_failed: ['rate<0.01'],
    };
    if (HAS_CDN_CACHE_LAYER) {
      thresholds.cf_cache_hit_rate = ['rate>0.95'];
    }
    return {
      stages: [
        { duration: '60s', target: 5000 },   // ramp up
        { duration: '5m',  target: 5000 },   // hold
        { duration: '60s', target: 0 },      // ramp down
      ],
      thresholds,
      // Don't let one bad PoP block the run — keep going on errors so we get
      // a full picture of where the floor actually is.
      noConnectionReuse: false,
    };
  }
  // smoke (default)
  return {
    vus: 50,
    duration: '30s',
    thresholds: {
      http_req_duration: ['p(95)<400'],
      http_req_failed: ['rate<0.01'],
    },
  };
})();

export default function () {
  const ep = pickEndpoint();
  const url = `${BASE_URL}${ep.path}`;
  const res = http.get(url, {
    headers: {
      'User-Agent': 'pilotprotocol-loadtest/1.0 (PILOT-32; contact=alex@vulturelabs.io)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    tags: { endpoint: ep.name },
  });

  // Categorize the cache header. Cloudflare uses 'cf-cache-status' with
  // values HIT / MISS / EXPIRED / REVALIDATED / BYPASS / DYNAMIC / UPDATING.
  const cf = (res.headers['Cf-Cache-Status'] || res.headers['cf-cache-status'] || 'NONE').toUpperCase();
  if (!isWarmup()) {
    if (cf === 'HIT' || cf === 'REVALIDATED') {
      cacheHits.add(1);
      cacheHitRate.add(true);
    } else if (cf === 'MISS' || cf === 'EXPIRED' || cf === 'UPDATING') {
      cacheMisses.add(1);
      cacheHitRate.add(false);
    } else {
      cacheOther.add(1);
      // DYNAMIC / BYPASS / NONE — don't count toward hit rate; they signal
      // a routing/header issue we'd want to investigate, but they're not a
      // "miss" from the test's perspective.
    }
  }

  check(res, {
    'status 200': (r) => r.status === 200,
    'has html body': (r) => r.body && r.body.length > 1024,
  });

  // Realistic think time. 5K VUs × ~10s think ≈ 500 RPS at steady state.
  sleep(5 + Math.random() * 10);
}

export function handleSummary(data) {
  // Emit the standard text summary on stdout, plus a compact JSON on disk
  // for the REMEDIATION + CAPACITY deliverables.
  const stdout = textSummary(data, { profile: PROFILE, baseUrl: BASE_URL });
  return {
    'stdout': stdout,
    'perf-results/loadtest-last.json': JSON.stringify(
      summarizeForDeliverable(data, { profile: PROFILE, baseUrl: BASE_URL }),
      null,
      2,
    ),
  };
}

function textSummary(data, ctx) {
  const m = data.metrics;
  const pct = (rate) => ((rate || 0) * 100).toFixed(2) + '%';
  const ms = (v) => (v == null ? '—' : Math.round(v) + 'ms');
  const n = (v) => (v == null ? 0 : v);

  return `
─── PILOT-32 load test summary ───
profile:          ${ctx.profile}
base URL:         ${ctx.baseUrl}
duration:         ${(data.state?.testRunDurationMs || 0) / 1000}s
total requests:   ${n(m.http_reqs?.values?.count)}
RPS (avg):        ${(n(m.http_reqs?.values?.rate)).toFixed(1)}
failed rate:      ${pct(m.http_req_failed?.values?.rate)}

latency
  p50:            ${ms(m.http_req_duration?.values?.med)}
  p95:            ${ms(m.http_req_duration?.values?.['p(95)'])}
  p99:            ${ms(m.http_req_duration?.values?.['p(99)'])}
  max:            ${ms(m.http_req_duration?.values?.max)}

cache (post-warmup ${WARMUP_SECONDS}s)
  HIT count:      ${n(m.cf_cache_hits?.values?.count)}
  MISS count:     ${n(m.cf_cache_misses?.values?.count)}
  other count:    ${n(m.cf_cache_other?.values?.count)}
  hit rate:       ${pct(m.cf_cache_hit_rate?.values?.rate)}

thresholds:       ${Object.keys(data.thresholds || {}).map(k => `${k} ${data.thresholds[k].ok ? 'ok' : 'FAILED'}`).join(', ')}
──────────────────────────────────
`;
}

function summarizeForDeliverable(data, ctx) {
  const m = data.metrics;
  return {
    profile: ctx.profile,
    baseUrl: ctx.baseUrl,
    capturedAt: new Date().toISOString(),
    durationSeconds: (data.state?.testRunDurationMs || 0) / 1000,
    totalRequests: m.http_reqs?.values?.count || 0,
    rpsAvg: m.http_reqs?.values?.rate || 0,
    failedRate: m.http_req_failed?.values?.rate || 0,
    latencyMs: {
      p50: m.http_req_duration?.values?.med || null,
      p95: m.http_req_duration?.values?.['p(95)'] || null,
      p99: m.http_req_duration?.values?.['p(99)'] || null,
      max: m.http_req_duration?.values?.max || null,
    },
    cache: {
      hits: m.cf_cache_hits?.values?.count || 0,
      misses: m.cf_cache_misses?.values?.count || 0,
      other: m.cf_cache_other?.values?.count || 0,
      hitRate: m.cf_cache_hit_rate?.values?.rate || 0,
    },
    thresholdsPassed: Object.fromEntries(
      Object.entries(data.thresholds || {}).map(([k, v]) => [k, v.ok])
    ),
  };
}
