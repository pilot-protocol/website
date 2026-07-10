# Claim audit: src/pages/terms.astro

Audited: 2026-07-10 · Sentences examined: 86 · verified: 27 · false: 2 · unverifiable: 3 · opinion: 54 · example: 0

Note on method: this is a legal page. Performative/contractual clauses ("You agree…", disclaimers, liability caps, indemnification, SMS program terms conditional on opt-in) create obligations rather than assert facts; they are bucketed under "opinion" (no verifiable factual content) and not flagged. Only present-tense factual assertions about the product, company, licenses, links, and dates were fact-checked.

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 25 | "Effective: May 28, 2026 · Last updated: June 26, 2026" | The "Last updated" date is stale. Git: page created 2026-05-28 (PILOT-25 #6, matches Effective) and SMS section added 2026-06-26 (#53, matches the printed date) — but commit 18ade06 (2026-07-10, "Sweep 4") subsequently changed the parties clause on line 28 from "Vulture Labs" to "Vulture Labs, Inc., a Delaware corporation" — a substantive change to the named contracting entity — without bumping the date. This also violates the page's own §12 promise ("We will post changes to this page and update the 'Last updated' date."). |
| 57 | "pilotprotocol.network — The website, branding, documentation (except code samples), and the 'Pilot Protocol' name and logo are proprietary. They are not open-source licensed." | The website's own source repo contradicts this: `gh api repos/pilot-protocol/website` → public, license AGPL-3.0; the repo-root LICENSE is the plain GNU AGPL v3 text with no proprietary carve-out for content/branding/documentation. The website and its documentation pages ARE published under an open-source license. (Trademark on the name/logo can survive an AGPL code license, but the blanket "not open-source licensed" claim is contradicted.) Either the repo needs a content-license exception or this clause needs rewording. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 28 | "…binding agreement between Vulture Labs, Inc., a Delaware corporation…" | Delaware corporate registration is not checkable with available tools (ICIS search is captcha-gated). Only self-consistency found (privacy.astro:28 says the same). | Delaware Division of Corporations entity search result / file number for "Vulture Labs, Inc." |
| 37 | "Pilot-operated specialist agents — Agents run by Pilot Protocol for network services (e.g., DNS resolution, time synchronization, skill indexing)." | No available source enumerates which network agents are Pilot-operated. Skill indexing plausibly maps to list-agents/pilot-skills, but no DNS-resolution or time-synchronization agent was found in web4 source, src/data/apps.ts, or site docs. | A published list of Pilot-operated agents, or the agents' presence in the live directory attributed to Pilot Protocol. |
| 105 | "Pilot Protocol offers an optional SMS text-messaging program." | No SMS/phone-number functionality exists anywhere in the product source (web4 grep for sms/twilio/phone: only TCP "SMSS" congestion-control matches) or on the website beyond the disclosure text itself (terms + privacy, added 2026-06-26 in #53 "A2P messaging disclosures"). No opt-in flow found. | A live phone-number enrollment/verification flow, or the A2P campaign registration (e.g., Twilio toll-free verification) confirming the program is operational. |

## Verified claims (grouped by source)
- gh api repos/pilot-protocol/pilotprotocol: daemon license = AGPL-3.0 (L46, L56); LICENSE file present in repo, 34,523 bytes = "license text included with the software" (L56); source-code URL github.com/pilot-protocol/pilotprotocol resolves (L56, also pre-verified repo list).
- /Users/calinteodor/Development/pilot-protocol/web4/LICENSE: GNU AGPL v3 text — use/modify/redistribute grant (L46) and AGPL warranty disclaimer §15–16 (L80).
- web4/pkg/daemon (tunnel.go:92-105 EncryptFrame/DecryptFrame path; ed25519 in daemon.go/ipc.go/tunnel.go): direct encrypted P2P tunnels (L40); no content inspection possible on E2E-encrypted peer traffic + registry is rendezvous-only (L40); Ed25519 private key = agent identity (L67 ×2).
- Pre-verified cheatsheet: registry 34.71.57.205:9000 as the discovery/rendezvous service (L36).
- Local site files (src/pages/): aup.astro exists → /aup link (L62); privacy.astro exists → /privacy link (L115); docs/ + blog/ dirs exist → "website, documentation, blog" scope (L35); breadcrumb Home link (L21).
- Live URLs (curl, HTTP 200): https://pilotprotocol.network/terms (L9 canonical), /aup, /privacy.
- src/pages/plans.astro: Private Network tier "02 · Early access" (L49); Enterprise "03 · Early access" with dedicated rendezvous + priority support + SLA (L52); free/open backbone tier (L46 "free of charge").
- src/pages/privacy.astro: registration data removed after 30 days offline (privacy:85) — consistent with L97's 30-day removal; SMS no-sell/no-share wording (privacy:74) consistent with L115; SMS handling described in Privacy Policy §4 (L115).
- dig MX pilotprotocol.network (Google Workspace MX present) + 25 site-wide uses: founders@pilotprotocol.network contact address (L52, L102, L111, L122, L125).
- git log (website repo): Effective date May 28, 2026 matches page creation commit of 2026-05-28 (the "Last updated" half of L25 is FALSE, see above).
- Page self-description: title (L7) and meta description (L8, 2 sentences) accurately summarize the page's scope and the §1 P2P exclusion; H1 (L23).

## Resolutions (2026-07-11 iter 41)
- L25 ("Last updated: June 26, 2026" stale): bumped to "July 10, 2026" to reflect the 2026-07-10 parties-clause change (Vulture Labs → Vulture Labs, Inc., a Delaware corporation, commit 18ade06), honoring the page's own §12 promise to update the date on changes.
- L57 ("not open-source licensed" for website/docs/branding): NOT auto-edited — this is a legal-commitment clause and the website repo is public under AGPL-3.0 with no content carve-out, so the clause is factually contradicted. Routed to PROGRESS.md "Needs user review" (either add a content-license exception to the repo, or reword the clause — a legal decision, not mine to invent).
- L28/L37/L105 UNVERIFIABLE (Delaware registration, Pilot-operated agents list, SMS program): left as-is; unverifiable with available tools, not asserted beyond the legal text.
Build: npm run build green (345 pages).
