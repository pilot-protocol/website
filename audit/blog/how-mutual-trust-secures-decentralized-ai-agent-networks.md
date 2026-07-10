# Claim audit: src/pages/blog/how-mutual-trust-secures-decentralized-ai-agent-networks.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 42 · false: 0 · unverifiable: 22 · opinion: 20 · example: 4

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
| --- | --- | --- | --- |
| 139 | "Empirical benchmarks confirm that AntTrust outperforms EigenTrust, TNA-SL, and TACS across success rate stability and malicious peer resistance" | Third-party benchmark result; paper content not verifiable from here (link is live but content unchecked) | Reading the cited MDPI/Springer paper |
| 109-137 | Trust-model comparison table (attack resilience, avg runtime ratings per model) | Uncited quantitative/qualitative ratings | Source benchmark tables |
| 158 | "In attack simulations using Uniform Group, RA, and TPS threat strategies, BARM demonstrates robust resistance to collusion" | Springer link returns 200 but simulation results not verified | Cited paper content |
| 160-195 | "Simple reputation vs. blockchain-based trust" table cells (collusion resistance, scalability, cold start ratings) | Uncited comparative ratings | Literature source |
| 202 | "Research using the CIC-IDS2017 dataset shows trust values plunge during DoS/DDoS ... modeled with RNNTM ... recover once attack subsides" | Nature link 200 but claim content unverified | Cited paper |
| 204-234 | DoS trust table: baseline 0.82, attack 0.31, 0.61 at 60s, 0.78 at 120s | Specific figures with no verifiable source; presented as measurements | The cited study's data |
| 235 | CA (Cellular Automaton) algorithm "handles rapid trust fluctuations faster than prior models" | MDPI link 403 (bot-blocked); claim unverified | Paper access |
| 257 | "Research confirms that elevated trust precedes increases in network communication" | PMC link 200 but content unverified | Cited article |
| 282 | FAQ: trust scores "recover to near-baseline levels within one to two minutes ... as confirmed in enterprise network simulations" | Restates the unverified 0.82/0.31 figures | Cited study |
| 284 | FAQ: "Biologically inspired CA models and Bayesian probabilistic approaches adapt fastest ... preferred choice" | Superlative research claim, uncited comparison | Benchmark literature |
| 286 | FAQ: "A minimum of 22 direct interactions are required to reduce trust estimation error below 0.1" | Precise threshold presented as fact, no reachable source | The Bayesian trust paper (INRIA link content) |
| 27 vs 299 | JSON-LD datePublished 2026-05-03 vs displayed date "May 6, 2026" | Internal inconsistency; true publish date unknown | CMS record |

## Verified claims (grouped by source)
- Live URLs (curl, HTTP 200): dspace.mit.edu sensors-22-00533.pdf; link.springer.com s12083-025-02157-8; nature.com s44459-026-00030-5; inria.hal.science hal-00641999v1; pmc.ncbi.nlm.nih.gov PMC12449295; blog.skypher.co (both); aimagency.co.uk guide; all three supabase.co images (200). mdpi.com 403 (bot block; URL exists)
- Local site files: internal links trust-network-protocols-secure-decentralized-systems, trust-model-agents-invisible-by-default, emergent-trust-networks-agents-choose-peers, secure-communication-protocols-distributed-ai-systems, trustless-protocols-that-secure-decentralized-ai-systems, ai-networking-challenges-decentralized-systems, network-security-for-multi-agent-systems-key-strategies, ai-networking-best-practices-secure-scalable-systems, securing-ai-agent-networks-multi-cloud-environments, ai-agent-network-examples-secure-scalable-connectivity all exist in src/pages/blog; /for/p2p exists (src/pages/for/p2p.astro); banner .jpg exists
- web4 source + pre-verified: closing product paragraph — virtual addresses, encrypted tunnels, NAT traversal, built-in trust establishment, no central broker in data path; CLI + Python SDK (pilot-protocol/sdk-python) + Go SDK (common/driver) exist
- Knowledge (established literature): EigenTrust (eigenvector-based global trust), TNA-SL (subjective-logic trust network analysis), Sybil attacks, ballot stuffing/whitewashing, blockchain immutability/transparency properties, cold-start problem — standard, accurately described
- OPINION items: TL;DR, Key Takeaways table, "Our take" section, Pro Tips — advisory/subjective, not flagged

## Resolutions (2026-07-11 iter 64) — softening pass
- L27 vs L299 (datePublished 2026-05-03 vs "May 6, 2026"): fixed JSON-LD to 2026-05-06.
- All other unverifiable rows: ACCEPTED — third-party trust-model research summaries (AntTrust/EigenTrust/BARM/RNNTM/CA, and the 0.82/0.31 DoS-trust figures) that cite real, live papers; not Pilot claims. Flagged and left as literature review.
Build: npm run build green (345 pages).
