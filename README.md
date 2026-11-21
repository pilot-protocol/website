# website

[![ci](https://github.com/pilot-protocol/website/actions/workflows/ci.yml/badge.svg)](https://github.com/pilot-protocol/website/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

The website for Pilot Protocol at [pilotprotocol.network](https://pilotprotocol.network): marketing pages, docs, and the blog, learning center and newsroom.

- Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion, Geist fonts
- [Fumadocs](https://fumadocs.dev) for the docs, written as MDX in `content/docs`
- [Payload CMS 3](https://payloadcms.com) for posts, with the admin at `/admin`
- Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare). Payload keeps its data in D1 and uploads in R2.

Marketing pages and docs are prerendered and served as static assets. The blog, learning center, newsroom, `/about`, `/blog/feed.xml` and the sitemap read Payload on every request, so a published post is live without a deploy. The live registry figures come from `polo.pilotprotocol.network/api/public-stats`, with build-time fallbacks in `src/lib/site.ts`.

## Two variants

One codebase builds two designs. `NEXT_PUBLIC_SITE_VARIANT` picks one at build time (`src/lib/site.ts`).

| Variant | Set | Deploy | Worker | URL |
| --- | --- | --- | --- | --- |
| sky (production) | `NEXT_PUBLIC_SITE_VARIANT=sky` | `npm run deploy` | `pilot-protocol-website` | https://pilotprotocol.network |
| green | nothing | `npm run deploy:green` | `pilot-protocol-website-green` (`env.green` in `wrangler.jsonc`) | its `workers.dev` address only |

Sky has the flight home page and the sky accent on every page. Green has the lime home page. `next dev` and `next build` build green unless the variable is set; the deploy scripts set it. Both Workers use the same D1 database and R2 bucket. Earlier home page designs stay at `/v0`, `/v2`, `/v3` and `/v4`, marked noindex.

To run sky locally:

```sh
NEXT_PUBLIC_SITE_VARIANT=sky npm run dev
```

## Develop locally

Node `^22.23.4 || >=24.22.1` (Payload's requirement). `.nvmrc` pins 26.

```sh
npm install
cp .env.example .env    # set PAYLOAD_SECRET: openssl rand -hex 32
npm run migrate         # create the schema in the local D1
npm run seed            # import the posts in seed/posts
npm run dev             # http://localhost:3000
```

Open http://localhost:3000/admin and create the first user. The local D1 and R2 live in `.wrangler/state`; delete that folder to start from an empty database.

`npm run preview` makes the OpenNext build and runs the Worker locally in workerd, against the same local D1 and R2.

`prebuild` runs before every build. It refreshes `public/install.sh` from pilot-protocol/release, the installer's source of truth (keeping the committed copy if GitHub is down) and regenerates `src/generated/*`: the content and file sizes that pages used to read from disk, since Workers have no filesystem.

## Docs: how Fumadocs works here

**Pages.** Each page is an MDX file in `content/docs`. The file name is the URL: `content/docs/mcp.mdx` is `/docs/mcp`. Frontmatter has a `title` and a `description` (used for search results and link previews). A heading can fix its anchor with `[#id]`, as in `## Choose your transport [#choose-transport]`.

**Order and groups.** `content/docs/meta.json` lists the pages in sidebar order. Entries like `"---SDKs---"` are group headings. A page missing from the list still builds and has a URL, but it isn't in the sidebar.

**Compiling.** `createMDX()` from `fumadocs-mdx/next` wraps the config in `next.config.ts` and adds loaders for MDX, `meta.json` and the macro. There is no `source.config.ts`. The collection is declared in `src/lib/source.ts` with `defineDocs` from `fumadocs-mdx/macro`. At build time the macro loader evaluates that call (its scratch files go to `.source/`, which is git-ignored) and replaces it with imports of every file in `content/docs`. Each MDX file compiles to a React component plus its frontmatter, table of contents, search data and processed Markdown. Code blocks are highlighted with the site's Shiki themes from `src/lib/shiki-themes.ts`.

**The loader.** `loader()` in `src/lib/source.ts` turns the collection into `source`, with base URL `/docs`. Every route goes through it: `source.getPage(slug)`, `source.getPageTree()`, `source.generateParams()`.

**Routes.**

- `src/app/(site)/docs/layout.tsx`: Fumadocs' `RootProvider` and `DocsLayout`, with the sidebar from `source.getPageTree()`.
- `src/app/(site)/docs/[[...slug]]/page.tsx`: one docs page, prerendered for every slug. `/docs` itself renders `src/components/docs/docs-home.tsx`; `index.mdx` gives it a sidebar entry and a search record.
- `src/components/mdx.tsx`: the components available in MDX (Fumadocs' defaults, `<Install />`, `<Paper>` and the rest).
- `src/app/(site)/og/docs/[...slug]/route.ts`: a share image per page. The sitemap lists every docs page.

**Search.** `src/app/(site)/api/search/route.ts` serves `createFromSource(source)` at `/api/search`. `RootProvider` points Fumadocs' search dialog at it. Open the dialog from the sidebar or with ⌘K.

**For agents.** `/docs/<page>.mdx` returns the page as Markdown. A rewrite in `next.config.ts` sends it to `src/app/llms.mdx/docs/[[...slug]]/route.ts`, which is prerendered for every page. The copy-page button and the view options menu on each page use the same URL. `/llms.txt` is a hand-written file in `public/`.

**Adding a page.**

1. Create `content/docs/my-page.mdx`:

   ```mdx
   ---
   title: "My page"
   description: "One sentence for search results and link previews."
   ---

   Text in Markdown, plus any component from src/components/mdx.tsx.
   ```

2. Add `"my-page"` to `content/docs/meta.json` under the right group.
3. `npm run dev` picks it up at `/docs/my-page` and `/docs/my-page.mdx`, and search finds it.

## Posts: how Payload works here

The config is `src/payload.config.ts`. The collections are in `src/collections`:

| Collection | Holds | Fields |
| --- | --- | --- |
| `posts` | Blog, learning center and newsroom posts | `title`, `description`, `content` (Lexical rich text with code blocks and tables), `slug` (unique), `section` (`blog`, `learn` or `news`), `publishedAt`, `author`, `tags`, `minutes` (reading time, set on save), `seoTitle`. Drafts on, 25 versions per post. |
| `media` | Uploads, stored in R2 | `alt`. Crop and focal point are off because Workers have no sharp. |
| `users` | Admin accounts | Email and password (Payload auth), `name` |

**Admin and API.** The admin is at `/admin` and the REST API under `/api`, both from `src/app/(payload)`, which Payload generates. GraphQL is off. After adding admin components, run `npm run generate:importmap`.

**Local API.** Pages read posts in-process: `src/lib/posts.ts` calls `getPayload({ config })` and `payload.find()`. The blog, learn and news pages, their share images, the feed, `/about` and the sitemap use it. Visitors only get published posts (the `read` access rule in `Posts.ts`).

**Storage.** Data goes through `sqliteD1Adapter` on the `D1` binding. Uploads go through `r2Storage` on the `R2` binding.

**Where the bindings come from.** In production, from the Worker, through OpenNext's `getCloudflareContext()`. In `next dev`, during `next build` and from the Payload CLI, `payload.config.ts` calls Wrangler's `getPlatformProxy()`, which gives local D1 and R2 under `.wrangler/state`. With `CLOUDFLARE_ENV=remote` the CLI uses the `env.remote` bindings in `wrangler.jsonc`, which point at the production D1 and R2.

**Migrations.** They live in `src/migrations`. `npm run migrate` applies them to the local D1. After changing a collection:

```sh
npx payload migrate:create <name>   # writes src/migrations/<timestamp>_<name>.ts
npm run migrate                     # apply it locally
npm run generate:types              # refresh cloudflare-env.d.ts and src/payload-types.ts
```

Production gets new migrations from `npm run deploy:database`, which `npm run deploy` runs first.

**Seed.** `scripts/seed.ts` imports `seed/posts/*.json`, the posts converted from the previous site by `scripts/html-to-lexical.py`. Slugs that already exist are skipped, so it can run more than once. `npm run seed` writes to the local D1, `npm run seed:production` to production.

## Deploy to Cloudflare

This needs a Workers Paid plan: the Worker with Payload is about 9 MB gzipped. `wrangler.jsonc` has no `account_id`; Wrangler takes the account from `CLOUDFLARE_ACCOUNT_ID` or from `wrangler login`.

The one-time setup is done on the Vulture Labs account, which holds the pilotprotocol.network zone: the D1 database `pilot-protocol-website` (its id is in `wrangler.jsonc`), the R2 bucket `pilot-protocol-website-media`, `PAYLOAD_SECRET` on both Workers, the migrations, and the seeded posts. The production database already has an admin user, so `/admin` asks for a login rather than offering to create the first user. To set it up again elsewhere:

```sh
npx wrangler login
npx wrangler d1 create pilot-protocol-website             # then put its id in every database_id in wrangler.jsonc
npx wrangler r2 bucket create pilot-protocol-website-media
npx wrangler secret put PAYLOAD_SECRET                    # the production Worker
npx wrangler secret put PAYLOAD_SECRET --env green        # the green Worker
npm run deploy:database                                   # run the migrations on the production D1
npm run seed:production                                   # optional: import the posts
```

Create the first admin user before the Worker is reachable: until a user exists, anyone who opens `/admin` can create one.

The deploy scripts set `NEXT_PUBLIC_SERVER_URL` for production. OpenNext compiles the values in `.env` into the Worker as fallbacks; a Worker secret overrides them.

Each deploy:

```sh
npm run deploy         # deploy:database, then deploy:app (sky, at pilotprotocol.network)
npm run deploy:green   # green only; run deploy:database first if the schema changed
```

`deploy:app` and `deploy:green` run `prebuild`, build with `opennextjs-cloudflare build` and upload with `opennextjs-cloudflare deploy`. The build runs Next.js with one worker (`experimental.cpus` in `next.config.ts`): every build worker opens the local D1, and two at once fail with `SQLITE_BUSY`.

**The domain.** The production Worker serves `pilotprotocol.network` through the zone route `pilotprotocol.network/*` in `wrangler.jsonc`. The apex keeps the proxied DNS record left from the old Cloudflare Pages project `pilotprotocol` (the domain is no longer attached to that project); a route runs on any proxied record, while a custom domain would need that record deleted first. `workers_dev` stays on, so the Worker can be checked at its `workers.dev` address. Responses on `*.workers.dev` carry `X-Robots-Tag: noindex` (`headers()` in `next.config.ts`).

**Other Workers on the zone.** The `pilot-release` Worker (pilot-protocol/release) has routes on `pilotprotocol.network/install.sh`, `/.well-known/*` and `/api/changelog`. They are more specific than `pilotprotocol.network/*`, so it keeps serving the installer, `/.well-known/latest.json` and the changelog hook. Its route used to be `/api/*`, which would catch this site's `/api/search` (docs search), `/api/media/file/*` (uploads) and Payload's REST API, which the admin uses; keep it narrowed to `/api/changelog`.

## Deploy to Vercel

The code ships with Cloudflare adapters: Payload on D1 and R2, and OpenNext to build the Worker. Vercel has no D1 or R2 bindings, so Payload needs a different database adapter and storage adapter. The marketing pages and Fumadocs need no changes. Nothing below is applied in this repo.

**1. Swap the packages.** Keep them on the same version as `payload`.

```sh
npm uninstall @payloadcms/db-d1-sqlite @payloadcms/storage-r2
npm install @payloadcms/db-postgres @payloadcms/storage-vercel-blob
```

For Turso (libSQL), install `@payloadcms/db-sqlite` in place of `@payloadcms/db-postgres`.

**2. Edit `src/payload.config.ts`.** Delete the Cloudflare part: the `@opennextjs/cloudflare` and `wrangler` imports, `isCLI`, `isBuild`, the `cloudflare` constant and `getCloudflareContextFromWrangler()` at the bottom. Then change `db` and `plugins`:

```ts
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

export default buildConfig({
  // ...the rest stays as it is
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
  plugins: [vercelBlobStorage({ collections: { media: true }, token: process.env.BLOB_READ_WRITE_TOKEN })],
});
```

With Turso:

```ts
import { sqliteAdapter } from "@payloadcms/db-sqlite";

db: sqliteAdapter({ client: { url: process.env.DATABASE_URI!, authToken: process.env.DATABASE_AUTH_TOKEN } }),
```

`isProduction` and the JSON logger can stay.

**3. Make a fresh migration.** The one in `src/migrations` is written for D1. With `DATABASE_URI` in `.env`:

```sh
rm -rf src/migrations
npx payload migrate:create initial
npx payload migrate
npx payload generate:types
npm run seed                        # optional
```

For production, run `npx payload migrate` with `DATABASE_URI` pointing at the production database before deploying, or set the Vercel build command to `npx payload migrate && npm run build`.

**4. Create the Vercel project.** Import the repo with the Next.js preset. The default build command, `npm run build`, runs `prebuild` and then `next build`; `opennextjs-cloudflare` isn't used. Environment variables:

| Variable | Value |
| --- | --- |
| `PAYLOAD_SECRET` | A random string: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | The site's origin, e.g. `https://pilotprotocol.network` |
| `DATABASE_URI` | The Postgres connection string (Neon or Vercel Postgres), or the `libsql://` URL for Turso |
| `DATABASE_AUTH_TOKEN` | Turso only |
| `BLOB_READ_WRITE_TOKEN` | Added by Vercel when you connect a Blob store |
| `NEXT_PUBLIC_SITE_VARIANT` | `sky` for the sky site; unset for green |

For both variants, make two Vercel projects from the same repo that differ only in `NEXT_PUBLIC_SITE_VARIANT`. They can share the database and Blob store.

**5. Cloudflare-only files.** Vercel ignores `wrangler.jsonc`, `open-next.config.ts`, `cloudflare-env.d.ts` and the `preview` and `deploy*` scripts; delete them or leave them. If you uninstall `@opennextjs/cloudflare`, delete `open-next.config.ts` too, or the type check fails. `public/_headers` and `public/_redirects` are Workers static-asset rules that Vercel doesn't read: move the headers and the `/plain` redirects into `headers()` and `redirects()` in `next.config.ts` if you need them.

## CI

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`: `npm ci`, the type check (`next typegen`, then `tsc --noEmit`), `npm run lint`, and the production build (`opennextjs-cloudflare build`, sky). Its deploy step runs only when the workflow is started by hand on `main` (`workflow_dispatch`), and runs `npm run deploy` with the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. The token needs Workers Scripts, Workers Routes, D1 and R2 edit rights on the account.

`sync-install-sh.yml` keeps the live `/install.sh` (served by `pilot-release` from R2) in step with pilot-protocol/release, and fails if `public/install.sh` drifts from it.

## The publish Worker (`worker/`)

`worker/` is a separate Cloudflare Worker (`pilot-publish`) with its own package, tests and `wrangler.toml`, deployed on its own. It publishes a post by committing an Astro page and `src/data/blogPosts.ts` to this repo, which this site no longer reads: posts now go through Payload at `/admin`.

```sh
cd worker
npm install
npm test         # vitest run
npm run deploy   # wrangler deploy
```

## Where things live

- `src/app/(site)`: the website, with its own root layout (banner, header, footer)
- `src/app/(site)/globals.css`: Tailwind and the colour tokens for the light and dark themes
- `src/app/(payload)`: Payload admin and REST API (generated)
- `src/app/llms.mdx`: docs pages as Markdown
- `src/app/global-not-found.tsx`: the 404 for unmatched URLs under both root layouts
- `src/components/home`: the green home page sections, in page order in `src/app/(site)/page.tsx`
- `src/components/v4`: the sky home page; `src/components/v0`, `v2`, `v3`: the other alternate home pages
- `src/components/pages/*`: the standalone pages (service agents, App Store, cloud, security and others)
- `src/collections`, `src/payload.config.ts`, `src/migrations`: Payload
- `src/lib/source.ts`, `content/docs`: Fumadocs
- `content/pages`, `content/apps`: other content from the previous site, bundled into `src/generated` by `prebuild`
- `seed/posts`: the posts for the seed
- `scripts/`: the build helpers (`sync-install.mjs`, `generate-static-data.mjs`), the seed, and the one-off scripts that migrated the previous site (`migrate-content.py`, `html-to-mdx.py`, `html-to-lexical.py`)
- `worker/`: the `pilot-publish` Worker (above)

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).
