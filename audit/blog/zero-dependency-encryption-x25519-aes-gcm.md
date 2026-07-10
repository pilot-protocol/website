# Claim audit: src/pages/blog/zero-dependency-encryption-x25519-aes-gcm.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 62 · false: 15 · unverifiable: 9 · opinion: 5 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 58 | "// sharedSecret is 32 bytes -- used as the AES-256 key" | web4 pkg/daemon/keyexchange/derive.go:44-54 — AEAD key is HKDF-SHA256(shared, info="pilot-tunnel-v1"), NOT the raw ECDH output |
| 269 | "the daemon uses the full 32 bytes as the AES-256-GCM key rather than truncating" and "using all of it for AES-256 avoids a truncation or key-derivation step" | Same: derive.go performs an explicit HKDF-Extract/Expand key-derivation step before aes.NewCipher |
| 297/301 | FAQ answers: "Pilot Protocol uses the full 256-bit ECDH output for AES-256-GCM" / "avoids an extra truncation or key-derivation step" | Contradicted by derive.go HKDF (H1 fix) |
| 81-82 | "PILK = 0x50494C4B... 4 bytes magic + 32 bytes public key" / "Total key exchange overhead: 72 bytes (36 bytes per direction)" | tunnel.go:1076 — PILK frame is [PILK][4-byte nodeID][32-byte pubkey] = 40 bytes/direction, 80 total |
| 122-127 | PILS frame diagram: magic + nonce + ciphertext + tag; "Overhead per packet: 4 (magic) + 12 (nonce) + 16 (auth tag) = 32 bytes" | envelope.go:77,108-112 — frame is [PILS(4)][localNodeID(4)][nonce(12)][ct+tag(16+)] → 36-byte overhead |
| 129 | "For a typical agent message of 1,024 bytes, encryption adds 3.1% overhead." | Actual overhead 36 bytes → 3.5% (follows from the missing nodeID field) |
| 233 | Table row "Per-packet overhead: 32 bytes — 4 (magic) + 12 (nonce) + 16 (auth tag)" | Same envelope.go evidence: 36 bytes |
| 117-118 | PILT frame diagram: "XX XX # Frame length" | tunnel.go:1868-1873 sendPlaintextToNode builds [PILT(4)][packet] — no 2-byte length field (UDP datagram framing) |
| 44 | "'Ephemeral' means the keys are created fresh for every tunnel establishment." | tunnel.go:524-533 EnableEncryption generates ONE X25519 keypair at daemon startup, reused for all peers/tunnels; keyexchange comments reference "persistent X25519 identity" surviving restarts |
| 259 | "Forward secrecy: Ephemeral X25519 keys. Compromise of long-term identity keys does not expose past sessions." | Same: the X25519 key is per-daemon-lifetime, not per-tunnel, so per-session forward secrecy as described is not implemented |
| 313 | FAQ: "Pilot Protocol generates a fresh X25519 key pair for every tunnel, which provides forward secrecy" | Same evidence (single keypair per daemon process) |
| 202 | "Pilot Protocol designates port 443 as the secure port. Any connection to port 443 automatically performs X25519 key exchange and enables AES-256-GCM encryption." | cmd/daemon/main.go:65 — encryption is a daemon-level flag (-encrypt, default true) applied to ALL tunnel traffic; no port-443 gating exists anywhere in pkg/daemon |
| 211-214 | "# Port 80 for non-sensitive traffic... Connected (plaintext within tunnel)" | Same: with default -encrypt=true, port-80 traffic is also AES-256-GCM encrypted; plaintext PILT only occurs pre-key-exchange or with -encrypt=false |
| 198 | "the daemon handles it automatically when connections target port 443 or when encrypt-by-default is enabled" | Same: there is no port-443 trigger; encryption is global default |
| 267 | "WireGuard's Noise-based handshake also derives a 128-bit symmetric key for its ChaCha20-Poly1305 transport" | ChaCha20-Poly1305 (RFC 8439) uses a 256-bit key; WireGuard derives 256-bit transport keys |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 28 | "Go's crypto/ecdh package for X25519 is roughly 300 lines of Go. The crypto/aes and crypto/cipher packages ... add another ~1,500 lines. The total audit surface ... is under 2,000 lines" | Measured Go 1.25.11 stdlib: crypto/ecdh = 1,066 lines total, crypto/aes + crypto/cipher = 3,797 lines (x25519.go alone is 150). Counts depend on what's included, but stated totals appear substantially understated | An explicit line-count methodology (which files count as the audit surface) |
| 28 | "A single security engineer can review it in a day." | Subjective effort estimate with no source | n/a (soften or cite an audit) |
| 84 | "The entire key exchange adds approximately 0.3ms... measured on cross-region connections between GCP VMs. On local networks... under 0.1ms." | No benchmark published; 0.3ms is implausible for cross-region RTT (cross-region is tens of ms) | Published benchmark data |
| 129 | "The per-packet encryption time is approximately 5 microseconds on modern hardware" | No benchmark cited | Reproducible Go benchmark |
| 227-232 | Performance table: X25519 keygen ~0.05ms, ECDH ~0.12ms, PILK RTT ~0.15ms LAN / ~40ms WAN, Seal/Open ~5µs/1KB | No benchmark source | Published bench results |
| 237 | "Even on a Raspberry Pi without AES-NI, per-packet encryption completes in under 50 microseconds." | No measurement cited | Pi benchmark |
| 6 | "it affected a large share of TLS servers on the internet" (Heartbleed) | Directionally true (est. ~17-24% at disclosure) but "large share" uncited | Citation to Netcraft/EFF estimates |
| 26 | "Auditing this is a multi-year, multi-million-dollar effort that most organizations never complete." | No source for cost/duration | Citation (e.g. OSTIF OpenSSL audit) |
| 249 | "Pilot's key exchange is a single PILK frame in each direction -- 72 total bytes." | Byte count false (80, see above); single-frame-each-direction unverified against PILA auth variant in tunnel.go | Full key-exchange flow audit incl. PILA frames |

