#!/usr/bin/env node
/**
 * Build fully self-contained 404 / 500 HTML files for Cloudflare's zone-level
 * "Custom Pages" slot. These are served when Pages itself is unreachable
 * (deployment failed, account suspended, infra outage) — so they MUST NOT
 * depend on any asset the website serves. Everything is inlined: CSS, fonts
 * (system stack only), and the dog illustration (base64 data URI).
 *
 * Output: dist/cloudflare-pages/{404,500}.html
 *
 * To install: Cloudflare Dashboard → your zone → Rules → Custom Pages →
 *   "500 errors": upload dist/cloudflare-pages/500.html
 *   "1xxx errors" + "Always Online" + "Web Application Firewall block":
 *     upload dist/cloudflare-pages/404.html (these are the closest 4xx slots)
 *
 * The CF Custom Pages feature ALSO covers the case where Pages returns a raw
 * 5xx — once configured, our 500.html is served instead of the cloud-icon
 * default.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const IMG = resolve(ROOT, 'public/img/sad-doodle.png');
const OUT_DIR = resolve(ROOT, 'dist/cloudflare-pages');

const imgBuf = await readFile(IMG);
const imgDataUri = `data:image/png;base64,${imgBuf.toString('base64')}`;

/** Minimal CSS — single-file, no external fonts, no theme JS. Light theme by
 *  default; if the visitor has `prefers-color-scheme: dark` we flip
 *  the bg + invert the dog. */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #fafaf7;
    color: #0b0b0a;
    font-family: 'Inter Tight', system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .wrap {
    flex: 1;
    max-width: 680px;
    margin: 0 auto;
    padding: 64px 24px 96px;
    text-align: center;
    width: 100%;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    text-decoration: none;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.04em;
    margin-bottom: 48px;
  }
  .brand-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #c4ff00;
    box-shadow: 0 0 0 3px rgba(196, 255, 0, 0.18);
  }
  .eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5a5a54;
    display: inline-block;
    margin-bottom: 24px;
  }
  .dog {
    width: clamp(220px, 30vw, 360px);
    height: auto;
    display: block;
    margin: 24px auto 40px;
    opacity: 0.9;
  }
  h1 {
    font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(44px, 7vw, 96px);
    letter-spacing: -0.02em;
    line-height: 0.95;
    margin: 0;
    color: #0b0b0a;
  }
  .lede {
    color: #5a5a54;
    font-size: 17px;
    line-height: 1.55;
    max-width: 50ch;
    margin: 28px auto 36px;
  }
  .lede b { color: #0b0b0a; font-weight: 500; }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 11px 18px;
    background: #c4ff00;
    color: #0b0b0a;
    text-decoration: none;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.06em;
    border: 1px solid #0b0b0a;
    transition: transform 0.15s;
  }
  .cta:hover { transform: translateY(-1px); }
  .arr { font-size: 16px; }
  footer {
    padding: 24px;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5a5a54;
    text-align: center;
  }

  @media (prefers-color-scheme: dark) {
    body { background: #0b0b0a; color: #eceae3; }
    .eyebrow, .lede, footer { color: #8a8a83; }
    h1, .lede b { color: #eceae3; }
    .dog { filter: none; }
    .cta { color: #0b0b0a; border-color: #c4ff00; }
  }
  /* Image is white-on-transparent; invert on light theme. */
  @media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
    .dog { filter: invert(1); }
  }
`.trim();

function page({ code, title, headline, lede }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#0b0b0a" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#fafaf7" media="(prefers-color-scheme: light)">
  <style>${CSS}</style>
</head>
<body>
  <main class="wrap">
    <a class="brand" href="https://pilotprotocol.network/">
      <span class="brand-dot" aria-hidden="true"></span>
      pilot / protocol
    </a>
    <div class="eyebrow">Error · ${code}</div>
    <img class="dog" src="${imgDataUri}" alt="" width="1306" height="1071">
    <h1>${headline}</h1>
    <p class="lede">${lede}</p>
    <a class="cta" href="https://pilotprotocol.network/">Back to home <span class="arr" aria-hidden="true">→</span></a>
  </main>
  <footer>Pilot Protocol · network status: pilotprotocol.network</footer>
</body>
</html>
`;
}

await mkdir(OUT_DIR, { recursive: true });

await writeFile(
  resolve(OUT_DIR, '404.html'),
  page({
    code: '404',
    title: 'Page not found · Pilot Protocol',
    headline: 'Page not found.',
    lede: `The page you're looking for doesn't exist or has been moved. Head back to the home page.`,
  })
);

await writeFile(
  resolve(OUT_DIR, '500.html'),
  page({
    code: '500',
    title: 'Server error · Pilot Protocol',
    headline: 'Something broke.',
    lede: `We hit an unexpected error on our end. <b>The network itself is fine</b> — this is just the website. Try again in a moment.`,
  })
);

// README so the deploy steps don't get forgotten.
const README = `# Cloudflare zone-level Custom Pages

These two files are **fully self-contained** (inline CSS + base64 image, no
external fetches) and are meant for Cloudflare's zone-level Custom Pages
feature. They get served when the Pages project itself is unreachable —
deployment failed, account suspended, infra outage — i.e., the cases where
our in-app /404 and /500 routes cannot run because the origin is gone.

## Install

1. Cloudflare Dashboard → \`pilotprotocol.network\` zone.
2. Rules → Custom Pages.
3. For each error class below, click **Custom Pages** → **Edit** → upload
   the corresponding HTML from this directory:
   - **500 errors** → \`500.html\`
   - **1xxx errors** → \`404.html\`
   - **WAF block** → \`404.html\`
   - **Always Online** → \`404.html\` (fallback when origin is offline and
     Always Online doesn't have a cached copy)

Each upload validates against ~1MB limit and required tokens. These files
include no required tokens (we don't surface CF Ray IDs); CF accepts that.

## Regenerate

\`node scripts/build-cf-error-pages.mjs\` after any change to the design or
the source image. Rerun after \`npm run build\` if you want the output in
\`dist/cloudflare-pages/\`.
`;
await writeFile(resolve(OUT_DIR, 'README.md'), README);

// Also emit a TS module so functions/500.ts can serve the same HTML directly
// without a recursive ASSETS.fetch — file is excluded from Pages routing
// because of the underscore prefix.
const FUNCTIONS_DIR = resolve(ROOT, 'functions');
const tsModule = `// AUTO-GENERATED by scripts/build-cf-error-pages.mjs — do not edit.
// Underscore prefix excludes this file from Pages Functions routing.
export const html500 = ${JSON.stringify(
  page({
    code: '500',
    title: 'Server error · Pilot Protocol',
    headline: 'Something broke.',
    lede: `We hit an unexpected error on our end. <b>The network itself is fine</b> — this is just the website. Try again in a moment.`,
  }),
)};
`;
await writeFile(resolve(FUNCTIONS_DIR, '_500-body.ts'), tsModule);

console.log(`wrote ${OUT_DIR}/404.html, 500.html, README.md`);
console.log(`wrote functions/_500-body.ts`);
