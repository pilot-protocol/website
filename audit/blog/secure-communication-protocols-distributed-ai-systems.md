# Claim audit: src/pages/blog/secure-communication-protocols-distributed-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 95 · verified: 78 · false: 1 · unverifiable: 2 · opinion: 12 · example: 2

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 151 | "mTLS (RFC 8705) extends TLS for mutual authentication, which is essential for securing service mesh east-west traffic." | RFC 8705 is "OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens" — an OAuth profile, not an extension of TLS. Mutual authentication is native to TLS itself (RFC 8446 client certificates). Mislabeled RFC. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 77 | "Misconfigurations, poor key management, and protocol quirks...cause most security failures." | "Most" is an uncited statistical claim; no incident dataset referenced | A breach-report study (e.g. Verizon DBIR) citation |
| 233 | "MLS and mTLS with JWT claims are emerging as strong candidates for scalable, verifiable A2A communication." | Trend/adoption claim with no source | Industry adoption survey or standards-body statement |

## Verified claims (grouped by source)
- RFC 8446 (knowledge/pre-verified RFC): TLS 1.3 1-RTT handshake, (EC)DHE, AEAD AES-GCM/ChaCha20-Poly1305, HKDF schedule; 0-RTT early-data replay risk (sec. 8); server-only auth by default.
- RFC 4301 / RFC 9750: IPsec AH/ESP IP-layer security; MLS group messaging, FS+PCS, dynamic membership (note: MLS protocol proper is RFC 9420; 9750 is the MLS architecture doc — cited link andrew-scott.co.uk/docs/rfc-pdf/rfc9750.pdf returns 200).
- wireguard.com published benchmarks (well-known): WireGuard Noise framework, fixed primitives, UDP-only, ~1011 Mbps vs OpenVPN 258 Mbps → "900+ Mbps, 2–4x OpenVPN" consistent.
- NIST SP 800-207: zero-trust authenticate-every-request model.
- Live URL checks (HTTP 200, 2026-07-10): en.wikipedia.org/wiki/Communication_protocol, distributedsystemauthority.com, rfcinfo.com/rfc-8446, encryptionauthority.com, arxiv.org/abs/2508.01332 (title confirmed: "BlockA2A: Towards Secure and Verifiable Agent-to-Agent Interoperability"), testssl.sh, supabase image URLs.
- Local site files: internal blog hrefs (decentralized-communication-protocols-ai-developers, secure-ai-agent-communication-zero-trust, protocol-wrapping-secure-peer-to-peer-ai-systems, encrypted-tunnel-advantages-peer-to-peer-ai-networks, zero-dependency-encryption-x25519-aes-gcm, trust-model-agents-invisible-by-default, + 4 "Recommended" links) all exist in src/pages/blog/; /research/ietf/draft-teodor-pilot-problem-statement-01.html in public/; banner jpg in public/blog/banners/.
- web4 source (pre-verified + pkg/daemon/keyexchange/derive.go): Pilot Protocol virtual addresses, encrypted tunnels, NAT traversal, protocol wrapping (HTTP/gRPC/SSH), mutual trust model.
- Opinion/marketing (not flagged): "decisions...define resilience", pull quotes, "decentralized models are generally the stronger choice", Pro Tips, practitioner-perspective section generalities.
- Example (not flagged): none material beyond illustrative table framings.

## Resolutions (2026-07-11 iter 59)
- L151 ("mTLS (RFC 8705) extends TLS"): RFC 8705 is OAuth 2.0 Mutual-TLS Client Authentication, not a TLS extension; mutual auth is native to TLS (RFC 8446). Reworded to "mTLS uses client certificates — mutual authentication is native to TLS itself (RFC 8446)".
Build: npm run build green (345 pages).
