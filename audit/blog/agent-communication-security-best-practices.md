# Claim audit: src/pages/blog/agent-communication-security-best-practices.astro
Audited: 2026-07-10 · Sentences examined: 64 · verified: 45 · false: 4 · unverifiable: 2 · opinion: 13 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 91 (also 202, 233) | "Benchmarks show models can leak sensitive information under cooperation dialogs" citing arxiv.org/html/2410.07553v2 | Fetched paper is "COMMA: A Communicative Multimodal Multi-Agent Benchmark" — zero occurrences of "leak" in the full HTML; it does not support the leakage claim. Wrong citation. |
| 109 | "MLS … is defined in RFC 9750" | RFC 9750 is "The Messaging Layer Security (MLS) Architecture" (rfc-editor.org title). The MLS protocol is defined in RFC 9420 "The Messaging Layer Security (MLS) Protocol". |
| 224 | "With support for mTLS, NAT traversal, and cross-cloud connectivity" (about Pilot Protocol) | grep of entire web4 source (cmd/, pkg/): zero mTLS/mutual-TLS occurrences. Pilot uses X25519 + AES-256-GCM tunnels with Ed25519 identity, not mTLS. |
| 26 vs 248 | JSON-LD datePublished "2026-05-05" vs frontmatter date "May 8, 2026" | Internal inconsistency — the two published dates in the same file disagree. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 218-219 | "The failure pattern we see repeatedly…" / "mismatched assumptions … one of the most common failure points we observe in deployed systems" | First-person observational claim with no data or deployment evidence | Incident data, survey, or case studies |
| 105 | "Use time-bounded tokens with a maximum lifetime of 60 seconds … to eliminate both replay and race conditions" | "Eliminate" is an absolute security claim with no source; 60s figure is unsourced prescription | A standard or analysis supporting the bound |

## Verified claims (grouped by source)
- arXiv 2505.08807v1 (HTTP 200, fetched): title "Security of Internet of Agents: Attacks and Countermeasures"; text contains spoofing (7×), replay, leakage (14×) — supports the risk list at lines 80-87 and FAQ line 231.
- RFC 9750 (mirror andrew-scott.co.uk PDF HTTP 200; rfc-editor.org title confirmed) + RFC 9420: MLS provides confidentiality, authentication, forward secrecy, post-compromise security, protection against eavesdropping/tampering/forgery — supports the properties table (lines 111-141) and FAQ answers (229, 235), aside from the RFC-number misattribution flagged above.
- packetlabs.net replay-attack guide (HTTP 200): nonces/unique identifiers as primary replay control (line 98).
- web4 source / protocol module: Pilot paragraph (line 224 except mTLS) — encrypted p2p tunnels (keyexchange/derive.go X25519+AES-256-GCM), mutual trust establishment (driver Handshake/WaitForTrust), persistent 48-bit virtual addresses (protocol address.go), NAT traversal (daemon.go STUN/relay), no centralized brokers.
- Pre-verified / repos: Python SDK (pilot-protocol/sdk-python) and Go SDK (common/driver) exist — "Python or Go SDK" (line 224).
- Live URLs (HTTP 200): vansah.com recommended link, all supabase images.
- Local site files: internal hrefs (secure-communication-protocols-distributed-ai-systems, network-security-for-multi-agent-systems-key-strategies, secure-ai-agent-communication-zero-trust, decentralized-communication-protocols-ai-developers, trust-model-agents-invisible-by-default, multi-agent-system-networking-guide-ai-developers, secure-network-infrastructure-ai-agents-practical-guide, /for/p2p, and all Recommended posts) exist under src/pages; banner .jpg exists in public/blog/banners.
- General cryptography/security facts (nonce definition, mTLS mutual certificates, digital signatures for async dispatch, cert pinning, bearer-token weakness, short-lived certs): standard practice, verified as accurate general knowledge; hortatory guidance counted as OPINION.
