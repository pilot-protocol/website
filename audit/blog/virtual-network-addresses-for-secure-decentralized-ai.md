# Claim audit: src/pages/blog/virtual-network-addresses-for-secure-decentralized-ai.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 36 · false: 2 · unverifiable: 8 · opinion: 38 · example: 4

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 100 | "FIPS (Fully Isolated P2P Spaces) maps a Nostr public key (npub) to an fd00::/8 IPv6 address via a TUN interface." | The cited repo github.com/0ceanSlim/fips README states FIPS = "Free Internetworking Peering System" — the expansion "Fully Isolated P2P Spaces" is invented (the npub→fd00::/8 TUN mapping itself IS correct per README) |
| 211 | "According to libp2p's documented issues, CIDR overlap in VCN peering requires non-overlapping blocks to avoid silent routing failure." | Cited issue libp2p/js-libp2p#2977 (via gh api) is titled "Failure to create a circuit relay reservation when both ipv6 and ipv4 are present but the client only supports ipv4" — it says nothing about CIDR overlap or VCN peering; mis-attributed citation |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 42 | "The most secure autonomous agent fleets running today often never assign IP addresses the traditional way." | Unsourced claim about fleets "running today" | Survey/report of production agent fleets |
| 202 | "Peer-to-peer overlays consistently outpace centralized VPNs for latency and scalability in multi-region deployments." | Presented as a quote/finding with no source; no benchmark cited | Published latency/scalability comparison |
| 202 | "direct P2P paths scale linearly because each new peer adds its own forwarding capacity" | Unsourced scalability assertion | Measurement study |
| 214 | "Many enterprise and carrier-grade NATs use symmetric mode." | Plausible but no prevalence data cited | NAT-behavior survey (e.g. RFC 5780-based measurement studies) |
| 150 | Quoted line: "Overlay networks abstract physical topology, using underlay for transport while providing stable virtual IPs." | Presented as a quotation with no attribution | Named source for the quote |
| 235 | "Teams that start with centralized assignment often convert later, under pressure, when scaling failures force their hand." | Anecdotal field-experience claim | Case studies |
| 217 | "Libp2p's circuit relay has known issues with IPv6/IPv4 dual-stack handoffs that can silently drop connections." | Issue #2977 confirms a dual-stack relay-reservation failure, but "silently drop connections" generalization not confirmed | The issue documents reservation failure; broader claim needs more issues/evidence |
| 236 | "That combination is not achievable with DHCP and a traditional VPN." | Absolute negative claim, unproven | N/A (architectural opinion stated as fact) |

## Verified claims (grouped by source)
- github.com/0ceanSlim/fips README (raw.githubusercontent, HTTP 200): Nostr keypairs/npub as node identities; TUN interface maps npubs to fd00::/8 IPv6; no central registry (lines 100, 128-131, 217 context).
- github.com/igorls/meshguard (README main + gh code search): deterministic addressing from node public keys under 10.99.0.0/16 (line 158 "10.99.x.y"); blake3 present in source (9 code hits); Noise implementation (src/wireguard/noise.zig; WireGuard data plane) supporting line 243's Noise/E2E claim; NAT traversal with STUN, UDP hole punching, relay fallback.
- docs.zerotier.com (docker-6plane HTTP 200, protocol HTTP 200): 6PLANE //80 per-host delegation for containers; VL1/VL2 layering, 40-bit node ID, UDP hole punching (lines 100, 160-161).
- gh api repos/libp2p/js-libp2p/issues/2977: dual-stack IPv6/IPv4 circuit-relay reservation failure exists (line 217's core claim).
- docs.oracle.com VCN overview (HTTP 200): logical IPs in software-defined networks (line 42).
- learn.microsoft.com IP services overview (HTTP 200): link live (line 249).
- symmnet.com, crequity.ai/security-policy, canterburytdi.edu.au/diploma-of-ai (all HTTP 200): links resolve (lines 95, 226, 256 — note the Canterbury diploma link is topically irrelevant to the post).
- Internal links on disk: /for/p2p, /research/ietf/draft-teodor-pilot-protocol-01.html, /research/ietf/draft-teodor-pilot-problem-statement-01.html (public/research/ietf/), blog slugs overlay-networking…, network-tunnels…, secure-communication-protocols…, secure-ai-agent-communication-zero-trust, persistent-network-addressing…, cloud-networking…, decentralized-networking…, ai-networking-best-practices… — all exist (lines 85, 145, 150, 161, 214, 223, 240, 252-255).
- public/blog/banners/virtual-network-addresses-for-secure-decentralized-ai.jpg exists (line 265); Supabase images (lines 8, 31, 205, 234, 239) all HTTP 200.
- Product source web4 + pre-verified: Pilot Protocol offers persistent virtual addresses, encrypted tunnels, NAT traversal, relay fallback, CLI + Python/Go SDKs (sdk-python repo exists; Go SDK = common/driver) (line 240).
- RFC 5737: multiaddr example /ip4/192.0.2.1/... uses documentation range (line 220) — EXAMPLE.

Remaining sentences (definitions of virtual addresses, isolation/scalability property lists, pro tips, FAQ restatements) are accurate general networking prose or advice — classified VERIFIED-generic or OPINION as appropriate.
