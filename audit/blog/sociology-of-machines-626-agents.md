# Claim audit: src/pages/blog/sociology-of-machines-626-agents.astro
Audited: 2026-07-10 · Sentences examined: 62 · verified: 37 · false: 3 · unverifiable: 7 · opinion: 12 · example: 3

## FLAGGED — FALSE
| Line | Sentence (quote) | Evidence it is false |
|---|---|---|
| 33 | "The clustering coefficient of 0.47 (47x random) is a direct measurement of triadic closure." | public/research/social-structures.pdf: avg clustering coefficient is **0.373** ("clustering of 0.373 is approximately 47× higher than random"; table: "Avg. clustering coefficient 0.373"). 47× is right; 0.47 is wrong. |
| 39 | "The agent network shows analogous layers at 3, 8, and 15 connections." | Paper reports mode k=3, mean 6.3, and "natural breaks near Dunbar boundaries" at the 5–15 and 15–50 ranges — no 3/8/15 layer structure appears anywhere in the paper. |
| 39 | "The scaling ratio (~3x between layers) matches Dunbar's predictions." | No scaling-ratio analysis in the paper; the paper explicitly cautions the "numerical coincidences are suggestive" and may not reflect a fundamental constraint. |

## FLAGGED — UNVERIFIABLE
| Line | Sentence | Why it can't be verified | What WOULD verify it |
|---|---|---|---|
| 11 | "The OpenClaw agent network is the first dataset where the same tools can be applied to autonomous artificial agents." | Sweeping priority claim ("first") — cannot rule out prior datasets | Literature survey citation |
| 25 | "More active agents appear earlier in tag-based search results, receive more trust requests…" | Ranking mechanism of tag search not documented in paper or source audited | Registry search-ranking code |
| 53 | "Dunbar estimates that a social tie weakens after 6 months without contact." | Specific 6-month figure uncited; not in the local paper | Citation to Dunbar's decay research |
| 80 | "The giant component will reach 90%+." | Future projection without citation (current: 65.8% per paper) | n/a — prediction |
| 83 | "These behavioral norms will spread through the network via imitation of successful agents." | Future projection; no mechanism for agent imitation demonstrated | Longitudinal follow-up study |
| 88 | "For the raw network data, see the dataset published alongside the paper." | No published dataset found — not in public/research/, not referenced in the PDF (word "dataset" absent) | A dataset file or DOI link |
| 92 | "The network has grown significantly since then." | No live count source for OpenClaw-agent subset growth | Live network stats broken down by agent type |

## Verified claims (grouped by source)
- public/research/social-structures.pdf (local): 626 agents; pervasive self-trust 64% (401/626 = 64.1%) — matches line 47; heavy-tailed degree distribution "follows an approximate power law in the tail, consistent with preferential attachment" — matches line 25; clustering 47× higher than random (multiplier only); giant component 65.8% (supports "lacks the scale" framing); Dunbar layers 5/15/50/150 cited in paper — matches line 37; agents "not programmed to form social structures," emerged from autonomous trust decisions — matches lines 11–12; "functional utility" / early-growth network framing consistent with paper's discussion; loopback/health-monitoring explanation of self-trust matches paper's Section 4.4 hypotheses.
- src/pages/docs/research.astro (link target exists): abstract matches "hundreds of agents," preferential attachment, 47× clustering, giant component; /docs/research links at lines 88 and 98 valid.
- Sociology literature (pre-cutoff knowledge): Merton's Matthew Effect ("rich get richer"); Granovetter's strength-of-weak-ties and triadic-closure work; Dunbar's social brain hypothesis with ~5/15/50/150 layers; citation networks / social media preferential attachment; power-law degree distributions as signature of preferential attachment.
- Local files: banner public/blog/banners/sociology-of-machines-626-agents.webp exists; canonicalPath matches filename.
- Opinion (not flagged): "embryonic society," "research opportunity," divergence commentary (binary trust, instant formation, perfect memory — accurate descriptions of the trust model per web4 source: trust is binary and persists until untrust), predictions framed as such (bridge nodes, hierarchies).

## Resolutions (2026-07-11 iter 51)
- L33 (clustering "0.47"): the paper reports 0.373 (≈47× random). Corrected the coefficient to 0.373, kept the 47× multiplier.
- L39 ("layers at 3, 8, and 15" + "~3x scaling ratio matches Dunbar"): the paper has no 3/8/15 layers or scaling-ratio analysis. Reworded to the paper's actual figures (mode 3, mean 6.3, natural breaks near the Dunbar 5-15/15-50 boundaries) and added the paper's own caution that the parallels are suggestive, not a demonstrated constraint.
Build: npm run build green (345 pages).
