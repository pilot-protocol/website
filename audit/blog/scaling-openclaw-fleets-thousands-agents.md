# Claim audit: src/pages/blog/scaling-openclaw-fleets-thousands-agents.astro
Audited: 2026-07-10 · Sentences examined: 40 · verified: 10 · false: 1 · unverifiable: 12 · opinion: 7 · example: 10

## FLAGGED — FALSE
| Line | Sentence | Evidence it is false |
|---|---|---|
| 102 | "Use `pilotctl peers` to get a real-time view of public agents." | web4 cmd/pilotctl/main.go:939-943 — `peers` summarizes *currently connected* peers (encrypted/relay/direct breakdown), not public agents. Public-agent discovery is `lookup`/directory, not `peers`. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 9 | "Pilot Protocol scales linearly with the number of agents." | No benchmark or source | Published load-test data |
| 19-21 | Resource table: idle ~8 MB / <0.1% CPU / 3 FDs; active ~15 MB / 6 FDs; busy ~35 MB / ~2% / 13 FDs | No benchmark exists in repo; presented as real measurements | Reproducible daemon resource benchmark |
| 24 | "For a fleet of 100 agents on a single server ... roughly 1.5 GB RAM and 50% CPU utilization." | Derived from unverified table | Same benchmark |
| 26 | "Budget approximately 2-3 MB per active tunnel." | No measurement source | Tunnel memory profiling |
| 108 | "From operating the public network and testing large private deployments, these are the bottlenecks..." | No published test results | Load-test reports |
| 111 | "Tag search response time increases slightly as the fleet grows... negligible at 1,000 agents"; "Stagger agent startups over 30-60 seconds" | No latency data | Registry search benchmarks |
| 114 | "At very large fleet sizes, tag searches with many results can take longer." | No data | Same |
| 120 | "Three patterns have emerged from real OpenClaw fleet deployments" | No cited deployments | Case studies |
| 122 | "This is the most common pattern for batch processing jobs." | No usage data | Deployment telemetry |
| 126 | "Each sub-orchestrator handles 50-100 workers, and the top-level orchestrator coordinates 10-20 sub-orchestrators." | Presented as observed practice, no source | Real deployment reports |
| 137 | Meta description "Patterns and benchmarks..." — the "benchmarks" are the unverified figures above | Same as table | Same |
| 9 | "The network comfortably handles thousands of agents." | No public evidence at fleet level (live stats show node counts, not per-fleet behavior) | Load test |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: `pilotctl subscribe <addr> <topic>` (line 1331) and `pilotctl publish <addr> <topic> --data` (line 1339) syntax; `pilotctl peers` exists (line 1932); event stream (publish/subscribe) is built in.
- release/install.sh:458 + web4 usage line 1570: daemon binary installed as `/usr/local/bin/pilot-daemon` (systemd ExecStart path plausible).
- Pre-verified: repo github.com/pilot-protocol/pilotprotocol exists (CTA link); each agent runs a Pilot daemon; keepalive/persistent registration behavior consistent with daemon design.
- Local files: banner /blog/banners/scaling-openclaw-fleets-thousands-agents.webp exists in public/.
- EXAMPLE (not flagged): systemd unit files, seq 1..50 deploy loop, fleet.health publish payload, broker-addr placeholders.

## Resolutions (2026-07-11 iter 59)
- L102 ("pilotctl peers to get a real-time view of public agents"): peers summarizes currently-connected peers (encrypted/relay/direct), not public agents. Reworded to that, and pointed network-wide public-agent discovery at the list-agents directory.
Build: npm run build green (345 pages).
