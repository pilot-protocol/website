# Claim audit: src/pages/blog/cross-company-agent-collaboration-without-shared-infrastructure.astro
Audited: 2026-07-10 · Sentences examined: 108 · verified: 71 · false: 5 · unverifiable: 8 · opinion: 9 · example: 15

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 182 | Go import `github.com/pilot-protocol/pilotprotocol/pkg/driver` | web4 has no pkg/driver (confirmed `ls pkg/driver` -> missing); Go SDK is github.com/pilot-protocol/common/driver (pre-verified) |
| 186/201 | `driver.Connect()` (no args) and `d.SubmitTask(...)` | common@v0.5.0/driver/driver.go:62 `func Connect(socketPath string)`; no SubmitTask method exists anywhere in the driver package |
| 111 | "Requester's tags: Capability descriptors the other side can inspect" (handshake includes tags) | handshake@v0.2.1/handshake.go:35-37 — payload has only PublicKey, Justification, Signature; no tags field |
| 238-239 | "Events include: trust.request, trust.approve, trust.revoke, connection.open, connection.close, task.submit, task.complete" | No such event names anywhere in webhook@v0.2.0 or web4 pkg/cmd (grep for `(trust|connection|task)\.` found none) |
| 225 | "The key exchange happens during the secure handshake (port 443)" | Key exchange happens inside the UDP tunnel (pkg/daemon/keyexchange/, tunnel.go:534); TCP/443 is only the registry/beacon SNI compat path (pre-verified) |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 53 | Industry observer quote: "20 standards for the same need essentially results in no standards." | Unattributed quote, no source | A citation/link to the quote |
| 13 | "As of early 2026, there are four major proposals for how AI agents should communicate." | Count of "major" proposals is a judgment; no source | Industry survey citation |
| 38-50 | ACP creator "BeeAI (IBM)", ANP "ANP Working Group" rows | Third-party governance details not checkable locally | ACP/ANP official spec pages |
| 55 | "it is the reason cross-company agent collaboration has not happened at scale despite years of hype" | Causal market claim, no source | Market data |
| 159 | `pilotctl pending --json` (trailing --json flag placement) | Only global `pilotctl --json <cmd>` form seen in help (main.go:973); trailing form unconfirmed | Running the command |
| 243 | "One critique of application-layer agent protocols is that they create prompt injection attack surfaces." | Uncited third-party critique | Citation |
| 268 | "encrypted transport without TLS certificate management" framing vs A2A/MCP gaps | Comparative vendor-behavior claim | Protocol spec review |
| 6 | "This is the B2B integration pattern from 2010" | Historical characterization, no source | N/A (rhetorical) |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/address.go:12-14,70: 48-bit address, 2-byte network + 4-byte node, N:NNNN.HHHH.LLLL format
- web4 pkg/daemon/tunnel.go:534 + keyexchange/crypto.go:149: X25519 + AES-256-GCM tunnel encryption; random 4-byte nonce prefix per connection
- handshake@v0.2.1/handshake.go: Ed25519 identity keys, justification field, Ed25519 signature over handshake, mutual approve flow
- web4 cmd/pilotctl/main.go dispatch (~1620-1963) + pre-verified subcommand list: handshake, pending, approve, untrust, send, recv --from, send-message, network join, set-hostname, set-webhook, extras set-tags all exist
- web4 pkg/daemon/daemon.go:1121-1127: visibility only set public when config.Public — private by default; revoked/untrusted peers can't discover node
- Pre-verified: install URL https://pilotprotocol.network/install.sh live; registry does not relay traffic; STUN/hole-punch/beacon-relay three-tier NAT traversal; socket-based daemon
- web4 cmd/daemon + cmd/pilotctl: log/slog structured logging (grep confirmed)
- Public protocol docs (pre-cutoff knowledge): A2A = Google, HTTP+JSON-RPC, Agent Cards; MCP = Anthropic, stdio/SSE tool access
- gh pre-verified: github.com/pilot-protocol/pilotprotocol exists (CTA link)
- Local files: banner /blog/banners/cross-company-...webp exists; canonicalPath matches file
- EXAMPLE: addresses 1:0001.0000.0042 / 0017, JSON payloads, Go snippet flow, MSA date — illustrative
