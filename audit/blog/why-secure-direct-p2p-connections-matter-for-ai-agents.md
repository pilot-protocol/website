# Claim audit: src/pages/blog/why-secure-direct-p2p-connections-matter-for-ai-agents.astro
Audited: 2026-07-10 · Sentences examined: 86 · verified: 66 · false: 0 · unverifiable: 5 · opinion: 12 · example: 3

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 101 | "A connection that travels broker-to-broker across regions can add 50 to 200 milliseconds of unnecessary delay." | No benchmark or citation for the latency range | A published cross-region broker latency benchmark |
| 116 | "Many teams discover that broker overhead accounts for 30 to 40 percent of total round-trip time, especially in cross-region deployments." | No survey or measurement cited | Named study or benchmark data |
| 92 | Blockquote: "...direct connections succeed ~70% of the time across millions of real-world attempts." (presented as a quotation) | The ~70%/millions figures match arxiv 2510.27500, but the quoted sentence itself does not appear verbatim in the paper's abstract — attribution of the quote is unclear | Locating the quote in the paper or removing quote marks |
| 204 | "It doesn't solve every case, but it meaningfully reduces the failure rate for restricted-cone and some symmetric configurations." (RTT-optimized sync) | Paper shows RTT-based sync equalizes TCP/QUIC success (~70%) but I could not confirm the "some symmetric" improvement claim from the abstract | Full-text section of arxiv 2510.27500 on symmetric NATs |
| 234 | "A system that succeeds 70% of the time with graceful... fallback... outperforms a system that succeeds 85% of the time but hangs for 30 seconds..." | Illustrative comparison presented as a factual claim; no measurement | Benchmark comparing the two designs |

## Verified claims (grouped by source)
- arxiv.org/abs/2510.27500 (HTTP 200, abstract): NAT traversal baseline success 70% ± 7.1% for hole punching; 4.4M+ attempts ("millions of real connection attempts"); decentralized protocols (DCUtR/libp2p/IPFS); RTT-based synchronization technique — covers TL;DR line 36, intro line 42, lines 159, 245, and the 70/30 framing throughout
- General networking knowledge (RFC 3489/5389/8656, RFC 4787 NAT taxonomy): full-cone/restricted-cone/port-restricted/symmetric NAT behavior, UDP/TCP hole punching, STUN NAT-type detection, TURN relay semantics, CGNAT, GDPR/HIPAA framing
- web4 source + pre-verified: Pilot handles NAT traversal, mutual trust, encrypted tunnels, relay fallback, persistent virtual addresses, wrapping HTTP/gRPC/SSH (daemon tunnel + map/connect features); rendezvous/signaling server does not carry agent data (registry/beacon design)
- Local site files: all internal hrefs exist (nat-traversal-ai-agents-deep-dive, encrypted-tunnel-advantages…, peer-to-peer-agent-communication-no-server, how-pilot-protocol-works, openclaw-agents-behind-nat-zero-config, connect-ai-agents-behind-nat-without-vpn, benchmarking-http-vs-udp-overlay, decentralized-networking-p2p-solutions-ai-architectures, cloud-networking…, network-security…, /for/p2p); banner image exists; "free tier" corroborated by src/pages/terms.astro
- Live URL checks (200): humanos-unified-world.lovable.app, blog.skypher.co article
- OPINION/EXAMPLE: "resilience over perfection" advice, best-practice bullet lists, 1,000-agent/300-relay arithmetic illustration (example), 2–5s timeout guidance (advice)

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
