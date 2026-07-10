# Claim audit: src/pages/blog/multi-cloud-networking-decentralized-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 34 · false: 1 · unverifiable: 15 · opinion: 38 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 146 | "Each agent gets a persistent virtual address, a cryptographic identity, and the ability to find and verify peers without a central directory." | Pilot peer discovery IS via a central registry (34.71.57.205:9000; `pilotctl find`/`lookup` query the registry — cmd/pilotctl/main.go; pre-verified ground truth). Trust verification is P2P, but finding peers depends on the central directory. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 100 | "GCP Premium Tier delivers the lowest inter-region latency, and edge-cloud architectures show up to a 60% latency reduction" | Third-party benchmark claim; cited firstpasslab.com page loads (200) but figures not independently verifiable | Reproducible benchmark data |
| 113-139 | Connectivity table: "IPsec VPN 1-10 Gbps", "Private interconnect 10-100 Gbps", latency/cost cells | Vendor performance figures with no cited source | Cloud provider spec sheets |
| 134, 137, 181-184 | "Agent overlay (Pilot Protocol) ... Cost: Usage-based" | Pilot Protocol is open source with no published usage-based pricing; no pricing source exists | A pricing page |
| 169-179 | "VPN gateway $150-400+/mo", "Private interconnect $500-2000+/mo" | Estimated cost figures, no source | Cloud pricing citations |
| 149 | Equinix "Secure agent enclaves" link claims | URL returned HTTP 403 (bot-blocked); content could not be checked | Accessible copy of the Equinix post |
| 192 | "AWS Transit Gateway has regional limits, Azure vWAN offers less route control, and GCP NCC is still maturing" | Vendor behavior/maturity claims, no source | Vendor docs / quota pages |
| 202 | "Engineers with cross-cloud networking expertise command significantly higher salaries" | Survey claim, no citation | Salary survey citation |
| 202 | "Expert guidance consistently points to AWS TGW for fine-grained control, Azure vWAN for large-scale hub-and-spoke..." | Unattributed "expert guidance" | Named sources |
| 99 | "Colocation exchanges like Equinix Fabric and Megaport enable efficient intercloud topologies" | Vendor capability claim (products do exist); "efficient" comparative not verifiable | N/A (products exist; qualitative) |
| 36-38 | TL;DR: "shifting from VPNs to application-layer overlays" (industry trend claim) | Market trend assertion, no data | Industry survey |

## Verified claims (grouped by source)
- Live URLs (curl): thenetworkdna.com article 200; firstpasslab.com article 200; all 4 supabase images 200
- Local site: /research/ietf/draft-teodor-pilot-protocol-01.html exists in public/research/ietf/; /docs/service-agents exists (src/pages/docs/service-agents.astro); internal blog links (decentralized-communication-protocols-ai-developers, what-is-protocol-overlay-fundamentals-practical, connect-agents-across-aws-gcp-azure-without-vpn, secure-ai-agent-communication-zero-trust, secure-network-infrastructure-ai-agents-practical-guide, ai-networking-challenges-decentralized-systems, securing-ai-agent-networks-multi-cloud-environments, secure-communication-protocols-distributed-ai-systems, decentralized-networking-p2p-solutions-ai-architectures, ai-networking-best-practices-secure-scalable-systems) all exist in src/pages/blog/
- web4 source / pre-verified: Pilot provides virtual addressing, NAT traversal, E2E encryption (X25519 + AES-GCM, pkg/daemon/keyexchange/derive.go), no VPN gateways required; wraps HTTP/gRPC/SSH via net.Conn (common@v0.5.0/driver/conn.go); mutual trust handshake (pilotctl handshake/approve)
- JSON-LD (lines 4-28): datePublished 2026-04-17 matches frontmatter date April 17, 2026; publisher URL pilotprotocol.network valid; image URL 200
- Local: banner public/blog/banners/multi-cloud-networking-decentralized-ai-systems.jpg exists
- Generally accepted networking facts: non-transitive VPC peering (AWS documented behavior); overlays operate at application layer
- OPINION items: TL;DR bullets, key-takeaways table, "new era" section, pro tips, FAQ answers, closing marketing

## Resolutions (2026-07-11 iter 60)
- L146 ("find and verify peers without a central directory"): Pilot peer discovery IS via a central registry (find/lookup query it). Trust is P2P. Reworded to "verify peers directly, peer-to-peer; a thin registry handles discovery, but trust is established between the agents themselves — no central authority owns the trust decision."
Build: npm run build green (345 pages).
