# Claim audit: src/pages/blog/encryption-protocols-for-secure-ai-systems-a-practical-guide.astro
Audited: 2026-07-10 · Sentences examined: 94 · verified: 48 · false: 1 · unverifiable: 13 · opinion: 24 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 27/243 | JSON-LD "datePublished": "2026-05-02" vs frontmatter date="May 5, 2026" | Internal contradiction within the same file — the two published dates disagree by 3 days |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 40 | "Homomorphic encryption and ZKPs are now required for compute-in-use scenarios in decentralized AI" | Normative "required" claim; cited CSA page (200) is a general artifact, not a mandate | A standard/regulation actually requiring HE/ZKP |
| 87 | "…threshold decryption schemes address client dropouts and Byzantine behaviors…" | Cited openreview.net PDF returns HTTP 403; content unconfirmable | Accessible copy of the paper |
| 92 | "ChainML uses HE and zk-SNARKs for privacy-preserving gradient verification…" | Third-party vendor behavior claim, no citation at all | ChainML documentation/paper confirming this |
| 95 | "NIST ML-KEM standards are now available and should be integrated…" (citation) | ML-KEM (FIPS 203) is real — VERIFIED as fact — but cited securityboulevard.com URL returns 403 | Accessible citation (nist.gov FIPS 203 would do) |
| 108-111 | Table: HE overhead "High (10x to 1000x)" | Broad unbenchmarked range, no primary source | Published HE benchmark for stated schemes |
| 114-117 | Table: ZKP overhead "Medium (prover-heavy)" / "5x to 50x (prover)" (also line 159-162) | No benchmark source | zk-SNARK prover benchmark citation |
| 120-123 | Table + text: TEE "3 to 7%" latency overhead (also lines 141, 165-168, 224, 228) | Cited computerfraudsecurity.com article (200) is a pay-walled journal listing; figure not independently confirmable | Accessible benchmark study |
| 126-129 | Table: PQC overhead "Under 5%" | No benchmark source | ML-KEM handshake overhead benchmark |
| 140 | "OpenFHE outperforms Microsoft SEAL in execution time and memory usage for BGV and CKKS…" | Cited eprint.iacr.org/2025/473.pdf returns HTTP 403 from this host | Accessible copy of the ePrint paper |
| 179 | Quote: "Encryption adds 5 to 10% latency in real benchmarks of encrypted inference; FHE remains viable…" | dev.to source is reachable (200) but is an anonymous blog benchmark, not reproducible data | Reproducible benchmark methodology |
| 195 | "The 5 to 10% latency range cited in literature is a baseline…" | Same unverified latency range | Same as above |
| 198 | "Expired or reused keys are among the most common real-world failures in distributed AI security." | Survey-style prevalence claim with no citation | Incident/survey data (e.g. Verizon DBIR-class source) |
| 212 | "Privacy technologies for AI are computationally intensive… lazy relinearization and GPU acceleration make them practical." | nature.com PDF reachable (200) but specific optimization claims not confirmed against paper content | Reading the cited Nature MI paper |

## Verified claims (grouped by source)
- Well-known cryptography/standards facts: TLS 1.3 for transit, AES-256 at rest, HE computes on ciphertext, partially-vs-fully homomorphic tradeoff, ZKP definition, TEEs (Intel SGX, TDX, AMD SEV-SNP) protect from host OS/hypervisor, NIST ML-KEM (FIPS 203) published, CKKS = approximate arithmetic, mTLS for mutual identity, Kubernetes/OPA/Rego ecosystem facts (lines 92-95, 135, 138, 182, 189, 201, 221-226).
- Live URL checks (2026-07-10): cloudsecurityalliance.org artifact 200; computerfraudsecurity.com 200; dev.to benchmark post 200; nature.com PDF 200; blog.skypher.co 200; cryptowatchdog.net 200; both Supabase images 200. 403 (bot-blocked/unconfirmed): openreview.net PDF, securityboulevard.com, eprint.iacr.org/2025/473.pdf.
- Internal links vs src/pages/**: decentralized-communication-protocols…, cloud-networking-secure-peer-to-peer…, secure-communication-protocols…, ai-networking-best-practices…, encrypted-tunnel-advantages…, network-security-for-multi-agent-systems…, securing-ai-agent-networks…, network-tunnels-ai…, why-secure-direct-p2p…, decentralized-networking…, /for/p2p — all exist; public/research/ietf/draft-teodor-pilot-problem-statement-01.html exists.
- web4 source / pre-verified: Pilot provides encrypted tunnels, NAT traversal, mutual trust establishment, persistent virtual addresses; wraps HTTP/gRPC/SSH via overlay (pilotctl map/gateway; daemon -encrypt X25519+AES-256-GCM) (line 219).
- Local site assets: banner jpg exists; canonicalPath matches.

Opinion items: "Key Takeaways" framing, Pro Tips, "perspective" section arguments, decision-framework recommendations.
