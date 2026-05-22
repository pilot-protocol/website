# website

Pilot Protocol marketing and documentation site — deployed at
[pilotprotocol.network](https://pilotprotocol.network) via Cloudflare
Pages (Workers Sites; see `wrangler.toml`).

Built with [Astro](https://astro.build) for static-first rendering,
PostHog for product analytics, and Puppeteer to render the handful of
graphs that need a real browser at build time.

## Dev

```bash
npm install
npm run dev      # local dev server (default :4321)
npm run build    # produces dist/
npm run preview  # serves dist/ locally
```

## Layout

| Path | What it does |
|---|---|
| `src/pages/` | Astro `.astro` pages — landing, docs, plain-text mirrors. |
| `src/components/` | Reusable layout fragments. |
| `public/` | Static assets — `install.sh`, `llms.txt`, PDFs, images. |
| `scripts/regen-plain.mjs` | Generates the `plain/` mirror from the rich pages so curl/cat users get clean text. |
| `astro.config.mjs` | Astro config (sitemap, integrations, output mode). |
| `wrangler.toml` | Cloudflare Pages deploy config. |
| `_headers` | Cloudflare custom response headers. |

## Deploy

Pushed via the `deploy-website` GitHub Action when commits land on
`main`.
