# Claim audit: src/pages/docs/motd.astro
Audited: 2026-07-10 · Sentences examined: 35 · verified: 33 · false: 0 · unverifiable: 0 · opinion: 0 · example: 2

No flagged claims.

## Verified claims (grouped by source)
- web4/internal/motd/motd.go: MOTD concept & split of responsibilities (pkg doc L1–21); daemon is only component touching network / pilotctl reads mirror only, one file read, no HTTP, no IPC (L8–15); DefaultInterval = 15m (L48); SelectForToday picks entry dated for current UTC day (L133–145); ReadActiveMirror re-validates UTC day on read so stale mirror (daemon offline across midnight) never shows yesterday's message (L168–191); cleared feed → banner disappears within one poll interval (L17–20, WriteMirror L147–166); malformed/empty feed handling (Parse L116–131); DefaultFeedURL constant points at pilot-protocol/pilot-changelog feed = "managed centrally by the team, nothing to set up" (L37–44).
- web4/cmd/pilotctl/motd.go + main.go: banner "Message of the day: %s\n\n" = banner line + blank line (motd.go L38–43); prepended ahead of EVERY command — loadMOTD()+printMOTDBanner() run in main() before dispatch (main.go L1581, L1600); no-op in --json mode (motd.go L39); mirror path = configDir()/motd.json → ~/.pilot/motd.json (motd.go L21–23, main.go configDir L54–64); no banner when no active message → output unchanged (motd.go L39).
- web4/cmd/pilotctl/main.go (output helpers L115–210): --json envelope {"status":"ok","data":...} carries top-level important_update (L117–120); same field added to error envelopes (fatalCode L149–152, fatalHint L197–200).
- web4/cmd/daemon/main.go: -motd-feed-url flag, default = DefaultFeedURL, "empty to disable" (L105); -motd-interval flag "(default 15m)" (L106); PILOT_MOTD_URL env override (L120–122).
- web4/pkg/daemon/daemon.go: motdPollLoop background goroutine started by daemon — no new binary (L1218–1224, L4612); empty URL disables polling entirely (L4613–4616, config comment L131–132); interval ≤0 → motd.DefaultInterval 15m (L4617–4620); holds current value in memory d.motd (L400–401); mirrors to disk (refreshMOTD L4643–4670); mirror lives next to daemon identity, falling back to ~/.pilot/motd.json (motdMirrorPath L4590–4605); fail-safe: fetch/parse errors non-fatal, keeps last good mirror, slog.Debug (L4650–4653, L4666–4668); ASCII diagram (feed → daemon → mirror → pilotctl) matches this architecture.
- web4/pkg/daemon/daemon.go L2634, L2726 + pkg/daemon/ipc.go L1150: daemon surfaces current value as "motd" in the info response consumed by pilotctl info.
- skillinject@v0.2.3 (config.go L25, skillinject.go L11, L49): existing skill-reconciler loop in the daemon (15-min reconcile ticker) — the "modelled on the existing skill-reconciler loop" claim.
- Local site files: internal TOC anchors #what/#how-it-works/#output/#config/#rules all present on page; prev /docs/configuration and next /docs/integration exist (src/pages/docs/configuration.astro, integration.astro); frontmatter description restates verified banner/UTC-day semantics.

## Examples (not flagged)
- Line 22–25: terminal sample `pilotctl info` with banner "overlay maintenance 22:00 UTC — expect ~5min blips" — invented demo text; banner format itself verified against printMOTDBanner.
- Line 52–53: JSON envelope sample with "overlay maintenance 22:00 UTC" — invented demo text; envelope shape verified against output().

## Resolutions (2026-07-11 iter 65)
- Reviewed: no fixable Pilot overclaim. Zero-flag or single unverifiable claim that is standard marketing/contact/legal or a third-party framing — ACCEPTED (flagged in ledger). Legal-commitment items (aup rate limits/sanctions, publisher-agreement revocation signals) routed to PROGRESS.md Needs user review.
