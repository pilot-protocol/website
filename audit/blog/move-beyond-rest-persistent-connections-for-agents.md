# Claim audit: src/pages/blog/move-beyond-rest-persistent-connections-for-agents.astro
Audited: 2026-07-10 · Sentences examined: 102 · verified: 52 · false: 5 · unverifiable: 9 · opinion: 26 · example: 10

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 69 | "Keepalive probes every 30 seconds maintain the NAT mapping." | Source: `TunnelKeepaliveInterval = 25 * time.Second` (web4 pkg/daemon/tunnel.go:787); daemon-level loops default to 60s (daemon.go:171 DefaultKeepaliveInterval = 60s). Neither is 30s. |
| 164 | Table cell "UDP probe (30s)" for Pilot idle overhead | Same evidence — tunnel keepalive is 25s, not 30s |
| 191 | `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` | Public repo pkg/ has only daemon + telemetry (gh api); Go SDK is github.com/pilot-protocol/common/driver (pre-verified) |
| 202, 233 | `d, _ := driver.Connect()` (no argument) | Signature is `Connect(socketPath string)` — common@v0.5.0/driver/driver.go:62 |
| 203, 234 | `stream, _ := d.OpenEventStream()` + `stream.Subscribe`/`stream.Publish` | No such methods on the driver; API is SendTo/RecvFrom (driver.go:170,202) |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "Studies on real-world polling systems show that only 1.5% of HTTP polls find new data." | No study cited; bolded as a factual statistic | Citation to the polling study |
| 69 | "After this one-time setup (~200ms), the tunnel stays open." | Latency figure with no benchmark | Measured handshake timing |
| 167-173 | Memory-per-connection table: ~8KB WebSocket, ~8KB gRPC, ~4KB MQTT, ~2KB Pilot | Figures presented as facts without measurements | Per-protocol memory benchmarks |
| 34 | "subtle bugs (duplicate messages, lost messages, infinite reconnection loops) are endemic" | Sweeping ecosystem claim, no data | Bug-tracker survey |
| 54 | "MQTT … does not do NAT traversal" / gRPC/WebSocket "misses NAT-traversing" | Third-party protocol capability generalizations (broker topology actually sidesteps NAT) — simplification, uncited | Protocol docs comparison |
| 127-133 | Auto-reconnect column: WebSocket "DIY", gRPC "DIY", MQTT "Library-dependent" | Third-party library behavior generalizations | Library docs |
| 259 | "If either agent restarts, it resubscribes and picks up new events immediately." | Eventstream restart semantics not exercised in this audit | eventstream plugin behavior test |
| 314 | "The Pilot daemon runs alongside your existing services, using 10 MB of memory." | RSS figure not benchmarked | Measured daemon RSS |
| 69 | "If the network changes (WiFi to cellular, IP rebind), the tunnel detects the change and reconnects." | Rebind behavior plausible (nat_remap tests exist) but not confirmed end-to-end | Network-change integration test |

## Verified claims (grouped by source)
- web4 pkg/daemon/keyexchange/derive.go + crypto.go: X25519 key exchange, HKDF-SHA256 → 32-byte key → AES-256-GCM (built-in encryption); registry-resolved virtual addresses, NAT traversal (direct/hole-punched/relayed) per pkg/daemon tunnel/relay code
- cmd/pilotctl/main.go: `pilotctl send-message <addr> --data '...'` (usage line 846); `pilotctl subscribe <broker-addr> "topic"` (1331); `pilotctl publish <broker-addr> topic --data '...'` (1339); `pilotctl daemon start --email agent@example.com` (--email flag, line 1012)
- Live URLs (curl 200): https://pilotprotocol.network/install.sh (install one-liner works), github.com/pilot-protocol/pilotprotocol, en.wikipedia.org/wiki/REST, RFC 6455 datatracker link, grpc.io
- Pre-verified: event stream on well-known port 1002
- Arithmetic: 1/60 ≈ 1.7% hit rate; 6,000 req/min for 100 agents; N*(N-1)/2 = 45 / 4,950 / 499,500 — all correct
- Public protocol knowledge: REST request-response/unidirectional model, WebSocket sticky-session/load-balancer issues, WebSocket client-server topology, MQTT broker star topology, gRPC over HTTP/2 ping — consistent with RFC 6455, MQTT and gRPC specs
- Local site: banner public/blog/banners/move-beyond-rest-persistent-connections-for-agents.webp exists
- EXAMPLE: Python polling loop, agent addresses 1:0001.0001.0001 / 1:0001.0002.0001, task/result JSON payloads, <broker-addr> placeholders, "confidence":0.95
