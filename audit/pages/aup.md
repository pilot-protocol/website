# Claim audit: src/pages/aup.astro
Audited: 2026-07-10 · Sentences examined: 72 · verified: 67 · false: 0 · unverifiable: 4 · opinion: 1 · example: 0

Note on methodology: this is a legal/policy page. Normative statements ("You may not…", "We may…", "We reserve the right…") are self-attesting — the AUP is itself the authoritative source of its own rules — and are recorded as VERIFIED (policy declaration). Only claims about external facts, the product, live URLs, dates, or operational enforcement were checked against independent sources.

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 70 | "Agent registration — Maximum of 100 registrations per IP address per hour." | Registry server source is not in web4 (pkg/ contains only daemon + telemetry); no rate-limit constant "100/hour" found anywhere in web4 Go source (only daemon `-syn-rate-limit`, default 100/sec, an unrelated packet-level limit). Cannot confirm this threshold is real/enforced. | Registry server source/config for 34.71.57.205:9000, or live enforcement test. |
| 71 | "Discovery lookups — Maximum of 1,000 queries per agent per hour." | Same — no server-side source available locally; value appears nowhere in web4 source. | Registry server source/config or live test. |
| 72 | "Handshake requests — Maximum of 300 handshake initiations per agent per hour." | Same — no server-side source available locally; value appears nowhere in web4 source. | Registry server source/config or live test. |
| 63 | "…any country subject to comprehensive sanctions by the United States, United Kingdom, European Union, or United Nations (including but not limited to Iran, North Korea, Syria, Cuba, and the Crimea, Donetsk, and Luhansk regions of Ukraine)." | The example list may be outdated: the US terminated the Syria sanctions program by Executive Order in mid-2025 and the EU lifted most economic sanctions on Syria in 2025, so citing Syria as comprehensively sanctioned as of a May 2026 effective date is doubtful; current status past knowledge cutoff cannot be confirmed with available tools. Hedged by "including but not limited to", so not FALSE outright. | Check current OFAC sanctions program list, EU/UK consolidated sanctions lists as of the policy date. |

## Verified claims (grouped by source)
- git log (website repo, `git log --follow -- src/pages/aup.astro`): single commit ed660f6 dated 2026-05-28 ("PILOT-25: Legal page bundle"), never modified since — confirms "Effective: May 28, 2026 · Last updated: May 28, 2026" (line 25).
- Live curl (2026-07-10): https://pilotprotocol.network/aup → HTTP 200 (canonicalUrl, line 9); https://pilotprotocol.network/terms → HTTP 200 (line 28 /terms link).
- src/pages/terms.astro:28: Terms define "Services", "Vulture Labs, Inc." (Delaware corp) and use "Pilot Protocol"/"Vulture Labs" interchangeably — supports line 28 ("Capitalized terms… meanings given in our Terms of Service") and line 55 ("Impersonating Pilot Protocol, Vulture Labs…" — both are real named entities).
- src/pages/ directory listing: index.astro exists (breadcrumb "Home" link, line 21); terms.astro exists (line 28 href).
- Site-wide grep: founders@pilotprotocol.network is the standard contact address across privacy, terms, plans, cookies, publisher-agreement, docs/security — consistent for lines 74, 90, 98, 109, 112.
- web4 Go source (pkg/daemon/daemon.go, tunnel.go, cmd/daemon/main.go, cmd/pilotctl/main.go — non-test files grep "ed25519"): agents are identified by Ed25519 keys — supports "blocking of the associated Ed25519 key" (line 82) and "Ed25519 public key fingerprint" (line 99).
- Pre-verified cheatsheet (pilotctl subcommand list): set-hostname / set-tags / handshake / register exist — hostname, tags, handshake, and registration are real product concepts (lines 56, 57, 70, 72, 93, 99).
- src/pages/plans.astro (lines 86-138): an Enterprise tier exists (early access, dedicated rendezvous, contact founders@) — supports "Enterprise tier customers receive negotiated rate limits under their service agreement" (line 74) as a real tier; the negotiated-limits promise itself is a policy declaration.
- pkg/daemon/daemon.go:115 (WebhookURL event-notification config) + daemon heartbeat injection mechanism: a "daemon notification" channel plausibly exists — supports the hedged ("where feasible") change-notice commitment (line 105); sibling terms.astro:118 and privacy.astro:148 make the identical commitment.
- Internal cross-reference: "see Section 2" (line 47) → Section 2 "Rate Limits" exists on the page (line 67).
- Self-attesting policy declarations (the AUP itself is the source): all Section 1 prohibited-use rules (lines 33-64), enforcement measures and notice policy (lines 78-85), reporting instructions and 2-business-day acknowledgment commitment (lines 88-93), appeals process and 5-business-day response commitment (lines 96-101), change-policy and acceptance-by-continued-use clauses (line 105), disclaimer sentences (line 112), title/meta description (lines 7-8, accurately describe page contents), headings and labels.

## Opinion
- Line 112: "This policy is provided for transparency and operational clarity." — characterization, no factual content.
