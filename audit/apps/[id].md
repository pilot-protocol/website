# Claim audit: src/pages/apps/[id].astro

Audited: 2026-07-10 · Sentences examined: 46 · verified: 29 · false: 3 · unverifiable: 2 · opinion: 11 · example: 1

Template page — one static frame rendered for each app in `src/data/apps.ts` (20 apps, all `inCatalogue: true`). Data-driven interpolations (taglines, versions, changelogs, bundles) were checked for faithful rendering here; the per-app claim content belongs to the apps.ts audit. Live catalogue cross-checked via `pilotctl appstore catalogue` / `view` on 2026-07-10 (19 apps live).

## FLAGGED — FALSE

| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 94 | "Live on catalogue" (badge, shown when `app.inCatalogue`) | apps.ts marks **io.pilot.mysql** (line 735 block) and **io.pilot.didit** (line 2483 block) `inCatalogue: true`, but the live catalogue does not contain them: `pilotctl appstore catalogue` (2026-07-10) lists 19 apps without either id, and `pilotctl appstore view io.pilot.didit` / `io.pilot.mysql` both return `error: app not found in catalogue or install root`. The badge is true for the other 18 pages. (Live catalogue also carries `io.pilot.smolmachines`, absent from apps.ts — data drift both directions.) |
| 163 | "This app publishes its method surface at runtime — call `slipstream.help` after install to discover every method, its parameters, and latency class." | Renders only for the one app with `methods: []` (io.pilot.slipstream, apps.ts:2064). But the catalogue publishes slipstream's method surface statically: `pilotctl appstore view io.pilot.slipstream` shows "Methods (9)" including `slipstream.help` — apps.ts is stale, not the app runtime-only. (`slipstream.help` does exist; the "parameters and latency class" tail is additionally unverified without installing.) |
| 246 | "GitHub ↗" (Source link label, shown whenever `app.sourceUrl` is set) | The label hardcodes "GitHub" but three apps' `sourceUrl` values are not GitHub: io.pilot.sixtyfour → `https://docs.sixtyfour.ai`, io.pilot.sqlite → `https://sqlite.org/src`, io.telepat.ideon-free → `https://telepat.io` (apps.ts, sourceUrl grep). On those 3 pages the link says GitHub and goes elsewhere. |

## FLAGGED — UNVERIFIABLE

| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 170 | Pricing section body (`app.pricing.model`) | Dead code: the `App` interface in apps.ts (auto-generated, lines 10–21) has **no `pricing` field** and no app object carries one (parsed all 20 apps: `pricing` absent everywhere), so this section never renders and the data it would show doesn't exist. | The generator emitting `pricing` data for at least one app, matched to catalogue/broker rate cards. |
| 174 | "free credit — then billed by real usage" | Same dead branch; a billing-behavior claim with no app data behind it and no broker billing source checkable from here. (Wording is at least consistent with orthogonal/smol/agentphone descriptions in apps.ts, which describe $5 free credit + usage metering.) | Pricing data in apps.ts plus the managed-key broker's billing docs/behavior. |

## Verified claims (grouped by source)

- **web4/cmd/pilotctl/main.go:1536**: install command `pilotctl appstore install <app-id>` (lines 19, 108) is a real subcommand with exactly this shape.
- **Live catalogue (`pilotctl appstore catalogue` / `view`, 2026-07-10)**: "Live on catalogue" badge correct for 18 of 20 apps; "Permissions" sidebar heading matches view output "Permissions (granted at install)"; slipstream.help method exists; catalogue install requires no payment (supports JSON-LD `price: '0'`, with the caveat that usage-billed apps — orthogonal, agentphone, smol — meter usage against a $5 credit after free install).
- **web4/cmd/pilotctl/appstore.go:456, 1068, 1108**: "Granted or denied by the agent at install time." — audit report prints "grants (user accepted at install)"; caveat: there is no per-grant prompt in `cmdAppStoreInstall` (accept is wholesale by installing; deny = don't install). "No ambient authority." — apps receive only manifest-declared grants; sideloads are clamped to a minimal allow-list (fs.read/fs.write under $APP, audit.log; no net.dial/key.sign).
- **app-store@v1.0.2/pkg/manifest/manifest.go:39-41, validate.go:77-80**: "Sandbox" metric (line 120) maps the manifest `protection` field — values `shareable` (default) / `guarded` (encrypted volume + restricted process namespace); apps.ts values (11 guarded, 9 shareable) are valid. Label is a loose but defensible gloss.
- **github.com/pilot-protocol/app-template (gh api, README:43,70)**: "Ship it to the catalogue with one PR." (line 264) — repo is the "single-repo submission front door"; README documents "commit submissions/<id>/ and open a PR to pilot-protocol/app-template"; submissions/ contains the live apps. (The /publish page CTA offers the no-code form path; the one-PR path exists in parallel.)
- **src/pages/app-store.astro (exists; lines 269-271)**: "Back to App Store" / breadcrumb links to `/app-store`; `#cat-<id>` deep links are handled by the hash-activation script.
- **src/pages/publish.astro (exists)**: "Publish your app →" link target; publish flow is real (form → email verify → team review → live).
- **apps.ts (parsed all 20 apps)**: "Latest" badge (line 200) — `changelog[0].version === app.version` holds for every app with a changelog; metric strip / Information rows / Platform Compatibility "Supported"/"Not available" faithfully render the data fields (Version, Methods count, Size via installedBytes, Platforms via bundles, Vendor, Category, License, Runtime, Min Pilot, Published).
- **Live site (curl, 2026-07-10)**: canonical URL scheme `https://pilotprotocol.network/apps/<id>` — `/apps/io.pilot.cosift` and `/apps/io.pilot.didit` both HTTP 200.
- **Branding**: title "— Pilot Protocol App Store" consistent with the site's /app-store page and live catalogue.

## Notes / non-flagged

- "Coming soon" badge (line 95): dead branch — every app in apps.ts is `inCatalogue: true`, so it never renders (counted as example).
- UI labels with no factual content (Copy, Read more/Show less, section headings, "You might also like", toast text, "Built something agents need?") counted as opinion.
- Data staleness worth fixing though not itself a rendered false claim: slipstream shows "—" methods while the live catalogue publishes 9; apps.ts is missing live app io.pilot.smolmachines.

## Resolutions (2026-07-11 iter 41)
- L94 (Live-on-catalogue badge for non-live apps): fixed the underlying data drift in src/data/apps.ts. Verified live catalogue on 2026-07-11 (pilotctl appstore catalogue --json = 19 apps): io.pilot.mysql and io.pilot.didit are NOT live -> set real:false + inCatalogue:false on both, so their [id] pages now render the "Coming soon" badge instead of "Live on catalogue".
- L163 (slipstream "publishes at runtime"): populated io.pilot.slipstream.methods with the 9 method names the catalogue publishes statically (leaderboard, signals, tape, markets, wallet, skilled, opportunities, stats, help; summaries null pending install). methods.length>0 now, so the page lists the real method surface instead of the runtime-only fallback copy.
- L246 (hardcoded "GitHub" for non-GitHub sourceUrl): label is now dynamic -- github.com -> "GitHub", otherwise "Source". Fixes sixtyfour (docs.sixtyfour.ai), sqlite (sqlite.org/src), telepat (telepat.io).
- L170/L174 (pricing dead branch): left as-is -- the pricing field is absent from every app, so the section never renders (dead code, not a rendered false claim); noted for a future data-model cleanup.
Build: npm run build green (345 pages).
