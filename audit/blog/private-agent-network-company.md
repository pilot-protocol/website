# Claim audit: src/pages/blog/private-agent-network-company.astro
Audited: 2026-07-10 · Sentences examined: 96 · verified: 48 · false: 7 · unverifiable: 10 · opinion: 14 · example: 17

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 75 | "# Install all Pilot binaries (~/.pilot/bin/{daemon,pilotctl,rendezvous,...})" | release/install.sh installs daemon (as pilot-daemon) + pilotctl to ~/.pilot/bin; it never installs a `rendezvous` binary (no match for rendezvous in copy steps, lines 451-460) |
| 147 (also 166, 170) | `pilotctl network join "corp-net"` | web4/cmd/pilotctl/main.go:6735 — usage is `network join <network_id>`; arg is parsed with parseUint16, so a name like "corp-net" is rejected |
| 25 | "The entire stack -- registry, beacon, daemon, CLI -- is a single Go binary." | The stack is multiple binaries: pilot-daemon and pilotctl (install.sh), plus separate rendezvous/registry binaries (rendezvous/cmd/rendezvous, cmd/registry) |
| 103 | "The registry persists state to /var/lib/pilot/registry.json by default." | rendezvous/cmd/rendezvous/main.go:65 — `-store` default is "" (no persistence unless set). /var/lib/pilot is the production convention, not a built-in default |
| 252-253 | `./pilot-daemon ... -registry-cert registry-cert.pem` | Daemon has no -registry-cert flag; pinning uses `-registry-tls` + `-registry-fingerprint` (web4/cmd/daemon/main.go:66-68) |
| 296-297 | Primary flag `-replicate-to standby.internal:9000` | No such flag; rendezvous flags are `-standby <primary>` and `-repl-token` (rendezvous/cmd/rendezvous/main.go:69,76) |
| 300-301 | Standby flags `-standby -primary primary.internal:9000` | `-standby` takes the primary address as its value; there is no `-primary` flag (main.go:69) |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 73 | "the process uses minimal resources (under 20 MB RSS)" | No benchmark artifact | Published memory measurement |
| 335 | "the rendezvous server uses under 20 MB RSS, each daemon under 10 MB" | Same | Same |
| 199-203 | "configure auto-accept in daemon policy file" (trust policy comments) | Daemon has `-trust-auto-approve` flag but no documented "daemon policy file" for justification-pattern auto-accept found | Source implementing pattern-based auto-accept file |
| 248-249 | Rendezvous TLS example omits the `-tls` flag | rendezvous main.go:68 has `-tls` bool "enable TLS"; whether -tls-cert alone enables TLS is not confirmed from flags | Reading rendezvous TLS wiring / running it |
| 280 | "Every connection, trust change, and error is logged" as structured JSON | slog import verified, but default log format claims and complete coverage of events not confirmed; daemon flag surface has no log-format JSON default shown | Daemon logging config source |
| 303 | "The primary pushes registration snapshots to the standby every 15 seconds via heartbeat." | Replication exists (server_lifecycle.go WAL/standby) but is WAL-based; no 15-second snapshot interval found | Replication interval constant in rendezvous source |
| 303 | "a manual failover promotes the standby" | Standby mode exists (SetStandby, server_lifecycle.go:36) but promotion procedure not confirmed | Failover code/docs |
| 123 | "the daemon will register its local IP as the endpoint" for same-subnet machines | Endpoint selection heuristic not confirmed in source | pkg/daemon endpoint selection code |
| 344 | "have your first private agent network running in under 10 minutes" | Timing claim, no benchmark | Timed walkthrough |
| 17 | "Under GDPR, this metadata can constitute personal data processing." | Legal interpretation, plausible but uncited to a specific provision | GDPR Art. 4(1)/recital citation |

## Verified claims (grouped by source)
- rendezvous/cmd/rendezvous/main.go: `-registry-addr :9000` (TCP) and `-beacon-addr :9001` (UDP) defaults; single process runs registry+beacon; `-tls-cert`/`-tls-key` flags exist; `-store` JSON snapshot persistence; `-admin-token` gate; hot-standby replication exists.
- web4/cmd/daemon/main.go: `-registry`/`-beacon` flags (line 59-60); Ed25519 identity persisted (~/.pilot/identity.json, line 389); `-encrypt` "X25519 + AES-256-GCM" (line 65); private-by-default (`-public` default false, line 85); STUN discovery with beacon (lines 63-64); log/slog import (line 10); Unix socket IPC.
- web4/pkg/daemon/keyexchange/derive.go: AES-GCM tunnel encryption (aes.NewCipher + cipher.NewGCM).
- web4/cmd/pilotctl/main.go: `network create --name` (line 6946), `network policy <id> --set <json>` (line 2429), `handshake <node_id|hostname> [justification]` (line 932), `approve <node_id|address|hostname>` (line 1122), set-hostname/set-private/status/extras gateway (pre-verified command list); 16-bit network IDs (parseUint16, uint16).
- rendezvous/policy/policy.go + api/policy.go: `allowed_ports` network-policy key; port whitelist semantics (empty = all allowed).
- gateway repo loopback_linux.go/loopback_darwin.go: gateway adds loopback aliases via `ip addr add` (Linux) and `ifconfig lo0 alias` (macOS); loopback-IP-per-Pilot-address proxy model.
- Pre-verified: registry 9000 / beacon 9001 ports; socket /tmp/pilot.sock; repo github.com/pilot-protocol/pilotprotocol exists; well-known ports 7/1000/1001 match "echo, stdio, and messaging ports" whitelist example.
- Local site files: internal links (/blog/run-agent-network-without-cloud-dependency, /blog/trust-model-agents-invisible-by-default, /blog/secure-ai-agent-communication-zero-trust) and banner webp all exist.
- Live URL: https://pilotprotocol.network/install.sh serves installer (pre-verified R2 worker).
- pkg.go.dev/log/slog: linked page is the real Go slog package.
- EXAMPLE items (not flagged): ASCII architecture diagram, 10.0.x.x IPs, systemd unit, status output, addresses 1:0001.0000.000X, sample JSON log lines, openssl command, 127.0.0.2/3 gateway mappings, "(ID: 1)" output.

## Resolutions (2026-07-10, loop iteration 29)
7 FALSE fixed (verified): install.sh installs pilot-daemon + pilotctl only (no rendezvous binary); "single Go binary" → a handful of binaries (daemon/CLI per node + rendezvous server); network join takes <network_id> not a name (main.go:6739, parseUint16); registry -store default is "" (in-memory) not /var/lib/pilot/registry.json; daemon has no -registry-cert (uses -registry-tls + -registry-fingerprint); rendezvous replication is -standby <primary> + -repl-token, not -replicate-to / -primary. 10 unverifiable accepted.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
