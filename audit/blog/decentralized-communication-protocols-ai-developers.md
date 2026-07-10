# Claim audit: src/pages/blog/decentralized-communication-protocols-ai-developers.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 55 · false: 0 · unverifiable: 22 · opinion: 12 · example: 7

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why | What WOULD verify it |
|---|---|---|---|
| 32 | "Nearly one-third of peer-to-peer connection attempts still fail in production deployments due to NAT traversal edge cases" | Third-party stat; arxiv 2510.27500 is live (HTTP 200) but paper content not confirmed to state this | Reading the cited paper |
| 32/146 | "DCUtR hole-punching success sits at roughly 70%" / "70% success rate with a margin of plus or minus 7.1%, and 97.6% of successful connections complete on the first attempt" | Specific benchmark figures; source link live but content unverified | Cited paper's abstract/results |
| 54/219 | "NAT traversal failures impact up to 30% of agent connections" | Derived from the same unverified 70% figure | Same |
| 139 | "Bitcoin's network maintains tens of thousands of reachable nodes" | No live source checked; reachable-node counts vary (~15-20K historically) | bitnodes.io snapshot |
| 141 | Blockquote "Sybil resistance in DHTs is not a solved problem..." | Unattributed quote | Citation |
| 151 | "Self-healing UPnP and deduplication reduce mapping failures from 10 to 2 per session" | libp2p PR #3367 is live (200) but PR content/figures unverified | Reading the PR |
| 153 | "If more than 15% of your connections use relays, your NAT traversal strategy needs tuning" | Invented threshold, no source | Benchmark/citation |
| 161 | MLS "relies on an Authentication Service (AS) that is vulnerable to compromise at group initialization" | Third-party security claim; poberezkin.com live (200), content unverified | Reading the post / MLS RFC 9420 |
| 162/165/223 | "For small groups under 1000 agents, sender keys allow broadcast-style messaging..." / <1000 → Double Ratchet guidance | No source for the 1000-agent threshold | Citation |
| 139 | "Blockchain P2P networks vary widely in size, reachability, and peer discovery coverage" (arxiv 2511.15388) | Link live (200), content unverified | Reading the paper |
| 143 | "OpenClaw peer discovery ... combines DHT-style routing with trust-gated admission, reducing Sybil exposure" | Characterization of linked post; OpenClaw discovery mechanism not verified against source | web4/clawhub source |
| 155 | "In multi-cloud deployments, symmetric NAT is common and blocks most hole-punching attempts" | Vendor/network behavior claim, no source | Cloud NAT docs |
| 178 | "Libp2p implementations in Go, JavaScript, and Rust are used in IPFS and blockchain networks at this scale" | Partially known-true (impls exist) but "at this scale" unverified | libp2p docs |
| 211 | "the overlay approach consistently outperforms point-to-point VPN tunnels in flexibility" | Unbenchmarked comparative claim | Benchmark |
| 131 | Medium link (bugfreeai system design guide) as source | Returned HTTP 403 (bot block) — liveness/content unconfirmed | Browser fetch |

## Verified claims (grouped by source)
- Math: Kademlia O(log n); ~20 hops for 1M nodes (log2(10^6)≈19.9) — line 131
- Pre-cutoff public knowledge: libp2p is a modular P2P stack underpinning IPFS; Ethereum/IPFS/BitTorrent use Kademlia variants; Kademlia = XOR distance DHT; Sybil/eclipse/churn/bootstrap weaknesses are standard literature; gossipsub is libp2p's pubsub; MLS = tree-based group E2EE; Double Ratchet = forward secrecy + break-in recovery; X25519+AES-GCM = ECDH + AEAD
- Live URL checks (HTTP 200): arxiv.org/abs/2510.27500, arxiv.org/html/2511.15388v1, pkg.go.dev/github.com/libp2p/go-libp2p, github.com/libp2p/go-libp2p/pull/3367, poberezkin.com MLS post, both supabase images
- Local site files: all internal blog links exist (peer-to-peer-file-transfer-agents, how-pilot-protocol-works, clawhub-to-live-network-openclaw-discovery, nat-traversal-ai-agents-deep-dive, openclaw-agents-behind-nat-zero-config, connect-ai-agents-behind-nat-without-vpn, connect-agents-across-aws-gcp-azure-without-vpn, zero-dependency-encryption-x25519-aes-gcm, http-services-over-encrypted-overlay, why-ai-agents-need-network-stack, secure-ai-agent-communication-zero-trust, openclaw-meets-pilot-agent-networking-one-command); public/research/ietf/draft-teodor-pilot-{protocol,problem-statement}-01.html exist; banner .jpg exists
- web4 source + pre-verified: Pilot handles peer discovery, NAT traversal, encrypted tunnels, trust establishment; persistent virtual addresses + encrypted overlay; SDKs for Go (common/driver) and Python (sdk-python repo) and unified CLI (pilotctl)
- Frontmatter: datePublished 2026-03-31 matches date "March 31, 2026"
