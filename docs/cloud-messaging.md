# Pilot: shared message strategy

Updated 25 October 2026. Audience: people already using AI who want less coordination with friends and contacts. `/cloud-teaser`, `/cloud-landing` (Learn more), and `/pilot-film` now follow the same narrative. `/cloud` remains the original comparison page.

## Current narrative

1. **What would you do with 20% more time?** Begin with desire. Keep the complete hypothetical question visible around the number. It is not a measured share of life lost or a Pilot savings promise.
2. **“Quick question…”** Show coffee, an introduction, a group plan, and “What do you do?” together. The people are welcome; repeatedly handling the details is the problem.
3. **The last chore you’ll ever do.** The founder’s chosen campaign line follows the request pile. “One setup. Less back-and-forth.” defines its intended scope.
4. **Share your Pilot link.** Introduce Pilot and agents only now. The handle link gives someone a way to request a connection to your agent. You choose who connects. Both people sign in and connect an AI.
5. **Let the agents do the back-and-forth.** Show the inbound direction: Priya’s Dots reaches your Muse about coffee. Your agent returns a proposed time for your approval.
6. **Put your link everywhere.** The same handle appears in a bio, email signature and message. New AI. Same link. Your identity belongs to the same Pilot account across connected AI apps.
7. **Take your life back.** One emotional ending and one primary action: **Claim your handle**. Setup is explicit: claim a handle, connect your AI, share your link. The service is free and hosted for you.

The teaser presents seven scroll chapters. The film takes 26.917 seconds and uses the same ordering with drum-synced state changes. Learn more expands the mechanism with four inbound examples, compatible agents, permissions, setup, network/funding proof and FAQ. It does not return to an agent-first or dinner-only pitch.

## Learn more implementation

The header has no navigation and no play button. Its non-linked Pilot mark and signup action appear only when the product-reveal section enters view, keeping product branding out of the opening. The hero points into the request story. Signup links repeat “Claim your handle” in the reveal, closing and header, all to the Cloud app. The footer motion control remains available.

The examples are coffee, an introduction, a group plan and an informational question. They begin with the other person asking their AI, then show their agent contacting yours. Every outcome is illustrative. Introductions require checking with the people involved; proposed plans require approval; shared information depends on permissions. These examples neither send messages nor modify product data.

Muse, Grok Bot, OpenClaw, Hermes and Dots appear as recommended background agents. Other MCP-compatible chat apps are shown too. Background check-ins must be configured; a hosted Pilot node does not by itself run a user’s AI. “Both AIs connected” and the connection-acceptance step remain visible near the mechanism, rather than being hidden in FAQ.

The link-reveal example retains the AI-switch control, and a later distribution section shows the same handle in three placements. The social card is shared with the teaser and built with `node scripts/build-teaser-social.mjs`; it shows “Take your life back. One link to your agent.” with the existing reunion image. It does not turn the 20% question into an isolated statistical claim in link previews.

## Why this hierarchy

