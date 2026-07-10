# Claim audit: src/pages/for/setups/[slug].astro

Audited: 2026-07-10 · Sentences examined: 2370 · verified: 2112 · false: 0 · unverifiable: 56 · opinion: 1 · example: 201

This is a dynamic template that renders 56 org-setup pages from an external catalog fetched at build time (`https://raw.githubusercontent.com/TeoSlayer/pilot-skills/main/setups.json`, HTTP 200, 56 setups, `total: 56`). Static template text was audited item by item; catalog-driven content was audited as claim classes with exhaustive programmatic checks across all 56 setups (not spot checks).

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 38 (class, ×56) | Each setup lede opens with a behavioral efficacy claim, e.g. "Deploy an ad campaign management system with 4 agents that automate campaign strategy, creative production, real-time bidding, and performance analytics." | The structural half (agent count, roles, skills, data flows) was verified consistent against the catalog and clawhub, but whether the installed setup actually *automates* the described domain workflow cannot be confirmed without deploying each of the 56 multi-agent setups. | Deploy a sample of setups end-to-end and exercise the described workflow, or cite an integration-test suite in TeoSlayer/pilot-skills that runs them. |

**Quality note (not a false claim):** Line 22 sets the meta description to `setup.tagline`, and 40 of 56 taglines are ~100-char truncations of the description that cut off mid-word (e.g. ad-campaign-manager: "…creative prod", digital-twin: "…before they occ", healthcare-triage: "…performs differentia"). Content is accurate (it is a prefix of the verified description) but ships broken-looking meta descriptions on 40 pages.

## Verified claims (grouped by source)

- **Local site files (src/pages/)**: internal links all resolve — `/for/setups` (L36, L41, L116 → src/pages/for/setups.astro), `/docs/getting-started` (L40, L115 → src/pages/docs/getting-started.astro).
- **Catalog source (raw.githubusercontent.com/TeoSlayer/pilot-skills/main/setups.json, HTTP 200)**: setup names/h1/titles (×56); difficulty values (beginner 16 / intermediate 20 / advanced 20); "Agents" meta value — `agent_count == agents.length` for all 56 setups (0 mismatches); "Skills" meta value — `skills_used` exactly equals the union of per-agent skills for all 56 setups (0 mismatches); agent-count numbers stated inside descriptions/taglines match `agent_count` for every setup that states one (0 mismatches); taglines are verbatim prefixes of the verified descriptions; agent role/description rows (×201) and data-flow rows (×211) render catalog data verbatim.
- **clawhub.ai (live, all 115 URLs checked individually)**: every skill chip target `https://clawhub.ai/teoslayer/<skill>` for all 59 distinct skills resolves (307 → 200 with a real title-cased skill page; a control fake slug renders a distinct not-found-style page, so this is not a catch-all false positive); the install command `clawhub install pilot-<slug>-setup` (L55) references a real package for all 56 slugs — every `pilot-<slug>-setup` page exists on clawhub.
- **npm registry**: `clawhub` CLI exists (clawhub@0.23.1, description: "ClawHub CLI — install, update, search, and publish skills plus OpenClaw packages"), so `clawhub install …` (L55 and 201 quick-start install lines) is a real command.
- **web4 source (cmd/pilotctl/main.go)**: every pilotctl subcommand appearing in quick-start blocks exists — `handshake` (×336; usage string at main.go:932 is `pilotctl handshake <node_id|hostname> [justification]`, matching the quoted-justification form used), `set-hostname` (×201) and `trust` (×56) per the pre-verified subcommand list. No non-existent subcommands appear anywhere in the catalog.
- **Pre-verified well-known ports**: data-flow ports are 1001 (dataexchange, ×11), 1002 (eventstream, ×165), and 443 (external HTTPS webhooks, ×35) — all legitimate.
- **Live URL**: canonical `https://pilotprotocol.network/for/setups/<slug>` pattern (L23) — sampled `/for/setups/ad-campaign-manager` returns HTTP 200.
- **Structural labels** (Install, Skills used, Agents, Data flows, Quick start, Difficulty): accurately describe the data they head (verified via the consistency checks above).

## Example values (not flagged)
- All 201 agent hostnames use the `<your-prefix>-<role>` placeholder pattern (0 exceptions), clearly instructional placeholders; quick-start comments instruct replacing `<your-prefix>` explicitly.

## Opinion (not flagged)
- L113 CTA "Ready to deploy {name}?" — marketing prompt, no factual content.

## Resolutions (2026-07-10, loop iteration 15)
0 FALSE. The 56 UNVERIFIABLE flags are all one class — each setup's efficacy lede ("automate campaign strategy…") sourced from the catalog data (TeoSlayer/pilot-skills setups.json); the structural half (agent count/roles/skills/flows) was verified consistent, and the efficacy framing is the catalog author's claim, not website-invented → ACCEPTED (catalog-sourced; can't deploy 56 setups to test each workflow). FIXED the real quality bug the auditor flagged: meta description used setup.tagline (a hard ~100-char cut breaking mid-word on 40/56 pages) → now a clean word-boundary truncation of setup.description (≤155 chars). Build green.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
