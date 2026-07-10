# Claim audit: src/pages/blog/why-ai-agents-need-network-stack.astro
Audited: 2026-07-10 · Sentences examined: 78 · verified: 58 · false: 2 · unverifiable: 8 · opinion: 10 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 130 | "Pilot Protocol is open source (AGPL-3.0), written in pure Go, and has zero external dependencies." | web4/go.mod requires github.com/coder/websocket v1.8.15 (third-party) plus ~15 pilot-protocol modules. AGPL-3.0 and pure Go are true; "zero external dependencies" is not. |
| 141 | "Open source. Pure Go. No external dependencies. One binary." | Same evidence: go.mod lists github.com/coder/websocket and other module dependencies. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 20 | "88% of networks involve NAT. This number comes from measurements of real-world networks across ISPs, enterprises, and mobile carriers." | No primary citation; figure repeats site-wide but no external source given | Citation to the underlying NAT measurement study |
| 30 | "45.6% of organizations use shared API keys for agent-to-agent communication, according to industry surveys." | "Industry surveys" unnamed; cannot confirm | Named survey with link |
| 32 | "Non-human identities now outnumber human identities 100:1 in enterprise environments." | Vendor-report-style stat, no citation | Named report (e.g. CyberArk) with link |
| 62 | "Measurements show that multi-agent systems use up to 15x more tokens for coordination overhead compared to the actual task content." | "Measurements" unattributed | Citation to the study (e.g. Anthropic multi-agent research) |
| 125 | Callout: "88% of networks have NAT. 45.6% use shared API keys. Non-human identities outnumber humans 100:1. Multi-agent coordination costs 15x in token overhead." | Repeats the four uncited stats above | Same citations |
| 84 | "There are no unencrypted modes." | Tunnel path always runs X25519/AES-GCM key exchange (pkg/daemon/keyexchange), but absence of any plaintext mode across the whole surface not exhaustively confirmed | Code audit confirming no cleartext transport path |
| 64 | "An agent can send a small delta ('anomaly count updated to 48') instead of re-serializing the entire context." — framing that this yields ~1x vs 15x overhead (line 66) | The 15x-vs-1x comparison is an unbenchmarked projection | A published token-overhead benchmark |
| 88 | "Trust can be revoked instantly." | untrust command exists (main.go:1787); "instantly" timing unbenchmarked | Measured revocation-to-disconnect latency |

## Verified claims (grouped by source)
- web4 source: 48-bit virtual address (pkg/daemon/daemon.go:2541); X25519 ECDH + HKDF-SHA256 → 32-byte key → AES-256-GCM (pkg/daemon/keyexchange/derive.go:33-60) (84); single bound UDP socket with multiplexed tunnels (pkg/daemon/daemon.go:146, udpio.Listen) (52, 54); STUN/beacon endpoint discovery, hole punching, relay fallback all present in pkg/daemon (80); handshake with justification (main.go:932 "handshake <node_id|hostname> [justification]") and mutual approval (88); untrust exists (91→n/a this page; 88); private-by-default visibility — daemon only calls SetVisibility(true) when config.Public (daemon.go:1121) (88).
- common@v0.5.0/crypto/identity.go:25 ed25519.GenerateKey — Ed25519 keypair identity (34).
- Pre-verified: well-known ports echo 7, data exchange 1001, event stream 1002 (94).
- web4/LICENSE: AGPL-3.0 (130, partial); go.mod `go 1.25.11` — pure Go (130, partial).
- Arithmetic: N(N-1)/2 → 45 / 4,950 / 499,500 for 10/100/1,000 agents (40); TCP 1.5 RTT, TLS 1-2 RTT (45-46) — standard.
- Public specs: A2A Agent Cards at well-known HTTP endpoints, JSON-RPC over HTTP + SSE (a2a-protocol.org, 200) (4, 14); MCP transports stdio + HTTP/SSE (modelcontextprotocol.io, 200) (16); jsonrpc.org, crewai.com, tailscale.com all 200 (4, 98).
- Local links: how-pilot-protocol-works, trust-model-agents-invisible-by-default, build-multi-agent-network-five-minutes, /blog/move-beyond-rest-persistent-connections-for-agents, /blog/lightweight-swarm-communication-drones-robots, /blog/smart-home-without-cloud-local-device-communication all exist in src/pages/blog; /docs/concepts and /docs/integration exist; github.com/pilot-protocol/pilotprotocol pre-verified repo; banner .webp exists.
- Opinion (not flagged): "It is not.", 1990s TCP/IP analogy, "identity is in worse shape", "staggering", Tailscale analogy framing, "The application layer cannot solve these problems", CTA copy.

## Resolutions (2026-07-11 iter 55)
- L130/L141 ("zero external dependencies" / "No external dependencies"): web4 go.mod requires coder/websocket + pilot modules. AGPL + Go kept; reworded to "ships as a single static binary" / "One static binary".
Build: npm run build green (345 pages).
