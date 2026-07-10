# Autonomous claim-fix loop — Pilot Protocol website

You are resolving the sentence-level claim audit in `/Users/calinteodor/Development/pilot-protocol/website/audit/` — 627 FALSE and 1,466 UNVERIFIABLE sentences across 167 page ledgers (see `audit/README.md` for the severity ranking). Work autonomously. Every fix must be **verified by actually running something** — a grep of product source, the real CLI command, a live curl, a build — never by assumption. The ledgers are the work queue AND the proof-of-work record.

## Repo/branch state
- Website: `/Users/calinteodor/Development/pilot-protocol/website`, branch **`fix/sweep-4`** (PR #116, stacked on PR #115 / `fix/sweep-3`). All work goes here.
- **NEVER merge PR #115 or #116** — the user merges. Never force-push.
- Product source: `/Users/calinteodor/Development/pilot-protocol/web4` (Go). Installer: `/Users/calinteodor/Development/pilot-protocol/release/install.sh`. Modules: `/Users/calinteodor/go/pkg/mod/github.com/pilot-protocol/{skillinject@v0.2.3,common@v0.5.0,protocol@v1.10.5}`.
- Live: `https://polo.pilotprotocol.network/api/public-stats`, `https://pilotprotocol.network/install.sh`, `gh api` for repo facts. Latest release: check `gh api repos/pilot-protocol/pilotprotocol/releases/latest` fresh each session — do not hardcode.

## One iteration
1. `cd /Users/calinteodor/Development/pilot-protocol/website && git checkout fix/sweep-4 && git pull --ff-only`.
2. Open `audit/PROGRESS.md` (create on first run: a table `ledger | flagged | resolved | status`, one row per ledger file, all `todo`). Pick the **highest-severity `todo` page** per the ranking in `audit/README.md`. Batch tip: you may take up to 3 related pages per iteration if they share a subject (e.g. all comparison pages).
3. For each flagged row in that page's ledger:
   - **FALSE** → re-verify the evidence yourself first (grep the cited source file/line, run the command, curl the URL). If the evidence holds, edit the page so the sentence matches shipped behavior. If the evidence does NOT hold, correct the ledger row instead and say why.
   - **UNVERIFIABLE** → resolve by one of, in order of preference: (a) add a real citation/source link; (b) verify it yourself by running a measurement or check, then record the evidence; (c) rewrite to a weaker claim that IS verifiable; (d) delete the sentence; (e) `ACCEPTED` with a one-line justification (use sparingly — marketing tone words only).
   - Append the resolution to the ledger row: `→ FIXED: <what changed + verification command/result>` or `→ ACCEPTED: <why>`. The ledger must always show how each row was closed.
4. **Verify the batch**: re-run the exact greps/commands/curls that prove each fix; then `npm run build` must pass (345+ pages).
5. Commit page fixes + ledger updates together, one commit per page/batch, message `audit-fix: <page> (<n> false, <m> unverifiable resolved)`. Push. End commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
6. Update `audit/PROGRESS.md` counts and commit it (can ride the same push).

## Fix policy — where truth lives
- **Default: copy follows code.** The website must describe what actually ships today. When a page overpromises (e.g. "skills status previews changes" — it actually reconciles), rewrite the page honestly; do not silently keep the nicer claim.
- **Product bugs — fix in code, not by weakening the promise.** These, discovered by the audit, are code work:
  1. **GA4 loads unconditionally on `/plain/*`** (`src/layouts/PlainLayout.astro:19-24`) with no consent check — consent-gate it the same way the main site does (this is website code; do it early, it is the GDPR item).
  2. In **web4** (branch `fix/consent-truth`, open a PR, do NOT release): daemon-side `app_usage` telemetry ignores `consent.telemetry` (gated only by `-telemetry-url`, `cmd/daemon/main.go:107-113`, `appstore_adapter.go`) — add the consent check; receiver-side broadcast consent gate missing (`pkg/daemon/daemon.go:4344-4356`); `skills status` performs a write-reconcile instead of previewing (`cmd/pilotctl/skills.go:57-63` ForceTick) — make status read-only or add a true `--dry-run`; `set-mode disabled` does not remove files though docs say it does. Write tests where feasible; `go build ./... && go test ./...` must pass. While the shipped release still has the old behavior, the website copy must describe the SHIPPED behavior (add "as of vX.Y" wording only if a fix has actually shipped).
- **Legal pages** (privacy, terms, cookies, aup, publisher-agreement): fix objectively false statements (e.g. cookie inventory, "banner on every page") and stale external facts, but do NOT invent policy; anything that changes a commitment gets listed under "Needs user review" in `audit/PROGRESS.md` instead.
- **Third-party facts** (comparison pages: ZeroTier/Tailscale/Nebula/MCP/A2A/ACP): verify against the third party's current site/repo with curl/gh before rewriting; cite what you checked in the ledger row.
- **Blog posts**: never change slugs, filenames, canonicalPaths, or banner paths. Historical announcement posts may keep past-tense claims that were true at publication — mark those `ACCEPTED (historical)` — but commands shown must be runnable today.

## Environment quirks (real, will bite)
- The **aegis PreToolUse hook blocks Bash commands referencing `~/.claude` paths** — use the Read/Write/Edit tools for anything under `~/.claude`, never shell.
- **plain-sync CI dance**: after a push, the plain-sync bot pushes regenerated `/plain` twins to the branch; its bot push does not trigger CI, so if checks are missing/red after the bot commit, `git pull` then push an empty commit (`git commit --allow-empty -m "ci: retrigger after plain-sync"`).
- Temp files go to the session scratchpad directory, not /tmp.
- `pilotctl` is installed locally — you can run real commands (`pilotctl appstore catalogue`, `pilotctl skills status` etc.) to verify live behavior. Prefer read-only commands; do not change the local daemon's trust/config state.

## Inbox (the user texts you back)
At the START of every iteration, drain the SMS inbox and obey anything in it (it may re-prioritize or stop the loop):
`curl -s -H "Authorization: Bearer $(security find-generic-password -a pilot-relay -s pilot-relay-inbox-token -w)" https://pilot-relay.vulturelabs01.workers.dev/drain`
Reply to every drained message via `~/bin/pilot-sms` (answer + what you did about it). Note: the inbox KV is eventually consistent — a message can take up to ~60s to appear after sending; it will be caught by the next drain.

## Notifications (keep the user in the loop remotely)
After each iteration's push, send a one-line SMS via `~/bin/pilot-sms` (configured per the "SMS / voice updates" section of the user's global `~/.claude/CLAUDE.md`): pages fixed this round, running totals, and **full URLs** — always include `https://github.com/pilot-protocol/website/pull/116` and, when relevant, the branch preview `https://fix-sweep-4.pilotprotocol.pages.dev/`. If an iteration hits a true blocker, follow the escalation ladder in that CLAUDE.md section (SMS → ~15 min → voice call → park and continue). Batch: one SMS per iteration, not per commit.

