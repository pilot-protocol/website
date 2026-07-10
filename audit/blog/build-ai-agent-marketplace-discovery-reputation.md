# Claim audit: src/pages/blog/build-ai-agent-marketplace-discovery-reputation.astro
Audited: 2026-07-10 · Sentences examined: 92 · verified: 42 · false: 6 · unverifiable: 16 · opinion: 12 · example: 16

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 163 | Table: "Open source — Yes (MIT license)" | gh api repos/pilot-protocol/pilotprotocol → license.spdx_id = AGPL-3.0, not MIT |
| 33-34 | `pilotctl extras set-tags code-review security-audit python golang` → "Tags updated: code-review, security-audit, python, golang" | web4/cmd/pilotctl/main.go:2452 — "Set discovery tags (max 3)"; four tags exceed the limit |
| 37-44, 175-178 | `pilotctl peers --search "code-review"` shown returning a registry-wide list of discoverable agents with tags + online status | main.go:5360+ cmdPeers filters the local daemon's connected `peer_list` (d.Info()), it does not search the registry; a new agent's `peers --search "etl"` would return nothing, not three strangers |
| 30 | "tags... stored in the registry and searchable by any trusted peer" via the shown command | Same — the shown command (`peers --search`) searches connected peers only; no registry tag-search command exists in the dispatch table |
| 78 | "Pilot supports policy-based auto-approval: the worker defines criteria (matching tags, time-of-day constraints), and incoming handshakes that meet the criteria are approved automatically." | Only auto-approval mechanisms in source: cmd/daemon/main.go:95 `--trust-auto-approve` (boolean, approves ALL) and the embedded trusted-agents list (main.go:1082); `pilotctl policy` is per-network JSON policy — no tag/time-of-day handshake criteria anywhere |
| 136 | `run(["recv", "--json"])` (and run() appends --json to init/daemon start too) | main.go:912 — `pilotctl recv <port>` requires a port argument; documented flags are --count/--timeout |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 26, 157-158, 198 | "Reputation is tracked through behavioral signals" / table "Behavior-based (per-connection)" / "behavior-based reputation" | grep of web4 Go source finds no reputation mechanism; a `review` command and reviews consent exist, but "behavioral signals" tracking is unconfirmed | Source code implementing reputation scoring |
| 76 | "The handshake justification is... a signed, auditable statement covered by the requester's Ed25519 signature." | Justification is transported with the request (pkg/daemon/ipc.go:1898, daemon.go:5834) but I could not confirm the signature covers the justification bytes | Handshake request signing payload in source |
| 4 | "There are thousands of AI agents available across GitHub repositories, Hugging Face spaces, LangChain hubs..." | Third-party ecosystem count, no source | Citation |
| 6 | Forum quotes: "There is still no good way to find agents..." / "why not?" | Unattributed quotes from unnamed "developer forums" | Links to the threads |
| 8 | "AWS Agent Marketplace, Anthropic's tool marketplace, and various startup attempts" exist as centralized agent marketplaces | Vendor product claims not checked; naming/existence of these exact products unverified | Vendor product pages |
| 18 | Quote: "50K tokens just for onboarding." | Unattributed developer quote | Source link |
| 16 | "A LangChain agent cannot natively call a CrewAI agent. An AutoGen group cannot delegate work to a standalone Python script." | Third-party framework interop claims | Framework docs |
| 151-165 | Comparison-table cells about AWS Agent Marketplace / centralized platforms (vendor application + review, AWS IAM, delisting, Bedrock lock-in, fees) | Vendor behavior claims, unchecked | Vendor documentation |
| 14 | Ghost agents "degrade the entire marketplace's reliability signal" / manifest in API marketplaces as listed-but-unmaintained services | General industry claim, no source | Industry study |
| 187 | "Payment protocols like x402 could layer on top" | Third-party protocol capability projection | x402 spec/integration demo |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `handshake <node|hostname> [justification]` (l.932) incl. justification string — the `handshake audit-bot "Requesting security review..."` command is valid; `pending` shows requester + justification (l.1074-1082); `approve <node_id|address|hostname>` (l.1122); `set-public` (l.1180); `extras set-tags` exists (extras-gated, l.1747); `init --hostname` flag exists (l.1043, though --registry is required); `daemon start` (l.1670); `send`/`recv` commands exist; mutual key exchange → "both agents store each other's public keys, every subsequent message authenticated and encrypted" (pkg/daemon/keyexchange).
- Pre-verified cheatsheet: trust gating / invisible-by-default; no listing fee/gatekeeper (open registry); free & open source (repo public — though license is AGPL, see FALSE); CLI-only participation (any language via pilotctl).
- Honest-limitations section (l.186-192): consistent with source — no payment, no SLA enforcement, tags unstructured/free-form. Verified by absence in web4 source.
- Site files: links trust-model-agents-invisible-by-default and build-agent-swarm-self-organizes exist in src/pages/blog/; banner public/blog/banners/build-ai-agent-marketplace-discovery-reputation.webp exists; GitHub CTA repo exists (gh api 200); canonical path matches.
- Google A2A Agent Cards = structured JSON capability documents — consistent with A2A spec (also covered by site's a2a post); comparison framing is opinion.
- Example (not flagged): addresses 1:0001.0000.0042 etc., fake terminal outputs, ~50-line Python worker, sample review findings.

## Resolutions (2026-07-10, loop iteration 28)
6 FALSE fixed (verified): license is AGPL-3.0 not MIT (gh api); set-tags max 3 not 4 (main.go:2452); pilotctl peers --search filters connected peers by node-ID substring, not a registry tag-search → rewrote the discovery examples to the list-agents directory service; policy-based per-tag/time-of-day handshake auto-approval does NOT exist (only --trust-auto-approve blanket flag + embedded trusted list) → corrected; recv requires a port arg. 16 unverifiable (reputation/marketplace narrative) accepted.
