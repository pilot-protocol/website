# Claim audit: src/pages/blog/decentralized-networking-p2p-solutions-ai-architectures.astro
Audited: 2026-07-10 · Sentences examined: 104 · verified: 52 · false: 2 · unverifiable: 26 · opinion: 15 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 36/42 | "Peer-to-peer networks achieve 97.6% NAT traversal success in production environments." / "NAT traversal success rates now reach 97.6% on first attempt using libp2p's hole-punching" | Misrepresents the statistic: per the same site's sibling post (decentralized-communication-protocols, line 146) and the cited study, DCUtR success is ~70%; 97.6% is the share of *successful* connections completing on first attempt. Also cited to github.com/kagvi13/HMP, an unrelated repo |
| 238 | FAQ: "libp2p achieving 97.6% efficiency on first attempt and near-100% overall with relays" | Same misstatement — 97.6% is first-attempt share among successes, not traversal success rate; this page itself states "70% success" at lines 151/199 |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 151 | "libp2p NAT traversal achieves 70% direct P2P success, with WebRTC swarms reaching near-100% using incentivized TURN relays" | arxiv 2510.27500 live (200), content unverified | Reading the paper |
| 160/172/175/186-204/240 | 20-node BFT simulation figures: 3 gossip rounds under 10s, consensus in 60s at 20% Byzantine, >90% daily node retention | arxiv 2511.15388 live (200), content unverified; benchmark table repeats them | Reading the paper |
| 94/222 | Two unattributed blockquotes ("Decentralized networks reduce single-point failures..."; "You cannot rely on ideal conditions...") | No attribution | Citations |
| 163 | "Hyperspace AGI: Uses libp2p with gossip and CRDT for distributed AI coordination" | github.com/hyperspaceai/agi exists (200) but implementation claims unverified | Repo README |
| 164/236 | "OpenCLAW-P2P: Implements cognitive mesh networking with reputation and BFT layers" | No such project found; not the openclaw/openclaw repo; no source | A repo/URL for "OpenCLAW-P2P" |
| 165 | "ARIA: Optimized for efficient CPU inference across decentralized nodes" | No source, project not identifiable | Project link |
| 167 | "libp2p provides the most robust foundation for distributed AI, with Hyperspace AGI demonstrating gossip and CRDT patterns at scale" | Comparative + "at scale" claims unverified | Benchmarks |
| 85 | Citation of bookmarkstatus.com/ip2-network/ for "peer-to-peer systems" | Live (200) but a low-quality bookmark-spam page; not a real source | Replace with authoritative source |
| 152 | mdpi.com/1999-5903/18/1/13 "peer-reviewed benchmarks" | Returned HTTP 403; content unconfirmed | Browser fetch/DOI |
| 92 | "Centralized networks introduce single-point failures and censorship risks" (arxiv 2503.09833) | Link live (200), content unverified | Reading the paper |
| 219 | "Centralized networks are faster and more reliable under ideal conditions" | Broad comparative claim, no source | Benchmark |
| 110 | "Within seconds, it has a list of reachable nodes without any central registry" | Timing claim, no benchmark | Measurement |

## Verified claims (grouped by source)
- Pre-cutoff public knowledge: libp2p used in IPFS and Ethereum; Kademlia = DHT with XOR routing; gossip = epidemic propagation in logarithmic time; symmetric NAT assigns per-destination external ports and defeats hole-punching; BFT tolerates < 33% (f < n/3) faulty nodes; SCION = path-aware networking; TURN relays; UPnP/NAT-PMP port mapping; Holochain is a distributed framework (holochain.org HTTP 200)
- Local site files: internal links all exist (decentralized-communication-protocols-ai-developers, nat-traversal-ai-agents-deep-dive, peer-to-peer-agent-communication-no-server, clawhub-to-live-network-openclaw-discovery, ai-networking-challenges-decentralized-systems, secure-network-infrastructure-ai-agents-practical-guide, openclaw-agents-behind-nat-zero-config, benchmarking-http-vs-udp-overlay, why-autonomous-agents-need-private-discovery); banner .jpg exists
- web4 source + go.mod + pre-verified: Pilot provides virtual addresses, encrypted tunnels (tunnel.go:534 X25519+AES-256-GCM), NAT punch-through + relay fallback (beacon), multi-cloud/cross-region connectivity, CLI + Python SDK + Go SDK (sdk-python repo, common/driver), wraps HTTP/gRPC/SSH via map/tunnel commands
- Live URL checks (200): arxiv 2510.27500, arxiv 2511.15388v1, arxiv 2503.09833v1, github.com/kagvi13/HMP, github.com/hyperspaceai/agi, holochain.org, supabase images
- Frontmatter: datePublished 2026-04-04 matches "April 4, 2026"
