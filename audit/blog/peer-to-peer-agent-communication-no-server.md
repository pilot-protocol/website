# Claim audit: src/pages/blog/peer-to-peer-agent-communication-no-server.astro
Audited: 2026-07-10 · Sentences examined: 92 · verified: 48 · false: 2 · unverifiable: 4 · opinion: 18 · example: 20

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 151-168 | Go example: `import "pilotprotocol/pkg/driver"` … `driver.New("/tmp/pilot.sock")` … `d.Dial("agent-b", 1001)` | Real SDK is github.com/pilot-protocol/common (pre-verified); common@v0.5.0/driver/driver.go:62 exports `Connect(socketPath)`, not `New`; `Dial(addr string)` takes ONE arg (port form is `DialAddr(protocol.Addr, uint16)`). Also uses `fmt` without importing it. Public pilotprotocol repo has no pkg/driver (pre-verified). |
| 172-177 | Python example: `import pilotprotocol as pilot` … `async with pilot.connect("agent-b", port=1001)` … `await conn.send/recv` | sdk-python README (gh api, verified 2026-07-10): API is synchronous `Driver()` context manager with `d.dial("addr:port")` and `conn.write/read`. No module-level `connect`, no async API. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 41 | "88% of networks involve NAT." | No source cited; no measurement found in repo | Citation to a published NAT prevalence study |
| 88-98, 128-136 | Mutual trust flow shown as both sides running `pilotctl handshake` at each other | pilotctl handshake help (cmd/pilotctl/main.go:932) says "The remote node must approve the request" via `pilotctl approve`/`pending`; reciprocal-handshake-as-approval not confirmed in source | Tracing handshake plugin logic showing a reverse handshake finalizes trust |
| 110, 195, 219 | "Install (30 seconds)" / "One command, 30 seconds" setup time | Timing claim with no benchmark | A timed install run |
| 32 | Tunnel has "automatic segmentation" and "congestion control" — verified; but "Latency overhead: Zero (just network RTT)" (L189) ignores daemon/crypto overhead | Absolute "zero overhead" not benchmarkable from source | Latency benchmark vs direct socket |

## Verified claims (grouped by source)
- web4/pkg/daemon/daemon.go:2541 + tunnel.go: 48-bit virtual address; endpoint cache "last-known endpoint" (daemon.go:367); X25519 + AES-256-GCM tunnel encryption (tunnel.go:534); STUN discover via beacon (tunnel.go:2147); relay forwards opaque encrypted packets (e2e encryption at tunnel layer).
- web4/pkg/daemon tests + ports.go: sliding window, AIMD congestion control, flow control, segmentation.
- web4/cmd/pilotctl/main.go: `daemon start|stop|status` (l.1670-1690), `--hostname` accepted by daemon start (buildDaemonArgs → --hostname; cmd/daemon/main.go:87), `connect <host> [port] --message` (help l.896-901), `handshake`, `untrust`, `status` all exist (pre-verified command list).
- Pre-verified: /tmp/pilot.sock default socket; Ed25519 identity (cmd/daemon -identity flag); pip package pilotprotocol; port 1001 = dataexchange.
- Live curl 2026-07-10: https://pilotprotocol.network/install.sh → 200.
- Local site files: /for/p2p, /blog/nat-traversal-ai-agents-deep-dive, banner webp all exist under src/pages / public.
- Opinion/architecture reasoning (middlemen problems, when-to-use lists, comparison-table qualitative cells): OPINION. Terminal outputs, RTT figures, sample address 1:0001.A3F2.00B1, endpoint 34.148.103.117:4000: EXAMPLE.
