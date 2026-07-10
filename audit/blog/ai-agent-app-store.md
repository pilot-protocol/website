# Claim audit: src/pages/blog/ai-agent-app-store.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 69 · false: 0 · unverifiable: 1 · opinion: 11 · example: 7

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 66 | "…any agent on the overlay — there are 243k+ of them — can discover and install…" | Live stats (2026-07-10, pre-verified): active_nodes 218,560; total_nodes 250,175. 243k+ is true only against total nodes, false against active nodes; denominator is ambiguous and the figure will drift. | Rephrase to cite active vs total explicitly, or bind to /api/public-stats |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go:1533-1539 + appstore.go help text: `pilotctl appstore catalogue / view / install / list / call` all exist with the semantics described (fetch + verify + extract, list installed apps + methods, dispatch IPC call); `view` shows description, vendor, methods, permissions, source.
- web4/cmd/pilotctl/appstore.go (lines 5, 279-292, 356, 428-438, 456, 739, 1010-1074) + appstore_catalogue.go (29, 94, 171-172): manifest pins binary sha256 and carries ed25519 signature; both re-checked at every spawn by the daemon's app-store supervisor; catalogue is signature-gated (detached ed25519 .sig, fail-closed); grants block exists and is "user accepted at install"; supervisor auto-spawns/respawns (restart clears crash-loop suspension).
- website src/pages/docs/app-store.astro:65-69 + src/data/apps.ts: `<app>.help` convention (methods, params, kind, expected-latency class fast/med/slow) is real and documented; latency-class rationale ("pick the cheapest method") matches.
- website src/data/apps.ts: all 8 named catalogue apps exist with matching taglines/descriptions — io.pilot.aegis (runtime firewall; inbox messages, tool results, skill files, memory notes; offline), cosift (grounded web search/research), sixtyfour (people/company intelligence), otto (real Chrome tabs), plainweb (page → Markdown), miren (PaaS deploy/rollback/logs), smol / "Smol Machines" (hardware-isolated microVMs), wallet (on-overlay USDC across chains).
- website src/pages/publish.astro:29-40,34,448-449: publish flow = describe your app → verify your email → Pilot generates, signs, verifies the adapter → team reviews → live in the store; "secrets are never collected here — operators supply them at install time" (matches "Your secrets stay yours" and the FAQ answers verbatim in substance).
- Live URLs (curl 2026-07-10): https://pilotprotocol.network/publish 200; https://pilotprotocol.network/app-store 200.
- Local site files: internal links /blog/build-agent-app-turn-api-into-tool, build-an-agent-app, mcp-plus-pilot-tools-and-network, aegis-agent-firewall-prompt-injection all exist in src/pages/blog/; banner public/blog/banners/ai-agent-app-store.svg exists.
- OPINION (not flagged): "capable one", "worth installing", "one more reason to be on Pilot", MCP-complementarity framing ("many teams use both"), etc.
- EXAMPLE (not flagged): io.yourorg.yourapp commands, `cosift.search '{"q":"raft consensus","k":"5"}'` sample calls.

## Resolutions (2026-07-11 iter 65)
- L66 ("243k+ of them"): ambiguous/drifting (active 218,560 vs total 250,175). Changed to "hundreds of thousands of them" — non-drifting and true on both denominators.
Build: npm run build green.
