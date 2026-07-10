# Claim audit: src/pages/blog/how-626-agents-autonomously-adopted-pilot.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 12 · false: 0 · unverifiable: 33 · opinion: 10 · example: 7

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
| --- | --- | --- | --- |
| 4 | "In January 2026 ... New agents were registering ... dozens per day ... By February, hundreds of agents had joined the network." | Historical registry-log narrative; no accessible log source | Published registry log export or dataset |
| 11 | "Pilot Protocol was published on ClawHub -- OpenClaw's skill marketplace -- as an installable networking skill" incl. SKILLS.md listing description | Third-party marketplace listing; not checkable with available tools | The live ClawHub listing URL |
| 15/28 | `clawhub install pilotprotocol` and "This downloads the SKILLS.md file into the agent's skill directory" | ClawHub CLI behavior claim, no source | ClawHub docs / the listing |
| 19 | "The first agents installed Pilot Protocol in mid-January 2026. Within 48 hours they had started daemons, registered..." | Uncited historical claim | Registry logs |
| 30-36 | Onboarding pattern details incl. real hostnames (data-analyzer-7 etc.) and quoted agent justification messages | Presented as observed data; no source | Dataset / research appendix |
| 52-57 | Stats table: avg connections 6.3; most connected 39 peers; mode 3; giant component 65.8%; clustering 47x; self-trust 64% | Network-analysis figures with no live or published source reachable from here | The referenced research paper data |
| 70 | "expected clustering ~0.01; actual clustering coefficient was 0.47 -- forty-seven times higher" | Same dataset, unverifiable | Research dataset |
| 76-86 | "Five distinct capability clusters emerged" + cluster tag lists | Same dataset | Research dataset |
| 92-96 | "64% of agents established trust with themselves" + self-verification behavior interpretation | Same dataset + behavioral inference | Research dataset |
| 102 | "the first documented case of autonomous AI agents independently adopting networking infrastructure..." | Priority/uniqueness claim, unfalsifiable here | Independent literature review |
| 121 | Meta description: "The experiment: hundreds of AI agents given Pilot Protocol. No instructions." | Same unverifiable narrative (also tension with body's "discovered organically" framing vs "given") | Dataset/publication |

## Verified claims (grouped by source)
- web4 cmd/pilotctl/main.go: pilotctl member-tags get exists (line ~1875, subcommands set/get); handshake with justification, trust commands exist; hostname/tag registration commands exist
- Pre-verified cheatsheet: openclaw/openclaw and TeoSlayer/pilot-skills repos exist; network has since grown (live stats 218,560 active nodes) — consistent with "grown significantly" callout
- Local site files: /docs/research page exists (src/pages/docs/research.astro); banner public/blog/banners/how-626-agents-autonomously-adopted-pilot.webp exists; CTA GitHub repo exists (pre-verified)
- Knowledge (network science): preferential attachment / heavy-tailed degree distributions in social networks, WWW, citation networks — standard literature; loopback-testing analogy is standard practice

## Resolutions (2026-07-11 iter 63) — softening pass
- L70 (clustering "0.47", expected "~0.01"): the on-site research paper (public/research/social-structures.pdf, verified in the sociology-of-machines audit) reports 0.373 (≈47× random). Corrected to 0.373 with expected ~0.008; kept the 47× multiplier. The rest of the stats table (626 agents, mode 3, mean 6.3, max 39, giant component 65.8%, self-trust 64%) matches the paper.
- Remaining unverifiable rows (onboarding narrative, ClawHub listing, firstness claim): ACCEPTED — sourced from the on-site social-structures.pdf / ClawHub; flagged and left as the case-study narrative.
Build: npm run build green (345 pages).
