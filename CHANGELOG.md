# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Rebuilt the site on Next.js 16, deployed to Cloudflare Workers with OpenNext in place of
  Astro on Cloudflare Pages. Docs are MDX in `content/docs`, rendered with Fumadocs, and also
  served as Markdown at `/docs/<page>.mdx`, which replaces the `/plain` twins. Blog, learning
  center and newsroom posts move to Payload CMS (D1 and R2, admin at `/admin`). Production
  builds the sky design; the green design stays available with `npm run deploy:green`.

## [v0.1.0]

Initial release.