The [BLS time-use table](https://www.bls.gov/news.release/atus.t01.htm) measures household activities, not coordination requests. [McKinsey’s social-economy research](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy) estimates workweek email and information-search time, not 20% of life. Neither establishes the proposed percentage as a fact. The campaign therefore asks a question instead of claiming measured waste or savings.

[Calendly](https://calendly.com/) demonstrates the value of leading with a familiar coordination job. [Partiful](https://partiful.com/) shows a desirable social result and a visible sharing mechanism. These are observed design patterns, not causal conversion evidence or proof that Pilot has their account-free guest flow. [NN/g’s tagline guidance](https://www.nngroup.com/articles/tagline-blues-whats-the-site-about/) supports making the product’s purpose clear: the emotional opening must lead to the concrete handle and agent exchange. The founder deliberately chose to delay the product introduction; comprehension testing should assess that tradeoff.

The team’s remaining narratives stay out of the acquisition story: earnings via Moonlit belong to a separate intent; ecosystem expansion and nationwide business coverage require specific available use cases and verified claims. Investor and open-source proof follow the product demonstration. The site does not claim that network nodes are people, customers or endorsements.

## Scope

This is a marketing-page and film change, not the Cloud app’s invitation flow. The account-free “Arranged Thing” remains scoped in [cloud-invite-next.md](cloud-invite-next.md). A handle URL is still a profile/connection entry point; it is not guest chat. No account creation, automatic acceptance, calendar access or new business-agent coverage is implemented by this campaign.

## Product claims and their boundaries

| Claim | Basis checked | Copy decision |
|---|---|---|
| Cloud runs Pilot for the user | `hosted/control/README.md`, `hosted/node/README.md`: managed nodes and MCP access | Say hosted, no Pilot software to install, and no local server to maintain. Do not promise zero outages. |
| A handle provides a shareable entry point | `hosted/control/web/index.html`: `shareLink` builds `/@handle`; connection UI and circle definitions | Show the real URL format and acceptance step. Do not imply anyone with the link can freely message or access the owner’s data. |
| The same handle works across connected AI apps | Founder clarification; `hosted/control/store.go` stores the handle on the account, `proxy.go` provisions one node per account, and `oauth.go` maps distinct client grants to that account | Say “New AI. Same handle.” Explain connecting supported AI apps to the same Pilot account. This claim does not require promising automatic migration between unrelated Pilot accounts, arbitrary installations, or perpetual retention after account deletion. |
| Three relationship circles | Same UI: close friend, friend, acquaintance; circle guidance is passed to agents | Describe circles as relationship and sharing guidance. Do not turn prompt-level behavior into a universal security guarantee. |
| Messages and files enable coordination | `hosted/node/README.md`: connected-client tools; existing Cloud product examples | Demonstrate outcomes, with dependencies made clear. Calendar information, timely replies, and actions depend on the AI apps, available context, tools, and permissions. |
| Pilot remains hosted when a laptop closes | Managed-node architecture | This describes the Pilot node. It does not prove that every connected AI app runs autonomous background tasks or immediately processes every incoming message. |
| Moonlit offers paid research | [Moonlit](https://askmoonlit.com/) and its [setup guide](https://askmoonlit.com/setup), retrieved directly | Public setup connects an AI to Moonlit itself. Users review answers; accepted work, eligibility, and available studies matter. The public offer is for US adults. Do not say Pilot installation is required, income is guaranteed, or this is the only way to earn with an agent. |
| Business agents can be reached through Pilot | `hosted/control/biz.go` shows a business gateway; founder describes expansion plans | A gateway is evidence of a capability, not nationwide coverage or business endorsement. Publish scale and exclusivity claims only with current supporting evidence. |
| Approximately 219,000 recently active nodes | [Public registry stats](https://polo.pilotprotocol.network/api/public-stats), checked 25 October 2026: `active_nodes=218647`; the [public homepage](https://pilotprotocol.network/#numbers) defines this as daemons seen during the last 30 minutes | Display a rounded `~219k`, with “Pilot nodes seen in 30 minutes” and a dated snapshot. `219k+` would overstate that particular reading. This is network activity, not 219,000 endorsements, unique agents, people, or Cloud signups. The preview fetches a fresh snapshot when rendered/built, validates count and timestamp, and omits the count if the source fails. It does not substitute a fabricated fallback. |
| Adoption of the existing open-source project | Live homepage HTML scraped 25 October 2026, [company overview](https://pilotprotocol.network/about), and the public registry: `total_nodes=252501`, `active_nodes=218648` in the follow-up reading | Explain the open-source foundation in the proof section. Add the exact cumulative number as “addresses registered since launch.” This supports existing network use; the endpoint does not identify unique humans or separate Cloud from self-hosted installations. |
| Investor backing and $4.5M seed | Existing investor strip on the [homepage](https://pilotprotocol.network/), the [funding announcement](https://pilotprotocol.network/news/pilot-raises-4-5m-seed), and the company’s [LinkedIn announcement](https://www.linkedin.com/company/pilot-protocol) | Reuse the five backers already displayed publicly. Link the $4.5M announcement. This establishes reported funding; it is not a claim that investors endorse every feature or guarantee future service. |

The current main-page offer is free to start, consistent with the existing Cloud copy. Recheck pricing and supported connector plans when publishing. No customer quotes, adoption numbers, reliability percentages, or time-saving statistics were invented for this page. In particular, “219k+ other agents thought Pilot was great” would turn an activity metric into an unsupported testimonial; the implemented proof keeps the actual measure visible.

The direct homepage scrape confirmed all five investor names in image alt text and investor links: Version One (`versionone.vc`), Pioneer (`pioneerfund.vc`), Night Capital (`nightcapvc.com`), Todd & Rahul Capital (`toddandrahulcapital.com`), and Precursor (`precursorvc.com`). The warm preview reuses their existing dark-ink logo assets on its light background, with accessible brand names. Page typography remains Inter Tight. The compatibility area now has five recommended background-agent labels and six general chat-app labels. The OpenClaw and Hermes logos are reused from the Cloud app’s existing assets; Dots uses a cropped yellow mascot from the founder’s supplied screenshot of OpenAI’s “Introducing dots” page. Grok Bot and Grok are labeled separately to distinguish the agent and chat experiences. The dated funding page announces the $4.5M seed on 27 July 2026.

## Expected outcomes and validation

The expected direction is better comprehension and more qualified sign-ins from the selected audience. A number cannot be forecast from reference sites alone. A higher CTA click rate with fewer completed sign-ins would be a worse result.

1. **Comprehension first.** Show the first screen to a small set of people who already use AI. Ask them what Pilot does, where they would use it, and what a friend needs to do. Listen for “connects my existing AI to other agents,” rather than “another chatbot” or “a calendar app.” After the handle section, ask what happens to their identity and connections when they change AI apps. Ask for their own recent coordination chore before showing the examples. This is qualitative learning, not a conversion estimate.
2. **Primary conversion:** unique visitors who complete a new-account sign-in divided by unique eligible visitors assigned to the variant. Exclude staff, bots, existing signed-in users, and unrelated earning campaigns consistently. Set an attribution window before launch. Ordinary returning logins are not new acquisition conversions.
3. **Activation and lasting value:** measure invite completion (recipient finishes setup and the connection is accepted), then the first completed plan or other useful outcome involving that connection. A copied link, signup, or bare message count is not a completed plan. Track time to that outcome, pair survival at day 30, and progression from two people to three. Define the retention window and qualifying activity before launch; do not borrow folklore “aha” thresholds or use aggregate K as the primary measure. These outcome events are proposed, not implemented in this landing-page pass.
4. **Guardrails:** signup errors, connection failures, confusion about friend requirements, and quick abandonment after setup. Assess relationship-control comprehension as well as completion.
5. **Test one question at a time.** For a warm-versus-dark design experiment, use equivalent copy, offers, and flows. The current `/cloud` and `/cloud-landing` also differ in structure and messaging; comparing them estimates the effect of the whole experience, not color alone. A later copy experiment can hold the visual design constant.
6. **Set the experiment from baseline data.** Choose the minimum meaningful improvement, required sample, duration, and stopping rule before starting. Keep assignments stable. If traffic is too low for a useful test, prioritize interviews and observed activation sessions rather than declaring a winner from a few clicks.

### Measurement state

The preview retains existing `cta_click` tracking with `target=cloud_signup` and distinct header, hero, friend, and closing locations (the header retains the existing `cloud_landing_nav` tracking identifier). The Cloud app has a `sign_up` Google-tag event for new accounts in `hosted/control/web/index.html` when its tag is enabled. This work does **not** implement variant assignment, cross-site attribution, or a complete activation funnel. Those need verification and instrumentation before the proposed experiment can be trusted. Preserve the existing consent behavior; there is no need to record private messages or file contents to measure this funnel.

## Beyond this landing page

After a useful first exchange, recommend the next capability in context. A person coordinating dinner may benefit from an available business agent. Someone explicitly interested in paid research may choose Moonlit after seeing its requirements. Developers need protocol and ecosystem documentation. Each entry point should make a concrete promise to the person arriving there and then reveal the larger network through useful actions.

This strategy supersedes the message hierarchy in `cloud-landing-research.md`. The older brief contains third-party conversion figures; none are used here as an expected Pilot result.
