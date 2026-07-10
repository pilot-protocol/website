# Claim audit: src/pages/blog/build-an-agent-app.astro
Audited: 2026-07-10 · Sentences examined: 56 · verified: 47 · false: 0 · unverifiable: 1 · opinion: 6 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 60 | "The apps that get reused share a few properties…" (implies reuse metrics for the listed apps) | No usage/reuse data available; app existence verified but "get reused" is a behavioral claim | Install/call telemetry per app |

## Verified claims (grouped by source)
- Pre-verified cheatsheet: "243k+ agents" (total_nodes 250,175 ≥ 243k); appstore catalogue/view/install/list/call loop; `<app>.help` convention + latency classes; install.sh URL live.
- web4/cmd/pilotctl (main.go, appstore.go): appstore subcommands and help text; daemon-supervised app model.
- src/data/apps.ts: Cosift (grounded search/retrieval, line 1123), AEGIS (runtime firewall vs prompt injection, 1939), Sixtyfour (contact/company intelligence, ~1681 area), Miren (deploy/rollback PaaS, 1681), Smol Machines (hardware-isolated microVMs, 1557), Wallet (on-overlay USDC, 2110); `cosift.search` method exists.
- src/pages/publish.astro: STEPS = Email/Identity/Backend/Methods/Listing/Vendor/Review (line 223); one-time email code (32); no code upload — Pilot builds & signs adapter (29, 33); team reviews every submission (35); email on submit + approval (36); secrets never collected, operator-supplied at install time (34, 448-449); "right to publish" release at review (37, 427); latency class per method (381). FAQ answers restate these — all verified against same lines.
- Local site files: blog links mcp-plus-pilot-tools-and-network, ai-agent-discovery-process-p2p-networks, secure-ai-agent-communication-zero-trust, connect-ai-agents-behind-nat-without-vpn all exist in src/pages/blog/; /publish page exists; banner public/blog/banners/build-an-agent-app.svg exists.
- Opinion (not flagged): "Publishing once and reaching every agent is the whole point", "one job done well", "worth installing", flywheel language.
- Example (not flagged): io.pilot.cosift command samples, {"q":"raft consensus","k":"5"}.

## Resolutions (2026-07-11 iter 65)
- Reviewed: no fixable Pilot overclaim. Zero-flag or single unverifiable claim that is standard marketing/contact/legal or a third-party framing — ACCEPTED (flagged in ledger). Legal-commitment items (aup rate limits/sanctions, publisher-agreement revocation signals) routed to PROGRESS.md Needs user review.
