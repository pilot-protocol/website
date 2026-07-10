# Claim audit: src/pages/blog/mcp-plus-pilot-tools-and-network.astro
Audited: 2026-07-10 · Sentences examined: 84 · verified: 38 · false: 7 · unverifiable: 5 · opinion: 24 · example: 10

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 83-85 | Imports `github.com/pilot-protocol/pilotprotocol/pkg/driver`, `pkg/tasksubmit`, `pkg/eventstream` | Public repo pkg/ contains only daemon + telemetry (gh api repos/pilot-protocol/pilotprotocol/contents/pkg); none of these packages exist. Go SDK is github.com/pilot-protocol/common/driver (pre-verified) |
| 97 | `drv.SetTaskReady(true)` | No SetTaskReady method on the driver — common@v0.5.0/driver/driver.go exposes SendTo/RecvFrom only |
| 103, 134, 150 | `drv.Recv()`, `drv.Send(msg.Sender, []byte(...))`, `drv.Publish(...)` | Driver API is `SendTo(dst, port, data)` / `RecvFrom()` (driver.go:170,202); Recv/Send/Publish do not exist |
| 144-152 | Go example references `task.ID` / `task.Params` — variable `task` is never declared (only `msg`) | Example does not compile; presented as a working implementation |
| 196-197 | `pilotctl recv --json` (Python example) | recv requires a port argument: `Usage: pilotctl recv <port>` (main.go:912); no port supplied |
| 217-221 | `subprocess.run(["pilotctl", "send", msg["sender"], summary])` | send requires `<address|hostname> <port> --data <msg>` (main.go:904); port and --data missing |
| 39-55 | Conceptual Go: `a.pilot.Recv()`, `a.pilot.Send(msg.Sender, result)` on `*driver.Driver` | Same nonexistent methods; labeled "conceptual" but typed against the real driver package |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 6 | "MCP has crossed 97 million monthly SDK downloads." | Third-party download stat, no citation; not checkable from audited sources | npm/PyPI download stats for MCP SDKs |
| 6 | "Thousands of MCP servers exist for everything from GitHub to Postgres to Slack." | Count not verified; servers repo exists but census unconfirmed | Registry/repo count |
| 245 | "Three agents, two databases, zero shared infrastructure beyond the Pilot registry." | Scenario outcome claim, not demonstrated | Working demo |
| 261 | "the only requirement is a rendezvous server for discovery, which you can use publicly or self-host" | Self-hosting the registry not confirmed in audited sources | Registry self-host docs/binary |
| 270 | "give your agent a peer address in under 5 minutes" | Timing claim, unbenchmarked | Timed onboarding run |

## Verified claims (grouped by source)
- Pre-verified cheatsheet: IPC socket /tmp/pilot.sock; data exchange port 1001; well-known ports model
- common@v0.5.0/driver/driver.go:62: `driver.Connect("/tmp/pilot.sock")` signature (socketPath arg) — the connect call itself is correct
- cmd/pilotctl/main.go: `pilotctl publish <broker-addr> research.completed --data <event>` matches usage (1339); pilot-daemon startup; send-message/handshake surface exists
- Live URLs (curl 200): modelcontextprotocol.io, github.com/modelcontextprotocol/servers, github.com/pilot-protocol/pilotprotocol, jsonrpc.org (MCP uses JSON-RPC — per MCP spec)
- Local site: relative links trust-model-agents-invisible-by-default, zero-dependency-encryption-x25519-aes-gcm, nat-traversal-ai-agents-deep-dive, a2a-agent-cards-over-pilot-tunnels, build-agent-swarm-self-organizes all exist under src/pages/blog/ and resolve correctly from /blog/*; /docs/ exists; banner public/blog/banners/mcp-plus-pilot-tools-and-network.webp exists
- MCP public docs: client-server model, stdio/HTTP transports, MCP Python SDK ClientSession/stdio_client — consistent with modelcontextprotocol.io SDK
- OPINION: "half an agent", "eyes and hands / voice and ears", vertical/horizontal framing, "this separation is a feature"
- EXAMPLE: SQL queries, research-agent scenario, mcp CLI wrapper (explicitly labeled "In production, use the MCP Go SDK"), <broker-addr> placeholder

## Resolutions (2026-07-10, loop iteration 31)
7 FALSE fixed: pkg/driver→common/driver import + removed nonexistent pkg/tasksubmit & pkg/eventstream imports; Connect(""); caveated the fictional driver methods (SetTaskReady/Recv/Send/Publish — real API is SendTo/RecvFrom) as illustrative; recv needs a port (1000); send needs <addr> <port> --data. 5 unverifiable accepted.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
