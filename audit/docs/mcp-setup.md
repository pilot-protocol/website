# Claim audit: src/pages/docs/mcp-setup.astro
Audited: 2026-07-10 · Sentences examined: 30 · verified: 25 · false: 3 · unverifiable: 1 · opinion: 1 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 31 | `npx -y pilot-mcp setup` | The npm package name `pilot-mcp` is owned by an UNRELATED project: registry.npmjs.org/pilot-mcp → "Fast browser automation MCP server for LLMs" by Pedro Rios (repo TacosyHorchata/pilot), versions 0.2.0–0.4.2, latest 0.4.2, sole maintainer `tacosyhorchata`. TeoSlayer/pilot-mcp's package.json declares `pilot-mcp@0.1.0` but that version was never published; its platform subpackage `pilot-mcp-darwin-arm64` also returns `{"error":"Not found"}` on npm. Running this command installs the wrong software (a Playwright browser server with a `postinstall` script), not the Pilot overlay MCP server. |
| 38 | "Shipping today (v0.1)." | Not shipping: `pilot-mcp@0.1.0` is absent from the npm registry (only the squatter's 0.2.0–0.4.2 exist); TeoSlayer/pilot-mcp has zero git tags and zero GitHub releases (`gh api repos/TeoSlayer/pilot-mcp/tags` and `/releases` both empty). The advertised install path (`npx -y pilot-mcp`) fetches the unrelated package. |
| 33 | "…traffic is peer-to-peer — no third party in the path." | Overbroad: the product has a relay fallback when direct P2P fails — web4/pkg/daemon/tunnel.go and zz_tunnel_rekey_relay_fallback_test.go implement/exercise relay path; pilot-mcp's own README documents `pilot_peers()` returning "PATH (direct vs relay)". A relay node is a third party in the path (payloads remain E2E-encrypted, but the blanket claim contradicts the relay case; rendezvous also traverses registry/beacon). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 33 | "Total time is about a minute" | Latency claim with no benchmark; and since `npx -y pilot-mcp` currently resolves to the wrong npm package, the flow cannot even be timed end-to-end. Repo README's "under a minute" is the same author's unmeasured claim. | A timed run of `pilot-mcp setup` from a published package on a clean machine. |

## Verified claims (grouped by source)
- gh api repos/TeoSlayer/pilot-mcp (cli.js, package.json, README, src/setup/index.js, src/setup/harnesses/): pilot-mcp is an MCP server fronting the overlay (stdio server via @modelcontextprotocol/sdk; `setup` subcommand exists); setup flow = extract/pull Go daemon binaries → start daemon service → detect installed harnesses → write MCP config per harness (setup/index.js steps 1–9); harness writers exist for all eight named clients — claude.js, cursor.js, cline.js, openclaw.js, hermes.js, openhands.js, continue.js, codex.js (plus copilot/junie/picoclaw, matching "and others"); MCP tools cover directory search, typed `/help`+`/data` queries, and A2A messaging (pilot_search/help/query/summary/send/inbox) "without learning pilotctl"; Hosted SSH/HTTP modes are planned v0.2/v0.3 and not yet available, with hosted party (Vulture) seeing metadata; Local mode = full P2P with own identity.
- web4 source (pkg/daemon/tunnel.go, ipc.go — ed25519 grep): node holds its own Ed25519 identity.
- Daemon heartbeat (~/.claude/CLAUDE.md, auto-injected by pilot-daemon: ~436 specialists) + pilot-mcp README (435): "400+ specialists" in meta description (L6) and subtitle (L13). Live `list-agents` recount attempted but the directory peer was unreachable at audit time.
- Local site files (src/pages/docs/): prev/next links — app-store.astro and consent.astro exist (L9–10); `href="comparison"` (L44) resolves to /docs/comparison under astro.config.mjs `build.format: 'preserve'`, and comparison.astro exists.
- Structural (page itself): title/h1 "MCP Setup", TOC labels (L18–21) match on-page anchors #what/#setup/#modes/#why, section headings (L25/29/35/42).
- Repo README + pre-verified overlay design ("no auth, no API keys"): L44 "one identity, no API keys, live data from specialists… direct message path to other operators' agents"; "Pilot is the transport and directory underneath; MCP is how your harness reaches it" (architecture matches repo). The parenthetical "no rate-limit dance, no captchas" is marketing flourish about the overlay's own design, noted but not counted separately.

## OPINION
- L44: "A typical MCP server wraps one API and brings one more credential." — generalization/marketing framing, no checkable fact.
