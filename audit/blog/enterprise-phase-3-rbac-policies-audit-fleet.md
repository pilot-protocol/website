# Claim audit: src/pages/blog/enterprise-phase-3-rbac-policies-audit-fleet.astro
Audited: 2026-07-10 · Sentences examined: 102 · verified: 74 · false: 4 · unverifiable: 5 · opinion: 6 · example: 13

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 20-26 | `pilotctl network promote 1 --node 686` / `demote 1 --node 686` / `kick 1 --node 687` | Actual CLI is positional: `pilotctl network promote <network_id> <node_id\|address\|hostname>` — no `--node` flag (web4 cmd/pilotctl/main.go:7031-7036, usage strings) |
| 43-46 | `pilotctl network set-policy 1 --max-members 50` / `--allowed-ports 80,443,7` | Subcommand is `network policy`, not `network set-policy` (main.go:1837 dispatch; available list at main.go:1802 has no set-policy). Flags --max-members/--allowed-ports do exist under `network policy` (main.go:7143,7153) |
| 55, 189 | `pilotctl network invite 1 --node 686` | Actual usage is positional: `pilotctl network invite <network_id> <node_id\|address\|hostname>` — no `--node` flag (main.go:6841-6844) |
| 161 | "Message size cap. 64KB per message. Oversized messages are rejected immediately." | Current registry wire cap is 64MB: `const MaxMessageSize = 64 * 1024 * 1024` (common@v0.5.6/registry/wire/wire.go:39; rendezvous zz_server_util_test.go: "MaxMessageSize is 64MB"). A stale comment "64KB max" remains at rendezvous server_util.go:147, but the enforced value contradicts the claim |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 82 | "18 mutation handlers are instrumented" | Tests confirm most listed audit actions exist, but the exact count of 18 at v1.5 cannot be reconstructed from current source | v1.5 registry source diff |
| 200 | "43 new tests across 8 test files, all passing with -parallel 4" | Historical release-time count; current tree has evolved far past v1.5 | v1.5.0-rc1 tag diff |
| 17 | "The registry evaluates a three-step chain: global admin token, per-network admin token, then the node's RBAC role" | Admin-token auth and RBAC roles both exist (rendezvous server_auth.go, membership.go), but the specific three-step ordering incl. per-network admin token was not located in current source | Registry authz dispatch code showing the chain |
| 122 | "On shutdown, the webhook client drains its queue with a 5-second timeout" — VERIFIED actually (webhook.go:212-223); moved to verified. Placeholder row retained for numbering only | — | — |
| 224 | "GitHub Actions … executes an integration harness with a live registry + beacon + 2 daemons" | release.yml exists and builds 4 platforms + runs tests, but the exact "live registry + beacon + 2 daemons" harness shape was not confirmed line-by-line | Full read of release.yml integration job |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: `network list/join/leave/members/invite/invites/accept/reject/promote/demote/kick/policy` all exist (dispatch at 1799-1843); `network join 1 --token my-secret` matches usage (6733-6740); `pilotctl health` exists and queries daemon via IPC (992, 1930); `pilotctl set-webhook` exists; commands routed through daemon IPC socket and signed (sign_request.go).
- web4 cmd/daemon/main.go: `-registry`, `-beacon`, `-listen`, `-encrypt` (X25519 + AES-256-GCM), `-admin-token`, `-networks` (comma-separated auto-join), `-webhook`, `-log-format json` flags all exist (lines 59-102).
- web4 pkg/daemon: `network.auto_joined` event emitted on auto-join (daemon.go:1450); webhook Dropped counter surfaced (daemon.go:2722, ipc.go:1146).
- webhook module (pilot-protocol/webhook@v0.2.1): monotonic EventID via nextID.Add(1) (webhook.go:188), retry loop with initial 1s backoff doubling each attempt (117, 140, 300-306), 4xx not retried / 5xx and network errors retried (325-338), Dropped() accessor (204), 5-second drain timeout on Close (212-223).
- rendezvous module (registry): roles owner/admin/member (membership.go:34-36); creator becomes owner (325); joiners become member (apply_delta.go:362); "cannot promote the owner"/"cannot demote the owner" (1141, 1191); promote/demote require RoleOwner (554) — admins cannot change roles; invite/kick allow owner|admin (609); invite-only direct join blocked with error pointing to invite_to_network + respond_invite flow (403); invite dedup one per network per target (837); MaxInviteInbox = 100 (73); network policy MaxMembers/AllowedPorts/Description with merge semantics (pilotctl main.go:7143-7160 + enterprise_gate tests); snapshot SHA-256 checksums verified on load (zz_registry_hardening_test.go:133-178); connection/rate limiting tests present; registry `--log-format` flag (cmd/registry/main.go:28, cmd/rendezvous/main.go:72); audit events via slog filterable with jq select(.msg=="audit") (server_auth.go:97); Prometheus-style metrics (metrics.go).
- web4 tests: audit actions node.registered, node.deregistered, network.created/deleted/renamed/joined/left, trust.created/revoked, visibility.changed, hostname.changed, tags.changed, key.rotated, handshake.relayed, handshake.responded confirmed (tests/zz_audit_test.go:312-324, 559, 639); member.promoted/demoted and task_exec.changed covered by zz_pilotctl_network_test.go/enterprise tests; /healthz endpoint returning status/version/uptime_seconds/nodes_online JSON (tests/zz_health_endpoint_test.go); key lifecycle metadata incl. key_age_days (tests/zz_key_lifecycle_test.go:327).
- web4 pkg/daemon/keyexchange: authenticated ECDH handshake with Ed25519 signatures + X25519 session keys, authenticated PeerNodeID recorded (handle.go:35,162,307; frame.go:14), unauthenticated fallback path exists (HandleUnauthFrame, handle.go:211-241).
- gh api: release v1.5.0-rc1 exists on pilot-protocol/pilotprotocol with 5 assets; .github/workflows/release.yml builds linux/darwin × amd64/arm64 matrix.
- installer (release/install.sh): `--channel edge` supported, edge tracks newest prerelease (lines 11-16, 97-101); stable default `curl … | sh` matches.
- Local site files: /docs/getting-started, /docs/networks, /plans pages exist; banner webp exists; canonicalPath matches.

Example items: node IDs 685-687, network IDs 1/3, audit JSON sample, /healthz JSON sample (version "1.5.0", nodes_online 247 — illustrative), /var/log path, $TOKEN, "prod-fleet".
