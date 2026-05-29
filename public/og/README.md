# Open Graph images

Per Artemii's spec on [PILOT-26](https://vulturelabs.atlassian.net/browse/PILOT-26), drop the following JPGs in this directory and the meta tags wired in this PR will pick them up automatically:

- `main.jpg`  → used by `/` (src/pages/index.astro)
- `plans.jpg` → used by `/plans` (src/pages/plans.astro)
- `docs.jpg`  → used by `/docs/` and all docs sub-routes (src/pages/docs/index.astro + layout)
- `blogs.jpg` → used by `/blog/` index AND every individual blog post (fallback per Artemii's note)

Recommended dimensions: **1200 × 630 px** (Open Graph standard for `summary_large_image`).

Until the JPGs land, the meta tags will 404 — but the fallback default in `BaseHead.astro` remains `/img/pilot.png` for any page that doesn't override ogImage.
