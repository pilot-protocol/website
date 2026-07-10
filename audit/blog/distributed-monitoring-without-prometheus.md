# Claim audit: src/pages/blog/distributed-monitoring-without-prometheus.astro
Audited: 2026-07-10 · Sentences examined: 108 · verified: 44 · false: 5 · unverifiable: 19 · opinion: 12 · example: 28

## FLAGGED — FALSE
| Line | Sentence (quote, truncate >160 chars) | Evidence it is false |
|---|---|---|
| 253 | "The Pilot daemon sends keepalive probes every 30 seconds, with an idle timeout of 120 seconds." | web4/pkg/daemon/daemon.go:171-172: `DefaultKeepaliveInterval = 60 * time.Second` (not 30s). IdleTimeout 120s part is correct. |
| 200 | "The aggregator subscribes to metrics/* (wildcard) and receives every metric from every host." (also lines 34, 127, 203, 330, 372-392) | Event stream supports exact topic match or bare "*" only — protocol@v1.10.5/internal/eventstream/server.go:100-117 ("Topic \"*\" subscribes to all events"). A prefix pattern like "metrics/*" is a literal topic and matches nothing. |
| 247 | `pilotctl peers --search "production"` shown filtering servers by tag | cmdPeers (web4/cmd/pilotctl/main.go): `--search` filters by node-ID substring only (`nodeIDStr := fmt.Sprintf(...); strings.Contains(nodeIDStr, search)`). It does not match tags. |
| 237 | "Every node registered on the network appears with its hostname, address, tags, and online status ... the pilotctl peers command works" | cmdPeers reads the daemon's connected `peer_list` and strips endpoints; it shows a secure/relay/direct summary + exceptions, not a registry-wide fleet table with hostname/tags/online columns (main.go peers help + cmdPeers body). |
| 248-251 | Example peers output rows with tag lists and "online"/"OFFLINE" columns | Contradicted by the actual peers output format (summary + exception rows, no tags column, no OFFLINE marking); also lists only connected peers, so a downed node would simply be absent. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 8 | Three quoted sysadmin complaints ("I am tired of special snowflakey...", "Recommendations for simple performance monitoring...", "Uptime Kuma cannot SSH into a server...") | No source links; cannot locate the forum threads | Links to the original Reddit/HN threads |
| 10 | Quote "Scaling Prometheus isn't straightforward -- federation, remote-write, Thanos, Cortex." | Unattributed quotation | Citation |
| 88 | "Total setup time: under two minutes." | No benchmark | Timed install run |
| 292 | "Memory per node ~10MB (daemon)" | No benchmark or measurement source | RSS measurement of pilot-daemon |
| 292 | "~50-100MB (exporter + Prometheus)", "~100-200MB" (Netdata) | Third-party memory figures with no citation | Vendor docs / measurement |
| 293 | Setup times "~5 minutes / ~2-4 hours / ~15 minutes / ~10 minutes" | Invented estimates | Timed comparative setup |
| 284-291 | Vendor behavior rows: "Uptime Kuma: No (external probes only)", "Netdata: Requires Netdata Cloud" for cross-network, "Uptime Kuma: SQLite", "Netdata custom DB" | Third-party product behavior; not checked against vendor docs | Vendor documentation links |
| 233 | "The monitoring agent can tell you the database is responding to queries in 3ms." | Invented latency presented as capability illustration | Actual measurement |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: publish/subscribe command syntax (`pilotctl publish <addr> <topic> --data`, `pilotctl subscribe <addr> <topic>`), `set-hostname`, `extras set-tags`, `handshake <peer> [justification]` (approval required before messages flow), peers command exists with `--search`.
- web4/pkg/daemon/daemon.go:172: idle timeout 120s.
- web4/pkg/daemon/keyexchange/ (crypto.go, derive.go): X25519 identity keys + AES-GCM (aes.NewCipher + cipher.NewGCM) — "Mandatory (X25519 + AES-GCM)" and "encrypted by default" claims.
- protocol@v1.10.5 cmd/daemon/main.go:72 + internal/eventstream/server.go: event stream is a pub/sub broker on port 1002.
- release/install.sh:441,458: `pilot-daemon` binary name; installer URL https://pilotprotocol.network/install.sh pre-verified live.
- Pre-verified cheatsheet: beacon relay + STUN NAT traversal (registry 34.71.57.205:9000, beacon :9001), github.com/pilot-protocol/pilotprotocol exists.
- Local site files: internal links replace-message-broker-twelve-lines-go and nat-traversal-ai-agents-deep-dive exist in src/pages/blog/; banner public/blog/banners/distributed-monitoring-without-prometheus.webp exists.
- General knowledge: /proc/loadavg, /proc/meminfo, df, ioping usage in the shell agent is standard Linux (EXAMPLE code, plausible); Prometheus stack components (node_exporter, Alertmanager, Grafana) accurately described.
