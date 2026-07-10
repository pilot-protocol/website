# Claim audit: src/pages/blog/overlay-network-ai-agents.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 51 · false: 3 · unverifiable: 2 · opinion: 4 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 58 | "The daemon itself is written in Go with zero external dependencies — just the standard library" | web4 go.mod requires github.com/coder/websocket v1.8.15 plus 14+ pilot-protocol modules (app-store, beacon, common, skillinject, …). Not standard-library-only. |
| 118 | FAQ: "The daemon is written in Go with zero external dependencies (standard library only)" | Same evidence — go.mod require block. |
| 81-82 | `pilotctl appstore install cosift` / `appstore call cosift cosift.help` | CLI help: "install by catalogue ID" (main.go:1536); catalogue ID is `io.pilot.cosift` (src/data/apps.ts:1000ff). Short id `cosift` is not the catalogue ID; no short-alias resolution found. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 84 | "bring an existing app or API, and the platform generates and signs the adapter" | Adapter auto-generation behavior not confirmable from local sources (publish page exists, 200) | Publisher pipeline source or a live publish run |
| 84 | "wallet (on-overlay USDC)" and specific one-line app descriptions matching live behavior | App ids exist in apps.ts (io.pilot.wallet etc.) but functional descriptions (e.g. USDC, "smart-money signals") not independently checked beyond taglines | apps.ts taglines/descriptions per app (partially checked: cosift, sixtyfour, smol, aegis, miren match) |

## Verified claims (grouped by source)
- Pre-verified cheatsheet + live stats: "243k+ agents and users" (total_nodes 250,175 ≥ 243k, live 2026-07-10); SDKs Go/Python(PyPI pilotprotocol)/Node/Swift; pilot-mcp repo exists; service agents auto-approve queries; repos pilot-protocol/* exist
- web4 pkg/daemon/tunnel.go:534 + go.mod beacon module: encrypted UDP tunnels X25519 + AES-GCM; STUN + hole-punching + relay (beacon) fallback
- web4 LICENSE: AGPL-3.0; go.mod: written in Go
- web4 cmd/pilotctl/main.go: `pilotctl daemon start` (:1677), `pilotctl info`, `handshake <hostname> [justification]` (:932), `send-message list-agents --data '/data {...}' --wait` (:860,846), `appstore catalogue` (AppStoreHelpText)
- app-store@v1.0.2 pkg/manifest/manifest.go:70-108: manifest pins binary sha256 + ed25519 publisher key + store signature — "sha256 hash and ed25519 signature" claim
- Live URLs (200): pilotprotocol.network/install.sh, /docs, /publish; local: src/pages/plain/ exists (plain-text mirror), banner overlay-network-ai-agents.svg exists
- website src/data/apps.ts: io.pilot.{aegis,cosift,sixtyfour,miren,plainweb,slipstream,smol,wallet} all present ("Smol Machines" = microVMs tagline)
- General/architecture statements (permanent address, trust decoupled from membership, per-peer handshake): consistent with handshake plugin + docs/comparison-networking.astro

OPINION: "earns its keep", "neither approach is wrong", VPN-comparison framing rows characterizing Tailscale/Nebula/ZeroTier trust models (general characterization, accepted).
EXAMPLE: search "weather" query, install snippet placeholders.

## Resolutions (2026-07-11 iter 52)
- L58/L118 ("zero external dependencies — standard library only"): web4 go.mod requires coder/websocket + pilot modules. Both spots reworded to "single static binary (CGO-free)".
- L81-82 (appstore install/call cosift — short id): catalogue id is io.pilot.cosift; short id doesn't resolve. Fixed both to io.pilot.cosift.
Build: npm run build green (345 pages).
