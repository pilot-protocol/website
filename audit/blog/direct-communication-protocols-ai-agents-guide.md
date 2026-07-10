# Claim audit: src/pages/blog/direct-communication-protocols-ai-agents-guide.astro
Audited: 2026-07-10 · Sentences examined: 102 · verified: 78 · false: 3 · unverifiable: 8 · opinion: 8 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 157 | "Pilot is written in Go with zero external dependencies (stdlib only)" | web4/go.mod requires github.com/coder/websocket, expr-lang/expr, golang.org/x/sys, golang.org/x/net plus 16 pilot-protocol modules — not stdlib-only |
| 161 | "Apps include AEGIS (security), cosift (image signing), sixtyfour (base64 codec), miren (DNS), otto (automation), plainweb (static serving), slipstream (streaming), smolmachines (small model inference), and wallet (key management)." | src/data/apps.ts taglines: cosift = grounded web search/research (not image signing); sixtyfour = people/company intelligence (not base64); miren = PaaS operations (not DNS); plainweb = web page → Markdown (not static serving); slipstream = Polymarket smart-money signals (not streaming); smol = hardware-isolated microVMs (not model inference); wallet = on-overlay USDC payments (not key management). Only AEGIS (security) and otto (browser automation) are roughly right |
| 172 | `pilotctl call plainweb '{"action":"serve","dir":"/var/www"}'` | No top-level `call` subcommand (pre-verified dispatch list; `call` exists only under `appstore`: main.go:2403 `appstore call <id> <method> [json-args]`); invocation shape (method arg) and the serve/dir payload don't match plainweb's actual purpose |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 151 | "Most agent-to-agent connections punch through NAT without a relay." | No published Pilot traversal statistics | Network telemetry |
| 191 | "Most production deployments that need to work across clouds ... end up running Pilot as the network layer" | Market adoption claim, no source | Deployment data |
| 46 | "The set of AI agent communication protocols that emerged between 2024 and 2026 each solves a different slice of this problem." | Timeline generalization | Protocol release dates |
| 27/133 (FAQ + body) | "ACP is a Linux Foundation / BeeAI open standard" | Third-party governance detail not checked live | agentcommunicationprotocol docs |
| 31/139 | ANP scope/DID claims | Third-party spec not checked live | agent-network-protocol repo/spec |
| 169 | `pilotctl appstore install plainweb` (short id) | appstore install exists (appstore.go:70) but whether the short id resolves vs io.pilot.plainweb unconfirmed | Running the command |
| 197 | "have your first agent connected in minutes" | Timing claim | Timed install |
| 202 | GitHub repo "has ... integration guides for MCP and A2A" | A2A integration guide presence in repo not confirmed | Repo listing |

## Verified claims (grouped by source)
- web4 go.mod + LICENSE: written in Go (go 1.25); AGPL-3.0 licensed; rendezvous + nameserver modules exist (Discovery claim)
- protocol@v1.10.5/address.go: 48-bit persistent virtual address
- web4 pkg/daemon/tunnel.go:534: encrypted UDP tunnels, X25519 + AES-GCM; userspace reliability over UDP
- handshake@v0.2.1 + daemon.go:1121: explicit per-peer mutual approval; network membership ≠ trust; private by default
- Pre-verified: STUN + hole-punch + relay-fallback three-tier NAT traversal; SDKs Go/Python(pilotprotocol on PyPI)/Node/Swift all exist; TeoSlayer/pilot-mcp bridge exists; install.sh URL live; github.com/pilot-protocol org exists
- Live stats (pre-verified 2026-07-10): total_nodes 250,175 → "Over 243k+ agents and users run on the network today" holds
- web4 cmd/pilotctl/appstore.go:56-82: `pilotctl appstore list`, `install`, `catalogue` subcommands exist; apps run as auto-spawned typed IPC services (app-store module)
- src/data/apps.ts: all nine named apps exist in the catalogue (names correct; descriptions audited above)
- Pre-cutoff public knowledge: MCP = Anthropic, JSON-RPC 2.0 over stdio/SSE, client-server tool access, no NAT traversal; A2A = Google, Agent Cards at /.well-known/agent.json, HTTP/JSON-RPC, SSE streaming, requires reachable endpoints; DIDs = W3C decentralized identifiers
- Local files: banner direct-communication-protocols-ai-agents-guide.svg exists; canonicalPath matches
