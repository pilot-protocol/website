# Claim audit: src/pages/blog/building-custom-pilot-skills-openclaw.astro
Audited: 2026-07-10 · Sentences examined: 58 · verified: 30 · false: 4 · unverifiable: 10 · opinion: 6 · example: 8

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 64, 88 | Implementation lines `pilotctl send $TO '{"description":...}'` and `pilotctl send $TO '{"review":...}'` | send requires `<port>` and `--data <msg>` (web4 cmd/pilotctl/main.go:904 "Usage: pilotctl send <address|hostname> <port> --data <msg>"); both invocations are invalid |
| 65 | `pilotctl recv --from $TO --json` | recv has no --from flag (flags: --count, --timeout; main.go:912-918) and requires `<port>`; --from belongs to `inbox` (main.go:965) |
| 100 | `pilotctl peers --search "code-review" --json` as "Find a Reviewer" | peers shows currently connected peers; --search filters by node ID substring (main.go:951) — not a capability/tag directory search, and cannot find new reviewers |
| 165 | "This returns a JSON object with every command, argument, return type, and error code." | `pilotctl context` catalog contains command name, args, description, and return field names only (main.go:2097-2460) — no error codes |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "The OpenClaw agents that adopted Pilot Protocol did so through a single entry point: the SKILLS.md file on ClawHub." | Third-party adoption narrative; note the product's actual file is SKILL.md installed by the daemon (main.go skills help: "SKILL.md files the daemon installs") | ClawHub listing + adoption data |
| 4 | "It defines every command, every argument, every error code, and every workflow pattern." | Cannot inspect the ClawHub-hosted file; skillinject module ships no such .md | The published skill file content |
| 9 | "A Pilot skill is a SKILLS.md file that follows a specific structure… four sections" | Structure (Commands/Workflows/Heartbeat/Context) not found in skillinject@v0.2.3 or web4; filename differs from SKILL.md | The canonical skill file |
| 119-123 | `clawhub publish pilot-code-review …` command and flags | clawhub CLI is third-party; not installable/verifiable here | ClawHub CLI docs |
| 125 | "ClawHub automatically installs Pilot Protocol first if it is not already present." | Third-party dependency-resolution behavior | ClawHub docs/test |
| 130-133 | `clawhub install pilot-code-review` gives the agent both skills | Same — third-party behavior | ClawHub test |
| 154 | "The Pilot Protocol base skill includes retry guidance for every error." | Skill body not present in skillinject@v0.2.3 module files; couldn't confirm | The installed SKILL.md content |
| 154 | "This pattern is why agents were able to onboard autonomously — they could handle every error without human help." | Causal adoption claim, no data | Onboarding telemetry |
| 172-175 | "Peer responds with its context manifest… foundation for autonomous skill negotiation" | Described peer behavior is application-level convention, not a protocol feature; untestable here | A live capability_query exchange |
| 181 | "From analyzing how agents used the base Pilot Protocol skill, several design patterns emerged" | Usage-analysis claim with no cited data | The analysis itself |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `pilotctl context` exists and prints a machine-readable JSON catalog of commands/args/returns (help at 1304, catalog 2097+; used by agent tools incl. OpenClaw per its own help text); lookup exists (1195); handshake hint "Run pilotctl handshake <address> first" matches real usage (932, 780); daemon status --json valid (daemon status help); subscribe exists (1331); send-file exists (1343); `pilotctl recv 1001 --count 1` valid syntax (912-917); received files land in ~/.pilot/received/ (1244); `pilotctl send 1:0001.0B22.4E19 1002 --data '…'` matches send usage (904); event stream port 1002 (pre-verified).
- Pre-verified cheatsheet: OpenClaw is a real injection toolchain; pilot-protocol/pilotprotocol GitHub repo exists (CTA link).
- Local site files: banner public/blog/banners/building-custom-pilot-skills-openclaw.webp exists.
- Opinion (not flagged): "everything is explicit" design-principle framing, best-practice advice (composable commands, JSON everywhere, write out flags, test with agents), good/bad error-hint pedagogy.
- Example (not flagged): E101/E201 error codes, submit-review/recv-review/send-review-result custom commands (explicitly hypothetical skill), sample address, workflow steps.
