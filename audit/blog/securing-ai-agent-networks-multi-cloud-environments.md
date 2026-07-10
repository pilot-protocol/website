# Claim audit: src/pages/blog/securing-ai-agent-networks-multi-cloud-environments.astro
Audited: 2026-07-10 · Sentences examined: 88 · verified: 56 · false: 0 · unverifiable: 6 · opinion: 20 · example: 6

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 90 | "Depending on the attack type, automated exploits succeed at rates as high as 88%." | The 88% figure appears in neither the ARTEMIS abstract (arXiv:2512.09882) nor the BlockA2A abstract; bytez.com link returned HTTP 429 | Full-text citation in either paper or a named source for the 88% figure |
| 68 | "Anchoring agent interactions and access control on blockchain stops most advanced attack vectors." | "Stops most advanced attack vectors" is an unsupported quantified effectiveness claim; BlockA2A abstract claims effectiveness against specific attack classes, not "most" | A study quantifying coverage across attack vectors |
| 72 | "Tools like Defense Orchestration Engine and agent-based vulnerability testing catch threats faster than most humans." | ARTEMIS shows agents outperformed 9/10 humans at *finding* vulns; no source compares DOE threat-*catching* speed to humans | Benchmark comparing DOE detection latency vs human SOC response |
| 158 | "…isolating the affected agent and revoking its credentials within milliseconds." | BlockA2A abstract says "sub-second overhead"; "milliseconds" is a stronger claim not in the abstract | Full-text latency measurements from the BlockA2A paper |
| 193 | "Automated benchmarks like ARTEMIS and ConVerse give you a structured way to measure your network's resilience." | Could not verify existence/relevance of a "ConVerse" security benchmark with available tools | A citation/URL for ConVerse |
| 163–188 | Config benchmark table (credential expiry 1–4h, DOE <1s, audit every 30 days, DID rotation per session/daily) presented as "critical configuration benchmarks to target" | Recommended values have no cited source | Reference to a standard or the BlockA2A paper's recommendations |

## Verified claims (grouped by source)
- arXiv:2508.01332 abstract (HTTP 200, title "BlockA2A: Towards Secure and Verifiable Agent-to-Agent Interoperability"): BlockA2A exists; combines DIDs, blockchain-anchored ledgers, smart contracts for access control; DOE neutralizes attacks in real time with sub-second overhead, instant permission revocation; eliminates centralized trust bottlenecks; FAQ DOE description.
- arXiv:2512.09882 abstract (HTTP 200): ARTEMIS benchmark exists; ARTEMIS outperformed 9 of 10 human testers; 82% valid submission rate (supports "high true positive rates" and "over 80% precision on valid findings"); humans and AI uncover different vulnerability classes (agents: higher false-positive rates, GUI gaps).
- cloudsecurityalliance.org/artifacts/agentic-ai-identity-and-access-management-a-new-approach (HTTP 200): CSA Agentic AI IAM framework exists and recommends DIDs/VCs.
- Local site (src/pages/blog/*.astro all exist): internal links to ai-networking-challenges…, secure-ai-agent-communication-zero-trust, ai-networking-best-practices…, multi-agent-system-networking-guide…, decentralized-networking-p2p…, secure-network-infrastructure…, secure-communication-protocols…, autonomous-agent-networking…, secure-ai-agent-networking-workflow…, connect-agents-across-aws-gcp-azure-without-vpn.
- Live URL https://pilotprotocol.network/research/ietf/draft-teodor-pilot-problem-statement-01.html (HTTP 200) + public/research/ietf/ local file: research link valid.
- Supabase image URLs (HTTP 200) + public/blog/banners/…jpg exists: images resolve; alt text matches captions.
- web4/README.md:174 + source: Pilot provides encrypted P2P connectivity, virtual addressing (48-bit), NAT traversal.
- W3C DID/VC specs & general knowledge (pre-cutoff): definitions of DIDs, VCs, OAuth/SAML centralized IdP model, Zero Trust continuous verification, MITM/credential-compromise/lateral-movement descriptions.
- Frontmatter/JSON-LD: datePublished 2026-04-16 consistent with "April 16, 2026"; canonicalPath matches filename; description matches meta.
- Opinion/marketing (not flagged): IAM comparison table suitability ratings, "Our take" section, key-insight callouts, pull-quote at line 206, next-steps promo copy.
- Example (not flagged): opening compromised-agent vignette (line 42) is framed illustratively.
