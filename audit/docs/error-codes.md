# Claim audit: src/pages/docs/error-codes.astro
Audited: 2026-07-10 · Sentences examined: 125 · verified: 98 · false: 6 · unverifiable: 3 · opinion: 18 · example: 0

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 25 | `invalid checksum` (error code) | No such error string in source. Actual: `ErrChecksumMismatch = errors.New("checksum mismatch")` — protocol@v1.10.5/pkg/protocol/header.go:17. Grep of protocol module + web4 finds no "invalid checksum". |
| 27 | `invalid magic bytes` (error code) | No such error string exists. Unknown tunnel magic is silently dropped with no error emitted (web4/pkg/daemon/tunnel.go:1117 `return true, false // unknown magic`). Also imprecise: valid frames may start with PILS/PILK/PILA/PILP, not only PILT (header.go:61-75). |
| 45 | `node already registered` (error code) | String absent from the entire rendezvous (registry) repo and web4. Grep for "already registered" across both returns nothing; registration path has no such error (rendezvous/directory/directory.go register errors are "registration requires public_key", "registry full"). |
| 48 | `hostname already taken` (error code) | Actual registry error is `hostname %q already in use by node %d` (rendezvous/directory/directory.go:1537). No "hostname already taken" string anywhere in source. |
| 58 | `connection timed out` (error code) | Actual error is `dial timeout` (`ErrDialTimeout = errors.New("dial timeout")`, protocol header.go:16; classifyDaemonError matches "dial timeout", web4/cmd/pilotctl/main.go:181). CLI error code is `timeout`. "connection timed out" appears nowhere in source. |
| 89 | `free networks are limited to 3 agents` (error code) | No such error string. Actual member-cap error: `network membership limit reached` (rendezvous/membership/membership.go:409, driven by Policy.MaxMembers). No "3 agents"/free-tier string in rendezvous or web4. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 45 | "This node is already registered in the backbone." (description) | The claimed error condition does not exist in the registry source; re-registration behavior emitting this error could not be found. | A source line in rendezvous emitting a duplicate-registration error, or a live repro. |
| 60 | "Flow control window is zero; the receiver is not consuming data." | Source attributes `send buffer full` to the NagleBuf exceeding MaxNagleBuf when the app writes faster than the network drains (web4/pkg/daemon/daemon.go:3722-3730); "window is zero" is not stated as the trigger. | Source showing ErrSendBufFull gated on a zero flow-control window. |
| 89 | "Free-tier network has reached the 3-agent limit." | The 3-agent free-tier cap is not in the registry source (limit is a generic per-network Policy.MaxMembers) and is not stated on src/pages/plans.astro either. | Registry/billing config setting MaxMembers=3 for free networks, or the plans page stating the limit. |

