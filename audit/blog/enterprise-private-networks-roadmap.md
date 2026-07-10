# Claim audit: src/pages/blog/enterprise-private-networks-roadmap.astro
Audited: 2026-07-10 · Sentences examined: 46 · verified: 16 · false: 1 · unverifiable: 9 · opinion: 18 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 95 | "Wire Specification" → github.com/pilot-protocol/pilotprotocol/blob/main/docs/SPEC.md | curl returned HTTP 404; pre-verified: public pilotprotocol repo has no docs/SPEC*.md |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 19 | "three auto-approval paths (mutual, network-based, manual)" | Handshake auto-approval path taxonomy not confirmed in local daemon source within budget | Grep of handshake approval logic in daemon/plugins enumerating exactly three paths |
| 23 | "Two-tier SYN rate limiting" | SYN rate limiting exists (pkg/daemon zz_config_test.go, DefaultSYNRateLimit) but "two-tier" structure not confirmed | Source showing two distinct SYN limiter tiers |
| 30 | "We conducted a thorough audit across six enterprise dimensions." | Internal process claim; no artifact examined beyond the PDF's existence | The audit document contents |
| 34 | "the daemon's SYN handler accepts connections from any source that knows the endpoint" | Claim about a security gap at time of writing; current source has syn_trust_gate tests, historical state not checked | Git history of daemon SYN handler at March 2026 |
| 75 | "ONUG AOMC ... Six mandatory controls for agent security. After all phases, Pilot satisfies all six" | Third-party standard content + future compliance projection | ONUG AOMC spec text + shipped implementation |
| 76 | "CSA ATF/AICM ... revocation and quarantine (Phase 3)" | Third-party framework mapping, future projection | CSA framework docs + shipped phases |
| 40 | "There is no OIDC token validation, no SPIFFE SVID acceptance" (at time of writing) | Historical-state claim; the later blog post claims OIDC JWT validation shipped | Git history / registry source at March 2026 |
| 44 | "There is no admin-initiated mass revocation. There is no block list." | Registry server source not available locally | Registry source at March 2026 |
| 56 | "Webhook delivery becomes reliable with retry logic and monotonic event IDs" (planned) | Roadmap promise about registry behavior; registry source not local | Registry webhook delivery code |

## Verified claims (grouped by source)
- web4/pkg/daemon/tunnel.go: X25519 + AES-256-GCM tunnel encryption (line 534 "X25519+AES-256-GCM"), PILA frames (lines 172-236), stdlib crypto/ecdh (zero external deps for crypto)
- web4/pkg/daemon/daemon.go + zz tests: handshake on port 444 (daemon.go:3510), SYN rate limiting exists, 48-bit address (daemon.go:2541), Ed25519 node identity, node visibility (private/public) control, relay/beacon path
- web4/pkg/daemon + webhook module grep: 20+ distinct webhook event name strings (handshake_*, datagram.*, network.*, node.*, daemon.*)
- Local site files: /enterprise-readiness-report.pdf exists in public/, banner webp exists
- Pre-verified: github.com/pilot-protocol/pilotprotocol repo exists
- Positioning statements (A2A/MCP/Pilot roles), roadmap phase descriptions: counted as opinion/plan statements, not flagged
