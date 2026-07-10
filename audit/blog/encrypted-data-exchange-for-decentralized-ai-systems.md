# Claim audit: src/pages/blog/encrypted-data-exchange-for-decentralized-ai-systems.astro
Audited: 2026-07-10 · Sentences examined: 118 · verified: 48 · false: 6 · unverifiable: 11 · opinion: 31 · example: 22

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 159 | "Libsodium's crypto_box_easy generates a random nonce for every message automatically." | libsodium docs (doc.libsodium.org, authenticated_encryption): `crypto_box_easy(c, m, mlen, n, pk, sk)` takes the nonce `n` as an explicit caller-supplied parameter; the caller must generate it (e.g. randombytes_buf). No auto-nonce variant by that name. |
| 152 | "It handles nonce generation and padding automatically." (about crypto_secretbox/crypto_box) | Same — both secretbox and box APIs require the caller to supply the nonce; libsodium does not generate it for you. |
| 278 | FAQ: "Use libraries like libsodium that handle randomized nonces automatically per message rather than implementing your own nonce scheme." | Same evidence — libsodium does not randomize nonces automatically. |
| 167 | "use the Noise IK pattern. This completes the handshake in 1.5 round trips" | Noise spec (noiseprotocol.org, pattern IK): IK is a 2-message pattern = 1 round trip. XX (3 messages) is the 1.5-round-trip pattern. Numbers swapped. |
| 168 | "use Noise XX. It takes one full round trip more" | XX is 3 messages vs IK's 2 — half a round trip more, not a full one (Noise spec handshake patterns). |
| 26 vs 290 | JSON-LD "datePublished": "2026-05-07" vs page frontmatter date "May 10, 2026" | Internal inconsistency within the same file (line 26 vs line 290) — the two published dates contradict each other. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 87 | "The 2022 Signal metadata analysis demonstrated that even with perfect content encryption, traffic analysis ... can reconstruct social graphs ... with high accuracy." | No citation; no such widely-known 2022 study locatable | Citation to the actual paper |
| 234 | "68% of cloud deployments had encryption exposure events in 2024 due to misconfiguration, even when TLS 1.3 was in use." | Uncited statistic, no locatable source | Named industry report |
| 234 | "Kafka TLS 1.3 with Vault-managed mTLS achieves 98% of unencrypted throughput at 10GB scale" | Uncited benchmark | Published benchmark |
| 65 | "Most data leaks trace back to poor key generation, storage, or rotation practices." | Uncited statistic | Breach-report data |
| 73 | "Automation and routine checks for nonce misuse and misconfigurations prevent the majority of breaches." | Uncited "majority" claim | Study citation |
| 233 | "Key management failures are the primary cause of E2EE breakdowns in production." (repeated line 272) | Uncited | Incident data |
| 262 | "Harvest-now-decrypt-later attacks are already occurring, where adversaries capture encrypted traffic today..." | Widely asserted but no confirmed public incident cited | Documented incident/intel report |
| 126 | mTLS forward secrecy "Partial" | Depends on TLS version/ciphersuite (TLS 1.3 is always FS); blanket "Partial" not checkable as stated | Qualification by TLS version |

## Verified claims (grouped by source)
- Live URLs (all HTTP 200, 2026-07-10): 4x Supabase blog images, dev.to E2EE-metadata article, deepwiki bitchat Noise page, askantech E2EE guide, cloudtoolstack multi-cloud encryption page, doc.libsodium.org.
- arxiv.org/abs/2511.11619 (HTTP 200): title confirms "DIAP: A Decentralized Agent Identity Protocol with Zero-Knowledge Proofs and a Hybrid P2P Stack" — matches the article's DIAP description (DID/ZKP/P2P stack).
- Local site files: internal links all exist — src/pages/blog/{why-autonomous-agents-need-private-discovery, zero-dependency-encryption-x25519-aes-gcm, decentralized-communication-protocols-ai-developers, securing-ai-agent-networks-multi-cloud-environments, secure-communication-protocols-distributed-ai-systems, trustless-protocols-that-secure-decentralized-ai-systems, network-security-for-multi-agent-systems-key-strategies, multi-cloud-networking-decentralized-ai-systems, autonomous-agent-networking-distributed-ai, ai-networking-best-practices-secure-scalable-systems}.astro; src/pages/for/p2p.astro; public/research/ietf/draft-teodor-pilot-problem-statement-01.html; banner .jpg exists.
- web4/pkg/daemon/keyexchange + pre-verified cheatsheet: Pilot provides virtual addresses, encrypted tunnels (X25519 + AES-GCM), NAT traversal (line 267 claims).
- Cryptography general knowledge / public specs: Signal = X3DH + Double Ratchet with forward secrecy & post-compromise security, powers Signal/WhatsApp; Noise uses X25519 DH + ChaCha20-Poly1305 AEAD; WireGuard uses Noise IK, libp2p uses Noise (XX); crypto_secretbox = XSalsa20-Poly1305, crypto_box = Curve25519+XSalsa20-Poly1305; tink is Google's multi-language crypto library; NIST-standardized ML-KEM (Kyber, FIPS 203) and ML-DSA (Dilithium, FIPS 204); envelope encryption DEK/KEK flow with AWS KMS / Azure Key Vault / GCP Cloud KMS (SSE-KMS, SSE-C, CSEK, CMEK are real options); HKDF derivation; E2EE does not protect metadata; W3C DIDs; nonce reuse breaking AEAD confidentiality; TLS protects transit only.
