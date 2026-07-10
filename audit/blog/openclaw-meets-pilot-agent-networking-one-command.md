# Claim audit: src/pages/blog/openclaw-meets-pilot-agent-networking-one-command.astro
Audited: 2026-07-10 · Sentences examined: 55 · verified: 37 · false: 3 · unverifiable: 3 · opinion: 3 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 9 | "Installation downloads the SKILLS.md skill definition into the agent's skill directory" (also lines 13, 15, 52-65 repeat "SKILLS.md") | skillinject@v0.2.3 writes `SKILL.md` (skillinject.go:184,408: `skills/<name>/SKILL.md`), not SKILLS.md. No SKILLS.md exists in web4 or skillinject. |
| 75 | `pilotctl send 1:0001.0B22.4E19 "Analyze this dataset..."` | Actual usage: `pilotctl send <address\|hostname> <port> --data <msg>` (web4 cmd/pilotctl/main.go:904,1489). Command as shown omits required port and --data flag. |
| 78 | `pilotctl recv --json` | recv requires a port argument: `pilotctl recv <port> [flags]` (main.go:912); --json is not a documented recv flag either. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4/9/11 | "Pilot Protocol is available on ClawHub… `clawhub install pilotprotocol`" | clawhub.ai is an SPA returning HTTP 200 for any slug (garbage slug also 200), so listing existence could not be confirmed | ClawHub search API or running `clawhub install pilotprotocol` |
| 58 | Hint strings like "Retry after 5 seconds", "Peer is offline, try later" | hint field exists (main.go:196) but these exact hint texts were not found | grep exact hint strings in main.go error paths |
| 119 | "This is why agents adopted Pilot Protocol autonomously." | Adoption-behavior claim with no measurable source | Telemetry/install-source data |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: `context` command (:1666, --json manifest :2327), `daemon start|stop|status` (:1670-1687), `set-hostname`, `peers --search` (:1552), `handshake <node_id|hostname> [justification]` (:932), `send-file`, `recv <port> --count` (:912), `publish <addr> <topic> --data` (:1339), `subscribe <addr> <topic>` (:1331), error `hint` field (:196), received files land in ~/.pilot/received/ (:1244)
- web4 pkg/daemon/tunnel.go:534: encryption scheme "X25519+AES-256-GCM" end-to-end by default; STUN/hole-punching/relay (pkg/daemon + beacon module in go.mod)
- Pre-verified cheatsheet: well-known ports stdio 1000, dataexchange 1001, eventstream 1002; `pilotctl extras set-tags`; repo pilot-protocol/pilotprotocol exists; injection toolchains include OpenClaw
- website src/pages/docs/comparison-networking.astro:38: 48-bit virtual address format N:NNNN.HHHH.LLLL (address survives IP changes — protocol README)
- skillinject@v0.2.3 README/skillinject.go: heartbeat files (heartbeats/*.md) — "heartbeat checklist" claim
- Live URLs (HTTP 200): github.com/openclaw/openclaw, clawhub.ai; banner public/blog/banners/openclaw-meets-pilot-agent-networking-one-command.webp exists

EXAMPLE items (not flagged): virtual addresses 1:0001.0A3F.7B21 / 1:0001.0B22.4E19, demo JSON outputs, hostname data-processor-42, Q4 pipeline scenario, publish payload numbers.
OPINION: "SKILLS.md works better than API docs" callout framing, "natural sequence", CTA copy.

## Resolutions (2026-07-11 iter 50)
- L9/13/15/52-65 (SKILLS.md): skillinject writes SKILL.md (skillinject.go:184,408). Replaced all 6 occurrences with SKILL.md.
- L75 (pilotctl send <addr> "..."): added required port + --data → `pilotctl send <addr> 1000 --data "..."` (matches the "port 1000 (stdio)" prose).
- L78 (pilotctl recv --json): recv requires a port. Changed to `pilotctl --json recv 1000`.
Build: npm run build green (345 pages).
