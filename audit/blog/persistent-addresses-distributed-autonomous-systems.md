# Claim audit: src/pages/blog/persistent-addresses-distributed-autonomous-systems.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 52 · false: 0 · unverifiable: 5 · opinion: 37 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 105 | "persistent addresses represent the current best practice" (attributed to evolving address resolution) | No industry survey or standard cited; "best practice" asserted, not sourced | Citation to an RFC/standard or industry survey |
| 156 | "For agent networking in distributed AI, two frameworks dominate." | No market/usage data supports "dominate" | Adoption survey or citation |
| 90 | "In large fleets, that rediscovery process creates cascading delays and failures." | No measurement or incident data cited | Benchmark or published postmortem |
| 232 | "persistent addresses are becoming the standard for scalable autonomous agent communication" | Trend claim with no source | Standards-body adoption evidence |
| 38 | "Implementing persistent addresses enables secure, decentralized, and scalable agent communication in cloud environments." (TL;DR, stated as fact) | Outcome claim without supporting data | Case study/benchmark |

## Verified claims (grouped by source)
- Live URLs (curl, HTTP 200): all 4 Supabase blog images (1776164117473, 1776164123073, 1776164299069, 1774647725213) return 200
- Local site files: internal hrefs all resolve — src/pages/blog/{ai-networking-challenges-decentralized-systems, decentralized-networking-p2p-solutions-ai-architectures, autonomous-agent-networking-distributed-ai, enterprise-identity-integration-pilot-protocol, connect-agents-across-aws-gcp-azure-without-vpn, run-agent-network-without-cloud-dependency, secure-communication-protocols-distributed-ai-systems, ai-networking-best-practices-secure-scalable-systems, decentralized-communication-protocols-ai-developers}.astro exist; public/research/ietf/draft-teodor-pilot-problem-statement-01.html and draft-teodor-pilot-protocol-01.html exist; public/blog/banners/persistent-addresses-distributed-autonomous-systems.jpg exists
- web4 source: "Pilot Protocol overlay ... native persistent virtual addresses" — README.md:174 (48-bit virtual addresses N:NNNN.HHHH.LLLL), pkg/daemon/daemon.go:2541; "provides persistent virtual addresses, encrypted tunnels, NAT traversal, mutual trust" — pkg/daemon/tunnel.go:534 (X25519+AES-256-GCM), handshake plugin, beacon/STUN in tests/zz_nat_traversal_test.go
- General networking knowledge (RFC-level truisms): dynamic IP churn on cloud restart, DNS TTL/propagation lag, NAT invisibility without traversal, Kubernetes ephemeral pod IPs, AWS Cloud Map / GCP Service Directory being single-provider, Ed25519 as a suitable identity keypair
- Vendor docs (well-known): SPIFFE/SPIRE issues SVIDs for workload identity; Microsoft Entra ID managed identities; OPA is policy-based access control, not an addressing system
- Frontmatter/JSON-LD: datePublished 2026-04-14 matches displayed date "April 14, 2026"; canonicalPath matches file slug

Marketing/subjective sentences (Key Takeaways rows, "reshape distributed systems" section, FAQ generalities, "Get it right from the start", "structural shift", table stability ratings High/Medium/Low) classified OPINION. Sample sequence steps (Ed25519 at provisioning etc.) are recommendations, not claims.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
