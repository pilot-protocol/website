# Claim audit: src/pages/blog/legacy-protocol-integration-for-secure-distributed-ai.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 41 · false: 1 · unverifiable: 15 · opinion: 34 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 26 vs 258 | JSON-LD `"datePublished": "2026-05-06"` vs frontmatter `date="May 9, 2026"` | Internal contradiction: the two rendered dates for the same article disagree by 3 days. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 89 | Quote: "P2P stacks like libp2p and Pilot enable agent swarms with legacy HTTP compatibility via proxies…" | dev.to URL returns 200, but quote text not confirmed against the article body | Fetching the article body and matching the quote |
| 95 | "Chainlink's middleware abstraction layers like CRE and CCIP … connect legacy REST and GraphQL APIs via oracles" | chain.link URL 200 but specific CRE/CCIP behavior claim not confirmed | Reading the Chainlink article content |
| 98 | "libp2p … enables P2P integration via hybrid transports, circuit relays … allowing OpenAI-compatible endpoints to operate over decentralized networks" | GitHub repo denizumutdereli/agents-p2p-network exists (200), but the specific behavior attribution unconfirmed | Reading that repo's README |
| 186 | "Proxies and translation tunnels now use DIDs, Verifiable Credentials, post-quantum cryptography, and DHTs as Verifiable Data Registries…" | sciencedirect.com returned HTTP 403 (bot-blocked); paper content unverifiable | Access to the paper S2214212625002364 |
| 191 | "Use post-quantum key exchange … given the advancing timeline on quantum computing threats." | Forward-looking vendor/industry claim, no citation | An authoritative source on PQC timelines |
| 204 | "This is the most frequent production blocker." | Frequency ranking with no data source | Survey or incident data |
| 207 | "CVE-level vulnerabilities like oracle self-deception scenarios … are a documented risk." | GitHub issue ipfs/service-worker-gateway#972 exists (200) but is not a CVE and content unconfirmed | Reading the issue; a CVE record |
| 223, 246 | "Real-world configuration improvements show an 800ms time-to-first-byte reduction…" (repeated in FAQ) | Third-party measurement with no cited benchmark | The source benchmark/config change report |
| 229 | "Direct integration risks … are well-documented, and the consensus is clear: middleware and oracle patterns consistently outperform native protocol changes." | "Consensus" claim without citation | Cited literature |
| 242 | "Proxies and translation tunnels using DIDs, VCs, and post-quantum crypto are now the standard approach…" | Industry-standard claim without source | Standards body or survey citation |
| 244 | "libp2p hybrid transports combined with circuit relays are the most reliable production-tested approach for NAT traversal." | Comparative superlative with no benchmark | Comparative NAT traversal study |
| 235 | "…and a web console that let you deploy, monitor, and manage agent networks" | Existence of a Pilot web console not confirmed in source/repos audited | Live console URL |
| 13 | Supabase-hosted images (3 URLs) content claims via alt text | First image URL returns 200 (verified reachable); others assumed same host — alt text descriptive only | — |
| 84 | "Older protocols frequently rely on network-level trust rather than cryptographic identity" | General industry claim, broadly true but uncited | Protocol spec citations (Modbus has no auth — RFC/spec) |
| 19 (JSON-LD) | Publisher/author "Pilotprotocol" organization at pilotprotocol.network | Site exists (install.sh 200); org naming fine | — |

## Verified claims (grouped by source)
- Live URLs (curl 200): dev.to article, chain.link article, github.com/denizumutdereli/agents-p2p-network, github.com/ipfs/service-worker-gateway/issues/972, nulifedigital.co.uk/services/{software-solutions,system-integration}, Supabase image, https://pilotprotocol.network/install.sh (200)
- Local site files: internal links /blog/decentralized-communication-protocols-ai-developers, /blog/protocol-wrapping-secure-peer-to-peer-ai-systems, /blog/trust-network-protocols-secure-decentralized-systems, /blog/nat-traversal-ai-agents-deep-dive, /blog/openclaw-agents-behind-nat-zero-config, /blog/connect-ai-agents-behind-nat-without-vpn, /blog/peer-to-peer-agent-communication-no-server, /blog/trustless-protocols-that-secure-decentralized-ai-systems, /blog/secure-communication-protocols-distributed-ai-systems, /blog/cloud-networking-secure-peer-to-peer-distributed-ai, /for/p2p — all pages exist under src/pages; banner public/blog/banners/legacy-protocol-integration-for-secure-distributed-ai.jpg exists
- web4 source: Pilot P2P overlay, NAT traversal, encrypted tunnels, mutual trust, persistent virtual addresses (pkg/daemon, keyexchange/derive.go, tunnel.go); CLI + Go SDK (common@v0.5.0/driver), Python SDK (pre-verified sdk-python repo exists)
- General protocol knowledge: HTTP/SOAP/Modbus request-response design, WiFi/NAT/firewall behavior, gateway single-point-of-failure reasoning — descriptive, consistent with public specs
- Remaining sentences: opinion/marketing framing (TL;DR, "hybrid wins", pro tips, table qualitative ratings) — OPINION; scenario values — EXAMPLE
