# Claim audit: src/pages/blog/web-search-api-for-ai-agents-grounded-research.astro
Audited: 2026-07-10 · Sentences examined: 56 · verified: 44 · false: 0 · unverifiable: 2 · opinion: 8 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 89 | "The manifest pins a hash and signature the daemon re-checks on every spawn" | Install-time signature gate + sha256 verify confirmed (web4 cmd/pilotctl/appstore.go:873,1057), but "re-checks on every spawn" not found in source | Supervisor spawn-path code in app-store module showing per-spawn integrity re-verification |
| 44 | "The daemon fetches the bundle, verifies its signature and hash against the manifest, requests the permissions the app declares, and auto-spawns it" — the auto-spawn + permission-request sequence | Signature/hash verify confirmed in appstore.go; the exact permission-prompt-then-auto-spawn sequence lives in the app-store module (v1.0.2 dep), not inspected | github.com/pilot-protocol/app-store supervisor source |

## Verified claims (grouped by source)
- Live `pilotctl appstore view io.pilot.cosift` (2026-07-10): cosift exists as grounded web search/research app; methods cosift.search / find_similar / contents / answer / research / stats / health / help; MIT; vendor Pilot Protocol; catalogue-listed; state ready.
- Live `pilotctl appstore call io.pilot.cosift cosift.help '{}'`: help is a runtime discovery contract returning methods, params, latency classes fast (<~1s) / med (~1-5s: LLM rerank, single-pass synthesis) / slow (~5-30s: multi-step research); search params q/k/rerank/retriever with bm25|dense|hybrid; answer takes q and returns grounded cited answer (~3s); research is slow multi-step; "stateless adapter" to backend https://cosift.pilotprotocol.network — confirms lines 28, 49, 52-57, 64-75, 87, and FAQ answers 104, 108, 112, 116.
- web4 cmd/pilotctl/appstore.go: subcommands catalogue/view/install/list/call all exist (lines 56-82); catalogue path runs signature gate; sha256 bundle verify — confirms all terminal commands (37-51, 66, 71) and FAQ 112.
- Live `pilotctl appstore catalogue`: io.pilot.plainweb exists, "plain Markdown" retrieval — confirms line 80 chaining example.
- Pre-verified live stats: total_nodes 250,175 — supports "243k+ agents" (line 92).
- curl 200: https://pilotprotocol.network/app-store (line 98); banner /blog/banners/web-search-api-for-ai-agents-grounded-research.svg exists in public/.
- General/textbook: BM25 vs dense retrieval tradeoffs, hybrid retrieval + rerank + cited synthesis as known techniques (13, 24, 85); MCP characterization (92, FAQ 120) matches MCP spec.
- Opinion/marketing (not flagged): "purpose-built answer", "the mechanism matters as much as the tool", "pick the cheapest method", "this beats a raw search-API integration", CTA copy.
- Example (not flagged): sample queries "raft leader election", "What is HNSW?" — illustrative.
