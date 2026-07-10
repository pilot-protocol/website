# Claim audit: src/pages/blog/peer-to-peer-networking-examples-ai-engineers.astro
Audited: 2026-07-10 · Sentences examined: 110 · verified: 62 · false: 2 · unverifiable: 6 · opinion: 32 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 143-145 | NAT traversal table row: "TCP + QUIC combined | 97.6% first try | Best for production" | arXiv 2510.27500 abstract (fetched 2026-07-10): 97.6% is the share of *successful* connections established on the first attempt; overall TCP/QUIC success is ~70%. Presenting 97.6% as a combined success rate contradicts the cited paper. |
| 107 | "NAT traversal via UDP hole punching is built into the DHT spec" | BitTorrent's DHT spec (BEP 5) contains no hole-punching; NAT hole-punching is the separate holepunch extension (BEP 55). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 102 | "DHT metadata resolution reaching a median of 2.3 seconds" | Cited only to lifetips.alibaba.com (AI content-farm page, no primary study) | A published BitTorrent DHT measurement study |
| 221 | "DHT+PEX+Magnet links reduce time-to-first-byte by 4.1x … with 22% less RAM usage" | No primary source; numbers appear invented | Benchmark publication with these figures |
| 149-151 | "Relay fallback | ~100% reachability" | Not stated in the cited arXiv paper's abstract; no source | Measurement data on relay reachability |
| 224 | "We have seen AI agent mesh networks destabilized … goroutine pools" / relay routing loops anecdote | First-person anecdote, no incident report | Postmortem/incident documentation |
| 157, 243 | "Goroutine leaks from blocked stream closures are the number-one cause of memory exhaustion in long-running agent mesh deployments" | Superlative ("number-one cause") has no supporting data; PR 3448 fixes the bug but ranks nothing | Survey/telemetry of libp2p deployment failures |
| 8, 31 | JSON-LD/inline image on csuxjmfbwmkxiegfpljm.supabase.co (third-party Supabase bucket) | URLs return 200 today but are an unowned external dependency; caption accuracy unverifiable | N/A (stock-image captions) |

## Verified claims (grouped by source)
- arXiv 2510.27500 abstract (curl 200, 2026-07-10): DCUtR hole-punch success 70% ± 7.1% over 4.4M attempts; TCP and QUIC statistically indistinguishable; 97.6% of successful connections on first attempt — lines 138-141, 175, 237 correctly restate these.
- Math: Kademlia XOR metric O(log N); log2(1,000,000) ≈ 20 hops (l.95, 235).
- Public libp2p docs / pkg.go.dev (200): pluggable transports TCP/QUIC/WebSockets, Noise/TLS 1.3, mDNS, Kademlia DHT, GossipSub; used by IPFS, Ethereum 2.0 (consensus layer), Polkadot; DCUtR/relay/AutoNAT stack (l.117-124, 154, 196-205).
- github.com/libp2p/go-libp2p PR 3448 (curl 200): stream-closure blocking fixed with read deadlines (l.155).
- Public BitTorrent/IPFS knowledge (BEP 5, BEP 11 PEX, magnet URIs; CIDs, Bitswap, Merkle DAGs, IPNS, pinning): l.100-109, 160-176, 191-219, FAQ answers.
- web4 source / pre-verified: closing Pilot claims — persistent virtual addresses (48-bit), encrypted tunnels (X25519+AES-256-GCM), automatic NAT punch-through, trust establishment, no central broker; traffic wrapping via map/gateway commands (pilotctl map/extras gateway exist).
- Local site files: all pilotprotocol.network internal links resolve to src/pages/blog/*.astro or src/pages (verified with filesystem check); banner jpg exists.
- Live curl: geeksforgeeks, medium (403 bot-block but page exists), inria hole-punch paper, dl.ifip.org PDF, dev.to — all reachable; Supabase images 200.
- JSON-LD datePublished 2026-04-17 matches frontmatter date "April 17, 2026".
