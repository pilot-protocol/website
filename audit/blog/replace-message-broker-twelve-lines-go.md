# Claim audit: src/pages/blog/replace-message-broker-twelve-lines-go.astro
Audited: 2026-07-10 · Sentences examined: 72 · verified: 42 · false: 6 · unverifiable: 8 · opinion: 6 · example: 10

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 33 (also 59, 102, 155, 204, 290) | Import path `github.com/pilot-protocol/pilotprotocol/pkg/driver` in every Go example | Pre-verified: public pilotprotocol repo has NO pkg/driver. Go SDK is github.com/pilot-protocol/common/driver. |
| 39-40 (and all Go examples) | `driver.Connect()` / `d.OpenEventStream()` / `stream.Publish(...)` / `stream.Subscribe(...)` / `d.Hostname()` | common@v0.5.0/driver/driver.go: Connect requires a socketPath argument (line 62); grep of the entire driver package finds NO OpenEventStream, Publish, Subscribe, or Hostname methods. The advertised Go API does not exist. |
| 6 | "The publish side is 6 lines of Go. The subscribe side is 6 lines. Twelve lines total, and you have a working agent pub/sub system in Go" | The 12 lines call an API (OpenEventStream/Publish/Subscribe) that does not exist in the Go SDK — the code cannot compile. |
| 73 | "The driver.Connect() call connects to the local Pilot daemon via IPC socket. OpenEventStream() opens the event stream on port 1002." | Same evidence: no zero-arg Connect, no OpenEventStream in common@v0.5.0/driver. |
| 380 | "The CLI commands connect to the same daemon and use the same event stream as the Go API. They are interchangeable." | There is no such Go API to be interchangeable with (see above). |
| 468 | "For the Go driver source, check the pkg/driver package in the repository." | Pre-verified: public repo has no pkg/driver. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 386 | "We measured on two agents in the same region (us-east1)" | No published benchmark artifact or methodology anywhere in the repos | A committed benchmark script + raw results |
| 396-411 | Perf table: Pilot p50 0.3ms / p99 1.2ms / 45K msg/s; Redis 0.2ms/0.8ms/120K; Kafka 2ms/8ms/80K | Presented as real measurements with no source; Redis/Kafka figures uncited | Reproducible benchmark for all three systems |
| 414-417 | "Memory (broker): Redis 50 MB, Kafka 500 MB+" | Vendor resource figures, no citation | Documented measurements |
| 433 | "Pilot is slower on raw throughput because it is peer-to-peer" | Depends on the unverifiable benchmark above | Same |
| 446 | "Throughput above 50K msg/s: ... you need Kafka-scale infrastructure" | Threshold derived from unverified benchmark | Same |
| 445 | "If the UDP packet is lost during a congestion event and the retry window expires, the event is lost" (specific retry-window mechanism) | Eventstream retry/loss semantics not confirmed in source with available greps | plugins/eventstream source showing delivery semantics |
| 444 | "Pilot delivers to all subscribers (broadcast), not one-of-many (queue)" | Consistent with docs/pubsub.astro wording but not confirmed against plugin source | eventstream plugin dispatch code |
| 20 | "You do not need Kafka's durability guarantees for a CPU utilization event that is stale in 10 seconds" (broker-assumption framing generally) | Generalization about broker design; not falsifiable | — |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `pilotctl subscribe <address|hostname> <topic>` (usage line 1331) and `pilotctl publish <address|hostname> <topic> --data <message>` (line 1339) match all CLI examples (L361-378); commands exist in dispatch (lines 1775-1777).
- Pre-verified cheatsheet: eventstream port 1002; dataexchange port 1001; stdio port 1000; AES-256-GCM tunnels; STUN + hole-punching NAT traversal; registry-based peer discovery; GitHub repo link.
- src/pages/docs/pubsub.astro:26: broker on port 1002, subscribe to topics on trusted peers, distributed to active subscribers — supports "only trusted peers can subscribe", ephemeral/fire-and-forget, wildcard topics.
- src/pages/blog/http-services-over-encrypted-overlay.astro: "Port 80 handles HTTP services" convention (L466) and internal link exists; /docs/ exists.
- External: kafka.apache.org, rabbitmq.com, redis.io, go.dev — well-known live sites; Mosquitto is open source (EPL) — "Yes (Mosquitto, etc.)" for MQTT open source holds.
- EXAMPLE: monitoring-pipeline agents A/B/C, CPU/memory metrics JSON, pipeline stage code, topic names, alert thresholds.
- OPINION: "infrastructure overkill", "Honesty matters", "the right answer", "trivial".
