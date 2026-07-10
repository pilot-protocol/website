# Claim audit: src/pages/blog/why-direct-p2p-connections-power-secure-ai-networking.astro
Audited: 2026-07-10 · Sentences examined: 78 · verified: 60 · false: 0 · unverifiable: 6 · opinion: 10 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 91 | "P2P security risks include malicious peers, scalability limits from churn..." (cites medium.com/@p2pflowofficial) | Medium URL returns HTTP 403; source content unreadable | Accessible copy of the cited Medium article |
| 141 | "As multi-cloud AI developers know well, preferring WebRTC or libp2p ... using auto NAT traversal libraries like Pilot significantly reduces implementation complexity" (attributed to github.com/peerclaw/peerclaw-agent) | Repo exists (HTTP 200) but I did not confirm it contains this guidance or represents "multi-cloud AI developers" | Reading peerclaw-agent README/docs for the quoted guidance |
| 155 | "The guidance from the peerclaw-agent project is direct: implement TOFU trust, E2EE, and capability discovery, and avoid pure P2P in scenarios that require strict compliance..." | Repo/tag v0.7.0 exists (200) but the specific guidance text was not confirmed in repo content | Quote located in the repo's docs |
| 159 | "Decentralized exchange audit trails illustrate why: every trade action must be logged, attributable, and tamper-evident." (cites tickerly.net) | Third-party blog claim; link returns 200 but is a marketing site, not an authority on audit regulation | Regulatory citation (e.g. SEC/MiFID audit-trail rules) |
| 229 | "You get Go and Python SDKs, a CLI, and a web console to manage your network from day one." | Go SDK (common/driver), Python SDK (sdk-python), and CLI verified; "web console" appears nowhere in docs or product source — only in blog posts | A console URL or docs page describing the web console |
| 216 | "AI trading agents face specific constraints: speed is critical, but so is auditability." (cites cryptowatchdog.net) | Third-party marketing blog; no authoritative source | Independent source on trading-agent audit requirements |

## Verified claims (grouped by source)
- Local site files (src/pages/blog/*, src/pages/for/p2p.astro, public/research/ietf/, public/blog/banners/): all 12 internal blog hrefs, /for/p2p, /research/ietf/draft-teodor-pilot-problem-statement-01.html, and banner image exist
- Pre-verified cheatsheet + web4 source (cmd/daemon/main.go:65, pkg/daemon/tunnel.go): Pilot provides persistent virtual addresses, encrypted tunnels (X25519+AES-256-GCM, encrypt default true), automatic NAT traversal, TOFU-style trust — supports table row "Pilot Protocol: Auto zero-config / built-in overlay / E2E by default"
- RFC/general networking knowledge: WebRTC ICE/STUN/TURN/DTLS-SRTP; libp2p origin in IPFS, Noise protocol, DHT/mDNS discovery; NAT/client-server descriptions; TOFU/E2EE definitions; GDPR/HIPAA-style compliance framing
- Live URL checks (curl, 200): github.com/peerclaw/peerclaw-agent (+/tree/v0.7.0), tickerly.net, cryptowatchdog.net, fxshop24.net links resolve
- OPINION/EXAMPLE: TL;DR marketing framing, "fresh perspective" section, block quotes, hybrid-architecture advice tables (advice, not fact), supabase-hosted images (render, not claims)
