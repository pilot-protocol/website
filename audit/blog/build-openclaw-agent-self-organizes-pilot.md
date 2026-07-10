# Claim audit: src/pages/blog/build-openclaw-agent-self-organizes-pilot.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 37 · false: 7 · unverifiable: 5 · opinion: 4 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 40-41 | REGISTRY = "rendezvous.pilotprotocol.network:9000" / BEACON = "...:9001" | Compat DNS names are registry.pilotprotocol.network / beacon.pilotprotocol.network (pre-verified); no "rendezvous.pilotprotocol.network" host anywhere in web4 source (grep: only prose comments use the word). Constants are also never used by the code shown |
| 88 | `pilotctl peers --search ml --json` as "Search for agents with ML capabilities" | peers lists currently connected peers; --search "filter by node ID substring" (main.go:951) — it is not a directory/tag capability search |
| 150-153 | `pilotctl recv --json --timeout 10` (and L233 "waits 10 seconds for a request") | recv requires a `<port>` argument (main.go:912 "Usage: pilotctl recv <port>"); invocation as written fails |
| 169-173 | `pilotctl send sender result` (reply path) | send requires `<port>` and `--data <msg>` (main.go:904); this invocation is invalid |
| 264-271 | "To run multiple agents with different specialties: TAGS=... python autonomous_agent.py" | The script hardcodes TAGS/SPECIALTY (lines 43-44) and never reads a TAGS env var — the shown commands have no effect on tags |
| 278 | "50 lines of Python." | The listed script is ~150 lines |
| 212 | "…is discoverable by peers searching for its capability tags." | No tag-search command exists in pilotctl (pre-verified command list: no "search"; peers --search is node-ID substring) — as described, peers cannot find it by tag |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 222 | "These bridge connections are structurally important for network connectivity." | Graph-theory assertion about the live network, no data | Network topology analysis |
| 238 | "it receives more trust requests, and it handles more work" | Behavioral claim about network dynamics, no telemetry | Trust-request telemetry |
| 273 | "form the same kind of functional clusters observed in the agent trust network" | References another post's unverified observation | Published cluster analysis data |
| 235 | "If the daemon loses connectivity… pilotctl recv fails with a connection error. The agent retries… resumes automatically." | Behavior claim untested; recv invocation is invalid anyway | Running the agent through a connectivity drop |
| 260 | "It can be discovered by other agents… No human supervision required." | Depends on the broken tag-discovery premise above | End-to-end run on the live network |

## Verified claims (grouped by source)
- Pre-verified cheatsheet: Go 1.25+ prerequisite; install.sh one-liner live; set-tags lives under `pilotctl extras`; beacon/STUN discovery; commands handshake/set-hostname/pending exist.
- web4/cmd/pilotctl/main.go: daemon start/stop/status subcommands (1670-1687); daemon status --json plausible via global --json; set-hostname usage (1202); handshake <peer> (932); PILOT_HOME (55-59).
- cmd/daemon/main.go:389: identity at ~/.pilot/identity.json; pilot-daemon binary exists (public repo cmd/daemon via gh api).
- Anthropic API knowledge: `anthropic` Python SDK, ANTHROPIC_API_KEY, model id claude-sonnet-4-20250514, messages.create shape — all real.
- Local site files: blog link emergent-trust-networks-agents-choose-peers exists; banner webp exists; GitHub link pilot-protocol/pilotprotocol exists (pre-verified).
- Example (not flagged): worker-{pid} hostnames, sample addresses 1:0001.0B22.4E19 etc., sample run output, sk-ant-... key placeholder.
