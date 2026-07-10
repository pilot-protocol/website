# Claim audit: src/pages/blog/secure-data-exchange-for-multi-cloud-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 92 · verified: 80 · false: 0 · unverifiable: 2 · opinion: 9 · example: 1

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 224 | "MP-SPDZ and similar frameworks achieve millions of gates per second on LAN environments, with newer protocols reaching over 1 billion 32-bit multiplications per second on 25 Gbit/s LAN connections." | Cited eprint.iacr.org/2026/183 abstract (fetched 2026-07-10) benchmarks MP-SPDZ/HPMPC/MPyC/MOTION but contains neither figure; PDF direct-fetch was 403 | Locating the exact throughput numbers in the paper's results tables |
| 207 | "Agents authenticate on every request and in high-frequency systems, every few milliseconds." | Vendor-behavior generalization with no benchmark or source beyond a trade blog | A measured auth-frequency benchmark of a named agent system |

## Verified claims (grouped by source)
- arxiv.org/abs/2602.11510 (fetched 2026-07-10, HTTP 200): AgentLeak benchmark exists; abstract confirms 68.8% inter-agent leakage vs 27.2% single-agent, and 41.7% of violations missed by output-only audits (used at lines 88, 235, 244).
- eprint.iacr.org/2025/2216 (abstract page fetched, HTTP 200): AgentCrypt paper exists, title "AgentCrypt: Advancing Privacy and (Secure) Computation in AI Agent Collaboration", defines multi-level (Level 1–4, plaintext → FHE) framework (lines 101–107, 248). (Direct PDF URL in the post returns 403 to bots but the paper is real.)
- General cryptography knowledge: MPC joint computation without revealing inputs; FHE computes on ciphertext with heavy overhead; tokenization/DLP descriptions; E2EE does not cover metadata/endpoints (also cited dev.to article, HTTP 200).
- Live URL checks (HTTP 200): dev.to havenmessenger E2EE article, thenetworkdna.com multi-cloud connectivity, controlcenter.cloud KMS/HSM, blog.internetport.com, iotforall.com, supabase images.
- Local site files: all internal hrefs (encryption-protocols-for-secure-ai-systems-a-practical-guide, direct-communication-protocols-ai-agents-guide, secure-ai-agent-networking-workflow-step-by-step, connect-agents-across-aws-gcp-azure-without-vpn, network-tunnels-ai-secure-communication-autonomous-agents, network-security-for-multi-agent-systems-key-strategies, secure-communication-protocols-distributed-ai-systems, secure-network-infrastructure-ai-agents-practical-guide, /for/p2p, + 4 "Recommended" links) exist in src/pages/; banner jpg in public/blog/banners/.
- web4 source / pre-verified: Pilot Protocol virtual addresses, encrypted tunnels, NAT traversal, mutual trust, persistent identities, gRPC/HTTP wrapping (line 241).
- Industry knowledge: IPsec VPN / private interconnect (Equinix) / transit gateway connectivity taxonomy; mTLS mutual certs; short-lived credentials; RBAC; attestation.
- Opinion/marketing (not flagged): "That assumption is costly", "the uncomfortable truth", Pro Tips, "right call for most production deployments".

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
