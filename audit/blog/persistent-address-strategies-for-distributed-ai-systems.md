# Claim audit: src/pages/blog/persistent-address-strategies-for-distributed-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 118 · verified: 45 · false: 1 · unverifiable: 9 · opinion: 55 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 164 | "The <a href=…/blog/benchmarking-http-vs-udp-overlay>benchmarks for DHTs</a> in overlay network deployments confirm that cluster-based approaches hold topology consistency significantly better … when agent turnover exceeds roughly 20% per hour." | The linked internal post (src/pages/blog/benchmarking-http-vs-udp-overlay.astro) contains no DHT, churn, or 20%/hour content (grep: zero hits) — the citation does not support the claim, and no other source is given. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 105, 262 | "periodic recovery converges in O(log N), random sampling for the preserved neighbor set (PNS) gives a 24% latency improvement, and reactive recovery causes squelch" | No citation; figures resemble Rhea et al. "Handling Churn in a DHT" (2004) but are uncited and unchecked | Citation + reading of that paper |
| 113 | "Enable random sampling for PNS selection to achieve the documented 24% latency gains." | Same uncited benchmark | Same |
| 123, 236, 270 | "Cluster-based DHTs require Θ(N) join/leave events before split or merge topology changes" (cited hal-00476330) | Cited HAL PDF is live (200) but its content was not inspected; Θ(N) claim unconfirmed | Reading the HAL paper |
| 93, 253 | "Availability is often prioritized over strict consistency in DHT architectures due to CAP constraints" (cited eprint.iacr.org/2025/2131) | Cited paper exists ("Persistent BitTorrent Trackers", curl 200) but content not inspected | Reading the eprint paper |
| 168, 175, 264 | "IPNS … requiring republishing every ~24 hours" / "IPNS records expire after 24 hours without republishing" | Kubo's default IPNS record lifetime has changed across versions (48h in recent releases); cited dev.to post and GitHub issue not authoritative for current default | ipfs/kubo docs for current default lifetime |
| 253 | "Production autonomous systems that require verified agent identity already implement this pattern [TEE + DHT attestation]. This is not theoretical." | No named system or citation | Named production deployments |
| 126 | "individual node DHTs may rebalance hundreds of times per hour" in a 500-agent fleet | Illustrative figure with no measurement | Churn benchmark |
| 259 | Pilot deployable "via CLI, Python or Go SDK, or the web console" | No web console found anywhere in src/pages (no console page/route) or product source | An actual console URL/page |
| 8, 31 etc. | Supabase-hosted images/captions (third-party bucket) | External unowned dependency; captions are stock descriptions | N/A |

## Verified claims (grouped by source)
- Public DHT literature (Kademlia/Chord fundamentals, widely documented): node IDs from public-key hashes stable across IP changes; DHT maps IDs to locations without central registry; routing updates propagate without broadcast (l.99-103); FAQ restatements.
- Public IPFS/IPNS docs: IPNS maps public-key hashes to CIDs via signed DHT records; mutable pointer with stable name; no native version history; depends on IPFS infrastructure (l.167-176, 239, 247).
- web4 source / pre-verified: closing Pilot paragraph — persistent virtual addresses, encrypted P2P tunnels (X25519+AES-256-GCM), NAT traversal, mutual-trust model, no self-operated DHT/republishing needed; CLI + Python SDK (sdk-python, PyPI pilotprotocol) + Go SDK (common/driver) all exist (l.259 except "web console", flagged above).
- Live curl 2026-07-10: hal.science/hal-00476330v1 200; eprint.iacr.org/2025/2131 200; dev.to IPNS guide 200; github ipshipyard/ipns-inspector/issues/38 200; Supabase images 200.
- Local site files: all internal links (/blog/persistent-addresses-distributed-autonomous-systems, persistent-network-addressing-secure-ai-systems, peer-to-peer-agent-communication-no-server, ai-networking-challenges-decentralized-systems, decentralized-networking-p2p-solutions-ai-architectures, autonomous-agent-networking-distributed-ai, trust-model-agents-invisible-by-default, cloud-networking-secure-peer-to-peer-distributed-ai, decentralized-communication-protocols-ai-developers, /for/p2p) exist; banner jpg exists.
- JSON-LD datePublished 2026-04-28 matches frontmatter "April 28, 2026".
- OPINION: evaluation-criteria framing, pro tips, hybrid-strategy advocacy, comparison-table qualitative ratings (Medium/High/Low), decision-process steps.
