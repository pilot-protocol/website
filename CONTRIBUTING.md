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

## Machine UI parity

Every page also ships a plain-text "machine UI" twin under `src/pages/plain/`
for AI agents and screen readers. CI runs `npm run check:plain`, which fails if
a human page is missing its `/plain/` twin or a plain page is left orphaned. If
you add or remove a `docs/*` page (or one of the curated marketing pages), add
or remove its plain twin in the same PR. Run `npm run check:plain` locally to
verify before pushing.

## Code of conduct

Be respectful and constructive. Project maintainers will moderate.

## License

By contributing you agree your contributions will be released under the
project's license (AGPL-3.0-or-later — see `LICENSE`).
