# Claim audit: src/pages/docs/comparison.astro

Audited: 2026-07-10 · Sentences examined: 184 · verified: 137 · false: 10 · unverifiable: 6 · opinion: 26 · example: 5

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 59 | "Agent cards (/.well-known/agent.json)" | Current A2A spec (https://a2a-protocol.org/latest/specification/, HTTP 200, fetched 2026-07-10) uses `/.well-known/agent-card.json` (4 occurrences); `agent.json` appears nowhere. Outdated path. |
| 38 | MCP Transport: "stdio, HTTP+SSE" | Current MCP spec transports page (modelcontextprotocol.io/specification/2025-06-18/basic/transports, HTTP 200) defines "stdio" and "Streamable HTTP" (26 mentions each); the named "HTTP+SSE" transport was deprecated/replaced in the 2025-03-26 revision. Stale naming. |
| 41 | MCP Trust model: "Implicit (local process)" | MCP spec 2025-06-18 includes a full OAuth-based authorization framework for HTTP transports (modelcontextprotocol.io/specification/2025-06-18/basic/authorization, HTTP 200). Trust is not merely implicit-local. |
| 77 | ACP Purpose: "Local runtime orchestration" | ACP's official site (agentcommunicationprotocol.dev, HTTP 200) self-describes as "an open protocol for agent interoperability" connecting agents "across different frameworks, teams, and infrastructures" via a RESTful API — not local-runtime-scoped. |
| 78 | ACP Scope: "Single runtime / cluster" | Same evidence as line 77 — ACP is a cross-infrastructure REST protocol, not confined to a single runtime/cluster. |
| 82 | ACP NAT traversal: "Not applicable (local)" | ACP is HTTP/REST across networks (per its own site); like A2A it needs reachable endpoints — "local, N/A" mischaracterizes. (Same claim repeated at line 105, matrix "ACP: N/A".) |
| 86 | "ACP orchestrates agents within a single runtime environment." | Same evidence as line 77. Related repeats of this single-runtime framing: line 27 ("coordinate tasks within a runtime"), line 71 ("orchestration within a runtime"), line 146 ("within a single runtime"), line 148 ("within one environment"). |
| 71 | "ACP focuses on multi-agent orchestration within a runtime..." | Same single-runtime claim; contradicted by ACP's own description (see line 77 evidence). |
| 112 | Matrix Offline/async: "ACP → No" | ACP site explicitly lists "Synchronous and asynchronous communication", "Online and offline agent discovery", and "Long running tasks" as core features. |
| 113 | Matrix Dependencies: "Pilot → Stdlib only" | web4/go.mod requires third-party modules: github.com/coder/websocket v1.8.15, github.com/expr-lang/expr v1.17.8, golang.org/x/net, golang.org/x/sys, plus 15 pilot-protocol/* modules. Not stdlib-only. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 47 | "MCP is designed for a single model interacting with local tools." | Design-intent claim; current spec explicitly supports remote servers via Streamable HTTP, so "local tools" framing is at best dated. | An MCP design-goals statement scoping it to local tools (none found on spec site). |
| 80 | ACP Discovery: "Local agent directory" | ACP site says "online and offline agent discovery"; no evidence discovery is a *local* directory. (Repeated at line 107, matrix "ACP → Directory".) | ACP spec section defining a local-only directory mechanism. |
| 81 | ACP Trust: "Runtime-level access control" | ACP landing page does not describe its access-control model; not confirmed. | ACP spec/auth documentation. |
| 102 | Matrix Permanent agent identity: "ACP → Agent ID" | Did not locate an "Agent ID" identity concept in ACP materials fetched. | ACP OpenAPI spec showing a persistent agent identifier. |
| 104 | Matrix E2E encryption: "ACP → No" (while A2A gets "TLS") | ACP is HTTP/REST and runs over HTTPS just like A2A; giving A2A "TLS" but ACP "No" is inconsistent and unconfirmed. | ACP transport-security documentation. |
| 111 | Matrix Streaming: "ACP → SSE" | ACP site confirms "streaming interactions" but the landing page never mentions Server-Sent Events / text/event-stream (grep: 0 hits). | ACP REST spec showing SSE as the streaming mechanism. |

## Verified claims (grouped by source)
- web4 source (/Users/calinteodor/Development/pilot-protocol/web4): X25519 + AES-256-GCM per tunnel (pkg/daemon/keyexchange/derive.go — ecdh.X25519, AES-GCM via HKDF-SHA256 "pilot-tunnel-v1"); 48-bit pilot address (pkg/daemon/daemon.go:2541); STUN endpoint discovery (pkg/daemon/tunnel.go:2147 DiscoverEndpoint) + relay code (pkg/daemon/{tunnel,ports,ipc,daemon}.go, udpio/socket.go); `pilotctl connect <address|hostname> [port]` syntax matches the line-158 example (cmd/pilotctl/main.go:896, 3699); connect = "Open a raw stream connection" (main.go:2458) backing Pilot streaming/MCP-over-tunnel claims; nameserver module in go.mod backing DNS discovery.
- Pre-verified cheatsheet: -transport default udp (encrypted UDP tunnels); registry 34.71.57.205:9000 (registry discovery); pilotctl inbox/pending/approve/trust/handshake/publish/subscribe/set-tags/find/lookup/map/listen commands exist (inbox queuing, mutual-handshake trust, explicit peer approval, pub/sub built-in, tags+DNS discovery); service agents exist (task delegation / tool calling via services).
- protocol@v1.10.5 module: address display format `net:xxxx.xxxx.xxxx` (testdata/webhook/agent.registered.json "0:0001.0000.cafe"; web docs "1:0001.0000.03E9") — validates example "1:0001.0000.0042" (line 166) as well-formed; "permanent virtual address" wording (web/public/SKILLS.md:40) backing permanent-identity claims.
- modelcontextprotocol.io (spec 2025-06-18 transports + intro, HTTP 200): MCP = open protocol connecting LLMs to tools/data; stdio transport; SSE used for streaming; JSON-RPC message format; hub-and-spoke host↔server architecture; tool manifests/named tool endpoints. Anthropic origin: Anthropic's Nov 2024 MCP announcement (pre-cutoff knowledge).
- a2a-protocol.org/latest/specification (HTTP 200): agent cards, task lifecycle, HTTP + JSON-RPC transport, SSE streaming, push notifications (offline row), TLS security, URL addressing, Google origin (now Linux Foundation — pages calling it simply "Google's protocol" are dated but origin-accurate).
- agentcommunicationprotocol.dev (HTTP 200): BeeAI origin (© BeeAI a Series of LF Projects; underpins BeeAI platform), RESTful HTTP transport, framework-agnostic interop, streaming support. Note: site banner says ACP is now part of A2A under the Linux Foundation — the page nowhere mentions this.
- Local site files (src/pages): blog/mcp-plus-pilot-tools-and-network.astro and blog/a2a-agent-cards-over-pilot-tunnels.astro exist (lines 48, 68); docs/troubleshooting.astro and docs/comparison-networking.astro exist (prev/next, lines 182-183); all 7 TOC anchors resolve to in-page ids.
- Opinion/marketing (not flagged): "TCP/IP for agents", "complementary rather than competing", "combine naturally", "come for free", "lightweight networking with minimal infrastructure", callout "what agents say vs how they reach each other", layer classifications (L3/L4 vs L7).
- Examples (not flagged): code-block comments lines 156-159, agent-card JSON lines 163-168 (address format valid), Pilot port 80 demo value.
