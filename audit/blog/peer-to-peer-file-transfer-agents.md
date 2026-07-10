# Claim audit: src/pages/blog/peer-to-peer-file-transfer-agents.astro
Audited: 2026-07-10 · Sentences examined: 105 · verified: 58 · false: 5 · unverifiable: 2 · opinion: 14 · example: 26

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 45, 173 | `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` | Public pilotprotocol repo has NO pkg/driver (pre-verified). Real Go SDK is github.com/pilot-protocol/common/driver. |
| 84 | `conn, err := drv.Dial(targetAddr, 1001)` | common@v0.5.0/driver/driver.go:77 — `Dial(addr string)` takes one argument; the (addr, port) form is `DialAddr(protocol.Addr, uint16)` (l.87). Code as written does not compile against the SDK. |
| 98, 103-105, 137 | Sender code uses `json.Marshal` without importing encoding/json; `conn.Read([]byte{ack})` reads into a temporary slice so `ack` is never set (always 0) — the "receiver rejected transfer" / checksum checks can never behave as described | Go semantics: value copied into a new slice; missing import fails compile. |
| 265 | "Pilot's transport layer splits it into MTU-sized segments (typically 1200-1400 bytes for UDP)." | web4/pkg/daemon/ports.go:204 — `MaxSegmentSize = 4096 // MTU for virtual segments`. |
| 271 | "There is no option to disable encryption -- it is always on." | web4/cmd/daemon/main.go:65 — `-encrypt` flag (default true) explicitly allows disabling tunnel-layer encryption. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 271 | "A random nonce prefix per connection prevents nonce reuse across sessions." | tunnel.go shows 12-byte nonce + replay-window counters, but no "random prefix per connection" construct located | Reading nonce construction in tunnel.go deriveSecret/seal path |
| 294 | "Resumability … Reconnect and continue from offset" listed as a Pilot capability | Resume is application-level (as the article's own code shows), not a Pilot transport feature; no daemon offset tracking found | Daemon-side resume/offset API in source |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/packet.go: 34-byte packet header with sequence number (l.23 header layout); 2-byte Window field at bytes 28-29 advertising receive window (flow control).
- web4/pkg/daemon: sliding window + AIMD congestion control (SSThresh/cwnd tests), X25519 + AES-256-GCM (tunnel.go:534), STUN/hole-punch/relay tiers, [PILS][nodeID][12-byte nonce][ciphertext+GCM tag] frame (tunnel.go:1081).
- common@v0.5.0/driver/driver.go: `driver.Connect("/tmp/pilot.sock")` (l.62) and `drv.Listen(1001)` (l.144) — receiver-side API calls are correct.
- Pre-verified: port 1001 = dataexchange well-known port; /tmp/pilot.sock; repo pilot-protocol/pilotprotocol exists (GitHub CTA link OK).
- Public AWS docs (well-known published figures): S3 max object size 5 TB; S3 internet egress $0.09/GB (first tier) → the $1.80 / $180 arithmetic follows.
- Arithmetic: 2 GB checkpoint → 4 GB total bandwidth via cloud relay.
- Local site files: /blog/secure-research-collaboration-share-models-not-data, /blog/nat-traversal-ai-agents-deep-dive, /docs/ (src/pages/docs/index.astro), banner webp all exist. Wikipedia P2P file sharing link → 200.
- OPINION: compliance framing, "most compelling advantage", use-case narratives. EXAMPLE: all remaining code listings, chunk sizes, progress logging.

## Resolutions (2026-07-11 iter 45)
- L45/L173 import: already fixed in the iter-21 batch (common/driver).
- L84 (drv.Dial(targetAddr, 1001) — wrong arity): switched to drv.Dial(targetAddr + ":1001"), the single-string form (driver.go:77).
- L98/L103-105/L137 (missing encoding/json import + conn.Read([]byte{ack}) never sets ack): added encoding/json to the sender imports; changed to ack := make([]byte, 1); conn.Read(ack); test ack[0] (both spots).
- L265 ("MTU-sized segments 1200-1400 bytes"): corrected to Pilot's MaxSegmentSize = 4096 (ports.go:204).
- L271 ("no option to disable encryption"): corrected — the daemon has a -encrypt flag (default true); reworded to note it can be turned off with -encrypt=false but shouldn't. Also softened the "random nonce prefix" line (unverifiable) to "per-connection nonce scheme".
Build: npm run build green (345 pages).
