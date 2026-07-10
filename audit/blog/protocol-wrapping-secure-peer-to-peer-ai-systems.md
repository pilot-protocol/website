# Claim audit: src/pages/blog/protocol-wrapping-secure-peer-to-peer-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 78 · verified: 52 · false: 0 · unverifiable: 12 · opinion: 14 · example: 0

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 42 | "The vast majority of modern P2P and overlay networks work by wrapping existing protocols..." | Sweeping market-share claim, no citation | Survey of overlay implementations |
| 68 / 150 / 211 | "UDP overlay wrappers offer faster connections... / UDP overlays are 11x faster ... than HTTP/2" | Source is Pilot's own benchmark post (exists, states 11x) — first-party benchmark, no independent artifact; the underlying measurement itself could not be re-verified | Reproducible benchmark data |
| 139 | "VXLAN is the most widely deployed" (also line 199) | Deployment-share claim without citation | Industry survey |
| 139 | "MPLSoUDP is common in carrier-grade environments" | No citation | Carrier deployment data |
| 152 | "the difference ... determines whether your system scales or stalls"; "HTTP/2 connection state is expensive at scale" | Qualitative performance claims without benchmark | Measurements |
| 153 / 200 | "roughly 10 to 15 percent of direct P2P connections fail due to symmetric NAT or firewall policies" | Presented as real deployment statistic, no citation (commonly-quoted range but unsourced here) | NAT-traversal failure-rate study citation |
| 173-174 | AW "Anonymity strength: Strong" vs Sealed Sender "Moderate" | Comparative rating not directly stated in cited paper's abstract | Full paper section supporting the rating |
| 195 | "Libp2p ... combining protocol negotiation, encryption, and multiplexing into a single stack" | Accurate at a high level but not checked against libp2p docs | libp2p spec |
| 198 | "here is a ground-level perspective from practitioners who have deployed these systems at scale" | Anonymous practitioner attribution, unverifiable | Named sources |
| 201 | "Memory bloat under many simultaneous connections ... only shows up at scale. Unit tests will not catch it." | Anecdotal operational claim | Load-test data |
| 206 | "gets you connected in minutes" | Timing claim, no benchmark | Timed onboarding |
| 27 | JSON-LD datePublished "2026-04-05T07:57:59.466Z" | Publication timestamp has no external record (consistent with frontmatter date, but self-referential) | CMS/git history |

## Verified claims (grouped by source)
- RFC 7348 (VXLAN): UDP+IP outer header, 24-bit VNI, 16M segments, fixed header/no native extensibility.
- RFC 8926 (Geneve): UDP+IP encapsulation, TLV option fields, extensible metadata, 24-bit VNI → 16M segments.
- RFC 7510 (MPLS-in-UDP): MPLSoUDP exists, label stacking over UDP/IP.
- Networking fundamentals: encapsulate/transmit/decapsulate mechanics; intermediate routers see only outer header; VPN tunneling; NAT blocking unsolicited inbound + UDP hole-punching; protocol-wrapping definition (FAQ answers).
- https://eprint.iacr.org/2025/1619 (HTTP 200, abstract fetched 2026-07-10): "Generic Anonymity Wrapper for Messaging Protocols" — AW reduces wire size vs Sealed Sender (441→114 bytes 1:1; 7240→155 bytes for 100-member groups), group message support, forward and post-compromise anonymity under state exposure — supports table rows for message size, group support, state exposure, post-compromise recovery.
- Live URLs (curl 2026-07-10): theinternetpapers.com encapsulation article 200; all four Supabase images 200; https://pilotprotocol.network 200.
- Local site files: internal links all exist — what-is-protocol-overlay-fundamentals-practical, peer-to-peer-agent-communication-no-server, how-pilot-protocol-works, connect-agents-across-aws-gcp-azure-without-vpn, peer-to-peer-file-transfer-agents, benchmarking-http-vs-udp-overlay, http-services-over-encrypted-overlay, decentralized-communication-protocols-ai-developers, secure-ai-agent-communication-zero-trust, secure-network-infrastructure-ai-agents-practical-guide, ai-networking-terminology-a2a-mcp-anp-protocols (all in src/pages/blog/); /research/ietf/draft-teodor-pilot-protocol-01.html exists in public/research/ietf/; banner jpg exists.
- src/pages/blog/benchmarking-http-vs-udp-overlay.astro: contains the "11x faster" figure the post cites (link target consistent; underlying benchmark still flagged above).
- Product source (web4, gateway, pre-verified): Pilot provides encrypted tunnels (X25519+AES-256-GCM), NAT traversal, virtual addresses, mutual trust handshake, no central broker; HTTP/gRPC/SSH wrapping via gateway/overlay.
- OPINION (not flagged): TL;DR framings, "Pro Tip" recommendations, unattributed pull-quote, "extensibility debt", future-proofing advice, CTA marketing.
