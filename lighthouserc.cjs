/**
 * Lighthouse CI config for the static dist/ output.
 *
 * lhci serves dist/ via its built-in static server (staticDistDir), runs
 * Lighthouse against each tracked URL, and asserts the budget. Designed to
 * run from CI with no extra setup beyond `npm install` (lhci ships Chromium
 * via puppeteer-core / @sparticuz/chromium on Linux, and uses the system
 * Chrome locally on macOS).
 *
 * Run:   npx lhci autorun
 * Or:    npm run perf:lighthouse
 */
module.exports = {
  ci: {
    collect: {
      // Use Astro's preview server — it handles the clean-URL rewrites for
      // pages like `/docs/getting-started` → `dist/docs/getting-started.html`
      // that lhci's built-in staticDistDir server doesn't.
      startServerCommand: 'npm run preview -- --port 4322',
      startServerReadyPattern: 'preview server running',
      url: [
        'http://localhost:4322/',
        'http://localhost:4322/plans',
        'http://localhost:4322/docs/',
        'http://localhost:4322/docs/getting-started',
        'http://localhost:4322/docs/cli-reference',
        'http://localhost:4322/blog/',
        'http://localhost:4322/blog/how-pilot-protocol-works',
      ],
      numberOfRuns: 1,
      settings: {
        // Desktop is the bar PILOT-32 ACs are written against. Mobile is a
        // harder bar; we track it warn-only for now and can promote later.
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        // Don't trip on the GA/PostHog/Google Fonts third-party origins; we
        // measure them separately. The HN-launch concern is *our* code path.
        skipAudits: ['uses-http2', 'redirects-http'],
      },
    },
    assert: {
      // Hard floor: PILOT-32 AC #1 is "Lighthouse Performance >= 90 on landing
      // + docs". We extend the same bar to /blog/ (front-page candidate too)
      // and leave plans/for-pages slightly looser since they're not in the AC.
      assertMatrix: [
        {
          matchingUrlPattern: 'http://localhost:4322/$',
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
            'categories:accessibility': ['warn', { minScore: 0.9 }],
            'categories:best-practices': ['warn', { minScore: 0.9 }],
            'categories:seo': ['warn', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: 'http://localhost:4322/docs/.*',
          assertions: {
            'categories:performance': ['error', { minScore: 0.9 }],
            'categories:accessibility': ['warn', { minScore: 0.9 }],
            'categories:best-practices': ['warn', { minScore: 0.9 }],
            'categories:seo': ['warn', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: 'http://localhost:4322/blog/.*',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.9 }],
          },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: './perf-results/lighthouse',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%',
    },
  },
};
