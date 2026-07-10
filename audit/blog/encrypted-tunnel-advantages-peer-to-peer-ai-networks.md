# Claim audit: src/pages/blog/encrypted-tunnel-advantages-peer-to-peer-ai-networks.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 56 · false: 0 · unverifiable: 6 · opinion: 17 · example: 9

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 37 | "NAT traversal techniques like UDP hole-punching enable 70% direct connectivity..." | Third-party stat with no benchmark; sourced only from privateproxyguide.com (a VPN affiliate blog) | A published measurement study (e.g. libp2p/Tailscale NAT traversal telemetry) |
| 103 | "NAT traversal with relay fallback achieves about a 70% success rate in P2P environments..." | Same unbenchmarked 70% figure; cited source (privateproxyguide.com/decentralized-vpns/, HTTP 200) is not a primary measurement | Primary NAT-traversal success-rate data |
| 112 | "Statistic: Direct P2P tunnel connections succeed in roughly 70% of NAT scenarios." | Repeats the same third-party stat, presented as a hard statistic | Same as above |
| 225 | FAQ: "...with roughly 70% direct success and relay fallback covering the remaining cases..." | Same 70% figure | Same as above |
| 200 | "WireGuard's fixed cryptography ... stores recent peer IPs in memory, which can be mitigated with double-NAT." | Peer-endpoint-in-memory is real WireGuard behavior, but "mitigated with double-NAT" is an odd unsourced mitigation claim | WireGuard security analysis documenting the mitigation |
| 181 | Table row: "Peer IP stored in memory / Medium / Use double-NAT or ephemeral environments" | Same unsourced double-NAT mitigation | Same as above |

## Verified claims (grouped by source)
- WireGuard whitepaper / well-known protocol facts: Curve25519 key exchange, ChaCha20 encryption, Poly1305 MAC, kernel-module implementation, UDP-only transport, fixed cipher suite (no negotiation/downgrade), minimal config vs IPSec, no built-in key rotation, ChaCha20 faster than AES without AES-NI (lines 38, 93, 119, 154, 164-165, 194-196, 200, 205, 226-229).
- Live URL checks (curl 2026-07-10): privateproxyguide.com/wireguard-explained/ 200; privateproxyguide.com/decentralized-vpns/ 200; deepwiki.com WireGuard-Guide 200; all three Supabase blog images 200 (lines 8, 31, 93, 103, 118, 154, 219).
- Internal links vs src/pages/blog/**: protocol-wrapping…, zero-dependency-encryption…, nat-traversal-ai-agents-deep-dive, decentralized-networking…, connect-agents-across-aws-gcp-azure…, http-services-over-encrypted-overlay, how-pilot-protocol-works, connect-ai-agents-behind-nat-without-vpn, ai-networking-challenges…, ai-networking-terminology…, secure-network-infrastructure… all exist (lines 98, 114, 165, 209, 215, 232-235).
- web4 source / pre-verified: Pilot handles encrypted tunnels, NAT traversal, virtual addressing, relay fallback (pkg/daemon, -encrypt X25519+AES-256-GCM, relay via beacon); SDKs for Python and Go + unified CLI (sdk-python repo, common/driver, pilotctl); wrapping HTTP/gRPC/SSH via TCP port mapping (pilotctl map/gateway, cmd/pilotctl/main.go:1690,1706) (lines 218, 220).
- Local site assets: banner public/blog/banners/…jpg exists; canonicalPath matches page path (lines 243-244).
- General networking facts (TLS/crypto textbook level): confidentiality/integrity/authentication definitions, MAC tamper-drop, zero-trust framing, NAT blocking inbound by default (lines 86-97, 102, 223).

Opinion/example items: TL;DR marketing framing, "Pro Tip" advice, qualitative CPU-overhead comparison table (WireGuard Low / OpenVPN Medium / IPSec High — directionally supported but qualitative), deployment sequence steps, JSON-LD boilerplate, image alt text.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