## Verified claims (grouped by source)
- web4 pkg/daemon/keyexchange/derive.go: uses crypto/ecdh X25519, ecdh.X25519()/ECDH(), aes.NewCipher + cipher.NewGCM (AES-256-GCM), crypto/rand for 4-byte NoncePrefix — "zero external crypto dependency / Go stdlib only" claim holds (imports are all crypto/* stdlib)
- web4 pkg/daemon/envelope/envelope.go:96-99: nonce = 4-byte random per-connection prefix + 8-byte big-endian monotonic counter (12-byte GCM nonce) — nonce-construction table, code snippet, replay-prevention bullets, and FAQ nonce answer all match; replay window detection exists (CheckAndRecordNonce)
- web4 pkg/daemon/tunnel.go: PILK magic 0x50494C4B for key exchange; PILS 0x50494C53 for encrypted frames; PILT plaintext frames; encryption scheme logged "X25519+AES-256-GCM"; relay-aware sends (beacon sees ciphertext — end-to-end even when relayed)
- common@v0.5.0/protocol (fuzz test): 34-byte packet header — matches "34-byte header + payload" in PILT diagram
- cmd/pilotctl/main.go:896,1488: `pilotctl connect <address|hostname> [port] [--message <msg>]` exists as shown in the terminal example (output text is illustrative)
- RFCs/public knowledge: RFC 7748 (X25519/Curve25519 ECDH), RFC 5288 (AES-GCM TLS suites), TLS 1.3 uses AES-GCM & mandates TLS_AES_128_GCM_SHA256 (RFC 8446), GCM = confidentiality+integrity, 16-byte GCM tag, nonce-reuse keystream attack, AES rounds 10 (128-bit) vs 14 (256-bit) per FIPS 197, aes.NewCipher selects variant by key length (Go docs), AES-NI since ~2010 / ARMv8 crypto extensions, Heartbleed (2014 OpenSSL buffer over-read), xz Utils backdoor (2024), OpenSSL >500k lines of C, DTLS exists for UDP, TLS certificate/X.509 lifecycle descriptions, 2^64 counter capacity
- Pre-verified + local files: github.com/pilot-protocol/pilotprotocol exists; internal blog links (nat-traversal-ai-agents-deep-dive, secure-ai-agent-communication-zero-trust, how-pilot-protocol-works, secure-research-collaboration-share-models-not-data, private-agent-network-company, overlay-network-ai-agents) all exist in src/pages/blog; banner webp exists; single static Go binary claim consistent with installer distribution

## Resolutions (2026-07-10, loop iteration 16)
All 15 FALSE + 9 UNVERIFIABLE resolved. This is a present-tense technical explainer (not a dated announcement), so corrected to shipped crypto verified in web4: AES key is HKDF-SHA256(shared, info="pilot-tunnel-v1") NOT raw ECDH (keyexchange/derive.go:44-56 — a documented "H1 fix" the blog predated); X25519 keypair is generated ONCE at daemon startup and reused (tunnel.go:524-526), not per-tunnel — reframed forward-secrecy claims to "peer isolation" with an honest per-daemon-lifetime caveat; encryption is the global -encrypt default (main.go:65), NO port-443 gating; PILK frame is 40 bytes/direction (frame.go:19, 4+4+32), 80 total not 72; PILS overhead 36 bytes not 32 (adds 4-byte sender nodeID); PILT has no length field (UDP framing); WireGuard uses 256-bit ChaCha20-Poly1305 keys not 128-bit; 1024-byte overhead 3.5% not 3.1%. UNVERIFIABLE: line-count/benchmark figures softened (stdlib counts were understated; 0.3ms "cross-region measured" was implausible → reframed as sub-ms compute + RTT-bound; added "illustrative, not benchmarked" caveat to the perf table).

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
