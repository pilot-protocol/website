# Claim audit: src/pages/blog/federated-learning-p2p-communication.astro
Audited: 2026-07-10 · Sentences examined: 68 · verified: 30 · false: 1 · unverifiable: 14 · opinion: 6 · example: 17

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 326-334 | Go snippet: `import "github.com/pilot-protocol/pilotprotocol/pkg/driver"` ... `driver.Connect()` ... `d.SendFile(peerAddr, gradFile)` | Pre-verified: public pilotprotocol repo has NO pkg/driver — Go SDK is github.com/pilot-protocol/common/driver. In common@v0.5.0, Connect requires a socketPath arg (driver.go:62 `func Connect(socketPath string)`) and the Driver type has NO SendFile method (grep found none) |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "Researchers consistently measure it at 58 to 93 percent of total training latency" | No citation; no specific study checked | Citations to the measurement papers |
| 23 | "gRPC is the default transport for ... Flower, PySyft, and TensorFlow Federated" | Framework transport internals not checked (flower.ai only confirmed reachable) | Framework docs/source showing gRPC transport |
| 41 | "with no size limit imposed by the protocol layer" | Daemon has message size caps per the enterprise post; send-file streaming limits not confirmed in source | send-file implementation showing unbounded streaming |
| 61/79 | "Pilot daemon ... uses 10 MB of memory" / "10 MB of RSS at idle" | No benchmark; not measured | Live RSS measurement of pilot-daemon |
| 79 | "lightweight enough to run on Raspberry Pi and Jetson Nano devices" | No ARM build/test evidence checked | Release artifacts for linux/arm64 + a run |
| 76 | "mathematically equivalent to centralized FedAvg under standard assumptions" | Theoretical claim without citation | Citation to gossip-averaging convergence literature |
| 237-294 | Entire performance table: "~200ms", "~3.2s", "~4.8s", "~3.0s", "~500ms", lines-of-code counts (~15/~200/~2000) | Presented as "We compared" measurements but no benchmark artifact exists | Published benchmark methodology + raw results |
| 296-298 | "resulting in lower transfer times for large payloads"; "built-in congestion control and segmentation, handling large payloads natively" | Depends on unpublished benchmark; congestion-control implementation not verified in source within budget | Benchmark + transport source |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: send-file command (help line 1343, dispatch 1771); peers --search (939-951); global --json flag parsed anywhere in argv (main() flag loop ~1585); daemon start --email (help 1003-1012); daemon status w/ address in JSON (1033, 3132); network join <id> (6735); extras set-tags (1485, 1747-1749 core alias rejected → `pilotctl extras set-tags` correct); received files land in ~/.pilot/received/ (help 1244); handshake <node> [justification] (932); approve (1122); untrust (1107); ping (pre-verified command list)
- web4/pkg/daemon: X25519 + AES-256-GCM tunnels enabled by default (tunnel.go:534, 1472); ECDH handshake (tunnel.go:106-107); STUN discovery via beacon (tunnel.go:2147, daemon.go:96-97, 749); relay fallback through beacon (daemon.go:101-106); 48-bit virtual address (daemon.go:2541); private-by-default visibility control (daemon.go:1121-1126); Ed25519 identity
- Pre-verified: port 1001 = dataexchange well-known port; install.sh at https://pilotprotocol.network/install.sh live; registry+beacon infrastructure (34.71.57.205:9000/:9001)
- grpc.io/docs/guides/performance/: gRPC default max message size 4 MB
- protobuf.dev/programming-guides/proto-limits/: 2GiB protobuf message ceiling
- arxiv.org/abs/1906.08935 ("Deep Leakage from Gradients", HTTP 200): gradient inversion / training-data reconstruction is documented research
- Local site files: /blog/ai-agent-discovery-process-p2p-networks page exists; banner webp exists; en.wikipedia.org/pytorch.org/tensorflow.org/flower.ai links reachable
- EXAMPLE: Python FL node code, sample addresses (1:0001.0002.0003 etc.), peers JSON output, test commands
