# Claim audit: src/pages/blog/overlay-networking-secure-ai-agent-communication-explained.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 66 · false: 0 · unverifiable: 12 · opinion: 13 · example: 5

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 309 / 321-331 / 374 | "Cilium eBPF achieving roughly 39Gbps same-node and 9.8Gbps cross-node … Flannel VXLAN 35Gbps/8.2Gbps; P99 0.8ms vs 1.8ms" (table + FAQ repeat) | Third-party benchmark; cited sanj.dev page (200) content not matched; no local benchmark | Fetch cited benchmark data |
| 333-343 | Table rows "WireGuard overlay ~10-20 Gbps / 1-3 ms" and "GRE tunnel ~25-30 Gbps / 1-2 ms" | No source cited at all for these two rows | A named benchmark |
| 354 | "AES-256-GCM with hardware acceleration adds roughly 5 to 10 percent CPU overhead compared to unencrypted tunnels" | Quantified figure, no source | Benchmark citation |
| 246 | "Geneve with IPv6 can add up to 70 bytes, requiring underlay MTU of at least 1450 to 1500 bytes" | Cited adevwrites.space (200) content not matched; figure plausible but unconfirmed | RFC 8926 header math check or source fetch |
| 359 | "A 0.1 percent packet loss rate in the underlay can translate to significant retransmission overhead" | Quantified impact claim, no source | Measurement/citation |
| 361 | "Emerging P2P overlays are moving toward fully cryptographic identity models" | Trend claim; cited github.com/alexngai/agentic-mesh (200) is a single repo, not evidence of a trend | Survey of projects |
| 92 | "WireGuard … gaining traction in agent networking" | Adoption-trend claim, no data | Usage statistics |
| 129 | "if your underlay MTU is 1500 … 50 bytes of headers, you will silently drop packets unless you adjust MTU" | Conditional true only when PMTUD/fragmentation blocked; stated absolutely | Qualified networking reference |
| 185 | Quote "Separating control and data planes simplifies operations…" | Unattributed pull-quote presented as citation-style quote | Named source |
| 304 | Quote "The trade-off between scalability, resilience, and lookup performance…" | Unattributed pull-quote | Named source |
| 306 | "For most production AI agent deployments, a hybrid approach works best" | Deployment-population claim, no data | Survey/case studies |
| 356 | "Synthetic benchmarks with iperf3 will not reveal issues like head-of-line blocking, connection state exhaustion…" | Absolute tool-behavior claim, no source | Documented iperf3 limitations |

## Verified claims (grouped by source)
- RFC-level / standard networking facts: VXLAN UDP 4789, 24-bit VNI = 16M segments, ~50-byte overhead (RFC 7348); GRE IP protocol 47, ~24-byte overhead (RFC 2784/2890); Geneve UDP 6081, TLV extensions (RFC 8926); WireGuard UDP, ~60-byte overhead; encapsulation/underlay-MTU mechanics; PMTUD blocked by firewalls causes silent drops
- Distributed-systems literature: Chord ring + finger tables O(log N); Kademlia XOR metric + k-buckets, basis of BitTorrent DHT and IPFS; gossip/flooding resilience vs efficiency trade-offs; control/data plane separation
- Live URLs (HTTP 200): networklessons.com (both), oneuptime.com VXLAN-vs-GRE, thelinuxcode.com, sanj.dev, adevwrites.space, github.com/alexngai/agentic-mesh, all 4 supabase images
- Local site: internal links all exist — /research/ietf/draft-teodor-pilot-protocol-01.html (public/research/ietf/), blog/{protocol-wrapping…, how-pilot-protocol-works, overlay-networking-automation…, what-is-protocol-overlay…, multi-cloud-networking…, http-services-over-encrypted-overlay, benchmarking-http-vs-udp-overlay, secure-ai-agent-networking-workflow…, network-tunnels-ai…, ai-networking-best-practices…, secure-network-infrastructure…}, /for/p2p; banner .jpg exists
- web4 source + pre-verified: Pilot Protocol provides encapsulation, NAT punch-through (pkg/daemon), mutual authentication/trust (handshake module), persistent virtual addresses (docs/comparison-networking.astro), encrypted P2P tunnels X25519+AES-256-GCM (tunnel.go:534), endpoint discovery (rendezvous/nameserver modules in go.mod); HTTP wrapping via gateway (gRPC/SSH specifically noted as claim shared with automation post — see that ledger)

OPINION (not flagged): "This separation is what gives overlays their power", Pro Tips, "the right direction", "trade-off is almost always worth it", "Our perspective" framing.
EXAMPLE: Agent A/B flow, 1400-byte DF ping test, feature-comparison table archetypes.
