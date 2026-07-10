# Claim audit: src/pages/blog/benchmarking-http-vs-udp-overlay.astro
Audited: 2026-07-10 · Sentences examined: 130 · verified: 41 · false: 4 · unverifiable: 32 · opinion: 18 · example: 35

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 136 | "We ran pilotctl bench for 60-second sustained transfers" | cmdBench (web4/cmd/pilotctl/main.go:5918-6010) takes a SIZE argument (`bench <address|hostname> [size_mb]`, default 1 MB, --timeout default 120s) and sends a fixed number of bytes through the echo port. There is no duration mode; a 60-second sustained transfer is not what the tool does. |
| 333-335 | "# Connection timing (included in bench output) / # Latency histogram at 1KB, 10KB, 100KB, 1MB / # Throughput over 60-second window" | cmdBench output is a single fixed-size echo transfer with throughput; it emits no connection-timing breakdown, no latency histogram, and no 60-second window (main.go:5918-6010). |
| 325 | "All benchmark tooling is included in the repository." | The custom HTTP/2 benchmark binary (`http2bench`, line 142) does not exist anywhere in web4 (grep -rli http2bench: 0 hits) nor in the public pilotprotocol repo (pre-verified: no examples/ or bench tooling beyond pilotctl bench). |
| 337 | "See the documentation for full setup instructions, including GCP deployment scripts for the cross-region configuration used in these tests." | No GCP deployment scripts exist: web4/scripts/ contains only gen-cli-reference.sh, parity-audit, smoke-pay-driver, smoke-test-appstore.sh; grep for "gcp" in scripts: 0 hits; pre-verified public repo has no such scripts. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 17 | "85ms RTT between US-East and EU-West (measured with ICMP ping, averaged over 1000 samples)" | Presented as a real measurement; no raw data published | Published benchmark dataset/logs |
| 38-69 | Connection-establishment table (DNS ~5ms, registry resolve ~2ms, TCP ~85ms, TLS ~85ms, X25519 ~12ms, totals ~175ms vs ~15ms) and "Pilot establishes connections 11x faster" (line 71) | All presented as measured results; no published data; 11x derives from the unverifiable totals | Reproducible benchmark artifacts |
| 87-118 | Latency-by-payload table (172/171ms @1KB … 248/254ms @1MB, ±%) | Claimed real measurements, no raw data | Published run logs |
| 144-170 | Throughput table (55 vs 50 Mbps median, 48 vs 44 p99, 12% vs 9% CPU, 45 vs 10 MB RSS) | Claimed real measurements, no raw data | Published run logs |
| 199-224 | HTTP/2 relay table (320ms setup, 204ms RTT, 38 Mbps, "+145ms", "-31%", "relay adds 30ms+ to every message") | Claimed measurements with a relay in us-central1; no data published | Published relay benchmark |
| 240-267 | Pilot hole-punched table (22ms setup, 173ms RTT, 48 Mbps, "+7ms", "-4%") | Claimed measurements; no data | Published run logs |
| 271 | "The overhead is approximately 15ms per hop, comparable to HTTP relay solutions" | Relay-hop latency figure with no benchmark data | Published measurement |
| 279-305 | Memory-at-scale table (HTTP/2 45→240 MB vs Pilot 10→24 MB across 1-100 connections) | Claimed measurements; no data | Published run logs |
| 315 | "88% of devices are behind NAT" | Third-party stat, no citation | Measurement study citation |
| 174 | "Pilot's daemon uses 10 MB of RSS compared to 45 MB for the HTTP/2 server" | Same unverifiable measurement set | Published data |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `pilotctl bench` exists (dispatch line 1938, usage line 878); bench dials PortEcho ("sending ... via echo port", main.go:5960) — supports "built-in pilotctl bench command ... echo-server transfers over port 7" (line 24) and "echo server runs on port 7 by default" (line 337, port pre-verified: echo=7).
- web4/pkg/daemon + tests: X25519 key exchange (zz_tunnel_listen_test.go:144-158), AES-GCM tunnel encryption (keyexchange/derive.go:56), AIMD congestion control + sliding window (zz_dup_ack_empty_unacked_recovery_exit_bug_test.go:92), STUN discovery (tunnel.go), BeaconMsgPunchCommand sent to both sides (tests/zz_nat_traversal_test.go:21-104), BeaconMsgRelay relay framing (tests/zz_security_phase2_test.go:212-280) — supports lines 36, 126, 174, 230-238, 271 mechanism descriptions; userspace daemon claim consistent with Go implementation (line 172).
- protocol@v1.10.5: PacketHeaderSize() == 34 (tests/zz_fuzz_protocol_test.go:421) — verifies "Pilot's 34-byte packet header" (line 124).
- web4/README.md:295: `pilot-daemon` binary name (line 328 code block).
- Pre-verified: registry + beacon architecture (registry resolve, beacon coordinates hole-punching, lines 233-237); github.com/pilot-protocol/pilotprotocol repo exists (line 343).
- RFC/standard knowledge: TCP 3-way handshake = 1 RTT; TLS 1.3 = 1 RTT (RFC 8446); ALPN in TLS handshake; HTTP/2 9-byte frame header + HPACK (RFC 7540/7541); symmetric NAT defeats hole-punching; port-restricted cone NAT hole-punchable (lines 34, 124, 193-196, 230, 269-271).
- Local site files: internal hrefs /blog/move-beyond-rest-persistent-connections-for-agents, /blog/replace-webhooks-with-persistent-agent-tunnels, nat-traversal-ai-agents-deep-dive (relative, resolves to /blog/…), build-agent-swarm-self-organizes (relative), /docs/ (src/pages/docs/index.astro) all exist; banner webp exists.
- EXAMPLE items (not flagged): address `1:0001.0002.0003`, `agent-b.example.com`, terminal transcripts, GCP machine specs of the described setup, typical agent payload sizes (lines 138-142, 180-185, 327-335).
