# Claim audit: src/pages/blog/preferential-attachment-ai-networks-trust-graph.astro
Audited: 2026-07-10 · Sentences examined: 42 · verified: 13 · false: 0 · unverifiable: 23 · opinion: 4 · example: 2

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 4 | "The degree distribution of the OpenClaw trust graph follows a power law with exponential cutoff." | No dataset or measurement source anywhere in repos; live stats endpoint exposes no trust-graph data | Published dataset / methodology in /docs/research with raw data |
| 13-20 | Degree distribution table (counts 89/112/141/98/87/68/22/9, cumulative %) | No underlying data available; presented as real measurement | Raw trust-graph export |
| 23 | "The mode is 3 ... mean is 6.3 ... maximum is 39." | Derived from unverifiable dataset | Same |
| 25 | "the tail approximately follows P(k) ∝ k^-γ with γ ≈ 2.1 ... exponential cutoff at k ≈ 25" | No model-fitting artifacts anywhere | Published fit code/results |
| 40 | "The OpenClaw network's exponent (γ ≈ 2.1) is lower than the pure BA model predicts... connection probability appears to be proportional to degree plus some fitness factor" | Analysis of unverifiable data | Same |
| 42 | "fitness corresponds to an agent's behavioral track record: response speed, task completion reliability, and uptime" | Pilot registry does not track "task completion reliability"; no such metric found in rendezvous/web4 source | Source code implementing these metrics |
| 51 | "results are sorted by activity and reliability signals ... position bias" | No ranking-by-reliability logic found in registry/pilotctl source; member-tags get returns tags, not ranked search | Registry ranking code |
| 65 | "The 9 agents with degree 26-39 are the hubs... Removing them would fragment the giant component" | Unverifiable dataset + untested simulation claim | Published robustness analysis |
| 70-73 | Hub profile: hostname "multi-tool-orchestrator", task completion 97%, avg response 4.2s | Presented as real measurements of a real agent; no data source; protocol tracks no completion rate | Live agent record + metrics source |
| 78 | "The 8 other hub agents share similar characteristics... top 5%... fast response times" | Same — no data source | Same |
| 89-91 | Hub failure/compromise/bottleneck specifics ("39 peers lose a trusted partner", etc.) | Built on unverifiable degree-39 hub | Same |
| 102 | "The peripheral fraction will shrink from 34.2% to an estimated 20-25%." | 34.2% matches sibling post (internally consistent) but underlying data unverifiable; 20-25% is an uncited projection | Dataset + forecasting method |
| 104 | "estimated k_max = 80-120" (medium-term projection) | Future projection without citation | — |
| 106 | "This multi-scale structure is observed in every large-scale human social network" | Sweeping universal claim; "every" is uncited | Citation; literature says common, not universal |
| 108 | "For the complete methodology, model fitting procedures... see the research paper." | /docs/research page exists, but no methodology/model-fitting content was verifiable there for this dataset | Actual paper containing the fits |

## Verified claims (grouped by source)
- Established literature (Barabási & Albert, Science 1999; Bianconi-Barabási 2001; Albert/Jeong/Barabási 2000): BA model proposed 1999; model steps; γ = 3 for pure BA; fitness-model existence; scale-free networks robust to random failure, vulnerable to targeted hub removal.
- web4/cmd/pilotctl/main.go:7924: `pilotctl member-tags get --net <id>` syntax is real.
- Local site files: /docs/research (src/pages/docs/research.astro) and /docs/getting-started exist; banner public/blog/banners/preferential-attachment-ai-networks-trust-graph.webp exists.
- Definitions (self-contained): degree definition, encapsulated mechanism descriptions of preferential attachment.
