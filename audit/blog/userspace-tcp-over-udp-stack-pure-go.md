# Claim audit: src/pages/blog/userspace-tcp-over-udp-stack-pure-go.astro
Audited: 2026-07-10 · Sentences examined: 58 · verified: 34 · false: 3 · unverifiable: 5 · opinion: 12 · example: 4

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 10 | "Our solution was to build a reliable transport layer entirely in userspace over raw UDP using zero external dependencies." | web4/go.mod lists 17 required modules incl. third-party github.com/coder/websocket v1.8.15 and expr-lang/expr, golang.org/x/sys, golang.org/x/net — not zero external dependencies |
| 114 | "…all while keeping our binary dependency-free." | Same go.mod evidence: binary is built with external module dependencies |
| 160 | "…we built a high-performance overlay network without importing a single third-party dependency." | go.mod directly requires github.com/coder/websocket (third-party org) plus indirect expr-lang/expr and golang.org/x packages |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 33 | "Allocating and tearing down thousands of timer objects per second led to measurable CPU spikes." | Internal benchmark anecdote; no profile data available | Published pprof/benchmark data |
| 63 | "Scanning an array of several hundred inflight packets periodically is highly efficient in Go." | Performance assertion without measurement | Benchmark comparing polled scan vs per-packet timers |
| 114 | "This entirely native crypto stack handles thousands of authenticated handshake packets per second without breaking a sweat" | No benchmark available | Handshake throughput benchmark |
| 122 | "making Go's HTTP server work correctly over our overlay exposed five distinct bugs in our IPC layer before we got it right" | Historical anecdote; could not locate the five specific bug fixes | Linked commits/issues for the five bugs |
| 8 | "Existing transport protocols like QUIC were too heavy and did not natively support our requirements for custom addressing and bilateral cryptographic trust handshakes." | "Too heavy" is an unmeasured comparative claim (the addressing/trust part is a design statement) | Comparative evaluation of QUIC vs the custom stack |

## Verified claims (grouped by source)
- web4/pkg/daemon/daemon.go: routeLoop (line 2806) and retxLoop with time.NewTicker(RetxCheckInterval) (lines 4000-4001) match the quoted code; RetxCheckInterval = 100ms (line 202); NagleTimeout = 40ms (line 3711) matching the "40 ms timeout" claim; nagleTimer := time.NewTimer(NagleTimeout) (line 3805); StateEstablished/StateFinWait/StateClosed states exist (lines 3123, 3640); conn.CloseRecvBuf() + d.ports.RemoveConnection(conn.ID) (lines 1538-1539, 3054); SACK decoding (lines 3217-3218); AIMD/cwnd congestion control (lines 3747, 4134); 48-bit pilot address (line 2541 comment).
- web4/pkg/daemon/ports.go: Connection struct has exactly the claimed mutexes — Mu (line 233), RetxMu (252), NagleMu (270), RecvMu (274), AckMu (278) (article line 25).
- web4/pkg/daemon/keyexchange/derive.go: X25519 ECDH + HKDF-derived key feeding aes.NewCipher/cipher.NewGCM for AES-256-GCM (lines 21, 56-67) — matches article lines 93.
- common@v0.5.0/crypto/identity.go:152-188: LoadIdentity with "identity file corrupted: public key does not match private key" — quoted snippet matches (article lines 97-112); Ed25519 identity.
- common@v0.5.0/driver/: deadlineCh channel-broadcast pattern for SetReadDeadline and net.Conn (Read/Write/SetDeadline/Close) implementation (article lines 120-154).
- Pre-verified: repo github.com/pilot-protocol/pilotprotocol exists (line 162 link); Go 1.25 (go.mod: go 1.25.11).
- Environment/user identity: "created by Calin Teodor at Vulture Labs" (line 4) consistent with repo owner calinteodor / teodor@vulturelabs.io.
- Internal links on disk: /docs/enterprise, /docs/getting-started, / (lines 162, 168, 4) exist; banner public/blog/banners/why-ai-agents-need-network-stack.webp exists (line 177).

Code blocks are simplified excerpts of real source (EXAMPLE where they diverge cosmetically, e.g. omitted error handling); MCP/A2A framing and UDP hole-punching descriptions are accurate general statements (RFC-consistent).
