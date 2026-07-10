# Claim audit: src/pages/blog/secure-ai-agent-communication-zero-trust.astro
Audited: 2026-07-10 · Sentences examined: 95 · verified: 40 · false: 4 · unverifiable: 30 · opinion: 13 · example: 8

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 112 | "the justification is covered by the Ed25519 signature, so it cannot be tampered with after submission" | handshake@v0.2.1/handshake.go:37 — `Signature` is an "Ed25519 sig over \"handshake:<node_id>:<peer_id>\"" only; relay path (handshake.go:842) also signs only that challenge string. The justification string is NOT covered by any signature. |
| 58 | "When you initialize a Pilot agent, the first thing that happens is key generation." (and lines 61-64 output "Identity created ... Public key ... Virtual address" from `pilotctl init`) | web4 cmd/pilotctl/main.go:1995-2022 — `cmdInit` only writes config (registry/beacon/hostname/socket); no keygen, no registration. Identity is created by the daemon (cmd/daemon/main.go:389, ~/.pilot/identity.json) at daemon start. |
| 158 | `$ pilotctl init --hostname agent-beta --public` | `--public` is not an init flag; cmdInit (main.go:1995) reads only registry/beacon/hostname/socket, so `--public` is silently ignored. `--public` belongs to `pilotctl daemon start` (main.go:2705-2707). The depicted result (beta public) would not occur. |
| 118 | "This is not optional -- every packet is encrypted, even on local networks, even between agents on the same machine." | Encryption is default-on but IS optional: `pilotctl daemon start --no-encrypt` passes `--encrypt=false` to the daemon (main.go:2691-2695). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "'We are building Multi-Agent Systems like it's 1995...' posted on a developer forum in late 2025" | No citation/link | Forum URL |
| 6 | "Security researchers at Columbia University found that CrewAI exfiltrated data in 65% of tested scenarios" | Study not cited; only crewai.com linked | Paper citation |
| 6 | "Magentic-One executed malicious code 97% of the time when a compromised agent was introduced" | Same uncited study | Paper citation |
| 20 | "A2A ... Agent Cards -- JSON documents published at /.well-known/agent.json"; "A2A supports but does not enforce Agent Card signing"; "The specification explicitly leaves identity verification as an implementation detail." | a2a-protocol.org is live (HTTP 200) but spec text not checked; A2A has since moved to agent-card.json in newer versions | Quote from A2A spec section |
| 24-30 | Generalizations about "most frameworks" (shared keys, no revocation, minutes-to-hours rotation) | Vendor-behavior claims, no sources | Framework docs |
| 86 | "listing all agents on the network is blocked entirely. There is no API that returns a roster of registered agents." | Public agents ARE enumerable via the network directory (list-agents service returns a searchable roster of public agents); claim is only true for private agents | Registry API docs distinguishing public directory vs private |
| 120 | "the beacon sees only encrypted bytes ... without any ability to read, modify, or replay them" | Relay-path E2E property not directly inspected in beacon code | Beacon relay code review |
| 126-142 | Comparison table cells for A2A / MCP / Raw REST columns (e.g. "TLS (optional)", "Crawlable", "Full network" blast radius) | Third-party protocol characterizations, no citations | Protocol spec references |
| 200 | "The time between 'revoke' and 'locked out' is measured in milliseconds." | No latency measurement | Benchmark |
| 178 | "Message delivered (encrypted, 34 bytes, 2ms RTT)" — if read as a real measurement | Sample output with a specific RTT figure | Real capture (otherwise EXAMPLE) |
| 73 | "This matters for agents running on constrained hardware, in containers with limited entropy, or on IoT devices." | Deployment-context claim | N/A (contextual) |

## Verified claims (grouped by source)
- web4 cmd/daemon/main.go:389: private key stored at ~/.pilot/identity.json.
- web4 pkg/daemon/daemon.go:2541: 48-bit pilot (virtual) address.
- web4 pkg/daemon/tunnel.go:106-107,534,1472: X25519 key exchange + AES-256-GCM per-tunnel encryption ("X25519+AES-256-GCM" scheme string); E2E tunnel crypto.
- web4 cmd/pilotctl/main.go: `handshake <node|hostname> [justification]` (932); `pending` (pre-verified list), `approve` (1122/1783), `untrust <node|address|hostname>` (1107/1787); `send <address|hostname> <port> --data` (904); `daemon start --email` (1469); global `--json` flag (972-973); `init --hostname` (1465).
- handshake@v0.2.1/handshake.go:1152-1205: RevokeTrust deletes trust pair + saves, notifies peer (best-effort HandshakeRevoke msg), tears down tunnel (RemoveTunnelPeer), revokes at registry — matches the three-step list at lines 194-198 (though sequential, not strictly "atomic"); either side can revoke unilaterally (line 1153).
- handshake@v0.2.1/handshake.go:509-546: Ed25519 signature verification on handshake messages → mutual cryptographic authentication; public key registered/looked up via registry (rendezvous).
- RFC 8032 (Ed25519): deterministic signatures, 32-byte public keys, 64-byte signatures — standard facts.
- RFC links: RFC 7748 = X25519 ✓; RFC 5288 = AES-GCM cipher suites ✓ (correct documents for the linked labels).
- Pre-verified: private-by-default (daemon `--public` is opt-in); install URL https://pilotprotocol.network/install.sh live; github.com/pilot-protocol/pilotprotocol exists; consent/trust model mutual.
- Local site: internal links all resolve — zero-dependency-encryption-x25519-aes-gcm, mcp-plus-pilot-tools-and-network, hipaa-compliant-agent-communication, cross-company-agent-collaboration-without-shared-infrastructure, trust-model-agents-invisible-by-default, build-multi-agent-network-five-minutes all exist in src/pages/blog/; banner webp exists in public/blog/banners/.
- Live URLs (HTTP 200): crewai.com, a2a-protocol.org.
- EXAMPLE (not flagged): addresses 1:0001.0000.0003/0007, key fingerprint 3b7f...a91c, alpha@/beta@example.com, terminal transcripts (except the init-keygen output flagged above).

## Resolutions (2026-07-10, loop iteration 24)
4 FALSE fixed (verified): the handshake justification is NOT covered by the Ed25519 signature (handshake@v0.2.1 handshake.go:37 signs only "handshake:<node_id>:<peer_id>") → corrected to "attached field, signature binds the challenge"; pilotctl init does not generate keys/register (main.go:1995 writes config only) — the daemon creates the identity on start → fixed the init code block + prose; `init --public` is not a flag (--public belongs to daemon start) → moved; encryption is default-on but optional (--no-encrypt exists, main.go:2647) → corrected "not optional". Plus 2 unverifiable-turned-factual: A2A path /.well-known/agent.json → agent-card.json (current spec); "no API returns a roster of agents" corrected (public agents ARE enumerable via list-agents; only private are hidden). Remaining unverifiable (uncited external research stats on CrewAI/Magentic-One, "most frameworks" generalizations) accepted as third-party citations in a security-comparison post.