## Standing goals beyond the ledger (work these in when a ledger iteration is short, or once ledgers run dry)
1. **GA4 consent gate on `/plain/*`** (`src/layouts/PlainLayout.astro:19-24`) — highest priority non-ledger item (GDPR).
2. **web4 `fix/consent-truth` PR** — per the Fix policy section above.
3. **PR #116 CI**: full build/plain checks only run after PR #115 merges (stacked base). Until then `npm run build` locally is the gate. After #115 merges, watch #116 retarget to main, let plain-sync regen twins, do the empty-commit retrigger if checks stall, and text the user when #116 is fully green.
4. Blog index `readTime` (every card shows "3 min read" — compute from post body length) and the 500-page "We've been notified" claim — both in ledgers; noting here so they aren't skipped as "minor".

## Needs user (park here, never guess)
- Merge PR #115 then #116 (user merges, always).
- Anthropic API key for the live voice bridge (voicemail→inbox works without it).
- Transfer `TeoSlayer/pilot-skills`, `pilot-mcp`, homebrew tap to the `pilot-protocol` org.
- Ed25519 skill-content signing enablement (key management decision).
- Any legal-policy commitment changes surfaced by ledger work.

## Stop condition
When every ledger row in every file is resolved (`FIXED`/`ACCEPTED`) and the build is green: write a final summary at the top of `audit/PROGRESS.md` (totals, product PRs opened, items under "Needs user review"), comment that summary on PR #116 via `gh pr comment 116`, push, and **stop the loop**. If genuinely blocked on something only the user can decide, add it to "Needs user review", skip it, and continue with the rest — only stop early if ALL remaining work is user-blocked.