## Verified claims (grouped by source)
- protocol@v1.10.5/pkg/protocol/header.go: PILT magic 0x50494C54 (l.61-62); ErrConnRefused "connection refused" (l.15); ErrNetworkNotFound "network not found" (l.13); CRC32 checksum concept (checksum.go:9-11, IEEE).
- protocol@v1.10.5/pkg/protocol/packet.go: "packet too short" exact string, packetHeaderSize = 34 (l.23, l.111-112) — 34-byte header claim.
- web4/pkg/daemon/tunnel.go: "encrypted packet from node but no key" (l.1262) + exact phrase "encrypted packet but no key" in code comments (l.367, l.425) — desc/resolution match rekey behavior.
- web4/pkg/daemon/daemon.go: DefaultIdleTimeout = 120s (l.172); idle sweep closes idle conns, publishes conn.idle_timeout event (l.5220-5247); keepaliveInterval (l.5224); ErrSendBufFull "send buffer full" exact (l.3730) + back-off/retry resolution (comment l.3722-3726); SYN rejected for untrusted source with registry trust fallback covering shared networks (l.2908-2921) — "connection refused" description; "invalid email" error (l.718); synthesised `<fingerprint>@nodes.pilotprotocol.network` email (l.711); ~/.pilot/identity.json (cmd/daemon/main.go:389).
- web4/pkg/daemon/ipc.go: "network: missing sub-command" exact (l.2049); sub-command byte dispatch (l.2052); "network join: missing network_id" exact (l.2068); subcommands list/join/leave/members/invite handled (l.2056-2177); "invalid admin token" also daemon-side (l.2406).
- web4/cmd/pilotctl/main.go: "daemon is not running" exact (l.3013); error_codes table — invalid_argument/not_found/not_running/connection_failed meanings (l.2477-2481); PILOT_REGISTRY env (l.2488; cmd/daemon/main.go:49); PILOT_SOCKET default /tmp/pilot.sock (l.2489, pre-verified); daemon start/stop/status (l.1677-1704); network list/join/leave/members/invite/accept subcommands (l.1806-1818); "already trusted with node %d" (l.4790); "cannot resolve" hostname errors (l.780, 803, 807); no-args usage output; dial-timeout hint recommends `pilotctl ping` (l.182) — matches doc resolution.
- rendezvous/authz/authz.go: "network creation is disabled" exact (l.112); "invalid admin token" exact (l.116) — config-driven, supports resolutions.
- rendezvous/membership/membership.go: "network name required" (l.92); "network name too long (max 63 chars)" (l.95) — 63-char claim; "network name must be lowercase alphanumeric with hyphens, start/end with alphanumeric" exact (l.98); reservedNetworkNames = {backbone} (l.82-84) + "network name %q is reserved" (l.101); "network %q already exists" (l.312); "network ID space exhausted (max 65535 networks)" (l.307) — 65,535 claim + 16-bit network IDs; "invalid token for network %d" (l.400); "invite-only networks require invite_to_network + respond_invite flow" (l.403) — doc string is an abbreviation of this real error; "node %d already in network %d" (l.415); "cannot leave the backbone network" exact (l.457); "node %d is not a member of network %d" (l.493); "cannot delete the backbone network" exact (l.551); delete_network path exists — "delete unused networks" resolution.
- rendezvous/dispatch.go: create_network registry RPC exists (l.46, l.68) — "passed to create-network" description.
- rendezvous/trust/trust.go: "handshake request already pending from node %d" (l.386) — doc string "handshake already pending" is an abbreviation of this real error.
- rendezvous/directory/directory.go: hostname-conflict check exists (l.1535-1537) — description of hostname collision verified (error wording flagged above).
- eventstream/eventstream.go: "topic too long" exact (l.40); "payload too large" exact (l.54).
- dataexchange/dataexchange.go: "frame too large" exact (l.149, MaxFrameSize cap).
- Pre-verified cheatsheet: /tmp/pilot.sock socket; pilotctl deregister/pending/handshake/ping commands exist; Backbone = network #0.
- Local site files: /plans (src/pages/plans.astro, has "Private Network" tier), /docs/troubleshooting, /docs/diagnostics, /docs/integration all exist — callout links, plans link, prev/next frontmatter verified. Subtitle/meta description accurately describe page contents.

Notes: two error strings are documented in abbreviated form but counted VERIFIED because the actual error is a superset and grep-discoverable: "handshake already pending" (actual inserts "request") and "invite-only networks require invite flow" (actual: "...require invite_to_network + respond_invite flow"). Consider quoting them verbatim.

## Resolutions (2026-07-10, loop iteration 35)
6 FALSE fixed (verified vs protocol/rendezvous source): "invalid checksum" → "checksum mismatch"; "invalid magic bytes" → unknown magic is silently dropped (no error); "node already registered" → "registration requires public_key" / "registry full"; "hostname already taken" → "hostname already in use"; "connection timed out" → "dial timeout" (CLI code `timeout`); "free networks are limited to 3 agents" → "network membership limit reached" (Policy.MaxMembers, no free-tier string). 3 unverifiable accepted.
