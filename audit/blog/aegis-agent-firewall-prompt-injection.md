# Claim audit: src/pages/blog/aegis-agent-firewall-prompt-injection.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 40 · false: 4 · unverifiable: 1 · opinion: 8 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 45-60, 142, 160, 189 | All commands using app id `aegis` (`pilotctl appstore view aegis`, `install aegis`, `call aegis …`) | Live CLI (2026-07-10): `pilotctl appstore view aegis` → `error: app "aegis" not found in catalogue or install root`. Catalogue id is `io.pilot.aegis` (src/data/apps.ts; live `appstore list`). |
| 57 | "the primary method is <code>aegis.inspect</code> — a fast, synchronous check" | Live `pilotctl appstore call io.pilot.aegis aegis.help '{}'` lists only aegis.scan, aegis.health, aegis.status, aegis.help. apps.ts adds scan/status/targets/config/version/exec/help. No `aegis.inspect` anywhere. |
| 60-63 | Inspect call with `{"content": …, "context": "web_retrieval"}` | Live app rejects `content` ("error: … text is required"); real param is `text`, real method is `aegis.scan`. |
| 65 (also 83, 146) | "a verdict (<code>pass</code>, <code>flag</code>, or <code>block</code>), a threat category if applicable, and a confidence signal" | Live `aegis.scan` returns `{"verdict":"allow","rule":"","blocked":false,"latency":"19.1ms"}` — verdict vocabulary is allow/block; no `pass`/`flag`, no category, no confidence field. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 167 | "the store handles the adapter, signing, and distribution to 243k+ agents" | Live stats (pre-verified 2026-07-10): active_nodes 218,560; total_nodes 250,175 — 243k matches neither figure | A dated stats snapshot showing ~243k for whichever metric is meant |

## Verified claims (grouped by source)
- Live daemon (pilotctl appstore, 2026-07-10): io.pilot.aegis installed and callable; `aegis.help` returns methods with kind + latency class (fast) — matches "help returns every method with … latency class (fast/med/slow)"; `appstore catalogue`/`list`/`install` loop works as described.
- src/data/apps.ts (io.pilot.aegis entry): Rust binary (L1 Aho-Corasick pure Rust), fully offline / no network (L2 local Qwen3-1.7B via llama.cpp), blocks prompt injection/jailbreaks/impersonation, HMAC-chained audit log — supports "offline Rust binary", "no external API call", offline claims (lines 6, 28, 133, FAQ).
- src/data/apps.ts: cosift, otto, plainweb, io.pilot.smol ("Smol Machines", microVMs), sixtyfour (people/company intelligence), miren (PaaS deploy), wallet (on-overlay USDC), slipstream (Polymarket smart-money signals) all exist with matching descriptions (line 120-129 list).
- web4/cmd/pilotctl/appstore.go:739,965,1435 + appstore_catalogue.go:13-29: binary sha256 pinned and re-verified on every respawn; manifest carries ed25519 signature — supports "signature-verified at spawn" (line 31).
- apps.ts grants field + wallet description ("caps declared in the manifest are reviewed at install time"): grant-scoped permissions at install (line 32).
- Pre-verified: install command `curl -fsSL https://pilotprotocol.network/install.sh | sh` (installer live); apps run locally on daemon (app-store IPC model).
- Live URLs (HTTP 200): pilotprotocol.network, pilotprotocol.network/publish; local page src/pages/publish.astro exists; banner .svg exists in public/blog/banners.
- General security content (direct vs indirect injection definitions, jailbreak description, defense-in-depth, FAQ definitions): standard, internally consistent — verified as accurate domain description / opinion where hortatory.
- EXAMPLE (not flagged): hostile-page payload text, attacker.com sample, python safe_retrieve snippet structure (its API fields covered by FALSE rows above).

## Resolutions (2026-07-11 iter 48) — re-verified against the live app 2026-07-11
- L45-60/77/142/160/189 (app id "aegis"): corrected to io.pilot.aegis in every appstore view/install/call (bare "aegis" is not a catalogue id).
- L57/L60/L77 (aegis.inspect — no such method): live aegis.help lists scan/health/status/help. Changed to aegis.scan.
- L60-63/L78 (param "content" + "context"): live scan requires `text`. Changed to {"text": ...}, dropped the bogus context field.
- L23/L65/L84 (verdict "pass/flag/block" + category + confidence): live aegis.scan returns {"verdict":"allow|block","rule":"","blocked":false,"latency":"..."}. Corrected verdict vocabulary to allow/block, fields to rule/blocked/latency, and log.get('category')→get('rule').
- L167 ("243k+ agents"): stale (matches neither active 218k nor total 250k). Reworded to "distribution across the Pilot network".
Build: npm run build green (345 pages).
