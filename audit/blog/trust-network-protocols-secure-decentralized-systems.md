# Claim audit: src/pages/blog/trust-network-protocols-secure-decentralized-systems.astro
Audited: 2026-07-10 · Sentences examined: 74 · verified: 24 · false: 0 · unverifiable: 8 · opinion: 39 · example: 3

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 107 | "RNNTM models dynamic trust evolution using voting permits and peer opinions… designed for mobile and wireless P2P environments" | No source cited anywhere for RNNTM; no primary paper linked | Citation to the RNNTM paper confirming voting permits / mobile P2P design |
| 108 | "RNNTM handles novel attacks and message failures better than static models." | Comparative performance claim with no source | Benchmark or paper comparing RNNTM vs static models |
| 110 | "Blockchain-based trust shows error rates as low as 2.1% at 10,000 nodes, outperforming DAG-based and PKI-based models" | Cited nature.com tables/8 URL returns 200 but content is behind a cookie/JS wall; figures could not be confirmed in the page | Fetching the table content and matching 2.1% @ 10k nodes vs DAG/PKI |
| 149-184 | Technique comparison table ratings (Static graphs Low/Low, GNN High/High, RNNTM "Very High" resilience/adaptability) | Unsourced qualitative ratings presented as factual comparison | Cited benchmark or survey supporting each rating |
| 189 | "Dynamic models like RNNTM recover faster from targeted attacks and message loss." | Same unsourced RNNTM performance claim | Primary source with recovery measurements |
| 221 | FAQ: "Blockchain-based trust offers the lowest observed error rates at scale, with 2.1% error at 10k nodes outperforming DAG and PKI alternatives." | Repeats the unconfirmed 2.1% figure | Same as line 110 |
| 105 | "It struggles when peers join and leave rapidly or when attackers coordinate to inflate each other's scores." | Plausible EigenTrust limitation but not confirmed against the cited handwiki page content | Quote from EigenTrust literature on churn/collusion weakness |
| 209 | "A Sybil attack that fails against EigenTrust today may succeed tomorrow with a coordinated collusion strategy." | Hypothetical security claim, no source | Published attack analysis |

## Verified claims (grouped by source)
- http://handwiki.org/wiki/EigenTrust (HTTP 200): EigenTrust is a reputation algorithm computing global trust via eigenvector-style propagation over normalized local trust values (line 104); collusion vulnerability is the standard cited weakness (table line 126).
- https://www.nature.com/articles/s44459-026-00030-5 (HTTP 200): cited link resolves (line 86); generic P2P trust definition consistent.
- https://www.loginradius.com/blog/engineering/how-ai-agents-communicate (HTTP 200): cited link live (line 193).
- https://www.nature.com/articles/s41598-025-11511-y/tables/8 (HTTP 200): link resolves (figures themselves unverifiable, see above).
- Internal links (src/pages/blog/*, checked on disk): trust-model-agents-invisible-by-default, decentralized-communication-protocols-ai-developers, secure-ai-agent-communication-zero-trust, secure-communication-protocols-distributed-ai-systems, autonomous-agent-networking-distributed-ai, secure-network-infrastructure-ai-agents-practical-guide, how-pilot-protocol-works, why-autonomous-agents-need-private-discovery, decentralized-networking-p2p-solutions-ai-architectures — all exist (lines 98, 100, 142, 192, 206, 212, 228-231).
- public/blog/banners/trust-network-protocols-secure-decentralized-systems.jpg exists (frontmatter bannerImage, line 240).
- Supabase image URLs (lines 8, 31, 87, 111, 215): all HTTP 200.
- Product source /Users/calinteodor/Development/pilot-protocol/web4 (daemon.go, keyexchange/, common/crypto): Pilot Protocol provides virtual addresses, NAT traversal, encrypted tunnels, mutual trust establishment (line 216) — matches implementation and pre-verified ground truths.

Remaining sentences are definitional/editorial prose (zero-trust principles, advice lists, FAQ restatements) classified as OPINION; TL;DR/takeaway tables restate body claims.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
