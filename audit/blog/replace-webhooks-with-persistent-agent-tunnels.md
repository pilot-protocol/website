# Claim audit: src/pages/blog/replace-webhooks-with-persistent-agent-tunnels.astro
Audited: 2026-07-10 · Sentences examined: 78 · verified: 44 · false: 7 · unverifiable: 11 · opinion: 7 · example: 9

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 208 | "you can bridge them into the Pilot event stream with a small adapter. Set the webhook to point at pilotctl set-webhook" | web4/cmd/pilotctl/main.go:1215 — set-webhook makes the daemon POST event payloads OUT to a URL. It does not receive webhooks and it does not publish into the event stream. Direction is inverted. |
| 210-211 | "# Start the webhook bridge: receives HTTP POSTs, publishes to event stream / pilotctl set-webhook http://localhost:8080/events" | Same evidence: set-webhook registers an outbound notification URL; it starts no HTTP receiver and no bridge. |
| 213-214 | "Now any webhook pointing at localhost:8080/events gets bridged into the Pilot event stream" | No such bridge exists in the CLI or daemon source. |
| 216 | "Existing webhook providers POST to the bridge. The bridge publishes to the event stream." | Same — the described component does not exist. |
| 343 | "Bridge existing webhooks: Use pilotctl set-webhook to pipe incoming webhooks into the event stream." | Same evidence (main.go:1215). |
| 355-356 | "# Step 3: Bridge existing webhooks / pilotctl set-webhook http://localhost:8080/events" | Same. |
| 327 | "Use the webhook bridge pattern for these." | The referenced bridge capability does not exist. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "'Give me /events, not webhooks.' That sentiment hit the front page of Hacker News" | No citation/URL; HN ranking history not checkable here | Link to the HN thread |
| 6, 19 | "Nearly 20% of webhook event deliveries fail silently during peak loads" / "A production study ... found that nearly 20% of deliveries fail" | The "production study" is never named or linked | Citation to the study |
| 17 | Retry windows "vary wildly between providers, from 30 minutes to 72 hours" | Aggregate vendor-behavior claim, uncited | Provider docs survey |
| 38 | Quote: "You would need 4 new services (SQS, S3, Publisher, Consumer) just to handle a single webhook safely." | Unattributed blockquote | Source article link |
| 49 | "The free tier of ngrok limits you to 20 connections per minute" | ngrok pricing/limits not verifiable here; historical docs said 40/min, suggesting this is likely wrong | ngrok docs/pricing page |
| 49 | "Your webhook URL changes ... roughly every 7 hours on the free tier" | ngrok session-length claim, uncited | ngrok docs |
| 51 | "Every webhook payload passes through ngrok's servers in plaintext (unless you add your own TLS layer)" | Vendor architecture claim (ngrok terminates TLS; "plaintext" framing uncheckable) | ngrok TLS/e2e docs |
| 25 | Cloud VMs have "no public IP (which is the default on most cloud providers now)" | Vendor-default claim, uncited | Cloud provider docs |
| 317 | "The daemon is a single binary, ~15 MB" | No release artifact measured | `ls -l` on a released pilot-daemon binary |
| 29 | "a surprising number of implementations get it wrong -- timing attacks on HMAC comparison..." | Prevalence claim, uncited | Security survey citation |
| 6 | "Events arrive out of order." (as a general webhook property) | Provider-behavior generalization | Provider docs |

## Verified claims (grouped by source)
- web4/cmd/pilotctl/main.go: `pilotctl subscribe <address|hostname> <topic>` and `pilotctl publish ... --data` syntax (usage 1331/1339) match L75-82, L359 and the Python subprocess wrappers; global --json output exists (jsonOutput); `pilotctl network join <id>` (network usage, line 1052) matches L353; `pilotctl daemon start` exists (dispatch 1670, cmdDaemonStart 2774) and forwards -email to the daemon (cmd/daemon/main.go:70).
- Live: https://pilotprotocol.network/install.sh → HTTP 200 (curl HEAD 2026-07-10) — matches L342/L349 install command.
- Pre-verified cheatsheet: eventstream port 1002; X25519/AES-256-GCM encrypted UDP tunnels; STUN discovery + hole-punching + beacon relay (incl. symmetric NAT); Ed25519 trust handshake; registry + hostname lookup discovery; GitHub repo link.
- src/pages/docs/pubsub.astro: topic pub/sub on trusted peers, wildcard topics, no persistence (fire-and-forget) — supports the comparison-table Pilot column.
- General protocol facts (RFC-level/common knowledge): webhook = HTTP POST to URL, SSE/WebSocket client-initiated direction rows, TLS-you-configure rows, Wikipedia webhook link.
- FALSE-section counts as the 6 lines of Go claim (L314) — depends on the same nonexistent OpenEventStream Go API flagged in the broker-post audit; counted under false there, here L88-163 Go examples share that defect: import path pilotprotocol/pkg/driver and OpenEventStream/Subscribe/Publish do not exist (common@v0.5.0/driver grep) — included in the 7 FALSE above via the code blocks.
- EXAMPLE: task/payment event payloads, pay_abc123, broker-addr placeholders, terminal transcripts.
- OPINION: "band-aid", "unacceptable trust model", "the decision point is clear", CTA copy.
