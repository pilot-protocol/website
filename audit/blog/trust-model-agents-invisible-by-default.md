# Claim audit: src/pages/blog/trust-model-agents-invisible-by-default.astro
Audited: 2026-07-10 · Sentences examined: 108 · verified: 63 · false: 6 · unverifiable: 6 · opinion: 25 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 144 | Untrust example output: "Peer notified" | web4/cmd/pilotctl/main.go untrust help: "This does **not** notify the remote node — they will see connection failures on their next attempt to reach you." |
| 151 | "Peer notified -- the revoked peer receives a notification that the trust relationship has been terminated. It can clean up its own state and stop attempting reconnection." | Same evidence — the CLI explicitly documents no peer notification. |
| 95 | "An Ed25519 signature over the entire request, proving A controls the claimed identity" | handshake@v0.2.1/handshake.go:37: `Signature ... // Ed25519 sig over "handshake:<node_id>:<peer_id>"` — the signature covers only the node ID pair, not the entire request. |
| 102 | "The justification field is not just a comment -- it is a signed, auditable statement of intent… verified by the requester's cryptographic signature." | Same: the justification is NOT covered by the signature (sig is over "handshake:<node_id>:<peer_id>" only). |
| 181 | "Audit trail -- every handshake includes a signed justification." | Same: justification is transmitted but not signed. |
| 131 | "Auto-approve agents whose justification matches a specific pattern" | handshake@v0.2.1/handshake.go: auto-approve paths are sameNetwork (line 659), embedded trusted-agents, global TrustAutoApprove (daemon.go:120), and mutual (line 628). No justification-pattern rule exists. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 150 | "Active tunnel torn down -- …closed immediately. All in-flight connections are terminated." (and "three things happen atomically") | Untrust→tunnel-teardown path not located in audited source; atomicity unverified | Trust-removal code path in daemon/trust module |
| 63 | "There is no command and no API to retrieve a list of all registered agents." | CLI has no such command (pre-verified list), but registry server API surface was not audited | Registry RPC surface review |
| 45 | "If she is private, the server returns nothing… The requesting agent cannot distinguish between a private agent and a nonexistent one." | Registry-side lookup behavior for private agents not in audited source | Registry lookup handler |
| 108 | "The rendezvous server never sees the agents' private keys -- it only forwards signed messages." | Relay forwards requests, but "signed messages" overstates (see signature scope); server key-handling not audited | Registry relay code |
| 154 | "The instant the command runs, the peer is locked out. The next packet it sends will be rejected." | Consistent with untrust help ("future messages… blocked") but packet-level immediacy unmeasured | Integration test of post-untrust packet rejection |
| 35 | "In the human web, the equivalent problem… is consistently among the OWASP Top 10" | Broken access control is OWASP #1 (verified knowledge); "exposed API endpoints" framing is loose but essentially correct — counted verified; noted here only for the "faster" rhetorical claim that follows (opinion) | n/a |

## Verified claims (grouped by source)
- Google A2A spec (pre-cutoff knowledge): Agent Cards are JSON at /.well-known/agent.json advertising capabilities/endpoints; discovery-by-fetch over HTTP; open-ecosystem design. Comparison-table A2A/MCP rows (URL identity, HTTP auth, OAuth/API-key, token expiry, crawlable cards) consistent with published specs.
- web4/cmd/pilotctl/main.go: `handshake <node_id|hostname> [justification]` (line 932); `pending`, `approve`, `untrust`, `init`, `find` commands exist (pre-verified list + help text); resolve requires mutual trust (line 780: "is there mutual trust?"); `--public` daemon flag (line 2706) and set-public/set-private commands — private-by-default with explicit opt-in matches source; find looks up hostname in registry.
- handshake@v0.2.1/handshake.go: mutual simultaneous handshake auto-approval (lines 627–639: "Mutual! Auto-approve", gated on registry pubkey binding) — matches lines 132–135; same-network auto-approve (line 659) — matches line 130; Ed25519 signature verification on handshake messages (lines 509–546); handshake relayed via registry when peer unknown (daemon.go:5834–5840 ProcessRelayedRequest) — matches Step 3; justification field carried in requests and shown in pending (ipc.go:1969).
- web4/pkg/daemon/daemon.go:2541: network IDs occupy high 16 bits of 48-bit address — matches "same 16-bit network ID".
- web4/cmd/daemon/main.go:389: private key in ~/.pilot/identity.json — matches line 77.
- RFC 8032 / Go stdlib (knowledge): Ed25519 deterministic signatures, 32-byte public keys, 64-byte signatures, fast verification, Go crypto/ed25519 in stdlib — lines 82–86 all correct.
- Untrust semantics (main.go help): trust pair removed, future messages blocked until new handshake — supports line 149 and "revocation is local".
- Local site: /docs/trust (src/pages/docs/trust.astro) and /blog/how-ai-agents-discover-each-other exist; banner webp exists; github.com/pilot-protocol/pilotprotocol exists (pre-verified).
- OWASP (knowledge): broken access control / exposed endpoints consistently in OWASP Top 10.
- Opinion (not flagged): "This is intentional," blast-radius commentary, "no protocol is universally better," cross-company workflow narrative, compliance framing (GDPR/HIPAA/SOC 2 requirements described generically — accurate), CTA copy.
- Example (not flagged): alice/bob addresses, 203.0.113.42 (RFC 5737 range), Q1 analytics justification, terminal outputs (except "Peer notified" — flagged FALSE above).
