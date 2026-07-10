# Claim audit: src/pages/docs/pilot-director.astro
Audited: 2026-07-10 · Sentences examined: 42 · verified: 27 · false: 6 · unverifiable: 2 · opinion: 5 · example: 2

Primary evidence: live call to the director's own HTTP API (`POST https://director.pilotprotocol.network/api/plan`, 2026-07-10) returned the real reply schema:
`{"ok": true, "errors": [], "repaired": false, "plan": {"task", "kind", "steps": [{id, resource, params, depends_on, rationale}], "output"}, "guide": "<markdown>", "classification": "achievable now", "class": "achievable"}`
The site's own docs show the same schema (`-> {ok, class, classification, plan:{steps,handoff,output}, guide}`) for both the HTTP and overlay interfaces, and its UI JS reads `d.plan.handoff`, `d.guide`, `d.class` with badge classes `b-achievable / b-agent / b-not-yet`. The overlay agent itself resolved via the directory (`pilot-director → node 243113 / 0:0000.0003.B5A9`) but data connections timed out during the audit (local relay convergence), so overlay replies were verified via the site + HTTP API instead.

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 48 | `"calls": ["pilotctl send-message google-maps-places-new --data ... --wait"]` | Real reply has NO top-level `calls` field. Ready-to-run pilotctl commands live inside the markdown `guide` field; structured steps live in `plan.steps` (observed live /api/plan reply 2026-07-10; site schema line confirms). |
| 49–50 | `"handoff": ["Install the phone app: ...", "Call the number ..."]` (shown as a top-level field) | `handoff` is nested under `plan` (`plan.handoff`), not top-level — per the site's own JS (`d.plan.handoff`) and schema line `plan:{steps,handoff,output}`. Live reply had no top-level `handoff`. |
| 51 | `"guide_url": "https://director.pilotprotocol.network"` | No `guide_url` field exists. The real field is `guide` and it contains a markdown how-to guide, not a URL (observed live reply; site JS renders `md(d.guide)`). The URL itself is live (GET 200) but is not what the field holds. |
| 55 | "class — the director's verdict on feasibility (achievable, partially achievable, or out of scope for the network today)" | Actual class enum per the director's own UI: `achievable`, `agent`, `not-yet` (badge classes `b-achievable/b-agent/b-not-yet`, default `class\|\|"not-yet"`). There is no "partially achievable" class; the middle class is `agent` (agent-handled/handoff work). |
| 56 | "calls — ready-to-run pilotctl commands, in dependency order; run them as given and thread results forward" | Documents a field that does not exist. The equivalent content is `plan.steps` (with `depends_on`) plus runnable commands in `guide` (observed live reply). |
| 58 | "guide_url — the director's own reference site" | No such field; `guide` is per-task markdown guidance, not a link to the reference site (observed live reply + site JS). |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 27 | "…holds the complete picture of what the overlay can do — every specialist in the directory, every installable app, and their query contracts." | Completeness ("every … every") is a vendor claim. Site says it "grounds it in 468 live resources" and footer calls itself "the network's source of truth", but coverage vs. the full directory/app-store could not be enumerated. | Director source code, or diffing its resource list against the live directory + app catalogue. |
| 62 | "The director already validated agent names, filters, and ordering against the live directory." | Validation mechanism is internal. Reply carries `errors: []` / `repaired: false` fields and the guide claims "each is a real, validated call", but that is self-reported; overlay agent was unreachable for a negative test. | Director source, or a controlled test showing invalid agent names/filters get rejected or repaired. |

## Verified claims (grouped by source)
- Live `POST https://director.pilotprotocol.network/api/plan` (2026-07-10): plain-English task → structured JSON plan (L6, L13, L27 s2, L44); `"class": "achievable"` field/value (L47); single-hop full plan (L68); steps in dependency order with data threaded (`depends_on`, `output: "s1 prices"`).
- https://director.pilotprotocol.network (GET 200, 2026-07-10): guide URL is live (L51 URL literal); overlay usage `pilotctl send-message pilot-director --data '<plain English>'` (L33, L37 syntax); handoff semantics "for the parts your own agent should do" (L57).
- Live directory resolution via pilotctl: `pilot-director` resolves (node 243113) — agent exists (L5, L12, L35); `list-agents` resolves (0:0000.0002.BBE4) — exists for discovery (L70).
- web4/cmd/pilotctl/main.go: `handshake` cmd (L35; :932, :1781); `send-message --data --wait` (L37; :846–861, :4320–4333); `--wait` blocks for inbox reply, default 30s (L39; :855, :6341); replies saved to `~/.pilot/inbox/` (L40; :6349, :6482–6496).
- src/pages/docs/: tags.astro, service-agents.astro, app-store.astro exist — prev/next/inline links resolve (L9, L10, L27, L33, L70).
- src/pages/docs/service-agents.astro:50–85: canonical three-command pattern, keyword search + `/help` workflow this page contrasts with (L29 s2, L33).
- Page-internal: TOC anchors #what/#usage/#reply/#when match h2 ids (L18–21, L25, L31, L42, L65).
- src/data/apps.ts:71–97: `io.pilot.agentphone` app and `agentphone.place_call` method are real (referenced in the example handoff strings, L49–50 content).

Examples (not flagged): restaurant-booking task payload (L37); sample plan values `google-maps-places-new` / textQuery (L48 content) — illustrative, though the field names around them are flagged above.

## Resolutions (2026-07-10, loop iteration 35)
6 FALSE fixed (verified vs live /api/plan + site JS): reply has no top-level `calls`/`handoff`/`guide_url` — corrected to `guide` (markdown how-to) + `plan.{steps(depends_on),handoff,output}`; class enum is achievable/agent/not-yet (not "partially achievable"). 2 unverifiable accepted.

## Resolutions 2026-07-11 iter 66 -- reviewed and ACCEPTED
- Reviewed all FLAGGED UNVERIFIABLE rows: third-party/academic descriptions (arXiv/Nature/EIP/vendor, real and live sources), uncited industry framing, marketing hyperbole, or anonymous pull-quotes. None assert Pilot protocol behavior falsely; none present a Pilot-specific measured figure; no FALSE rows remain. ACCEPTED per the "flag what can't be validated" directive. Pricing/legal-commitment items surfaced to PROGRESS.md Needs user review.
