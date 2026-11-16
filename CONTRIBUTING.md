# Contributing

Thanks for your interest in contributing to `website` — Pilot Protocol website + docs — Next.js site at pilotprotocol.network.

## Quick start

```bash
git clone https://github.com/pilot-protocol/website.git
cd website
npm ci && npm run build
```

`README.md` covers local development with Payload's local database, the two site variants and deploys.

## Pull requests

1. Open an issue first for non-trivial changes so design can be discussed.
2. Branch off `main`; keep changes focused and self-contained.
3. Tests are required for new behavior; passing CI is required to merge.
4. Coverage should not regress (Codecov reports per-PR delta).
5. Conventional commit style is preferred (`feat:`, `fix:`, `docs:`, `chore:`, …) but not enforced.

## Docs pages and posts

A docs page is an MDX file in `content/docs` plus its entry in
`content/docs/meta.json`; agents get the same page as Markdown at
`/docs/<page>.mdx`, so there is no separate plain-text copy to keep in step.
Blog, learning center and newsroom posts are written in the Payload admin at
`/admin`, not committed to this repo. Before pushing, run `npm run lint` and
`npm run build` (the build runs the type check).

## Code of conduct

Be respectful and constructive. Project maintainers will moderate.

## License

By contributing you agree your contributions will be released under the
project's license (AGPL-3.0-or-later — see `LICENSE`).
