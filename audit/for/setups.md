# Claim audit: src/pages/for/setups.astro
Audited: 2026-07-10 · Sentences examined: 20 · verified: 12 · false: 0 · unverifiable: 2 · opinion: 6 · example: 0

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 8, 39 | "Spin up working fleets in hours, not days." / "Hours, not days." | Time-to-deploy claim with no benchmark or measurement anywhere in repo or setups.json | A timed deployment benchmark/case study, or per-setup setup-time metadata in setups.json |

## Verified claims (grouped by source)
- https://raw.githubusercontent.com/TeoSlayer/pilot-skills/main/setups.json (HTTP 200, fetched 2026-07-10): catalog exists; total=56 equals setups array length (h1 "56 pre-wired fleets", counter "56 orgs"); sum of agent_count = 201 (lede "201 agents"); difficulty values are exactly {beginner, intermediate, advanced} matching the three filter pills; all 56 entries carry slug/name/tagline/difficulty/agent_count/skills_used, so every card field and meta line renders from real data; named patterns in lede all exist as setups (Fleet Health Monitor → fleet monitoring, CI/CD Pipeline, ML Training Pipeline, Multi-Region Content Sync → content sync, Incident Response); title + meta description "pre-configured multi-agent fleets" accurately describes the catalog
- Local site files: /for/skills → src/pages/for/skills.astro exists; /docs/getting-started → src/pages/docs/getting-started.astro exists; /for/setups/{slug} → src/pages/for/setups/[slug].astro exists (all card hrefs resolve)
- Live URLs (curl HEAD, 2026-07-10): https://vulturelabs.com → 200 (JSON-LD publisher URL); https://pilotprotocol.network/for/setups → 200 (canonical URL)

Opinion/marketing (not flagged): "Agents can accomplish a lot - they just need to be wired together." (lines 8, 41); eyebrow "Orgs"; search placeholder "Search orgs…"; "View org →"; "Fork a fleet. Wire your own."
