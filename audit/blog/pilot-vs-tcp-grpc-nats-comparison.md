# Claim audit: src/pages/blog/pilot-vs-tcp-grpc-nats-comparison.astro
Audited: 2026-07-10 · Sentences examined: 138 · verified: 78 · false: 3 · unverifiable: 24 · opinion: 28 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 318 | "Zero external dependencies -- one Go binary for the daemon, one for the CLI." | web4/go.mod requires third-party modules (github.com/coder/websocket v1.8.15, golang.org/x/sys v0.46.0, expr-lang/expr indirect) plus 15 pilot-protocol modules; also cmd/ builds three binaries (daemon, pilotctl, updater) |
| 357 | "The driver package (<code>pkg/driver</code>) is Go-only." | Pre-verified: public pilotprotocol repo has NO pkg/driver; the Go SDK lives at github.com/pilot-protocol/common/driver. Wrong path (Go-only part is true) |
| 320 vs 356 | "approximately 10% less on sustained transfers" (line 320) vs "The 20% gap is the cost of userspace transport" (line 356) | Self-contradiction within the same post; the article's own numbers (50 vs 62 Mbps) imply ~19% |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 136 | "We benchmarked all four protocols ... two GCP e2-standard-2 instances ... 85ms baseline RTT ... 100 iterations; we report the median." | Presented as a real measurement; no benchmark data, scripts, or raw results published anywhere in repo or site | Published benchmark harness + raw results |
| 140-171 | Connection-setup table: TCP ~85ms, TCP+TLS ~170ms, gRPC ~175ms, NATS ~90ms, Pilot ~15ms amortized | Same — measurement claims with no source data | Same |
| 177-203 | Latency table: p50/p99 figures (170/178, 173/184, 175/192, 171/180 ms) | Same | Same |
| 209-235 | Throughput/memory table: 62/54/45/50 Mbps; 8/52/120/10 MB RSS | Same | Same |
| 173 | "Pilot's amortized model saves seconds of cumulative setup time" (50-agent fan-out) | Derived from unverified benchmark numbers | Same |
| 240 | "Pilot's 10 MB memory footprint includes the daemon, all connections, and encryption state" | No measurement source | Memory profile output |
| 247 | "In production, 88% of networks involve NAT." | No citation; could not find a source for this statistic | Citation to a study |
| 318 | "Single UDP socket ... keeps memory under 25 MB even at 100 concurrent peers" | No published measurement; also tension with the 10 MB figure above | Load-test data |
| 360 | "NATS powers messaging at companies like Synadia and Mastercard" | Synadia is the NATS maintainer (circular); Mastercard usage uncited and not confirmable with available tools | nats.io case study / adopters page citation |
| 205 | "gRPC's slightly higher p99 comes from Protobuf serialization and HTTP/2 framing overhead" / "NATS adds a broker hop, which explains its marginally higher tail latency" | Causal explanations of unverified measurements | Profiling data |
| 360 | "gRPC has thousands of production deployments" | Plausible but uncited count | Citation |

## Verified claims (grouped by source)
- web4 source: X25519 + AES-256-GCM default encryption — pkg/daemon/tunnel.go:534,1472; 48-bit virtual addresses N:NNNN.HHHH.LLLL — README.md:174, pkg/daemon/daemon.go:2541; Ed25519 identity keys — pkg/daemon/tunnel.go (crypto/ed25519 verify); event stream port 1002 and data exchange port 1001 — pkg/daemon/daemon.go:110-111 and pre-verified well-known ports; daemon + pilotctl binaries — web4/cmd/
- protocol@v1.10.5 module: gateway DefaultPorts includes 80/443/1000/1001/1002 — plugins/gateway/gateway.go:18, supporting "Pilot's HTTP port (80) and gateway component" and "gateway maps Pilot addresses to local IPs" (gateway module exists, pre-verified repo list)
- Pre-verified: STUN + hole-punch + relay three-tier NAT traversal; registry + beacon infrastructure; Go SDK via driver (common/driver); github.com/pilot-protocol/pilotprotocol exists (CTA)
- Local site files: internal links /blog/how-pilot-protocol-works, /blog/benchmarking-http-vs-udp-overlay, /blog/replace-message-broker-twelve-lines-go all exist in src/pages/blog; banner public/blog/banners/pilot-vs-tcp-grpc-nats-comparison.webp exists
- Protocol standards / vendor docs (well-known): TCP = reliable ordered byte stream, 1-RTT SYN/SYN-ACK/ACK, kernel congestion control, no framing/encryption/discovery/NAT traversal; TLS 1.3 handshake; gRPC = Google RPC on HTTP/2 + Protobuf, bidirectional streaming, deadlines, interceptors, TLS, no NAT traversal, ~12+ official languages (grpc.io); NATS = pub/sub, request/reply, queue groups, at-most-once core delivery, JetStream persistence/exactly-once/KV, 40+ clients (nats.io), broker sees plaintext client payloads (TLS is hop-by-hop), outbound-only connections defeat NAT; Envoy/Istio as gRPC NAT workarounds; Consul/etcd/DNS SRV as discovery
- Code snippets (lines 269-327): syntactically correct example usage; addresses/hosts are EXAMPLE values; driver.Dial(daemon, addr, 1001) matches driver API shape and dataexchange port

Fire-and-forget event stream (no durable log), "ecosystem is young", "no single best protocol", best-for recommendations classified OPINION/verified-architecture as appropriate.
