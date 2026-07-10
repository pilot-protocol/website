# Claim audit: src/pages/blog/claude-agent-teams-over-pilot.astro
Audited: 2026-07-10 · Sentences examined: 95 · verified: 61 · false: 2 · unverifiable: 4 · opinion: 8 · example: 20

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 94, 133, 209, 329, 335, 341, 364 | `pilotctl send 1:0001.0000.0002 '{"description":...}'` (payload as positional arg) | cmd/pilotctl/main.go help: `Usage: pilotctl send <address|hostname> <port> --data <msg>` — a port argument and `--data` flag are required; the blog's syntax is invalid in every occurrence (manager tool, system prompt, worker `pilotctl send sender result_text`, end-to-end example, getting-started). |
| 98, 134, 331, 337, 343, 364 | `pilotctl recv --from 1:0001.0000.0002 --json` | cmd/pilotctl/main.go help: `Usage: pilotctl recv <port> [flags]` with only `--count`/`--timeout` flags — there is no `--from` flag and a port argument is required. Worker code `pilotctl recv --json` (no port) also invalid. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 268-271 | `pilotctl send-file 1:0001.0000.0002 ./src/auth/` (directory argument) | Help says `send-file <address|hostname> <filepath>` — directory support not confirmed | Source showing dir handling in send-file |
| 273 | "files can be embedded in message payloads as base64-encoded content" | Payload encoding practice, not confirmed against a documented limit/feature | Docs/source on message payload limits |
| 367 | "The entire setup takes about 15 minutes." | Time estimate with no measurement | A timed walkthrough |
| 79 | "The CI runner is behind GitHub's NAT." | Third-party infra claim (GitHub Actions egress specifics) | GitHub docs on runner networking |

## Verified claims (grouped by source)
- cmd/pilotctl/main.go help texts: `handshake <node_id> [justification]` syntax + "remote node must approve" (trust is explicit/mutual, non-transitive hub-and-spoke feasible); `subscribe <address> <topic>` and `publish <address> <topic> --data` match blog usage; `send-file` command exists.
- cmd/daemon/main.go:63,85: `-endpoint` flag (fixed public endpoint, skips STUN) and `-public` flag — `pilot-daemon -endpoint 34.148.103.117:4000 -public` valid (IP itself = EXAMPLE).
- cmd/daemon/main.go:65,69: X25519 + AES-256-GCM tunnel encryption; Ed25519 identity — matches "encrypted end-to-end with X25519 + AES-256-GCM" and "Ed25519 handshake".
- Pre-verified: data exchange service port 1001; event stream port 1002; github.com/pilot-protocol/pilotprotocol exists.
- gh api repos/pilot-protocol/pilotprotocol/contents/cmd: daemon, pilotctl, updater — `go install .../cmd/...` path valid.
- Local site files: internal links nat-traversal-ai-agents-deep-dive, zero-dependency-encryption-x25519-aes-gcm, trust-model-agents-invisible-by-default, peer-to-peer-file-transfer-agents, replace-message-broker-twelve-lines-go, mcp-plus-pilot-tools-and-network, contributing-codebase-tour all exist in src/pages/blog; /docs/ exists; banner webp exists in public/blog/banners.
- Product knowledge (Claude/Anthropic): Claude Code agent teams (manager + specialists, per-specialist context windows, git worktree isolation) is a real shipped feature; 200K token context window; model ID `claude-sonnet-4-20250514` is a real Anthropic model; claude.ai, anthropic.com, modelcontextprotocol.io are correct URLs.
- EXAMPLE items: all 1:0001.0000.000X addresses, GCP machine types, worker Python script, system prompt text, MacBook/CI scenario, 2FA walkthrough.
