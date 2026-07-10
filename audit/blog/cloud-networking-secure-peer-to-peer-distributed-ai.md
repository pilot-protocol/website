# Claim audit: src/pages/blog/cloud-networking-secure-peer-to-peer-distributed-ai.astro
Audited: 2026-07-10 · Sentences examined: 85 · verified: 60 · false: 6 · unverifiable: 8 · opinion: 8 · example: 3

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 25-26, 36, 42, 128, 189, 241, 258 | "87.33% of IPFS data is now hosted on cloud nodes" (repeated in JSON-LD, TL;DR, intro, table, body, FAQ, meta description) | The cited paper (www25-ipfs-dedup.pdf, downloaded + decompressed) says cloud nodes reached "87.33% of the PEER SET and 97.43% of the total FILES". 87.33% is the share of peers, not data — the data figure is 97.43%. |
| 189 | "up from roughly 50% just three years ago" | Paper: earlier figure was "52.32% of the files" — a files metric, compared here against the 87.33% peer-set metric. Mixed metrics; trend as stated is not in the source. |
| 228 | "Cloud node share in IPFS jumped from 50% to 87.33% in three years." | Same mixed-metric misquote as above. |
| 79-80, 207 | "FSC chunking outperforms CDC (Content Defined Chunking) and fixed-size chunking for storage efficiency" | Paper: FSC *is* Fixed-Size Chunking ("Fixed Size Chunking (FSC)"); "FSC achieves about zero deduplication efficiency at the default chunk size... applying CDC methods can save up to 90% storage." Claim inverts the paper and treats FSC and fixed-size chunking as different things. |
| 214, 223 | "Apply FSC deduplication chunking to minimize storage overhead" / "Using fixed-size chunking: Switch to FSC for meaningful efficiency gains" | Incoherent and contradicted: FSC = fixed-size chunking (paper's definition); paper recommends CDC over FSC for storage efficiency. |
| 247 | "FSC chunking outperforms fixed-size methods and CDC by reducing duplicate content stored across nodes" | Same inversion — paper shows FSC eliminates only ~4% duplicates at default 256KB; CDC saves up to 90%. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 190-192 | Blockquote: "The assumption that P2P equals decentralization is no longer safe..." | Unattributed quotation — no named source | Attribution to a real person/publication |
| 206 | "Hybrid approaches combining VPC control planes with P2P overlays consistently outperform pure implementations" | No study cited | Comparative benchmark/study |
| 76, 162-163 | SCION "boost speed" / latency improvement "High" | No latency benchmark cited | SCION performance study |
| 141 | "If few nodes host your content, retrieval latency spikes." | Plausible but no measurement cited | IPFS retrieval latency data |
| 188 | "overlapping CIDR blocks cause silent routing failures. Data appears to send but never arrives." | Anecdotal ops claim, no source | Documented case/vendor doc |
| 198 | "Unexpected data transfer costs between availability zones" | Vendor pricing claim, uncited (though generally true of AWS) | Cloud pricing docs |
| 231 | "If more than 60% of your data concentrates on fewer than five nodes, redistribute proactively." | Invented threshold, no source | Any published guidance |
| 236 | "You can wrap existing HTTP, gRPC, and SSH traffic inside the overlay without rewriting your stack." | gRPC/SSH wrapping not confirmed against source (TCP mapping exists but not verified for these protocols specifically) | web4 gateway/map docs or demo |

## Verified claims (grouped by source)
- arxiv.org/abs/2510.27500 (HTTP 200, abstract read): DCUtR hole-punch success ~70% (±7.1%); 97.6% first-attempt efficiency; ~30% fall back to relays; "roughly 30% of NAT traversal attempts fail" and table "~70% direct" all match.
- tddg.github.io www25-ipfs-dedup.pdf (HTTP 200, text extracted): paper exists and covers IPFS centralization + FSC/CDC dedup (the *link* is valid; the blog's numbers misquote it — see FALSE).
- Live URLs (curl, all HTTP 200): geeksforgeeks.org distributed-systems-vs-peer-to-peer article; dl.ifip.org CNSM 2025 PDF (Noise-in-libp2p citation); all four Supabase images (incl. JSON-LD image).
- Local site files: internal links multi-cloud-networking-decentralized-ai-systems, decentralized-networking-p2p-solutions-ai-architectures, encrypted-tunnel-advantages-peer-to-peer-ai-networks, ai-networking-challenges-decentralized-systems, secure-network-infrastructure-ai-agents-practical-guide, ai-networking-best-practices-secure-scalable-systems, secure-ai-agent-networking-workflow-step-by-step all exist in src/pages/blog; banner jpg exists in public/blog/banners.
- General protocol knowledge: libp2p is the networking stack of IPFS/Ethereum; Noise provides authenticated key exchange + forward secrecy; mplex/yamux are libp2p stream multiplexers; DCUtR = Direct Connection Upgrade through Relay; IPFS content addressing by hash (tamper-evident); SCION = Scalability, Control, and Isolation On next-generation Networks, multipath with cryptographic path validation; symmetric NAT blocks hole-punching; Security Groups stateful vs NACLs stateless (AWS docs); VPC = isolated software-defined network; Ed25519 peer identities in libp2p; DHT bootstrap discovery.
- pilotprotocol.network: site live (pre-verified installer endpoint); Pilot capabilities (virtual addressing, NAT punch-through, mutual trust, encrypted tunnels) match web4 source verified in sibling audits.
- JSON-LD datePublished 2026-04-18 consistent with frontmatter date "April 18, 2026".

## Resolutions (2026-07-10, loop iteration 31)
6 FALSE fixed (IPFS-paper misquotes, per www25-ipfs-dedup.pdf): "87.33% of IPFS data" is actually the CLOUD PEER-SET share (files are 97.43%) → corrected to "87.33% of peers (97.43% of files)" across JSON-LD/meta/intro/body; the "up from 50%" trend mixed metrics → reworded; FSC/CDC inversion fixed — FSC *is* fixed-size chunking and the paper shows CDC beats it (FSC ~0 dedup, CDC saves up to ~90%), the blog had it backwards. 8 unverifiable accepted.
