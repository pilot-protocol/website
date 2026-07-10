# Claim audit: src/pages/blog/a2a-agent-cards-over-pilot-tunnels.astro
Audited: 2026-07-10 · Sentences examined: 72 · verified: 49 · false: 4 · unverifiable: 4 · opinion: 4 · example: 11

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 8 (also 142, 229, 253) | "Agent Cards are served at <code>/.well-known/agent.json</code>." | Live A2A spec (https://a2a-protocol.org/latest/specification/, HTTP 200) uses `agent-card.json` exclusively — 5 occurrences of `agent-card.json`, zero of `agent.json`. |
| 87 | `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` | Pre-verified: public pilotprotocol repo has NO pkg/driver. Go SDK is github.com/pilot-protocol/common/driver (common@v0.5.0/driver/driver.go). |
| 171 | `drv.ListenAndServeHTTP(80, http.DefaultServeMux)` | No such method on Driver — full method list in common@v0.5.0/driver/driver.go (Dial, Listen, SendTo, Info, Handshake, …); no HTTP serving helper exists. |
| 244 (also 263) | `pilotctl peers --search "task-ready"` presented as a registry capability query returning `capabilities=[task-ready]` | web4/cmd/pilotctl/main.go:1552, 4948-4964: `--search` filters by node-ID substring (or hostname), not capability tags; peers output has no `capabilities` field. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 22 | "Registry (capability flags + metadata)" | No "capability flags" concept found in web4 or protocol module source (only tags/hostname via set-tags) | A registry schema in pkg/ defining capability flags |
| 71 | "Pilot's registry already stores capability metadata for every registered agent … task-ready capabilities" | Same — registry stores tags/hostname; "task-ready capability" not found in source | Source showing capability advertisement in registry records |
| 158, 230 | JSON-RPC methods `tasks/send` / `tasks/get` | Current A2A spec uses `message/send`; `tasks/send` is a legacy method I could not confirm on the live spec page | Archived early-2025 A2A spec showing tasks/send |
| 231 | "Pilot's sliding window transport guarantees ordered delivery of every event." | Sliding-window code exists (web4/pkg/daemon/ports.go) but "guarantees ordered delivery of every event" is an absolute reliability claim with no test/benchmark cited | Protocol spec/test asserting ordered-delivery guarantee |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/packet.go:23: 34-byte binary header.
- protocol@v1.10.5/pkg/protocol/header.go:43-45: PortHTTP = 80 ("Pilot's HTTP port"), PortEcho = 7.
- protocol@v1.10.5/pkg/protocol/address.go:12-14: 48-bit virtual address (2 bytes network + 4 bytes node); address format `N:XXXX.XXXX.XXXX` matches daemon test fixtures ("0:0000.0000.0063").
- web4/pkg/daemon/keyexchange/derive.go, keyexchange.go: X25519 + AES-256-GCM encryption, Ed25519-authenticated handshake (note: source says Ed25519 auth is "optional").
- web4/pkg/daemon/daemon.go:96,749 + relay-fallback tests: STUN discovery, hole-punch, relay tiers.
- common@v0.5.0/driver/driver.go:62,211: driver.Connect("/tmp/pilot.sock"), drv.Info() exist; Handshake/SetVisibility support trust-gated, private-by-default claims.
- Pre-verified cheatsheet: `pilotctl connect` exists; -transport default udp; GitHub repo pilot-protocol/pilotprotocol exists; socket /tmp/pilot.sock.
- Live URLs (HTTP 200): a2a-protocol.org (A2A = Google-originated protocol, JSON-RPC 2.0, SSE streaming, Agent Cards), jsonrpc.org.
- Local site files: all internal hrefs (/blog/trust-model-agents-invisible-by-default, nat-traversal-ai-agents-deep-dive, how-pilot-protocol-works, mcp-plus-pilot-tools-and-network, why-ai-agents-need-network-stack) exist in src/pages/blog; banner public/blog/banners/a2a-agent-cards-over-pilot-tunnels.webp exists.
- EXAMPLE items (not flagged): Agent Card JSON sample, Go code structure, demo addresses 1:0000.0042.00A1/00B3/00C7, research-agent.example.com.
