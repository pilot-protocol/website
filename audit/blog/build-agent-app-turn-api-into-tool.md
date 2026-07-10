# Claim audit: src/pages/blog/build-agent-app-turn-api-into-tool.astro
Audited: 2026-07-10 · Sentences examined: 58 · verified: 47 · false: 0 · unverifiable: 3 · opinion: 6 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 24 | "plenty of teams run an MCP server for direct integrations and also publish an agent app for overlay-wide discovery" | Adoption claim about third-party teams; no data source | Publisher survey / store analytics |
| 102 | FAQ: "The two are complementary, and many teams run both." | Same adoption claim | Same |
| 4 | "That's the integration tax every agent framework pays today, one tool at a time." | Sweeping ecosystem claim ("every framework") with no citation | Framework survey |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/appstore.go (AppStoreHelpText): `appstore catalogue`, `view <id> [--all-changelog]` (description, vendor, changelog, size, source, methods, permissions), `install <id>` ("fetches + verifies + extracts"), `list` (installed apps + methods), `call <id> <method> [json-args]` — all commands in the discover→install→call code blocks exist verbatim.
- web4/cmd/pilotctl/appstore_sign.go: supervisor refuses to spawn an app whose manifest ed25519 store.signature doesn't verify; signing payload pins binary.sha256 + grants-sha256 → "manifest pins the binary's hash and carries a signature; the daemon re-checks both every time it spawns" (also `appstore audit` verify-fail/spawn events in help text).
- appstore.go help + appstore_metadata.go: grants/permissions declared in manifest and shown at view/install; sha256-pinned metadata → "grant-scoped", "signature-verified", "typed JSON in/out", auto-spawn by supervisor.
- Pre-verified cheatsheet + pilotctl skill doc: `<app>.help` discovery contract with methods, params, latency class (fast/med/slow) → runtime-discoverable + latency-class sentences.
- Pre-verified live stats (total_nodes 250,175): "243k+ agents already on the network" holds (243k+ ≤ 250,175; active_nodes 218,560 — claim reads as total).
- src/pages/publish.astro:32-40: valid email + one-time verification code, "you don't upload any code", "we build and sign the adapter", review-by-team flow, email status updates → all publish-flow sentences and FAQ answers match verbatim.
- Live URL: https://pilotprotocol.network/publish → 200.
- Site files: internal links /blog/ai-agent-app-store, /blog/mcp-plus-pilot-tools-and-network, /blog/overlay-network-ai-agents all exist in src/pages/blog/; banner public/blog/banners/build-agent-app-turn-api-into-tool.svg exists; canonical path matches.
- Example (not flagged): io.pilot.yourapp, yourapp.search '{"q":"example"}' — placeholder app IDs.
- Opinion (not flagged): "the difference that matters for adoption", method-design style advice framing.
